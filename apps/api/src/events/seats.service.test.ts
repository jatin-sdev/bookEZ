import { SeatService } from './seats.service';
import { db } from '../db';
import { redis } from '../lib/redis';
import { sendEvent } from '../lib/kafka';
import { logger } from '../lib/logger';
import { SEAT_LOCK_TTL_SECONDS } from '../lib/constants';

// Mock database
jest.mock('../db', () => ({
  db: {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    leftJoin: jest.fn().mockReturnThis(),
    innerJoin: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    for: jest.fn(),
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    returning: jest.fn(),
    transaction: jest.fn(),
  },
}));

// Mock Redis
jest.mock('../lib/redis', () => ({
  redis: {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  },
}));

// Mock Kafka
jest.mock('../lib/kafka', () => ({
  sendEvent: jest.fn().mockResolvedValue(undefined),
}));

// Mock Logger
jest.mock('../lib/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock constants
jest.mock('../lib/constants', () => ({
  SEAT_LOCK_TTL_SECONDS: 300, // 5 minutes
}));

describe('SeatService', () => {
  let service: SeatService;

  beforeEach(() => {
    jest.clearAllMocks();
    (db.transaction as jest.Mock).mockReset(); // <--- FIX: Ensure no stale implementations
    service = new SeatService();
  });

  describe('lockSeat', () => {
    const eventId = 'event-123';
    const seatId = 'seat-456';
    const userId = 'user-789';

    it('should lock available seat for user', async () => {
      // Mock Redis: No existing lock
      (redis.get as jest.Mock).mockResolvedValue(null);

      // Mock DB transaction
      const mockTx = {
        select: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        for: jest.fn().mockResolvedValue([
          {
            status: 'AVAILABLE',
            updatedAt: new Date(),
            sectionId: 'section-1',
            row: 'A',
            number: '10',
            x: 100,
            y: 200,
          },
        ]),
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([{ status: 'LOCKED' }]),
      };

      (db.transaction as jest.Mock).mockImplementation(async (cb) => cb(mockTx));
      (redis.set as jest.Mock).mockResolvedValue('OK');

      const result = await service.lockSeat(eventId, seatId, userId);

      expect(result).toEqual({
        id: seatId,
        status: 'LOCKED',
        row: 'A',
        number: '10',
        x: 100,
        y: 200,
      });
      expect(redis.set).toHaveBeenCalledWith(
        `seat:lock:${eventId}:${seatId}`,
        userId,
        'EX',
        SEAT_LOCK_TTL_SECONDS
      );
      expect(sendEvent).toHaveBeenCalledWith('seat-events', 'SEAT_LOCKED', {
        eventId,
        seatId,
        userId,
        status: 'LOCKED',
        sectionId: 'section-1',
      });
    });

    it('should update seat status to LOCKED in database', async () => {
      (redis.get as jest.Mock).mockResolvedValue(null);

      const mockTx = {
        select: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        for: jest.fn().mockResolvedValue([
          {
            status: 'AVAILABLE',
            updatedAt: new Date(),
            sectionId: 'section-1',
            row: 'A',
            number: '1',
            x: 0,
            y: 0,
          },
        ]),
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([{ status: 'LOCKED' }]),
      };

      (db.transaction as jest.Mock).mockImplementation(async (cb) => cb(mockTx));

      await service.lockSeat(eventId, seatId, userId);

      expect(mockTx.set).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'LOCKED',
          userId,
        })
      );
    });

    it('should reject locking already locked seat by different user', async () => {
      const otherUserId = 'other-user-999';
      
      // Redis shows seat is locked by another user
      (redis.get as jest.Mock).mockResolvedValue(otherUserId);

      await expect(
        service.lockSeat(eventId, seatId, userId)
      ).rejects.toThrow('Seat is currently selected by another user');

      expect(db.transaction).not.toHaveBeenCalled();
    });

    it('should reject locking booked seat', async () => {
      (redis.get as jest.Mock).mockResolvedValue(null);

      const mockTx = {
        select: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        for: jest.fn().mockResolvedValue([
          {
            status: 'BOOKED', // Already booked
            updatedAt: new Date(),
            sectionId: 'section-1',
            row: 'A',
            number: '1',
            x: 0,
            y: 0,
          },
        ]),
      };

      (db.transaction as jest.Mock).mockImplementation(async (cb) => cb(mockTx));

      await expect(
        service.lockSeat(eventId, seatId, userId)
      ).rejects.toThrow('Seat is already booked');
    });

    it('should set Redis expiration based on TTL constant', async () => {
      (redis.get as jest.Mock).mockResolvedValue(null);

      const mockTx = {
        select: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        for: jest.fn().mockResolvedValue([
          {
            status: 'AVAILABLE',
            updatedAt: new Date(),
            sectionId: 'section-1',
            row: 'A',
            number: '1',
            x: 0,
            y: 0,
          },
        ]),
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([{ status: 'LOCKED' }]),
      };

      (db.transaction as jest.Mock).mockImplementation(async (cb) => cb(mockTx));

      await service.lockSeat(eventId, seatId, userId);

      expect(redis.set).toHaveBeenCalledWith(
        expect.any(String),
        userId,
        'EX',
        300 // SEAT_LOCK_TTL_SECONDS
      );
    });
  });

  describe('unlockSeat', () => {
    const eventId = 'event-123';
    const seatId = 'seat-456';
    const userId = 'user-789';

    it('should unlock seat locked by same user', async () => {
      // Redis confirms user holds the lock
      (redis.get as jest.Mock).mockResolvedValue(userId);

      const mockTx = {
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue(undefined),
      };

      (db.transaction as jest.Mock).mockImplementation(async (cb) => cb(mockTx));
      (redis.del as jest.Mock).mockResolvedValue(1);

      const result = await service.unlockSeat(eventId, seatId, userId);

      expect(result).toBe(true);
      expect(mockTx.set).toHaveBeenCalledWith({
        status: 'AVAILABLE',
        userId: null,
      });
      expect(redis.del).toHaveBeenCalledWith(`seat:lock:${eventId}:${seatId}`);
    });

    it('should update seat status to AVAILABLE', async () => {
      (redis.get as jest.Mock).mockResolvedValue(userId);

      const mockTx = {
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue(undefined),
      };

      (db.transaction as jest.Mock).mockImplementation(async (cb) => cb(mockTx));

      await service.unlockSeat(eventId, seatId, userId);

      expect(mockTx.set).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'AVAILABLE',
          userId: null,
        })
      );
    });

    it('should clear Redis lock', async () => {
      (redis.get as jest.Mock).mockResolvedValue(userId);

      const mockTx = {
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue(undefined),
      };

      (db.transaction as jest.Mock).mockImplementation(async (cb) => cb(mockTx));

      await service.unlockSeat(eventId, seatId, userId);

      expect(redis.del).toHaveBeenCalledWith(`seat:lock:${eventId}:${seatId}`);
    });

    it('should reject unlocking seat locked by different user', async () => {
      const otherUserId = 'other-user-999';
      
      (redis.get as jest.Mock).mockResolvedValue(otherUserId);

      await expect(
        service.unlockSeat(eventId, seatId, userId)
      ).rejects.toThrow('You do not hold the lock for this seat');

      expect(db.transaction).not.toHaveBeenCalled();
    });

    it('should emit SEAT_UNLOCKED event', async () => {
      (redis.get as jest.Mock).mockResolvedValue(userId);

      const mockTx = {
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue(undefined),
      };

      (db.transaction as jest.Mock).mockImplementation(async (cb) => cb(mockTx));

      await service.unlockSeat(eventId, seatId, userId);

      expect(sendEvent).toHaveBeenCalledWith('seat-events', 'SEAT_UNLOCKED', {
        eventId,
        seatId,
        userId,
        status: 'AVAILABLE',
      });
    });
  });

  describe('getSeatsBySection', () => {
    const eventId = 'event-123';
    const sectionId = 'section-456';

    it('should return seats with status for section', async () => {
      const mockSeats = [
        {
          id: 'seat-1',
          row: 'A',
          number: '1',
          x: 0,
          y: 0,
          status: 'AVAILABLE',
          updatedAt: new Date(),
        },
        {
          id: 'seat-2',
          row: 'A',
          number: '2',
          x: 50,
          y: 0,
          status: 'LOCKED',
          updatedAt: new Date(),
        },
      ];

      // Mock the chain: select() returns an object with from(), which returns an object with leftJoin(), etc.
      const mockChain = {
        from: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue(mockSeats),
      };
      (db.select as jest.Mock).mockReturnValue(mockChain);

      const result = await service.getSeatsBySection(eventId, sectionId);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: 'seat-1',
        row: 'A',
        number: '1',
        x: 0,
        y: 0,
        status: 'AVAILABLE',
      });
    });

    it('should treat expired locks as AVAILABLE', async () => {
      // Create an expired date (more than TTL seconds ago)
      const expiredDate = new Date();
      expiredDate.setSeconds(expiredDate.getSeconds() - (SEAT_LOCK_TTL_SECONDS + 100));

      const mockSeats = [
        {
          id: 'seat-1',
          row: 'A',
          number: '1',
          x: 0,
          y: 0,
          status: 'LOCKED',
          updatedAt: expiredDate, // Expired lock
        },
      ];

      const mockChain = {
        from: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue(mockSeats),
      };
      (db.select as jest.Mock).mockReturnValue(mockChain);

      const result = await service.getSeatsBySection(eventId, sectionId);

      // Should return as AVAILABLE, not LOCKED
      expect(result[0].status).toBe('AVAILABLE');
    });

    it('should default status to AVAILABLE when null', async () => {
      const mockSeats = [
        {
          id: 'seat-1',
          row: 'A',
          number: '1',
          x: 0,
          y: 0,
          status: null, // No status in eventSeats table
          updatedAt: null,
        },
      ];

      const mockChain = {
        from: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue(mockSeats),
      };
      (db.select as jest.Mock).mockReturnValue(mockChain);

      const result = await service.getSeatsBySection(eventId, sectionId);

      expect(result[0].status).toBe('AVAILABLE');
    });
  });

  describe('cleanupExpiredLocks', () => {
    it('should release expired seat locks', async () => {
      const expiredSeats = [
        { eventId: 'event-1', seatId: 'seat-1' },
        { eventId: 'event-1', seatId: 'seat-2' },
      ];

      const mockTx = {
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue(expiredSeats),
      };

      (db.transaction as jest.Mock).mockImplementation(async (cb) => cb(mockTx));

      await service.cleanupExpiredLocks();

      expect(mockTx.set).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'AVAILABLE',
          userId: null,
        })
      );
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('Released 2 expired seat locks')
      );
    });

    it('should emit events for each cleaned up seat', async () => {
      const expiredSeats = [
        { eventId: 'event-1', seatId: 'seat-1' },
        { eventId: 'event-1', seatId: 'seat-2' },
      ];

      const mockTx = {
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue(expiredSeats),
      };

      (db.transaction as jest.Mock).mockImplementation(async (cb) => cb(mockTx));

      await service.cleanupExpiredLocks();

      expect(sendEvent).toHaveBeenCalledTimes(2);
      expect(sendEvent).toHaveBeenCalledWith('seat-events', 'SEAT_UNLOCKED', {
        eventId: 'event-1',
        seatId: 'seat-1',
        status: 'AVAILABLE',
      });
    });

    it('should not log when no expired locks found', async () => {
      const mockTx = {
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([]), // No expired seats
      };

      (db.transaction as jest.Mock).mockImplementation(async (cb) => cb(mockTx));

      await service.cleanupExpiredLocks();

      expect(logger.info).not.toHaveBeenCalled();
    });
  });
});
