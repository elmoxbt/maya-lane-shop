import { NextResponse } from "next/server";
import { requireAdmin } from "@/server/auth-guards";
import { getSubscribers } from "@/server/queries/admin";
import { toCsv } from "@/lib/csv";

export async function GET() {
  try {
    await requireAdmin("read");
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const subs = await getSubscribers();
  const csv = toCsv(
    ["Email", "Source", "Lead magnet sent", "Subscribed"],
    subs.map((s) => [s.email, s.source, s.leadMagnetSentAt ? "yes" : "no", s.createdAt.toISOString()]),
  );
  return new NextResponse(csv, {
    headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": `attachment; filename="subscribers-${new Date().toISOString().slice(0, 10)}.csv"`, "cache-control": "no-store" },
  });
}
