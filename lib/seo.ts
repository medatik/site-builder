import type { SiteConfig, BusinessHours, Section, Testimonial } from "./types";

/**
 * SEO helpers: canonical URL resolution and schema.org structured data.
 *
 * Everything here is DERIVED from the config a client already fills in — the
 * `business` block happens to contain exactly what `schema.org/LocalBusiness`
 * wants (name, phone, address, opening hours), so local-SEO markup costs a
 * client zero extra configuration.
 */

/** Day names → schema.org DayOfWeek, keyed by lowercase prefix. */
const DAYS: Record<string, string> = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
};

/**
 * The site's canonical origin. Vercel injects VERCEL_PROJECT_PRODUCTION_URL on
 * every deployment, so this resolves correctly in production without any
 * per-client wiring; config `business.url` wins when set explicitly.
 */
export function siteUrl(config: SiteConfig): string | undefined {
  const explicit = config.business?.url ?? process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  return vercel ? `https://${vercel}` : undefined;
}

/**
 * Parse a config hours row ("Mon–Fri", "8:00am – 6:00pm") into a schema.org
 * OpeningHoursSpecification. Returns null for rows we can't confidently read
 * (e.g. "By appointment") — better to omit than to publish wrong hours.
 */
function hoursSpec(row: BusinessHours) {
  const days = row.days
    .toLowerCase()
    .split(/[–—-]/)
    .map((d) => DAYS[d.trim().slice(0, 3)])
    .filter(Boolean);
  if (!days.length) return null;

  // Expand a range ("Mon–Fri") to the full set of days it covers.
  const order = Object.values(DAYS);
  const dayOfWeek =
    days.length === 2
      ? order.slice(order.indexOf(days[0]), order.indexOf(days[1]) + 1)
      : days;

  const times = row.hours.match(/(\d{1,2})(?::(\d{2}))?\s*([ap])m/gi);
  if (!times || times.length < 2) return { "@type": "OpeningHoursSpecification", dayOfWeek };

  const to24 = (t: string) => {
    const m = t.match(/(\d{1,2})(?::(\d{2}))?\s*([ap])m/i);
    if (!m) return null;
    let h = parseInt(m[1], 10);
    const min = m[2] ?? "00";
    if (/p/i.test(m[3]) && h !== 12) h += 12;
    if (/a/i.test(m[3]) && h === 12) h = 0;
    return `${String(h).padStart(2, "0")}:${min}`;
  };
  const opens = to24(times[0]);
  const closes = to24(times[1]);
  return {
    "@type": "OpeningHoursSpecification",
    dayOfWeek,
    ...(opens && closes ? { opens, closes } : {}),
  };
}

/**
 * Review markup built from FIRST-PARTY testimonials.
 *
 * This is the only route to ★ stars in search results, and the only safe one.
 * Google's structured-data policy forbids marking up reviews sourced from
 * another platform, so `business.rating` — which is copied by hand from a
 * Google/Facebook listing — is deliberately NOT used here. It is displayed by
 * `RatingBadge` and never enters the JSON-LD.
 *
 * Requires an explicit `structuredData: true` on the testimonials section:
 * fabricated review markup earns a manual penalty, so a client has to assert
 * these are genuine collected reviews. Demo copy must leave it off.
 */
function reviewData(config: SiteConfig): Record<string, unknown> {
  const sections = [
    ...config.sections,
    ...(config.pages?.flatMap((p) => p.sections) ?? []),
  ];
  const section = sections.find(
    (s): s is Extract<Section, { type: "testimonials" }> =>
      s.type === "testimonials" && s.enabled !== false && s.props.structuredData === true,
  );
  if (!section) return {};

  // Only rated testimonials can carry a rating; an unrated quote would produce
  // an invalid Review node.
  const rated = section.props.items.filter(
    (t): t is Testimonial & { rating: number } => typeof t.rating === "number",
  );
  if (!rated.length) return {};

  const reviews = rated.map((t) => ({
    "@type": "Review",
    reviewRating: { "@type": "Rating", ratingValue: t.rating, bestRating: 5 },
    author: { "@type": "Person", name: t.author },
    reviewBody: t.quote,
  }));

  const average = rated.reduce((sum, t) => sum + t.rating, 0) / rated.length;

  return {
    review: reviews,
    aggregateRating: {
      "@type": "AggregateRating",
      // Rounded to 1dp: a raw 4.666666666666667 is technically valid but looks
      // machine-generated to anyone inspecting the markup.
      ratingValue: Math.round(average * 10) / 10,
      reviewCount: rated.length,
      bestRating: 5,
    },
  };
}

/**
 * schema.org JSON-LD for the site. Emitted in the page so Google can show rich
 * results and place the business in the local pack.
 */
export function structuredData(config: SiteConfig): Record<string, unknown> {
  const b = config.business;
  const url = siteUrl(config);
  const specs = (b?.hours ?? []).map(hoursSpec).filter(Boolean);

  return {
    "@context": "https://schema.org",
    "@type": b?.schemaType ?? "LocalBusiness",
    name: config.siteName,
    ...(config.seo?.description ? { description: config.seo.description } : {}),
    ...(url ? { url, "@id": `${url}#business` } : {}),
    ...(b?.phone ? { telephone: b.phone } : {}),
    ...(b?.email ? { email: b.email } : {}),
    ...(b?.address ? { address: { "@type": "PostalAddress", streetAddress: b.address } } : {}),
    ...(specs.length ? { openingHoursSpecification: specs } : {}),
    ...(b?.socials?.length ? { sameAs: b.socials.map((s) => s.href) } : {}),
    ...reviewData(config),
  };
}

/* ------------------------------------------------------------------ *
 * Generated brand images (favicon + OG card)
 * ------------------------------------------------------------------ */

/** The 1–2 character mark drawn on the favicon and the OG card. */
export function monogram(config: SiteConfig): string {
  return config.logo.monogram?.slice(0, 2) ?? config.siteName.slice(0, 1).toUpperCase();
}

/**
 * Short stable hash of the values a generated image is drawn from.
 *
 * WHY THIS EXISTS: Next derives the `?hash` on `/icon` and `/opengraph-image`
 * from the *source file*, which is engine code — byte-identical on every client
 * branch. So every client's icon was served from the SAME URL, with
 * `Cache-Control: immutable, max-age=31536000`. A browser that had ever seen one
 * client's favicon (or the template's) kept showing it for a year, and no amount
 * of reloading helped: the URL never changed, so nothing was ever re-fetched.
 *
 * Feeding this into `generateImageMetadata`'s `id` puts the branding in the path
 * instead, so the URL changes exactly when the drawn pixels change. That makes
 * `immutable` correct rather than harmful — which is the whole point of a
 * content-addressed URL.
 *
 * FNV-1a rather than `crypto`: no import, no runtime assumptions inside the
 * image route, and collisions don't matter — this is a cache key, not a
 * security boundary.
 */
export function brandFingerprint(...parts: (string | undefined)[]): string {
  const input = parts.filter(Boolean).join("|");
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(36);
}

/**
 * Serialise structured data for an inline `<script type="application/ld+json">`.
 *
 * `JSON.stringify` alone is NOT safe here. It escapes quotes and backslashes but
 * leaves `<` and `>` untouched — so a config value containing
 * `</script><script>...` closes the tag early and everything after it becomes
 * executable markup. That is a live XSS the moment config stops being
 * hand-authored, which is precisely what the planned config UI / DB does — the
 * same future `validate-config.ts` says it exists for.
 *
 * These are ordinary JSON escapes: `JSON.parse` turns them back into the
 * original characters, so Google and every other consumer still read the true
 * value. Nothing is lost except the ability to break out of the tag.
 *
 * U+2028 / U+2029 are escaped too. They are legal inside JSON but are line
 * terminators to some JavaScript parsers — the same class of bug one layer down.
 */
export function jsonLdScript(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}
