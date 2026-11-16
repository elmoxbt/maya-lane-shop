import { PageHeader } from "@/components/admin/page-header";
import { ProductForm } from "@/components/admin/product-form";
import { integrations } from "@/lib/env";

export const metadata = { title: "New product" };

export default function NewProductPage() {
  return (
    <>
      <PageHeader title="New product" description="Save it as a draft first, then publish when it's ready." />
      <ProductForm cloudinary={integrations.cloudinary} />
    </>
  );
}
