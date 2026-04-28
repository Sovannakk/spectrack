import { Skeleton } from "@/components/ui/skeleton";

export function PageHeaderSkeleton() {
  return (
    <div className="flex flex-col gap-4 border-b border-stone-200/40 pb-6 dark:border-stone-800/60 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <Skeleton className="h-9 w-32" />
    </div>
  );
}

export function MetricCardSkeleton() {
  return (
    <div className="glass rounded-xl p-5 space-y-3">
      <div className="flex items-center gap-2">
        <Skeleton className="h-6 w-6 rounded-md" />
        <Skeleton className="h-3 w-20" />
      </div>
      <Skeleton className="h-9 w-16" />
    </div>
  );
}

export function MetricGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <MetricCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="glass rounded-xl overflow-hidden">
      <div className="border-b border-white/40 px-4 py-2.5 dark:border-stone-800/60">
        <Skeleton className="h-3 w-24" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 border-b border-stone-100/60 px-4 py-3 last:border-0 dark:border-stone-800/60"
        >
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-3 w-40" />
          <Skeleton className="ml-auto h-3 w-16" />
          <Skeleton className="h-3 w-20" />
        </div>
      ))}
    </div>
  );
}

export function CardListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="glass rounded-xl p-5 space-y-4">
          <div className="flex items-start justify-between">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <Skeleton className="h-4 w-4 rounded" />
          </div>
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-full" />
          <div className="flex items-center gap-3 border-t border-stone-100/60 pt-3 dark:border-stone-800/60">
            <Skeleton className="h-3 w-8" />
            <Skeleton className="h-3 w-8" />
            <Skeleton className="h-3 w-8" />
            <Skeleton className="ml-auto h-3 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <PageHeaderSkeleton />
      <MetricGridSkeleton />
      <div className="glass rounded-xl p-5 space-y-3">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-32 w-full" />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="glass rounded-xl p-5 lg:col-span-2 space-y-3">
          <Skeleton className="h-4 w-32" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-7 w-7 rounded-full" />
              <Skeleton className="h-3 flex-1" />
            </div>
          ))}
        </div>
        <div className="glass rounded-xl p-5 space-y-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
        </div>
      </div>
    </div>
  );
}
