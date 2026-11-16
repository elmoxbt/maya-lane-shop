"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { fail, fromZod, ok } from "@/lib/action-result";
import { productFormSchema } from "@/lib/validations-admin";
import { integrations } from "@/lib/env";
import { signUpload } from "@/lib/cloudinary";
import { withAdmin } from "./guard";

function revalidateStore(slug?: string) {
  revalidatePath("/", "layout");
  if (slug) revalidatePath(`/products/${slug}`);
}

export async function saveProduct(input: unknown) {
  return withAdmin(async () => {
    const parsed = productFormSchema.safeParse(input);
    if (!parsed.success) return fromZod(parsed.error);
    const p = parsed.data;

    const slugOwner = await db.product.findUnique({ where: { slug: p.slug }, select: { id: true } });
    if (slugOwner && slugOwner.id !== p.id) return fail("Another product already uses that URL slug.", { slug: ["Already in use"] });

    const skuOwners = await db.productVariant.findMany({ where: { sku: { in: p.variants.map((v) => v.sku.toUpperCase()) } }, select: { sku: true, productId: true } });
    const clash = skuOwners.find((s) => s.productId !== p.id);
    if (clash) return fail(`SKU ${clash.sku} is used by another product.`, { variants: [`SKU ${clash.sku} is taken`] });

    const data = {
      name: p.name,
      slug: p.slug,
      tagline: p.tagline,
      description: p.description,
      details: p.details.map((d) => d.value),
      type: p.type,
      category: p.category,
      priceCents: Math.round(p.price * 100),
      compareAtCents: p.compareAt ? Math.round(p.compareAt * 100) : null,
      badge: p.badge || null,
      published: p.published,
      featured: p.featured,
      inGiftGuide: p.inGiftGuide,
    };

    const id = await db.$transaction(async (tx) => {
      const product = p.id ? await tx.product.update({ where: { id: p.id }, data }) : await tx.product.create({ data });

      const keepVariantIds = p.variants.map((v) => v.id).filter(Boolean) as string[];
      await tx.productVariant.deleteMany({ where: { productId: product.id, id: { notIn: keepVariantIds } } });
      for (const [position, v] of p.variants.entries()) {
        const variant = {
          sku: v.sku.toUpperCase(),
          size: v.size || null,
          color: v.color || null,
          colorHex: v.colorHex || null,
          priceCents: v.price ? Math.round(v.price * 100) : null,
          stock: p.type === "DIGITAL" ? 0 : v.stock,
          position,
        };
        if (v.id) await tx.productVariant.update({ where: { id: v.id, productId: product.id }, data: variant });
        else await tx.productVariant.create({ data: { ...variant, productId: product.id } });
      }

      const keepImageIds = p.images.map((i) => i.id).filter(Boolean) as string[];
      await tx.productImage.deleteMany({ where: { productId: product.id, id: { notIn: keepImageIds } } });
      for (const [position, img] of p.images.entries()) {
        const image = { url: img.url, alt: img.alt, publicId: img.publicId ?? null, position };
        if (img.id) await tx.productImage.update({ where: { id: img.id, productId: product.id }, data: image });
        else await tx.productImage.create({ data: { ...image, productId: product.id } });
      }
      return product.id;
    });

    revalidateStore(p.slug);
    revalidatePath("/admin/products");
    return ok({ id }, p.id ? "Product saved." : "Product created.");
  });
}

const idSchema = z.object({ id: z.string().cuid() });

export async function setProductPublished(input: unknown) {
  return withAdmin(async () => {
    const parsed = idSchema.extend({ published: z.boolean() }).safeParse(input);
    if (!parsed.success) return fromZod(parsed.error);
    const product = await db.product.findUnique({ where: { id: parsed.data.id }, include: { _count: { select: { images: true } } } });
    if (!product) return fail("Product not found.");
    if (parsed.data.published && product._count.images === 0) return fail("Add an image before publishing.");
    await db.product.update({ where: { id: product.id }, data: { published: parsed.data.published } });
    revalidateStore(product.slug);
    revalidatePath("/admin/products");
    return ok(undefined, parsed.data.published ? `${product.name} is live.` : `${product.name} is hidden from the store.`);
  });
}

export async function deleteProduct(input: unknown) {
  return withAdmin(async () => {
    const parsed = idSchema.safeParse(input);
    if (!parsed.success) return fromZod(parsed.error);
    const product = await db.product.findUnique({ where: { id: parsed.data.id }, select: { slug: true, name: true } });
    if (!product) return fail("Product not found.");
    // Order history keeps its own snapshot (name, price, image), so past orders stay intact.
    await db.product.delete({ where: { id: parsed.data.id } });
    revalidateStore(product.slug);
    revalidatePath("/admin/products");
    return ok(undefined, `${product.name} deleted.`);
  });
}

export async function getUploadSignature(input: unknown) {
  return withAdmin(async () => {
    const parsed = z.object({ kind: z.enum(["image", "digital"]) }).safeParse(input);
    if (!parsed.success) return fromZod(parsed.error);
    if (!integrations.cloudinary) return fail("Cloudinary isn't configured. Add CLOUDINARY_* env vars, or paste an image URL instead.");
    return ok(signUpload(parsed.data.kind));
  });
}

const assetSchema = z.object({
  productId: z.string().cuid(),
  name: z.string().trim().min(2).max(100),
  fileName: z.string().trim().min(1).max(160).regex(/^[\w .()-]+$/, "Unsupported characters in file name"),
  mimeType: z.string().max(100),
  sizeBytes: z.number().int().positive().max(200 * 1024 * 1024),
  storage: z.enum(["LOCAL", "CLOUDINARY"]),
  key: z.string().min(1).max(300).refine((k) => !k.includes(".."), "Invalid key"),
});

export async function addDigitalAsset(input: unknown) {
  return withAdmin(async () => {
    const parsed = assetSchema.safeParse(input);
    if (!parsed.success) return fromZod(parsed.error);
    const asset = await db.digitalAsset.create({ data: parsed.data });
    revalidatePath(`/admin/products/${parsed.data.productId}`);
    return ok({ id: asset.id }, "File attached.");
  });
}

export async function deleteDigitalAsset(input: unknown) {
  return withAdmin(async () => {
    const parsed = idSchema.safeParse(input);
    if (!parsed.success) return fromZod(parsed.error);
    const asset = await db.digitalAsset.delete({ where: { id: parsed.data.id } });
    revalidatePath(`/admin/products/${asset.productId}`);
    return ok(undefined, "File removed.");
  });
}
