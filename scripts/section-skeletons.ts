import type { Section } from "@/lib/types";

/**
 * Section skeletons — the source of truth for `npm run add:section`.
 *
 * One ready-to-fill entry per section type, typed against the engine's
 * `Section` union: `npm run typecheck` fails the moment a section's props
 * change and a skeleton goes stale — skeletons can never silently drift.
 *
 * The `// <skeleton:…>` marker comments are how `scripts/add-section.sh`
 * extracts a block, so keep them exactly one line above/below each entry. This file is
 * never imported by the app (nothing ships to the bundle) — it exists for the
 * typechecker and the script, and doubles as a reference showing every section
 * type in one place.
 */
export const sectionSkeletons: Section[] = [
  // <skeleton:hero>
  {
    type: "hero",
    enabled: true,
    props: {
      eyebrow: "Small tagline above the title",
      title: "A headline for",
      highlight: "your business.",
      subtitle: "Your value proposition in one or two sentences.",
      bullets: ["A clear benefit", "Another reason", "Something that builds trust"],
      primaryCta: { label: "Get in touch", href: "#contact" },
      badges: ["Trust badge", "Another badge"],
      layout: "centered",
    },
  },
  // </skeleton:hero>
  // <skeleton:services>
  {
    type: "services",
    enabled: true,
    props: {
      eyebrow: "What we do",
      title: "Services",
      subtitle: "Describe the core things you offer.",
      columns: 3,
      items: [
        { icon: "sparkles", title: "First service", description: "What this includes and who it's for." },
        { icon: "shield-check", title: "Second service", description: "What this includes and who it's for." },
        { icon: "clock", title: "Third service", description: "What this includes and who it's for." },
      ],
    },
  },
  // </skeleton:services>
  // <skeleton:about>
  {
    type: "about",
    enabled: true,
    props: {
      eyebrow: "About us",
      title: "Our story",
      body: [
        "First paragraph — who you are and how you started.",
        "Second paragraph — what you believe in and how you work.",
      ],
      highlights: ["A differentiator", "Another differentiator"],
      stats: [
        { value: "10+", label: "Years in business" },
        { value: "500+", label: "Happy customers" },
      ],
      media: { alt: "A photo of the team or workplace" },
      mediaSide: "right",
    },
  },
  // </skeleton:about>
  // <skeleton:testimonials>
  {
    type: "testimonials",
    enabled: true,
    props: {
      eyebrow: "Reviews",
      title: "What customers say",
      items: [
        { quote: "A short, believable customer quote.", author: "Customer Name", role: "City or context", rating: 5 },
        { quote: "Another quote — specific beats generic.", author: "Customer Name", role: "City or context", rating: 5 },
        { quote: "A third one keeps the row balanced.", author: "Customer Name", role: "City or context", rating: 5 },
      ],
    },
  },
  // </skeleton:testimonials>
  // <skeleton:gallery>
  {
    type: "gallery",
    enabled: true,
    props: {
      eyebrow: "Our work",
      title: "Gallery",
      subtitle: "Recent projects and moments.",
      columns: 3,
      images: [
        { alt: "Describe image one", label: "Project one" },
        { alt: "Describe image two", label: "Project two" },
        { alt: "Describe image three", label: "Project three" },
      ],
    },
  },
  // </skeleton:gallery>
  // <skeleton:pricing>
  {
    type: "pricing",
    enabled: true,
    props: {
      eyebrow: "Pricing",
      title: "Simple, honest pricing",
      subtitle: "Pick the plan that fits.",
      tiers: [
        {
          name: "Basic",
          price: "$99",
          period: "per month",
          description: "For getting started.",
          features: ["First thing included", "Second thing included"],
          cta: { label: "Choose Basic", href: "#contact" },
        },
        {
          name: "Standard",
          price: "$199",
          period: "per month",
          description: "The most popular choice.",
          features: ["Everything in Basic", "Third thing included", "Fourth thing included"],
          cta: { label: "Choose Standard", href: "#contact" },
          highlighted: true,
          badge: "Most popular",
        },
      ],
      note: "Custom needs? Get in touch for a tailored quote.",
    },
  },
  // </skeleton:pricing>
  // <skeleton:faq>
  {
    type: "faq",
    enabled: true,
    props: {
      eyebrow: "Good to know",
      title: "Frequently asked questions",
      items: [
        { question: "A question customers actually ask?", answer: "A clear, reassuring answer in one or two sentences." },
        { question: "Another common question?", answer: "Another helpful answer." },
      ],
    },
  },
  // </skeleton:faq>
  // <skeleton:team>
  {
    type: "team",
    enabled: true,
    props: {
      eyebrow: "The team",
      title: "Who you'll work with",
      columns: 3,
      members: [
        // names must be distinct — the Team component keys members by name
        { name: "First Teammate", role: "Their role", bio: "One line about them.", photo: { alt: "First Teammate" } },
        { name: "Second Teammate", role: "Their role", bio: "One line about them.", photo: { alt: "Second Teammate" } },
      ],
    },
  },
  // </skeleton:team>
  // <skeleton:location>
  {
    type: "location",
    enabled: true,
    props: {
      eyebrow: "Find us",
      title: "Come see us",
      subtitle: "Easy to reach, easy to park.",
      // address / phone / hours inherit from the global `business` block —
      // set them here only to override (e.g. a second office).
    },
  },
  // </skeleton:location>
  // <skeleton:cta>
  {
    type: "cta",
    enabled: true,
    props: {
      title: "Ready to get started?",
      description: "One sentence nudging the visitor to act now.",
      primaryCta: { label: "Get in touch", href: "#contact" },
      variant: "band",
    },
  },
  // </skeleton:cta>
  // <skeleton:contact>
  {
    type: "contact",
    enabled: true,
    props: {
      eyebrow: "Get in touch",
      title: "Contact us",
      // `{phone}` pulls the number from the global `business` block — never
      // retype it. See "Configs are data" in the README.
      subtitle: "Tell us what you need and we'll get back to you, or call {phone}.",
      submitLabel: "Send message",
      showBusinessInfo: true,
    },
  },
  // </skeleton:contact>
  // <skeleton:legal>
  {
    type: "legal",
    enabled: true,
    props: {
      eyebrow: "Legal",
      title: "Privacy policy",
      // Set this by hand whenever you change the text below — a policy with a
      // stale "last updated" is worse than one with none.
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
          // Keep only the lines that match the delivery channels you actually
          // enabled — naming a processor you don't use is as wrong as omitting
          // one you do. Per-channel wording is in `.env.example`.
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
  // </skeleton:legal>
];
