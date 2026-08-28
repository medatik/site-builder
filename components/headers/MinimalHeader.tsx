"use client";

import { cn } from "@/lib/cn";
import { Container } from "@/components/ui/Container";
import { CtaButton } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { useHeaderShell, MenuButton, MobileMenu, barHeight, type HeaderProps } from "./parts";

/**
 * `minimal` — logo + actions only; the nav lives entirely in the menu panel at
 * *every* breakpoint (the hamburger is always visible, no inline desktop nav).
 * Good for image-led / portfolio sites, and pairs naturally with a `left`/`right`
 * sidebar menu (`header.mobileMenu`).
 */
export function MinimalHeader({ config }: HeaderProps) {
  const h = useHeaderShell(config);
  return (
    <header {...h.rootProps}>
      <Container className={cn("flex items-center justify-between gap-4", barHeight(h.shrunk))}>
        <a href={h.homeHref} className="flex items-center" aria-label={config.siteName}>
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
          <MenuButton open={h.open} onClick={() => h.setOpen(!h.open)} />
        </div>
      </Container>

      {/* visibility="always": the nav is only reachable here, at all widths. */}
      <MobileMenu
        nav={h.nav}
        config={config}
        open={h.open}
        setOpen={h.setOpen}
        mode={h.resolved.mobileMenu}
        visibility="always"
      />
    </header>
  );
}
