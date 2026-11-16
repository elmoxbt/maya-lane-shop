// Shared between server queries and client UI (no server-only imports here)
export const sortOptions = {
  featured: "Featured",
  bestselling: "Bestselling",
  newest: "Newest",
  "price-asc": "Price: low to high",
  "price-desc": "Price: high to low",
} as const;
export type SortKey = keyof typeof sortOptions;
