import type { Metadata } from "next";
import { Suspense } from "react";
import { PackageSearch } from "lucide-react";
import Link from "next/link";
import { searchProducts } from "@/server/queries/products";
import { parseShopParams } from "@/lib/shop-params";
import { ProductGrid } from "@/components/product/product-card";
import { ShopToolbar } from "@/components/shop/shop-toolbar";
import { ShopFilters } from "@/components/shop/shop-filters";
import { ProductGridSkeleton } from "@/components/product/product-grid-skeleton";
import { CheckoutCancelledToast } from "@/components/shop/checkout-cancelled-toast";
import { categoryLabels } from "@/config/site";
import { pluralize } from "@/lib/format";

export const metadata: Metadata = {
  title: "Shop all",
  description: "Hoodies, tees, bottles, totes, training programs, meal-prep guides and Lightroom presets from Maya Lane.",
  alternates: { canonical: "/shop" },
};

export default async function ShopPage({ searchParams }: PageProps<"/shop">) {
  const params = await searchParams;
  const filters = parseShopParams(params);
  const title = filters.q
    ? `Results for “${filters.q}”`
    : filters.categories?.length === 1
      ? categoryLabels[filters.categories[0]]
      : filters.type === "DIGITAL"
        ? "Programs & digital"
        : filters.type === "PHYSICAL"
          ? "Merch"
          : "Shop all";

  return (
    <div className="container-page py-8 sm:py-12">
      <CheckoutCancelledToast />
      <header className="mb-6 sm:mb-8">
        <p className="text-xs font-bold tracking-[0.18em] text-ember-strong uppercase">Maya Lane Shop</p>
        <h1 className="mt-1 font-display text-4xl font-extrabold tracking-tight sm:text-5xl">{title}</h1>
      </header>
      <ShopToolbar initialQuery={filters.q ?? ""} sort={filters.sort ?? "featured"} />
      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[220px_1fr]">
        <aside className="hidden lg:block" aria-label="Filters">
          <ShopFilters />
        </aside>
        <Suspense key={JSON.stringify(filters)} fallback={<ProductGridSkeleton count={8} className="lg:grid-cols-3" />}>
          <Results filters={filters} />
        </Suspense>
      </div>
    </div>
  );
}

async function Results({ filters }: { filters: ReturnType<typeof parseShopParams> }) {
  const products = await searchProducts(filters);
  if (!products.length) {
    return (
      <div className="flex flex-col items-center rounded-3xl border border-dashed px-6 py-20 text-center">
        <div className="grid size-14 place-items-center rounded-full bg-muted">
          <PackageSearch className="size-6 text-muted-foreground" aria-hidden />
        </div>
        <h2 className="mt-4 font-display text-2xl font-bold">Nothing matches that (yet)</h2>
        <p className="mt-1 max-w-sm text-muted-foreground">Try a different search or clear your filters. New drops land every month.</p>
        <Link href="/shop" className="mt-6 inline-flex h-11 items-center rounded-full bg-ink px-6 text-sm font-semibold text-white">
          Clear all filters
        </Link>
      </div>
    );
  }
  return (
    <div>
      <p className="mb-4 text-sm text-muted-foreground" aria-live="polite">
        {pluralize(products.length, "product")}
      </p>
      <ProductGrid products={products} priorityCount={3} className="lg:grid-cols-3" />
    </div>
  );
}
