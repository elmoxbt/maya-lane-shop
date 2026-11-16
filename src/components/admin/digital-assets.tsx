"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FileText, Loader2, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { addDigitalAsset, deleteDigitalAsset, getUploadSignature } from "@/server/actions/admin/products";

type Asset = { id: string; name: string; fileName: string; sizeBytes: number; storage: string };

const kb = (b: number) => (b > 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(1)} MB` : `${Math.round(b / 1024)} KB`);

export function DigitalAssets({ productId, assets, cloudinary }: { productId: string; assets: Asset[]; cloudinary: boolean }) {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [pending, start] = useTransition();

  async function upload(file: File) {
    setUploading(true);
    try {
      let stored: { storage: "LOCAL" | "CLOUDINARY"; key: string; fileName: string; mimeType: string; sizeBytes: number };
      if (cloudinary) {
        const sig = await getUploadSignature({ kind: "digital" });
        if (!sig.ok) throw new Error(sig.error);
        const { cloudName, apiKey, signature, timestamp, folder, type } = sig.data as Record<string, string>;
        const body = new FormData();
        body.append("file", file);
        body.append("api_key", apiKey);
        body.append("timestamp", String(timestamp));
        body.append("signature", signature);
        body.append("folder", folder);
        body.append("type", type);
        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`, { method: "POST", body });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error?.message ?? "Upload failed");
        stored = { storage: "CLOUDINARY", key: json.public_id, fileName: file.name.replace(/[^\w .()-]/g, "_"), mimeType: file.type || "application/octet-stream", sizeBytes: file.size };
      } else {
        const body = new FormData();
        body.append("file", file);
        const res = await fetch("/api/admin/upload", { method: "POST", body });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "Upload failed");
        stored = { storage: "LOCAL", ...json };
      }
      const res = await addDigitalAsset({ productId, name: stored.fileName.replace(/\.[^.]+$/, ""), ...stored });
      if (!res.ok) throw new Error(res.error);
      toast.success(res.message);
      router.refresh();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <section className="rounded-2xl border bg-white p-5 sm:p-6" aria-labelledby="assets-heading">
      <h2 id="assets-heading" className="font-semibold">
        Downloadable files
      </h2>
      <p className="mt-0.5 text-sm text-muted-foreground">
        Buyers get signed links that expire after 72 hours. Files are stored privately ({cloudinary ? "Cloudinary, authenticated" : "local disk, dev only"}).
      </p>
      {assets.length ? (
        <ul className="mt-4 divide-y rounded-xl border">
          {assets.map((a) => (
            <li key={a.id} className="flex items-center gap-3 p-3 text-sm">
              <FileText className="size-5 text-muted-foreground" aria-hidden />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium">{a.name}</span>
                <span className="text-xs text-muted-foreground">
                  {a.fileName} · {kb(a.sizeBytes)} · {a.storage.toLowerCase()}
                </span>
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={pending}
                aria-label={`Remove ${a.name}`}
                onClick={() =>
                  start(async () => {
                    const res = await deleteDigitalAsset({ id: a.id });
                    if (res.ok) {
                      toast.success(res.message);
                      router.refresh();
                    } else toast.error(res.error);
                  })
                }
              >
                <Trash2 aria-hidden />
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">No files yet. Buyers won&apos;t receive anything until you upload one.</p>
      )}
      <label className="mt-4 inline-flex h-10 cursor-pointer items-center gap-2 rounded-md border px-4 text-sm font-medium hover:bg-muted has-disabled:pointer-events-none has-disabled:opacity-50">
        {uploading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Upload className="size-4" aria-hidden />}
        Upload PDF or ZIP
        <input type="file" accept=".pdf,.zip,.epub,application/pdf,application/zip" className="sr-only" disabled={uploading} onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
      </label>
    </section>
  );
}
