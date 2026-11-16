import { Download } from "lucide-react";
import { z } from "zod";
import Link from "next/link";
import { getCustomers, getSubscribers } from "@/server/queries/admin";
import { PageHeader } from "@/components/admin/page-header";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate, formatPriceExact } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata = { title: "Customers" };

export default async function CustomersPage({ searchParams }: PageProps<"/admin/customers">) {
  const tab = z.enum(["customers", "subscribers"]).catch("customers").parse((await searchParams).tab);
  const [customers, subscribers] = await Promise.all([getCustomers(), getSubscribers()]);

  return (
    <>
      <PageHeader
        title="Customers & subscribers"
        description={`${customers.length} customers · ${subscribers.length} email subscribers`}
        actions={
          <a href={`/admin/export/${tab}`} className="inline-flex h-10 items-center gap-2 rounded-full border bg-white px-4 text-sm font-semibold hover:border-ink" download>
            <Download className="size-4" aria-hidden /> Export {tab} CSV
          </a>
        }
      />
      <nav aria-label="Lists" className="mb-4 flex gap-1">
        {(["customers", "subscribers"] as const).map((t) => (
          <Link key={t} href={`/admin/customers?tab=${t}`} aria-current={tab === t ? "page" : undefined} className={cn("rounded-full px-4 py-1.5 text-sm font-medium capitalize", tab === t ? "bg-ink text-white" : "bg-white hover:bg-muted")}>
            {t}
          </Link>
        ))}
      </nav>
      <div className="overflow-hidden rounded-2xl border bg-white">
        {tab === "customers" ? (
          customers.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead className="text-right">Orders</TableHead>
                  <TableHead className="text-right">Spent</TableHead>
                  <TableHead className="hidden md:table-cell">Last order</TableHead>
                  <TableHead className="hidden sm:table-cell">Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>
                      <span className="font-medium">{c.name ?? "—"}</span>
                      <span className="block text-xs text-muted-foreground">{c.email}</span>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{c.orders}</TableCell>
                    <TableCell className="text-right font-semibold tabular-nums">{formatPriceExact(c.spentCents)}</TableCell>
                    <TableCell className="hidden text-muted-foreground md:table-cell">{c.lastOrderAt ? formatDate(c.lastOrderAt) : "—"}</TableCell>
                    <TableCell className="hidden text-muted-foreground sm:table-cell">{formatDate(c.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="p-12 text-center text-sm text-muted-foreground">No customers yet.</p>
          )
        ) : subscribers.length ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Source</TableHead>
                <TableHead className="hidden sm:table-cell">Free plan sent</TableHead>
                <TableHead>Subscribed</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscribers.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.email}</TableCell>
                  <TableCell>
                    <span className="rounded-full bg-muted px-2.5 py-1 text-xs">{s.source}</span>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">{s.leadMagnetSentAt ? "Yes" : "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(s.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="p-12 text-center text-sm text-muted-foreground">No subscribers yet.</p>
        )}
      </div>
    </>
  );
}
