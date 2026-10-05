import { Skeleton } from "@/components/ui/skeleton";

export function CartSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px] xl:grid-cols-[1fr_420px]">
      {/* Items list skeleton */}
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex flex-col sm:flex-row gap-4 rounded-xl border border-border p-4"
          >
            <Skeleton className="size-20 sm:size-24 rounded-lg shrink-0" />
            <div className="flex-1 space-y-2.5">
              <Skeleton className="h-5 w-2/3" />
              <div className="flex gap-2">
                <Skeleton className="h-4 w-16 rounded-md" />
                <Skeleton className="h-4 w-16 rounded-md" />
              </div>
              <Skeleton className="h-4 w-20" />
            </div>
            <div className="flex items-center justify-between sm:flex-col sm:items-end sm:justify-center gap-3">
              <Skeleton className="h-8 w-24 rounded-lg" />
              <Skeleton className="h-5 w-16" />
            </div>
          </div>
        ))}
      </div>

      {/* Summary card skeleton */}
      <div className="rounded-2xl border border-border p-6 space-y-5">
        <Skeleton className="h-6 w-36" />
        <Skeleton className="h-16 w-full rounded-xl" />
        <div className="space-y-3 pt-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        <Skeleton className="h-9 w-full rounded-lg" />
        <Skeleton className="h-12 w-full rounded-lg" />
      </div>
    </div>
  );
}

