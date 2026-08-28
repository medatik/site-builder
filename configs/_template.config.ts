import type { SiteConfig } from "@/lib/types";

/**
 * Template config — a neutral starting point.
 *
 * It exercises the section types with placeholder copy, so the engine stays
 * buildable and `/preview` has something to render before any real site exists.
 * The three demo configs beside it show what a finished one looks like.
 *
 * To start a new site:
 *   1. copy this file to `configs/<slug>.config.ts`, fill in real content,
 *      set `client` to `<slug>`
 *   2. register it in `configs/index.ts` and set NEXT_PUBLIC_ACTIVE_CLIENT=<slug>
 */
const config: SiteConfig = {
  client: "_template",
  siteName: "Your Business",
  logo: { alt: "Your Business", monogram: "YB" },

  theme: {
    stylePreset: "rounded",
    defaultMode: "light",
    colorsLight: {
      primary: "#2563EB",
      secondary: "#1E293B",
      accent: "#0EA5E9",
      background: "#FFFFFF",
      text: "#0F172A",
      muted: "#64748B",
    },
    colorsDark: {
      primary: "#3B82F6",
      secondary: "#334155",
      accent: "#38BDF8",
      background: "#0B1220",
      text: "#E2E8F0",
      muted: "#94A3B8",
    },
    fonts: { heading: "Poppins", body: "Inter" },
  },

  // These values are the single source of truth for the site's contact details.
  // Anywhere copy needs to mention them, write a TOKEN rather than repeating the
  // value: `{phone}` (display form — bidi-safe inside RTL copy), `{phoneHref}`
  // (a ready-made tel: link), `{phoneRaw}`, `{email}`, `{emailHref}`, `{address}`
  // and `{siteName}`. Change the number here and every mention updates.
  //
  // Tokens exist so a config stays pure DATA — never write a `const` or a
  // template literal in this file. See "Configs are data" in the README.
  business: {
    phone: "+1 (555) 000-0000",
    email: "hello@example.com",
    address: "123 Main Street, Your City",
    hours: [
      { days: "Mon–Fri", hours: "9:00am – 5:00pm" },
      { days: "Saturday", hours: "By appointment" },
      { days: "Sunday", hours: "Closed" },
    ],
    // Public rating badge — TYPE THIS BY HAND from the client's own listing.
    // It is deliberately not fetched: the Places API charges for `rating` on its
    // most expensive SKU (1,000 free calls/month shared across ALL your clients,
    // then $20/1,000) AND forbids caching the answer, so a compliant version
    // bills on every page view. A rating barely moves — refresh it when you next
    // touch the config. Display-only; it never becomes structured data.
    rating: {
      value: 0.1,
      count: 1,
      source: "Google",
      url: "https://www.google.com",
    },
  },

  header: {
    sticky: true,
    cta: { label: "Get in touch", href: "#contact", variant: "primary" },
    themeToggle: { enabled: true },
  },

  // Extra routed pages. Delete this block for a pure single-page site — it is
  // entirely optional and nothing else changes.
  pages: [
    {
      slug: "privacy",
      title: "Privacy",
      nav: false, // legal pages belong in the footer, not the main nav
      sections: [
        // A working starting point, not finished legal advice. It describes what
        // this engine actually does (contact form, IP-based rate limiting, theme
        // preference in local storage), so it is accurate out of the box — but
        // "Who else sees it" MUST be trimmed to the delivery channels you really
        // enabled, and the business should read it before the site goes live.
        // Per-channel wording is in `.env.example`.
        {
          type: "legal",
          id: "privacy-body",
          enabled: true,
          props: {
            eyebrow: "Legal",
            title: "Privacy policy",
            updated: "Last updated: 1 January 2026",
            intro:
              "This policy explains what personal information {siteName} collects through this website, why we collect it, and what you can ask us to do with it.",
            blocks: [
              {
                heading: "Who we are",
                body: "{siteName} is the controller of the personal information described here. You can reach us at {email} or by post at {address}.",
              },
              {
                heading: "What we collect",
                body: "We only collect what you type into our contact form, plus a small amount of technical information your browser sends automatically.",
                bullets: [
                  "The details you enter in the contact form — typically your name, email address, phone number and your message.",
                  "Your IP address, which we use to limit automated abuse of the form and which is included in the notification we receive.",
                  "Standard server logs kept by our hosting provider, such as the pages requested and the time of the request.",
                ],
              },
              {
                heading: "Why we collect it",
                body: "We use your enquiry solely to reply to you and to provide the service you asked about. We do not sell your information, and we do not use it for advertising or profiling.",
              },
              {
                heading: "Who else sees it",
                body: "We share your information only with the providers that operate this website and deliver your enquiry to us:",
                bullets: [
                  "Our website host, which serves this site and keeps standard server logs.",
                  "Our email provider, which delivers your enquiry to our inbox.",
                ],
              },
              {
                heading: "How long we keep it",
                body: "We keep enquiries for as long as we need them to answer you and to keep a record of work we have done, and then we delete them. If you ask us to delete your enquiry sooner, we will.",
              },
              {
                heading: "Your rights",
                body: "You can ask us for a copy of the information we hold about you, ask us to correct it, or ask us to delete it. Email {email} and we will respond. If you are not satisfied with our response, you can complain to your local data protection authority.",
              },
              {
                heading: "Cookies and browser storage",
                body: "This site sets no advertising or tracking cookies. If the site offers a light/dark theme switch, your choice is saved in your browser's local storage so the page does not flash the wrong theme when you return. It stays on your device and is never sent to us.",
              },
              {
                heading: "Changes to this policy",
                body: "If we change how we handle your information we will update this page and the date at the top.",
              },
            ],
          },
        },
      ],
    },
  ],

  sections: [
    {
      type: "hero",
      enabled: true,
      props: {
        eyebrow: "Template site",
        title: "A headline for",
        highlight: "your business.",
        subtitle:
          "Replace this copy with your value proposition. This is the neutral template rendered on the engine's main branch.",
        bullets: ["A clear benefit", "Another reason to choose you", "Something that builds trust"],
        primaryCta: { label: "Get in touch", href: "#contact" },
        secondaryCta: { label: "Our services", href: "#services", variant: "secondary" },
        badges: ["Placeholder badge", "Fully configurable"],
        layout: "centered",
      },
    },
    {
      type: "services",
      enabled: true,
      props: {
        eyebrow: "What we do",
        title: "Services",
        subtitle: "Describe the core things you offer. Each card is one entry in the config.",
        columns: 3,
        items: [
          { icon: "sparkles", title: "First service", description: "A short description of what this includes and who it's for." },
          { icon: "shield-check", title: "Second service", description: "A short description of what this includes and who it's for." },
          { icon: "clock", title: "Third service", description: "A short description of what this includes and who it's for." },
        ],
      },
    },
    {
      type: "testimonials",
      enabled: true,
      props: {
        eyebrow: "Reviews",
        title: "What customers say",
        // Shows the `business.rating` badge under the heading: an aggregate from
        // the client's public listing, linking out so a visitor can verify it.
        showRating: true,
        // reviewsLabel: "avis sur",   // localise via the translations overlay
        items: [
          { quote: "Replace this with a real quote from a real customer. Specific beats glowing.", author: "First Customer", role: "City or context", rating: 5 },
          { quote: "A second review — mention what the job was and what the outcome felt like.", author: "Second Customer", role: "City or context", rating: 5 },
          { quote: "A third keeps the desktop row balanced; a fourth turns it into a carousel.", author: "Third Customer", role: "City or context", rating: 4 },
          { quote: "A fourth review. Beyond three, the row overflows and the arrows and dots appear on their own.", author: "Fourth Customer", role: "City or context", rating: 3 },
        ],
        // ⚠️ SEARCH STARS — leave this OFF until the quotes above are genuine,
        // first-party reviews the business actually collected. It emits
        // schema.org Review + AggregateRating markup; Google issues manual
        // penalties for fabricated review markup, and separately FORBIDS marking
        // up reviews copied from Google/Yelp/Facebook (that's why the badge above
        // never becomes structured data). See the README.
        structuredData: false,
      },
    },
    {
      type: "contact",
      enabled: true,
      props: {
        eyebrow: "Get in touch",
        title: "Contact us",
        // `{phone}` expands to the number in `business` above — this is the
        // token pattern every config should use instead of retyping it.
        subtitle: "Tell us what you need and we'll get back to you, or call {phone}.",
        submitLabel: "Send message",
        showBusinessInfo: true,
        // Where enquiries go. Omit `delivery` and any channel whose env vars are
        // set in Vercel is used automatically (in dev, submissions log to the
        // console). Secrets NEVER go here — see `.env.example`.
        // delivery: { channels: ["email", "telegram"], email: { to: "you@example.com" } },
      },
    },
  ],
};

export default config;
