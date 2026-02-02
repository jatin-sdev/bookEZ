export const bookingTypeDefs = `
  enum OrderStatus {
    PENDING
    COMPLETED
    CANCELLED
    REFUNDED
  }

  type PaymentOrderResponse {
    id: String!
    amount: Int!
    currency: String!
    keyId: String!
  }

  type Ticket {
    id: ID!
    sectionName: String!
    row: String
    number: String!
    price: Int!
    qrCode: String
  }

  type Order {
    id: ID!
    eventId: ID!
    totalAmount: Int!
    status: OrderStatus!
    paymentIntentId: String
    idempotencyKey: String
    createdAt: String!
    tickets: [Ticket!]!
    event: Event
  }

  extend type Query {
    """
    Fetch purchase history for the currently authenticated user.
    """
    myOrders: [Order!]!
    
    """
    Fetch a specific order by ID.
    Requires authentication and ownership of the order.
    """
    order(id: ID!): Order
  }

  extend type Mutation {
    """
    Converts temporarily locked seats into confirmed bookings.
    Requires authentication.
    Pass 'idempotencyKey' (UUID) to prevent double-billing on network retries.
    """
    bookTickets(eventId: ID!, seatIds: [ID!]!, idempotencyKey: String!): Order!
    
    """
    cancels an existing booking and frees the associated seats.
    Requires authentication.
    """
    cancelBooking(orderId: ID!): Boolean!

    """
    Initiates the payment process for a pending order.
    Returns the Razorpay Order ID and config.
    """
    createPaymentOrder(orderId: ID!): PaymentOrderResponse!

    """
    Verifies the payment signature from Razorpay.
    If valid, marks the order as COMPLETED.
    """
    confirmPayment(orderId: ID!, razorpayOrderId: String!, razorpayPaymentId: String!, signature: String!): Boolean!
  }

  type DashboardStats {
    totalRevenue: Int!
    totalTicketsSold: Int!
  }

  extend type Query {
    """
    Fetch system-wide statistics for the admin dashboard.
    Requires ADMIN role.
    """
    adminDashboardStats: DashboardStats!
  }
`;