import "server-only";
import { cache } from "react";
import { db } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";
import type { Category, ProductType } from "@/generated/prisma/enums";

const cardInclude = {
  images: { orderBy: { position: "asc" }, take: 2 },
  variants: { select: { id: true, stock: true, color: true, colorHex: true, size: true, priceCents: true }, orderBy: { position: "asc" } },
} satisfies Prisma.ProductInclude;

type CardRow = Prisma.ProductGetPayload<{ include: typeof cardInclude }>;

export type ProductCardData = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  type: ProductType;
  category: Category;
  priceCents: number;
  compareAtCents: number | null;
  badge: string | null;
  images: { url: string; alt: string }[];
  colors: { name: string; hex: string }[];
  inStock: boolean;
  rating: number | null;
  reviewCount: number;
  /** Used for quick add when the product has a single variant */
  defaultVariantId: string | null;
  defaultVariantMax: number;
};

async function ratingsFor(productIds: string[]) {
  if (!productIds.length) return new Map<string, { avg: number; count: number }>();
  const rows = await db.review.groupBy({
    by: ["productId"],
    where: { productId: { in: productIds } },
    _avg: { rating: true },
    _count: { _all: true },
  });
  return new Map(rows.map((r) => [r.productId, { avg: r._avg.rating ?? 0, count: r._count._all }]));
}

async function toCards(rows: CardRow[]): Promise<ProductCardData[]> {
  const ratings = await ratingsFor(rows.map((r) => r.id));
  return rows.map((p) => {
    const colors = new Map<string, string>();
    for (const v of p.variants) if (v.color && v.colorHex) colors.set(v.color, v.colorHex);
    const r = ratings.get(p.id);
    return {
      id: p.id,
      slug: p.slug,
      name: p.name,
      tagline: p.tagline,
      type: p.type,
      category: p.category,
      priceCents: p.priceCents,
      compareAtCents: p.compareAtCents,
      badge: p.badge,
      images: p.images.map((i) => ({ url: i.url, alt: i.alt })),
      colors: [...colors].map(([name, hex]) => ({ name, hex })),
      inStock: p.type === "DIGITAL" || p.variants.some((v) => v.stock > 0),
      rating: r ? Math.round(r.avg * 10) / 10 : null,
      reviewCount: r?.count ?? 0,
      defaultVariantId: p.variants.length === 1 ? p.variants[0].id : null,
      defaultVariantMax: p.type === "DIGITAL" ? 1 : Math.min(10, p.variants[0]?.stock ?? 0),
    };
  });
}

export const getFeaturedProducts = cache(async (limit = 4) => {
  const rows = await db.product.findMany({
    where: { published: true, featured: true },
    include: cardInclude,
    orderBy: { salesCount: "desc" },
    take: limit,
  });
  return toCards(rows);
});

export const getBestsellers = cache(async (limit = 4) => {
  const rows = await db.product.findMany({
    where: { published: true },
    include: cardInclude,
    orderBy: { salesCount: "desc" },
    take: limit,
  });
  return toCards(rows);
});

export const getGiftGuideProducts = cache(async () => {
  const rows = await db.product.findMany({
    where: { published: true, inGiftGuide: true },
    include: cardInclude,
    orderBy: { salesCount: "desc" },
  });
  return toCards(rows);
});

export const getProductsBySlugs = cache(async (slugs: string[]) => {
  const rows = await db.product.findMany({ where: { published: true, slug: { in: slugs } }, include: cardInclude });
  const cards = await toCards(rows);
  return slugs.map((s) => cards.find((c) => c.slug === s)).filter((c): c is ProductCardData => Boolean(c));
});

import type { SortKey } from "./sort-options";
export { sortOptions, type SortKey } from "./sort-options";

export type ShopFilters = {
  q?: string;
  categories?: Category[];
  type?: ProductType;
  minPrice?: number;
  maxPrice?: number;
  sort?: SortKey;
};

export async function searchProducts(filters: ShopFilters) {
  const where: Prisma.ProductWhereInput = { published: true };
  if (filters.q) {
    where.OR = [
      { name: { contains: filters.q, mode: "insensitive" } },
      { tagline: { contains: filters.q, mode: "insensitive" } },
      { description: { contains: filters.q, mode: "insensitive" } },
    ];
  }
  if (filters.categories?.length) where.category = { in: filters.categories };
  if (filters.type) where.type = filters.type;
  if (filters.minPrice != null || filters.maxPrice != null) {
    where.priceCents = {
      ...(filters.minPrice != null ? { gte: filters.minPrice * 100 } : {}),
      ...(filters.maxPrice != null ? { lte: filters.maxPrice * 100 } : {}),
    };
  }
  const orderBy: Prisma.ProductOrderByWithRelationInput[] = (() => {
    switch (filters.sort) {
      case "bestselling":
        return [{ salesCount: "desc" }];
      case "newest":
        return [{ createdAt: "desc" }];
      case "price-asc":
        return [{ priceCents: "asc" }];
      case "price-desc":
        return [{ priceCents: "desc" }];
      default:
        return [{ featured: "desc" }, { salesCount: "desc" }];
    }
  })();
  const rows = await db.product.findMany({ where, include: cardInclude, orderBy });
  return toCards(rows);
}

export const getProductBySlug = cache(async (slug: string) => {
  const product = await db.product.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { position: "asc" } },
      variants: { orderBy: { position: "asc" } },
      digitalAssets: { select: { id: true, name: true, mimeType: true, sizeBytes: true } },
    },
  });
  if (!product || !product.published) return null;
  return product;
});

export type ProductDetail = NonNullable<Awaited<ReturnType<typeof getProductBySlug>>>;

export const getProductReviews = cache(async (productId: string) => {
  const [reviews, agg, dist] = await Promise.all([
    db.review.findMany({ where: { productId }, orderBy: { createdAt: "desc" }, take: 20 }),
    db.review.aggregate({ where: { productId }, _avg: { rating: true }, _count: { _all: true } }),
    db.review.groupBy({ by: ["rating"], where: { productId }, _count: { _all: true } }),
  ]);
  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: dist.find((d) => d.rating === star)?._count._all ?? 0,
  }));
  return {
    reviews,
    average: agg._avg.rating ? Math.round(agg._avg.rating * 10) / 10 : null,
    count: agg._count._all,
    distribution,
  };
});

export async function getRelatedProducts(product: { id: string; category: Category; type: ProductType }, limit = 4) {
  const rows = await db.product.findMany({
    where: { published: true, id: { not: product.id }, OR: [{ category: product.category }, { type: product.type }] },
    include: cardInclude,
    orderBy: { salesCount: "desc" },
    take: limit,
  });
  if (rows.length < limit) {
    const extra = await db.product.findMany({
      where: { published: true, id: { notIn: [product.id, ...rows.map((r) => r.id)] } },
      include: cardInclude,
      orderBy: { salesCount: "desc" },
      take: limit - rows.length,
    });
    rows.push(...extra);
  }
  return toCards(rows);
}

export async function getAllPublishedSlugs() {
  return db.product.findMany({ where: { published: true }, select: { slug: true, updatedAt: true } });
}
