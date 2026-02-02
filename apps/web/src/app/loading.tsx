import { Loader2 } from "lucide-react";
import { EventCardSkeleton } from "@/components/events/EventCardSkeleton";

export default function Loading() {
  return (
    <div className="min-h-[calc(100vh-4rem)] pt-24 pb-12 bg-slate-50 dark:bg-slate-950">
      <div className="container mx-auto px-6">
        {/* Hero Skeleton */}
        <div className="w-full h-[400px] rounded-3xl bg-slate-200 dark:bg-slate-800 animate-pulse mb-12 flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-slate-400 animate-spin" />
        </div>

        {/* Filters Skeleton */}
        <div className="flex justify-between items-end mb-8">
           <div className="space-y-2">
             <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
             <div className="h-4 w-64 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
           </div>
           <div className="h-6 w-24 bg-slate-200 dark:bg-slate-800 rounded animate-pulse hidden md:block" />
        </div>

        {/* Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <EventCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}