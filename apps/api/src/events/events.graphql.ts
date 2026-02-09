export const eventTypeDefs = `
  enum EventStatus {
    DRAFT
    PUBLISHED
    CANCELLED
    COMPLETED
  }

  enum SectionType {
    ASSIGNED
    GENERAL_ADMISSION
  }

  type Venue {
    id: ID!
    name: String!
    location: String!
    capacity: Int!
    sections: [Section!]!
  }

  type Section {
    id: ID!
    name: String!
    capacity: Int!
    basePrice: Int!
    type: SectionType!
  }

  type Seat {
    id: ID!
    row: String
    number: String!
    x: Int
    y: Int
    status: String
    lockedBy: ID
    price: Int!
  }

  type Event {
    id: ID!
    name: String!
    description: String
    date: String!
    status: EventStatus!
    venue: Venue!
    imageUrl: String
    ticketsSold: Int
  }

  extend type Query {
    events(
      minPrice: Int
      maxPrice: Int
      venueId: ID
      startDate: String
      endDate: String
    ): [Event!]!
    event(id: ID!): Event
    venues: [Venue!]!
    venue(id: ID!): Venue
    
    # [FIX] You MUST add this line so the frontend can fetch seats!
    sectionSeats(eventId: ID!, sectionId: ID!): [Seat!]!
  }

  input CreateVenueInput {
    name: String!
    location: String!
    capacity: Int!
  }

  input CreateSectionInput {
    name: String!
    basePrice: Int!
    type: SectionType = ASSIGNED
    # Strategy 1: Grid Layout
    rows: Int
    seatsPerRow: Int
    # Strategy 2: General Admission
    capacity: Int
    # Strategy 3: Custom Layout (Drag & Drop)
    customSeats: [CustomSeatInput!]
  }

  input CreateEventInput {
    name: String!
    description: String
    venueId: ID!
    date: String!
    imageUrl: String
  }

  input UpdateEventInput {
    name: String
    description: String
    date: String
    imageUrl: String
    status: EventStatus
  }

  input CustomSeatInput {
    number: String!
    row: String
    x: Int!
    y: Int!
  }

  input SeatPositionInput {
    seatId: ID!
    x: Int!
    y: Int!
  }

  input UpdateVenueInput {
    name: String
    location: String
    capacity: Int
  }

  input UpdateSectionInput {
    name: String
    basePrice: Int
    capacity: Int
  }

  extend type Mutation {
    # --- Admin: Venue & Layout ---
    createVenue(input: CreateVenueInput!): Venue!
    updateVenue(id: ID!, input: UpdateVenueInput!): Venue!
    deleteVenue(id: ID!): Boolean!
    addSection(venueId: ID!, input: CreateSectionInput!): Section!
    updateSection(id: ID!, input: UpdateSectionInput!): Section!
    deleteSection(id: ID!): Boolean!
    updateSeatPositions(updates: [SeatPositionInput!]!): Boolean!

    # --- Admin: Events ---
    createEvent(input: CreateEventInput!): Event!
    updateEvent(id: ID!, input: UpdateEventInput!): Event!
    publishEvent(id: ID!): Event!
    deleteEvent(id: ID!): Boolean!

    # --- User: Real-Time Locking ---
    """
    Temporarily locks a seat for the user. 
    Returns the updated Seat object.
    """
    lockSeat(eventId: ID!, seatId: ID!): Seat!

    """
    Releases a held seat.
    """
    unlockSeat(eventId: ID!, seatId: ID!): Boolean!
  }
`;