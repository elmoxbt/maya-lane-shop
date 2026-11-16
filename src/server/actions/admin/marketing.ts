"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { fail, fromZod, ok } from "@/lib/action-result";
import { withAdmin } from "./guard";
import { discountFormSchema } from "@/lib/validations-admin";

export async function createDiscount(input: unknown) {
  return withAdmin(async () => {
    const parsed = discountFormSchema.safeParse(input);
    if (!parsed.success) return fromZod(parsed.error);
    const d = parsed.data;
    const exists = await db.discountCode.findUnique({ where: { code: d.code } });
    if (exists) return fail("That code already exists.", { code: ["That code already exists"] });
    await db.discountCode.create({
      data: {
        code: d.code,
        description: d.description || null,
        type: d.type,
        value: d.type === "PERCENTAGE" ? Math.round(d.value) : Math.round(d.value * 100),
        minSubtotalCents: d.minSubtotal ? Math.round(d.minSubtotal * 100) : null,
        maxUses: d.maxUses ?? null,
        expiresAt: d.expiresAt ? new Date(`${d.expiresAt}T23:59:59`) : null,
      },
    });
    revalidatePath("/admin/discounts");
    return ok(undefined, `${d.code} created.`);
  });
}

const idSchema = z.object({ id: z.string().cuid() });

export async function toggleDiscount(input: unknown) {
  return withAdmin(async () => {
    const parsed = idSchema.extend({ active: z.boolean() }).safeParse(input);
    if (!parsed.success) return fromZod(parsed.error);
    await db.discountCode.update({ where: { id: parsed.data.id }, data: { active: parsed.data.active } });
    revalidatePath("/admin/discounts");
    return ok(undefined, parsed.data.active ? "Code activated." : "Code paused.");
  });
}

export async function deleteDiscount(input: unknown) {
  return withAdmin(async () => {
    const parsed = idSchema.safeParse(input);
    if (!parsed.success) return fromZod(parsed.error);
    await db.discountCode.delete({ where: { id: parsed.data.id } });
    revalidatePath("/admin/discounts");
    return ok(undefined, "Code deleted.");
  });
}

export async function updateInquiryStatus(input: unknown) {
  return withAdmin(async () => {
    const parsed = idSchema.extend({ status: z.enum(["NEW", "IN_PROGRESS", "CLOSED"]) }).safeParse(input);
    if (!parsed.success) return fromZod(parsed.error);
    await db.brandInquiry.update({ where: { id: parsed.data.id }, data: { status: parsed.data.status } });
    revalidatePath("/admin/inquiries");
    revalidatePath("/admin", "layout");
    return ok(undefined, "Inquiry updated.");
  });
}
