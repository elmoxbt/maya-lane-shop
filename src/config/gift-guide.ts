export type GiftBundle = {
  id: string;
  title: string;
  forWho: string;
  blurb: string;
  productSlugs: string[];
  /** Applied automatically at checkout when every item is in the cart */
  code?: string;
  savingsLabel?: string;
};

export const giftGuide = {
  eyebrow: "Holiday Gift Guide 2026",
  title: "Gifts they'll actually use",
  intro:
    "I picked these the same way I shop for my own people: things that get used every single day, not shoved in a drawer by January. Bundles get 15% off with code GIFTKIT15.",
  bundles: [
    {
      id: "gym-bestie",
      title: "The Gym Bestie Kit",
      forWho: "For the friend who texts you 'gym?' at 6am",
      blurb: "The bottle, the tee and the program that got me lifting. Everything she needs to walk into the weights section like she owns it.",
      productSlugs: ["the-big-sip-32oz-bottle", "do-it-scared-boxy-tee", "strong-era-12-week-program"],
      code: "GIFTKIT15",
      savingsLabel: "Save 15%",
    },
    {
      id: "sunday-reset",
      title: "The Sunday Reset Kit",
      forWho: "For the one who meal-preps in a matching set",
      blurb: "The cosiest hoodie, the market tote and my meal-prep ebook. Basically my entire Sunday in one box.",
      productSlugs: ["lane-club-heavyweight-hoodie", "market-day-canvas-tote", "sunday-reset-meal-prep-ebook"],
      code: "GIFTKIT15",
      savingsLabel: "Save 15%",
    },
    {
      id: "content-creator",
      title: "The Creator Starter Kit",
      forWho: "For the friend starting her own page",
      blurb: "My exact editing presets, the do-everything day pack and a cap for no-wash filming days.",
      productSlugs: ["golden-hour-lightroom-presets", "gym-to-grocery-day-pack", "lane-club-dad-cap"],
      code: "GIFTKIT15",
      savingsLabel: "Save 15%",
    },
  ] satisfies GiftBundle[],
  underFifty: [
    "the-big-sip-32oz-bottle",
    "do-it-scared-boxy-tee",
    "market-day-canvas-tote",
    "lane-club-dad-cap",
    "golden-hour-lightroom-presets",
    "sunday-reset-meal-prep-ebook",
  ],
  stockingStuffers: ["golden-hour-lightroom-presets", "home-glow-4-week-starter-plan", "lane-club-dad-cap", "lane-club-baby-tee"],
};
