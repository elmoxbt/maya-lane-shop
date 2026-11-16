import { z } from "zod";
import { sortOptions } from "@/server/queries/sort-options";
import type { ShopFilters } from "@/server/queries/products";

const categories = ["APPAREL", "ACCESSORIES", "GUIDES", "PRESETS"] as const;

export const priceRanges = [
  { id: "under-25", label: "Under $25", min: undefined, max: 25 },
  { id: "25-50", label: "$25 – $50", min: 25, max: 50 },
  { id: "50-plus", label: "$50 and up", min: 50, max: undefined },
] as const;

const schema = z.object({
  q: z.string().trim().max(80).optional().catch(undefined),
  category: z
    .union([z.enum(categories), z.array(z.enum(categories))])
    .optional()
    .transform((v) => (v == null ? [] : Array.isArray(v) ? v : [v]))
    .catch([]),
  type: z.enum(["PHYSICAL", "DIGITAL"]).optional().catch(undefined),
  price: z.enum(priceRanges.map((p) => p.id) as [string, ...string[]]).optional().catch(undefined),
  sort: z.enum(Object.keys(sortOptions) as [keyof typeof sortOptions, ...(keyof typeof sortOptions)[]]).optional().catch(undefined),
});

export function parseShopParams(params: Record<string, string | string[] | undefined>): ShopFilters & { price?: string } {
  const p = schema.parse(params);
  const range = priceRanges.find((r) => r.id === p.price);
  return { q: p.q || undefined, categories: p.category, type: p.type, minPrice: range?.min, maxPrice: range?.max, sort: p.sort, price: p.price };
}
