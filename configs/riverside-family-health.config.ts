import type { SiteConfig } from "@/lib/types";

/**
 * Riverside Family Health — a family medicine & primary care clinic.
 *
 * Identity: calm, warm, reassuring — the opposite of clinical-cold. A soft
 * warm-white surface, a healing teal-green primary, and a human coral accent.
 * Friendly rounded typography (Poppins + Nunito Sans) with the "soft" preset
 * (big radii, diffuse shadows, airy spacing). What patients care about — being
 * heard, easy booking, insurance, and who they'll actually see — leads, so the
 * providers get a dedicated Team section and there's no pricing/gallery.
 */
const config: SiteConfig = {
  client: "riverside-family-health",
  siteName: "Riverside Family Health",
  logo: {
    alt: "Riverside Family Health",
    monogram: "R",
  },

  theme: {
    stylePreset: "rounded",
    defaultMode: "light",
    // Single-palette (light-only) site: no second palette, so the header theme
    // toggle stays hidden even if enabled.
    colorsDark: {
      primary: "#EC7684", // reversed (RGB-inverted) teal-green
      secondary: "#F4A5AB", // reversed (RGB-inverted) deep teal
      accent: "#0F819C", // reversed (RGB-inverted) warm coral
      background: "#090507", // reversed (RGB-inverted) soft warm white
      text: "#E8CBCF", // reversed (RGB-inverted) deep teal-charcoal
      muted: "#A1848A", // reversed (RGB-inverted) muted teal
    },
    // Darkened 2026-08-04 for WCAG AA. The originals sat just under the line:
    // primary 4.08:1 and muted 4.37:1 against this background (AA needs 4.5),
    // and accent 2.53:1 where the star ratings it colours need 3:1 as non-text
    // content. Same hues, a few percent darker — measured, not eyeballed.
    colorsLight: {
      primary: "#117B6F", // healing teal-green — 4.88:1 on background
      secondary: "#0B5A54", // deep teal
      accent: "#D36F57", // warm human coral — 3.23:1, used for star ratings
      background: "#F6FAF8", // soft warm white, hint of green
      text: "#173430", // deep teal-charcoal
      muted: "#58746E", // 4.82:1 on background
    },
    fonts: {
      heading: "Poppins",
      body: "Nunito Sans",
    },
  },

  business: {
    phone: "(503) 555-0192",
    email: "hello@riversidefamilyhealth.com",
    address: "440 Rivermist Ave, Suite 200, Portland, OR 97205",
    // Emitted as JSON-LD "@type". `MedicalClinic` fits a practice with several
    // providers; `Physician` would describe a single doctor.
    schemaType: "MedicalClinic",
    hours: [
      { days: "Mon–Fri", hours: "8:00am – 5:30pm" },
      { days: "Saturday", hours: "9:00am – 1:00pm" },
      { days: "Sunday", hours: "Closed" },
    ],
    socials: [
      { icon: "facebook", label: "Facebook", href: "https://facebook.com" },
      { icon: "instagram", label: "Instagram", href: "https://instagram.com" },
      { icon: "linkedin", label: "LinkedIn", href: "https://linkedin.com" },
    ],
  },

  // A clinic is the one niche where this needs a real decision, not a default.
  // WhatsApp is not a HIPAA-covered channel, so a patient describing symptoms in
  // it puts PHI somewhere the practice cannot control. Points at `tel:` instead:
  // same one-tap intent, no protected health information in a chat log. Swap to
  // a wa.me link ONLY if the practice has cleared it and will keep replies to
  // "please call us".
  floatingButton: {
    enabled: true,
    href: "tel:+15035550192",
    label: "Call the clinic",
    icon: "phone",
    variant: "primary",
    position: { x: "right", y: "bottom" },
  },

  header: {
    sticky: true,
    type: "centered",
    cta: {
      label: "Book appointment",
      href: "#contact",
      icon: "calendar-check",
      variant: "primary",
    },
    themeToggle: {
      enabled: true,
    },
  },

  footer: {
    type: "minimal",
    tagline:
      "Whole-family primary care in the heart of Portland — where you're a person first, and a patient second.",
    legal: "Accredited by AAAHC · Most major insurance accepted",
    contactLabel: "Contact us",
    // exploreLabel: "Explore",
    copyrightText: "© All rights reserved.",
    showHours: true,
  },

  seo: {
    title:
      "Riverside Family Health — Family Medicine & Primary Care in Portland",
    description:
      "Board-certified family medicine, pediatrics, women's health, and telehealth in Portland, OR. Same-day appointments and most insurance accepted. Now welcoming new patients.",
    keywords: [
      "family doctor Portland",
      "primary care",
      "pediatrics",
      "same-day appointment",
      "telehealth",
    ],
  },

  sections: [
    {
      type: "hero",
      enabled: true,
      props: {
        eyebrow: "Now welcoming new patients",
        title: "Healthcare that",
        highlight: "listens first.",
        subtitle:
          "Unhurried visits, a team that knows your name, and same-day care when you need it. Riverside is family medicine the way it should feel.",
        bullets: [
          "Same-day and next-day appointments",
          "Most major insurance plans accepted",
          "In-person and secure telehealth visits",
        ],
        primaryCta: {
          label: "Book an appointment",
          href: "#contact",
          icon: "calendar-check",
        },
        secondaryCta: {
          label: "Call (503) 555-0192",
          href: "tel:+15035550192",
          variant: "secondary",
        },
        badges: [
          "Board-certified providers",
          "4.9★ patient rating",
          "AAAHC accredited",
        ],
        // Full-bleed rotating banner. `slides` is what renders; the props above
        // (bullets, badges, backdrop, and the top-level copy) are IGNORED by
        // this layout and kept only so `layout: "split"` restores the old hero
        // in one word.
        layout: "slider",
        // Slow on purpose — a clinic reads as calm, not as a promotion. Autoplay
        // pauses on hover, on keyboard focus and in background tabs, and is off
        // entirely for visitors who ask for reduced motion.
        autoplayMs: 7000,
        // One slide per reason someone arrives: new patient, unwell today, or
        // can't come in. Each carries its own CTA, so the slider is doing real
        // work rather than rotating one message over changing pictures.
        // Visitors act on slide 1 far more than the rest, so the strongest
        // message stays first.
        slides: [
          {
            eyebrow: "Now welcoming new patients",
            title: "Healthcare that",
            highlight: "listens first.",
            subtitle:
              "Unhurried visits with board-certified providers who know your name. Family medicine the way it should feel.",
            primaryCta: {
              label: "Book an appointment",
              href: "#contact",
              icon: "calendar-check",
            },
            secondaryCta: {
              label: "Call (503) 555-0192",
              href: "tel:+15035550192",
              variant: "secondary",
            },
            media: {
              src: "/photos/riverside-family-health/hero.05dbf5c3.jpg",
              alt: "A Riverside provider talking with a patient",
            },
            align: "start",
          },
          {
            eyebrow: "Feeling unwell today?",
            title: "Same-day appointments,",
            highlight: "often within hours.",
            subtitle:
              "Sore throats, infections, injuries and the things that can't wait until next week. Most major insurance plans accepted.",
            primaryCta: {
              label: "Book same-day care",
              href: "#contact",
              icon: "calendar-check",
            },
            secondaryCta: {
              label: "See our services",
              href: "#services",
              variant: "secondary",
            },
            media: {
              src: "/photos/riverside-family-health/hero-2.eedc44f3.jpg",
              alt: "Same-day care at Riverside Family Health",
            },
            align: "start",
          },
          {
            eyebrow: "From wherever you are",
            title: "Secure telehealth",
            highlight: "when you can't come in.",
            subtitle:
              "Follow-ups, prescription questions and advice by video, from an AAAHC-accredited practice you already trust.",
            primaryCta: {
              label: "Start a virtual visit",
              href: "#contact",
              icon: "video",
            },
            secondaryCta: {
              label: "Read patient stories",
              href: "#testimonials",
              variant: "secondary",
            },
            media: {
              src: "/photos/riverside-family-health/hero-3.5439ff7b.jpg",
              alt: "A secure telehealth visit with a Riverside provider",
            },
            align: "start",
          },
        ],
      },
    },
    {
      type: "services",
      enabled: true,
      props: {
        eyebrow: "How we care for you",
        title: "Comprehensive care, all in one place",
        subtitle:
          "From your child's first checkup to managing life's long-term stuff — one team, one chart, one relationship.",
        columns: 3,
        items: [
          {
            icon: "heart-pulse",
            title: "Family Medicine",
            description:
              "Primary care for every age — checkups, illness, and everything in between, with a provider who knows your history.",
            href: "#top",
          },
          {
            icon: "baby",
            title: "Pediatrics",
            description:
              "Gentle, kid-friendly care from newborn visits and vaccines to school physicals and sick days.",
          },
          {
            icon: "flower",
            title: "Women's Health",
            description:
              "Well-woman exams, contraception counseling, and prenatal care in a comfortable, judgment-free space.",
          },
          {
            icon: "shield-check",
            title: "Preventive Care",
            description:
              "Screenings, immunizations, and wellness planning to catch things early and keep you healthy.",
          },
          {
            icon: "activity",
            title: "Chronic Care Management",
            description:
              "Thoughtful, coordinated support for diabetes, blood pressure, thyroid, and other ongoing conditions.",
          },
          {
            icon: "video",
            title: "Telehealth Visits",
            description:
              "Secure video visits for follow-ups, refills, and minor concerns — care from wherever you are.",
          },
        ],
      },
    },
    {
      type: "about",
      enabled: true,
      props: {
        eyebrow: "Our approach",
        title: "You're a person first, and a patient second",
        body: [
          "Riverside was founded on a simple frustration: healthcare had stopped listening. We built a clinic around longer visits, real relationships, and providers who remember the details that matter to you.",
          "That means you'll usually see the same face each visit, get answers you can actually understand, and never feel like you're being rushed out the door. Good medicine starts with being heard.",
        ],
        highlights: [
          "Longer, unhurried appointments",
          "See the same provider each visit",
          "Same-day sick appointments",
          "Coordinated referrals & labs on-site",
        ],
        stats: [
          { value: "25k+", label: "Patients cared for" },
          { value: "12", label: "Providers on staff" },
          { value: "4.9★", label: "Patient rating" },
        ],
        mediaSide: "right",
        media: { src: "/photos/riverside-family-health/about.2e1ddaca.jpg", alt: "The Riverside Family Health waiting area" },
      },
    },
    {
      type: "team",
      enabled: true,
      props: {
        eyebrow: "Meet your care team",
        title: "The people you'll actually see",
        subtitle:
          "Board-certified, genuinely kind, and here for the long haul.",
        columns: 3,
        members: [
          {
            name: "Dr. Elena Ortiz",
            photo: { src: "/art/riverside-family-health/team-eo.svg", alt: "Dr. Elena Ortiz" },
            role: "Family Medicine · Medical Director",
            credentials: "MD, FAAFP",
            bio: "Twenty years in family medicine with a soft spot for preventive care and demystifying lab results.",
          },
          {
            name: "Dr. Marcus Bell",
            photo: { src: "/art/riverside-family-health/team-mb.svg", alt: "Dr. Marcus Bell" },
            role: "Pediatrics",
            credentials: "MD, FAAP",
            bio: "Makes even nervous toddlers laugh. Focused on development, nutrition, and calm, confident parents.",
          },
          {
            name: "Dr. Aisha Rahman",
            photo: { src: "/art/riverside-family-health/team-ar.svg", alt: "Dr. Aisha Rahman" },
            role: "Women's Health",
            credentials: "MD, OB/GYN",
            bio: "Compassionate, evidence-based care across every stage of women's health, from teens to menopause.",
          },
          {
            name: "Nadia Chen, FNP",
            photo: { src: "/art/riverside-family-health/team-nc.svg", alt: "Nadia Chen, FNP" },
            role: "Family Nurse Practitioner",
            credentials: "MSN, FNP-C",
            bio: "Same-day sick visits and chronic care with a knack for practical, livable plans.",
          },
          {
            name: "Dr. James Okafor",
            photo: { src: "/art/riverside-family-health/team-jo.svg", alt: "Dr. James Okafor" },
            role: "Internal Medicine",
            credentials: "MD",
            bio: "Manages the complex, multi-condition cases with patience and clear communication.",
          },
          {
            name: "Priya Nair, RD",
            photo: { src: "/art/riverside-family-health/team-pn.svg", alt: "Priya Nair, RD" },
            role: "Registered Dietitian",
            credentials: "RD, CDCES",
            bio: "Turns 'eat healthier' into a plan that fits your real life, budget, and kitchen.",
          },
        ],
      },
    },
    {
      type: "testimonials",
      enabled: true,
      props: {
        eyebrow: "Patient stories",
        title: "Care our patients come back for",
        items: [
          {
            quote:
              "First doctor's office where I didn't feel like a number. Dr. Ortiz actually remembered what we talked about last time and followed up. That's rare.",
            author: "Rebecca M.",
            role: "Patient since 2021",
            rating: 5,
          },
          {
            quote:
              "My son is terrified of doctors, and Dr. Bell somehow made his checkup fun. We drove past two closer clinics to come here and it's worth it.",
            author: "Tom & Alicia W.",
            role: "Parents of two",
            rating: 5,
          },
          {
            quote:
              "Booked a same-day telehealth visit on my lunch break, had my prescription before I got back to my desk. Modern care that still feels personal.",
            author: "Jordan P.",
            role: "Telehealth patient",
            rating: 5,
          },
        ],
      },
    },
    {
      type: "faq",
      enabled: true,
      props: {
        eyebrow: "Before your visit",
        title: "Questions new patients ask",
        items: [
          {
            question: "Are you accepting new patients?",
            answer:
              "Yes! We're currently welcoming new patients of all ages. You can request an appointment through the form below or give us a call and we'll get you scheduled.",
          },
          {
            question: "What insurance do you accept?",
            answer:
              "We accept most major insurance plans, including Blue Cross Blue Shield, Aetna, Cigna, UnitedHealthcare, Medicare, and Oregon Health Plan. Call us to confirm your specific plan — we're glad to check before your visit.",
          },
          {
            question: "Can I get a same-day appointment?",
            answer:
              "We reserve same-day slots every day for sick visits and urgent concerns. Call early in the morning for the best availability, or request one through the form and we'll find the soonest opening.",
          },
          {
            question: "Do you offer telehealth?",
            answer:
              "We do. Secure video visits are available for follow-ups, medication refills, and many minor concerns. When you request an appointment, just let us know you'd prefer telehealth.",
          },
          {
            question: "What should I bring to my first visit?",
            answer:
              "Please bring a photo ID, your insurance card, a list of current medications, and any relevant records from previous providers. Arriving 15 minutes early gives us time to get you set up.",
          },
        ],
      },
    },
    {
      type: "cta",
      enabled: true,
      props: {
        title: "Ready to feel heard?",
        description:
          "Booking takes about a minute. We'll match you with a provider and find a time that works.",
        primaryCta: {
          label: "Book an appointment",
          href: "#contact",
          icon: "calendar-check",
        },
        secondaryCta: { label: "Call the clinic", href: "tel:+15035550192" },
        variant: "card",
        backdrop: "glow",
      },
    },
    {
      type: "contact",
      enabled: true,
      props: {
        eyebrow: "Appointments",
        title: "Request an appointment",
        subtitle:
          "Share a few details and our front desk will reach out to confirm a time. For medical emergencies, call 911.",
        submitLabel: "Request appointment",
        successMessage:
          "Thank you — our front desk will call you within one business day to confirm your appointment.",
        showBusinessInfo: true,
        fields: [
          { name: "name", label: "Full name", type: "text", required: true },
          { name: "phone", label: "Phone", type: "tel", required: true },
          { name: "email", label: "Email", type: "email" },
          {
            name: "reason",
            label: "Reason for visit",
            type: "select",
            required: true,
            placeholder: "Select a reason",
            options: [
              "New patient visit",
              "Annual checkup",
              "Sick visit",
              "Pediatric visit",
              "Women's health",
              "Telehealth",
              "Something else",
            ],
          },
          { name: "preferred", label: "Preferred date", type: "date" },
          {
            name: "message",
            label: "Anything we should know?",
            type: "textarea",
            placeholder:
              "Optional — tell us a little about what's bringing you in.",
          },
        ],
      },
    },
    {
      type: "location",
      enabled: true,
      props: {
        eyebrow: "Visit us",
        title: "Easy to find, easy to park",
        subtitle:
          "In the Rivermist district with free patient parking and a MAX stop one block away.",
        address: "440 Rivermist Ave, Suite 200, Portland, OR 97205",
        phone: "(503) 555-0192",
        hours: [
          { days: "Mon–Fri", hours: "8:00am – 5:30pm" },
          { days: "Saturday", hours: "9:00am – 1:00pm" },
          { days: "Sunday", hours: "Closed" },
        ],
      },
    },
    // Disabled for this clinic: medical pricing is insurance-driven, and a photo
    // gallery isn't the right fit. Left here to demonstrate per-client toggling.
    { type: "pricing", enabled: false, props: { title: "Pricing", tiers: [] } },
    {
      type: "gallery",
      enabled: false,
      props: {
        title: "Gallery",
        images: [
          { alt: "The Riverside waiting room", src: "/art/riverside-family-health/gallery-1.svg" },
          { alt: "A consultation room", src: "/art/riverside-family-health/gallery-2.svg" },
          { alt: "The practice reception desk", src: "/art/riverside-family-health/gallery-3.svg" },
          { alt: "On-site lab and vitals station", src: "/art/riverside-family-health/gallery-4.svg" },
          { alt: "The children's corner", src: "/art/riverside-family-health/gallery-5.svg" },
          { alt: "The Riverside building entrance", src: "/art/riverside-family-health/gallery-6.svg" },
        ],
      },
    },
  ],
};

export default config;
