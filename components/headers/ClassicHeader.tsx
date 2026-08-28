"use client";

import { cn } from "@/lib/cn";
import { Container } from "@/components/ui/Container";
import { CtaButton } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { useHeaderShell, HeaderNav, MenuButton, MobileMenu, barHeight, type HeaderProps } from "./parts";

/**
 * `classic` (default) — logo left, inline nav, actions (toggle + CTA) right, with
 * a hamburger below `lg`. The engine's original header, preserved.
 */
export function ClassicHeader({ config }: HeaderProps) {
  const h = useHeaderShell(config);
  return (
    <header {...h.rootProps}>
      <Container className={cn("flex items-center justify-between gap-4", barHeight(h.shrunk))}>
        <a href={h.homeHref} className="flex items-center" aria-label={config.siteName}>
          <Logo logo={config.logo} siteName={config.siteName} />
        </a>

        <HeaderNav nav={h.nav} className="hidden lg:flex" />

        <div className="flex items-center gap-2">
          {h.languageSelect}
          {h.themeToggle}
          {config.header?.cta && (
            <div className="hidden sm:block">
              <CtaButton cta={config.header.cta} />
            </div>
          )}
          <MenuButton open={h.open} onClick={() => h.setOpen(!h.open)} className="lg:hidden" />
        </div>
      </Container>

      <MobileMenu nav={h.nav} config={config} open={h.open} setOpen={h.setOpen} mode={h.resolved.mobileMenu} />
    </header>
  );
}
