
import { analyticsService } from "./analytics.service";
import { GraphQLError } from "graphql";

const requireAdmin = (context: any) => {
    if (!context.user || context.user.role !== 'ADMIN') {
      throw new GraphQLError('Forbidden: Admin access required.', {
        extensions: { code: 'FORBIDDEN' }
      });
    }
};

export const analyticsResolvers = {
    Query: {
        adminAnalytics: async (args: any, context: any) => {
            requireAdmin(context);
            
            // Parallel fetch for dashboard performance
            const [hotEvents, pricingStats] = await Promise.all([
                analyticsService.getHotEventsStats(),
                analyticsService.getPricingHealthStats()
            ]);

            return {
                hotEvents,
                pricingStats,
                totalSales: async (args: { startDate?: string, endDate?: string }) => {
                    const start = args.startDate ? new Date(args.startDate) : new Date(new Date().setDate(new Date().getDate() - 7));
                    const end = args.endDate ? new Date(args.endDate) : new Date();
                    return analyticsService.getSalesStats(start, end);
                }
            };
        }
    }
};
