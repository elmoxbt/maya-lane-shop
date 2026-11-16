import { Hero } from "@/components/home/hero";
import { Marquee } from "@/components/home/marquee";
import { GiftGuideTeaser } from "@/components/home/gift-guide-teaser";
import { SocialProof } from "@/components/home/social-proof";
import { LeadMagnet } from "@/components/home/lead-magnet";
import { SectionHeading } from "@/components/common/section-heading";
import { ProductGrid } from "@/components/product/product-card";
import { getBestsellers, getFeaturedProducts, getGiftGuideProducts } from "@/server/queries/products";
import { JsonLd } from "@/components/common/json-ld";
import { siteConfig } from "@/config/site";

export default async function HomePage() {
  const [featured, bestsellers, giftProducts] = await Promise.all([getFeaturedProducts(4), getBestsellers(8), getGiftGuideProducts()]);
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: siteConfig.name,
          url: siteConfig.url,
          founder: { "@type": "Person", name: siteConfig.creator },
          sameAs: Object.values(siteConfig.social).map((s) => s.url),
        }}
      />
      <Hero />
      <Marquee />
      <section aria-labelledby="featured-heading" className="container-page py-16 sm:py-24">
        <SectionHeading eyebrow="Just dropped" title="The pieces I wear on repeat" description="Small batch, made to last, and tested in every single one of my videos." href="/shop" linkLabel="Shop everything" />
        <span id="featured-heading" className="sr-only">Featured products</span>
        <ProductGrid products={featured} priorityCount={2} />
      </section>
      <GiftGuideTeaser products={giftProducts} />
      <section aria-labelledby="bestsellers-heading" className="container-page py-16 sm:py-24">
        <SectionHeading eyebrow="Bestsellers" title="What the Lane Club keeps coming back for" href="/shop?sort=bestselling" linkLabel="See all bestsellers" />
        <span id="bestsellers-heading" className="sr-only">Bestsellers</span>
        <ProductGrid products={bestsellers} />
      </section>
      <SocialProof />
      <LeadMagnet />
    </>
  );
}
