"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Calendar, MapPin, ArrowRight, Filter } from "lucide-react";
import { getEvents } from "@/lib/data";
import { Button } from "@/components/ui/Button";
import { Event } from "@/types/events";

interface EventListingProps {
  title: string;
  description: string;
  categoryFilter?: string;
}

export default function EventListingPage({ title, description, categoryFilter }: EventListingProps) {
  const [venues, setVenues] = useState<{ id: string; name: string }[]>([]);
  useEffect(() => {
     import("@/lib/data").then(module => {
        module.getVenues().then(setVenues);
     });
  }, []);

  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    startDate: '',
    venueId: '',
    minPrice: undefined as number | undefined,
    maxPrice: undefined as number | undefined,
    priceRange: '' // Helper for UI state
  });

  const handleApplyFilters = () => {
     // Re-fetch logic is inside useEffect dependent on searchQuery.
     // Ideally, we move fetchEvents out or add filters to the dependency array.
     // For this refactor, let's add filters to the effect dependency.
     // But wait, 'filters' state change should trigger re-fetch? 
     // Or only on 'Apply'?
     // The effect currently depends on [searchQuery]. Let's add [filters].
     // However, to prevent premature fetching on every keystroke (if we wired onChange directly),
     // we might want a separate 'appliedFilters' state.
     // For simplicity: We will trigger fetch when 'Apply' is clicked by updating a trigger or deps.
     setTriggerFetch(prev => prev + 1);
  };
  
  const [triggerFetch, setTriggerFetch] = useState(0);

  useEffect(() => {
    async function fetchEvents() {
      setLoading(true);
      // Pass filters to data fetching
      const allEvents = await getEvents({
         startDate: filters.startDate || undefined,
         venueId: filters.venueId || undefined,
         minPrice: filters.minPrice,
         maxPrice: filters.maxPrice
      });
      
      // Client-side generic search filter (keep existing behavior)
      let filteredEvents = allEvents;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filteredEvents = allEvents.filter(event => 
          event.name.toLowerCase().includes(query) ||
          event.description?.toLowerCase().includes(query) ||
          event.venue.name.toLowerCase().includes(query) ||
          event.venue.location.toLowerCase().includes(query)
        );
      }
      
      setEvents(filteredEvents);
      setLoading(false);
    }
    
    fetchEvents();
  }, [searchQuery, triggerFetch]); // Re-run when search or manual trigger changes

  // ... (render)



  return (
    <div className="min-h-screen bg-slate-950 pt-20 pb-12 px-4 md:px-6">
      <div className="max-w-[1400px] mx-auto">
        
        {/* Header & Controls */}
        <div className="mb-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
                {title}
              </h1>
              <p className="text-slate-400 max-w-2xl text-sm">
                {description}
              </p>
            </div>
          </div>

          {/* Compact Filter Bar */}
          <div className="flex flex-wrap items-center gap-3 bg-slate-900/50 p-3 rounded-lg border border-slate-700/50 backdrop-blur-sm">
             <div className="flex items-center gap-2">
                 <Filter className="w-4 h-4 text-slate-500" />
                 <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-2">Filters</span>
             </div>
             
             {/* 1. Date Filter */}
             <input 
                 type="date" 
                 value={filters.startDate}
                 className="bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-300 focus:border-primary focus:ring-1 focus:ring-primary/50 outline-none h-8"
                 onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))} 
             />
 
             {/* 2. Venue Filter */}
             <select 
                 value={filters.venueId}
                 onChange={(e) => setFilters(prev => ({ ...prev, venueId: e.target.value }))}
                 className="bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-300 focus:border-primary focus:ring-1 focus:ring-primary/50 outline-none h-8 min-w-[140px]"
             >
                 <option value="">All Venues</option>
                 {venues.map(v => (
                     <option key={v.id} value={v.id}>{v.name}</option>
                 ))}
             </select>
 
             {/* 3. Price Filter */}
             <select 
                 value={filters.priceRange}
                 onChange={(e) => {
                     const val = e.target.value;
                     let min: number | undefined, max: number | undefined;
                     // Values are in RUPEES, Backend expects PAISE (x100)
                     if (val === '0-500') { min = 0; max = 500 * 100; }
                     else if (val === '500-1000') { min = 500 * 100; max = 1000 * 100; }
                     else if (val === '1000-5000') { min = 1000 * 100; max = 5000 * 100; }
                     else if (val === '5000+') { min = 5000 * 100; }
                     
                     setFilters(prev => ({ ...prev, priceRange: val, minPrice: min, maxPrice: max }));
                 }}
                 className="bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-300 focus:border-primary focus:ring-1 focus:ring-primary/50 outline-none h-8 min-w-[120px]"
             >
                 <option value="">Any Price</option>
                 <option value="0-500">Under ₹500</option>
                 <option value="500-1000">₹500 - ₹1000</option>
                 <option value="1000-5000">₹1000 - ₹5000</option>
                 <option value="5000+">Over ₹5000</option>
             </select>
 
             <div className="ml-auto flex items-center gap-2">
                <Button variant="primary" size="sm" onClick={handleApplyFilters} className="h-8 px-4 text-xs">
                    Apply
                </Button>
                
                {(filters.startDate || filters.venueId || filters.priceRange) && (
                  <Button variant="ghost" size="sm" onClick={() => {
                      setFilters({ startDate: '', venueId: '', minPrice: undefined, maxPrice: undefined, priceRange: '' });
                      setTriggerFetch(prev => prev + 1);
                  }} className="h-8 text-xs text-slate-500 hover:text-slate-300">
                      Clear
                  </Button>
                )}
             </div>
          </div>
          
           {searchQuery && (
            <div className="text-xs text-slate-500">
              Results for <span className="text-slate-300 font-medium">"{searchQuery}"</span>
            </div>
           )}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {loading ? (
            // Loading skeleton
            <>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="bg-slate-900/50 border border-slate-700 rounded-xl aspect-[3/4] animate-pulse" />
              ))}
            </>
          ) : events.length > 0 ? (
            events.map((event) => (
              <Link key={event.id} href={`/events/${event.id}`} className="group block h-full">
                <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden hover:border-slate-700 transition-all duration-300 h-full flex flex-col group-hover:shadow-lg group-hover:shadow-primary/5">
                  {/* Image */}
                  <div className="relative aspect-video overflow-hidden bg-slate-800">
                    <div 
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                      style={{ backgroundImage: `url(${event.imageUrl || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&q=80'})` }}
                    />
                    <div className="absolute top-2 left-2">
                       <span className="bg-slate-950/90 backdrop-blur text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border border-white/10 shadow-sm">
                           {categoryFilter || "Event"}
                       </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4 flex flex-col flex-1">
                    <div className="mb-3">
                      <div className="text-primary text-xs font-semibold mb-1 flex items-center gap-1.5">
                          <Calendar className="w-3 h-3" />
                          {(() => {
                            const rawDate = event.date;
                            const dateObj = !isNaN(Number(rawDate)) ? new Date(Number(rawDate)) : new Date(rawDate);
                            if (isNaN(dateObj.getTime())) return "TBA";
                            return dateObj.toLocaleDateString(undefined, { 
                              weekday: 'short', month: 'short', day: 'numeric',
                              hour: 'numeric', minute: '2-digit'
                            });
                          })()}
                      </div>
                      <h3 className="text-base font-bold text-white leading-tight group-hover:text-primary transition-colors line-clamp-2">
                        {event.name}
                      </h3>
                    </div>
                    
                    <div className="mt-auto pt-3 border-t border-slate-700/50 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium truncate max-w-[70%]">
                        <MapPin className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{event.venue.name}</span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full py-16 text-center border border-dashed border-slate-700 rounded-2xl bg-slate-900/30">
               <p className="text-slate-500 text-sm">
                 {searchQuery ? `No events found for "${searchQuery}"` : "No events available."}
               </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}