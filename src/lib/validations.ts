import { z } from "zod";

export const emailSchema = z.string().trim().toLowerCase().email("Enter a valid email address").max(254);

export const subscribeSchema = z.object({
  email: emailSchema,
  source: z.enum(["lead-magnet", "footer", "checkout", "gift-guide"]).default("footer"),
  // Honeypot: real users never fill this in
  company: z.string().max(0).optional().or(z.literal("")),
});

export const budgetOptions = ["Under $5k", "$5k–$10k", "$10k–$25k", "$25k+", "Gifting / affiliate"] as const;

export const inquirySchema = z.object({
  name: z.string().trim().min(2, "Tell us your name").max(80),
  email: emailSchema,
  company: z.string().trim().min(2, "Which brand are you with?").max(120),
  website: z.string().trim().url("Enter a full URL, like https://brand.com").max(200).optional().or(z.literal("")),
  budget: z.enum(budgetOptions, { message: "Choose a budget range" }),
  message: z.string().trim().min(20, "A couple of sentences about the campaign helps us reply faster").max(3000),
  hp: z.string().max(0).optional().or(z.literal("")),
});

export const reviewSchema = z.object({
  productId: z.string().cuid(),
  rating: z.coerce.number().int().min(1, "Choose a rating").max(5),
  title: z.string().trim().min(3, "Add a short title").max(80),
  body: z.string().trim().min(10, "Tell people a little more").max(1500),
});

export const cartLineSchema = z.object({
  variantId: z.string().min(1).max(40),
  quantity: z.number().int().min(1).max(10),
});
export const cartLinesSchema = z.array(cartLineSchema).max(50);

export const checkoutSchema = z.object({
  items: cartLinesSchema.min(1, "Your cart is empty"),
  discountCode: z.string().trim().toUpperCase().max(40).optional().or(z.literal("")),
});

export const discountCheckSchema = z.object({
  code: z.string().trim().toUpperCase().min(2, "Enter a code").max(40),
  subtotalCents: z.number().int().min(0),
});

export const magicLinkSchema = z.object({
  email: emailSchema,
  callbackUrl: z.string().max(300).optional(),
});
