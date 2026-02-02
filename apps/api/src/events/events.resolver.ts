import { eventService } from './events.service';
import { seatService } from './seats.service';
import { GraphQLError } from 'graphql';
import { calculateDynamicPrice } from '../pricing/pricing.service';

// --- Security Helpers ---
const requireAuth = (context: any) => {
  if (!context.user) {
    throw new GraphQLError('Unauthorized: Please log in.', {
      extensions: { code: 'UNAUTHENTICATED' }
    });
  }
};

const requireAdmin = (context: any) => {
  requireAuth(context);
  if (context.user.role !== 'ADMIN') {
    throw new GraphQLError('Forbidden: Admin access required.', {
      extensions: { code: 'FORBIDDEN' }
    });
  }
};

// --- Helpers ---
// Resolves the 'venue' field on the Event object
const withVenue = (event: any) => ({
  ...event,
  venue: () => eventService.getVenueById(event.venueId),
});

export const eventResolvers = {
  // --- Resolvers ---
  Venue: {
    sections: (parent: any) => eventService.getSectionsByVenueId(parent.id),
  },

  // --- Queries ---
  Query: {
    events: async (args: any, context: any) => {
      const events = await eventService.getEvents(args);
      const result = events.map(event => ({
        ...withVenue(event),
        date: event.date instanceof Date ? event.date.toISOString() : event.date
      }));
      return result;
    },
    event: async (args: any) => {
      const { id } = args;
      const event = await eventService.getEventById(id);
      if (!event) return null;

      // Ensure date is formatted as ISO string for consistent frontend parsing
      return {
        ...withVenue(event),
        date: event.date instanceof Date ? event.date.toISOString() : event.date
      };
    },
    venues: async () => {
      const result = await eventService.getVenues();
      return result;
    },
    venue: (args: any) => {
      const { id } = args;
      return eventService.getVenueById(id);
    },

    // sectionSeats: async (args: any) => {
    //   const { eventId, sectionId } = args;
    //   return await seatService.getSeatsBySection(eventId, sectionId);
    // },

    // sectionSeats: async (args: any) => {
    //   const { eventId, sectionId } = args;

    //   const seats = await seatService.getSeatsBySection(eventId, sectionId);

    //   const event = await eventService.getEventById(eventId);

    //   const totalSeats = seats.length;
    //   const bookedSeats = seats.filter(s => s.status === 'BOOKED').length;

    //   return seats.map(seat => ({
    //     ...seat,
    //     price: calculateDynamicPrice({
    //       basePrice: event.basePrice,   // or section.basePrice if you switch later
    //       seatType: seat.type,          // YOU ALREADY HAVE THIS
    //       totalSeats,
    //       bookedSeats,
    //       eventDate: event.date,
    //     }),
    //   }));
    // },

    sectionSeats: async (args: any) => {
      const { eventId, sectionId } = args;

      // 1. Load event
      const event = await eventService.getEventById(eventId);
      if (!event) throw new Error('Event not found');

      // 2. Load section (THIS is pricing source)
      const section = await eventService.getSectionById(sectionId);
      if (!section) throw new Error('Section not found');

      // 3. Load seats
      const seats = await seatService.getSeatsBySection(eventId, sectionId);

      // 4. Demand data
      const totalSeats = seats.length;
      const bookedSeats = seats.filter(s => s.status === 'BOOKED').length;

      // 5. Return seats WITH dynamic price
      return seats.map(seat => ({
        ...seat,
        price: calculateDynamicPrice({
          basePrice: section.basePrice,
          seatType:
            section.type === 'GENERAL_ADMISSION'
              ? 'PREMIUM'
              : 'ORDINARY',
          totalSeats,
          bookedSeats,
          eventDate: event.date,
        }),
      }));
    },


  },

  // --- Mutations ---
  Mutation: {
    // --- Venues ---
    createVenue: async (args: any, context: any) => {
      const { input } = args;
      const { user } = context;
      requireAdmin({ user });
      return await eventService.createVenue(input);
    },

    updateVenue: async (args: any, context: any) => {
      const { id, input } = args;
      const { user } = context;
      requireAdmin({ user });
      return await eventService.updateVenue(id, input);
    },

    deleteVenue: async (args: any, context: any) => {
      const { id } = args;
      const { user } = context;
      requireAdmin({ user });
      return await eventService.deleteVenue(id);
    },

    addSection: async (args: any, context: any) => {
      const { venueId, input } = args;
      const { user } = context;
      requireAdmin({ user });
      return await eventService.addSection(venueId, input);
    },

    updateSection: async (args: any, context: any) => {
      const { id, input } = args;
      const { user } = context;
      requireAdmin({ user });
      return await eventService.updateSection(id, input);
    },

    deleteSection: async (args: any, context: any) => {
      const { id } = args;
      const { user } = context;
      requireAdmin({ user });
      return await eventService.deleteSection(id);
    },

    updateSeatPositions: async (args: any, context: any) => {
      const { updates } = args;
      const { user } = context;
      requireAdmin({ user });
      return await eventService.updateSeatPositions(updates);
    },

    // --- Events ---
    createEvent: async (args: any, context: any) => {
      const { input } = args;
      const { user } = context;
      requireAdmin({ user });
      const event = await eventService.createEvent(input);
      return withVenue(event);
    },

    updateEvent: async (args: any, context: any) => {
      const { id, input } = args;
      const { user } = context;
      requireAdmin({ user });
      const event = await eventService.updateEvent(id, input);
      return withVenue(event);
    },

    deleteEvent: async (args: any, context: any) => {
      const { id } = args;
      const { user } = context;
      requireAdmin({ user });
      return await eventService.deleteEvent(id);
    },

    publishEvent: async (args: any, context: any) => {
      const { id } = args;
      const { user } = context;
      requireAdmin({ user });
      const event = await eventService.publishEvent(id);
      return withVenue(event);
    },

    // --- Locking ---
    lockSeat: async (args: any, context: any) => {
      const { eventId, seatId } = args;
      const { user } = context;
      requireAuth({ user });
      return await seatService.lockSeat(eventId, seatId, user.id);
    },

    unlockSeat: async (args: any, context: any) => {
      const { eventId, seatId } = args;
      const { user } = context;
      requireAuth({ user });
      return await seatService.unlockSeat(eventId, seatId, user.id);
    },
  }
};