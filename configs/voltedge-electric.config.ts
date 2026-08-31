import type { SiteConfig } from "@/lib/types";

/**
 * VoltEdge Electric — licensed residential & commercial electricians.
 *
 * Identity: bold, high-contrast, industrial. A dark graphite-navy surface with
 * a high-visibility amber (safety/electricity) and an electric-cyan spark.
 * Condensed signage typography (Barlow Condensed) + the "sharp" preset give it
 * a confident, technical, on-the-truck feel. What their customers care about —
 * being licensed & insured, fast 24/7 response, and upfront pricing — leads.
 */
const config: SiteConfig = {
  client: "voltedge-electric",
  siteName: "VoltEdge Electric",
  logo: {
    alt: "VoltEdge Electric",
    // No image source, so the engine renders its own wordmark + monogram. Add
    // `srcLight` / `srcDark` to use real artwork; either may be omitted and
    // whichever is defined is then used in BOTH modes.
    monogram: "VE",
  },

  theme: {
    stylePreset: "sharp",
    defaultMode: "light",
    // Dark is the flagship VoltEdge look: amber + cyan on graphite navy.
    colorsDark: {
      primary: "#FFB020", // high-visibility amber
      secondary: "#12324F", // deep steel navy
      accent: "#38D2F0", // electric cyan spark
      background: "#0C1622", // graphite navy
      text: "#EAF1F8",
      muted: "#8DA2B8",
    },
    // Light variant: same electric identity, but steel-navy leads (so on-primary
    // text stays legible on a bright surface) with the amber kept as the spark.
    colorsLight: {
      primary: "#123E63", // steel navy
      secondary: "#0C1622", // graphite
      // Deepened from #E8930A (2.27:1) for WCAG AA on this near-white surface:
      // `--accent` colours the star ratings, and stars carry meaning, so they
      // need 3:1 as non-text content. The dark palette keeps the bright spark —
      // #38D2F0 is already 10.10:1 on graphite navy.
      accent: "#C17A08", // amber spark — 3.23:1 on background
      background: "#F4F7FB", // cool near-white
      text: "#0F1C2B", // graphite ink
      muted: "#566574",
    },
    fonts: {
      heading: "Barlow Condensed",
      body: "Inter",
    },
  },

  business: {
    phone: "(415) 555-0147",
    email: "dispatch@voltedgeelectric.com",
    address: "1820 Industrial Way, Oakland, CA 94607",
    // Emitted as JSON-LD "@type". The specific schema.org type beats the
    // default "LocalBusiness" for the local map pack and "electrician near me".
    schemaType: "Electrician",
    hours: [
      { days: "Mon–Fri", hours: "7:00am – 6:00pm" },
      { days: "Saturday", hours: "8:00am – 4:00pm" },
      { days: "Sunday", hours: "Emergency service only" },
    ],
    socials: [
      { icon: "facebook", label: "Facebook", href: "https://facebook.com" },
      { icon: "instagram", label: "Instagram", href: "https://instagram.com" },
      { icon: "linkedin", label: "LinkedIn", href: "https://linkedin.com" },
    ],
  },

  header: {
    sticky: true,
    cta: {
      label: "Call 24/7",
      href: "tel:+14155550147",
      icon: "phone",
      variant: "primary",
    },
    // Both palettes are defined above, so offer the light/dark toggle.
    // Defaults to moon (in light) / sun (in dark) — override with iconLight/iconDark.
    themeToggle: { enabled: true },
  },

  // Floating WhatsApp button, pinned bottom-right. Fully configurable — move it
  // to any corner via `position`, swap the icon/href for a different channel, or
  // set `enabled: false` to hide it.
  floatingButton: {
    enabled: true,
    href: "https://wa.me/14155550147",
    label: "Chat on WhatsApp",
    icon: "whatsapp",
    position: { x: "right", y: "bottom" },
  },

  footer: {
    tagline:
      "Licensed, insured, and on call around the clock for homes and businesses across the East Bay.",
    legal: "CA C-10 License #1043927 · Fully insured & bonded",
  },

  seo: {
    title: "VoltEdge Electric — 24/7 Licensed Electricians in Oakland",
    description:
      "Residential and commercial electrical work done right. Panel upgrades, EV chargers, lighting, and 24/7 emergency service. Licensed, insured, upfront pricing.",
    keywords: [
      "electrician",
      "Oakland electrician",
      "EV charger installation",
      "panel upgrade",
      "emergency electrician",
    ],
  },

  // Routed pages. `nav: false` keeps the policy out of the header and puts it in
  // the footer's legal row instead — reachable, but not competing with Services.
  //
  // The processor list below MUST match the delivery channels actually enabled
  // on the contact section (Telegram) plus the host. Naming a provider that
  // doesn't handle the data is as wrong as omitting one that does — so if the
  // delivery channel ever changes, this changes with it.
  pages: [
    {
      slug: "privacy",
      title: "Privacy",
      nav: false,
      seo: {
        title: "Privacy policy — VoltEdge Electric",
        description:
          "How VoltEdge Electric handles the information you send through our contact form.",
      },
      sections: [
        {
          type: "legal",
          id: "privacy-body",
          enabled: true,
          props: {
            eyebrow: "Legal",
            title: "Privacy policy",
            updated: "Last updated: 3 August 2026",
            intro:
              "This policy explains what personal information {siteName} collects through this website, why we collect it, and what you can ask us to do with it.",
            blocks: [
              {
                heading: "Who we are",
                body: "{siteName} is the controller of the personal information described here. You can reach us at {email}, call {phone}, or write to us at {address}.",
              },
              {
                heading: "What we collect",
                body: "We only collect what you type into our service request form, plus a small amount of technical information your browser sends automatically.",
                bullets: [
                  "Your name and phone number, which we need in order to call you back.",
                  "Your email address, if you choose to give it.",
                  "The service you selected and anything you write in the job description.",
                  "Your IP address, which we use to limit automated abuse of the form and which is included in the notification we receive.",
                  "Standard server logs kept by our website host, such as the pages requested and the time of the request.",
                ],
              },
              {
                heading: "Why we collect it",
                body: "We use your request solely to contact you about the electrical work you asked about and to schedule it. We do not sell your information, and we do not use it for advertising or profiling.",
              },
              {
                heading: "Who else sees it",
                body: "We share your information only with the providers that operate this website and deliver your request to us:",
                bullets: [
                  "Vercel, which hosts this website and keeps standard server logs.",
                  "Telegram, which delivers your request to our dispatcher's phone.",
                ],
              },
              {
                heading: "How long we keep it",
                body: "We keep service requests for as long as we need them to answer you and to keep a record of work we have carried out, which we may also need for warranty, insurance and licensing purposes. After that we delete them. If you ask us to delete your request sooner, we will.",
              },
              {
                heading: "Your rights",
                body: "You can ask us for a copy of the information we hold about you, ask us to correct it, or ask us to delete it. Email {email} and we will respond. If you are not satisfied with our response, you can complain to your local data protection authority.",
              },
              {
                heading: "Cookies and browser storage",
                body: "This site sets no advertising or tracking cookies. If you switch the site between light and dark mode, that choice is saved in your browser's local storage so the page does not flash the wrong theme when you return. It stays on your device and is never sent to us.",
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
        eyebrow: "Licensed · Insured · 24/7",
        title: "Power you can",
        highlight: "count on.",
        subtitle:
          "From dead outlets to full panel upgrades and EV chargers — VoltEdge gets it done safely, on time, and at a price we quote before we start.",
        bullets: [
          "Upfront, flat-rate pricing — no surprise invoices",
          "Same-day and 24/7 emergency call-outs",
          "Every job backed by our workmanship warranty",
        ],
        primaryCta: {
          label: "Call (415) 555-0147",
          href: "tel:+14155550147",
          icon: "phone",
        },
        secondaryCta: {
          label: "Request a quote",
          href: "#contact",
          variant: "secondary",
        },
        badges: [
          "Licensed & Insured",
          "4.9★ · 500+ reviews",
          "Upfront pricing",
        ],
        layout: "split",
        backdrop: "aurora",
        media: {
          alt: "VoltEdge electrician working on a panel",
          src: "/photos/voltedge-electric/hero.jpg",
          treatment: "tint",
        },
      },
    },
    {
      type: "services",
      enabled: true,
      props: {
        eyebrow: "What we do",
        title: "Electrical work, done to code",
        subtitle:
          "Whole-home rewires to a single flickering light — same crew, same standards.",
        columns: 3,
        items: [
          {
            icon: "house",
            title: "Residential Wiring",
            description:
              "Rewires, new circuits, outlets, switches, and troubleshooting for older and newer homes alike.",
          },
          {
            icon: "gauge",
            title: "Panel Upgrades",
            description:
              "Upgrade to 200A service, replace failing panels, and add capacity for modern electrical loads.",
          },
          {
            icon: "plug-zap",
            title: "EV Charger Installation",
            description:
              "Level 2 home charger installs — permitted, load-calculated, and ready for any EV.",
          },
          {
            icon: "lightbulb",
            title: "Lighting Design",
            description:
              "Recessed, landscape, and accent lighting that's planned around how you actually use each room.",
          },
          {
            icon: "siren",
            title: "Emergency Repairs",
            description:
              "Lost power, burning smells, tripping breakers — we're on call 24/7 when it can't wait.",
          },
          {
            icon: "power",
            title: "Generator Installs",
            description:
              "Standby and portable generator setups so the lights stay on when the grid doesn't.",
          },
        ],
      },
    },
    {
      type: "about",
      enabled: true,
      props: {
        eyebrow: "Why VoltEdge",
        title: "The electrician you'd recommend to your mom",
        body: [
          "VoltEdge started on a single service truck in 2009 with one rule: treat every home like it's our own. Fifteen years later that hasn't changed — just the size of the crew.",
          "We're a licensed C-10 contractor, fully insured, and background-checked to the last apprentice. You'll get a firm quote before we touch a wire, a clean worksite when we leave, and a warranty that means we come back if anything's off.",
        ],
        highlights: [
          "Licensed C-10 & fully insured",
          "Upfront, itemized quotes",
          "On-time arrival windows",
          "1-year workmanship warranty",
        ],
        stats: [
          { value: "15+", label: "Years in business" },
          { value: "8,200+", label: "Jobs completed" },
          { value: "4.9★", label: "Average rating" },
        ],
        mediaSide: "left",
        media: { src: "/photos/voltedge-electric/about.jpg", treatment: "tint", alt: "VoltEdge crew and service van" },
      },
    },
    {
      type: "pricing",
      enabled: true,
      props: {
        eyebrow: "Straight pricing",
        title: "Know the price before we start",
        subtitle:
          "Flat-rate on common jobs, and a firm written quote on everything else. No hourly surprises.",
        tiers: [
          {
            name: "Service Call",
            price: "$89",
            period: "diagnostic",
            description:
              "A licensed electrician at your door to diagnose the problem — credited toward the repair.",
            features: [
              "Full safety inspection",
              "Written diagnosis",
              "Fee credited to the job",
              "Same-day slots available",
            ],
            cta: { label: "Book a visit", href: "#contact" },
          },
          {
            name: "Panel Upgrade",
            price: "from $1,850",
            description:
              "Upgrade to modern 200A service — permits, labor, and cleanup included.",
            features: [
              "200A panel & breakers",
              "Permit & inspection handled",
              "Whole-home load calc",
              "1-year workmanship warranty",
              "Financing available",
            ],
            cta: { label: "Get a quote", href: "#contact" },
            highlighted: true,
            badge: "Most popular",
          },
          {
            name: "EV Charger Install",
            price: "from $650",
            description:
              "Level 2 home charging, installed and permitted by licensed pros.",
            features: [
              "Dedicated 240V circuit",
              "Load calculation & permit",
              "Works with any EV",
              "Rebate paperwork help",
            ],
            cta: { label: "Get a quote", href: "#contact" },
          },
        ],
        note: "Quotes are always free. Emergency and after-hours rates differ — we'll tell you before we dispatch.",
      },
    },
    {
      type: "gallery",
      enabled: true,
      props: {
        eyebrow: "Recent work",
        title: "From our trucks this month",
        columns: 3,
        images: [
          {
            src: "/photos/voltedge-electric/gallery-1.jpg",
            treatment: "tint",
            alt: "200A panel upgrade",
            label: "Panel Upgrade",
            caption: "Full 200A service upgrade — Rockridge",
          },
          {
            src: "/photos/voltedge-electric/gallery-2.jpg",
            treatment: "tint",
            alt: "Recessed lighting install",
            label: "Recessed Lighting",
            caption: "Kitchen recessed lighting retrofit",
          },
          {
            src: "/photos/voltedge-electric/gallery-3.jpg",
            treatment: "tint",
            alt: "EV charger installation",
            label: "EV Charger",
            caption: "Level 2 charger — Tesla Wall Connector",
          },
          {
            src: "/photos/voltedge-electric/gallery-4.jpg",
            treatment: "tint",
            alt: "Commercial lighting fit-out",
            label: "Commercial",
            caption: "Warehouse LED retrofit — 40% energy saved",
          },
          {
            src: "/photos/voltedge-electric/gallery-5.jpg",
            treatment: "tint",
            alt: "Standby generator install",
            label: "Generator",
            caption: "Whole-home standby generator",
          },
          {
            src: "/photos/voltedge-electric/gallery-6.jpg",
            treatment: "tint",
            alt: "Landscape lighting",
            label: "Landscape",
            caption: "Low-voltage landscape lighting",
          },
        ],
      },
    },
    {
      type: "testimonials",
      enabled: true,
      props: {
        eyebrow: "Reviews",
        title: "Neighbors who trust us with their homes",
        items: [
          {
            quote:
              "Our panel was original to a 1950s house and finally gave out. VoltEdge quoted it flat, pulled the permit, and had power back the same day. Spotless work.",
            author: "Marisa T.",
            role: "Rockridge, Oakland",
            rating: 5,
          },
          {
            quote:
              "Called at 11pm when half the house went dark. A real electrician answered, walked me through making it safe, and was out first thing. Lifesavers.",
            author: "Devon K.",
            role: "Alameda",
            rating: 5,
          },
          {
            quote:
              "Our panel was original to a 1950s house and finally gave out. VoltEdge quoted it flat, pulled the permit, and had power back the same day. Spotless work.",
            author: "Marisa T.",
            role: "Rockridge, Oakland",
            rating: 5,
          },
          {
            quote:
              "Got three EV charger quotes. VoltEdge was the only one who did an actual load calculation instead of guessing. Clean install, fair price.",
            author: "Priya S.",
            role: "Berkeley",
            rating: 5,
          },
        ],
      },
    },
    {
      type: "faq",
      enabled: true,
      props: {
        eyebrow: "Good to know",
        title: "Questions we hear a lot",
        items: [
          {
            question: "Are you licensed and insured?",
            answer:
              "Yes — we're a licensed California C-10 electrical contractor (License #1043927), fully insured and bonded. We're happy to provide certificates before any work begins.",
          },
          {
            question: "Do you really offer 24/7 emergency service?",
            answer:
              "We do. A real electrician — not a call center — answers after hours for genuine emergencies like power loss, burning smells, or sparking. After-hours rates apply and we'll confirm them before dispatching.",
          },
          {
            question: "How soon can you come out?",
            answer:
              "Most non-emergency requests are booked within 1–2 business days, and we hold same-day slots for urgent issues. Emergencies are handled around the clock.",
          },
          {
            question: "Do you charge for quotes?",
            answer:
              "Quotes on planned work like panel upgrades, EV chargers, and lighting are always free. Diagnostic service calls carry an $89 fee that we credit toward the repair if you proceed.",
          },
          {
            question: "Do you guarantee your work?",
            answer:
              "Every job is backed by a one-year workmanship warranty on top of manufacturer warranties. If something isn't right, we come back and make it right.",
          },
        ],
      },
    },
    {
      type: "cta",
      enabled: true,
      props: {
        title: "Lights out? Breaker won't reset?",
        description:
          "We're on call 24/7. Talk to a licensed electrician right now.",
        primaryCta: {
          label: "Call (415) 555-0147",
          href: "tel:+14155550147",
          icon: "phone",
        },
        secondaryCta: {
          label: "WhatsApp us",
          href: "https://wa.me/14155550147",
          icon: "whatsapp",
        },
        variant: "band",
        backdrop: "grid",
      },
    },
    {
      type: "contact",
      enabled: true,
      props: {
        eyebrow: "Get in touch",
        title: "Request service or a free quote",
        subtitle:
          "Tell us what's going on and we'll get back fast — usually within the hour during business hours.",
        submitLabel: "Request service",
        successMessage:
          "Thanks — a VoltEdge dispatcher will call you back shortly. For emergencies, call (415) 555-0147.",
        showBusinessInfo: true,
        // Enquiries go to Telegram. The bot token and chat id are ENV VARS in
        // Vercel (TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID) — never here.
        // Named explicitly rather than left to env alone so this stays in step
        // with the processor named in the privacy policy below.
        delivery: { channels: ["telegram"] },
        fields: [
          { name: "name", label: "Full name", type: "text", required: true },
          { name: "phone", label: "Phone", type: "tel", required: true },
          { name: "email", label: "Email", type: "email" },
          {
            name: "service",
            label: "What do you need?",
            type: "select",
            required: true,
            placeholder: "Choose a service",
            options: [
              "Emergency repair",
              "Panel upgrade",
              "EV charger install",
              "Lighting",
              "Generator",
              "Something else",
            ],
          },
          {
            name: "message",
            label: "Describe the job",
            type: "textarea",
            placeholder: "e.g. Half the kitchen outlets stopped working…",
          },
        ],
      },
    },
    {
      type: "location",
      enabled: true,
      props: {
        eyebrow: "Service area",
        title: "Based in Oakland, serving the East Bay",
        subtitle:
          "Oakland, Berkeley, Alameda, Piedmont, and surrounding neighborhoods.",
        address: "1820 Industrial Way, Oakland, CA 94607",
        phone: "(415) 555-0147",
        hours: [
          { days: "Mon–Fri", hours: "7:00am – 6:00pm" },
          { days: "Saturday", hours: "8:00am – 4:00pm" },
          { days: "Sunday", hours: "Emergency only" },
        ],
      },
    },
    // Disabled: a small crew doesn't need a staff page. Kept here to show the
    // enable/disable toggle — flip to `true` to surface it with no other change.
    {
      type: "team",
      enabled: false,
      props: {
        title: "Meet the crew",
        members: [],
      },
    },
  ],
};

export default config;
