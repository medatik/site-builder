import { Phone, Mail } from "lucide-react";
import { resolveNav } from "@/lib/nav";
import { resolveCopyright } from "@/lib/footer";
import { Container } from "@/components/ui/Container";
import { Logo } from "@/components/ui/Logo";
import { FooterSocials, FooterPageLinks, footerSurface, linkTransition, type FooterProps } from "./parts";

/**
 * `spotlight` — centered and brand-forward, for sites that want the footer to
 * close with a strong "get in touch" moment: big logo, tagline, prominent
 * phone/email call-to-action chips, then centered nav, socials, address/hours,
 * and copyright.
 *
 * Distinct surface: a primary-tinted hairline sits on top of the standard footer
 * tint, so the section reads as a deliberate closer rather than fine print.
 * Generous rhythm (~85% of `--section-py`).
 */
export function SpotlightFooter({ config }: FooterProps) {
  const nav = resolveNav(config);
  const { business, footer } = config;
  const copyright = resolveCopyright(footer, config.siteName);

  const chip =
    "inline-flex items-center gap-2 rounded-[var(--radius-btn)] border border-[color-mix(in_srgb,var(--primary)_40%,transparent)] px-4 py-2.5 font-heading text-sm font-semibold text-text hover:border-primary hover:text-primary " +
    linkTransition;

  return (
    <footer className={footerSurface}>
      {/* Primary accent rule marking this as an intentional closer. */}
      <div className="h-px w-full bg-[linear-gradient(to_right,transparent,color-mix(in_srgb,var(--primary)_45%,transparent),transparent)]" />
      <Container className="py-[calc(var(--section-py)*0.85)]">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 text-center">
          <Logo logo={config.logo} siteName={config.siteName} />

          {footer?.tagline && (
            <p className="max-w-xl text-base leading-relaxed text-muted">{footer.tagline}</p>
          )}

          {(business?.phone || business?.email) && (
            <div className="flex flex-wrap justify-center gap-3">
              {business.phone && (
                <a href={`tel:${business.phone.replace(/\s+/g, "")}`} className={chip}>
                  <Phone className="size-4 text-primary" />
                  {business.phone}
                </a>
              )}
              {business.email && (
                <a href={`mailto:${business.email}`} className={chip}>
                  <Mail className="size-4 text-primary" />
                  {business.email}
                </a>
              )}
            </div>
          )}

          {(business?.address || (footer?.showHours && business?.hours?.length)) && (
            <div className="flex flex-col items-center gap-1 text-sm text-muted">
              {business?.address && <p>{business.address}</p>}
              {footer?.showHours &&
                business?.hours?.map((h) => (
                  <p key={h.days}>
                    <span className="font-medium text-text">{h.days}:</span> {h.hours}
                  </p>
                ))}
            </div>
          )}

          {nav.length > 0 && (
            <nav
              aria-label="Footer"
              className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-2"
            >
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

          {business?.socials && <FooterSocials socials={business.socials} className="justify-center" />}

          {(copyright || footer?.legal || config.pages?.some((p) => p.nav === false)) && (
            <div className="mt-4 flex flex-col items-center gap-1 text-xs text-muted">
              {copyright && <p>{copyright}</p>}
              {footer?.legal && <p>{footer.legal}</p>}
            <FooterPageLinks pages={config.pages} />
            </div>
          )}
        </div>
      </Container>
    </footer>
  );
}
