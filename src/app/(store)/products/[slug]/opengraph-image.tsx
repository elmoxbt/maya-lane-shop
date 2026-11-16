import { ImageResponse } from "next/og";
import { getProductBySlug } from "@/server/queries/products";
import { formatPrice } from "@/lib/format";

export const alt = "Maya Lane Shop product";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  const img = product?.images[0]?.url.replace("w=1400", "w=630&h=630");
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#f6f3ee", fontFamily: "sans-serif" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {img && <img src={img} width={630} height={630} alt="" style={{ objectFit: "cover" }} />}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 56 }}>
          <div style={{ display: "flex", fontSize: 28, fontWeight: 800, color: "#1a1918" }}>
            MAYA LANE<span style={{ color: "#f2551d" }}>.</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 54, fontWeight: 800, lineHeight: 1.05, letterSpacing: -2, color: "#1a1918" }}>{product?.name ?? "Maya Lane Shop"}</div>
            <div style={{ fontSize: 26, color: "#6b6863", marginTop: 16 }}>{product?.tagline ?? ""}</div>
          </div>
          {product && (
            <div style={{ display: "flex" }}>
              <span style={{ background: "#f2551d", color: "#1a1918", fontSize: 32, fontWeight: 800, padding: "10px 24px", borderRadius: 999 }}>{formatPrice(product.priceCents)}</span>
            </div>
          )}
        </div>
      </div>
    ),
    size,
  );
}
