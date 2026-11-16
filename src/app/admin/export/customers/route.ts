import { NextResponse } from "next/server";
import { requireAdmin } from "@/server/auth-guards";
import { getCustomers } from "@/server/queries/admin";
import { toCsv } from "@/lib/csv";

export async function GET() {
  try {
    await requireAdmin("read");
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const customers = await getCustomers();
  const csv = toCsv(
    ["Name", "Email", "Orders", "Total spent (USD)", "Last order", "Joined"],
    customers.map((c) => [c.name, c.email, c.orders, (c.spentCents / 100).toFixed(2), c.lastOrderAt?.toISOString().slice(0, 10), c.createdAt.toISOString().slice(0, 10)]),
  );
  return new NextResponse(csv, {
    headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": `attachment; filename="customers-${new Date().toISOString().slice(0, 10)}.csv"`, "cache-control": "no-store" },
  });
}
