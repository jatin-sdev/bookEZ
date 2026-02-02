import { bookingService } from './bookings.service';
import { eventService } from '../events/events.service'; // Import EventService
import { GraphQLError } from 'graphql';

// --- Security Helpers ---
const requireAuth = (context: any) => {
  // Check both context.user (standard) and context itself (if nested)
  const user = context.user || context;
  if (!user || !user.id) {
    throw new GraphQLError('Unauthorized: You must be logged in to perform this action.', {
      extensions: { code: 'UNAUTHENTICATED' },
    });
  }
  return user.id;
};

export const bookingResolvers = {
  Query: {
    myOrders: async (_args: any, context: any) => {
      // Correct: 1st arg is args (unused), 2nd is context
      const userId = requireAuth(context);
      return await bookingService.getUserOrders(userId);
    },

    order: async (args: any, context: any) => {
      const { id } = args;
      const userId = requireAuth(context);
      return await bookingService.getOrderById(id, userId);
    },

    adminDashboardStats: async (_args: any, context: any) => {
      // Check for ADMIN role
      const user = context.user;
      if (!user || user.role !== 'ADMIN') {
        throw new GraphQLError('Forbidden: Admin access required.', {
          extensions: { code: 'FORBIDDEN' }
        });
      }
      return await bookingService.getAdminStats();
    },
  },

  Mutation: {
    // FIX APPLIED HERE 👇
    bookTickets: async (args: any, context: any) => {
      // 1. Extract Data from First Argument (Args)
      const { eventId, seatIds, idempotencyKey } = args;
      
      // 2. Extract User from Second Argument (Context)
      const userId = requireAuth(context);
      
      try {
        return await bookingService.bookTickets(userId, eventId, seatIds, idempotencyKey);
      } catch (error: any) {
        if (error instanceof GraphQLError) throw error;
        console.error('Booking failed:', error);
        throw new GraphQLError('Failed to process booking.', {
          extensions: { code: 'INTERNAL_SERVER_ERROR', originalError: error.message },
        });
      }
    },

    cancelBooking: async (args: any, context: any) => {
      const { orderId } = args;
      const userId = requireAuth(context);

      try {
        return await bookingService.cancelBooking(userId, orderId);
      } catch (error: any) {
        if (error instanceof GraphQLError) throw error;
        console.error('Cancellation failed:', error);
        throw new GraphQLError(error.message || 'Failed to cancel booking', {
          extensions: { code: 'INTERNAL_SERVER_ERROR' },
        });
      }
    },

    createPaymentOrder: async (args: any, context: any) => {
      const { orderId } = args;
      const userId = requireAuth(context);

      try {
        return await bookingService.createRazorpayOrder(orderId, userId);
      } catch (error: any) {
        if (error instanceof GraphQLError) throw error;
        console.error('Payment order creation failed:', error);
        throw new GraphQLError('Failed to create payment order', {
          extensions: { code: 'INTERNAL_SERVER_ERROR' },
        });
      }
    },

    confirmPayment: async (args: any, context: any) => {
      const { orderId, razorpayOrderId, razorpayPaymentId, signature } = args;
      const userId = requireAuth(context);

      try {
        return await bookingService.verifyRazorpayPayment(orderId, userId, razorpayOrderId, razorpayPaymentId, signature);
      } catch (error: any) {
        if (error instanceof GraphQLError) throw error;
        console.error('Payment verification failed:', error);
        throw new GraphQLError('Failed to verify payment', {
          extensions: { code: 'INTERNAL_SERVER_ERROR' },
        });
      }
    },
  },

  Order: {
    tickets: async (parent: any) => {
      if (parent.tickets && parent.tickets.length > 0) return parent.tickets;
      return await bookingService.getTicketsByOrderId(parent.id);
    },
    event: async (parent: any) => {
      // Debug log
      // console.log(`[GraphQL] Resolving event for order ${parent.id}, eventId: ${parent.eventId}`);

      let event = parent.event; 
      if (!event) {
         event = await eventService.getEventById(parent.eventId);
      }
      
      if (!event) {
        console.error(`[GraphQL] Event not found for order ${parent.id} (eventId: ${parent.eventId})`);
        return null;
      }

      // Enrich with Venue and Format Date
      return {
        ...event,
        // Ensure venue field is resolvable
        venue: async () => {
             const v = await eventService.getVenueById(event.venueId);
             // console.log(`[GraphQL] Resolved venue for event ${event.id}:`, v);
             return v;
        },
        // Ensure date is string for GraphQL
        date: event.date instanceof Date ? event.date.toISOString() : event.date
      };
    }
  },

  // Extended Resolver for Event type (to add ticketsSold from Bookings domain)
  Event: {
    ticketsSold: async (parent: any) => {
      // Use parent.id (Event ID) to fetch ticket count
      return await bookingService.getTicketsSoldByEventId(parent.id);
    }
  }
};