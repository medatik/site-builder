import type { Metadata, Viewport } from "next";
import { getActiveConfig } from "@/lib/client";
import { headers } from "next/headers";
import { localeMeta, pickLocale } from "@/lib/i18n";
import { siteUrl } from "@/lib/seo";
import { defaultPalette } from "@/lib/theme";
import "./globals.css";

export function generateMetadata(): Metadata {
  const config = getActiveConfig();
  const base = siteUrl(config);
  const locales = config.i18n?.locales ?? [];
  return {
    // Makes every relative URL (OG image, canonical, sitemap) absolute, which
    // social scrapers and search engines require.
    ...(base ? { metadataBase: new URL(base) } : {}),
    title: config.seo?.title ?? config.siteName,
    description: config.seo?.description,
    keywords: config.seo?.keywords,
    alternates: {
      canonical: "/",
      // hreflang: tells Google these are translations, not duplicate content.
      ...(locales.length > 1
        ? {
            languages: Object.fromEntries(
              locales.map((l) => [
                l.code,
                l.code === config.i18n?.defaultLocale ? "/" : `/?lang=${l.code}`,
              ]),
            ),
          }
        : {}),
    },
    openGraph: {
      title: config.seo?.title ?? config.siteName,
      description: config.seo?.description,
      siteName: config.siteName,
      type: "website",
      ...(base ? { url: base } : {}),
    },
    twitter: { card: "summary_large_image" },
  };
}

export function generateViewport(): Viewport {
  const config = getActiveConfig();
  return {
    themeColor: defaultPalette(config.theme).background,
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const config = getActiveConfig();
  // Multilingual sites read the locale that middleware forwarded from `?lang=`,
  // so `<html lang>` is correct for CRAWLERS too (a layout can't read
  // searchParams). `headers()` opts a route into dynamic rendering, so it is
  // only called when the config actually has i18n — single-language sites keep
  // their static rendering.
  const requested = config.i18n ? (await headers()).get("x-locale") ?? undefined : undefined;
  // A monolingual site says its language through `lang`/`dir` instead, so it
  // never reaches `headers()` above and keeps its static rendering.
  const meta = config.i18n
    ? localeMeta(config, pickLocale(config, requested))
    : { code: config.lang ?? "en", dir: config.dir ?? "ltr" };
  return (
    <html lang={meta.code} dir={meta.dir}>
      <body>{children}</body>
    </html>
  );
}
