import { Skeleton } from "@/components/ui/skeleton";
import { ProductGridSkeleton } from "@/components/product/product-grid-skeleton";

export default function Loading() {
  return (
    <div className="container-page py-8 sm:py-12">
      <Skeleton className="h-4 w-28" />
      <Skeleton className="mt-2 h-12 w-56" />
      <Skeleton className="mt-8 h-12 w-full rounded-full" />
      <ProductGridSkeleton count={8} className="mt-8" />
    </div>
  );
}
