import { Event } from "@/types/events";

// [FIX] Use Internal URL for Docker (SSR), Public URL for Browser
const ENDPOINT = (typeof window === 'undefined' ? process.env.API_URL_INTERNAL : process.env.NEXT_PUBLIC_API_URL) || 'http://localhost:4000/graphql';

// [FIX] Ensure we don't duplicate /graphql if it's already there, or miss it if it's not.
// The goal is to get the BASE, then append /graphql explicitly.
const API_URL = ENDPOINT.replace(/\/graphql\/?$/, '') + '/graphql';

export async function getEvents(filters?: { minPrice?: number; maxPrice?: number; venueId?: string; startDate?: string; endDate?: string }): Promise<Event[]> {
  const query = `
    query GetEvents($minPrice: Int, $maxPrice: Int, $venueId: ID, $startDate: String, $endDate: String) {
      events(minPrice: $minPrice, maxPrice: $maxPrice, venueId: $venueId, startDate: $startDate, endDate: $endDate) {
        id
        name
        date
        imageUrl
        description
        venue {
          name
          location
        }
      }
    }
  `;

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables: filters }),
      cache: 'no-store'
    });

    if (!res.ok) throw new Error('Network response was not ok');
    const json = await res.json();
    return json.data?.events || [];
  } catch (err) {
    console.error('Failed to fetch events:', err);
    return [];
  }
}

// ... (Keep getEventById and getVenues, but make sure they use the new API_URL variable)
export async function getEventById(id: string): Promise<Event | null> {
  const query = `
    query GetEvent($id: ID!) {
      event(id: $id) {
        id
        name
        date
        imageUrl
        description
        venue {
          name
          location
        }
      }
    }
  `;

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables: { id } }),
      cache: 'no-store'
    });

    const json = await res.json();
    return json.data?.event || null;
  } catch (err) {
    console.error(`Failed to fetch event ${id}:`, err);
    return null;
  }
}

export async function getVenues(): Promise<{ id: string; name: string }[]> {
  const query = `
    query GetVenues {
      venues {
        id
        name
      }
    }
  `;

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
      cache: 'no-store'
    });

    const json = await res.json();
    return json.data?.venues || [];
  } catch (err) {
    console.error('Failed to fetch venues:', err);
    return [];
  }
}