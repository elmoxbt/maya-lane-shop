import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Gift, Snowflake, Truck, Zap } from "lucide-react";
import { getGiftBundles } from "@/server/queries/gift-guide";
import { getProductsBySlugs } from "@/server/queries/products";
import { giftGuide } from "@/config/gift-guide";
import { siteConfig } from "@/config/site";
import { Countdown } from "@/components/common/countdown";
import { SectionHeading } from "@/components/common/section-heading";
import { ProductGrid } from "@/components/product/product-card";
import { AddBundleButton } from "@/components/gift-guide/add-bundle-button";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = {
  title: "Holiday Gift Guide 2026",
  description: "Maya's curated holiday gift bundles: gym bestie kits, Sunday reset sets and creator starter packs. Save 15% on bundles.",
  alternates: { canonical: "/gift-guide" },
  openGraph: { title: "Maya Lane's Holiday Gift Guide 2026", description: "Gifts they'll actually use. Save 15% on curated bundles." },
};

export default async function GiftGuidePage() {
  const [bundles, underFifty, stockingStuffers] = await Promise.all([
    getGiftBundles(),
    getProductsBySlugs(giftGuide.underFifty),
    getProductsBySlugs(giftGuide.stockingStuffers),
  ]);

  return (
    <>
      {/* Seasonal banner */}
      <section className="relative overflow-hidden bg-ink text-white">
        <div className="pointer-events-none absolute inset-0 opacity-[0.07]" aria-hidden style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "22px 22px" }} />
        <div className="absolute -bottom-40 -left-20 size-[28rem] rounded-full bg-ember/40 blur-3xl" aria-hidden />
        <Snowflake className="absolute top-10 right-[8%] size-16 rotate-12 text-white/10" aria-hidden />
        <Snowflake className="absolute right-[30%] bottom-12 size-8 text-white/10" aria-hidden />
        <div className="container-page relative grid grid-cols-1 gap-10 py-14 sm:py-20 lg:grid-cols-[1.3fr_1fr] lg:items-center lg:py-24">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-ember px-3 py-1 text-xs font-bold tracking-[0.18em] text-ink uppercase">
              <Gift className="size-3.5" aria-hidden /> {giftGuide.eyebrow}
            </p>
            <h1 className="mt-5 font-display text-5xl leading-[0.95] font-extrabold tracking-tight text-balance sm:text-7xl">{giftGuide.title}</h1>
            <p className="mt-5 max-w-xl text-lg text-white/75">{giftGuide.intro}</p>
          </div>
          <div className="rounded-3xl bg-white/[0.07] p-6 ring-1 ring-white/10 backdrop-blur">
            <p className="flex items-center gap-2 font-semibold">
              <Truck className="size-5 text-ember" aria-hidden /> Holiday shipping cutoff
            </p>
            <p className="mt-1 text-sm text-white/70">Order by Wednesday, December 17 for standard delivery before the 25th.</p>
            <Countdown target={siteConfig.holidayCutoff} className="mt-5" />
            <p className="mt-5 flex items-center gap-2 text-sm text-white/70">
              <Zap className="size-4 text-ember" aria-hidden /> Missed it? Digital gifts arrive instantly, even on Christmas morning.
            </p>
          </div>
        </div>
      </section>

      {/* Bundles */}
      <section aria-labelledby="bundles-heading" className="container-page py-16 sm:py-24">
        <SectionHeading eyebrow="Curated bundles" title="Wrapped up and ready to gift" description="Every bundle gets 15% off automatically. Sizes default to M and can be swapped on each product page." />
        <span id="bundles-heading" className="sr-only">
          Gift bundles
        </span>
        <div className="space-y-6">
          {bundles.map((b, idx) => (
            <article key={b.id} id={b.id} className="scroll-mt-24 overflow-hidden rounded-[2rem] border bg-white lg:grid lg:grid-cols-[1.1fr_1fr]">
              <div className={`grid grid-cols-3 gap-1.5 bg-paper p-1.5 ${idx % 2 ? "lg:order-2" : ""}`}>
                {b.items.map((i) => (
                  <Link key={i.slug} href={`/products/${i.slug}`} className="group relative aspect-[3/4] overflow-hidden rounded-3xl bg-muted lg:aspect-auto lg:min-h-80">
                    {i.imageUrl && <Image src={i.imageUrl} alt={i.imageAlt} fill sizes="(min-width: 1024px) 18vw, 33vw" className="object-cover transition duration-500 group-hover:scale-105" />}
                  </Link>
                ))}
              </div>
              <div className="flex flex-col p-6 sm:p-10">
                <p className="text-sm font-semibold text-ember-strong">{b.forWho}</p>
                <h2 className="mt-1 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">{b.title}</h2>
                <p className="mt-3 text-muted-foreground">{b.blurb}</p>
                <ul className="mt-6 divide-y border-y">
                  {b.items.map((i) => (
                    <li key={i.slug} className="flex items-center justify-between gap-4 py-3 text-sm">
                      <span>
                        <Link href={`/products/${i.slug}`} className="font-semibold hover:underline">
                          {i.name}
                        </Link>
                        <span className="block text-muted-foreground">{i.type === "DIGITAL" ? "Instant download" : (i.variant?.label ?? "Sold out")}</span>
                      </span>
                      <span className="tabular-nums">{formatPrice(i.priceCents)}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <p>
                    <span className="font-display text-3xl font-extrabold">{formatPrice(b.bundleCents)}</span>{" "}
                    <span className="text-muted-foreground line-through">{formatPrice(b.totalCents)}</span>{" "}
                    <span className="ml-1 rounded-full bg-ember-soft px-2 py-0.5 text-xs font-bold text-ember-strong">{b.savingsLabel}</span>
                  </p>
                  <AddBundleButton bundle={b} />
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="under-50" className="border-t bg-paper py-16 sm:py-24">
        <div className="container-page">
          <SectionHeading eyebrow="Easy wins" title="Gifts under $50" href="/shop?price=under-25" linkLabel="Shop under $25" />
          <span id="under-50" className="sr-only">
            Gifts under $50
          </span>
          <ProductGrid products={underFifty} className="lg:grid-cols-3 xl:grid-cols-3" />
        </div>
      </section>

      <section aria-labelledby="stocking" className="container-page py-16 sm:py-24">
        <SectionHeading eyebrow="Small but mighty" title="Stocking stuffers" />
        <span id="stocking" className="sr-only">
          Stocking stuffers
        </span>
        <ProductGrid products={stockingStuffers} />
      </section>
    </>
  );
}
