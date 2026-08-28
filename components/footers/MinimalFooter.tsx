import { resolveNav } from "@/lib/nav";
import { resolveCopyright } from "@/lib/footer";
import { Container } from "@/components/ui/Container";
import { Logo } from "@/components/ui/Logo";
import { FooterSocials, FooterPageLinks, footerSurface, linkTransition, type FooterProps } from "./parts";

/**
 * `minimal` — one compact bar for simple / portfolio sites: brand on the left,
 * inline nav in the middle, socials on the right, and a thin copyright + legal
 * line beneath. Deliberately drops the contact block; use `columns`/`spotlight`
 * when phone/email/hours matter.
 *
 * Tighter rhythm than `columns` (~40% of `--section-py`, it's a slim bar).
 */
export function MinimalFooter({ config }: FooterProps) {
  const nav = resolveNav(config);
  const { business, footer } = config;
  const copyright = resolveCopyright(footer, config.siteName);

  return (
    <footer className={footerSurface}>
      <Container className="py-[calc(var(--section-py)*0.4)]">
        <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between">
          <Logo logo={config.logo} siteName={config.siteName} />

          {nav.length > 0 && (
            <nav aria-label="Footer" className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              {nav.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className={`text-sm font-medium text-muted hover:text-primary ${linkTransition}`}
                >
                  {item.label}
                </a>
              ))}
            </nav>
          )}

          {business?.socials && <FooterSocials socials={business.socials} />}
        </div>

        {(copyright || footer?.legal || config.pages?.some((p) => p.nav === false)) && (
          <div className="mt-6 flex flex-col items-center justify-between gap-2 border-t border-[color-mix(in_srgb,var(--text)_10%,transparent)] pt-5 text-xs text-muted sm:flex-row">
            {copyright && <p>{copyright}</p>}
            {footer?.legal && <p>{footer.legal}</p>}
            <FooterPageLinks pages={config.pages} />
          </div>
        )}
      </Container>
    </footer>
  );
}
