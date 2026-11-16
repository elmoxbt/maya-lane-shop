import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Leaf, Package, Sparkles } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { siteConfig } from "@/config/site";
import { JsonLd } from "@/components/common/json-ld";

export const metadata: Metadata = {
  title: "About Maya",
  description: "From a 6am gym selfie to 850K followers: the story behind Maya Lane and why every product in the shop is something she actually uses.",
  alternates: { canonical: "/about" },
};

const img = (id: string, w = 1200) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

const values = [
  { icon: Sparkles, title: "Use it or lose it", body: "If I don't use something every week, it doesn't go in the shop. Every product starts as something I needed and couldn't find." },
  { icon: Leaf, title: "Made to last", body: "Organic cotton, recycled nylon, steel that won't end up in landfill. Fewer, better things beat a new drop every week." },
  { icon: Package, title: "Small batch, on purpose", body: "We produce in small runs so nothing gets dumped at the end of a season. Sold out means it's coming back, not that we over-made it." },
];

const faqs = [
  { q: "How long does shipping take?", a: `Orders ship from Austin, TX within 1–2 business days. Standard shipping takes 3–6 business days and is free on orders over $75. Express arrives in 1–2 business days.` },
  { q: "What's your return policy?", a: "Unworn, unwashed items can be returned within 30 days for a full refund. Just reply to your order confirmation email and we'll send a prepaid label." },
  { q: "How do digital downloads work?", a: "Right after checkout you'll see download buttons on the confirmation page and get them by email. Links expire after 72 hours for security, but you can always get fresh ones from your account." },
  { q: "Do you ship internationally?", a: "We currently ship to the US, Canada, the UK and Australia. Digital products are available everywhere." },
  { q: "Can I change or cancel my order?", a: "If it hasn't shipped yet, absolutely. Reply to your confirmation email within 12 hours and we'll sort it out." },
];

export default function AboutPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
        }}
      />
      <section className="container-page grid grid-cols-1 gap-10 py-12 sm:py-20 lg:grid-cols-2 lg:items-center lg:gap-16">
        <div>
          <p className="text-xs font-bold tracking-[0.18em] text-ember-strong uppercase">About Maya</p>
          <h1 className="mt-2 font-display text-5xl leading-[0.95] font-extrabold tracking-tight text-balance sm:text-6xl">It started with a 6am gym selfie.</h1>
          <div className="mt-6 space-y-4 text-lg text-pretty text-foreground/80">
            <p>
              In 2021 I was working a desk job in Austin, burnt out and honestly a bit lost. I started posting my 6am workouts as a way to stay
              accountable. Nobody watched them. Then one Sunday I filmed my meal prep, and a few thousand people did.
            </p>
            <p>
              Four years later, the Lane Club is {siteConfig.social.tiktok.followers} people on TikTok who believe that being strong and being soft
              aren&apos;t opposites. We lift heavy, we eat well, we rest without guilt, and we cheer each other on in the comments.
            </p>
            <p>This shop is the stuff I actually use. Nothing more, nothing less.</p>
          </div>
          <Link href="/shop" className="mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-ink px-7 font-semibold text-white transition hover:bg-ink/85">
            Shop my favourites <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="relative aspect-[3/4] overflow-hidden rounded-3xl bg-muted">
            <Image src={img("1518611012118-696072aa579a")} alt="Maya leading a bodyweight class" fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover" />
          </div>
          <div className="relative mt-10 aspect-[3/4] overflow-hidden rounded-3xl bg-muted">
            <Image src={img("1512621776951-a57141f2eefd")} alt="A Sunday meal-prep bowl" fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover" />
          </div>
        </div>
      </section>

      <section className="bg-paper py-16 sm:py-20">
        <div className="container-page">
          <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">What the shop stands for</h2>
          <ul className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
            {values.map((v) => (
              <li key={v.title} className="rounded-3xl bg-white p-6 shadow-sm">
                <span className="grid size-11 place-items-center rounded-full bg-ember-soft">
                  <v.icon className="size-5 text-ember-strong" aria-hidden />
                </span>
                <h3 className="mt-4 text-lg font-bold">{v.title}</h3>
                <p className="mt-2 text-muted-foreground">{v.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="faq" className="container-page scroll-mt-24 py-16 sm:py-20">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_1.6fr]">
          <div>
            <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">Shipping, returns & FAQs</h2>
            <p className="mt-3 text-muted-foreground">
              Still stuck? Email{" "}
              <a href={`mailto:${siteConfig.supportEmail}`} className="font-semibold text-ember-strong underline-offset-4 hover:underline">
                {siteConfig.supportEmail}
              </a>{" "}
              and a real human will reply within a day.
            </p>
          </div>
          <Accordion type="single" collapsible className="border-t">
            {faqs.map((f) => (
              <AccordionItem key={f.q} value={f.q}>
                <AccordionTrigger className="py-5 text-base font-semibold">{f.q}</AccordionTrigger>
                <AccordionContent className="text-base text-foreground/80">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </>
  );
}
