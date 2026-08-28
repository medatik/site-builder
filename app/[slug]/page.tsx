import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getActiveConfig } from "@/lib/client";
import { localizeConfig, pickLocale } from "@/lib/i18n";
import { SiteRenderer } from "@/components/SiteRenderer";

/**
 * Routed pages declared in `SiteConfig.pages` (e.g. `/privacy`).
 *
 * Static routes win over this dynamic segment in Next's matcher, so `/preview`,
 * `/sitemap.xml`, `/robots.txt`, `/icon` and `/opengraph-image` are unaffected.
 * `dynamicParams = false` means anything not listed in `generateStaticParams`
 * 404s instead of being rendered on demand — a site can't be probed for pages
 * its config never declared.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return (getActiveConfig().pages ?? []).map((p) => ({ slug: p.slug }));
}

function findPage(slug: string) {
  return (getActiveConfig().pages ?? []).find((p) => p.slug === slug);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const config = getActiveConfig();
  const page = findPage((await params).slug);
  if (!page) return {};
  return {
    title: page.seo?.title ?? `${page.title} — ${config.siteName}`,
    description: page.seo?.description ?? config.seo?.description,
    keywords: page.seo?.keywords ?? config.seo?.keywords,
    alternates: { canonical: `/${page.slug}` },
  };
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lang?: string }>;
}) {
  const base = getActiveConfig();
  const { slug } = await params;

  // Same static-vs-dynamic split as the home page: only read searchParams when
  // the config is actually multilingual, so single-language pages stay static.
  if (!base.i18n) {
    const config = localizeConfig(base, "en");
    const page = config.pages?.find((p) => p.slug === slug);
    if (!page) notFound();
    return <SiteRenderer config={config} sections={page.sections} />;
  }

  const locale = pickLocale(base, (await searchParams).lang);
  const config = localizeConfig(base, locale);
  const page = config.pages?.find((p) => p.slug === slug);
  if (!page) notFound();
  return <SiteRenderer config={config} locale={locale} sections={page.sections} />;
}
