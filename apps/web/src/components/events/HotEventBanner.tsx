'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Flame, Calendar, MapPin, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

interface HotEventBannerProps {
  event: {
    id: string;
    name: string;
    description: string;
    date: string;
    imageUrl?: string;
    venue: {
      name: string;
      location: string;
    };
  };
}

export const HotEventBanner = ({ event }: HotEventBannerProps) => {
  if (!event) return null;

  return (
    <div className="relative w-full overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl mb-12 group">
      {/* Background with Gradient Overlay */}
      <div className="absolute inset-0">
         {event.imageUrl && (
            <img 
              src={event.imageUrl} 
              alt={event.name} 
              className="w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-700 ease-out"
            />
         )}
         <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/95 to-transparent/10" />
      </div>

      <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row items-start md:items-center gap-8">
        
        {/* Content */}
        <div className="flex-1 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 backdrop-blur-md">
            <Flame className="w-4 h-4 fill-orange-400 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider">Trending Now</span>
          </div>

          <div>
             <h2 className="text-3xl md:text-5xl font-extrabold text-white leading-tight mb-2">
               {event.name}
             </h2>
             <p className="text-lg text-slate-400 line-clamp-2 max-w-xl">
               {event.description || "Don't miss out on this exclusive event. Tickets are selling fast!"}
             </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-slate-300">
             <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                <span className="font-medium">{format(new Date(event.date), 'MMMM do, yyyy')}</span>
             </div>
             <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                <span className="font-medium">{event.venue.name}, {event.venue.location}</span>
             </div>
          </div>

          <div className="pt-2">
             <Link href={`/events/${event.id}`}>
               <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-200 px-8 rounded-full font-bold shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] transition-all">
                 Get Tickets <ArrowRight className="ml-2 w-4 h-4" />
               </Button>
             </Link>
          </div>
        </div>
        
        {/* Visual Element (Date Sticker or similar) - Optional, maybe just keep it clean */}
      </div>
    </div>
  );
};
