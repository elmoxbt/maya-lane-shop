"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Controller, useFieldArray, useForm, useWatch, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, ImagePlus, Link2, Loader2, Plus, Trash2, Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { productFormSchema, type ProductFormValues } from "@/lib/validations-admin";
import { getUploadSignature, saveProduct } from "@/server/actions/admin/products";
import { categoryLabels } from "@/config/site";
import { cn } from "@/lib/utils";

const empty: ProductFormValues = {
  name: "",
  slug: "",
  tagline: "",
  description: "",
  details: [{ value: "" }],
  type: "PHYSICAL",
  category: "APPAREL",
  price: 0,
  compareAt: undefined,
  badge: "",
  published: false,
  featured: false,
  inGiftGuide: false,
  images: [],
  variants: [{ sku: "", size: "", color: "", colorHex: "", stock: 0 }],
};

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);

function ErrorText({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="text-sm text-destructive">
      {message}
    </p>
  );
}

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border bg-white p-5 sm:p-6">
      <h2 className="font-semibold">{title}</h2>
      {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

export function ProductForm({ product, cloudinary }: { product?: ProductFormValues & { id: string }; cloudinary: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [urlDraft, setUrlDraft] = useState("");
  const [sizeRunColor, setSizeRunColor] = useState("");

  const form = useForm<ProductFormValues>({ resolver: zodResolver(productFormSchema), defaultValues: product ?? empty, mode: "onBlur" });
  const { register, control, formState, setValue } = form;
  const errors = formState.errors;
  const details = useFieldArray({ control, name: "details" });
  const images = useFieldArray({ control, name: "images" });
  const variants = useFieldArray({ control, name: "variants" });
  const type = useWatch({ control, name: "type" });
  const name = useWatch({ control, name: "name" });
  const imageValues = useWatch({ control, name: "images" });
  const variantValues = useWatch({ control, name: "variants" });

  const skuBase = () =>
    (slugify(name || "item")
      .split("-")
      .slice(0, 3)
      .map((w) => w[0])
      .join("") || "ML").toUpperCase();

  async function uploadImage(file: File) {
    setUploading(true);
    try {
      const sig = await getUploadSignature({ kind: "image" });
      if (!sig.ok) throw new Error(sig.error);
      const { cloudName, apiKey, signature, timestamp, folder } = sig.data as Record<string, string>;
      const body = new FormData();
      body.append("file", file);
      body.append("api_key", apiKey);
      body.append("timestamp", String(timestamp));
      body.append("signature", signature);
      body.append("folder", folder);
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: "POST", body });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message ?? "Upload failed");
      images.append({ url: json.secure_url, publicId: json.public_id, alt: `${name || "Product"} photo` });
      toast.success("Image uploaded. Remember to write alt text.");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setUploading(false);
    }
  }

  function addImageUrl() {
    const url = urlDraft.trim();
    if (!url) return;
    images.append({ url, alt: `${name || "Product"} photo`, publicId: null });
    setUrlDraft("");
  }

  function addSizeRun() {
    const color = sizeRunColor.trim();
    const base = skuBase();
    for (const size of ["XS", "S", "M", "L", "XL"]) {
      variants.append({ sku: `ML-${base}-${(color || "STD").slice(0, 3).toUpperCase()}-${size}`, size, color, colorHex: "", stock: 0 });
    }
    setSizeRunColor("");
  }

  const onSubmit = form.handleSubmit(
    (values) =>
      start(async () => {
        const res = await saveProduct({ ...values, id: product?.id });
        if (!res.ok) {
          toast.error(res.error);
          for (const [key, msgs] of Object.entries(res.fieldErrors ?? {})) if (msgs?.[0]) form.setError(key as keyof ProductFormValues, { message: msgs[0] });
          return;
        }
        toast.success(res.message);
        if (!product) router.push(`/admin/products/${res.data.id}`);
        else router.refresh();
      }),
    (errs: FieldErrors<ProductFormValues>) => {
      toast.error("Please fix the highlighted fields.");
      const first = Object.keys(errs)[0];
      document.querySelector<HTMLElement>(`[name^="${first}"]`)?.focus();
    },
  );

  return (
    <form onSubmit={onSubmit} noValidate className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="min-w-0 space-y-6">
        <Section title="Basics">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                className="h-10"
                aria-invalid={Boolean(errors.name)}
                aria-describedby="name-error"
                {...register("name", {
                  onChange: (e) => {
                    if (!product && !formState.dirtyFields.slug) setValue("slug", slugify(e.target.value));
                  },
                })}
              />
              <ErrorText id="name-error" message={errors.name?.message} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="slug">URL slug</Label>
              <div className="flex items-center rounded-md border border-input focus-within:ring-2 focus-within:ring-ember">
                <span className="pl-3 text-sm text-muted-foreground">/products/</span>
                <input id="slug" className="h-10 min-w-0 flex-1 bg-transparent pr-3 text-sm outline-none" aria-invalid={Boolean(errors.slug)} aria-describedby="slug-error" {...register("slug")} />
              </div>
              <ErrorText id="slug-error" message={errors.slug?.message} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="badge">Badge (optional)</Label>
              <Input id="badge" placeholder="New, Bestseller…" className="h-10" {...register("badge")} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="tagline">Tagline</Label>
              <Input id="tagline" className="h-10" aria-invalid={Boolean(errors.tagline)} aria-describedby="tagline-error" {...register("tagline")} />
              <ErrorText id="tagline-error" message={errors.tagline?.message} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="description">Description (in Maya&apos;s voice)</Label>
              <Textarea id="description" rows={6} aria-invalid={Boolean(errors.description)} aria-describedby="description-error" {...register("description")} />
              <ErrorText id="description-error" message={errors.description?.message} />
            </div>
          </div>
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">Details & care bullets</legend>
            {details.fields.map((f, i) => (
              <div key={f.id} className="flex gap-2">
                <Input aria-label={`Detail ${i + 1}`} className="h-10" {...register(`details.${i}.value`)} />
                <Button type="button" variant="ghost" size="icon-lg" onClick={() => details.remove(i)} aria-label={`Remove detail ${i + 1}`}>
                  <Trash2 aria-hidden />
                </Button>
              </div>
            ))}
            {details.fields.length < 12 && (
              <Button type="button" variant="outline" size="sm" onClick={() => details.append({ value: "" })}>
                <Plus aria-hidden /> Add bullet
              </Button>
            )}
          </fieldset>
        </Section>

        <Section title="Images" description="First image is the cover. Upload to Cloudinary or paste an Unsplash/Cloudinary URL.">
          {images.fields.length > 0 ? (
            <ul className="space-y-3">
              {images.fields.map((f, i) => (
                <li key={f.id} className="flex gap-3 rounded-xl border p-3">
                  <div className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                    <Image src={imageValues?.[i]?.url ?? f.url} alt="" fill sizes="80px" className="object-cover" />
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <Label htmlFor={`img-alt-${i}`} className="text-xs">
                      Alt text {i === 0 && <span className="text-muted-foreground">(cover)</span>}
                    </Label>
                    <Input id={`img-alt-${i}`} className="h-9" aria-invalid={Boolean(errors.images?.[i]?.alt)} {...register(`images.${i}.alt`)} />
                    <ErrorText id={`img-${i}-error`} message={errors.images?.[i]?.alt?.message ?? errors.images?.[i]?.url?.message} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Button type="button" variant="ghost" size="icon-sm" disabled={i === 0} onClick={() => images.move(i, i - 1)} aria-label="Move image up">
                      <ArrowUp aria-hidden />
                    </Button>
                    <Button type="button" variant="ghost" size="icon-sm" disabled={i === images.fields.length - 1} onClick={() => images.move(i, i + 1)} aria-label="Move image down">
                      <ArrowDown aria-hidden />
                    </Button>
                    <Button type="button" variant="ghost" size="icon-sm" onClick={() => images.remove(i)} aria-label="Remove image">
                      <Trash2 aria-hidden />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="grid place-items-center rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
              <ImagePlus className="mb-2 size-6" aria-hidden /> No images yet
            </div>
          )}
          <ErrorText id="images-error" message={errors.images?.message ?? errors.images?.root?.message} />
          <div className="flex flex-col gap-2 sm:flex-row">
            <label className={cn("inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-md border px-4 text-sm font-medium hover:bg-muted", (!cloudinary || uploading) && "pointer-events-none opacity-50")}>
              {uploading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Upload className="size-4" aria-hidden />}
              Upload image
              <input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" disabled={!cloudinary || uploading} onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0])} />
            </label>
            <div className="flex flex-1 gap-2">
              <Input value={urlDraft} onChange={(e) => setUrlDraft(e.target.value)} placeholder="https://images.unsplash.com/…" aria-label="Image URL" className="h-10" onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addImageUrl())} />
              <Button type="button" variant="outline" className="h-10" onClick={addImageUrl}>
                <Link2 aria-hidden /> Add
              </Button>
            </div>
          </div>
          {!cloudinary && <p className="text-xs text-muted-foreground">Uploads are off because Cloudinary isn&apos;t configured. Add CLOUDINARY_* env vars to enable them.</p>}
        </Section>

        <Section title={type === "DIGITAL" ? "Variant" : "Variants & stock"} description={type === "DIGITAL" ? "Digital products need one variant (stock isn't tracked)." : "Each size/colour combination has its own SKU and stock."}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="text-left text-xs text-muted-foreground">
                <tr>
                  <th className="pb-2 font-medium">SKU</th>
                  <th className="pb-2 font-medium">Colour</th>
                  <th className="pb-2 font-medium">Hex</th>
                  <th className="pb-2 font-medium">Size</th>
                  <th className="pb-2 font-medium">Price override</th>
                  {type === "PHYSICAL" && <th className="pb-2 font-medium">Stock</th>}
                  <th className="pb-2" />
                </tr>
              </thead>
              <tbody>
                {variants.fields.map((f, i) => {
                  const e = errors.variants?.[i];
                  return (
                    <tr key={f.id} className="align-top">
                      <td className="pr-2 pb-2">
                        <Input aria-label={`Variant ${i + 1} SKU`} className="h-9 font-mono text-xs uppercase" aria-invalid={Boolean(e?.sku)} {...register(`variants.${i}.sku`)} />
                        <ErrorText id={`v-${i}-sku`} message={e?.sku?.message} />
                      </td>
                      <td className="pr-2 pb-2">
                        <Input aria-label={`Variant ${i + 1} colour`} className="h-9" {...register(`variants.${i}.color`)} />
                      </td>
                      <td className="pr-2 pb-2">
                        <div className="flex items-center gap-1.5">
                          <span className="size-5 shrink-0 rounded-full border" style={{ background: variantValues?.[i]?.colorHex || "transparent" }} aria-hidden />
                          <Input aria-label={`Variant ${i + 1} colour hex`} placeholder="#000000" className="h-9 w-24 font-mono text-xs" aria-invalid={Boolean(e?.colorHex)} {...register(`variants.${i}.colorHex`)} />
                        </div>
                        <ErrorText id={`v-${i}-hex`} message={e?.colorHex?.message} />
                      </td>
                      <td className="pr-2 pb-2">
                        <Input aria-label={`Variant ${i + 1} size`} className="h-9 w-16" {...register(`variants.${i}.size`)} />
                      </td>
                      <td className="pr-2 pb-2">
                        <Input aria-label={`Variant ${i + 1} price override`} type="number" step="0.01" min="0" placeholder="—" className="h-9 w-24" {...register(`variants.${i}.price`)} />
                      </td>
                      {type === "PHYSICAL" && (
                        <td className="pr-2 pb-2">
                          <Input aria-label={`Variant ${i + 1} stock`} type="number" min="0" className="h-9 w-20" aria-invalid={Boolean(e?.stock)} {...register(`variants.${i}.stock`)} />
                          <ErrorText id={`v-${i}-stock`} message={e?.stock?.message} />
                        </td>
                      )}
                      <td className="pb-2">
                        <Button type="button" variant="ghost" size="icon" disabled={variants.fields.length === 1} onClick={() => variants.remove(i)} aria-label={`Remove variant ${i + 1}`}>
                          <Trash2 aria-hidden />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <ErrorText id="variants-error" message={errors.variants?.message ?? errors.variants?.root?.message} />
          {type === "PHYSICAL" && (
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button type="button" variant="outline" size="sm" onClick={() => variants.append({ sku: `ML-${skuBase()}-${variants.fields.length + 1}`, size: "", color: "", colorHex: "", stock: 0 })}>
                <Plus aria-hidden /> Add variant
              </Button>
              <div className="flex gap-2">
                <Input value={sizeRunColor} onChange={(e) => setSizeRunColor(e.target.value)} placeholder="Colour for size run" aria-label="Colour for size run" className="h-7 w-44 text-sm" />
                <Button type="button" variant="outline" size="sm" onClick={addSizeRun}>
                  Add XS–XL run
                </Button>
              </div>
            </div>
          )}
        </Section>
      </div>

      <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
        <Section title="Visibility">
          {(
            [
              ["published", "Published", "Visible in the store"],
              ["featured", "Featured", "Shown on the home page"],
              ["inGiftGuide", "Gift guide", "Included in the holiday guide"],
            ] as const
          ).map(([key, label, hint]) => (
            <Controller
              key={key}
              control={control}
              name={key}
              render={({ field }) => (
                <div className="flex items-center justify-between gap-3">
                  <Label htmlFor={key} className="flex flex-col items-start gap-0.5">
                    <span>{label}</span>
                    <span className="text-xs font-normal text-muted-foreground">{hint}</span>
                  </Label>
                  <Switch id={key} checked={field.value} onCheckedChange={field.onChange} />
                </div>
              )}
            />
          ))}
        </Section>
        <Section title="Organisation">
          <div className="space-y-1.5">
            <Label htmlFor="type">Type</Label>
            <Controller
              control={control}
              name="type"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange} disabled={Boolean(product)}>
                  <SelectTrigger id="type" className="h-10! w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PHYSICAL">Physical (ships)</SelectItem>
                    <SelectItem value="DIGITAL">Digital (download)</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="category">Category</Label>
            <Controller
              control={control}
              name="category"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="category" className="h-10! w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(categoryLabels).map(([v, l]) => (
                      <SelectItem key={v} value={v}>
                        {l}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </Section>
        <Section title="Pricing (USD)">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="price">Price</Label>
              <Input id="price" type="number" step="0.01" min="0" className="h-10" aria-invalid={Boolean(errors.price)} aria-describedby="price-error" {...register("price")} />
              <ErrorText id="price-error" message={errors.price?.message} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="compareAt">Compare at</Label>
              <Input id="compareAt" type="number" step="0.01" min="0" className="h-10" aria-invalid={Boolean(errors.compareAt)} aria-describedby="compareAt-error" {...register("compareAt")} />
            </div>
          </div>
          <ErrorText id="compareAt-error" message={errors.compareAt?.message} />
        </Section>
        <Button type="submit" disabled={pending} className="h-11 w-full rounded-full text-base">
          {pending && <Loader2 className="animate-spin" aria-hidden />}
          {product ? "Save changes" : "Create product"}
        </Button>
        {product && type === "DIGITAL" && <p className="text-center text-xs text-muted-foreground">Manage downloadable files below.</p>}
        {!product && type === "DIGITAL" && <p className="text-center text-xs text-muted-foreground">You can upload the downloadable file after creating the product.</p>}
      </aside>
    </form>
  );
}
