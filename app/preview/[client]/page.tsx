import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getConfig, listClients } from "@/lib/client";
import { localizeConfig, pickLocale } from "@/lib/i18n";
import { SiteRenderer } from "@/components/SiteRenderer";

/**
 * Preview any client's site by slug — e.g. /preview/voltedge-electric.
 *
 * This is a dev/sales convenience so every demo is viewable from one running
 * instance. Production deployments render the active client at "/" instead.
 * Because ThemeScope scopes its variables to a wrapper, each preview themes
 * itself independently with no bleed between them.
 */
export function generateStaticParams() {
  return listClients().map((c) => ({ client: c.client }));
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ client: string }>;
  searchParams: Promise<{ lang?: string }>;
}): Promise<Metadata> {
  const { client } = await params;
  const base = getConfig(client);
  if (!base) return { title: "Preview not found" };
  const config = base.i18n
    ? localizeConfig(base, pickLocale(base, (await searchParams).lang))
    : localizeConfig(base, "en");
  return {
    title: `${config.seo?.title ?? config.siteName} — Preview`,
    description: config.seo?.description,
  };
}

export default async function PreviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ client: string }>;
  searchParams: Promise<{ lang?: string }>;
}) {
  const { client } = await params;
  const base = getConfig(client);
  if (!base) notFound();
  // Same static-vs-dynamic split as the real pages: only await `searchParams`
  // when the config is actually multilingual. Next 16 is stricter than 15 —
  // reading it unconditionally forced this route dynamic, which cost the
  // preview its static generation for no benefit on single-language demos.
  if (!base.i18n) {
    return <SiteRenderer config={localizeConfig(base, "en")} />;
  }
  const locale = pickLocale(base, (await searchParams).lang);
  return <SiteRenderer config={localizeConfig(base, locale)} locale={locale} />;
}
