import { getActiveConfig } from "@/lib/client";
import { localizeConfig, pickLocale } from "@/lib/i18n";
import { SiteRenderer } from "@/components/SiteRenderer";

/**
 * Production entry point. Renders the client selected by
 * NEXT_PUBLIC_ACTIVE_CLIENT — i.e. the site this Vercel deployment is for.
 *
 * The active language comes from `?lang=` (multilingual configs only). The
 * `searchParams` promise is only awaited when the config actually declares
 * i18n: awaiting it opts the route into dynamic rendering, and a
 * single-language site has no reason to give up static generation.
 */
export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const base = getActiveConfig();
  if (!base.i18n) {
    // Static path: no request data read → prerendered at build time.
    return <SiteRenderer config={localizeConfig(base, "en")} />;
  }
  const locale = pickLocale(base, (await searchParams).lang);
  return <SiteRenderer config={localizeConfig(base, locale)} locale={locale} />;
}
