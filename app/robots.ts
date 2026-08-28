import type { MetadataRoute } from "next";
import { getActiveConfig } from "@/lib/client";
import { siteUrl } from "@/lib/seo";

/**
 * robots.txt for the active client. `/preview` is disallowed: it's the internal
 * demo gallery, not client content, and shouldn't compete in search results.
 */
export default function robots(): MetadataRoute.Robots {
  const base = siteUrl(getActiveConfig());
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: "/preview" }],
    ...(base ? { sitemap: `${base}/sitemap.xml`, host: base } : {}),
  };
}
