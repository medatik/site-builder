import type { SiteConfig } from "./types";

/**
 * Token interpolation — what lets a config stay pure data.
 *
 * A config may not compute. It can't hold `` `Call ${phone}` ``, because a
 * template literal is a *program*: the file and the object it produces are two
 * different things, and a UI editor (or a database row) can round-trip a string
 * but not a program. See "Configs are data" in the README.
 *
 * So a config writes `"Call {phone}"` instead. The difference is the whole
 * decision:
 *
 *   `${phone}`  — code. JavaScript evaluates it when the file loads.
 *   `{phone}`   — data. Seven inert characters that sit in the string until
 *                 this module chooses to replace them.
 *
 * Expansion happens once per render inside `localizeConfig` (`lib/i18n.ts`),
 * AFTER the translation overlay is merged — so translated copy resolves its
 * tokens too, and a token works identically in every locale.
 */

/**
 * Unicode bidi isolate. Wrapping an LTR run in LRI…PDI stops the bidi algorithm
 * reordering its parts when it sits inside RTL copy — without it `+212 656 55`
 * renders with its groups reversed in Arabic. Both chars are invisible no-ops
 * in LTR locales, so this is applied unconditionally.
 */
const LRI = "⁦";
const PDI = "⁩";
/** Keeps a phone number from wrapping mid-number. */
const NBSP = " ";

/**
 * The display form of a phone number, safe to drop into copy in any locale.
 *
 * This is the one piece of the old per-config `phone` const that genuinely had
 * to move into the engine: `dir="ltr"` fixes a whole *field*, but a number
 * embedded mid-sentence is a substring, and a substring can't carry an
 * attribute. So it's isolated at the data level instead.
 */
export function hardenPhone(raw: string): string {
  return `${LRI}${raw.replace(/ /g, NBSP)}${PDI}`;
}

/**
 * `tel:` href for a raw phone number.
 *
 * Deliberately identical to what the components already do inline
 * (`business.phone.replace(/\s+/g, "")` — see `Contact.tsx`, `Location.tsx`,
 * `footers/parts.tsx`, `SpotlightFooter.tsx`): strip whitespace, preserve
 * everything the author wrote. If this normalised more aggressively, a
 * `{phoneHref}` link and an engine-rendered link would point at different
 * numbers on the same page. `\s` also covers the NBSP, so a hardened value
 * passed here by mistake still yields a clean href.
 */
export function telHref(raw: string): string {
  return `tel:${raw.replace(/\s+/g, "")}`;
}

/**
 * The closed token set for a config.
 *
 * Closed is the point: an unrecognised `{foo}` is left exactly as written, so
 * copy that happens to contain braces can never be mangled by this pass.
 */
export function buildTokens(config: SiteConfig): Record<string, string> {
  const business = config.business;
  const tokens: Record<string, string> = { siteName: config.siteName };

  if (business?.phone) {
    tokens.phone = hardenPhone(business.phone);
    // Escape hatch for the rare spot that wants the bare number (a `sms:` body,
    // an aria-label). Prefer `{phone}` in anything a visitor reads.
    tokens.phoneRaw = business.phone;
    tokens.phoneHref = telHref(business.phone);
  }
  if (business?.email) {
    tokens.email = business.email;
    tokens.emailHref = `mailto:${business.email}`;
  }
  if (business?.address) tokens.address = business.address;

  return tokens;
}

/** Token names are `{word}` — no dots, no spaces, no nesting. */
const TOKEN_RE = /\{([a-zA-Z][a-zA-Z0-9]*)\}/g;

function expandString(value: string, tokens: Record<string, string>): string {
  // Fast path: the overwhelming majority of config strings have no braces.
  if (!value.includes("{")) return value;
  return value.replace(TOKEN_RE, (match, key: string) =>
    Object.prototype.hasOwnProperty.call(tokens, key) ? tokens[key] : match,
  );
}

/**
 * Deep-expand every string, preserving reference identity where nothing
 * changed. A config that uses no tokens comes back as the *same object*, so
 * this pass costs nothing for sites that don't need it and can't perturb the
 * existing render path.
 */
function walk<T>(value: T, tokens: Record<string, string>): T {
  if (typeof value === "string") {
    const next = expandString(value, tokens);
    return (next === value ? value : next) as T;
  }

  if (Array.isArray(value)) {
    let changed = false;
    const out = value.map((item) => {
      const next = walk(item, tokens);
      if (next !== item) changed = true;
      return next;
    });
    return (changed ? out : value) as T;
  }

  if (value && typeof value === "object") {
    let changed = false;
    const out: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value)) {
      const next = walk(item, tokens);
      if (next !== item) changed = true;
      out[key] = next;
    }
    return (changed ? out : value) as T;
  }

  return value;
}

/**
 * Expand every token in a config.
 *
 * Runs in two places, and needs to: `getActiveConfig()` resolves the base config
 * (so SEO metadata, the sitemap and the OG image get real values — those routes
 * never call `localizeConfig`), and `localizeConfig` resolves again per locale.
 *
 * `translations` is deliberately SKIPPED here. An overlay's tokens must expand
 * against that locale's own `business` — which only exists after the merge — so
 * a locale that translates its address gets the translated one. `localizeConfig`
 * does that pass. Expansion is idempotent, so the second pass is a no-op on
 * anything already resolved.
 *
 * INVARIANT: `business.phone` comes out RAW. Hardening happens only where
 * `{phone}` is expanded into copy — never by rewriting the field, because the
 * four components above derive their `tel:` hrefs from it, and rewriting it is
 * exactly the bug that once leaked isolate characters into a live phone link.
 * `tests/tokens.test.ts` pins this down.
 */
export function resolveTokens(config: SiteConfig): SiteConfig {
  const { translations, ...rest } = config;
  const walked = walk(rest, buildTokens(config));
  // Nothing expanded — hand back the original object untouched.
  if (walked === rest) return config;
  return (translations ? { ...walked, translations } : walked) as SiteConfig;
}
