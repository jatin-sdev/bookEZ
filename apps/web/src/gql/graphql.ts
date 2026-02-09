/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type AuthPayload = {
  __typename?: 'AuthPayload';
  accessToken: Scalars['String']['output'];
  refreshToken: Scalars['String']['output'];
};

export type CreateEventInput = {
  date: Scalars['String']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  imageUrl?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  venueId: Scalars['ID']['input'];
};

export type CreateSectionInput = {
  basePrice: Scalars['Int']['input'];
  capacity?: InputMaybe<Scalars['Int']['input']>;
  customSeats?: InputMaybe<Array<CustomSeatInput>>;
  name: Scalars['String']['input'];
  rows?: InputMaybe<Scalars['Int']['input']>;
  seatsPerRow?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<SectionType>;
};

export type CreateVenueInput = {
  capacity: Scalars['Int']['input'];
  location: Scalars['String']['input'];
  name: Scalars['String']['input'];
};

export type CustomSeatInput = {
  number: Scalars['String']['input'];
  row?: InputMaybe<Scalars['String']['input']>;
  x: Scalars['Int']['input'];
  y: Scalars['Int']['input'];
};

export type DashboardStats = {
  __typename?: 'DashboardStats';
  totalRevenue: Scalars['Int']['output'];
  totalTicketsSold: Scalars['Int']['output'];
};

export type Event = {
  __typename?: 'Event';
  date: Scalars['String']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  imageUrl?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  status: EventStatus;
  ticketsSold?: Maybe<Scalars['Int']['output']>;
  venue: Venue;
};

export enum EventStatus {
  Cancelled = 'CANCELLED',
  Completed = 'COMPLETED',
  Draft = 'DRAFT',
  Published = 'PUBLISHED'
}

export type Mutation = {
  __typename?: 'Mutation';
  _empty?: Maybe<Scalars['String']['output']>;
  addSection: Section;
  /**
   * Converts temporarily locked seats into confirmed bookings.
   * Requires authentication.
   * Pass 'idempotencyKey' (UUID) to prevent double-billing on network retries.
   */
  bookTickets: Order;
  /**
   * cancels an existing booking and frees the associated seats.
   * Requires authentication.
   */
  cancelBooking: Scalars['Boolean']['output'];
  /**
   * Verifies the payment signature from Razorpay.
   * If valid, marks the order as COMPLETED.
   */
  confirmPayment: Scalars['Boolean']['output'];
  createEvent: Event;
  /**
   * Initiates the payment process for a pending order.
   * Returns the Razorpay Order ID and config.
   */
  createPaymentOrder: PaymentOrderResponse;
  createVenue: Venue;
  deleteEvent: Scalars['Boolean']['output'];
  deleteSection: Scalars['Boolean']['output'];
  deleteVenue: Scalars['Boolean']['output'];
  /**
   * Temporarily locks a seat for the user.
   * Returns the updated Seat object.
   */
  lockSeat: Seat;
  login?: Maybe<AuthPayload>;
  publishEvent: Event;
  recordEventView: Scalars['Boolean']['output'];
  refreshToken?: Maybe<AuthPayload>;
  register?: Maybe<Scalars['String']['output']>;
  /** Releases a held seat. */
  unlockSeat: Scalars['Boolean']['output'];
  updateEvent: Event;
  updateProfile: User;
  updateSeatPositions: Scalars['Boolean']['output'];
  updateSection: Section;
  updateSettings: UserSettings;
  updateVenue: Venue;
};


export type MutationAddSectionArgs = {
  input: CreateSectionInput;
  venueId: Scalars['ID']['input'];
};


export type MutationBookTicketsArgs = {
  eventId: Scalars['ID']['input'];
  idempotencyKey: Scalars['String']['input'];
  seatIds: Array<Scalars['ID']['input']>;
};


export type MutationCancelBookingArgs = {
  orderId: Scalars['ID']['input'];
};


export type MutationConfirmPaymentArgs = {
  orderId: Scalars['ID']['input'];
  razorpayOrderId: Scalars['String']['input'];
  razorpayPaymentId: Scalars['String']['input'];
  signature: Scalars['String']['input'];
};


export type MutationCreateEventArgs = {
  input: CreateEventInput;
};


export type MutationCreatePaymentOrderArgs = {
  orderId: Scalars['ID']['input'];
};


export type MutationCreateVenueArgs = {
  input: CreateVenueInput;
};


export type MutationDeleteEventArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteSectionArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteVenueArgs = {
  id: Scalars['ID']['input'];
};


export type MutationLockSeatArgs = {
  eventId: Scalars['ID']['input'];
  seatId: Scalars['ID']['input'];
};


export type MutationLoginArgs = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};


export type MutationPublishEventArgs = {
  id: Scalars['ID']['input'];
};


export type MutationRecordEventViewArgs = {
  eventId: Scalars['ID']['input'];
};


export type MutationRefreshTokenArgs = {
  token: Scalars['String']['input'];
};


export type MutationRegisterArgs = {
  email: Scalars['String']['input'];
  fullName: Scalars['String']['input'];
  password: Scalars['String']['input'];
};


export type MutationUnlockSeatArgs = {
  eventId: Scalars['ID']['input'];
  seatId: Scalars['ID']['input'];
};


export type MutationUpdateEventArgs = {
  id: Scalars['ID']['input'];
  input: UpdateEventInput;
};


export type MutationUpdateProfileArgs = {
  input: UpdateProfileInput;
};


export type MutationUpdateSeatPositionsArgs = {
  updates: Array<SeatPositionInput>;
};


export type MutationUpdateSectionArgs = {
  id: Scalars['ID']['input'];
  input: UpdateSectionInput;
};


export type MutationUpdateSettingsArgs = {
  input: UpdateSettingsInput;
};


export type MutationUpdateVenueArgs = {
  id: Scalars['ID']['input'];
  input: UpdateVenueInput;
};

export type Order = {
  __typename?: 'Order';
  createdAt: Scalars['String']['output'];
  event?: Maybe<Event>;
  eventId: Scalars['ID']['output'];
  id: Scalars['ID']['output'];
  idempotencyKey?: Maybe<Scalars['String']['output']>;
  paymentIntentId?: Maybe<Scalars['String']['output']>;
  status: OrderStatus;
  tickets: Array<Ticket>;
  totalAmount: Scalars['Int']['output'];
};

export enum OrderStatus {
  Cancelled = 'CANCELLED',
  Completed = 'COMPLETED',
  Pending = 'PENDING',
  Refunded = 'REFUNDED'
}

export type PaymentOrderResponse = {
  __typename?: 'PaymentOrderResponse';
  amount: Scalars['Int']['output'];
  currency: Scalars['String']['output'];
  id: Scalars['String']['output'];
  keyId: Scalars['String']['output'];
};

export type Query = {
  __typename?: 'Query';
  /**
   * Fetch system-wide statistics for the admin dashboard.
   * Requires ADMIN role.
   */
  adminDashboardStats: DashboardStats;
  event?: Maybe<Event>;
  events: Array<Event>;
  hello?: Maybe<Scalars['String']['output']>;
  hotEvent?: Maybe<Event>;
  me: User;
  /** Fetch purchase history for the currently authenticated user. */
  myOrders: Array<Order>;
  mySettings: UserSettings;
  myTransactions: Array<Transaction>;
  myWallet?: Maybe<Wallet>;
  /**
   * Fetch a specific order by ID.
   * Requires authentication and ownership of the order.
   */
  order?: Maybe<Order>;
  sectionSeats: Array<Seat>;
  venue?: Maybe<Venue>;
  venues: Array<Venue>;
};


export type QueryEventArgs = {
  id: Scalars['ID']['input'];
};


export type QueryEventsArgs = {
  endDate?: InputMaybe<Scalars['String']['input']>;
  maxPrice?: InputMaybe<Scalars['Int']['input']>;
  minPrice?: InputMaybe<Scalars['Int']['input']>;
  startDate?: InputMaybe<Scalars['String']['input']>;
  venueId?: InputMaybe<Scalars['ID']['input']>;
};


export type QueryMyTransactionsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryOrderArgs = {
  id: Scalars['ID']['input'];
};


export type QuerySectionSeatsArgs = {
  eventId: Scalars['ID']['input'];
  sectionId: Scalars['ID']['input'];
};


export type QueryVenueArgs = {
  id: Scalars['ID']['input'];
};

export type Seat = {
  __typename?: 'Seat';
  id: Scalars['ID']['output'];
  lockedBy?: Maybe<Scalars['ID']['output']>;
  number: Scalars['String']['output'];
  price: Scalars['Int']['output'];
  row?: Maybe<Scalars['String']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  x?: Maybe<Scalars['Int']['output']>;
  y?: Maybe<Scalars['Int']['output']>;
};

export type SeatPositionInput = {
  seatId: Scalars['ID']['input'];
  x: Scalars['Int']['input'];
  y: Scalars['Int']['input'];
};

export type Section = {
  __typename?: 'Section';
  basePrice: Scalars['Int']['output'];
  capacity: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  type: SectionType;
};

export enum SectionType {
  Assigned = 'ASSIGNED',
  GeneralAdmission = 'GENERAL_ADMISSION'
}

export type Ticket = {
  __typename?: 'Ticket';
  id: Scalars['ID']['output'];
  number: Scalars['String']['output'];
  price: Scalars['Int']['output'];
  qrCode?: Maybe<Scalars['String']['output']>;
  row?: Maybe<Scalars['String']['output']>;
  sectionName: Scalars['String']['output'];
};

export type Transaction = {
  __typename?: 'Transaction';
  amount: Scalars['Float']['output'];
  createdAt: Scalars['String']['output'];
  description: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  type: TransactionType;
};

export enum TransactionType {
  Credit = 'CREDIT',
  Debit = 'DEBIT'
}

export type UpdateEventInput = {
  date?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  imageUrl?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<EventStatus>;
};

export type UpdateProfileInput = {
  email?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateSectionInput = {
  basePrice?: InputMaybe<Scalars['Int']['input']>;
  capacity?: InputMaybe<Scalars['Int']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateSettingsInput = {
  emailNotifications?: InputMaybe<Scalars['Boolean']['input']>;
  eventReminders?: InputMaybe<Scalars['Boolean']['input']>;
  pushNotifications?: InputMaybe<Scalars['Boolean']['input']>;
};

export type UpdateVenueInput = {
  capacity?: InputMaybe<Scalars['Int']['input']>;
  location?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};

export type User = {
  __typename?: 'User';
  email: Scalars['String']['output'];
  fullName: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  role: Scalars['String']['output'];
};

export type UserSettings = {
  __typename?: 'UserSettings';
  emailNotifications: Scalars['Boolean']['output'];
  eventReminders: Scalars['Boolean']['output'];
  pushNotifications: Scalars['Boolean']['output'];
};

export type Venue = {
  __typename?: 'Venue';
  capacity: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  location: Scalars['String']['output'];
  name: Scalars['String']['output'];
  sections: Array<Section>;
};

export type Wallet = {
  __typename?: 'Wallet';
  balance: Scalars['Float']['output'];
  pending: Scalars['Float']['output'];
  totalRefunds: Scalars['Float']['output'];
  totalSpent: Scalars['Float']['output'];
};

export type CancelBookingMutationVariables = Exact<{
  orderId: Scalars['ID']['input'];
}>;


export type CancelBookingMutation = { __typename?: 'Mutation', cancelBooking: boolean };

export type GetMyOrdersQueryVariables = Exact<{ [key: string]: never; }>;


export type GetMyOrdersQuery = { __typename?: 'Query', myOrders: Array<{ __typename?: 'Order', id: string, status: OrderStatus, totalAmount: number, createdAt: string, eventId: string, tickets: Array<{ __typename?: 'Ticket', id: string, sectionName: string, row?: string | null, number: string, qrCode?: string | null }>, event?: { __typename?: 'Event', id: string, name: string, date: string, venue: { __typename?: 'Venue', name: string } } | null }> };

export type GetEventDetailsQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetEventDetailsQuery = { __typename?: 'Query', event?: { __typename?: 'Event', id: string, name: string, description?: string | null, date: string, status: EventStatus, imageUrl?: string | null, venue: { __typename?: 'Venue', id: string, name: string, location: string, capacity: number } } | null };

export type GetPublicEventsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetPublicEventsQuery = { __typename?: 'Query', hotEvent?: { __typename?: 'Event', id: string, name: string, date: string, description?: string | null, imageUrl?: string | null, venue: { __typename?: 'Venue', name: string, location: string } } | null, events: Array<{ __typename?: 'Event', id: string, name: string, date: string, imageUrl?: string | null, description?: string | null, venue: { __typename?: 'Venue', name: string, location: string } }> };

export type GetVenuesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetVenuesQuery = { __typename?: 'Query', venues: Array<{ __typename?: 'Venue', id: string, name: string, location: string, capacity: number }> };

export type CreateEventMutationVariables = Exact<{
  input: CreateEventInput;
}>;


export type CreateEventMutation = { __typename?: 'Mutation', createEvent: { __typename?: 'Event', id: string, status: EventStatus } };

export type PublishEventMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type PublishEventMutation = { __typename?: 'Mutation', publishEvent: { __typename?: 'Event', id: string, status: EventStatus } };

export type CreateVenueMutationVariables = Exact<{
  input: CreateVenueInput;
}>;


export type CreateVenueMutation = { __typename?: 'Mutation', createVenue: { __typename?: 'Venue', id: string, name: string } };

export type AddSectionMutationVariables = Exact<{
  venueId: Scalars['ID']['input'];
  input: CreateSectionInput;
}>;


export type AddSectionMutation = { __typename?: 'Mutation', addSection: { __typename?: 'Section', id: string } };

export type CreatePaymentOrderMutationVariables = Exact<{
  orderId: Scalars['ID']['input'];
}>;


export type CreatePaymentOrderMutation = { __typename?: 'Mutation', createPaymentOrder: { __typename?: 'PaymentOrderResponse', id: string, amount: number, currency: string, keyId: string } };

export type ConfirmPaymentMutationVariables = Exact<{
  orderId: Scalars['ID']['input'];
  razorpayOrderId: Scalars['String']['input'];
  razorpayPaymentId: Scalars['String']['input'];
  signature: Scalars['String']['input'];
}>;


export type ConfirmPaymentMutation = { __typename?: 'Mutation', confirmPayment: boolean };

export type RecordEventViewMutationVariables = Exact<{
  eventId: Scalars['ID']['input'];
}>;


export type RecordEventViewMutation = { __typename?: 'Mutation', recordEventView: boolean };

export type GetBookingEventDetailsQueryVariables = Exact<{
  eventId: Scalars['ID']['input'];
}>;


export type GetBookingEventDetailsQuery = { __typename?: 'Query', event?: { __typename?: 'Event', id: string, name: string, venue: { __typename?: 'Venue', id: string, name: string, sections: Array<{ __typename?: 'Section', id: string, name: string, capacity: number, basePrice: number }> } } | null };

export type GetSectionSeatsQueryVariables = Exact<{
  eventId: Scalars['ID']['input'];
  sectionId: Scalars['ID']['input'];
}>;


export type GetSectionSeatsQuery = { __typename?: 'Query', sectionSeats: Array<{ __typename?: 'Seat', id: string, row?: string | null, number: string, x?: number | null, y?: number | null, status?: string | null, lockedBy?: string | null }> };

export type LockSeatMutationVariables = Exact<{
  eventId: Scalars['ID']['input'];
  seatId: Scalars['ID']['input'];
}>;


export type LockSeatMutation = { __typename?: 'Mutation', lockSeat: { __typename?: 'Seat', id: string, status?: string | null } };

export type UnlockSeatMutationVariables = Exact<{
  eventId: Scalars['ID']['input'];
  seatId: Scalars['ID']['input'];
}>;


export type UnlockSeatMutation = { __typename?: 'Mutation', unlockSeat: boolean };

export type BookTicketsMutationVariables = Exact<{
  eventId: Scalars['ID']['input'];
  seatIds: Array<Scalars['ID']['input']> | Scalars['ID']['input'];
  idempotencyKey: Scalars['String']['input'];
}>;


export type BookTicketsMutation = { __typename?: 'Mutation', bookTickets: { __typename?: 'Order', id: string, status: OrderStatus } };


export const CancelBookingDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CancelBooking"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orderId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cancelBooking"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orderId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orderId"}}}]}]}}]} as unknown as DocumentNode<CancelBookingMutation, CancelBookingMutationVariables>;
export const GetMyOrdersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetMyOrders"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"myOrders"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"totalAmount"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"eventId"}},{"kind":"Field","name":{"kind":"Name","value":"tickets"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"sectionName"}},{"kind":"Field","name":{"kind":"Name","value":"row"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"qrCode"}}]}},{"kind":"Field","name":{"kind":"Name","value":"event"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"venue"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]}}]} as unknown as DocumentNode<GetMyOrdersQuery, GetMyOrdersQueryVariables>;
export const GetEventDetailsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetEventDetails"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"event"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"venue"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"location"}},{"kind":"Field","name":{"kind":"Name","value":"capacity"}}]}}]}}]}}]} as unknown as DocumentNode<GetEventDetailsQuery, GetEventDetailsQueryVariables>;
export const GetPublicEventsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetPublicEvents"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hotEvent"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"venue"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"location"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"events"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"venue"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"location"}}]}}]}}]}}]} as unknown as DocumentNode<GetPublicEventsQuery, GetPublicEventsQueryVariables>;
export const GetVenuesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetVenues"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"venues"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"location"}},{"kind":"Field","name":{"kind":"Name","value":"capacity"}}]}}]}}]} as unknown as DocumentNode<GetVenuesQuery, GetVenuesQueryVariables>;
export const CreateEventDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateEvent"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateEventInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createEvent"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<CreateEventMutation, CreateEventMutationVariables>;
export const PublishEventDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"PublishEvent"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"publishEvent"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<PublishEventMutation, PublishEventMutationVariables>;
export const CreateVenueDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateVenue"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateVenueInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createVenue"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<CreateVenueMutation, CreateVenueMutationVariables>;
export const AddSectionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AddSection"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"venueId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateSectionInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"addSection"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"venueId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"venueId"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<AddSectionMutation, AddSectionMutationVariables>;
export const CreatePaymentOrderDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreatePaymentOrder"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orderId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createPaymentOrder"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orderId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orderId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"keyId"}}]}}]}}]} as unknown as DocumentNode<CreatePaymentOrderMutation, CreatePaymentOrderMutationVariables>;
export const ConfirmPaymentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ConfirmPayment"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orderId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"razorpayOrderId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"razorpayPaymentId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"signature"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"confirmPayment"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orderId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orderId"}}},{"kind":"Argument","name":{"kind":"Name","value":"razorpayOrderId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"razorpayOrderId"}}},{"kind":"Argument","name":{"kind":"Name","value":"razorpayPaymentId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"razorpayPaymentId"}}},{"kind":"Argument","name":{"kind":"Name","value":"signature"},"value":{"kind":"Variable","name":{"kind":"Name","value":"signature"}}}]}]}}]} as unknown as DocumentNode<ConfirmPaymentMutation, ConfirmPaymentMutationVariables>;
export const RecordEventViewDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RecordEventView"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"eventId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"recordEventView"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"eventId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"eventId"}}}]}]}}]} as unknown as DocumentNode<RecordEventViewMutation, RecordEventViewMutationVariables>;
export const GetBookingEventDetailsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetBookingEventDetails"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"eventId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"event"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"eventId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"venue"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"sections"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"capacity"}},{"kind":"Field","name":{"kind":"Name","value":"basePrice"}}]}}]}}]}}]}}]} as unknown as DocumentNode<GetBookingEventDetailsQuery, GetBookingEventDetailsQueryVariables>;
export const GetSectionSeatsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetSectionSeats"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"eventId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"sectionId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sectionSeats"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"eventId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"eventId"}}},{"kind":"Argument","name":{"kind":"Name","value":"sectionId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"sectionId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"row"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"x"}},{"kind":"Field","name":{"kind":"Name","value":"y"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"lockedBy"}}]}}]}}]} as unknown as DocumentNode<GetSectionSeatsQuery, GetSectionSeatsQueryVariables>;
export const LockSeatDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"LockSeat"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"eventId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"seatId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lockSeat"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"eventId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"eventId"}}},{"kind":"Argument","name":{"kind":"Name","value":"seatId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"seatId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<LockSeatMutation, LockSeatMutationVariables>;
export const UnlockSeatDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UnlockSeat"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"eventId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"seatId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"unlockSeat"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"eventId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"eventId"}}},{"kind":"Argument","name":{"kind":"Name","value":"seatId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"seatId"}}}]}]}}]} as unknown as DocumentNode<UnlockSeatMutation, UnlockSeatMutationVariables>;
export const BookTicketsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"BookTickets"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"eventId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"seatIds"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"idempotencyKey"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"bookTickets"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"eventId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"eventId"}}},{"kind":"Argument","name":{"kind":"Name","value":"seatIds"},"value":{"kind":"Variable","name":{"kind":"Name","value":"seatIds"}}},{"kind":"Argument","name":{"kind":"Name","value":"idempotencyKey"},"value":{"kind":"Variable","name":{"kind":"Name","value":"idempotencyKey"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<BookTicketsMutation, BookTicketsMutationVariables>;