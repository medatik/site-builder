import type { HeaderConfig, HeaderScrollBehavior, MobileMenuStyle } from "./types";

/** Fully-resolved header behaviour, with all the defaulting + neutralisation applied. */
export interface ResolvedHeader {
  sticky: boolean;
  variant: "transparent" | "solid";
  behavior: HeaderScrollBehavior;
  mobileMenu: MobileMenuStyle;
}

/**
 * Resolve raw `HeaderConfig` into the behaviour every header variant reads, in
 * one place so the rules can't drift between variants:
 *
 * - **Non-sticky neutralises everything scroll-related** (the requirement): a
 *   header that scrolls away can't meaningfully be transparent-over-hero or
 *   react to scroll, so `variant` is forced `"solid"` and `behavior` `"none"`.
 *   Variants then skip the scroll listener entirely.
 * - **Back-compat for the deprecated `elevateOnScroll`**: when `scrollBehavior`
 *   is unset, `elevateOnScroll: false` maps to `"none"`, anything else to
 *   `"elevate"` (the historical default).
 */
export function resolveHeader(header: HeaderConfig | undefined): ResolvedHeader {
  const sticky = header?.sticky ?? true;
  const mobileMenu = header?.mobileMenu ?? "top";

  if (!sticky) {
    return { sticky: false, variant: "solid", behavior: "none", mobileMenu };
  }

  const behavior: HeaderScrollBehavior =
    header?.scrollBehavior ?? (header?.elevateOnScroll === false ? "none" : "elevate");

  return { sticky: true, variant: header?.variant ?? "transparent", behavior, mobileMenu };
}
