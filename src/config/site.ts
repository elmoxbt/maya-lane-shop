export const siteConfig = {
  name: "Maya Lane Shop",
  creator: "Maya Lane",
  tagline: "Strong, soft, and a little bit extra.",
  description:
    "Merch, training programs and meal-prep guides from lifestyle and fitness creator Maya Lane. Designed for real routines, made to last.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  builtBy: "Bazi",
  supportEmail: "hello@mayalane.shop",
  partnershipsEmail: "partners@mayalane.shop",
  social: {
    tiktok: { handle: "@mayalane", url: "https://www.tiktok.com/@mayalane", followers: "850K" },
    instagram: { handle: "@maya.lane", url: "https://www.instagram.com/maya.lane", followers: "312K" },
    youtube: { handle: "Maya Lane", url: "https://www.youtube.com/@mayalane", followers: "96K" },
  },
  shipping: {
    freeThresholdCents: 7500,
    standardCents: 599,
    expressCents: 1499,
  },
  /** Holiday shipping cutoff for the gift guide countdown (US Eastern, standard shipping) */
  holidayCutoff: "2026-12-17T23:59:00-05:00",
} as const;

export const categoryLabels = {
  APPAREL: "Apparel",
  ACCESSORIES: "Accessories",
  GUIDES: "Guides & Plans",
  PRESETS: "Presets",
} as const;

export type CategoryKey = keyof typeof categoryLabels;
