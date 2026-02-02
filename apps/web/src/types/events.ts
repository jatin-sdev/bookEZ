export interface Venue {
  id: string;
  name: string;
  location: string;
}

export interface Event {
  id: string;
  name: string;
  date: string;
  imageUrl?: string;
  description?: string;
  venue: Venue;
}