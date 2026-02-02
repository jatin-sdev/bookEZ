// Centralized configuration to prevent drift between services
export const SEAT_LOCK_TTL_SECONDS = 5 * 60; // 5 minutes (Lowered from 10m)
export const CLEANUP_INTERVAL_MS = 60 * 1000; // 1 minute