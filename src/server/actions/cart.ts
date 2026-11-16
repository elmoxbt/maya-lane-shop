"use server";

import { z } from "zod";
import { auth } from "@/auth";
import { cartLinesSchema } from "@/lib/validations";
import { fail, ok, type ActionResult } from "@/lib/action-result";
import { hydrateLines, readUserCart, writeUserCart } from "@/server/cart";
import type { CartLine } from "@/stores/cart-store";

type CartPayload = { lines: CartLine[]; notices: string[] };

/** Re-prices and validates a guest cart against the database. */
export async function refreshCart(input: unknown): Promise<ActionResult<CartPayload>> {
  const parsed = cartLinesSchema.safeParse(input);
  if (!parsed.success) return fail("Invalid cart");
  return ok(await hydrateLines(parsed.data));
}

const syncSchema = z.object({ lines: cartLinesSchema, mode: z.enum(["merge", "replace"]) });

/**
 * Logged-in cart sync.
 * - merge: called right after sign-in, combines the local (guest) cart with the saved DB cart
 * - replace: called after each local change, makes the DB cart match
 */
export async function syncCart(input: unknown): Promise<ActionResult<CartPayload>> {
  const session = await auth();
  if (!session?.user) return fail("Not signed in");
  const parsed = syncSchema.safeParse(input);
  if (!parsed.success) return fail("Invalid cart");

  const { lines, mode } = parsed.data;
  const combined = mode === "merge" ? [...(await readUserCart(session.user.id)), ...lines] : lines;
  const hydrated = await hydrateLines(combined);
  await writeUserCart(
    session.user.id,
    hydrated.lines.map((l) => ({ variantId: l.variantId, quantity: l.quantity })),
  );
  return ok(hydrated);
}
