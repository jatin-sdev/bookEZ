import Link from "next/link";
import { Calendar, MapPin, ArrowRight, Ticket as TicketIcon } from "lucide-react";
import { Event } from "@/types/events";

export default function FeaturedCarousel({ events }: { events: Event[] }) {
  if (events.length === 0) {
    return (
      <div className="text-center py-20 px-4 md:px-10 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl mx-4 md:mx-10">
        <TicketIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">No events scheduled</h3>
        <p className="text-slate-500 mt-2">Seed the database to see events here.</p>
      </div>
    );
  }

  return (
    <section id="events" className="mb-16 px-4 md:px-10">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Featured Drops</h3>
        <div className="flex gap-2">
          <button className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10 transition-all">
            <ArrowRight className="w-5 h-5 rotate-180" />
          </button>
          <button className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10 transition-all">
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <Link key={event.id} href={`/events/${event.id}`} className="group">
            <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden hover:border-primary/50 transition-all h-full flex flex-col">
              <div 
                className="aspect-video bg-cover bg-center relative"
                style={{ backgroundImage: `url(${event.imageUrl || 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?q=80&w=2574&auto=format&fit=crop'})` }}
              >
                <div className="absolute top-4 right-4 bg-white/90 dark:bg-black/80 backdrop-blur text-xs font-bold px-3 py-1 rounded-full border border-slate-200 dark:border-white/10">
                  {new Date(Number(event.date)).toLocaleDateString()}
                </div>
              </div>
              
              <div className="p-6 space-y-4 flex-1 flex flex-col">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors line-clamp-1">
                      {event.name}
                    </h4>
                    <p className="text-slate-500 dark:text-[#9dabb9] text-sm mt-1 line-clamp-2">
                      {event.description || "Experience the peak of live entertainment."}
                    </p>
                  </div>
                </div>

                <div className="mt-auto pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                    <MapPin className="w-3 h-3" /> {event.venue.name}
                  </div>
                  <div className="text-primary text-sm font-bold flex items-center gap-1">
                    Get Tickets <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}