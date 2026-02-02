// apps/web/src/lib/api.ts

const ENDPOINT = (typeof window === 'undefined' ? process.env.API_URL_INTERNAL : process.env.NEXT_PUBLIC_API_URL) || 'http://localhost:4000/graphql';
const API_URL = ENDPOINT.replace(/\/graphql\/?$/, '');

// --- Helpers ---

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// --- Types ---

export interface Ticket {
  id: string;
  sectionName: string;
  row: string;
  number: string;
  price: number;
  qrCode?: string;
}

export interface Order {
  id: string;
  eventId: string;
  event?: {
    id: string;
    name: string;
    date: string;
    venue: {
      name: string;
      location: string;
    }
  };
  // Deprecated flat fields
  eventName?: string; 
  eventDate?: string; 
  eventImage?: string; 
  eventLocation?: string;
  totalAmount: number;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED';
  createdAt: string;
  tickets: Ticket[];
}

// --- Core Fetcher ---

export async function apiRequest<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  let token = '';
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('accessToken') || '';
  }

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { "Authorization": `Bearer ${token}` } : {}),
    ...(options?.headers || {}),
  };

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.error || json.errors?.[0]?.message || "Request failed");
  }

  // Handle GraphQL errors specifically
  if (json.errors) {
    throw new Error(json.errors[0].message);
  }

  return json;
}

// --- Booking & Order Helpers ---

export const bookTickets = async (eventId: string, seatIds: string[]) => {
  const idempotencyKey = generateUUID();

  const mutation = `
    mutation BookTickets($eventId: ID!, $seatIds: [ID!]!, $idempotencyKey: String) {
      bookTickets(eventId: $eventId, seatIds: $seatIds, idempotencyKey: $idempotencyKey) {
        id
        status
        totalAmount
        tickets {
          id
          sectionName
          row
          number
          price
        }
      }
    }
  `;

  return apiRequest<{ data: { bookTickets: Order } }>('/graphql', {
    method: 'POST',
    body: JSON.stringify({
      query: mutation,
      variables: { eventId, seatIds, idempotencyKey },
    }),
  });
};

export const getOrder = async (orderId: string) => {
  const query = `
    query GetOrder($id: ID!) {
      order(id: $id) {
        id
        totalAmount
        status
        createdAt
        tickets {
          id
          sectionName
          row
          number
          price
        }
        eventId
        event {
          id
          name
          date
          venue {
            name
            location
          }
        }
      }
    }
  `;

  return apiRequest<{ data: { order: Order } }>('/graphql', {
    method: 'POST',
    body: JSON.stringify({
      query: query,
      variables: { id: orderId }
    }),
  });
};

export const confirmPayment = async (orderId: string, paymentDetails: any) => {
  // In a real app, this would integrate with Stripe/Razorpay
  // For this MVP, we simulate a successful payment mutation
  const mutation = `
    mutation ConfirmOrder($id: ID!) {
      confirmOrder(id: $id) {
        id
        status
      }
    }
  `;

  return apiRequest<{ data: { confirmOrder: Order } }>('/graphql', {
    method: 'POST',
    body: JSON.stringify({
      query: mutation,
      variables: { id: orderId }
    }),
  });
};

export const getMyOrders = async () => {
  const query = `
    query GetMyOrders {
      myOrders {
        id
        totalAmount
        status
        createdAt
        tickets {
          id
          sectionName
          row
          number
          price
        }
        eventId
      }
    }
  `;

  return apiRequest<{ data: { myOrders: Order[] } }>('/graphql', {
    method: 'POST',
    body: JSON.stringify({ query }),
  });
};