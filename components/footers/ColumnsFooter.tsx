import { resolveNav } from "@/lib/nav";
import { resolveCopyright } from "@/lib/footer";
import { Container } from "@/components/ui/Container";
import { Logo } from "@/components/ui/Logo";
import { FooterSocials, ContactList, FooterPageLinks, footerSurface, linkTransition, type FooterProps } from "./parts";

/**
 * `columns` — the classic multi-column footer and the engine's default: a brand
 * column (logo · tagline · socials), a quick-nav column, and a contact column,
 * over a legal bar. The richest layout; the safe fallback for any client.
 *
 * Responsive in three steps: stacked → 2-col at `sm` (brand spans, nav | contact
 * share the row) → 3-col at `md`.
 */
export function ColumnsFooter({ config }: FooterProps) {
  const nav = resolveNav(config);
  const { business, footer } = config;
  const copyright = resolveCopyright(footer, config.siteName);

  return (
    <footer className={footerSurface}>
      {/* Chrome, not a full section — breathe with the preset at ~60% of its rhythm. */}
      <Container className="py-[calc(var(--section-py)*0.6)]">
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-[1.4fr_1fr_1.2fr]">
          <div className="flex flex-col gap-4 sm:col-span-2 md:col-span-1">
            <Logo logo={config.logo} siteName={config.siteName} />
            {footer?.tagline && (
              <p className="max-w-xs text-sm leading-relaxed text-muted">{footer.tagline}</p>
            )}
            {business?.socials && <FooterSocials socials={business.socials} className="pt-1" />}
          </div>

          {nav.length > 0 && (
            <nav aria-label="Footer" className="flex flex-col gap-3">
              <h3 className="font-heading text-sm font-bold uppercase tracking-wide">
                {footer?.exploreLabel ?? "Explore"}
              </h3>
              <ul className="flex flex-col gap-2">
                {nav.map((item) => (
                  <li key={item.href}>
                    <a href={item.href} className={`text-sm text-muted hover:text-primary ${linkTransition}`}>
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          )}

          {business && (
            <div className="flex flex-col gap-3">
              <h3 className="font-heading text-sm font-bold uppercase tracking-wide">
                {footer?.contactLabel ?? "Get in touch"}
              </h3>
              <ContactList business={business} showHours={footer?.showHours} />
            </div>
          )}
        </div>

        {/* Only render the bottom bar when it has content — copyright "none" plus no
            legal must leave no stray border/spacing behind. */}
        {(copyright || footer?.legal || config.pages?.some((p) => p.nav === false)) && (
          <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-[color-mix(in_srgb,var(--text)_10%,transparent)] pt-6 text-xs text-muted sm:flex-row">
            {copyright && <p>{copyright}</p>}
            {footer?.legal && <p>{footer.legal}</p>}
            <FooterPageLinks pages={config.pages} />
          </div>
        )}
      </Container>
    </footer>
  );
}
