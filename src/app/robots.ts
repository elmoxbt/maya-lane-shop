import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/format";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/account", "/api", "/checkout", "/login"] }],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
