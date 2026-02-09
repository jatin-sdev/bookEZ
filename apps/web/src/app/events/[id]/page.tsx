import { fetchServer } from '@/lib/fetchers';
import { gql } from 'graphql-request';
import Link from 'next/link';
import { Calendar, MapPin, Info, Image as ImageIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/Button';

// Query for a single event
export const dynamic = 'force-dynamic';
const GET_EVENT_DETAILS = gql`
  query GetEventDetails($id: ID!) {
    event(id: $id) {
      id
      name
      description
      date
      status
      imageUrl
      venue {
        id
        name
        location
        capacity
      }
    }
  }
`;

interface PageProps {
  params: { id: string };
}

const DEFAULT_EVENT_IMAGE = "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=2670&auto=format&fit=crop";

export default async function EventDetailsPage({ params }: PageProps) {
  // Await params as it's a Promise in Next.js 15+
  const { id } = await params;
  
  // Fetch data
  let event;
  try {
    const data = await fetchServer(GET_EVENT_DETAILS, { id });
    event = (data as any).event;
  } catch (error: any) {
    console.error("Error fetching event details:", error);
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Error loading event</h1>
          <p className="text-red-500 mt-2">{error.message}</p>
          <Link href="/" className="text-blue-600 hover:underline mt-2 block">Return Home</Link>
        </div>
      </div>
    );
  }

  if (!event) return null;

  // Determine display image
  const displayImage = event.imageUrl && event.imageUrl.trim().length > 0 ? event.imageUrl : DEFAULT_EVENT_IMAGE;

  // Parse date safely - handle both ISO strings and timestamp numbers
  let eventDate: Date;
  try {
    // If it's a stringified number (timestamp), parse as number first
    const dateValue = typeof event.date === 'string' && /^\d+$/.test(event.date) 
      ? parseInt(event.date) 
      : event.date;
    eventDate = new Date(dateValue);
    
    // Verify it's a valid date
    if (isNaN(eventDate.getTime())) {
      throw new Error('Invalid date');
    }
  } catch (error) {
    console.error('Error parsing event date:', event.date, error);
    // Fallback to current date if parsing fails
    eventDate = new Date();
  }

  return (
    <div className="bg-slate-950 min-h-screen pb-12 text-slate-200 font-sans">
      {/* 1. Header / Hero */}
      <div className="bg-slate-900 border-b border-slate-800">
        <div className="container max-w-6xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Event Image */}
            <div className="w-full md:w-1/3 aspect-[4/3] rounded-xl overflow-hidden shadow-lg bg-slate-800 border border-slate-700 relative">
               <img src={displayImage} alt={event.name} className="w-full h-full object-cover" />
            </div>

            {/* Event Info */}
            <div className="flex-1 space-y-4 min-w-0">
              <div className="inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-blue-500/10 text-blue-400 border border-blue-500/20">
                {event.status}
              </div>
              
              <h1 className="text-2xl md:text-4xl font-extrabold text-white leading-tight break-words">
                {event.name}
              </h1>

              <div className="flex flex-col gap-2 text-slate-400 mt-2">
                <div className="flex items-center text-sm md:text-base">
                  <Calendar className="w-4 h-4 mr-2.5 text-primary shrink-0" />
                  <span className="font-medium text-slate-300">{format(eventDate, 'EEEE, MMMM do, yyyy')}</span>
                  <span className="mx-2 text-slate-600">•</span>
                  <span>{format(eventDate, 'h:mm a')}</span>
                </div>
                
                <div className="flex items-center text-sm md:text-base">
                  <MapPin className="w-4 h-4 mr-2.5 text-red-500 shrink-0" />
                  <span className="font-medium text-slate-300">{event.venue.name}</span>
                  <span className="mx-2 text-slate-600">|</span>
                  <span className="truncate">{event.venue.location}</span>
                </div>
              </div>
            </div>

            {/* CTA Card (Desktop Right) */}
            <div className="hidden md:block w-72 bg-slate-950/50 p-5 rounded-xl shadow-lg border border-slate-800 sticky top-24 shrink-0">
               <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold text-slate-500 uppercase">Availability</span>
                  <span className="text-xs font-bold text-green-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                    Selling Fast
                  </span>
               </div>
               <Link href={`/events/${event.id}/book`}>
                 <Button size="lg" className="w-full shadow-primary/20 shadow-md font-semibold">
                   Select Seats
                 </Button>
               </Link>
               <p className="text-[10px] text-center text-slate-500 mt-3 flex items-center justify-center">
                 <Info className="w-3 h-3 mr-1" />
                 Official Ticket Source
               </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Details Body */}
      <div className="container max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          
          {/* Description */}
          <section>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
               About Event
            </h2>
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-sm">
              <div className="prose prose-sm prose-invert max-w-none text-slate-300 leading-relaxed whitespace-pre-line">
                {event.description || "No description provided for this event."}
              </div>
            </div>
          </section>

          {/* Venue Info */}
          <section>
             <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Venue Information</h2>
             <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-sm">
               <h3 className="text-lg font-semibold text-white mb-1">{event.venue.name}</h3>
               <p className="text-slate-400 text-sm mb-4">{event.venue.location}</p>
               
               <div className="flex items-center gap-4 pt-4 border-t border-slate-800">
                  <div className="text-center px-4 py-2 bg-slate-950 rounded-lg border border-slate-800">
                     <span className="block text-xs text-slate-500 uppercase font-semibold">Capacity</span>
                     <span className="block text-lg font-mono text-white">{event.venue.capacity.toLocaleString()}</span>
                  </div>
               </div>
            </div>
          </section>
        </div>
      </div>

      {/* Mobile Floating CTA */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.3)] z-50 safe-area-bottom">
        <Link href={`/events/${event.id}/book`}>
          <Button size="lg" className="w-full font-semibold shadow-lg shadow-primary/20">
            Select Seats
          </Button>
        </Link>
      </div>
    </div>
  );
}