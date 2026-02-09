import { eq, inArray, and, sql, lt } from 'drizzle-orm';
import { db } from '../db';
import { orders, tickets, eventSeats, seats, sections, events } from '../db/schema';
import { logger } from '../lib/logger';
import { GraphQLError } from 'graphql';
import { SEAT_LOCK_TTL_SECONDS } from '../lib/constants';
import { sendEvent } from '../lib/kafka';
import crypto from 'crypto';
import { razorpay } from '../lib/razorpay';
import { env } from '../config/env';
import { predictMultiplierByDemand } from "../ml/demandModel";
import { calculateDynamicPrice } from "../pricing/pricing.service";
import {
  recordBookingDemand,
  getBookingRate
} from "../services/demand.service";




export class BookingService {
  private isLockExpired(updatedAt: Date | null): boolean {
    if (!updatedAt) return true;
    const now = new Date();
    const diffSeconds = (now.getTime() - updatedAt.getTime()) / 1000;
    return diffSeconds > SEAT_LOCK_TTL_SECONDS;
  }

  /**
   * [PHASE 4 NEW METHOD]
   * Finds orders that have been PENDING for > 15 minutes and cancels them.
   * This releases the seats back to the 'AVAILABLE' pool.
   */


  async cleanupExpiredOrders() {
    const TIMEOUT_MINUTES = 15;
    const expirationThreshold = new Date(Date.now() - TIMEOUT_MINUTES * 60 * 1000);

    const expiredOrders = await db
      .select({ id: orders.id, userId: orders.userId })
      .from(orders)
      .where(and(
        eq(orders.status, 'PENDING'),
        lt(orders.createdAt, expirationThreshold)
      ));

    if (expiredOrders.length === 0) return 0;

    logger.info(`🧹 Found ${expiredOrders.length} expired pending orders.`);

    let releasedCount = 0;

    for (const order of expiredOrders) {
      try {
        // We reuse the existing cancel logic to ensure consistency
        // (This releases seats and updates order status to CANCELLED)
        // Since this is a system action, we might need to bypass the user check 
        // or mock the user ID. Ideally, refactor cancelBooking to allow system override.
        // For now, we will manually execute the cleanup logic here to avoid permission issues.

        await db.transaction(async (tx) => {
          // 1. Mark Order Cancelled
          await tx.update(orders)
            .set({ status: 'CANCELLED' })
            .where(eq(orders.id, order.id));

          // 2. Release Seats
          // Get seats associated with this order's tickets? 
          // Wait, tickets are generated during 'bookTickets'.
          // So we can join tickets table.

          const orderTickets = await tx.select().from(tickets).where(eq(tickets.orderId, order.id));
          const seatIds = orderTickets.map(t => t.seatId);

          if (seatIds.length > 0) {
            await tx.update(eventSeats)
              .set({ status: 'AVAILABLE', userId: null })
              .where(inArray(eventSeats.seatId, seatIds));
          }
        });

        releasedCount++;
        logger.info(`   - Cancelled Order ${order.id}`);

      } catch (err) {
        logger.error(`   - Failed to cleanup order ${order.id}`, err);
      }
    }

    return releasedCount;
  }

  /**
   * Completes a booking transaction with strict concurrency controls.
   */
  async bookTickets(userId: string, eventId: string, seatIds: string[], idempotencyKey?: string) {
    if (!seatIds.length) {
      throw new GraphQLError('No seats selected for booking.', { extensions: { code: 'BAD_USER_INPUT' } });
    }

    // 1. Idempotency Check
    if (idempotencyKey) {
      const existingOrder = await db.query.orders.findFirst({
        where: eq(orders.idempotencyKey, idempotencyKey),
      });

      if (existingOrder) {
        if (existingOrder.userId !== userId) {
          throw new GraphQLError('Invalid idempotency key.', { extensions: { code: 'FORBIDDEN' } });
        }
        return existingOrder;
      }
    }

    const bookingResult = await db.transaction(async (tx) => {
      // 2. Initial Validation (Read Phase)
      const seatItems = await tx
        .select({
          seatId: eventSeats.seatId,
          status: eventSeats.status,
          updatedAt: eventSeats.updatedAt,
          lockedBy: eventSeats.userId,
          price: sections.basePrice,
          sectionName: sections.name,
          row: seats.row,
          number: seats.number,
        })
        .from(eventSeats)
        .innerJoin(seats, eq(eventSeats.seatId, seats.id))
        .innerJoin(sections, eq(seats.sectionId, sections.id))
        .where(and(eq(eventSeats.eventId, eventId), inArray(eventSeats.seatId, seatIds)));

      if (seatItems.length !== seatIds.length) {
        throw new GraphQLError('One or more selected seats are invalid.', { extensions: { code: 'BAD_USER_INPUT' } });
      }

      // Check locks BEFORE the update
      for (const item of seatItems) {
        const isExpired = this.isLockExpired(item.updatedAt);
        if (item.status !== 'LOCKED' || item.lockedBy !== userId || isExpired) {
          throw new GraphQLError(`Seat ${item.number} session expired or lost.`, { extensions: { code: 'SEAT_NOT_LOCKED' } });
        }
      }

      // // 3. Payment Simulation removed
      // const totalAmount = seatItems.reduce((sum, item) => sum + item.price, 0);

      // 3. Dynamic Pricing (AI-based)

      // --- FINAL PRICING (SINGLE SOURCE OF TRUTH) ---

      // Demand info
      const bookingRate = await getBookingRate(eventId);
      const totalSeats = seatItems.length;
      const bookedSeats = await this.getTicketsSoldByEventId(eventId);

      // Time factor
      const event = await tx.query.events.findFirst({
        where: eq(events.id, eventId),
      });

      const hoursToEvent =
        (event!.date.getTime() - Date.now()) / (1000 * 60 * 60);

      // Rule-based base prices
      const rulePrices = seatItems.map(item =>
        calculateDynamicPrice({
          basePrice: item.price, // section.basePrice
          seatType: item.sectionName.toLowerCase().includes("vip")
            ? "PREMIUM"
            : "ORDINARY",
          totalSeats,
          bookedSeats,
          eventDate: event!.date,
        })
      );

      // TensorFlow multiplier (small influence)
      const mlMultiplier = predictMultiplierByDemand(bookingRate);

      // Clamp ML output (VERY IMPORTANT)
      const safeMultiplier = Math.min(Math.max(mlMultiplier, 0.9), 1.3);

      // Final seat prices
      const finalPrices = rulePrices.map(p =>
        Math.round(p * safeMultiplier)
      );

      // Final order total (INR)
      const finalTotalAmount = finalPrices.reduce((a, b) => a + b, 0);

      logger.info(
        `💰 FINAL PRICING | Base: ${rulePrices}, ML: ${safeMultiplier}, Total: ${finalTotalAmount}`
      );

      // Apply safety rules
      // const finalTotalAmount = applyPricingRules({
      //   basePrice: baseTotalAmount,
      //   predictedPrice: predictedTotal,
      // });

      // logger.info(
      //   `💰 Dynamic Pricing | Base: ${baseTotalAmount}, Demand: ${bookingRate}, Final: ${finalTotalAmount}`
      // );

      // 4. Create Order
      const [newOrder] = await tx.insert(orders).values({
        userId,
        eventId,
        totalAmount: finalTotalAmount,
        status: 'PENDING',
        paymentIntentId: null,
        idempotencyKey: idempotencyKey || null,
      }).returning();



      // 5. Atomic Inventory Update (Write Phase - The Critical Fix)
      // This "Guard Clause" ensures we only book if the seat is STILL locked by US.
      // CHANGE: We now set status to 'RESERVED' (pending payment), not 'BOOKED' yet.
      const updatedSeats = await tx
        .update(eventSeats)
        .set({ status: 'RESERVED', updatedAt: new Date() })
        .where(
          and(
            eq(eventSeats.eventId, eventId),
            inArray(eventSeats.seatId, seatIds),
            // STRICT GUARDS:
            eq(eventSeats.status, 'LOCKED'),
            eq(eventSeats.userId, userId)
          )
        )
        .returning();

      // If we didn't update exactly as many seats as requested, a race condition occurred.
      if (updatedSeats.length !== seatIds.length) {
        throw new GraphQLError(
          'Booking Failed: One or more seats were lost during processing.',
          { extensions: { code: 'CONCURRENCY_CONFLICT' } }
        );
      }

      // 6. Generate Tickets
      const ticketValues = seatItems.map((item, index) => ({
        orderId: newOrder.id,
        eventId,
        seatId: item.seatId,
        sectionName: item.sectionName,
        row: item.row,
        number: item.number,
        price: finalPrices[index], // final prices
        qrCode: `TICKET|${newOrder.id}|${item.seatId}`,
      }));

      const insertedTickets = await tx.insert(tickets).values(ticketValues).returning();

      // logger.info(`Order ${newOrder.id} created with ${insertedTickets.length} tickets.`);
      return { ...newOrder, tickets: insertedTickets };
    });
    // Record demand (fire-and-forget)
    void recordBookingDemand(eventId, bookingResult.id);

    // 7. Event Sourcing (Fire-and-forget)
    // We do this AFTER the transaction commits to ensures we don't send events for rolled-back transactions.

    // a) Seat Update Event (Critical for Realtime Service)
    void sendEvent('seat-events', 'SEATS_BOOKED', {
      eventId,
      seatIds,
      status: 'RESERVED',
      triggeredBy: userId
    });

    // b) Order Created Event (For Analytics)
    void sendEvent('orders', 'ORDER_CREATED', {
      orderId: bookingResult.id,
      userId,
      amount: bookingResult.totalAmount,
      currency: 'USD',
      timestamp: new Date().toISOString()
    });

    return bookingResult;
  }

  /**
   * Retrieves a single order by ID, ensuring the requesting user owns it.
   */
  async getOrderById(orderId: string, userId: string) {
    const order = await db.query.orders.findFirst({
      where: and(eq(orders.id, orderId), eq(orders.userId, userId)),
    });

    if (!order) {
      throw new GraphQLError('Order not found', { extensions: { code: 'NOT_FOUND' } });
    }

    return order;
  }

  /**
   * Retrieves all orders for a specific user.
   * Always returns an array (empty if no orders found) to satisfy GraphQL non-nullable field requirement.
   */
  async getUserOrders(userId: string) {
    // Inner join with events to ensure we only return orders for valid, existing events
    // This effectively hides "corrupted" orders pointing to deleted events.
    const result = await db
      .select({
        id: orders.id,
        userId: orders.userId,
        eventId: orders.eventId,
        totalAmount: orders.totalAmount,
        status: orders.status,
        paymentIntentId: orders.paymentIntentId,
        idempotencyKey: orders.idempotencyKey,
        createdAt: orders.createdAt,
      })
      .from(orders)
      .innerJoin(events, eq(orders.eventId, events.id))
      .where(eq(orders.userId, userId))
      .orderBy(sql`${orders.createdAt} DESC`);

    return result || [];
  }

  /**
   * Helper to fetch tickets for a specific order.
   * (Restored as it is likely used by GraphQL resolvers)
   */
  async getTicketsByOrderId(orderId: string) {
    return await db
      .select()
      .from(tickets)
      .where(eq(tickets.orderId, orderId));
  }

  /**
   * Cancels a booking and releases the associated seats back to the inventory.
   */
  async cancelBooking(userId: string, orderId: string) {
    let eventId: string | null = null;
    let seatIds: string[] = [];

    await db.transaction(async (tx) => {
      // 1. Find the order
      const order = await tx.query.orders.findFirst({
        where: and(eq(orders.id, orderId), eq(orders.userId, userId)),
      });

      if (!order) {
        throw new GraphQLError('Order not found or access denied', { extensions: { code: 'NOT_FOUND' } });
      }

      if (order.status === 'CANCELLED') {
        throw new GraphQLError('Order is already cancelled', { extensions: { code: 'BAD_USER_INPUT' } });
      }
      
      eventId = order.eventId;

      // 2. Get tickets for this order
      const orderTickets = await tx
        .select()
        .from(tickets)
        .where(eq(tickets.orderId, orderId));

      // 3. Update Order Status
      await tx
        .update(orders)
        .set({ status: 'CANCELLED' })
        .where(eq(orders.id, orderId));

      // 4. Free the Seats (Change status back to AVAILABLE)
      // We get the seat IDs from the tickets associated with this order
      seatIds = orderTickets.map((t) => t.seatId);

      if (seatIds.length > 0) {
        await tx
          .update(eventSeats)
          .set({ status: 'AVAILABLE', userId: null }) // Release the user claim
          .where(
            and(
              eq(eventSeats.eventId, order.eventId),
              inArray(eventSeats.seatId, seatIds)
            )
          );
      }

      // 5. (Optional) In a real app, trigger a Stripe Refund here
      logger.info(`💰 Refunding ${order.totalAmount} to user ${userId}`);

      return true;
    });

    // 6. Emit Seat Release Event (Real-time update)
    if (eventId && seatIds.length > 0) {
        logger.info(`📢 Emitting SEAT_RELEASE for ${seatIds.length} seats in event ${eventId}`);
        
        void sendEvent('seat-events', 'SEATS_BOOKED', {
            eventId,
            seatIds,
            status: 'AVAILABLE',
            triggeredBy: userId
        }).catch(err => logger.error("Failed to emit SEAT_RELEASE event", err));
    } else {
        logger.warn(`⚠️ Cancelled order ${orderId} but could not emit event: Missing eventId or seatIds`);
    }

    return true;
  }

  /**
   * Aggregates system-wide stats for the admin dashboard.
   */
  async getAdminStats() {
    // Calculate Total Revenue (Sum of COMPLETED orders)
    // Note: Drizzle's `sum` helper returns a string, cast to number
    const [revenueResult] = await db
      .select({
        value: sql<number>`cast(sum(${orders.totalAmount}) as int)`
      })
      .from(orders)
      .where(eq(orders.status, 'COMPLETED'));

    // Calculate Total Tickets Sold (Valid only)
    const [ticketsResult] = await db
      .select({
        count: sql<number>`cast(count(${tickets.id}) as int)`
      })
      .from(tickets)
      .innerJoin(orders, eq(tickets.orderId, orders.id))
      .where(eq(orders.status, 'COMPLETED'));

    return {
      totalRevenue: revenueResult?.value || 0,
      totalTicketsSold: ticketsResult?.count || 0,
    };
  }

  /**
   * Counts the number of tickets sold for a specific event.
   */
  async getTicketsSoldByEventId(eventId: string) {
    const [result] = await db
      .select({
        count: sql<number>`cast(count(${tickets.id}) as int)`
      })
      .from(tickets)
      .innerJoin(orders, eq(tickets.orderId, orders.id))
      .where(and(
        eq(tickets.eventId, eventId),
        eq(orders.status, 'COMPLETED')
      ));

    return result?.count || 0;
  }

  /**
   * Generates a Razorpay Order ID for a specific Booking.
   * This links the external payment system to our internal Order.
   */
  async createRazorpayOrder(orderId: string, userId: string) {
    // 1. Fetch Order & Validate Ownership
    const order = await db.query.orders.findFirst({
      where: and(eq(orders.id, orderId), eq(orders.userId, userId)),
    });

    if (!order) {
      throw new GraphQLError('Order not found', { extensions: { code: 'NOT_FOUND' } });
    }

    if (order.status === 'COMPLETED') {
      throw new GraphQLError('Order is already paid', { extensions: { code: 'BAD_REQUEST' } });
    }

    // 2. Create Razorpay Order
    try {
      const paymentOrder = await razorpay.orders.create({
        amount: order.totalAmount,
        currency: 'INR',
        receipt: order.id,
        notes: {
          userId: userId,
          eventId: order.eventId
        }
      });


      return {
        id: paymentOrder.id,
        amount: Number(paymentOrder.amount),
        currency: paymentOrder.currency,
        keyId: env.RAZORPAY_KEY_ID
      };
    } catch (error) {
      logger.error('Razorpay Order Creation Failed:', error);
      throw new GraphQLError('Failed to initiate payment provider', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
    }
  }

  /**
   * Verifies the cryptographic signature returned by the frontend.
   * If valid, marks the order as COMPLETED.
   */
  async verifyRazorpayPayment(
    orderId: string,
    userId: string,
    razorpayOrderId: string,
    razorpayPaymentId: string,
    signature: string
  ) {
    // 1. Verify Signature (HMAC SHA256)
    const body = razorpayOrderId + "|" + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== signature) {
      logger.warn(`Invalid Payment Signature for Order ${orderId}`);
      throw new GraphQLError('Payment verification failed', { extensions: { code: 'UNAUTHENTICATED' } });
    }

    // 2. Update Order Status & Seat Status (Atomic)
    const updatedOrder = await db.transaction(async (tx) => {
      const [order] = await tx.update(orders)
        .set({
          status: 'COMPLETED',
          paymentIntentId: razorpayPaymentId
        })
        .where(and(eq(orders.id, orderId), eq(orders.userId, userId)))
        .returning();

      if (!order) {
        throw new GraphQLError('Order could not be confirmed', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
      }

      // Transition Seats from RESERVED -> BOOKED
      const orderTickets = await tx.select().from(tickets).where(eq(tickets.orderId, orderId));
      const seatIds = orderTickets.map(t => t.seatId);

      if (seatIds.length > 0) {
        await tx.update(eventSeats)
          .set({ status: 'BOOKED', updatedAt: new Date() })
          .where(
            and(
              eq(eventSeats.eventId, order.eventId),
              inArray(eventSeats.seatId, seatIds),
              eq(eventSeats.status, 'RESERVED') // Ensure strict transition
            )
          );
      }

      return order;
    });

    logger.info(`✅ Payment successful for Order ${orderId}`);

    // 3. Emit Payment Success Event
    void sendEvent('payments', 'PAYMENT_SUCCESS', {
      orderId,
      userId,
      amount: updatedOrder.totalAmount,
      providerId: razorpayPaymentId
    });

    // 4. Emit Seat Finalized Event
    const orderTickets = await db.select().from(tickets).where(eq(tickets.orderId, orderId));
    void sendEvent('seat-events', 'SEATS_BOOKED', {
      eventId: updatedOrder.eventId,
      seatIds: orderTickets.map(t => t.seatId),
      status: 'BOOKED',
      triggeredBy: userId
    });

    return true;
  }
}

export const bookingService = new BookingService();