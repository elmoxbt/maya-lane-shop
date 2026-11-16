import "dotenv/config";
import { stat } from "node:fs/promises";
import path from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import type { OrderStatus } from "../src/generated/prisma/enums";
import { products, reviewPool } from "./seed-data";
import { generateDigitalFiles } from "../scripts/generate-digital-files";

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });

// Deterministic pseudo-random so every seed produces the same demo store
let s = 42;
const rand = () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
const pick = <T,>(arr: T[]) => arr[Math.floor(rand() * arr.length)];
const between = (min: number, max: number) => Math.floor(rand() * (max - min + 1)) + min;

const firstNames = ["Ava", "Mia", "Zoe", "Lily", "Nora", "Ella", "Ivy", "Ruby", "Leah", "Maya", "Jade", "Iris", "Gabi", "Sana", "Tess", "Lena", "Cora", "Ines", "Rosa", "Kira", "Noa", "Elif", "Amara", "Bea", "Dani"];
const lastNames = ["Nguyen", "Garcia", "Patel", "Smith", "Kim", "Johnson", "Okafor", "Silva", "Brown", "Rossi", "Chen", "Lopez", "Martin", "Ali", "Walker"];
const cities = [
  { city: "Austin", state: "TX", postal_code: "78701" },
  { city: "Brooklyn", state: "NY", postal_code: "11211" },
  { city: "Los Angeles", state: "CA", postal_code: "90026" },
  { city: "Chicago", state: "IL", postal_code: "60614" },
  { city: "Denver", state: "CO", postal_code: "80205" },
  { city: "Seattle", state: "WA", postal_code: "98122" },
  { city: "Miami", state: "FL", postal_code: "33137" },
  { city: "Nashville", state: "TN", postal_code: "37206" },
];

async function main() {
  console.log("🌱 Seeding Maya Lane Shop…");

  const generated = await generateDigitalFiles();
  if (generated.length) console.log(`  generated ${generated.length} digital files`);

  // Clean slate (order matters for FK constraints)
  await db.$transaction([
    db.orderItem.deleteMany(),
    db.order.deleteMany(),
    db.cartItem.deleteMany(),
    db.cart.deleteMany(),
    db.review.deleteMany(),
    db.digitalAsset.deleteMany(),
    db.productImage.deleteMany(),
    db.productVariant.deleteMany(),
    db.product.deleteMany(),
    db.discountCode.deleteMany(),
    db.subscriber.deleteMany(),
    db.brandInquiry.deleteMany(),
    db.stripeEvent.deleteMany(),
    db.rateLimit.deleteMany(),
    db.account.deleteMany(),
    db.session.deleteMany(),
    db.user.deleteMany(),
  ]);

  // ── Users
  const adminEmail = (process.env.ADMIN_EMAIL ?? "admin@mayalane.shop").toLowerCase();
  await db.user.create({ data: { email: adminEmail, name: "Maya Lane", role: "ADMIN", emailVerified: new Date() } });
  await db.user.create({
    data: { email: "demo-admin@mayalane.shop", name: "Demo Admin", role: "DEMO_ADMIN", emailVerified: new Date() },
  });
  const demoCustomer = await db.user.create({
    data: { email: "demo@mayalane.shop", name: "Jordan Demo", role: "CUSTOMER", emailVerified: new Date() },
  });
  const customers = [demoCustomer];
  for (let i = 0; i < 24; i++) {
    const first = firstNames[i % firstNames.length];
    const last = pick(lastNames);
    customers.push(
      await db.user.create({
        data: {
          name: `${first} ${last}`,
          email: `${first}.${last}${i}@example.com`.toLowerCase(),
          createdAt: new Date(Date.now() - between(10, 200) * 86400000),
        },
      }),
    );
  }

  // ── Products
  const created = [];
  for (const p of products) {
    let skuIndex = 0;
    const base = p.slug.split("-").slice(0, 3).map((w) => w[0]).join("").toUpperCase();
    const product = await db.product.create({
      data: {
        slug: p.slug,
        name: p.name,
        tagline: p.tagline,
        description: p.description,
        details: p.details,
        type: p.type,
        category: p.category,
        priceCents: p.priceCents,
        compareAtCents: p.compareAtCents,
        badge: p.badge,
        featured: p.featured ?? false,
        inGiftGuide: p.inGiftGuide ?? false,
        published: true,
        salesCount: p.salesCount,
        images: { create: p.images.map((img, position) => ({ ...img, position })) },
        variants: {
          create: p.variants.map((v, position) => ({
            ...v,
            position,
            sku: `ML-${base}-${[v.color?.slice(0, 3), v.size].filter(Boolean).join("-").toUpperCase() || "STD"}-${++skuIndex}`,
          })),
        },
        digitalAssets: p.digital
          ? {
              create: {
                name: p.digital.name,
                fileName: p.digital.fileName,
                mimeType: p.digital.mimeType,
                sizeBytes: (await stat(path.join("storage", "digital", p.digital.fileName))).size,
                storage: "LOCAL",
                key: `digital/${p.digital.fileName}`,
              },
            }
          : undefined,
      },
      include: { variants: true, images: true },
    });
    created.push(product);
  }
  console.log(`  ${created.length} products`);

  // ── Reviews
  let reviewCount = 0;
  for (const product of created) {
    const n = between(3, 6);
    for (let i = 0; i < n; i++) {
      const r = reviewPool[(reviewCount + i * 3) % reviewPool.length];
      const author = pick(customers.slice(1));
      await db.review.create({
        data: {
          productId: product.id,
          userId: author.id,
          authorName: r.authorName,
          rating: r.rating,
          title: r.title,
          body: r.body,
          verified: rand() > 0.2,
          createdAt: new Date(Date.now() - between(2, 120) * 86400000),
        },
      });
    }
    reviewCount += n;
  }
  console.log(`  ${reviewCount} reviews`);

  // ── Discount codes
  const now = Date.now();
  const holiday = await db.discountCode.create({
    data: { code: "HOLIDAY20", description: "20% off the holiday drop", type: "PERCENTAGE", value: 20, expiresAt: new Date("2026-12-31T23:59:59Z"), maxUses: 500, usedCount: 142 },
  });
  await db.discountCode.createMany({
    data: [
      { code: "KICKSTART10", description: "10% off for new subscribers", type: "PERCENTAGE", value: 10, usedCount: 389 },
      { code: "GIFTKIT15", description: "15% off gift guide bundles", type: "PERCENTAGE", value: 15, minSubtotalCents: 7500, expiresAt: new Date("2026-12-24T23:59:59Z"), usedCount: 57 },
      { code: "TAKE10", description: "$10 off orders over $60", type: "FIXED", value: 1000, minSubtotalCents: 6000, maxUses: 200, usedCount: 31 },
      { code: "SUMMER25", description: "Summer sale (expired)", type: "PERCENTAGE", value: 25, expiresAt: new Date("2026-08-31T23:59:59Z"), usedCount: 610, active: false },
    ],
  });

  // ── Orders (last ~45 days, weighted to recent)
  const physical = created.filter((p) => p.type === "PHYSICAL");
  const digital = created.filter((p) => p.type === "DIGITAL");
  let orders = 0;
  for (let i = 0; i < 96; i++) {
    const daysAgo = Math.floor(Math.pow(rand(), 1.4) * 44);
    const createdAt = new Date(now - daysAgo * 86400000 - between(0, 20) * 3600000);
    const customer = i < 3 ? demoCustomer : pick(customers);
    const lines: { product: (typeof created)[number]; variant: (typeof created)[number]["variants"][number]; quantity: number }[] = [];
    const itemCount = between(1, 3);
    for (let j = 0; j < itemCount; j++) {
      const product = rand() > 0.42 ? pick(physical) : pick(digital);
      if (lines.some((l) => l.product.id === product.id)) continue;
      const variant = pick(product.variants);
      lines.push({ product, variant, quantity: product.type === "DIGITAL" ? 1 : between(1, 2) });
    }
    // The demo customer always has a digital product to re-download
    if (i === 0 && !lines.some((l) => l.product.type === "DIGITAL")) {
      lines.push({ product: digital[0], variant: digital[0].variants[0], quantity: 1 });
    }
    const hasPhysical = lines.some((l) => l.product.type === "PHYSICAL");
    const subtotal = lines.reduce((sum, l) => sum + (l.variant.priceCents ?? l.product.priceCents) * l.quantity, 0);
    const useCode = rand() > 0.8;
    const discount = useCode ? Math.round(subtotal * 0.2) : 0;
    const shipping = hasPhysical ? (subtotal - discount >= 7500 ? 0 : 599) : 0;
    const status: OrderStatus = !hasPhysical
      ? daysAgo > 40 && rand() > 0.85
        ? "REFUNDED"
        : "PAID"
      : daysAgo > 9
        ? rand() > 0.94
          ? "REFUNDED"
          : "DELIVERED"
        : daysAgo > 3
          ? "SHIPPED"
          : "PAID";
    const addr = pick(cities);
    await db.order.create({
      data: {
        userId: customer.id,
        email: customer.email,
        status,
        hasPhysical,
        subtotalCents: subtotal,
        discountCents: discount,
        shippingCents: shipping,
        taxCents: 0,
        totalCents: subtotal - discount + shipping,
        discountCodeId: useCode ? holiday.id : null,
        stripeSessionId: `cs_test_seed_${i}`,
        shippingName: hasPhysical ? customer.name : null,
        shippingAddress: hasPhysical ? { line1: `${between(10, 999)} ${pick(["Oak", "Elm", "Pine", "Maple", "Cedar"])} St`, line2: null, country: "US", ...addr } : undefined,
        trackingCarrier: status === "SHIPPED" || status === "DELIVERED" ? "USPS" : null,
        trackingNumber: status === "SHIPPED" || status === "DELIVERED" ? `9400${between(100000000, 999999999)}${between(1000000, 9999999)}` : null,
        paidAt: createdAt,
        shippedAt: status === "SHIPPED" || status === "DELIVERED" ? new Date(createdAt.getTime() + 86400000) : null,
        deliveredAt: status === "DELIVERED" ? new Date(createdAt.getTime() + 4 * 86400000) : null,
        refundedAt: status === "REFUNDED" ? new Date(createdAt.getTime() + 5 * 86400000) : null,
        confirmationSentAt: createdAt,
        createdAt,
        items: {
          create: lines.map((l) => ({
            productId: l.product.id,
            variantId: l.variant.id,
            type: l.product.type,
            name: l.product.name,
            variantLabel: [l.variant.color, l.variant.size].filter(Boolean).join(" / ") || null,
            imageUrl: l.product.images[0]?.url,
            unitPriceCents: l.variant.priceCents ?? l.product.priceCents,
            quantity: l.quantity,
          })),
        },
      },
    });
    orders++;
  }
  console.log(`  ${orders} orders`);

  // ── Subscribers
  const sources = ["lead-magnet", "footer", "lead-magnet", "checkout", "lead-magnet"];
  await db.subscriber.createMany({
    data: Array.from({ length: 64 }, (_, i) => ({
      email: `${firstNames[i % firstNames.length].toLowerCase()}${i + 7}@example.com`,
      source: sources[i % sources.length],
      leadMagnetSentAt: sources[i % sources.length] === "lead-magnet" ? new Date(now - i * 43200000) : null,
      createdAt: new Date(now - i * 43200000),
    })),
  });

  // ── Brand inquiries
  await db.brandInquiry.createMany({
    data: [
      { name: "Sophie Turner", email: "sophie@glowhydration.example", company: "Glow Hydration", website: "https://glowhydration.example", budget: "$10k–$25k", message: "We're launching a new electrolyte line in January and would love Maya for a 3-video TikTok series plus a Story takeover. Flexible on creative direction.", status: "NEW", createdAt: new Date(now - 1 * 86400000) },
      { name: "Marcus Bell", email: "marcus@stridefootwear.example", company: "Stride Footwear", budget: "$25k+", message: "Interested in a long-term ambassador partnership for our training shoe. Six months, monthly content, plus an event appearance in LA.", status: "IN_PROGRESS", createdAt: new Date(now - 4 * 86400000) },
      { name: "Lina Park", email: "lina@bloomgreens.example", company: "Bloom Greens", budget: "$5k–$10k", message: "Looking for one dedicated TikTok and a link in bio for two weeks to promote our holiday bundle.", status: "NEW", createdAt: new Date(now - 6 * 86400000) },
      { name: "Owen Hart", email: "owen@pacepods.example", company: "PacePods", budget: "Under $5k", message: "Gifting plus a small paid post for our new running earbuds. Happy to send samples first.", status: "CLOSED", createdAt: new Date(now - 18 * 86400000) },
    ],
  });

  console.log("✅ Done. Admin:", adminEmail, "· Demo customer: demo@mayalane.shop");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
