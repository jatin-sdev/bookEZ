import { eq, desc, sql, and } from 'drizzle-orm';
import { db } from '../db';
import { events, venues, sections, seats, eventSeats } from '../db/schema';
import { logger } from '../lib/logger';

// Input type for flexible section creation
interface AddSectionInput {
  name: string;
  capacity: number;
  basePrice: number;
  type?: 'ASSIGNED' | 'GENERAL_ADMISSION';
  // Strategy A: Grid Generation
  rows?: number;
  seatsPerRow?: number;
  // Strategy B: Custom Shape (e.g., circular tables, irregular rows)
  customSeats?: {
    row?: string;
    number: string;
    x?: number;
    y?: number;
  }[];
}

export class EventService {

  // --- Sections ---
  async getSectionById(sectionId: string) {
    const result = await db
      .select()
      .from(sections)
      .where(eq(sections.id, sectionId));

    return result[0];
  }
  // --- Venues ---
  async getVenues() {
    try {
      const result = await db.select().from(venues).orderBy(desc(venues.createdAt));
      return result || [];
    } catch (error) {
      logger.error('Error fetching venues:', error);
      return [];
    }
  }

  async getVenueById(id: string) {
    const result = await db.select().from(venues).where(eq(venues.id, id));
    return result[0];
  }

  async createVenue(data: { name: string; location: string; capacity: number }) {
    const [venue] = await db.insert(venues).values(data).returning();
    logger.info(`Venue created: ${venue.name}`);
    return venue;
  }

  async updateVenue(id: string, data: Partial<{ name: string; location: string; capacity: number }>) {
    const [updated] = await db.update(venues)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(venues.id, id))
      .returning();
    if (!updated) throw new Error(`Venue ${id} not found`);
    return updated;
  }

  async getSectionsByVenueId(venueId: string) {
    const result = await db.select().from(sections).where(eq(sections.venueId, venueId));
    return result || [];
  }

  async deleteVenue(id: string) {
    return await db.transaction(async (tx) => {
      // 1. Delete Events associated with this venue
      // We need to clean up event partitions first
      const venueEvents = await tx.select().from(events).where(eq(events.venueId, id));

      for (const event of venueEvents) {
        const partitionName = `event_seats_${event.id.replace(/-/g, '_')}`;
        await tx.execute(sql.raw(`DROP TABLE IF EXISTS "${partitionName}"`));
      }

      await tx.delete(events).where(eq(events.venueId, id));

      // 2. Delete Seats and Sections (Manual cascade if DB Constraints missing)
      // Find all sections
      const venueSections = await tx.select().from(sections).where(eq(sections.venueId, id));
      const sectionIds = venueSections.map(s => s.id);

      if (sectionIds.length > 0) {
        // Delete seats in these sections
        // Note: Drizzle's 'inArray' would differ, using raw sql or loop for safety if unsure of utils import
        // Assuming strict types, let's just loop or delete by section_id manually if needed
        // Simpler: Delete * from seats where section_id IN (...)
        // But for safety and Drizzle syntax without importing 'inArray':
        for (const sId of sectionIds) {
          await tx.delete(seats).where(eq(seats.sectionId, sId));
        }

        // Delete sections
        await tx.delete(sections).where(eq(sections.venueId, id));
      }

      // 3. Delete Venue
      const [deleted] = await tx.delete(venues).where(eq(venues.id, id)).returning();
      return !!deleted;
    });
  }

  // --- Sections & Seats (Flexible Layouts) ---
  async addSection(venueId: string, data: AddSectionInput) {
    return await db.transaction(async (tx) => {
      // 1. Calculate Capacity if not explicitly provided
      let finalCapacity = data.capacity;
      if (!finalCapacity && data.rows && data.seatsPerRow) {
        finalCapacity = data.rows * data.seatsPerRow;
      }

      // 1. Create Section
      const [section] = await tx.insert(sections).values({
        venueId,
        name: data.name,
        capacity: finalCapacity || 0, // Fallback to 0 if still undefined (should be validated upstream)
        basePrice: data.basePrice,
        type: data.type || 'ASSIGNED',
      }).returning();

      const seatInserts: any[] = [];

      // STRATEGY 1: General Admission (Virtual Seats)
      // Generates 1..N seats without coordinates.
      if (data.type === 'GENERAL_ADMISSION') {
        for (let i = 1; i <= data.capacity; i++) {
          seatInserts.push({
            sectionId: section.id,
            row: null, // GA has no row
            number: i.toString(),
            x: null,
            y: null,
          });
        }
        logger.info(`Generated ${data.capacity} GA seats for ${section.name}`);
      }

      // STRATEGY 2: Custom Layout (Provided by Frontend/Designer)
      // Used for non-grid shapes.
      else if (data.customSeats && data.customSeats.length > 0) {
        data.customSeats.forEach((s) => {
          seatInserts.push({
            sectionId: section.id,
            row: s.row || null,
            number: s.number,
            x: s.x || 0,
            y: s.y || 0
          });
        });
        logger.info(`Generated ${seatInserts.length} custom seats for ${section.name}`);
      }

      // STRATEGY 3: Standard Grid (Legacy Support)
      // Used for rapid prototyping of rectangular venues.
      else if (data.rows && data.seatsPerRow) {
        for (let r = 0; r < data.rows; r++) {
          const rowLabel = String.fromCharCode(65 + r);
          for (let s = 1; s <= data.seatsPerRow; s++) {
            seatInserts.push({
              sectionId: section.id,
              row: rowLabel,
              number: s.toString(),
              x: s * 40,
              y: r * 40,
            });
          }
        }
        logger.info(`Generated ${seatInserts.length} grid seats for ${section.name}`);
      }

      // Batch Insert
      if (seatInserts.length > 0) {
        // Chunk inserts if necessary (Postgres limit is ~65k params)
        // Drizzle usually handles this, but for massive venues consider splitting.
        await tx.insert(seats).values(seatInserts);
      } else if (data.type === 'ASSIGNED') {
        logger.warn(`Created Assigned section '${section.name}' with 0 seats. Setup incomplete.`);
      }

      return section;
    });
  }

  async updateSection(sectionId: string, data: Partial<{ name: string; basePrice: number; capacity: number }>) {
    const [updated] = await db.update(sections)
      .set(data)
      .where(eq(sections.id, sectionId))
      .returning();

    if (!updated) throw new Error(`Section ${sectionId} not found`);
    logger.info(`Section updated: ${updated.name}`);
    return updated;
  }

  async deleteSection(sectionId: string) {
    return await db.transaction(async (tx) => {
      // 1. Delete all seats in this section
      await tx.delete(seats).where(eq(seats.sectionId, sectionId));

      // 2. Delete the section itself
      const [deleted] = await tx.delete(sections).where(eq(sections.id, sectionId)).returning();

      if (!deleted) throw new Error(`Section ${sectionId} not found`);
      logger.info(`Section deleted: ${deleted.name} and all its seats`);
      return true;
    });
  }

  async updateSeatPositions(updates: { seatId: string; x: number; y: number }[]) {
    if (updates.length === 0) return true;

    await db.transaction(async (tx) => {
      for (const update of updates) {
        await tx
          .update(seats)
          .set({ x: update.x, y: update.y })
          .where(eq(seats.id, update.seatId));
      }
    });

    logger.info(`Updated positions for ${updates.length} seats.`);
    return true;
  }

  // --- Events CRUD ---
  // --- Events CRUD ---
  async getEvents(filters?: { minPrice?: number; maxPrice?: number; venueId?: string; startDate?: string; endDate?: string }) {
    const { minPrice, maxPrice, venueId, startDate, endDate } = filters || {};
    logger.info(`🔍 [getEvents] Filters received: ${JSON.stringify(filters)}`);

    // Start with base query
    // Note: To filter by price, we need to check if ANY section matches the price range.
    // Drizzle doesn't support complex EXISTS subqueries easily in the builder API yet without raw SQL or 'inArray'.
    // A clean way is to build the WHERE clause dynamically.

    const conditions = [];

    if (venueId) {
      conditions.push(eq(events.venueId, venueId));
    }

    if (startDate) {
      // User expects "Events ON this date"
      // Range: [StartDate 00:00, StartDate + 1 Day 00:00)
      const start = new Date(startDate);
      const end = new Date(startDate);
      end.setDate(end.getDate() + 1);

      conditions.push(sql`${events.date} >= ${start.toISOString()} AND ${events.date} < ${end.toISOString()}`);
    } else {
       // Default: Show upcoming events (future dates) if no filter
       // conditions.push(sql`${events.date} >= NOW()`);
       // Commented out default behavior to allow seeing past events if explicitly desired or empty filter means "All"
    }

    if (endDate) {
      // Explicit End Date range (if ever used)
      conditions.push(sql`${events.date} <= ${new Date(endDate).toISOString()}`);
    }

    // Filter by Price (via Sections)
    if (minPrice !== undefined || maxPrice !== undefined) {
      // We only want events that have at least one section within range.
      // "sections" table has "venueId", but it DOES NOT have "eventId" directly?
      // WAIT. The schema in events.service.ts createSection uses 'venueId'. 
      // Does a section belong to an Event or a Venue?
      // looking at createSection: `venueId, name, ...`
      // But wait, seats are specific to an event in 'eventSeats'.
      // However, 'sections' contains basePrice.
      // It seems 'sections' are VENUE configuration.
      // So an Event at Venue X uses Venue X's sections.
      // So we filter events where the Venue has sections in that price range.
      // This is implicit: Event -> Venue -> Section.

      const priceConditions = [];
      if (minPrice !== undefined) priceConditions.push(sql`s.base_price >= ${minPrice}`);
      if (maxPrice !== undefined) priceConditions.push(sql`s.base_price <= ${maxPrice}`);

      // subquery: select venue_id from sections s where ...
      const subquery = sql`(
          SELECT s.venue_id FROM sections s 
          WHERE ${sql.join(priceConditions, sql` AND `)}
       )`;

      // Using Drizzle's 'inArray' equivalent for subquery is tricky, using raw sql helpers
      // events.venueId IN (...)
      conditions.push(sql`${events.venueId} IN ${subquery}`);
    }

    return await db
      .select()
      .from(events)
      .where(and(...conditions))
      .orderBy(desc(events.date));
  }

  async getEventById(id: string) {
    const result = await db.select().from(events).where(eq(events.id, id));
    return result[0];
  }

  async createEvent(data: { name: string; description?: string; venueId: string; date: string; imageUrl?: string }) {
    const [event] = await db.insert(events).values({
      ...data,
      date: new Date(data.date),
      status: 'DRAFT',
    }).returning();
    logger.info(`Event created: ${event.name}`);
    return event;
  }

  async updateEvent(id: string, data: Partial<{ name: string; description: string; date: string; imageUrl: string; status: any }>) {
    const updateData: any = { ...data };
    if (data.date) updateData.date = new Date(data.date);

    const [updated] = await db.update(events)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(events.id, id))
      .returning();

    if (!updated) throw new Error(`Event ${id} not found`);
    return updated;
  }

  async deleteEvent(id: string) {
    return await db.transaction(async (tx) => {
      // 1. Delete associated Tickets
      // Note: We need to import 'tickets' and 'orders' schema
      const { tickets, orders } = await import('../db/schema');

      await tx.delete(tickets).where(eq(tickets.eventId, id));

      // 2. Delete associated Orders
      await tx.delete(orders).where(eq(orders.eventId, id));

      const partitionName = `event_seats_${id.replace(/-/g, '_')}`;
      await tx.execute(sql.raw(`DROP TABLE IF EXISTS "${partitionName}"`));
      logger.info(`Dropped partition: ${partitionName}`);

      const [deleted] = await tx.delete(events).where(eq(events.id, id)).returning();
      return !!deleted;
    });
  }

  async publishEvent(id: string) {
    return await db.transaction(async (tx) => {
      const [event] = await tx.select().from(events).where(eq(events.id, id));
      if (!event) throw new Error("Event not found");

      const partitionName = `event_seats_${id.replace(/-/g, '_')}`;

      await tx.execute(sql.raw(`
        CREATE TABLE IF NOT EXISTS "${partitionName}" 
        PARTITION OF "event_seats" 
        FOR VALUES IN ('${id}')
      `));

      await tx.execute(sql`
        INSERT INTO "event_seats" ("event_id", "seat_id", "section_id", "status")
        SELECT ${id}::uuid, s.id, s.section_id, 'AVAILABLE'
        FROM "seats" s
        JOIN "sections" sec ON s.section_id = sec.id
        WHERE sec.venue_id = ${event.venueId}
        ON CONFLICT DO NOTHING
      `);

      const [publishedEvent] = await tx.update(events)
        .set({ status: 'PUBLISHED' })
        .where(eq(events.id, id))
        .returning();

      logger.info(`Event ${id} published and inventory partitioned.`);
      return publishedEvent;
    });
  }
}

export const eventService = new EventService();