import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { AuthError, requireAdmin } from "@/server/auth-guards";

export const runtime = "nodejs";

const MAX_BYTES = 50 * 1024 * 1024;
const ALLOWED = ["application/pdf", "application/zip", "application/x-zip-compressed", "application/epub+zip"];

/**
 * Local-disk upload for digital files, used only when Cloudinary isn't configured (local development).
 * Serverless hosts like Vercel have a read-only filesystem, so production uploads go to Cloudinary.
 */
export async function POST(req: Request) {
  try {
    await requireAdmin("write");
  } catch (err) {
    return NextResponse.json({ error: err instanceof AuthError ? err.message : "Unauthorized" }, { status: 403 });
  }
  if (process.env.VERCEL) return NextResponse.json({ error: "Local uploads are disabled on Vercel. Configure Cloudinary." }, { status: 400 });

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "No file" }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "File is larger than 50 MB" }, { status: 400 });
  if (!ALLOWED.includes(file.type)) return NextResponse.json({ error: "Only PDF, ZIP and EPUB files are allowed" }, { status: 400 });

  const safeName = file.name.replace(/[^\w .()-]/g, "_").slice(0, 120);
  const key = `uploads/${randomUUID()}-${safeName}`;
  const dest = path.join(process.cwd(), "storage", key);
  await mkdir(path.dirname(dest), { recursive: true });
  await writeFile(dest, Buffer.from(await file.arrayBuffer()));
  return NextResponse.json({ key, fileName: safeName, mimeType: file.type, sizeBytes: file.size });
}
