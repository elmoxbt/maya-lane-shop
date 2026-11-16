import { z } from "zod";

const optionalNumber = z.preprocess((v) => (v === "" || v == null || Number.isNaN(v) ? undefined : v), z.coerce.number().optional());

export const discountFormSchema = z
  .object({
    code: z.string().trim().toUpperCase().min(3, "At least 3 characters").max(32).regex(/^[A-Z0-9_-]+$/, "Letters, numbers, dashes and underscores only"),
    description: z.string().trim().max(120).optional(),
    type: z.enum(["PERCENTAGE", "FIXED"]),
    value: z.coerce.number().positive("Must be more than 0"),
    minSubtotal: optionalNumber.pipe(z.number().min(0).optional()),
    maxUses: optionalNumber.pipe(z.number().int().positive().optional()),
    expiresAt: z.string().optional(),
  })
  .refine((d) => d.type !== "PERCENTAGE" || d.value <= 100, { path: ["value"], message: "Percentage can't exceed 100" })
  .refine((d) => !d.expiresAt || new Date(`${d.expiresAt}T23:59:59`) > new Date(), { path: ["expiresAt"], message: "Expiry must be in the future" });

export type DiscountFormValues = z.input<typeof discountFormSchema>;

const slug = z.string().trim().toLowerCase().min(3).max(80).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Lowercase letters, numbers and single dashes");
const dollars = z.coerce.number().min(0.5, "At least $0.50").max(10000);

export const variantFormSchema = z.object({
  id: z.string().optional(),
  sku: z.string().trim().min(3, "SKU required").max(40).regex(/^[A-Za-z0-9_-]+$/, "Letters, numbers and dashes"),
  size: z.string().trim().max(10).optional(),
  color: z.string().trim().max(30).optional(),
  colorHex: z.string().trim().regex(/^#[0-9a-fA-F]{6}$/, "Use a hex like #C2410C").optional().or(z.literal("")),
  price: optionalNumber.pipe(z.number().min(0.5).max(10000).optional()),
  stock: z.coerce.number().int().min(0, "Can't be negative").max(100000),
});

export const imageFormSchema = z.object({
  id: z.string().optional(),
  url: z.string().url("Must be a full URL").refine((u) => /^https:\/\/(images\.unsplash\.com|res\.cloudinary\.com)\//.test(u), "Use a Cloudinary upload or an Unsplash URL"),
  alt: z.string().trim().min(3, "Describe the image for screen readers").max(160),
  publicId: z.string().optional().nullable(),
});

export const productFormSchema = z
  .object({
    id: z.string().optional(),
    name: z.string().trim().min(3, "Name is required").max(100),
    slug,
    tagline: z.string().trim().min(3, "Add a one-line tagline").max(140),
    description: z.string().trim().min(20, "Write at least a couple of sentences").max(4000),
    details: z.array(z.object({ value: z.string().trim().min(1).max(200) })).max(12),
    type: z.enum(["PHYSICAL", "DIGITAL"]),
    category: z.enum(["APPAREL", "ACCESSORIES", "GUIDES", "PRESETS"]),
    price: dollars,
    compareAt: optionalNumber.pipe(z.number().min(0).max(10000).optional()),
    badge: z.string().trim().max(24).optional(),
    published: z.boolean(),
    featured: z.boolean(),
    inGiftGuide: z.boolean(),
    images: z.array(imageFormSchema).max(10),
    variants: z.array(variantFormSchema).min(1, "Add at least one variant").max(60),
  })
  .refine((p) => !p.compareAt || p.compareAt > p.price, { path: ["compareAt"], message: "Compare-at price should be higher than the price" })
  .refine((p) => new Set(p.variants.map((v) => `${v.color ?? ""}|${v.size ?? ""}`)).size === p.variants.length, { path: ["variants"], message: "Two variants have the same colour and size" })
  .refine((p) => new Set(p.variants.map((v) => v.sku.toUpperCase())).size === p.variants.length, { path: ["variants"], message: "SKUs must be unique" })
  .refine((p) => !p.published || p.images.length > 0, { path: ["images"], message: "Add at least one image before publishing" });

export type ProductFormValues = z.input<typeof productFormSchema>;
