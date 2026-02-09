import { Skeleton } from "@/components/ui/Skeleton";

export function EventCardSkeleton() {
  return (
    <div className="flex flex-col h-full rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900">
      {/* Image Skeleton */}
      <div className="aspect-[16/9] w-full">
        <Skeleton className="h-full w-full" />
      </div>
      
      {/* Content Skeleton */}
      <div className="p-4 flex flex-col flex-1 space-y-3">
        {/* Title */}
        <Skeleton className="h-6 w-3/4" />
        
        {/* Date & Location */}
        <div className="space-y-2 mt-auto pt-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      </div>
    </div>
  );
}