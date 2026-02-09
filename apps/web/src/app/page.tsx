import { fetchServer } from '@/lib/fetchers';
import { gql } from 'graphql-request';
import { EventCard } from '@/components/events/EventCard';
import { HotEventBanner } from '@/components/events/HotEventBanner';
import { ReloadButton } from '@/components/ui/ReloadButton';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { ArrowRight, Ticket } from 'lucide-react';

// Query for the homepage
export const dynamic = 'force-dynamic';
const GET_EVENTS = gql`
  query GetPublicEvents {
    hotEvent {
      id
      name
      date
      description
      imageUrl
      venue {
        name
        location
      }
    }
    events {
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

export default async function HomePage() {
  let events = [];
  let hotEvent = null;
  let error = null;

  try {
    const data: any = await fetchServer(GET_EVENTS);
    events = data?.events || [];
    hotEvent = data?.hotEvent;
  } catch (err) {
    console.error("Failed to fetch homepage events:", err);
    error = "Unable to load events at this time.";
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Hero Section */}
      <section className="bg-slate-900 text-white py-20 relative overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
              Experience it <span className="text-primary">Live.</span>
            </h1>
            <p className="text-lg text-slate-300 mb-8 leading-relaxed max-w-lg">
              Secure your seats for the biggest concerts, sports games, and theater shows. 
              Real-time booking, instant delivery, zero bots.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/events">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-white border-none rounded-full px-8">
                  Browse Events
                </Button>
              </Link>
              <Link href="/about">
                 <Button size="lg" variant="outline" className="text-white border-white/20 hover:bg-white/10 rounded-full px-8">
                   How it works
                 </Button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Abstract Background Decoration */}
        <div className="absolute top-0 right-0 w-full md:w-2/3 h-full bg-gradient-to-l from-primary/20 via-blue-900/20 to-transparent pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-primary/20 blur-3xl rounded-full pointer-events-none" />
      </section>

      {/* Featured Events */}
      <section className="py-16 container mx-auto px-6">
        {/* Hot Event Highland */}
        {error ? null : hotEvent && <HotEventBanner event={hotEvent} />}
        
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white">Trending Now</h2>
            <p className="text-slate-400 mt-1">Don't miss out on these selling-fast events</p>
          </div>
          <Link href="/events" className="text-primary font-medium hover:underline hidden md:flex items-center gap-1">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {error ? (
          <div className="text-center py-12 bg-slate-900 rounded-2xl border border-slate-700">
            <p className="text-slate-500">{error}</p>
            <ReloadButton />
          </div>
        ) : events.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {events.slice(0, 4).map((event: any) => (
              <EventCard 
                key={event.id}
                {...event}
                // In a real app, you'd fetch minPrice from the API
                minPrice={event.minPrice || 5000} 
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border-2 border-dashed border-slate-700 rounded-2xl">
             <Ticket className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white">No events currently scheduled</h3>
             <p className="text-slate-400 mt-2">Check back soon for new drops.</p>
          </div>
        )}
        
        <div className="mt-8 text-center md:hidden">
           <Link href="/events" className="text-primary font-medium hover:underline inline-flex items-center gap-1">
            View All Events <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Trust Signals */}
      <section className="bg-slate-900/50 py-16 border-y border-slate-700">
        <div className="container mx-auto px-6 text-center">
           <h2 className="text-2xl font-bold mb-12 text-white">Why TicketForge?</h2>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-6 bg-slate-900 rounded-xl shadow-sm border border-slate-700">
                 <div className="w-12 h-12 bg-blue-900/30 text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
                   <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                   </svg>
                 </div>
                 <h3 className="font-semibold mb-2 text-white">Secure Booking</h3>
                 <p className="text-slate-400 text-sm">Encrypted transactions and guaranteed authentic tickets.</p>
              </div>
              <div className="p-6 bg-slate-900 rounded-xl shadow-sm border border-slate-700">
                 <div className="w-12 h-12 bg-green-900/30 text-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
                   <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                   </svg>
                 </div>
                 <h3 className="font-semibold mb-2 text-white">Instant Delivery</h3>
                 <p className="text-slate-400 text-sm">Tickets are delivered to your digital wallet immediately.</p>
              </div>
              <div className="p-6 bg-slate-900 rounded-xl shadow-sm border border-slate-700">
                 <div className="w-12 h-12 bg-purple-900/30 text-purple-400 rounded-full flex items-center justify-center mx-auto mb-4">
                   <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                   </svg>
                 </div>
                 <h3 className="font-semibold mb-2 text-white">Interactive Maps</h3>
                 <p className="text-slate-400 text-sm">Pick your exact seat with our real-time venue designer.</p>
              </div>
           </div>
        </div>
      </section>
    </div>
  );
}