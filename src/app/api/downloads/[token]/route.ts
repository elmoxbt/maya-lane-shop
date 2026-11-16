import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { DOWNLOADABLE_STATUSES, verifyDownloadToken } from "@/server/downloads";
import { cloudinaryPrivateDownloadUrl } from "@/lib/cloudinary";

export const runtime = "nodejs";

const STORAGE_ROOT = path.join(process.cwd(), "storage");

function errorPage(title: string, message: string, status: number) {
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title>
<style>body{font-family:system-ui,sans-serif;background:#f6f3ee;color:#1a1918;display:grid;place-items:center;min-height:100vh;margin:0;padding:16px}main{background:#fff;border-radius:20px;padding:32px;max-width:420px}h1{margin:0 0 8px;font-size:24px}a{color:#b8400f;font-weight:600}</style></head>
<body><main><h1>${title}</h1><p>${message}</p><p><a href="/account/orders">Go to your orders</a> to get a fresh link.</p></main></body></html>`;
  return new NextResponse(html, { status, headers: { "content-type": "text/html; charset=utf-8" } });
}

export async function GET(_req: Request, ctx: RouteContext<"/api/downloads/[token]">) {
  const { token } = await ctx.params;
  const v = verifyDownloadToken(token);
  if (!v.ok) {
    return v.reason === "expired"
      ? errorPage("This link has expired", "For your security, download links expire after 72 hours.", 410)
      : errorPage("Invalid download link", "This link isn't valid. It may have been copied incorrectly.", 404);
  }

  const order = await db.order.findUnique({ where: { id: v.orderId }, include: { items: { select: { productId: true } } } });
  if (!order || !(DOWNLOADABLE_STATUSES as readonly string[]).includes(order.status)) {
    return errorPage("Download unavailable", "This order isn't eligible for downloads. If you think this is a mistake, reply to your order email.", 403);
  }
  const asset = await db.digitalAsset.findUnique({ where: { id: v.assetId } });
  if (!asset || !order.items.some((i) => i.productId === asset.productId)) {
    return errorPage("Download unavailable", "We couldn't find that file on your order.", 404);
  }

  if (asset.storage === "CLOUDINARY") {
    return NextResponse.redirect(cloudinaryPrivateDownloadUrl(asset.key, asset.fileName), 302);
  }

  const filePath = path.join(STORAGE_ROOT, asset.key);
  if (!filePath.startsWith(STORAGE_ROOT + path.sep)) return errorPage("Invalid download link", "That file path isn't allowed.", 400);
  try {
    const file = await readFile(filePath);
    return new NextResponse(new Uint8Array(file), {
      headers: {
        "content-type": asset.mimeType,
        "content-length": String(file.byteLength),
        "content-disposition": `attachment; filename="${asset.fileName.replace(/"/g, "")}"`,
        "cache-control": "private, no-store",
        "x-robots-tag": "noindex",
      },
    });
  } catch {
    return errorPage("File missing", "We couldn't load this file. Our team has been notified.", 500);
  }
}
