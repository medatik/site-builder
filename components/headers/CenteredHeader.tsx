"use client";

import { cn } from "@/lib/cn";
import { Container } from "@/components/ui/Container";
import { CtaButton } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { useHeaderShell, HeaderNav, MenuButton, MobileMenu, barHeight, type HeaderProps } from "./parts";

/**
 * `centered` — editorial two-row layout. Row 1: hamburger (mobile) on the left,
 * the logo dead-centre (absolutely positioned so nothing can shift it), actions
 * on the right. Row 2 (desktop only): the nav, centred under a hairline.
 *
 * Two rows on purpose: a single row with an absolutely-centred logo collides
 * with any nav long enough to reach the middle (an 8-link demo overlapped the
 * logo). Moving the nav to its own row makes the layout immune to nav length —
 * don't "simplify" this back into one row.
 */
export function CenteredHeader({ config }: HeaderProps) {
  const h = useHeaderShell(config);
  return (
    <header {...h.rootProps}>
      <Container className={cn("relative flex items-center justify-between gap-4", barHeight(h.shrunk))}>
        {/* Left slot: hamburger below lg; empty spacer at lg+ keeps actions right. */}
        <div className="flex items-center">
          <MenuButton open={h.open} onClick={() => h.setOpen(!h.open)} className="-ml-2 lg:hidden" />
        </div>

        <a
          href={h.homeHref}
          className="absolute left-1/2 flex -translate-x-1/2 items-center"
          aria-label={config.siteName}
        >
          <Logo logo={config.logo} siteName={config.siteName} />
        </a>

        <div className="flex items-center gap-2">
          {h.languageSelect}
          {h.themeToggle}
          {config.header?.cta && (
            <div className="hidden sm:block">
              <CtaButton cta={config.header.cta} />
            </div>
          )}
        </div>
      </Container>

      {/* Row 2: desktop nav, centred under a subtle hairline. */}
      {h.nav.length > 0 && (
        <div className="hidden border-t border-[color-mix(in_srgb,var(--text)_8%,transparent)] lg:block">
          <Container className="flex justify-center">
            <HeaderNav nav={h.nav} className="flex h-11 items-center" />
          </Container>
        </div>
      )}

      <MobileMenu nav={h.nav} config={config} open={h.open} setOpen={h.setOpen} mode={h.resolved.mobileMenu} />
    </header>
  );
}
