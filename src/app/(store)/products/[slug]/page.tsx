import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Download, RotateCcw, ShieldCheck, Truck } from "lucide-react";
import { auth } from "@/auth";
import { getProductBySlug, getProductReviews, getRelatedProducts } from "@/server/queries/products";
import { ProductGallery } from "@/components/product/product-gallery";
import { AddToCartForm } from "@/components/product/add-to-cart-form";
import { ReviewsSection } from "@/components/product/reviews-section";
import { ProductGrid } from "@/components/product/product-card";
import { SectionHeading } from "@/components/common/section-heading";
import { Price } from "@/components/product/price";
import { Stars } from "@/components/product/stars";
import { JsonLd } from "@/components/common/json-ld";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { categoryLabels, siteConfig } from "@/config/site";
import { absoluteUrl, formatPrice } from "@/lib/format";

export async function generateMetadata({ params }: PageProps<"/products/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product not found" };
  const image = product.images[0];
  return {
    title: product.name,
    description: `${product.tagline} ${product.description.slice(0, 120)}…`,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      type: "website",
      title: `${product.name} · ${formatPrice(product.priceCents)}`,
      description: product.tagline,
      url: `/products/${product.slug}`,
      images: image ? [{ url: image.url.replace("w=1400", "w=1200&h=630"), width: 1200, height: 630, alt: image.alt }] : undefined,
    },
  };
}

export default async function ProductPage({ params }: PageProps<"/products/[slug]">) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [reviews, related, session] = await Promise.all([getProductReviews(product.id), getRelatedProducts(product), auth()]);
  const digital = product.type === "DIGITAL";
  const inStock = digital || product.variants.some((v) => v.stock > 0);
  const asset = product.digitalAssets[0];

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.name,
          description: product.description,
          image: product.images.map((i) => i.url),
          sku: product.variants[0]?.sku,
          brand: { "@type": "Brand", name: siteConfig.creator },
          category: categoryLabels[product.category],
          offers: {
            "@type": "AggregateOffer",
            priceCurrency: "USD",
            lowPrice: (Math.min(...product.variants.map((v) => v.priceCents ?? product.priceCents)) / 100).toFixed(2),
            highPrice: (Math.max(...product.variants.map((v) => v.priceCents ?? product.priceCents)) / 100).toFixed(2),
            offerCount: product.variants.length,
            availability: inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            url: absoluteUrl(`/products/${product.slug}`),
          },
          ...(reviews.average != null && {
            aggregateRating: { "@type": "AggregateRating", ratingValue: reviews.average, reviewCount: reviews.count },
            review: reviews.reviews.slice(0, 5).map((r) => ({
              "@type": "Review",
              reviewRating: { "@type": "Rating", ratingValue: r.rating, bestRating: 5 },
              author: { "@type": "Person", name: r.authorName },
              name: r.title,
              reviewBody: r.body,
              datePublished: r.createdAt.toISOString().slice(0, 10),
            })),
          }),
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Shop", item: absoluteUrl("/shop") },
            { "@type": "ListItem", position: 2, name: categoryLabels[product.category], item: absoluteUrl(`/shop?category=${product.category}`) },
            { "@type": "ListItem", position: 3, name: product.name },
          ],
        }}
      />

      <div className="container-page pt-4 pb-6 sm:pt-6">
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
            <li>
              <Link href="/shop" className="hover:text-foreground">
                Shop
              </Link>
            </li>
            <ChevronRight className="size-3.5" aria-hidden />
            <li>
              <Link href={`/shop?category=${product.category}`} className="hover:text-foreground">
                {categoryLabels[product.category]}
              </Link>
            </li>
            <ChevronRight className="size-3.5" aria-hidden />
            <li aria-current="page" className="truncate text-foreground">
              {product.name}
            </li>
          </ol>
        </nav>
      </div>

      <div className="container-page grid grid-cols-1 gap-8 pb-14 lg:grid-cols-[1.15fr_1fr] lg:gap-14">
        <ProductGallery images={product.images} name={product.name} />
        <div className="lg:sticky lg:top-24 lg:self-start">
          {product.badge && <p className="mb-3 inline-block rounded-full bg-ember-soft px-3 py-1 text-xs font-bold tracking-wide text-ember-strong uppercase">{product.badge}</p>}
          <h1 className="font-display text-3xl leading-[1.05] font-extrabold tracking-tight text-balance sm:text-4xl lg:text-5xl">{product.name}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
            <Price cents={product.priceCents} compareAt={product.compareAtCents} size="lg" />
            {reviews.average != null && (
              <a href="#reviews" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                <Stars rating={reviews.average} /> {reviews.average.toFixed(1)} ({reviews.count})
              </a>
            )}
          </div>
          <p className="mt-4 text-lg text-pretty">{product.tagline}</p>

          <div className="mt-8">
            <AddToCartForm
              product={{ id: product.id, slug: product.slug, name: product.name, type: product.type, priceCents: product.priceCents, imageUrl: product.images[0]?.url ?? null }}
              variants={product.variants.map((v) => ({ id: v.id, size: v.size, color: v.color, colorHex: v.colorHex, stock: v.stock, priceCents: v.priceCents }))}
            />
          </div>

          <ul className="mt-8 grid grid-cols-3 gap-2 text-center text-xs text-muted-foreground">
            {(digital
              ? [
                  [Download, "Instant download"],
                  [ShieldCheck, "Secure checkout"],
                  [RotateCcw, "Lifetime re-downloads"],
                ]
              : [
                  [Truck, "Ships in 1–2 days"],
                  [RotateCcw, "30-day returns"],
                  [ShieldCheck, "Secure checkout"],
                ]
            ).map(([Icon, label]) => {
              const I = Icon as typeof Truck;
              return (
                <li key={label as string} className="flex flex-col items-center gap-1.5 rounded-2xl bg-paper px-2 py-3">
                  <I className="size-5 text-foreground" aria-hidden />
                  {label as string}
                </li>
              );
            })}
          </ul>

          <Accordion type="multiple" defaultValue={["description"]} className="mt-8 border-t">
            <AccordionItem value="description">
              <AccordionTrigger className="py-5 text-base font-semibold">From Maya</AccordionTrigger>
              <AccordionContent className="text-base leading-relaxed text-pretty text-foreground/85">{product.description}</AccordionContent>
            </AccordionItem>
            <AccordionItem value="details">
              <AccordionTrigger className="py-5 text-base font-semibold">{digital ? "What's inside" : "Details & care"}</AccordionTrigger>
              <AccordionContent>
                <ul className="list-disc space-y-1.5 pl-5 text-base text-foreground/85">
                  {product.details.map((d) => (
                    <li key={d}>{d}</li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="delivery">
              <AccordionTrigger className="py-5 text-base font-semibold">{digital ? "How you'll get it" : "Shipping & returns"}</AccordionTrigger>
              <AccordionContent className="text-base leading-relaxed text-foreground/85">
                {digital ? (
                  <>
                    Right after checkout you&apos;ll get a secure download link on the confirmation page and in your email
                    {asset ? ` (${asset.mimeType === "application/zip" ? "ZIP" : "PDF"}, ${(asset.sizeBytes / 1024).toFixed(0)} KB)` : ""}. Links expire after 72
                    hours for security, and you can grab fresh ones from your account anytime.
                  </>
                ) : (
                  <>
                    Standard shipping is {formatPrice(siteConfig.shipping.standardCents)} (3–6 business days) and free on orders over{" "}
                    {formatPrice(siteConfig.shipping.freeThresholdCents)}. Express is {formatPrice(siteConfig.shipping.expressCents)} (1–2 business days). Unworn items
                    can be returned within 30 days.
                  </>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>

      <div className="container-page">
        <ReviewsSection productId={product.id} slug={product.slug} data={reviews} signedIn={Boolean(session?.user)} />
      </div>

      {related.length > 0 && (
        <section aria-labelledby="related-heading" className="container-page border-t py-14 sm:py-20">
          <SectionHeading title="You might also love" />
          <span id="related-heading" className="sr-only">
            Related products
          </span>
          <ProductGrid products={related} />
        </section>
      )}
    </>
  );
}
