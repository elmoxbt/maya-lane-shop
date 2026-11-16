import "server-only";
import { db } from "@/lib/db";
import { buildDownloads } from "@/server/downloads";

export const orderDetailInclude = {
  items: { include: { product: { select: { slug: true, name: true, digitalAssets: { select: { id: true, name: true, sizeBytes: true, mimeType: true } } } } } },
  discountCode: { select: { code: true } },
} as const;

export async function getOrderBySession(sessionId: string) {
  return db.order.findUnique({ where: { stripeSessionId: sessionId }, include: orderDetailInclude });
}

export async function getUserOrders(userId: string) {
  return db.order.findMany({
    where: { userId, status: { notIn: ["PENDING", "CANCELLED"] } },
    include: { items: { select: { name: true, imageUrl: true, quantity: true, type: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getUserOrder(userId: string, orderId: string) {
  return db.order.findFirst({ where: { id: orderId, userId, status: { not: "PENDING" } }, include: orderDetailInclude });
}

/** Every digital product the user owns, with fresh signed download links. */
export async function getUserDownloads(userId: string) {
  const orders = await db.order.findMany({
    where: { userId, status: { in: ["PAID", "SHIPPED", "DELIVERED"] }, items: { some: { type: "DIGITAL" } } },
    include: { items: { where: { type: "DIGITAL" }, include: { product: { select: { name: true, slug: true, digitalAssets: { select: { id: true, name: true } } } } } } },
    orderBy: { createdAt: "desc" },
  });
  const seen = new Set<string>();
  return orders.flatMap((o) =>
    buildDownloads(o)
      .filter((d) => !seen.has(d.assetId) && seen.add(d.assetId))
      .map((d) => ({ ...d, orderNumber: o.number, purchasedAt: o.createdAt, slug: o.items.find((i) => i.product?.name === d.productName)?.product?.slug })),
  );
}
