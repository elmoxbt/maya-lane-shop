import { ImageResponse } from "next/og";

export const alt = "Maya Lane Shop: merch, programs and guides from Maya Lane";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#1a1918", color: "#fff", padding: 72, fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", fontSize: 34, fontWeight: 800, letterSpacing: -1 }}>
          MAYA LANE<span style={{ color: "#f2551d" }}>.</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 96, fontWeight: 800, lineHeight: 1, letterSpacing: -4 }}>Strong, soft &amp;</div>
          <div style={{ display: "flex", fontSize: 96, fontWeight: 800, lineHeight: 1.05, letterSpacing: -4 }}>
            <span style={{ background: "#f2551d", color: "#1a1918", padding: "0 16px" }}>a little bit extra.</span>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 28, color: "rgba(255,255,255,.7)" }}>
          <span>Merch · Training programs · Meal-prep guides</span>
          <span>850K on TikTok</span>
        </div>
      </div>
    ),
    size,
  );
}
