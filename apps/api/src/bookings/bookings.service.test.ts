import { BookingService } from './bookings.service';
import { db } from '../db';
import { SEAT_LOCK_TTL_SECONDS } from '../lib/constants';

// 1. Basic Mock Setup (Hoisted)
// We just define the shape here. The actual behavior is defined in beforeEach.
jest.mock('../db', () => ({
  db: {
    transaction: jest.fn(),
    query: {
      orders: {
        findFirst: jest.fn(),
      },
    },
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

// Mock Environment
jest.mock('../config/env', () => ({
  env: {
    NODE_ENV: 'test',
    JWT_ACCESS_SECRET: 'test',
    JWT_REFRESH_SECRET: 'test',
    JWT_ACCESS_EXPIRY: '15m',
    JWT_REFRESH_EXPIRY: '7d',
    RAZORPAY_KEY_ID: 'test',
    RAZORPAY_KEY_SECRET: 'test',
    DATABASE_URL: 'postgres://test:test@localhost:5432/test',
    REDIS_URL: 'redis://localhost:6379',
    KAFKA_BROKER: 'localhost:9092',
    CLOUDINARY_CLOUD_NAME: 'test',
    CLOUDINARY_API_KEY: 'test',
    CLOUDINARY_API_SECRET: 'test',
  },
}));

// Mock Razorpay
jest.mock('../lib/razorpay', () => ({
  razorpay: {
    orders: {
      create: jest.fn(),
    },
  },
}));

describe('BookingService', () => {
  let service: BookingService;

  // 2. Define mockTx here so it is accessible to all tests
  const mockTx = {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    innerJoin: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    values: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    returning: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new BookingService();

    // 3. Connect the mock implementation dynamically
    // This runs AFTER the module is loaded, so no hoisting issues.
    (db.transaction as jest.Mock).mockImplementation((cb) => cb(mockTx));
  });

  describe('bookTickets', () => {
    const mockUserId = 'user-123';
    const mockEventId = 'event-123';
    const mockSeatIds = ['seat-1'];

    it('should throw error if no seats provided', async () => {
      await expect(service.bookTickets(mockUserId, mockEventId, []))
        .rejects
        .toThrow('No seats selected');
    });

    it('should fail if seat lock is expired', async () => {
      // 1. Simulate finding the seat, but the lock is OLD
      const expiredDate = new Date();
      expiredDate.setSeconds(expiredDate.getSeconds() - (SEAT_LOCK_TTL_SECONDS + 100));

      mockTx.where.mockResolvedValueOnce([
        {
          seatId: 'seat-1',
          status: 'LOCKED',
          updatedAt: expiredDate, // <--- EXPIRED
          lockedBy: mockUserId,
          price: 100,
          number: 'A1'
        }
      ]);

      await expect(service.bookTickets(mockUserId, mockEventId, mockSeatIds))
        .rejects
        .toThrow(/session expired/);
    });

    it('should fail if seat is locked by another user', async () => {
      mockTx.where.mockResolvedValueOnce([
        {
          seatId: 'seat-1',
          status: 'LOCKED',
          updatedAt: new Date(),
          lockedBy: 'OTHER_USER', // <--- WRONG USER
          price: 100,
          number: 'A1'
        }
      ]);

      await expect(service.bookTickets(mockUserId, mockEventId, mockSeatIds))
        .rejects
        .toThrow(/session expired or lost/);
    });

    it('should succeed when all conditions are met', async () => {
      // 1. Mock Seat Search (Valid)
      mockTx.where.mockResolvedValueOnce([
        {
          seatId: 'seat-1',
          status: 'LOCKED',
          updatedAt: new Date(), // Valid time
          lockedBy: mockUserId,  // Valid user
          price: 100,
          sectionName: 'VIP',
          row: 'A',
          number: '1'
        }
      ]);

      // 2. Mock Order Creation
      mockTx.returning.mockReturnValueOnce([{ id: 'order-1', status: 'PENDING' }]);

      // 3. Mock Seat Update (Success)
      mockTx.returning.mockReturnValueOnce([{ seatId: 'seat-1' }]);

      // 4. Mock Ticket Insertion
      mockTx.returning.mockReturnValueOnce([{ 
        id: 'ticket-1',
        orderId: 'order-1',
        eventId: mockEventId,
        seatId: 'seat-1',
        sectionName: 'VIP',
        row: 'A',
        number: '1',
        price: 100,
        qrCode: 'TICKET|order-1|seat-1'
      }]);

      const result = await service.bookTickets(mockUserId, mockEventId, mockSeatIds);

      expect(result).toHaveProperty('id', 'order-1');
      expect(mockTx.insert).toHaveBeenCalledTimes(2); // Order + Tickets
    });
  });
});