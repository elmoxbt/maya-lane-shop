import Link from "next/link";
import { Logo } from "./logo";
import { SubscribeForm } from "@/components/forms/subscribe-form";
import { siteConfig } from "@/config/site";

const columns = [
  { title: "Shop", links: [["All products", "/shop"], ["Apparel", "/shop?category=APPAREL"], ["Accessories", "/shop?category=ACCESSORIES"], ["Programs & guides", "/shop?type=DIGITAL"], ["Gift guide", "/gift-guide"]] },
  { title: "Maya", links: [["About", "/about"], ["Media kit", "/media-kit"], ["Work with me", "/media-kit#contact"]] },
  { title: "Help", links: [["My account", "/account"], ["Order history", "/account/orders"], ["Shipping & returns", "/about#faq"]] },
] as const;

export function SiteFooter() {
  return (
    <footer className="mt-auto bg-ink text-white">
      <div className="container-page grid grid-cols-1 gap-12 py-14 lg:grid-cols-[1.3fr_2fr] lg:py-20">
        <div className="max-w-md">
          <Logo inverted className="text-2xl" />
          <p className="mt-4 font-display text-2xl leading-tight font-bold tracking-tight">
            Get my free 7-day workout plan, plus first dibs on every drop.
          </p>
          <SubscribeForm source="footer" tone="dark" cta="Get the plan" className="mt-5" />
          <p className="mt-3 text-xs text-white/60">One email a week, max. Unsubscribe anytime.</p>
        </div>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          {columns.map((c) => (
            <div key={c.title}>
              <h2 className="font-sans text-xs font-semibold tracking-widest text-white/60 uppercase">{c.title}</h2>
              <ul className="mt-4 space-y-3 text-sm">
                {c.links.map(([label, href]) => (
                  <li key={href}>
                    <Link href={href} className="text-white/85 transition hover:text-ember">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div>
            <h2 className="font-sans text-xs font-semibold tracking-widest text-white/60 uppercase">Follow</h2>
            <ul className="mt-4 space-y-3 text-sm">
              {Object.entries(siteConfig.social).map(([key, s]) => (
                <li key={key}>
                  <a href={s.url} target="_blank" rel="noreferrer" className="text-white/85 capitalize transition hover:text-ember">
                    {key} <span className="text-white/50">· {s.followers}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-2 py-6 text-xs text-white/55 sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} Maya Lane LLC. All rights reserved.</p>
          <p>
            Demo storefront designed & built by <span className="font-semibold text-white">{siteConfig.builtBy}</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
