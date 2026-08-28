import type { Logo as LogoType } from "@/lib/types";
import { cn } from "@/lib/cn";

/**
 * Brand lockup. Uses the client's logo image when provided; otherwise renders a
 * typographic wordmark (with an optional monogram tile) built from the theme so
 * every demo has a credible brand mark without needing an asset.
 *
 * Image logos are per-mode with a mutual fallback (see `Logo` in lib/types):
 * - only `srcLight` OR only `srcDark` → that one image is used in BOTH modes,
 *   and it is rendered exactly once.
 * - both, and different → both are rendered and the one for the inactive mode is
 *   hidden via the `mode-light:` / `mode-dark:` variants. The swap MUST be CSS,
 *   not JS: the theme toggle flips `data-mode` on the wrapper without
 *   re-rendering React, so a JS branch would go stale on toggle.
 */
export function Logo({
  logo,
  siteName,
  className,
}: {
  logo: LogoType;
  siteName: string;
  className?: string;
}) {
  // Mutual fallback: one defined image covers both modes.
  const light = logo.srcLight ?? logo.srcDark;
  const dark = logo.srcDark ?? logo.srcLight;

  // `w-fit` (width: fit-content) is load-bearing: in a `flex-col` parent (e.g. a
  // footer brand column) the default `align-items: stretch` would widen a plain
  // `w-auto` <img> to the full column while `h-9` pins its height, distorting the
  // mark. A definite fit-content width blocks that stretch WITHOUT forcing a
  // cross-axis alignment — so the logo still honours a centered parent (the
  // `spotlight` footer) instead of pinning left the way `self-start` did.
  // `max-w-full` guards narrow containers; `object-contain` is the last-resort
  // backstop if something ever forces both dimensions.
  const imgBase = "h-9 w-fit max-w-full object-contain";

  if (light && dark) {
    // Same image for both modes — render a single <img>, no swapping needed.
    if (light === dark) {
      // eslint-disable-next-line @next/next/no-img-element
      return <img src={light} alt={logo.alt} className={cn(imgBase, className)} />;
    }
    // Genuinely different per-mode images: render both, CSS shows the active one.
    return (
      <>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={light}
          alt={logo.alt}
          className={cn(imgBase, "mode-dark:hidden", className)}
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={dark}
          alt={logo.alt}
          aria-hidden
          className={cn(imgBase, "mode-light:hidden", className)}
        />
      </>
    );
  }

  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      {logo.monogram && (
        <span
          className="flex size-9 items-center justify-center rounded-[var(--radius-btn)] font-heading text-lg font-extrabold text-[color:var(--background)]"
          style={{ background: "linear-gradient(135deg, var(--primary), color-mix(in srgb, var(--accent) 65%, var(--primary)))" }}
          aria-hidden
        >
          {logo.monogram}
        </span>
      )}
      <span className="font-heading text-xl font-extrabold tracking-tight text-text">
        {siteName}
      </span>
    </span>
  );
}
