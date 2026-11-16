import type { Category, ProductType } from "../src/generated/prisma/enums";

const u = (id: string) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1400&q=80`;

export type SeedVariant = {
  size?: string;
  color?: string;
  colorHex?: string;
  stock: number;
  priceCents?: number;
};

export type SeedProduct = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  details: string[];
  type: ProductType;
  category: Category;
  priceCents: number;
  compareAtCents?: number;
  badge?: string;
  featured?: boolean;
  inGiftGuide?: boolean;
  salesCount: number;
  images: { url: string; alt: string }[];
  variants: SeedVariant[];
  digital?: { name: string; fileName: string; mimeType: string };
};

const sizes = ["XS", "S", "M", "L", "XL"];
function sized(colors: { color: string; colorHex: string }[], stock: number[][]): SeedVariant[] {
  return colors.flatMap((c, ci) =>
    sizes.map((size, si) => ({ ...c, size, stock: stock[ci]?.[si] ?? 10 })),
  );
}

export const products: SeedProduct[] = [
  // ───────────── Physical ─────────────
  {
    slug: "lane-club-heavyweight-hoodie",
    name: "Lane Club Heavyweight Hoodie",
    tagline: "The one you'll steal back from your boyfriend.",
    description:
      "I spent eight months and eleven samples getting this one right. It's a 400gsm brushed-back fleece that feels like a hug, with a slightly cropped boxy fit that sits perfectly over leggings or a slip skirt. No scratchy tags, no shrinking after one wash, and a hood that actually stays up on windy hot-girl walks. This is the hoodie I wear in basically every Sunday reset video.",
    details: [
      "400gsm organic cotton fleece, brushed inside",
      "Boxy, slightly cropped fit. Size down for a closer fit",
      "Tonal 'Lane Club' puff print on chest",
      "Double-lined hood, no drawcords to tangle",
      "Pre-shrunk. Machine wash cold, hang dry",
    ],
    type: "PHYSICAL",
    category: "APPAREL",
    priceCents: 6800,
    badge: "Bestseller",
    featured: true,
    inGiftGuide: true,
    salesCount: 1840,
    images: [
      { url: u("1556821840-3a63f95609a7"), alt: "Back view of the Lane Club hoodie in heather grey with the hood up" },
    ],
    variants: sized(
      [
        { color: "Heather Grey", colorHex: "#A8A8A8" },
        { color: "Ink", colorHex: "#1C1C1E" },
        { color: "Ember", colorHex: "#C2410C" },
      ],
      [
        [6, 14, 22, 18, 7],
        [4, 12, 20, 15, 9],
        [0, 3, 5, 2, 0],
      ],
    ),
  },
  {
    slug: "off-duty-crewneck",
    name: "Off-Duty Crewneck",
    tagline: "Rest days deserve a uniform too.",
    description:
      "This is my rest-day, coffee-run, airport-outfit crewneck. It's a mid-weight French terry that breathes, so you can wear it from a 6am pilates class straight to brunch without overheating. The ribbed hem hits right at the hip, and the shoulders are dropped just enough to look relaxed without drowning you.",
    details: [
      "320gsm cotton French terry",
      "Relaxed fit with dropped shoulders",
      "Embroidered 'Off Duty' script on left chest",
      "Ribbed cuffs and hem that hold their shape",
      "Machine wash cold, tumble dry low",
    ],
    type: "PHYSICAL",
    category: "APPAREL",
    priceCents: 5800,
    inGiftGuide: true,
    salesCount: 960,
    images: [
      { url: u("1620799140408-edc6dcb6d633"), alt: "Off-Duty crewneck in bone, laid flat" },
      { url: u("1578587018452-892bacefd3f2"), alt: "Model wearing the Off-Duty crewneck in ember with jeans" },
    ],
    variants: sized(
      [
        { color: "Bone", colorHex: "#EFE9DF" },
        { color: "Ember", colorHex: "#C2410C" },
      ],
      [
        [5, 11, 16, 12, 6],
        [3, 8, 10, 6, 1],
      ],
    ),
  },
  {
    slug: "do-it-scared-boxy-tee",
    name: "Do It Scared Boxy Tee",
    tagline: "A reminder you can wear.",
    description:
      "\"Do it scared\" is the thing I say to myself before every new PR, every hard conversation and every video I almost didn't post. This tee is heavyweight cotton with a boxy cut, so it looks crisp tucked into jeans and just as good knotted at the gym. The back print is small, the message is big.",
    details: [
      "240gsm combed cotton jersey",
      "Boxy fit with a slightly dropped shoulder",
      "Small front logo, 'Do It Scared' back print",
      "Thick ribbed collar that won't stretch out",
      "Pre-shrunk. Wash inside out to keep the print fresh",
    ],
    type: "PHYSICAL",
    category: "APPAREL",
    priceCents: 3400,
    badge: "New",
    featured: true,
    inGiftGuide: true,
    salesCount: 1320,
    images: [
      { url: u("1521572163474-6864f9cf17ab"), alt: "Do It Scared boxy tee in white, worn with dark trousers" },
      { url: u("1622445275463-afa2ab738c34"), alt: "Model wearing the white boxy tee outdoors" },
      { url: u("1583743814966-8936f5b7be1a"), alt: "The tee in ink on a wooden hanger" },
    ],
    variants: sized(
      [
        { color: "White", colorHex: "#FAFAF9" },
        { color: "Ink", colorHex: "#1C1C1E" },
      ],
      [
        [9, 20, 28, 21, 10],
        [8, 18, 24, 16, 8],
      ],
    ),
  },
  {
    slug: "lane-club-baby-tee",
    name: "Lane Club Baby Tee",
    tagline: "Shrunken fit, zero shrinkage.",
    description:
      "You asked for a fitted tee that doesn't ride up during squats, so here it is. A soft, stretchy cotton-modal blend in a cropped baby fit that hugs without squeezing. Wear it to lift, layer it under the hoodie, or pair it with low-rise everything.",
    details: [
      "92% cotton, 8% elastane with a buttery modal finish",
      "Cropped, fitted silhouette. True to size",
      "Tonal 'Lane Club' chest print",
      "Holds its shape after repeat washes",
      "Machine wash cold, lay flat to dry",
    ],
    type: "PHYSICAL",
    category: "APPAREL",
    priceCents: 3000,
    salesCount: 780,
    images: [
      { url: u("1618354691373-d851c5c3a990"), alt: "Lane Club baby tee in ink on a hanger with the small chest logo" },
    ],
    variants: sized(
      [
        { color: "Ink", colorHex: "#1C1C1E" },
        { color: "Bone", colorHex: "#EFE9DF" },
      ],
      [
        [6, 12, 14, 9, 4],
        [2, 6, 8, 3, 0],
      ],
    ),
  },
  {
    slug: "the-big-sip-32oz-bottle",
    name: "The Big Sip 32oz Bottle",
    tagline: "Two of these a day and you're done.",
    description:
      "My hydration secret is honestly just having a bottle big enough that I don't have to think about it. The Big Sip is double-wall stainless steel, keeps water ice-cold for 24 hours, and has a flip straw lid that doesn't leak in your gym bag (I tested this the hard way). Time markers on the side keep you honest.",
    details: [
      "32oz / 950ml double-wall vacuum insulated steel",
      "Cold for 24 hours, hot for 12",
      "Leak-proof flip straw lid plus a bonus screw cap",
      "Laser-etched time markers from 8am to 8pm",
      "Fits most car cup holders. Hand wash recommended",
    ],
    type: "PHYSICAL",
    category: "ACCESSORIES",
    priceCents: 3600,
    badge: "Bestseller",
    featured: true,
    inGiftGuide: true,
    salesCount: 2410,
    images: [
      { url: u("1602143407151-7111542de6e8"), alt: "The Big Sip insulated bottle in sage against a white wall" },
      { url: u("1625708458528-802ec79b1ed8"), alt: "The Big Sip bottles in ember, aqua and blush" },
    ],
    variants: [
      { color: "Sage", colorHex: "#6E8B74", stock: 44 },
      { color: "Ember", colorHex: "#E8743B", stock: 31 },
      { color: "Aqua", colorHex: "#7CC9C4", stock: 6 },
      { color: "Blush", colorHex: "#E8A9C1", stock: 0 },
    ],
  },
  {
    slug: "market-day-canvas-tote",
    name: "Market Day Canvas Tote",
    tagline: "Fits a farmers market haul and your whole personality.",
    description:
      "The tote from every Sunday meal-prep vlog. It's heavyweight 16oz canvas with a flat bottom so it stands up on its own, long handles that actually go over a winter coat, and an inside zip pocket for your keys and lip balm. It has carried more sweet potatoes than I can count.",
    details: [
      "16oz natural cotton canvas",
      "Gusseted flat base, 15\" x 16\" x 5\"",
      "26\" handles that fit over the shoulder",
      "Interior zip pocket",
      "Spot clean or cold hand wash",
    ],
    type: "PHYSICAL",
    category: "ACCESSORIES",
    priceCents: 2600,
    inGiftGuide: true,
    salesCount: 1105,
    images: [
      { url: u("1544816155-12df9643f363"), alt: "Market Day canvas tote in natural against a pale blue wall" },
    ],
    variants: [
      { color: "Natural", colorHex: "#EDE4D3", stock: 58 },
      { color: "Ink", colorHex: "#1C1C1E", stock: 22 },
    ],
  },
  {
    slug: "gym-to-grocery-day-pack",
    name: "Gym-to-Grocery Day Pack",
    tagline: "One bag. Every errand.",
    description:
      "I designed this for the days when I go gym, then work, then grocery store, without going home. It has a separate ventilated pocket for sneakers or sweaty clothes, a padded laptop sleeve and a water-resistant base you can put down on a locker room floor without thinking twice.",
    details: [
      "Water-resistant vegan leather with a recycled lining",
      "Ventilated shoe compartment at the base",
      "Padded sleeve fits up to a 14\" laptop",
      "Side pocket sized for The Big Sip",
      "Padded straps plus a top carry handle",
    ],
    type: "PHYSICAL",
    category: "ACCESSORIES",
    priceCents: 4800,
    compareAtCents: 5800,
    badge: "Holiday deal",
    inGiftGuide: true,
    salesCount: 640,
    images: [
      { url: u("1622560480605-d83c853bc5c3"), alt: "Gym-to-Grocery day pack in clay against a white wall" },
    ],
    variants: [
      { color: "Clay", colorHex: "#B5705A", stock: 17 },
      { color: "Ink", colorHex: "#1C1C1E", stock: 4 },
    ],
  },
  {
    slug: "lane-club-dad-cap",
    name: "Lane Club Dad Cap",
    tagline: "For no-wash days and 5am runs.",
    description:
      "An unstructured, washed-cotton cap that looks broken-in from day one. The adjustable brass buckle means it fits a slick-back bun or a high pony through the back. It's the official uniform of second-day hair.",
    details: [
      "100% washed cotton twill",
      "Unstructured six-panel crown, curved brim",
      "Tonal embroidered 'LC' monogram",
      "Adjustable brass buckle strap. One size",
      "Spot clean only",
    ],
    type: "PHYSICAL",
    category: "ACCESSORIES",
    priceCents: 3000,
    salesCount: 870,
    images: [
      { url: u("1521369909029-2afed882baee"), alt: "Lane Club dad cap in washed charcoal, side view showing the curved brim" },
      { url: u("1588850561407-ed78c282e89b"), alt: "Lane Club cap in white on a plain background" },
    ],
    variants: [
      { color: "Washed Charcoal", colorHex: "#4A4A4A", stock: 36 },
      { color: "White", colorHex: "#F5F5F4", stock: 27 },
      { color: "Ember", colorHex: "#C2410C", stock: 12 },
    ],
  },

  // ───────────── Digital ─────────────
  {
    slug: "strong-era-12-week-program",
    name: "Strong Era: 12-Week Strength Program",
    tagline: "The exact plan I used to deadlift 1.5x my bodyweight.",
    description:
      "This is the program I wish I had when I was scared of the weights section. Twelve weeks, four sessions a week, built around progressive overload so you see real numbers going up, not just sweat. Every exercise has a form breakdown, there's a printable tracker, and the deload weeks are already planned so you don't burn out in week five. Works in any commercial gym.",
    details: [
      "84-page PDF, instant download",
      "4 sessions per week, 45 to 60 minutes each",
      "Progressive overload with built-in deload weeks",
      "Form cues for every lift plus beginner swaps",
      "Printable weekly tracker and PR log",
    ],
    type: "DIGITAL",
    category: "GUIDES",
    priceCents: 3900,
    badge: "Most loved",
    featured: true,
    inGiftGuide: true,
    salesCount: 5320,
    images: [
      { url: u("1517836357463-d25dfeac3438"), alt: "Barbell loaded with plates in a bright gym" },
      { url: u("1541534741688-6078c6bfb5c5"), alt: "Woman doing pull-ups on a gym rig" },
      { url: u("1484480974693-6ca0a78fb36b"), alt: "Filling in the printable weekly training tracker" },
    ],
    variants: [{ stock: 0 }],
    digital: { name: "Strong Era Program (PDF)", fileName: "strong-era-12-week-program.pdf", mimeType: "application/pdf" },
  },
  {
    slug: "sunday-reset-meal-prep-ebook",
    name: "Sunday Reset: Meal-Prep Ebook",
    tagline: "Two hours on Sunday, a whole week of good food.",
    description:
      "My Sunday reset videos are the most-requested thing on my page, so I finally put the whole system in one place. You get four rotating weekly menus, a grocery list for each one, and a step-by-step prep order so you're cooking three things at once instead of standing around. Every recipe is high-protein, under 600 calories, and tastes like something you'd actually order.",
    details: [
      "62-page PDF ebook, instant download",
      "40 high-protein recipes with macros",
      "4 rotating weekly menus with grocery lists",
      "Two-hour prep timeline for each week",
      "Vegetarian swaps on every recipe",
    ],
    type: "DIGITAL",
    category: "GUIDES",
    priceCents: 2400,
    featured: true,
    inGiftGuide: true,
    salesCount: 4180,
    images: [
      { url: u("1546069901-ba9599a7e63c"), alt: "Colourful high-protein salad bowl" },
      { url: u("1512621776951-a57141f2eefd"), alt: "Meal-prep bowls with grains and vegetables" },
      { url: u("1490645935967-10de6ba17061"), alt: "Plate of salmon, eggs and fresh vegetables from the Week B menu" },
    ],
    variants: [{ stock: 0 }],
    digital: { name: "Sunday Reset Ebook (PDF)", fileName: "sunday-reset-meal-prep-ebook.pdf", mimeType: "application/pdf" },
  },
  {
    slug: "golden-hour-lightroom-presets",
    name: "Golden Hour Lightroom Presets",
    tagline: "The warm, clean look from my feed in one tap.",
    description:
      "Everyone asks how I edit, and honestly it's these twelve presets. They're tuned for skin tones first, so you get that warm golden-hour glow without looking orange. Six are made for bright daylight and six for indoor or gym lighting. They work in the free Lightroom mobile app and Lightroom Classic.",
    details: [
      "12 presets in .xmp format plus a mobile .dng pack",
      "Skin-tone-first color grading",
      "Works with free Lightroom mobile and desktop",
      "Install guide with before-and-after examples",
      "Lifetime updates when I add new looks",
    ],
    type: "DIGITAL",
    category: "PRESETS",
    priceCents: 1900,
    compareAtCents: 2900,
    inGiftGuide: true,
    salesCount: 3650,
    images: [
      { url: u("1502920917128-1aa500764cbd"), alt: "Vintage camera and warm-toned prints on a wooden table" },
      { url: u("1506905925346-21bda4d32df4"), alt: "Mountain sunset edited with the Golden Hour presets" },
      { url: u("1452587925148-ce544e77e70d"), alt: "Camera on a white table, ready for editing" },
    ],
    variants: [{ stock: 0 }],
    digital: { name: "Golden Hour Presets (ZIP)", fileName: "golden-hour-presets.zip", mimeType: "application/zip" },
  },
  {
    slug: "home-glow-4-week-starter-plan",
    name: "Home Glow: 4-Week Starter Plan",
    tagline: "No gym, no problem. Just a mat and two dumbbells.",
    description:
      "If you're starting from zero, start here. Home Glow is four weeks of 30-minute workouts you can do in your living room with a mat and a pair of dumbbells. Each week builds on the last, there's a mobility flow for rest days, and I've included a mindset section for the days motivation doesn't show up.",
    details: [
      "38-page PDF, instant download",
      "20 workouts, 30 minutes each",
      "Only needs a mat and light dumbbells",
      "Rest-day mobility flow",
      "Habit tracker and mindset prompts",
    ],
    type: "DIGITAL",
    category: "GUIDES",
    priceCents: 1900,
    salesCount: 2240,
    images: [
      { url: u("1518611012118-696072aa579a"), alt: "Women doing a bodyweight workout on mats in a bright room" },
      { url: u("1544367567-0f2fcb009e0b"), alt: "Stretching flow at sunset from the rest-day mobility session" },
      { url: u("1592432678016-e910b452f9a2"), alt: "Rolled exercise mat, all the equipment you need" },
    ],
    variants: [{ stock: 0 }],
    digital: { name: "Home Glow Plan (PDF)", fileName: "home-glow-4-week-starter-plan.pdf", mimeType: "application/pdf" },
  },
];

export const reviewPool: { authorName: string; rating: number; title: string; body: string }[] = [
  { authorName: "Jasmine R.", rating: 5, title: "Worth every penny", body: "I've washed it maybe fifteen times and it still looks brand new. Already ordered a second colour." },
  { authorName: "Tori K.", rating: 5, title: "Obsessed", body: "Saw it in Maya's Sunday reset and caved. It's even better in person. The quality is unreal for the price." },
  { authorName: "Priya S.", rating: 4, title: "Love it, runs a little big", body: "Super soft and the colour is perfect. I'd size down if you want it less oversized." },
  { authorName: "Hannah L.", rating: 5, title: "My new favourite", body: "I reach for this every single day. Shipping was fast and the packaging was so cute." },
  { authorName: "Danielle M.", rating: 5, title: "Gifted one, kept one", body: "Bought it as a gift for my sister and ended up getting one for myself the next week." },
  { authorName: "Aaliyah W.", rating: 4, title: "Really good quality", body: "Heavier and better made than I expected. Took off one star because my colour sold out fast." },
  { authorName: "Megan T.", rating: 5, title: "Actually changed my routine", body: "I've stuck with it for six weeks, which is a personal record. Everything is so clearly explained." },
  { authorName: "Sofia G.", rating: 5, title: "So easy to follow", body: "No fluff, just exactly what to do and when. I finally understand progressive overload." },
  { authorName: "Kayla B.", rating: 3, title: "Good, not perfect", body: "Solid overall. I wish there were more beginner modifications, but I'm still using it." },
  { authorName: "Emma J.", rating: 5, title: "Instant favourite", body: "Downloaded it in two seconds and used it the same evening. Maya really delivers." },
];
