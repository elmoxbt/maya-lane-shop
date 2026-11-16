import "server-only";
import { db } from "@/lib/db";
import type { OrderStatus, Prisma } from "@/generated/prisma/client";

const REVENUE_STATUSES: OrderStatus[] = ["PAID", "SHIPPED", "DELIVERED"];

export async function getOverview() {
  const now = new Date();
  const since = new Date(now.getTime() - 30 * 86400000);
  const prevSince = new Date(now.getTime() - 60 * 86400000);

  const [current, previous, subscribers, newSubscribers, daily, top, recent, lowStock] = await Promise.all([
    db.order.aggregate({ where: { status: { in: REVENUE_STATUSES }, paidAt: { gte: since } }, _sum: { totalCents: true }, _count: { _all: true } }),
    db.order.aggregate({ where: { status: { in: REVENUE_STATUSES }, paidAt: { gte: prevSince, lt: since } }, _sum: { totalCents: true }, _count: { _all: true } }),
    db.subscriber.count(),
    db.subscriber.count({ where: { createdAt: { gte: since } } }),
    db.$queryRaw<{ day: Date; revenue: bigint; orders: bigint }[]>`
      SELECT d.day::date AS day,
             COALESCE(SUM(o."totalCents"), 0)::bigint AS revenue,
             COUNT(o.id)::bigint AS orders
      FROM generate_series(date_trunc('day', ${since}::timestamp), date_trunc('day', ${now}::timestamp), interval '1 day') AS d(day)
      LEFT JOIN "Order" o
        ON date_trunc('day', o."paidAt") = d.day
       AND o.status IN ('PAID', 'SHIPPED', 'DELIVERED')
      GROUP BY d.day
      ORDER BY d.day`,
    db.orderItem.groupBy({
      by: ["productId"],
      where: { productId: { not: null }, order: { status: { in: REVENUE_STATUSES }, paidAt: { gte: since } } },
      _sum: { quantity: true, unitPriceCents: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    }),
    db.order.findMany({ where: { status: { not: "PENDING" } }, orderBy: { createdAt: "desc" }, take: 6, select: { id: true, number: true, email: true, status: true, totalCents: true, createdAt: true } }),
    db.productVariant.findMany({ where: { stock: { lte: 3 }, product: { type: "PHYSICAL", published: true } }, include: { product: { select: { name: true, id: true } } }, orderBy: { stock: "asc" }, take: 6 }),
  ]);

  // Revenue per product needs quantity × price per line, so compute with a second small query
  const topIds = top.map((t) => t.productId!).filter(Boolean);
  const [topProducts, topLines] = await Promise.all([
    db.product.findMany({ where: { id: { in: topIds } }, select: { id: true, name: true, images: { take: 1, orderBy: { position: "asc" }, select: { url: true } } } }),
    db.orderItem.findMany({ where: { productId: { in: topIds }, order: { status: { in: REVENUE_STATUSES }, paidAt: { gte: since } } }, select: { productId: true, quantity: true, unitPriceCents: true } }),
  ]);

  const revenue = current._sum.totalCents ?? 0;
  const orders = current._count._all;
  const prevRevenue = previous._sum.totalCents ?? 0;
  const prevOrders = previous._count._all;
  const change = (a: number, b: number) => (b === 0 ? null : ((a - b) / b) * 100);

  return {
    revenue,
    orders,
    aov: orders ? Math.round(revenue / orders) : 0,
    subscribers,
    newSubscribers,
    revenueChange: change(revenue, prevRevenue),
    ordersChange: change(orders, prevOrders),
    aovChange: change(orders ? revenue / orders : 0, prevOrders ? prevRevenue / prevOrders : 0),
    daily: daily.map((d) => ({ date: new Date(d.day).toISOString().slice(0, 10), revenue: Number(d.revenue) / 100, orders: Number(d.orders) })),
    topProducts: top.map((t) => {
      const p = topProducts.find((x) => x.id === t.productId);
      return {
        id: t.productId!,
        name: p?.name ?? "Deleted product",
        image: p?.images[0]?.url ?? null,
        units: t._sum.quantity ?? 0,
        revenue: topLines.filter((l) => l.productId === t.productId).reduce((s, l) => s + l.quantity * l.unitPriceCents, 0),
      };
    }),
    recent,
    lowStock,
  };
}

export const ORDERS_PAGE_SIZE = 20;

export async function getAdminOrders({ status, q, page = 1 }: { status?: OrderStatus; q?: string; page?: number }) {
  const where: Prisma.OrderWhereInput = { status: status ?? { not: "PENDING" } };
  if (q) {
    const num = Number(q.replace(/^ML-/i, ""));
    where.OR = [
      { email: { contains: q, mode: "insensitive" } },
      { shippingName: { contains: q, mode: "insensitive" } },
      ...(Number.isFinite(num) && num >= 1000 ? [{ number: num - 1000 }] : []),
    ];
  }
  const [orders, total, counts] = await Promise.all([
    db.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * ORDERS_PAGE_SIZE,
      take: ORDERS_PAGE_SIZE,
      include: { items: { select: { quantity: true, type: true } } },
    }),
    db.order.count({ where }),
    db.order.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);
  return { orders, total, pages: Math.max(1, Math.ceil(total / ORDERS_PAGE_SIZE)), counts: Object.fromEntries(counts.map((c) => [c.status, c._count._all])) as Partial<Record<OrderStatus, number>> };
}

export async function getAdminOrder(id: string) {
  return db.order.findUnique({
    where: { id },
    include: {
      items: { include: { product: { select: { slug: true, digitalAssets: { select: { id: true, name: true } } } } } },
      discountCode: { select: { code: true } },
      user: { select: { id: true, name: true, email: true, createdAt: true, _count: { select: { orders: true } } } },
    },
  });
}

export async function getAdminProducts() {
  const products = await db.product.findMany({
    orderBy: [{ published: "desc" }, { createdAt: "desc" }],
    include: { images: { take: 1, orderBy: { position: "asc" } }, variants: { select: { stock: true } }, _count: { select: { orderItems: true } } },
  });
  return products.map((p) => ({ ...p, totalStock: p.variants.reduce((s, v) => s + v.stock, 0) }));
}

export async function getAdminProduct(id: string) {
  return db.product.findUnique({
    where: { id },
    include: { images: { orderBy: { position: "asc" } }, variants: { orderBy: { position: "asc" } }, digitalAssets: { orderBy: { createdAt: "asc" } } },
  });
}

export async function getCustomers() {
  const users = await db.user.findMany({
    where: { role: "CUSTOMER" },
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, email: true, createdAt: true, orders: { where: { status: { in: REVENUE_STATUSES } }, select: { totalCents: true, createdAt: true } } },
  });
  return users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    createdAt: u.createdAt,
    orders: u.orders.length,
    spentCents: u.orders.reduce((s, o) => s + o.totalCents, 0),
    lastOrderAt: u.orders.reduce<Date | null>((d, o) => (!d || o.createdAt > d ? o.createdAt : d), null),
  }));
}

export async function getSubscribers() {
  return db.subscriber.findMany({ orderBy: { createdAt: "desc" } });
}

export async function getDiscountCodes() {
  return db.discountCode.findMany({ orderBy: [{ active: "desc" }, { createdAt: "desc" }] });
}

export async function getInquiries() {
  return db.brandInquiry.findMany({ orderBy: [{ createdAt: "desc" }] });
}
