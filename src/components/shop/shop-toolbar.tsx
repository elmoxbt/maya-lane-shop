"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Search, SlidersHorizontal, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ShopFilters } from "./shop-filters";
import { useQueryParams } from "@/hooks/use-query-params";
import { sortOptions } from "@/server/queries/sort-options";

export function ShopToolbar({ initialQuery, sort }: { initialQuery: string; sort: string }) {
  const { params, update, pending } = useQueryParams();
  const [q, setQ] = useState(initialQuery);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const activeFilters = params.getAll("category").length + (params.get("type") ? 1 : 0) + (params.get("price") ? 1 : 0);

  useEffect(() => {
    if (params.get("focus") === "search") inputRef.current?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (q === initialQuery) return;
    const t = setTimeout(() => update({ q: q.trim() || null }), 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <form role="search" className="relative flex-1" onSubmit={(e) => (e.preventDefault(), update({ q: q.trim() || null }))}>
        <label htmlFor="shop-search" className="sr-only">
          Search products
        </label>
        <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <input
          ref={inputRef}
          id="shop-search"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search hoodies, programs, presets…"
          className="h-12 w-full rounded-full border border-input bg-white pr-11 pl-11 text-base outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ember [&::-webkit-search-cancel-button]:hidden"
        />
        {pending ? (
          <Loader2 className="absolute top-1/2 right-4 size-4 -translate-y-1/2 animate-spin text-muted-foreground" aria-label="Loading" />
        ) : q ? (
          <button type="button" onClick={() => setQ("")} className="absolute top-1/2 right-2 grid size-8 -translate-y-1/2 place-items-center rounded-full hover:bg-muted" aria-label="Clear search">
            <X className="size-4" aria-hidden />
          </button>
        ) : null}
      </form>
      <div className="flex gap-2">
        <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
          <SheetTrigger className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full border border-input bg-white px-5 text-sm font-semibold lg:hidden">
            <SlidersHorizontal className="size-4" aria-hidden /> Filters
            {activeFilters > 0 && <span className="grid size-5 place-items-center rounded-full bg-ember text-[11px] text-ink">{activeFilters}</span>}
          </SheetTrigger>
          <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto rounded-t-3xl px-6 pb-10">
            <SheetHeader className="px-0">
              <SheetTitle className="font-display text-2xl font-bold">Filters</SheetTitle>
              <SheetDescription className="sr-only">Narrow down products</SheetDescription>
            </SheetHeader>
            <ShopFilters />
            <button type="button" onClick={() => setFiltersOpen(false)} className="mt-8 h-12 w-full rounded-full bg-ink font-semibold text-white">
              Show results
            </button>
          </SheetContent>
        </Sheet>
        <Select value={sort} onValueChange={(v) => update({ sort: v === "featured" ? null : v })}>
          <SelectTrigger className="h-12! flex-1 rounded-full bg-white px-5 font-semibold sm:w-56 sm:flex-none" aria-label="Sort products">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(sortOptions).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
