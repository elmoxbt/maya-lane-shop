import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { getAdminProduct } from "@/server/queries/admin";
import { PageHeader } from "@/components/admin/page-header";
import { ProductForm } from "@/components/admin/product-form";
import { DigitalAssets } from "@/components/admin/digital-assets";
import { DeleteProductButton } from "@/components/admin/delete-product-button";
import { integrations } from "@/lib/env";

export const metadata = { title: "Edit product" };

export default async function EditProductPage({ params }: PageProps<"/admin/products/[id]">) {
  const { id } = await params;
  const product = await getAdminProduct(id);
  if (!product) notFound();

  return (
    <>
      <Link href="/admin/products" className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" aria-hidden /> Products
      </Link>
      <div className="mt-3">
        <PageHeader
          title={product.name}
          actions={
            <>
              {product.published && (
                <Link href={`/products/${product.slug}`} target="_blank" className="inline-flex h-10 items-center gap-2 rounded-full border bg-white px-4 text-sm font-semibold">
                  View in store <ExternalLink className="size-4" aria-hidden />
                </Link>
              )}
              <DeleteProductButton id={product.id} name={product.name} />
            </>
          }
        />
      </div>
      <ProductForm
        cloudinary={integrations.cloudinary}
        product={{
          id: product.id,
          name: product.name,
          slug: product.slug,
          tagline: product.tagline,
          description: product.description,
          details: product.details.map((value) => ({ value })),
          type: product.type,
          category: product.category,
          price: product.priceCents / 100,
          compareAt: product.compareAtCents ? product.compareAtCents / 100 : undefined,
          badge: product.badge ?? "",
          published: product.published,
          featured: product.featured,
          inGiftGuide: product.inGiftGuide,
          images: product.images.map((i) => ({ id: i.id, url: i.url, alt: i.alt, publicId: i.publicId })),
          variants: product.variants.map((v) => ({ id: v.id, sku: v.sku, size: v.size ?? "", color: v.color ?? "", colorHex: v.colorHex ?? "", price: v.priceCents ? v.priceCents / 100 : undefined, stock: v.stock })),
        }}
      />
      {product.type === "DIGITAL" && (
        <div className="mt-6">
          <DigitalAssets productId={product.id} assets={product.digitalAssets.map((a) => ({ id: a.id, name: a.name, fileName: a.fileName, sizeBytes: a.sizeBytes, storage: a.storage }))} cloudinary={integrations.cloudinary} />
        </div>
      )}
    </>
  );
}
