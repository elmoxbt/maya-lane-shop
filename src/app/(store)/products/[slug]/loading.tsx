import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container-page grid grid-cols-1 gap-8 py-8 lg:grid-cols-[1.15fr_1fr] lg:gap-14" aria-busy="true" aria-label="Loading product">
      <Skeleton className="aspect-[4/5] w-full rounded-3xl" />
      <div className="space-y-4">
        <Skeleton className="h-12 w-4/5" />
        <Skeleton className="h-7 w-1/4" />
        <Skeleton className="h-5 w-full" />
        <div className="flex gap-2 pt-6">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="size-10 rounded-full" />
          ))}
        </div>
        <div className="grid grid-cols-5 gap-2 pt-2">
          {Array.from({ length: 5 }, (_, i) => (
            <Skeleton key={i} className="h-12 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-12 w-full rounded-full" />
      </div>
    </div>
  );
}
