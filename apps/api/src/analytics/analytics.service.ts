
import { db } from "../db";
import { events, orders, tickets, venues, users, sections, eventSeats } from "../db/schema";
import { eq, desc, sql, and, gt } from "drizzle-orm";
import { predictHotness } from "../ml/hotEventModel";
import { predictMultiplierByDemand } from "../ml/demandModel";
import { getBookingRate, getViewRate } from "../services/demand.service";
import { calculateDynamicPrice } from "../pricing/pricing.service";
import { seatService } from "../events/seats.service";
import { eventService } from "../events/events.service"; // Reuse existing services

export class AnalyticsService {
  
  /**
   * Generates intelligence on "Hot Events" using the ML model.
   */
  async getHotEventsStats() {
    // 1. Fetch upcoming events (using Join as relations might not be configured)
    const allEvents = await db
        .select({
            event: events,
            venueName: venues.name // distinct selection
        })
        .from(events)
        .innerJoin(venues, eq(events.venueId, venues.id))
        .where(gt(events.date, new Date()));

    const results = [];

    for (const { event, venueName } of allEvents) {
        // 2. Aggregate raw stats
        const bookingRate = await getBookingRate(event.id);
        const viewRate = await getViewRate(event.id);
        
        // 3. Get Fill Rate (Expensive, but okay for admin analytics)
        // Actually, let's use a faster count query if possible, or just accept the cost for now.
        // Since getSeatsBySection requires sectionId, let's just use raw DB count for speed
        
        const [totalSeatsResult] = await db
            .select({ count: sql<number>`count(*)` })
            .from(eventSeats)
            .where(eq(eventSeats.eventId, event.id));
            
        const [bookedSeatsResult] = await db
            .select({ count: sql<number>`count(*)` })
            .from(eventSeats)
            .where(and(eq(eventSeats.eventId, event.id), eq(eventSeats.status, 'BOOKED')));

        const totalCapacity = Number(totalSeatsResult?.count || 0);
        const bookedSeats = Number(bookedSeatsResult?.count || 0);

        // 4. ML Prediction
        const hotScore = predictHotness({
            bookingRate,
            viewRate,
            totalCapacity,
            bookedSeats
        });

        results.push({
            eventId: event.id,
            eventName: event.name,
            venueName: venueName,
            date: event.date,
            hotScore,
            bookingRate,
            viewRate,
            fillRate: totalCapacity > 0 ? (bookedSeats / totalCapacity) : 0,
            status: event.status
        });
    }

    // Sort by hotness descending
    return results.sort((a, b) => b.hotScore - a.hotScore);
  }

  /**
   * Analyzes how Dynamic Pricing is performing.
   */
  async getPricingHealthStats() {
      // 1. Get Active Events
      const activeEvents = await db
          .select()
          .from(events)
          .where(eq(events.status, 'PUBLISHED'))
          .limit(12);

      const results = [];

      for (const event of activeEvents) {
          // Get demand multiplier
          const bookingRate = await getBookingRate(event.id);
          const mlMultiplier = predictMultiplierByDemand(bookingRate);

          // Get stats for base price reference (using first section found)
          const sectionsList = await eventService.getSectionsByVenueId(event.venueId);
          const basePrice = sectionsList.length > 0 ? sectionsList[0].basePrice : 0;
          
          results.push({
              eventId: event.id,
              eventName: event.name,
              basePrice,
              currentMultiplier: mlMultiplier,
              bookingRateByHour: bookingRate, // Proxy for demand
              projectedRevenue: 0 // Placeholder for future complex calc
          });
      }

      return results;
  }

  async getSalesStats(startDate: Date, endDate: Date) {
        const sales = await db
            .select({
                date: sql<string>`TO_CHAR(${orders.createdAt}, 'YYYY-MM-DD')`,
                revenue: sql<number>`SUM(${orders.totalAmount})`,
                tickets: sql<number>`COUNT(${tickets.id})`
            })
            .from(orders)
            .leftJoin(tickets, eq(tickets.orderId, orders.id))
            .where(and(
                eq(orders.status, 'COMPLETED'),
                and(gt(orders.createdAt, startDate), sql`${orders.createdAt} <= ${endDate}`)
            ))
            .groupBy(sql`TO_CHAR(${orders.createdAt}, 'YYYY-MM-DD')`)
            .orderBy(sql`TO_CHAR(${orders.createdAt}, 'YYYY-MM-DD') ASC`);
            
        return sales.map(s => ({
            date: s.date,
            revenue: Number(s.revenue || 0),
            tickets: Number(s.tickets || 0)
        }));
  }
}

export const analyticsService = new AnalyticsService();
