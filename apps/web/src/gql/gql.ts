/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 */
const documents = {
    "\n  query GetMyOrders {\n    myOrders {\n      id\n      status\n      totalAmount\n      createdAt\n      eventId\n      tickets {\n        id\n        sectionName\n        row\n        number\n        qrCode\n      }\n    }\n  }\n": types.GetMyOrdersDocument,
    "\n  query GetEventsByIds($ids: [ID!]!) {\n    events {\n      id\n      name\n      date\n      venue {\n        name\n      }\n    }\n  }\n": types.GetEventsByIdsDocument,
    "\n  query GetEventDetails($id: ID!) {\n    event(id: $id) {\n      id\n      name\n      description\n      date\n      status\n      imageUrl\n      venue {\n        id\n        name\n        location\n        capacity\n      }\n    }\n  }\n": types.GetEventDetailsDocument,
    "\n  query GetPublicEvents {\n    events {\n      id\n      name\n      date\n      imageUrl\n      description\n      venue {\n        name\n        location\n      }\n    }\n  }\n": types.GetPublicEventsDocument,
    "\n  query GetVenues {\n    venues {\n      id\n      name\n      location\n      capacity\n    }\n  }\n": types.GetVenuesDocument,
    "\n  mutation CreateEvent($input: CreateEventInput!) {\n    createEvent(input: $input) {\n      id\n      status\n    }\n  }\n": types.CreateEventDocument,
    "\n  mutation PublishEvent($id: ID!) {\n    publishEvent(id: $id) {\n      id\n      status\n    }\n  }\n": types.PublishEventDocument,
    "\n  mutation CreateVenue($input: CreateVenueInput!) {\n    createVenue(input: $input) {\n      id\n      name\n    }\n  }\n": types.CreateVenueDocument,
    "\n  mutation AddSection($venueId: ID!, $input: CreateSectionInput!) {\n    addSection(venueId: $venueId, input: $input) {\n      id\n    }\n  }\n": types.AddSectionDocument,
    "\n  query GetBookingEventDetails($eventId: ID!) {\n    event(id: $eventId) {\n      id\n      name\n      venue {\n        id\n        name\n        sections {\n          id\n          name\n          capacity\n          basePrice \n        }\n      }\n    }\n  }\n": types.GetBookingEventDetailsDocument,
    "\n  query GetSectionSeats($eventId: ID!, $sectionId: ID!) {\n    sectionSeats(eventId: $eventId, sectionId: $sectionId) {\n      id\n      row\n      number\n      x\n      y\n      status\n      lockedBy\n    }\n  }\n": types.GetSectionSeatsDocument,
    "\n  mutation LockSeat($eventId: ID!, $seatId: ID!) {\n    lockSeat(eventId: $eventId, seatId: $seatId) { id status }\n  }\n": types.LockSeatDocument,
    "\n  mutation UnlockSeat($eventId: ID!, $seatId: ID!) {\n    unlockSeat(eventId: $eventId, seatId: $seatId)\n  }\n": types.UnlockSeatDocument,
    "\n  mutation BookTickets($eventId: ID!, $seatIds: [ID!]!, $idempotencyKey: String!) {\n    bookTickets(eventId: $eventId, seatIds: $seatIds, idempotencyKey: $idempotencyKey) {\n      id\n      status\n    }\n  }\n": types.BookTicketsDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetMyOrders {\n    myOrders {\n      id\n      status\n      totalAmount\n      createdAt\n      eventId\n      tickets {\n        id\n        sectionName\n        row\n        number\n        qrCode\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetMyOrders {\n    myOrders {\n      id\n      status\n      totalAmount\n      createdAt\n      eventId\n      tickets {\n        id\n        sectionName\n        row\n        number\n        qrCode\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetEventsByIds($ids: [ID!]!) {\n    events {\n      id\n      name\n      date\n      venue {\n        name\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetEventsByIds($ids: [ID!]!) {\n    events {\n      id\n      name\n      date\n      venue {\n        name\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetEventDetails($id: ID!) {\n    event(id: $id) {\n      id\n      name\n      description\n      date\n      status\n      imageUrl\n      venue {\n        id\n        name\n        location\n        capacity\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetEventDetails($id: ID!) {\n    event(id: $id) {\n      id\n      name\n      description\n      date\n      status\n      imageUrl\n      venue {\n        id\n        name\n        location\n        capacity\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetPublicEvents {\n    events {\n      id\n      name\n      date\n      imageUrl\n      description\n      venue {\n        name\n        location\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetPublicEvents {\n    events {\n      id\n      name\n      date\n      imageUrl\n      description\n      venue {\n        name\n        location\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetVenues {\n    venues {\n      id\n      name\n      location\n      capacity\n    }\n  }\n"): (typeof documents)["\n  query GetVenues {\n    venues {\n      id\n      name\n      location\n      capacity\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreateEvent($input: CreateEventInput!) {\n    createEvent(input: $input) {\n      id\n      status\n    }\n  }\n"): (typeof documents)["\n  mutation CreateEvent($input: CreateEventInput!) {\n    createEvent(input: $input) {\n      id\n      status\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation PublishEvent($id: ID!) {\n    publishEvent(id: $id) {\n      id\n      status\n    }\n  }\n"): (typeof documents)["\n  mutation PublishEvent($id: ID!) {\n    publishEvent(id: $id) {\n      id\n      status\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreateVenue($input: CreateVenueInput!) {\n    createVenue(input: $input) {\n      id\n      name\n    }\n  }\n"): (typeof documents)["\n  mutation CreateVenue($input: CreateVenueInput!) {\n    createVenue(input: $input) {\n      id\n      name\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation AddSection($venueId: ID!, $input: CreateSectionInput!) {\n    addSection(venueId: $venueId, input: $input) {\n      id\n    }\n  }\n"): (typeof documents)["\n  mutation AddSection($venueId: ID!, $input: CreateSectionInput!) {\n    addSection(venueId: $venueId, input: $input) {\n      id\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetBookingEventDetails($eventId: ID!) {\n    event(id: $eventId) {\n      id\n      name\n      venue {\n        id\n        name\n        sections {\n          id\n          name\n          capacity\n          basePrice \n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetBookingEventDetails($eventId: ID!) {\n    event(id: $eventId) {\n      id\n      name\n      venue {\n        id\n        name\n        sections {\n          id\n          name\n          capacity\n          basePrice \n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetSectionSeats($eventId: ID!, $sectionId: ID!) {\n    sectionSeats(eventId: $eventId, sectionId: $sectionId) {\n      id\n      row\n      number\n      x\n      y\n      status\n      lockedBy\n    }\n  }\n"): (typeof documents)["\n  query GetSectionSeats($eventId: ID!, $sectionId: ID!) {\n    sectionSeats(eventId: $eventId, sectionId: $sectionId) {\n      id\n      row\n      number\n      x\n      y\n      status\n      lockedBy\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation LockSeat($eventId: ID!, $seatId: ID!) {\n    lockSeat(eventId: $eventId, seatId: $seatId) { id status }\n  }\n"): (typeof documents)["\n  mutation LockSeat($eventId: ID!, $seatId: ID!) {\n    lockSeat(eventId: $eventId, seatId: $seatId) { id status }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UnlockSeat($eventId: ID!, $seatId: ID!) {\n    unlockSeat(eventId: $eventId, seatId: $seatId)\n  }\n"): (typeof documents)["\n  mutation UnlockSeat($eventId: ID!, $seatId: ID!) {\n    unlockSeat(eventId: $eventId, seatId: $seatId)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation BookTickets($eventId: ID!, $seatIds: [ID!]!, $idempotencyKey: String!) {\n    bookTickets(eventId: $eventId, seatIds: $seatIds, idempotencyKey: $idempotencyKey) {\n      id\n      status\n    }\n  }\n"): (typeof documents)["\n  mutation BookTickets($eventId: ID!, $seatIds: [ID!]!, $idempotencyKey: String!) {\n    bookTickets(eventId: $eventId, seatIds: $seatIds, idempotencyKey: $idempotencyKey) {\n      id\n      status\n    }\n  }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;