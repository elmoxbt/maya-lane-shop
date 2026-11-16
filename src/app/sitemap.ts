export const revalidate = 3600;

import type { MetadataRoute } from "next";
import { getAllPublishedSlugs } from "@/server/queries/products";
import { absoluteUrl } from "@/lib/format";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticPages: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: absoluteUrl("/shop"), lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: absoluteUrl("/gift-guide"), lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: absoluteUrl("/about"), lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: absoluteUrl("/media-kit"), lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ];
  try {
    const products = await getAllPublishedSlugs();
    return [
      ...staticPages,
      ...products.map((p) => ({ url: absoluteUrl(`/products/${p.slug}`), lastModified: p.updatedAt, changeFrequency: "weekly" as const, priority: 0.8 })),
    ];
  } catch {
    return staticPages;
  }
}
