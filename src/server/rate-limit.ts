import "server-only";
import { headers } from "next/headers";
import { db } from "@/lib/db";

/**
 * Fixed-window rate limiter backed by Postgres, so it holds across serverless instances
 * without an extra service. One atomic upsert per check.
 */
export async function rateLimit(bucket: string, { limit, windowSeconds }: { limit: number; windowSeconds: number }) {
  const ip = await clientIp();
  const key = `${bucket}:${ip}`;
  const now = new Date();
  const resetAt = new Date(now.getTime() + windowSeconds * 1000);
  const rows = await db.$queryRaw<{ count: number; resetAt: Date }[]>`
    INSERT INTO "RateLimit" ("key", "count", "resetAt") VALUES (${key}, 1, ${resetAt})
    ON CONFLICT ("key") DO UPDATE SET
      "count" = CASE WHEN "RateLimit"."resetAt" < ${now} THEN 1 ELSE "RateLimit"."count" + 1 END,
      "resetAt" = CASE WHEN "RateLimit"."resetAt" < ${now} THEN ${resetAt} ELSE "RateLimit"."resetAt" END
    RETURNING "count", "resetAt"`;
  const row = rows[0];
  const count = Number(row?.count ?? 1);
  return { ok: count <= limit, remaining: Math.max(0, limit - count), resetAt: row?.resetAt ?? resetAt };
}

export async function clientIp() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "local";
}

export const limits = {
  subscribe: { limit: 5, windowSeconds: 60 * 10 },
  inquiry: { limit: 3, windowSeconds: 60 * 30 },
  magicLink: { limit: 5, windowSeconds: 60 * 15 },
  review: { limit: 5, windowSeconds: 60 * 60 },
  checkout: { limit: 15, windowSeconds: 60 * 10 },
  discount: { limit: 20, windowSeconds: 60 * 10 },
} as const;
