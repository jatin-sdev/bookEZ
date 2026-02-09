
import { AnalyticsService } from '../analytics.service';
import { db } from '../../db';
import * as demandService from '../../services/demand.service';
import * as hotEventModel from '../../ml/hotEventModel';

// Mock dependencies
jest.mock('../../db');
jest.mock('../../services/demand.service');
jest.mock('../../ml/hotEventModel');

describe('AnalyticsService', () => {
  let service: AnalyticsService;

  beforeEach(() => {
    service = new AnalyticsService();
    jest.clearAllMocks();
  });

  describe('getHotEventsStats', () => {
    it('should fetch events, calculate scores, and sort by hotness', async () => {
      // 1. Mock DB Response
      const mockEvents = [
        { 
            event: { id: 'e1', name: 'Event 1', venueId: 'v1', date: new Date(), status: 'PUBLISHED' }, 
            venueName: 'Venue 1' 
        },
        { 
            event: { id: 'e2', name: 'Event 2', venueId: 'v2', date: new Date(), status: 'PUBLISHED' }, 
            venueName: 'Venue 2' 
        }
      ];

      // Chain mocks for db.select().from().innerJoin().where()
      const mockWhere = jest.fn().mockResolvedValue(mockEvents);
      const mockInnerJoin = jest.fn().mockReturnValue({ where: mockWhere });
      const mockFrom = jest.fn().mockReturnValue({ innerJoin: mockInnerJoin });
      (db.select as jest.Mock).mockReturnValue({ from: mockFrom });

      // Mock DB counts (fill rate)
      // First call for total seats, second for booked seats. repeated for each event.
      (db.select as jest.Mock).mockImplementation((args) => {
         // This is a bit tricky with chained mocks, simplified approach:
         // We reuse the same chain logic or just mock the values if possible
         // But since the service calls db.select inside the loop, we need robust mocks.
         // ...
         // Alternative: Inspect the actual calls.
         return {
             from: jest.fn().mockReturnValue({
                 where: jest.fn().mockReturnValue({
                     and: jest.fn().mockResolvedValue([{ count: 100 }]), // capacity
                 })
                 .mockResolvedValueOnce([{ count: 100 }]) // e1 total
                 .mockResolvedValueOnce([{ count: 50 }])  // e1 booked
                 .mockResolvedValueOnce([{ count: 200 }]) // e2 total
                 .mockResolvedValueOnce([{ count: 10 }])  // e2 booked
             })
         };
      });
      // The above approach is messy. Let's rely on standard jest mocking of the module functions if they were separated.
      // Since db is imported, we have to mock the chain.
      
      // Let's refine the DB mock for the loop queries:
      const mockQueryBuilder = {
          from: jest.fn().mockReturnThis(),
          innerJoin: jest.fn().mockReturnThis(),
          where: jest.fn().mockImplementation(() => {
              // We can't easily differentiate calls here without complex logic
              // SO we will just return a resolved value that works for "list events" 
              // and "count seats"
              return Promise.resolve([{ count: 50 }]); 
          })
      };
      
      // We need to distinguish the initial event fetch vs the seat counts
      // Simplest way: Mock getBookingRate/ViewRate/PredictHotness to verify flow
      
      (demandService.getBookingRate as jest.Mock).mockResolvedValue(10);
      (demandService.getViewRate as jest.Mock).mockResolvedValue(20);
      
      (hotEventModel.predictHotness as jest.Mock)
        .mockReturnValueOnce(0.9) // e1
        .mockReturnValueOnce(0.1); // e2

      // Re-setup the initial query specifically
      (db.select as jest.Mock).mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
              innerJoin: jest.fn().mockReturnValue({
                  where: jest.fn().mockResolvedValue(mockEvents)
              })
          })
      });
      
      // For the loop queries (counts), we just return dummy data
      (db.select as jest.Mock).mockReturnValue({
            from: jest.fn().mockReturnValue({
                where: jest.fn().mockResolvedValue([{ count: 100 }])
            })
      });

      const results = await service.getHotEventsStats();

      expect(results).toHaveLength(2);
      expect(results[0].eventId).toBe('e1'); // Higher score
      expect(results[0].hotScore).toBe(0.9);
      expect(results[1].eventId).toBe('e2');
      expect(results[1].hotScore).toBe(0.1);
      
      expect(demandService.getBookingRate).toHaveBeenCalledTimes(2);
      expect(hotEventModel.predictHotness).toHaveBeenCalledTimes(2);
    });
  });

  describe('getSalesStats', () => {
    it('should fetch sales stats aggregated by date', async () => {
        const mockSales = [
            { date: '2023-01-01', revenue: '1000', tickets: '2' },
            { date: '2023-01-02', revenue: '500', tickets: '1' }
        ];

        // Mock the sophisticated query chain
        const mockOrderBy = jest.fn().mockResolvedValue(mockSales);
        const mockGroupBy = jest.fn().mockReturnValue({ orderBy: mockOrderBy });
        const mockWhere = jest.fn().mockReturnValue({ groupBy: mockGroupBy });
        const mockLeftJoin = jest.fn().mockReturnValue({ where: mockWhere });
        const mockFrom = jest.fn().mockReturnValue({ leftJoin: mockLeftJoin });
        
        (db.select as jest.Mock).mockReturnValue({ from: mockFrom });

        const stats = await service.getSalesStats(new Date(), new Date());
        
        expect(stats).toHaveLength(2);
        expect(stats[0].revenue).toBe(1000);
        expect(stats[0].tickets).toBe(2);
        expect(stats[0].date).toBe('2023-01-01');
    });
  });
});
