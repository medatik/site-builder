import type { Section, SiteConfig } from "@/lib/types";
import { themeToggleShown } from "@/lib/theme";
import { localeMeta } from "@/lib/i18n";
import { structuredData, jsonLdScript } from "@/lib/seo";
import { ThemeScope } from "@/components/ThemeScope";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { SectionRenderer } from "@/components/SectionRenderer";
import { FloatingButton } from "@/components/ui/FloatingButton";

/**
 * The engine's entry point: turns one `SiteConfig` into a complete site.
 *
 * Themes the whole tree, renders header + footer, then maps over the ordered
 * `sections` array — rendering each enabled section (or its client override) in
 * config order. This is the only place that knows how to assemble a site, and
 * it is 100% shared across every client.
 *
 * `sections` defaults to the home page's. A routed page (`SiteConfig.pages`)
 * passes its own list, so every page shares one header, footer, theme and
 * structured-data block — a page is just a different body.
 */
export function SiteRenderer({
  config,
  locale,
  sections,
}: {
  config: SiteConfig;
  locale?: string;
  sections?: Section[];
}) {
  const { code, dir } = localeMeta(config, locale ?? config.i18n?.defaultLocale ?? "");
  return (
    <ThemeScope
      theme={config.theme}
      scopeId={config.client}
      switchable={themeToggleShown(config.theme, config.header?.themeToggle)}
      lang={config.i18n ? code : config.lang}
      dir={config.i18n ? dir : undefined}
    >
      {/* Local-SEO structured data, derived entirely from the `business` block. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(structuredData(config)) }}
      />
      <div id="top" />
      <SiteHeader config={config} />
      <main>
        {(sections ?? config.sections).map((section, i) => (
          <SectionRenderer
            key={`${section.type}-${i}`}
            section={section}
            client={config.client}
            business={config.business}
            siteName={config.siteName}
          />
        ))}
      </main>
      <SiteFooter config={config} />
      <FloatingButton action={config.floatingButton} />
    </ThemeScope>
  );
}
