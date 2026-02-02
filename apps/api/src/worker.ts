import { seatService } from './events/seats.service';
import { logger } from './lib/logger';
import { CLEANUP_INTERVAL_MS } from './lib/constants';

/**
 * Dedicated Worker Process
 * Handles background tasks like cleaning up expired seat locks.
 * Separation of concerns: Allows API to scale independently of workers.
 */

let isRunning = false;

async function runCleanupLoop() {
  if (isRunning) return;
  isRunning = true;

  logger.info('👷 Worker: Starting Seat Cleanup Job...');

  setInterval(async () => {
    try {
      await seatService.cleanupExpiredLocks();
    } catch (error) {
      logger.error('👷 Worker: Cleanup failed', error);
    }
  }, CLEANUP_INTERVAL_MS);
}

// Start the worker
runCleanupLoop().catch((err) => {
  logger.error('Fatal Worker Error', err);
  process.exit(1);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  logger.info('👷 Worker: Shutting down...');
  process.exit(0);
});