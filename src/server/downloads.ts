import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { absoluteUrl } from "@/lib/format";

export const DOWNLOAD_TTL_HOURS = 72;

type Payload = { o: string; a: string; exp: number };

function secret() {
  const s = process.env.DOWNLOAD_TOKEN_SECRET ?? process.env.AUTH_SECRET;
  if (!s) throw new Error("DOWNLOAD_TOKEN_SECRET is not set");
  return s;
}

const b64 = (b: Buffer | string) => Buffer.from(b).toString("base64url");
const sign = (data: string) => createHmac("sha256", secret()).update(data).digest("base64url");

/** Stateless, tamper-proof, expiring download token bound to one order + one asset. */
export function createDownloadToken(orderId: string, assetId: string, ttlHours = DOWNLOAD_TTL_HOURS) {
  const payload: Payload = { o: orderId, a: assetId, exp: Math.floor(Date.now() / 1000) + ttlHours * 3600 };
  const body = b64(JSON.stringify(payload));
  return `${body}.${sign(body)}`;
}

export function verifyDownloadToken(token: string): { ok: true; orderId: string; assetId: string; expiresAt: Date } | { ok: false; reason: "invalid" | "expired" } {
  const [body, sig] = token.split(".");
  if (!body || !sig) return { ok: false, reason: "invalid" };
  const expected = Buffer.from(sign(body));
  const given = Buffer.from(sig);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return { ok: false, reason: "invalid" };
  try {
    const p = JSON.parse(Buffer.from(body, "base64url").toString()) as Payload;
    if (!p.o || !p.a || !p.exp) return { ok: false, reason: "invalid" };
    if (p.exp * 1000 < Date.now()) return { ok: false, reason: "expired" };
    return { ok: true, orderId: p.o, assetId: p.a, expiresAt: new Date(p.exp * 1000) };
  } catch {
    return { ok: false, reason: "invalid" };
  }
}

export function downloadUrl(orderId: string, assetId: string) {
  return absoluteUrl(`/api/downloads/${createDownloadToken(orderId, assetId)}`);
}

export const DOWNLOADABLE_STATUSES = ["PAID", "SHIPPED", "DELIVERED"] as const;

/** Builds fresh signed links for every digital asset in an order. */
export function buildDownloads(order: { id: string; status: string; items: { product: { name: string; digitalAssets: { id: string; name: string }[] } | null }[] }) {
  if (!(DOWNLOADABLE_STATUSES as readonly string[]).includes(order.status)) return [];
  return order.items.flatMap((item) =>
    (item.product?.digitalAssets ?? []).map((asset) => ({ assetId: asset.id, name: asset.name, productName: item.product!.name, url: downloadUrl(order.id, asset.id) })),
  );
}
