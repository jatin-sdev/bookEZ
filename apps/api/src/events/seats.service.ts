import { eq, sql, and, lt } from 'drizzle-orm';
import { db } from '../db';
import { eventSeats, seats } from '../db/schema';
import { redis } from '../lib/redis';
import { sendEvent } from '../lib/kafka';
import { logger } from '../lib/logger';
import { SEAT_LOCK_TTL_SECONDS } from '../lib/constants';

export class SeatService {
  /**
   * Helper to check if a lock timestamp is expired
   */
  private isLockExpired(updatedAt: Date | null): boolean {
    if (!updatedAt) return false;
    const now = new Date();
    const diffSeconds = (now.getTime() - updatedAt.getTime()) / 1000;
    return diffSeconds > SEAT_LOCK_TTL_SECONDS;
  }

  /**
   * Batch release of expired locks.
   * This is now idempotent and safe to run from the dedicated worker.
   */
  /**
   * Batch release of expired locks.
   * This is now idempotent and safe to run from the dedicated worker.
   */
  async cleanupExpiredLocks(eventId?: string) {
    const expirationThreshold = new Date(Date.now() - SEAT_LOCK_TTL_SECONDS * 1000);
    
    // Build partial queue conditions safely
    const conditions = [
        eq(eventSeats.status, 'LOCKED'),
        lt(eventSeats.updatedAt, expirationThreshold)
    ];

    if (eventId) {
        conditions.push(eq(eventSeats.eventId, eventId));
    }

    await db.transaction(async (tx) => {
        // Atomic update to prevent race conditions during cleanup
        const expiredSeats = await tx
            .update(eventSeats)
            .set({ 
                status: 'AVAILABLE', 
                userId: null,
                updatedAt: new Date()
            })
            .where(and(...conditions))
            .returning({ 
                eventId: eventSeats.eventId, 
                seatId: eventSeats.seatId 
            });

        if (expiredSeats.length > 0) {
            logger.info(`🧹 Cleanup: Released ${expiredSeats.length} expired seat locks.`);
            
             for (const seat of expiredSeats) {
                // Fire and forget event emission
                sendEvent('seat-events', 'SEAT_UNLOCKED', {
                    eventId: seat.eventId,
                    seatId: seat.seatId,
                    status: 'AVAILABLE'
                }).catch(err => logger.error('Failed to emit cleanup event', err));
             }
        }
    });
  }

  /**
   * Fetch seats with "Lazy Expiration" check.
   */
  async getSeatsBySection(eventId: string, sectionId: string) {
    // Lazy Cleanup: Ensure we don't return stale locks
    await this.cleanupExpiredLocks(eventId);

    const results = await db
      .select({
        id: seats.id,
        row: seats.row,
        number: seats.number,
        x: seats.x,
        y: seats.y,
        status: eventSeats.status,
        updatedAt: eventSeats.updatedAt,
        lockedBy: eventSeats.userId
      })
      .from(seats)
      .leftJoin(eventSeats, and(eq(eventSeats.seatId, seats.id), eq(eventSeats.eventId, eventId)))
      .where(eq(seats.sectionId, sectionId));

    return results.map((seat) => {
      let status = seat.status || 'AVAILABLE';
      let lockedBy = seat.lockedBy;

      // If DB says LOCKED but it's old, treat as AVAILABLE for the UI
      if (status === 'LOCKED' && this.isLockExpired(seat.updatedAt)) {
        status = 'AVAILABLE';
        lockedBy = null;
      }
      return {
        id: seat.id,
        row: seat.row,
        number: seat.number,
        x: seat.x,
        y: seat.y,
        status,
        lockedBy
      };
    });
  }

  /**
   * Locks a seat with ACID guarantees and Row-Level Locking.
   */
  async lockSeat(eventId: string, seatId: string, userId: string) {
    const lockKey = `seat:lock:${eventId}:${seatId}`;

    // 1. Redis Cache Fast Fail (Optimization)
    const existingLock = await redis.get(lockKey);
    if (existingLock && existingLock !== userId) {
      throw new Error('Seat is currently selected by another user.');
    }

    // 2. DB Transaction with Row-Level Locking (Safety)
    const { updatedStatus, physicalDetails } = await db.transaction(async (tx) => {
      // 'FOR UPDATE' locks this specific row. No other transaction (including cleanup)
      // can modify this row until this transaction commits.
      const [record] = await tx
        .select({
            status: eventSeats.status,
            updatedAt: eventSeats.updatedAt,
            lockedBy: eventSeats.userId, // Fetch current lock owner
            sectionId: eventSeats.sectionId,
            row: seats.row,
            number: seats.number,
            x: seats.x,
            y: seats.y
        })
        .from(eventSeats)
        .innerJoin(seats, eq(eventSeats.seatId, seats.id))
        .where(and(eq(eventSeats.eventId, eventId), eq(eventSeats.seatId, seatId)))
        .for('update'); 

      if (!record) {
         // [SELF-HEALING] Row missing in event_seats?
         // This happens if the seat was added to venue AFTER event publish,
         // or if publish failed to copy this specific seat.
         // We attempt to verify validity and lazy-create the inventory row.
         
         // 1. Fetch Physical Seat & Event details to verify ownership
         // Need to join up to venue to confirm event.venueId === seat.section.venueId
         // Raw SQL or query builder:
         const result = await tx.execute(sql`
           SELECT s.id, s.row, s.number, s.x, s.y, sec.id as section_id
           FROM "seats" s
           JOIN "sections" sec ON s.section_id = sec.id
           JOIN "events" e ON e.venue_id = sec.venue_id
           WHERE s.id = ${seatId} AND e.id = ${eventId}
           LIMIT 1
         `);
         
         const validSeat = result.rows[0];
         
         if (!validSeat) {
            throw new Error('Seat not available for this event (Invalid ID or Venue Mismatch)');
         }
         
         // 2. Lazy Insert into event_seats
         // We assume the partition table exists (created by publishEvent).
         // If partition is missing, this INSERT will fail (which is correct behavior, explicit publish needed).
         const [inserted] = await tx.insert(eventSeats).values({
            eventId: eventId,
            seatId: seatId,
            sectionId: validSeat.section_id as string,
            userId: userId,
            status: 'LOCKED',
            updatedAt: new Date()
         }).returning();

         // 3. Return the new state
         // Explicitly construct return object since 'record' was null
         return {
            updatedStatus: 'LOCKED',
            physicalDetails: {
                 status: 'LOCKED',
                 updatedAt: new Date(),
                 sectionId: validSeat.section_id as string,
                 row: validSeat.row as string | null,
                 number: validSeat.number as string,
                 x: validSeat.x as number,
                 y: validSeat.y as number
            }
         };
      }
      
      if (record.status === 'BOOKED' || record.status === 'RESERVED') {
        throw new Error('Seat is already booked');
      }

      // Logic: Handle Stale Locks inside the DB Lock
      if (record.status === 'LOCKED') {
        const isStale = this.isLockExpired(record.updatedAt);
        
        // STRICT DB CHECK: If locked and not stale, ensure WE own it.
        // We do NOT rely on Redis here, DB is source of truth.
        if (!isStale && record.lockedBy !== userId) {
             throw new Error('Seat is locked by another user');
        }
      }

      // 3. Update Status
      const [updated] = await tx
        .update(eventSeats)
        .set({ status: 'LOCKED', userId, updatedAt: new Date() })
        .where(and(eq(eventSeats.eventId, eventId), eq(eventSeats.seatId, seatId)))
        .returning({ status: eventSeats.status });

      // 4. Update Redis (Optimization / UI fast path)
      await redis.set(lockKey, userId, 'EX', SEAT_LOCK_TTL_SECONDS);

      return { 
        updatedStatus: updated.status,
        physicalDetails: record 
      };
    });

    // 5. Emit Event
    await sendEvent('seat-events', 'SEAT_LOCKED', {
      eventId,
      seatId,
      userId,
      status: 'LOCKED',
      sectionId: physicalDetails.sectionId
    });

    return { 
      id: seatId, 
      status: updatedStatus,
      row: physicalDetails.row,
      number: physicalDetails.number,
      x: physicalDetails.x,
      y: physicalDetails.y
    };
  }

  async unlockSeat(eventId: string, seatId: string, userId: string) {
    const lockKey = `seat:lock:${eventId}:${seatId}`;
    const holder = await redis.get(lockKey);

    if (holder && holder !== userId) {
      throw new Error('You do not hold the lock for this seat');
    }

    await db.transaction(async (tx) => {
      await tx
        .update(eventSeats)
        .set({ status: 'AVAILABLE', userId: null })
        .where(and(
            eq(eventSeats.eventId, eventId), 
            eq(eventSeats.seatId, seatId),
            eq(eventSeats.userId, userId) // Ensure we only unlock if we still own it
        ));
      
      await redis.del(lockKey);
    });

    await sendEvent('seat-events', 'SEAT_UNLOCKED', {
      eventId,
      seatId,
      userId,
      status: 'AVAILABLE'
    });

    return true;
  }
}

export const seatService = new SeatService();