import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import { getAdminProducts } from "@/server/queries/admin";
import { PageHeader } from "@/components/admin/page-header";
import { PublishToggle } from "@/components/admin/publish-toggle";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { categoryLabels } from "@/config/site";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata = { title: "Products" };

export default async function AdminProductsPage() {
  const products = await getAdminProducts();
  return (
    <>
      <PageHeader
        title="Products"
        description={`${products.length} products · ${products.filter((p) => p.published).length} live`}
        actions={
          <Link href="/admin/products/new" className="inline-flex h-10 items-center gap-2 rounded-full bg-ink px-4 text-sm font-semibold text-white">
            <Plus className="size-4" aria-hidden /> New product
          </Link>
        }
      />
      <div className="overflow-hidden rounded-2xl border bg-white">
        {products.length === 0 ? (
          <div className="p-12 text-center">
            <p className="font-semibold">No products yet</p>
            <Link href="/admin/products/new" className="mt-3 inline-block text-sm font-semibold underline underline-offset-4">
              Create your first product
            </Link>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead className="hidden md:table-cell">Category</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="hidden text-right sm:table-cell">Stock</TableHead>
                <TableHead className="hidden text-right lg:table-cell">Sold</TableHead>
                <TableHead className="text-right">Live</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <Link href={`/admin/products/${p.id}`} className="flex items-center gap-3 font-medium hover:underline">
                      <span className="relative size-11 shrink-0 overflow-hidden rounded-lg bg-muted">{p.images[0] && <Image src={p.images[0].url} alt="" fill sizes="44px" className="object-cover" />}</span>
                      <span className="min-w-0">
                        <span className="block max-w-56 truncate">{p.name}</span>
                        <span className="text-xs font-normal text-muted-foreground">{p.type === "DIGITAL" ? "Digital" : `${p.variants.length} variants`}</span>
                      </span>
                    </Link>
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground md:table-cell">{categoryLabels[p.category]}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatPrice(p.priceCents)}</TableCell>
                  <TableCell className={cn("hidden text-right tabular-nums sm:table-cell", p.type === "PHYSICAL" && p.totalStock <= 10 && "font-semibold text-destructive")}>{p.type === "DIGITAL" ? "∞" : p.totalStock}</TableCell>
                  <TableCell className="hidden text-right text-muted-foreground tabular-nums lg:table-cell">{p.salesCount.toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <PublishToggle id={p.id} published={p.published} name={p.name} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </>
  );
}
