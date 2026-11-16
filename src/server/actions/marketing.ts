"use server";

import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { absoluteUrl } from "@/lib/format";
import { fail, fromZod, ok, type ActionResult } from "@/lib/action-result";
import { inquirySchema, subscribeSchema } from "@/lib/validations";
import { limits, rateLimit } from "@/server/rate-limit";
import { InquiryNotificationEmail, InquiryReceiptEmail, LeadMagnetEmail } from "@/emails/templates";
import { siteConfig } from "@/config/site";

export async function subscribe(input: unknown): Promise<ActionResult<{ alreadySubscribed: boolean }>> {
  const parsed = subscribeSchema.safeParse(input);
  if (!parsed.success) return fromZod(parsed.error);
  if (parsed.data.company) return ok({ alreadySubscribed: false }); // honeypot: pretend success

  const rl = await rateLimit("subscribe", limits.subscribe);
  if (!rl.ok) return fail("Too many attempts. Please try again in a few minutes.");

  const { email, source } = parsed.data;
  const existing = await db.subscriber.findUnique({ where: { email } });
  if (existing?.leadMagnetSentAt) return ok({ alreadySubscribed: true }, "You're already on the list! Check your inbox for the plan.");

  await db.subscriber.upsert({ where: { email }, create: { email, source }, update: {} });
  const sent = await sendEmail({
    to: email,
    subject: "Your free 7-day workout plan 💪",
    react: LeadMagnetEmail({ downloadUrl: absoluteUrl("/downloads/free-7-day-workout-plan.pdf") }),
  });
  if (sent.ok) await db.subscriber.update({ where: { email }, data: { leadMagnetSentAt: new Date() } });
  return ok({ alreadySubscribed: false }, "You're in! Your free plan is on its way to your inbox.");
}

export async function submitBrandInquiry(input: unknown): Promise<ActionResult> {
  const parsed = inquirySchema.safeParse(input);
  if (!parsed.success) return fromZod(parsed.error);
  if (parsed.data.hp) return ok(undefined);

  const rl = await rateLimit("inquiry", limits.inquiry);
  if (!rl.ok) return fail("You've sent a few inquiries already. Please try again later or email us directly.");

  const { name, email, company, budget, message, website } = parsed.data;
  const inquiry = await db.brandInquiry.create({ data: { name, email, company, budget, message, website: website || null } });

  const notifyTo = process.env.INQUIRY_NOTIFY_EMAIL ?? process.env.ADMIN_EMAIL;
  await Promise.all([
    notifyTo
      ? sendEmail({ to: notifyTo, subject: `New brand inquiry: ${inquiry.company}`, react: InquiryNotificationEmail({ inquiry }), replyTo: inquiry.email })
      : null,
    sendEmail({ to: inquiry.email, subject: "Thanks for reaching out to Maya Lane", react: InquiryReceiptEmail({ name: inquiry.name }), replyTo: siteConfig.partnershipsEmail }),
  ]);
  return ok(undefined, "Thanks! We'll be in touch within three business days.");
}
