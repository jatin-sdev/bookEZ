
export const analyticsTypeDefs = `
  type HotEventStat {
    eventId: ID!
    eventName: String!
    venueName: String!
    date: String!
    hotScore: Float!
    bookingRate: Float!
    viewRate: Float!
    fillRate: Float!
    status: String!
  }

  type PricingStat {
    eventId: ID!
    eventName: String!
    basePrice: Int!
    currentMultiplier: Float!
    bookingRateByHour: Float!
    projectedRevenue: Int!
  }

  type SalesStat {
    date: String!
    revenue: Int!
    tickets: Int!
  }

  type AdminAnalytics {
    hotEvents: [HotEventStat!]!
    pricingStats: [PricingStat!]!
    totalSales(startDate: String, endDate: String): [SalesStat!]!
  }

  extend type Query {
    adminAnalytics: AdminAnalytics!
  }
`;
