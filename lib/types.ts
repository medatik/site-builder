/**
 * Core type system for the showcase engine.
 *
 * A client's entire site is described by a single `SiteConfig`. The engine
 * never hardcodes copy — every string the visitor sees comes from a config.
 */

/* ------------------------------------------------------------------ *
 * Theme
 * ------------------------------------------------------------------ */

export type StylePreset =
  | "sharp"
  | "rounded"
  | "soft"
  | "stark"
  | "toybox"
  | "petal";

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  /** Muted/secondary text. Falls back to `text` if omitted. */
  muted?: string;
  /**
   * Star-rating gold. Optional — defaults to a per-mode value chosen to clear
   * WCAG's 3:1 for non-text content on any surface (see `paletteCssVars`).
   *
   * Deliberately NOT `accent`: an accent is a decorative brand pop, a star is
   * meaningful content that must stay legible. Override only if the default
   * clashes, and check the contrast if you do.
   */
  star?: string;
}

export interface ThemeFonts {
  /** Google Font family name for headings, e.g. "Barlow Condensed". */
  heading: string;
  /** Google Font family name for body copy, e.g. "Inter". */
  body: string;
}

export type ThemeMode = "light" | "dark";

interface ThemeBase {
  fonts: ThemeFonts;
  /** Controls border-radius, shadow intensity and spacing scale. */
  stylePreset: StylePreset;
  /**
   * Which palette loads first. When omitted it falls back to whichever palette
   * is defined ("light" when both are). A visitor's choice via the header theme
   * toggle overrides this and is remembered per client.
   */
  defaultMode?: ThemeMode;
}

/**
 * A theme carries a light and/or dark palette. **At least one is required.**
 * Provide both to make the site switchable (and show the header theme toggle);
 * provide just one for a single-mode site. Geometry (preset) and fonts are
 * shared across both modes — only the colors change per mode, and each mode
 * additionally drives `color-scheme` so native controls match.
 */
export type Theme = ThemeBase &
  (
    | { colorsLight: ThemeColors; colorsDark?: ThemeColors }
    | { colorsLight?: ThemeColors; colorsDark: ThemeColors }
  );

/* ------------------------------------------------------------------ *
 * Shared building blocks
 * ------------------------------------------------------------------ */

/**
 * Brand mark. Image logos are per-mode and **mutually fallback**: define only
 * one and it is used in BOTH modes; define both and each renders in its own
 * mode. Define neither and the site name renders as a wordmark (with an
 * optional monogram tile).
 *
 * Switching is CSS-only (keyed on the theme wrapper's `data-mode`), because the
 * theme toggle flips that attribute without re-rendering React.
 */
export interface Logo {
  /** Image URL for LIGHT mode. Falls back to `srcDark` when omitted. */
  srcLight?: string;
  /** Image URL for DARK mode. Falls back to `srcLight` when omitted. */
  srcDark?: string;
  alt: string;
  /** Optional short mark/monogram used when no image is supplied. */
  monogram?: string;
}

export interface CtaLink {
  label: string;
  href: string;
  /** Visual weight. Defaults per-context. */
  variant?: "primary" | "secondary" | "ghost";
  /** Optional lucide icon name rendered before the label. */
  icon?: string;
}

/**
 * How a photograph is mapped into the site's palette.
 *
 * Stock photography arrives in whatever colours it was shot in, and a site is
 * only as coherent as its least matching image. Rather than hunting for photos
 * that happen to suit each palette, the palette is applied to the photo: the
 * image keeps its LUMINANCE — so detail, depth and composition survive — and
 * takes its HUE from the theme. A photo swapped in later cannot break the look,
 * and one photo suits every client.
 *
 * - `none` — the photograph as shot. The default; nothing changes.
 * - `tint` — monochrome in `--primary`.
 *
 * A two-colour `duotone` was tried and dropped. A real duotone remaps the
 * TONAL range, and CSS blend modes cannot express that: blending a gradient
 * varies hue across the frame rather than across the tones (a sepia wash), and
 * `lighten`/`darken` clamp each RGB channel independently (garish artefacts).
 * Doing it properly needs an SVG filter with the two colours baked into
 * `feComponentTransfer` tables — which cannot read CSS custom properties, so it
 * would stop being palette-driven, which was the whole point.
 */
export type MediaTreatment = "none" | "tint";

export interface Media {
  /** Optional image URL. When omitted a themed placeholder is rendered. */
  src?: string;
  alt: string;
  /** Palette mapping applied to the photo. Default `none`. */
  treatment?: MediaTreatment;
}

export interface NavItem {
  label: string;
  href: string;
}

export interface BusinessHours {
  /** e.g. "Mon–Fri" */
  days: string;
  /** e.g. "7:00am – 6:00pm" or "Closed" */
  hours: string;
}

export interface SocialLink {
  /** lucide icon name, e.g. "facebook", "instagram", "linkedin". */
  icon: string;
  label: string;
  href: string;
}

/**
 * A public rating shown as social proof — "4.8 ★ · 127 reviews on Google".
 *
 * **This is hand-typed data, never fetched.** Reading a public number off a
 * listing and putting it in config costs nothing and raises no licensing
 * question. Pulling the same number from the Places API would: `rating` and
 * `userRatingCount` sit in the Enterprise SKU (1,000 free events/month per
 * BILLING ACCOUNT, then $20/1,000), and the terms forbid caching the response —
 * so a compliant implementation bills per page view.
 *
 * A rating barely moves, so staleness is cheap: 127 → 131 reviews looks
 * identical. Refresh it during normal maintenance.
 *
 * IMPORTANT: a rating copied from Google/Yelp/Facebook is displayed only — it
 * is NEVER emitted as `schema.org` markup. Google's structured-data policy
 * forbids marking up reviews sourced from another platform, and doing it risks
 * a manual penalty. First-party testimonials are the route to search stars;
 * see `TestimonialsProps.structuredData`.
 */
export interface PublicRating {
  /** e.g. `4.8`. Shown to one decimal place. */
  value: number;
  /** Number of reviews behind the rating, e.g. `127`. */
  count: number;
  /** Link to the public listing, so a visitor can verify it. */
  url?: string;
  /** Platform name shown after the count. Default `"Google"`. */
  source?: string;
}

export interface BusinessInfo {
  phone?: string;
  email?: string;
  address?: string;
  hours?: BusinessHours[];
  socials?: SocialLink[];
  /** Public rating badge data — hand-typed, display-only. See `PublicRating`. */
  rating?: PublicRating;
  /**
   * schema.org type emitted as JSON-LD for local SEO (Google rich results and
   * the local map pack). Use the most specific type that fits, e.g. `"Plumber"`,
   * `"Electrician"`, `"LegalService"`, `"Dentist"`, `"Restaurant"`.
   * Defaults to `"LocalBusiness"`. Full list: https://schema.org/LocalBusiness
   */
  schemaType?: string;
  /** Canonical site URL (e.g. "https://acme.com"). Enables absolute URLs in
   *  structured data and the sitemap; also settable via NEXT_PUBLIC_SITE_URL. */
  url?: string;
}

/**
 * Decorative CSS backdrop (`components/ui/Backdrop.tsx`), shared by `HeroProps` and
 * `CtaProps` — same component, same type, two consumers. Single source of truth: add a
 * new value here (and implement its render branch in `Backdrop.tsx`) and both section
 * types get it automatically, no other file needs to change.
 *
 * `aurora`, `bokeh`, `beam` and `scanline` are continuously animated; their motion is
 * declared only inside `@media (prefers-reduced-motion: no-preference)` in `globals.css`,
 * so they freeze at their first frame for visitors who ask for reduced motion. The rest
 * are static.
 */
export type BackdropVariant =
  | "grid"
  | "glow"
  | "rays"
  | "contour"
  | "halftone"
  | "aurora"
  | "bokeh"
  | "beam"
  | "scanline"
  | "none";

/* ------------------------------------------------------------------ *
 * Section prop shapes
 * ------------------------------------------------------------------ */

/**
 * One slide of a `layout: "slider"` hero. Everything is per-slide, so a slider
 * can carry three different offers rather than three photos of the same one.
 */
export interface HeroSlide {
  eyebrow?: string;
  title: string;
  highlight?: string;
  subtitle?: string;
  primaryCta?: CtaLink;
  secondaryCta?: CtaLink;
  /** Background image. Without a `src` a themed gradient panel renders. */
  media?: Media;
  /** Horizontal placement of the copy over the image. Default `"start"`. */
  align?: "start" | "center" | "end";
}

export interface HeroProps {
  eyebrow?: string;
  title: string;
  highlight?: string; // optional word/phrase within/after title to accent
  subtitle?: string;
  bullets?: string[];
  primaryCta?: CtaLink;
  secondaryCta?: CtaLink;
  /** Trust badges shown under the CTAs, e.g. "Licensed & Insured". */
  badges?: string[];
  media?: Media;
  /**
   * - `split`    — copy beside a portrait image (default).
   * - `centered` — copy centred, no image.
   * - `slider`   — a full-bleed rotating banner built from `slides`. Use it when
   *                a business genuinely leads with imagery (hotel, restaurant,
   *                venue, salon) or has several offers to rotate. It costs the
   *                page some JS and pushes text over photography, so `split`
   *                remains the better default for a service business.
   */
  layout?: "split" | "centered" | "slider";
  /** Slides for `layout: "slider"`. Ignored by the other layouts; if it's empty
   *  the hero falls back to rendering the top-level copy as a single slide. */
  slides?: HeroSlide[];
  /** Advance automatically every N milliseconds. Omit or `0` to disable.
   *  Autoplay always pauses on hover, on keyboard focus, and for visitors who
   *  ask for reduced motion. */
  autoplayMs?: number;
  /** Slider control labels (localise via the translation overlay). */
  sliderLabels?: { prev?: string; next?: string; goTo?: string };
  /** Decorative CSS backdrop behind the hero. Ignored by `slider`, whose
   *  imagery is the backdrop. */
  backdrop?: BackdropVariant;
}

export interface ServiceItem {
  /** lucide icon name. */
  icon?: string;
  title: string;
  description: string;
  href?: string;
}

export interface ServicesProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  items: ServiceItem[];
  columns?: 2 | 3 | 4;
  /** Text of the per-card link (shown on items with an `href`). Default `"Learn more"`. */
  learnMoreLabel?: string;
}

export interface StatItem {
  value: string;
  label: string;
}

export interface AboutProps {
  eyebrow?: string;
  title: string;
  /** One or more paragraphs. */
  body: string | string[];
  highlights?: string[];
  stats?: StatItem[];
  media?: Media;
  /** Side the media sits on in split layout. */
  mediaSide?: "left" | "right";
}

export interface Testimonial {
  quote: string;
  author: string;
  role?: string;
  /** 1–5. Renders star rating when present. */
  rating?: number;
  avatar?: Media;
}

export interface TestimonialsProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  items: Testimonial[];
  /** Show the `business.rating` badge under the heading. Display only — it
   *  never becomes structured data. Default `false`. */
  showRating?: boolean;
  /** Text between the review count and the platform, e.g. `"avis sur"`.
   *  Default `"reviews on"`; override to localise. */
  reviewsLabel?: string;
  /**
   * Emit `schema.org` `Review` + `AggregateRating` for these testimonials, which
   * is what can produce ★ stars in search results.
   *
   * **Only enable when these are genuine, first-party, verifiable reviews the
   * business collected itself.** Google forbids marking up reviews copied from
   * another platform (Google, Yelp, Facebook) and penalises fabricated review
   * markup — so this is opt-in per client, never a default, and must stay off
   * for demo/placeholder copy. Ignored unless items carry a `rating`.
   */
  structuredData?: boolean;
}

export interface GalleryImage extends Media {
  caption?: string;
  /** Optional short label overlaid on the placeholder tile. */
  label?: string;
}

/**
 * How a gallery arranges its images.
 *
 * - `grid`     — equal 4:3 tiles in a tidy grid. The default, and the safe
 *                choice when photos are inconsistent: uniform crops hide it.
 * - `carousel` — one horizontal scroll-snap row. Best when there are many
 *                images and they shouldn't dominate the page; the controls only
 *                appear when the track actually overflows.
 * - `masonry`  — natural heights in staggered columns, so portrait and
 *                landscape shots sit together uncropped. Best for real
 *                photography (interiors, food, hair, tattoos).
 */
export type GalleryLayout = "grid" | "carousel" | "masonry";

export interface GalleryProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  images: GalleryImage[];
  columns?: 2 | 3 | 4;
  /** Arrangement. Default `"grid"` — existing configs are unaffected. */
  layout?: GalleryLayout;
  /** Carousel control labels (localise via the translation overlay). */
  carouselLabels?: { prev?: string; next?: string; goTo?: string };
}

export interface PricingTier {
  name: string;
  price: string;
  period?: string;
  description?: string;
  features: string[];
  cta?: CtaLink;
  highlighted?: boolean;
  badge?: string;
}

export interface PricingProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  tiers: PricingTier[];
  note?: string;
}

export interface FormField {
  name: string;
  label: string;
  type?: "text" | "email" | "tel" | "textarea" | "select" | "date";
  placeholder?: string;
  required?: boolean;
  options?: string[]; // for select
}

/**
 * A contact-delivery channel. Each name maps to a server-side adapter
 * (`lib/contact/adapters/`) via the registry in `lib/contact/registry.ts` —
 * the same union + map + dispatcher shape as sections/headers/footers. Adding a
 * channel (WhatsApp, SMS, …) is: add a name here, write the adapter, register it.
 *
 * - `email`    — Resend (a verified sending domain; reply-to = the visitor).
 * - `telegram` — a bot message to the owner's phone.
 */
export type DeliveryChannel = "email" | "telegram";

/**
 * Where a contact form's enquiries go. **Pure data — no secrets.** Every
 * channel's credentials/targets (API keys, bot tokens, chat ids)
 * are ENV VARS read server-side, never config, so this block stays safe to edit
 * in a future UI or store in a database. See `.env.example` for the env var each
 * channel reads.
 */
export interface ContactDelivery {
  /**
   * Channels to attempt, in order. Omit to use every channel whose env vars are
   * present in this deployment — so a client can turn a channel on purely by
   * setting its secret in Vercel, with no config change. Naming a channel whose
   * env is missing is a no-op (and warns in dev).
   */
  channels?: DeliveryChannel[];
  /** Email-channel tuning. `to` defaults to `business.email` (and is itself
   *  overridden by the `CONTACT_EMAIL_TO` env var); the FROM address is the
   *  env-configured verified sender, never set here. */
  email?: {
    to?: string;
    subject?: string;
    /** Optional sentence above the fields, e.g. "Call back within the hour." */
    intro?: string;
  };
  /**
   * Wording of the notification the OWNER receives. Defaults are English.
   *
   * These live in the contact section's props, so they localise through the
   * normal `translations` overlay — write them once per locale under
   * `translations.<code>.sections.contact.delivery.labels` and the notification
   * follows whichever language the enquiry was submitted in.
   */
  labels?: {
    /** Headline. Default `"New enquiry"`. */
    heading?: string;
    /** Timestamp row label. Default `"Received"`. */
    received?: string;
    /** Locale row label. Default `"Language"`. */
    language?: string;
    /** IP row label. Default `"IP"`. */
    ip?: string;
    /** Hint under the fields in email. Default `"Reply to this email to
     *  respond directly to the sender."` Set to `"none"` to omit it. */
    replyHint?: string;
  };
  /**
   * Force the notification's language instead of following the visitor's.
   *
   * By default a submission made on the Arabic version of the site produces an
   * Arabic notification (the labels for that locale). Set this to pin one
   * language — e.g. `"en"` when the owner reads English but the site is
   * multilingual. Must be one of `i18n.locales`.
   */
  locale?: string;
}

export interface ContactProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  fields?: FormField[];
  submitLabel?: string;
  /** Heading of the success state. Default `"Message sent"`; override to localise. */
  successTitle?: string;
  /** Success message shown after submit. */
  successMessage?: string;
  /** Label of the button that returns to a blank form after a successful send.
   *  Default English; override to localise. */
  sendAnotherLabel?: string;
  /** Optional external booking URL; when set the form is replaced by a button. */
  bookingUrl?: string;
  /** Show the business contact panel (phone/email/address/hours) alongside. */
  showBusinessInfo?: boolean;
  /** Row labels for the business-info panel. Default English; override to localise. */
  infoLabels?: { callUs?: string; email?: string; visit?: string; hours?: string };
  /** Placeholder for empty `select` fields. Default `"Select…"`. */
  selectPlaceholder?: string;
  /** Prompt shown above the button in booking mode. Default English. */
  bookingPrompt?: string;
  /** Error shown under an empty required select/date field on submit. Native
   *  text inputs use the browser's own message; these custom controls are
   *  validated in React (hidden inputs are barred from constraint validation).
   *  Default English; override to localise. */
  requiredMessage?: string;
  /** Where submitted enquiries are delivered. Omit and the form still validates
   *  and shows success, but nothing is sent (dev logs it; production reports a
   *  configuration error rather than dropping silently). See `ContactDelivery`. */
  delivery?: ContactDelivery;
  /** Message shown if delivery fails at send time (network / provider error).
   *  Default English; override to localise. */
  errorMessage?: string;
  /** Button label while the submission is in flight. Default `"Sending…"`;
   *  override to localise. */
  sendingLabel?: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface FaqProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  items: FaqItem[];
}

export interface TeamMember {
  name: string;
  role: string;
  bio?: string;
  photo?: Media;
  credentials?: string;
  socials?: SocialLink[];
}

export interface TeamProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  members: TeamMember[];
  columns?: 2 | 3 | 4;
}

export interface LocationProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  /** Street address. Omit to inherit the global `business.address`. */
  address?: string;
  /** Full map embed URL. When omitted, one is built from the address. */
  mapEmbedUrl?: string;
  /** Omit to inherit the global `business.phone`. */
  phone?: string;
  /** Omit to inherit the global `business.hours`. */
  hours?: BusinessHours[];
  directionsUrl?: string;
  /** "Get directions" button text. Default English; override to localise. */
  directionsLabel?: string;
  /** Labels for the info rows. Default English; override to localise. */
  infoLabels?: { address?: string; phone?: string; hours?: string };
}

export interface CtaProps {
  title: string;
  description?: string;
  primaryCta?: CtaLink;
  secondaryCta?: CtaLink;
  /** "band" = full-width color band, "card" = contained panel. */
  variant?: "band" | "card";
  /** Decorative CSS backdrop. */
  backdrop?: BackdropVariant;
}

/** One headed part of a legal document. */
export interface LegalBlock {
  /** Rendered as an `<h2>`. Omit for an unheaded run of paragraphs. */
  heading?: string;
  /** One or more paragraphs. */
  body: string | string[];
  /** Optional bulleted list, rendered after the paragraphs. */
  bullets?: string[];
}

/**
 * A long-form legal/prose document — privacy policy, terms, cookie notice,
 * accessibility statement.
 *
 * Deliberately NOT the `about` section: `about` is a two-column marketing block
 * that renders a media placeholder beside its text, which is both wrong-looking
 * and unreadable at document length. This is single-column, measure-constrained
 * and heading-aware — a different content shape, so a different section type.
 */
export interface LegalProps {
  eyebrow?: string;
  title: string;
  /** e.g. "Last updated 29 July 2026". Shown under the title. */
  updated?: string;
  /** Lead paragraph(s) before the first heading. */
  intro?: string | string[];
  blocks: LegalBlock[];
}

/* ------------------------------------------------------------------ *
 * Section union
 * ------------------------------------------------------------------ */

export interface SectionPropMap {
  hero: HeroProps;
  services: ServicesProps;
  about: AboutProps;
  testimonials: TestimonialsProps;
  gallery: GalleryProps;
  pricing: PricingProps;
  contact: ContactProps;
  faq: FaqProps;
  team: TeamProps;
  location: LocationProps;
  cta: CtaProps;
  legal: LegalProps;
}

export type SectionType = keyof SectionPropMap;

/** A single entry in a config's ordered `sections` array. */
export type Section = {
  [K in SectionType]: {
    type: K;
    enabled: boolean;
    /** Optional anchor id override (defaults to the section type). */
    id?: string;
    props: SectionPropMap[K];
  };
}[SectionType];

/* ------------------------------------------------------------------ *
 * Site config
 * ------------------------------------------------------------------ */

export interface SeoConfig {
  title?: string;
  description?: string;
  keywords?: string[];
}

/**
 * One routed page beyond the home page (see `SiteConfig.pages`).
 *
 * A page is just a slug plus its own `sections` — it reuses every existing
 * section type, header, footer and theme, so nothing new has to be authored to
 * build one. Sections here take part in i18n exactly like home sections: their
 * `id` (defaulting to `type`) is the translation-overlay key, so ids must be
 * unique across the whole site, not just within a page.
 */
export interface PageConfig {
  /** URL segment(s), e.g. `"privacy"` → `/privacy`. Kebab-case, no leading slash. */
  slug: string;
  /** Nav label and default `<title>`. */
  title: string;
  /** The page body — same section union as the home page. */
  sections: Section[];
  /** Per-page metadata; falls back to the site's `seo` + this page's `title`. */
  seo?: SeoConfig;
  /** Show in the header nav. Default `true`. Set false for legal pages, which
   *  belong in the footer rather than the main nav. */
  nav?: boolean;
}

/**
 * Header theme toggle. Lets visitors switch between the theme's light and dark
 * palettes. Only meaningful — and only shown — when the theme defines *both*
 * palettes. Icons default to moon/sun but are fully overridable.
 */
export interface ThemeToggleConfig {
  /** Show the toggle. Requires both light and dark palettes; otherwise hidden. */
  enabled?: boolean;
  /** Icon shown while in LIGHT mode (click switches to dark). Default: `"moon"`. */
  iconLight?: string;
  /** Icon shown while in DARK mode (click switches to light). Default: `"sun"`. */
  iconDark?: string;
  /** Accessible label / tooltip. Default: `"Toggle theme"`. */
  label?: string;
}

/**
 * Which header layout to render. Selected per-client via `header.type`; the
 * component for each lives in the registry at `components/headers/index.ts`.
 * Single source of truth — add a value here and a matching entry there, and
 * nothing else needs to change. Default (unset) is `"classic"`.
 *
 * - `classic`  — logo left, inline nav, actions (toggle/CTA) right. The default.
 * - `centered` — three zones: nav left · centered logo · actions right. Editorial.
 * - `minimal`  — logo + actions only; nav lives in the menu panel at every
 *                breakpoint (hamburger always visible). Pairs well with a
 *                `left`/`right` sidebar menu.
 */
export type HeaderType = "classic" | "centered" | "minimal";

/**
 * What a sticky header does as the page scrolls. Ignored when `sticky` is false.
 * - `elevate` (default): gains a translucent blurred surface + hairline border.
 * - `shrink`: elevates *and* the bar gets shorter, for a denser scrolled state.
 * - `hide`: slides up out of view when scrolling down, returns when scrolling up.
 * - `none`: no change on scroll.
 */
export type HeaderScrollBehavior = "elevate" | "shrink" | "hide" | "none";

/** Mobile menu presentation: a dropdown from the top, or a slide-in side panel. */
export type MobileMenuStyle = "top" | "left" | "right";

/**
 * Header behaviour & appearance — all driven from config so the same header
 * system can present differently per client without code changes. Each option
 * also surfaces as a `data-*` attribute on the `<header>` element
 * (`data-variant`, `data-sticky`, `data-scrolled`, `data-hidden`) for styling.
 */
export interface HeaderConfig {
  /** Which header layout to render. Default: `"classic"`. */
  type?: HeaderType;
  /** Primary call-to-action shown in the actions cluster. */
  cta?: CtaLink;
  /** Optional light/dark theme toggle (needs both palettes defined). */
  themeToggle?: ThemeToggleConfig;
  /**
   * Pin the header to the top of the viewport on scroll. Default: `true`.
   * **When `false`, `variant`, `scrollBehavior` and `elevateOnScroll` have no
   * effect** — the header scrolls away with the page and renders in a single
   * solid appearance (no scroll listener is attached).
   */
  sticky?: boolean;
  /**
   * Resting appearance (sticky only):
   * - `"transparent"` (default): no background at the top of the page so the
   *   header blends into the hero; it gains a surface on scroll.
   * - `"solid"`: always sits on the theme `background`.
   */
  variant?: "transparent" | "solid";
  /** What happens on scroll (sticky only). Default: `"elevate"`. See `HeaderScrollBehavior`. */
  scrollBehavior?: HeaderScrollBehavior;
  /**
   * @deprecated Use `scrollBehavior`. Kept for back-compat: when `scrollBehavior`
   * is unset, `elevateOnScroll: false` maps to `"none"`, otherwise `"elevate"`.
   */
  elevateOnScroll?: boolean;
  /** Mobile menu style: `"top"` dropdown (default), or `"left"`/`"right"` slide-in sidebar. */
  mobileMenu?: MobileMenuStyle;
}

/**
 * A single floating action button pinned to a screen corner (e.g. a WhatsApp
 * chat button). Generic: it can point anywhere and use any icon. Omit
 * `floatingButton` entirely, or set `enabled: false`, to hide it.
 */
export interface FloatingAction {
  /** Show the button. Defaults to `true` when a `floatingButton` is provided. */
  enabled?: boolean;
  /** Link target — `tel:`, WhatsApp (`wa.me` / `whatsapp:`), `mailto:`, an
   *  on-page `#anchor`, or an external URL. Behaviour matches CTA buttons. */
  href: string;
  /** Accessible label — used as the tooltip, and as visible text when `showLabel`. */
  label: string;
  /** Icon name (lucide or `"whatsapp"`). Defaults to `"message-circle"`. */
  icon?: string;
  /** Render the label text beside the icon (pill) instead of an icon-only disc. */
  showLabel?: boolean;
  /** Screen corner. Defaults to `{ x: "right", y: "bottom" }`. */
  position?: { x?: "left" | "right"; y?: "top" | "bottom" };
  /** Colour treatment. `"whatsapp"` uses WhatsApp brand green; the others use
   *  theme colors. Defaults to `"whatsapp"` for WhatsApp links, else `"primary"`. */
  variant?: "primary" | "secondary" | "accent" | "whatsapp";
}

/**
 * Which footer layout to render. Selected per-client via `footer.type`; the
 * component for each lives in the registry at `components/footers/index.ts`.
 * Single source of truth — add a value here and a matching entry there, and
 * nothing else needs to change. Default (unset) is `"columns"`.
 *
 * - `columns`   — the classic multi-column footer (brand · quick-nav · contact
 *                 + a legal bar). The richest layout; the safe default.
 * - `minimal`   — one compact bar: brand, inline nav, socials, copyright. No
 *                 contact block — for simple/portfolio sites.
 * - `spotlight` — centered, brand-forward: big logo, tagline, prominent
 *                 phone/email call-to-action chips, centered nav & socials.
 */
export type FooterType = "columns" | "minimal" | "spotlight";

/**
 * Footer content & labels. Everything else the footer shows (logo, contact
 * details, socials, quick-nav links) comes from `logo`/`business`/`nav`, so it
 * always matches the rest of the site without duplication.
 *
 * Not every field applies to every `type` — the column headings only surface in
 * `columns`, and `minimal` has no contact block, so `showHours`/`contactLabel`
 * are ignored there. See each variant in `components/footers/`.
 */
export interface FooterConfig {
  /** Which footer layout to render. Default: `"columns"`. */
  type?: FooterType;
  /** Short brand blurb under the logo. */
  tagline?: string;
  /** Small print, e.g. license number, accreditation. */
  legal?: string;
  /** Heading of the quick-nav column (`columns` only). Default: `"Explore"`. */
  exploreLabel?: string;
  /** Heading of the contact column (`columns` only). Default: `"Get in touch"`. */
  contactLabel?: string;
  /** Also render `business.hours` in the contact block (`columns`/`spotlight`). Default: `false`. */
  showHours?: boolean;
  /**
   * Copyright line, three states: unset → generated
   * `© {year} {siteName}. All rights reserved.`; the literal string `"none"` →
   * no copyright line at all; any other string → used verbatim. The sentinel
   * exists because with a plain optional string, "unset" would be ambiguous
   * between "use the default" and "show nothing".
   */
  copyrightText?: string;
}

/* ------------------------------------------------------------------ *
 * Internationalisation (i18n)
 * ------------------------------------------------------------------ */

/** Text direction. `rtl` = right-to-left (Arabic, Hebrew, …). */
export type TextDir = "ltr" | "rtl";

/** Recursive `Partial` — every property, at every depth, becomes optional.
 *  Used so a translation only needs to carry the strings that actually change. */
export type DeepPartial<T> = T extends (infer U)[]
  ? U[]
  : T extends object
    ? { [K in keyof T]?: DeepPartial<T[K]> }
    : T;

/** One language offered by a site. */
export interface LocaleConfig {
  /** BCP-47-ish code used in the URL (`?lang=fr`) and as the translation key. */
  code: string;
  /** Native name shown in the selector, e.g. `"Français"`, `"العربية"`. */
  label: string;
  /** Writing direction. Default `"ltr"`. `"rtl"` flips the whole layout. */
  dir?: TextDir;
  /** Optional per-locale font override (e.g. an Arabic face like Cairo). Merged
   *  over `theme.fonts` for this locale only. */
  font?: Partial<ThemeFonts>;
}

/** Multilingual configuration. When present with >1 locale, the header can show
 *  a language selector; the active locale comes from the `?lang=` URL param. */
export interface I18nConfig {
  /** Locale used when `?lang=` is absent or unrecognised. Must be a `locales` code. */
  defaultLocale: string;
  /** Languages offered, in the order shown in the selector. */
  locales: LocaleConfig[];
  /** Show the header language selector. Defaults to `true` when >1 locale exists. */
  switcher?: { enabled?: boolean };
}

/**
 * A per-locale content overlay — only the strings that differ from the base
 * config. Deep-merged over the base at render time (`localizeConfig`), so a
 * translation never repeats theme, structure, or untranslated copy.
 *
 * `sections` is keyed by each section's `id` (which defaults to its `type`), NOT
 * by array position — so reordering or adding sections never desyncs a
 * translation. Section prop overlays are loosely typed for the same reason the
 * section registry is (per-section prop shapes live at the authoring site).
 */
export interface Translation {
  siteName?: string;
  header?: DeepPartial<HeaderConfig>;
  footer?: DeepPartial<FooterConfig>;
  business?: DeepPartial<BusinessInfo>;
  seo?: DeepPartial<SeoConfig>;
  /** Localised nav (labels translated, `href` anchors unchanged). Without this,
   *  nav falls back to the auto-derived English labels from `lib/nav.ts`. */
  nav?: NavItem[];
  /** Section prop overrides, keyed by section `id`. */
  sections?: Record<string, Record<string, unknown>>;
  /**
   * Per-page `<title>`/SEO overrides for routed pages, keyed by `PageConfig.slug`.
   * A page's BODY localises through `sections` like the home page's — but its
   * title and meta description live on `PageConfig` itself, outside the section
   * tree, so `sections` cannot reach them. Omit and the base-language title
   * carries over unchanged, which is correct for a single routed page authored
   * once (e.g. a monolingual site's privacy page) and wrong for one meant to
   * read in every locale (a browser tab reading "Privacy policy" on an Arabic
   * page is the kind of mismatch that's invisible until you compare tabs).
   */
  pages?: Record<string, { title?: string; seo?: DeepPartial<SeoConfig> }>;
}

export interface SiteConfig {
  /** URL-safe slug. Must match the key used in /configs/index.ts. */
  client: string;
  siteName: string;
  logo: Logo;
  theme: Theme;
  business?: BusinessInfo;
  /** Explicit nav. When omitted, nav is derived from enabled sections. */
  nav?: NavItem[];
  header?: HeaderConfig;
  /** Optional floating action button (e.g. WhatsApp), pinned to a screen corner. */
  floatingButton?: FloatingAction;
  footer?: FooterConfig;
  seo?: SeoConfig;
  sections: Section[];
  /**
   * Extra routed pages, e.g. `/privacy` or `/services/emergency-plumbing`.
   *
   * OPTIONAL and additive: omit it and the site stays exactly the single-page
   * site it is today. Add pages when a client needs a legal page (a privacy
   * policy becomes mandatory once the contact form collects personal data) or
   * wants to rank for a specific service — Google ranks pages, not sections.
   */
  pages?: PageConfig[];
  /**
   * Document language for a site that is NOT multilingual, e.g. `"fr"`.
   *
   * `<html lang>` drives screen-reader pronunciation and search-engine language
   * detection, and it fell back to "en" for every site without `i18n` — so a
   * French site was read aloud with English phonetics. Declaring a single-locale
   * `i18n` block fixes the language but opts the whole site into DYNAMIC
   * rendering: the layout calls `headers()` and the page awaits `searchParams`,
   * both gated on `i18n` precisely to keep monolingual sites static. That is a
   * real cost for no benefit when there is only one language to choose from.
   *
   * This states the language without buying the machinery. Ignored when `i18n`
   * is present, which already knows the locale.
   */
  lang?: string;
  /** Text direction for `lang`. Default `"ltr"`. Ignored when `i18n` is set. */
  dir?: TextDir;
  /** Optional multilingual setup. Omit for a single-language site. */
  i18n?: I18nConfig;
  /** Per-locale content overlays, keyed by locale code. See `Translation`. */
  translations?: Record<string, Translation>;
}
