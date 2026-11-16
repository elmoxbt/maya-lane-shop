import { getDiscountCodes } from "@/server/queries/admin";
import { PageHeader } from "@/components/admin/page-header";
import { DiscountForm } from "@/components/admin/discount-form";
import { DiscountRowActions } from "@/components/admin/discount-row-actions";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { describeDiscount } from "@/lib/discounts";
import { formatDate, formatPrice } from "@/lib/format";

export const metadata = { title: "Discount codes" };

function state(d: { active: boolean; expiresAt: Date | null; maxUses: number | null; usedCount: number }) {
  if (!d.active) return { label: "Paused", cls: "bg-muted text-muted-foreground" };
  if (d.expiresAt && d.expiresAt < new Date()) return { label: "Expired", cls: "bg-rose-50 text-rose-800" };
  if (d.maxUses != null && d.usedCount >= d.maxUses) return { label: "Used up", cls: "bg-amber-50 text-amber-800" };
  return { label: "Active", cls: "bg-emerald-50 text-emerald-800" };
}

export default async function DiscountsPage() {
  const codes = await getDiscountCodes();
  return (
    <>
      <PageHeader title="Discount codes" description="Percentage or fixed-amount codes with optional minimums, expiry and usage limits." actions={<DiscountForm />} />
      <div className="overflow-hidden rounded-2xl border bg-white">
        {codes.length === 0 ? (
          <p className="p-12 text-center text-sm text-muted-foreground">No discount codes yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead className="hidden md:table-cell">Minimum</TableHead>
                <TableHead>Used</TableHead>
                <TableHead className="hidden sm:table-cell">Expires</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {codes.map((d) => {
                const s = state(d);
                return (
                  <TableRow key={d.id}>
                    <TableCell>
                      <span className="font-mono font-semibold">{d.code}</span>
                      {d.description && <span className="block max-w-56 truncate text-xs text-muted-foreground">{d.description}</span>}
                    </TableCell>
                    <TableCell>{describeDiscount(d)}</TableCell>
                    <TableCell className="hidden text-muted-foreground md:table-cell">{d.minSubtotalCents ? formatPrice(d.minSubtotalCents) : "—"}</TableCell>
                    <TableCell className="tabular-nums">
                      {d.usedCount}
                      {d.maxUses != null && <span className="text-muted-foreground"> / {d.maxUses}</span>}
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground sm:table-cell">{d.expiresAt ? formatDate(d.expiresAt) : "Never"}</TableCell>
                    <TableCell>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${s.cls}`}>{s.label}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <DiscountRowActions id={d.id} code={d.code} active={d.active} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </>
  );
}
