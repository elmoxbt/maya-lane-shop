"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { fail, fromZod, ok, type ActionResult } from "@/lib/action-result";
import { reviewSchema } from "@/lib/validations";
import { limits, rateLimit } from "@/server/rate-limit";

export async function submitReview(input: unknown): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return fail("Please sign in to leave a review.");
  const parsed = reviewSchema.safeParse(input);
  if (!parsed.success) return fromZod(parsed.error);

  const rl = await rateLimit("review", limits.review);
  if (!rl.ok) return fail("You've posted a few reviews recently. Please try again later.");

  const { productId, ...data } = parsed.data;
  const product = await db.product.findUnique({ where: { id: productId }, select: { slug: true, published: true } });
  if (!product?.published) return fail("That product isn't available.");

  const existing = await db.review.findFirst({ where: { productId, userId: session.user.id }, select: { id: true } });
  if (existing) return fail("You've already reviewed this product. Thank you!");

  const purchased = await db.orderItem.findFirst({
    where: { productId, order: { userId: session.user.id, status: { in: ["PAID", "SHIPPED", "DELIVERED"] } } },
    select: { id: true },
  });

  const name = session.user.name?.trim() || session.user.email?.split("@")[0] || "Lane Club member";
  const [first, last] = name.split(" ");
  await db.review.create({
    data: { ...data, productId, userId: session.user.id, authorName: last ? `${first} ${last[0]}.` : first, verified: Boolean(purchased) },
  });
  revalidatePath(`/products/${product.slug}`);
  return ok(undefined, "Thanks for your review! It's live now.");
}
