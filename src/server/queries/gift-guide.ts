import "server-only";
import { db } from "@/lib/db";
import { giftGuide } from "@/config/gift-guide";
import { variantLabel } from "@/lib/format";

/** Bundle data with a sensible default variant per product (size M / first in-stock colour). */
export async function getGiftBundles() {
  const slugs = [...new Set(giftGuide.bundles.flatMap((b) => b.productSlugs))];
  const products = await db.product.findMany({
    where: { slug: { in: slugs }, published: true },
    include: { images: { orderBy: { position: "asc" }, take: 1 }, variants: { orderBy: { position: "asc" } } },
  });
  const bySlug = new Map(products.map((p) => [p.slug, p]));

  return giftGuide.bundles.map((bundle) => {
    const items = bundle.productSlugs
      .map((slug) => bySlug.get(slug))
      .filter((p): p is NonNullable<typeof p> => Boolean(p))
      .map((p) => {
        const inStock = p.variants.filter((v) => p.type === "DIGITAL" || v.stock > 0);
        const variant = inStock.find((v) => v.size === "M") ?? inStock[0] ?? null;
        return {
          productId: p.id,
          slug: p.slug,
          name: p.name,
          type: p.type,
          imageUrl: p.images[0]?.url ?? null,
          imageAlt: p.images[0]?.alt ?? p.name,
          priceCents: variant?.priceCents ?? p.priceCents,
          variant: variant ? { id: variant.id, label: variantLabel(variant), max: p.type === "DIGITAL" ? 1 : Math.min(10, variant.stock) } : null,
          hasOptions: p.variants.length > 1,
        };
      });
    const totalCents = items.reduce((s, i) => s + i.priceCents, 0);
    return { ...bundle, items, totalCents, bundleCents: Math.round(totalCents * 0.85) };
  });
}

export type GiftBundleData = Awaited<ReturnType<typeof getGiftBundles>>[number];
