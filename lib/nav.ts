import type { NavItem, SectionType, SiteConfig } from "./types";

/** Human labels for section types when auto-deriving nav. */
const NAV_LABELS: Partial<Record<SectionType, string>> = {
  services: "Services",
  about: "About",
  gallery: "Gallery",
  pricing: "Pricing",
  team: "Team",
  testimonials: "Reviews",
  faq: "FAQ",
  location: "Visit",
  contact: "Contact",
};

/** Section types that make sense as top-nav links (in a sensible order). */
const NAV_ORDER: SectionType[] = [
  "services",
  "about",
  "team",
  "gallery",
  "pricing",
  "testimonials",
  "faq",
  "location",
  "contact",
];

/**
 * Resolve the header nav: an explicit `config.nav` wins; otherwise it is derived
 * from the enabled, nav-worthy sections in a consistent order, followed by any
 * routed `pages` that opt in.
 *
 * The anchor form depends on whether the site has extra pages. A pure one-pager
 * keeps bare `#services` fragments (unchanged behaviour). As soon as `pages`
 * exist, home-section links become root-relative `/#services`: a bare `#…`
 * fragment on `/privacy` would look for that section on the CURRENT page and
 * silently do nothing.
 */
export function resolveNav(config: SiteConfig): NavItem[] {
  if (config.nav && config.nav.length > 0) return config.nav;

  const hasPages = (config.pages?.length ?? 0) > 0;
  const prefix = hasPages ? "/" : "";

  const enabled = new Set(
    config.sections.filter((s) => s.enabled).map((s) => s.type),
  );

  const sectionLinks = NAV_ORDER.filter((type) => enabled.has(type)).map((type) => ({
    label: NAV_LABELS[type] ?? type,
    href: `${prefix}#${type}`,
  }));

  const pageLinks = (config.pages ?? [])
    .filter((p) => p.nav !== false)
    .map((p) => ({ label: p.title, href: `/${p.slug}` }));

  return [...sectionLinks, ...pageLinks];
}

/**
 * Make in-page anchors work from every route.
 *
 * Config-authored CTAs use bare fragments (`href: "#contact"`). On the home page
 * that's correct, but on `/privacy` the browser looks for `#contact` on THAT
 * page and silently does nothing — a dead button with no error. Once a site has
 * routed pages, every `#foo` becomes root-relative `/#foo` so it always lands on
 * the home page's section.
 *
 * Applied as a whole-config transform (rather than at each render site) because
 * anchors appear in many shapes — header CTA, hero CTAs, pricing tier CTAs,
 * service card links — and a single pass can't miss one. Sites with no `pages`
 * are returned untouched, so one-pagers keep their existing markup exactly.
 */
export function rootRelativeAnchors<T>(value: T): T {
  if (Array.isArray(value)) return value.map((v) => rootRelativeAnchors(v)) as T;
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = k === "href" && typeof v === "string" && v.startsWith("#") ? `/${v}` : rootRelativeAnchors(v);
    }
    return out as T;
  }
  return value;
}
