//demand calculation.
import { redis } from "../lib/redis";

const DEMAND_WINDOW_SECONDS = 60 * 60; // 1 hour

export async function recordBookingDemand(eventId: string, bookingId: string) {
  const key = `demand:event:${eventId}`;
  const now = Date.now();

  // Add booking timestamp
  await redis.zadd(key, now, bookingId);

  // Remove old bookings
  await redis.zremrangebyscore(
    key,
    0,
    now - DEMAND_WINDOW_SECONDS * 1000
  );

  // Optional: auto-expire key
  await redis.expire(key, DEMAND_WINDOW_SECONDS);
}

export async function getBookingRate(eventId: string): Promise<number> {
  const key = `demand:event:${eventId}`;
  const now = Date.now();

  const count = await redis.zcount(
    key,
    now - DEMAND_WINDOW_SECONDS * 1000,
    now
  );

  return Number(count);
}

// --- View Tracking for Hot Events ---

export async function recordView(eventId: string) {
  const key = `views:event:${eventId}`;
  const now = Date.now();
  const uniqueId = `view_${now}_${Math.random()}`; // Simple unique ID for the view event

  // Add view timestamp
  await redis.zadd(key, now, uniqueId);

  // Remove old views (keep only last hour)
  await redis.zremrangebyscore(
    key,
    0,
    now - DEMAND_WINDOW_SECONDS * 1000
  );

  await redis.expire(key, DEMAND_WINDOW_SECONDS);
}

export async function getViewRate(eventId: string): Promise<number> {
  const key = `views:event:${eventId}`;
  const now = Date.now();

  const count = await redis.zcount(
    key,
    now - DEMAND_WINDOW_SECONDS * 1000,
    now
  );

  return Number(count);
}
