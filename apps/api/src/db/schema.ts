import { pgTable, text, timestamp, pgEnum, uuid, integer, index, primaryKey } from "drizzle-orm/pg-core";

// --- ENUMS ---
export const userRoleEnum = pgEnum("user_role", ["ADMIN", "USER"]);
export const eventStatusEnum = pgEnum('event_status', ['DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED']);
export const seatStatusEnum = pgEnum('seat_status', ['AVAILABLE', 'LOCKED', 'BOOKED', 'RESERVED']);
export const orderStatusEnum = pgEnum('order_status', ['PENDING', 'COMPLETED', 'CANCELLED', 'REFUNDED']);
export const sectionTypeEnum = pgEnum('section_type', ['ASSIGNED', 'GENERAL_ADMISSION']);

// --- USERS TABLE ---
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: userRoleEnum("role").default("USER").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// --- VENUES & EVENTS TABLES ---

export const venues = pgTable('venues', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  location: text('location').notNull(),
  description: text('description'),
  capacity: integer('capacity').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const sections = pgTable('sections', {
  id: uuid('id').defaultRandom().primaryKey(),
  venueId: uuid('venue_id').references(() => venues.id).notNull(),
  name: text('name').notNull(),
  capacity: integer('capacity').notNull(),
  basePrice: integer('base_price').notNull(),
  type: sectionTypeEnum('type').default('ASSIGNED').notNull(), // New: Supports GA vs Assigned
  createdAt: timestamp('created_at').defaultNow(),
});

// Physical Seats (The Map)
export const seats = pgTable('seats', {
  id: uuid('id').defaultRandom().primaryKey(),
  sectionId: uuid('section_id').references(() => sections.id).notNull(),
  row: text('row'), // Nullable for General Admission
  number: text('number').notNull(),
  x: integer('x'), 
  y: integer('y'), 
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => {
  return {
    sectionIdx: index("idx_seats_section").on(table.sectionId),
  };
});

export const events = pgTable('events', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  venueId: uuid('venue_id').references(() => venues.id).notNull(),
  date: timestamp('date').notNull(),
  status: eventStatusEnum('status').default('DRAFT').notNull(),
  imageUrl: text('image_url'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// --- INVENTORY (Partitioned) ---
export const eventSeats = pgTable("event_seats", {
  eventId: uuid("event_id").notNull().references(() => events.id), 
  seatId: uuid("seat_id").notNull().references(() => seats.id),
  sectionId: uuid("section_id").notNull(), 
  userId: uuid("user_id").references(() => users.id),
  status: seatStatusEnum("status").default("AVAILABLE").notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.eventId, table.seatId] }),
    lookupIdx: index("idx_event_seats_lookup").on(table.eventId, table.sectionId, table.status)
  };
});

// ORDERS & TICKETS ---

export const orders = pgTable('orders', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  eventId: uuid('event_id').references(() => events.id).notNull(),
  totalAmount: integer('total_amount').notNull(), 
  status: orderStatusEnum('status').default('PENDING').notNull(),
  paymentIntentId: text('payment_intent_id'),
  idempotencyKey: text('idempotency_key').unique(), // New: Prevents double-booking
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => {
  return {
    // Index for fast idempotency lookups
    idemIdx: index("idx_orders_idempotency").on(table.idempotencyKey),
  };
});

export const tickets = pgTable('tickets', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderId: uuid('order_id').references(() => orders.id).notNull(),
  eventId: uuid('event_id').references(() => events.id).notNull(),
  seatId: uuid('seat_id').notNull(), 
  sectionName: text('section_name').notNull(),
  row: text('row'),
  number: text('number').notNull(),
  price: integer('price').notNull(),
  qrCode: text('qr_code').unique(), 
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => {
  return {
    orderIdx: index("idx_tickets_order").on(table.orderId),
  };
});