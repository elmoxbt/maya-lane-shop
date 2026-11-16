import type { Metadata } from "next";
import { Download, Mail, TrendingUp } from "lucide-react";
import { siteConfig } from "@/config/site";
import { InquiryForm } from "@/components/forms/inquiry-form";

export const metadata: Metadata = {
  title: "Media Kit & Partnerships",
  description: "Audience stats, past brand partners and partnership packages for lifestyle and fitness creator Maya Lane. 850K TikTok followers, 9.8% engagement.",
  alternates: { canonical: "/media-kit" },
};

const platformStats = [
  { platform: "TikTok", handle: siteConfig.social.tiktok.handle, followers: "850K", engagement: "9.8%", avgViews: "410K" },
  { platform: "Instagram", handle: siteConfig.social.instagram.handle, followers: "312K", engagement: "5.4%", avgViews: "96K" },
  { platform: "YouTube", handle: siteConfig.social.youtube.handle, followers: "96K", engagement: "7.1%", avgViews: "58K" },
];

const age = [
  { label: "18–24", value: 38 },
  { label: "25–34", value: 44 },
  { label: "35–44", value: 13 },
  { label: "45+", value: 5 },
];
const geo = [
  { label: "United States", value: 64 },
  { label: "United Kingdom", value: 11 },
  { label: "Canada", value: 9 },
  { label: "Australia", value: 6 },
  { label: "Other", value: 10 },
];

const partners = ["Glow Hydration", "Stride Footwear", "Bloom Greens", "Northline Athletics", "Kind Kitchen", "Lumen Skin", "PacePods", "Daybreak Coffee"];

const caseStudies = [
  { brand: "Bloom Greens", result: "4.2M views", detail: "3-part 'morning reset' series drove 11,400 code redemptions in 14 days." },
  { brand: "Stride Footwear", result: "38% CTR lift", detail: "Six-month ambassadorship. Maya's videos outperformed the brand's paid creative by 38% on CTR." },
  { brand: "Kind Kitchen", result: "Sold out in 48h", detail: "Co-branded meal-prep container collab sold out its 5,000-unit run in two days." },
];

const packages = [
  { name: "Single TikTok", price: "From $6,500", items: ["One 30–60s dedicated video", "Link in bio for 7 days", "Usage rights: 30 days organic"] },
  { name: "Launch series", price: "From $16,000", items: ["Three TikToks over 3 weeks", "Instagram Story takeover", "Whitelisting available"] },
  { name: "Ambassador", price: "Custom", items: ["Monthly content for 3–12 months", "Event and product co-creation", "Exclusive category options"] },
];

function Bars({ title, data }: { title: string; data: { label: string; value: number }[] }) {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm">
      <h3 className="font-bold">{title}</h3>
      <ul className="mt-4 space-y-3">
        {data.map((d) => (
          <li key={d.label} className="text-sm">
            <div className="flex justify-between">
              <span>{d.label}</span>
              <span className="font-semibold tabular-nums">{d.value}%</span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted" aria-hidden>
              <div className="h-full rounded-full bg-ember" style={{ width: `${d.value}%` }} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function MediaKitPage() {
  return (
    <>
      <section className="bg-ink text-white">
        <div className="container-page py-14 sm:py-20">
          <p className="text-xs font-bold tracking-[0.18em] text-ember uppercase">Media kit · Updated November 2026</p>
          <h1 className="mt-3 max-w-3xl font-display text-5xl leading-[0.95] font-extrabold tracking-tight text-balance sm:text-7xl">Let&apos;s make something people actually watch.</h1>
          <p className="mt-5 max-w-2xl text-lg text-white/75">
            Maya Lane creates lifestyle and fitness content for women 18–34 who want to feel strong without giving up the soft stuff. Her audience
            trusts her because she only partners with brands she&apos;d use anyway.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a href="#contact" className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-ember px-7 font-semibold text-ink">
              <Mail className="size-4" aria-hidden /> Start a partnership
            </a>
            <a href={`mailto:${siteConfig.partnershipsEmail}?subject=Media%20kit%20PDF`} className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/25 px-7 font-semibold">
              <Download className="size-4" aria-hidden /> Request the PDF
            </a>
          </div>
        </div>
      </section>

      <section aria-labelledby="audience" className="bg-paper py-14 sm:py-20">
        <div className="container-page">
          <h2 id="audience" className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
            Audience at a glance
          </h2>
          <div className="mt-8 overflow-x-auto rounded-3xl bg-white shadow-sm">
            <table className="w-full min-w-[520px] text-left">
              <caption className="sr-only">Followers, engagement rate and average views by platform</caption>
              <thead className="border-b text-xs tracking-widest text-muted-foreground uppercase">
                <tr>
                  <th scope="col" className="p-5 font-semibold">Platform</th>
                  <th scope="col" className="p-5 font-semibold">Followers</th>
                  <th scope="col" className="p-5 font-semibold">Engagement</th>
                  <th scope="col" className="p-5 font-semibold">Avg. views</th>
                </tr>
              </thead>
              <tbody>
                {platformStats.map((s) => (
                  <tr key={s.platform} className="border-b last:border-0">
                    <th scope="row" className="p-5 font-semibold">
                      {s.platform} <span className="block text-sm font-normal text-muted-foreground">{s.handle}</span>
                    </th>
                    <td className="p-5 font-display text-2xl font-extrabold">{s.followers}</td>
                    <td className="p-5">
                      <span className="inline-flex items-center gap-1 font-semibold text-success">
                        <TrendingUp className="size-4" aria-hidden /> {s.engagement}
                      </span>
                    </td>
                    <td className="p-5 font-semibold tabular-nums">{s.avgViews}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            <Bars title="Age" data={age} />
            <Bars title="Top locations" data={geo} />
            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <h3 className="font-bold">Gender</h3>
              <p className="mt-4 font-display text-5xl font-extrabold">
                87<span className="text-2xl">%</span>
              </p>
              <p className="text-sm text-muted-foreground">women</p>
              <h3 className="mt-6 font-bold">Top interests</h3>
              <p className="mt-2 text-sm text-muted-foreground">Strength training, meal prep, wellness, skincare, athleisure, home organisation</p>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="partners" className="container-page py-14 sm:py-20">
        <h2 id="partners" className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
          Past partners
        </h2>
        <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {partners.map((p) => (
            <li key={p} className="grid h-20 place-items-center rounded-2xl border text-center font-display text-lg font-bold tracking-tight text-foreground/70">
              {p}
            </li>
          ))}
        </ul>
        <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
          {caseStudies.map((c) => (
            <article key={c.brand} className="rounded-3xl bg-ember-soft p-6">
              <p className="text-sm font-semibold text-ember-strong">{c.brand}</p>
              <p className="mt-2 font-display text-3xl font-extrabold tracking-tight">{c.result}</p>
              <p className="mt-2 text-sm text-foreground/75">{c.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="packages" className="border-t bg-paper py-14 sm:py-20">
        <div className="container-page">
          <h2 id="packages" className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
            Packages
          </h2>
          <ul className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
            {packages.map((p) => (
              <li key={p.name} className="flex flex-col rounded-3xl bg-white p-6 shadow-sm">
                <h3 className="text-lg font-bold">{p.name}</h3>
                <p className="mt-1 font-display text-2xl font-extrabold">{p.price}</p>
                <ul className="mt-4 list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
                  {p.items.map((i) => (
                    <li key={i}>{i}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="contact" aria-labelledby="contact-heading" className="container-page scroll-mt-24 py-14 sm:py-20">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_1.4fr]">
          <div>
            <h2 id="contact-heading" className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
              Work with Maya
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Tell us about your brand and campaign. We reply to every inquiry within three business days. Prefer email? Reach us at{" "}
              <a href={`mailto:${siteConfig.partnershipsEmail}`} className="font-semibold break-all text-ember-strong underline-offset-4 hover:underline">
                {siteConfig.partnershipsEmail}
              </a>
              .
            </p>
          </div>
          <InquiryForm />
        </div>
      </section>
    </>
  );
}
