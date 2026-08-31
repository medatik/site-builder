import type { SiteConfig } from "@/lib/types";

/**
 * Merrick & Stone — a plaintiff-side personal-injury & civil trial firm.
 *
 * Identity: authoritative, editorial, prestigious — the "serious trial lawyer"
 * feel, deliberately not the aggressive-billboard PI look. A warm parchment
 * surface (paper, case files, tradition) carries a confident oxblood primary
 * with a deep ink-navy and an antique-brass accent for a gilded, established
 * touch. An editorial serif (Spectral) over an institutional grotesque (Libre
 * Franklin) reads like a courtroom brief, and the "rounded" preset keeps it
 * polished rather than either hard-industrial or pillowy-soft. What injury
 * clients actually weigh leads: no fee unless we win, real courtroom results,
 * and which attorney will personally handle the case — so Team and a
 * fee-structure Pricing section are on, and the photo Gallery is off.
 *
 * This is the third demo and it diverges hard from the other two on every
 * axis: preset (rounded vs sharp/soft), palette (oxblood/navy/brass on paper
 * vs amber-on-graphite vs teal-on-mint), type (serif+grotesque vs two sans
 * pairings), hero (centered/rays vs split/grid & split/glow), and section mix.
 */

// This file is pure DATA — no consts, no template literals, no computation.
// Copy that mentions the phone number writes the `{phone}` token and the engine
// substitutes it, bidi-hardened so it stays correct inside Arabic copy; `{phoneHref}`
// builds the tel: link. See "Configs are data" in the README.

const config: SiteConfig = {
  client: "merrick-stone-law",
  siteName: "Merrick & Stone",
  // FORM 3 of 3 — wordmark only. With no image AND no monogram, the Logo
  // component renders the site name by itself. Dropping `monogram` is the
  // entire change; nothing in the components moves.
  // (VoltEdge shows form 1: a per-mode image pair. Riverside shows form 2:
  // a monogram tile beside the wordmark.)
  logo: { alt: "Merrick & Stone, Trial Attorneys" },

  theme: {
    stylePreset: "rounded",
    defaultMode: "light",
    // Daylight chambers: oxblood + brass on warm parchment.
    colorsLight: {
      primary: "#8A2733", // oxblood / claret — bold, courtroom authority
      secondary: "#1B2A4A", // deep ink navy — institutional depth
      // Nudged from #B0863C (2.94:1) to clear 3:1 on parchment: `--accent`
      // colours the star ratings, which carry meaning and so count as non-text
      // content. A ~3% darkening — the brass reads identically.
      accent: "#A77F39", // antique brass — 3.24:1 on background
      background: "#F4F1E9", // warm parchment / paper
      text: "#20242E", // near-black ink
      muted: "#5B6172", // slate gray
    },
    // After-dark chambers: gilded brass leads on a warm near-black, with a
    // lifted claret accent. Brass primary keeps on-primary button text legible.
    colorsDark: {
      primary: "#C0913F", // gilded brass
      secondary: "#22304F", // ink navy, lifted for depth
      accent: "#C24A56", // lifted claret
      background: "#17151C", // warm near-black
      text: "#ECE7DD", // warm parchment ink
      muted: "#9A9488", // warm gray
    },
    fonts: {
      heading: "Spectral",
      body: "Libre Franklin",
    },
  },

  business: {
    // Raw, unformatted — this is the single source of truth. Components build
    // their own tel: hrefs from it, and `{phone}` in copy expands to the
    // bidi-hardened display form. Never store the hardened form here: the
    // isolate characters would leak into every generated tel: link.
    phone: "+212 6 00 00 01 48",
    email: "contact@merrickstone.ma",
    address: "70 boulevard Mohammed V, 20000 Casablanca",
    // Emitted as JSON-LD "@type". `LegalService` is the schema.org type for a
    // firm; `Attorney` is for an individual practitioner.
    schemaType: "LegalService",
    hours: [
      { days: "Mon–Fri", hours: "8:00am – 5:00pm" },
      { days: "Saturday", hours: "By appointment" },
      { days: "Sunday", hours: "Phone lines open 24/7" },
    ],
    socials: [
      // { icon: "linkedin", label: "LinkedIn", href: "https://linkedin.com" },
      { icon: "facebook", label: "Facebook", href: "https://facebook.com" },
      { icon: "instagram", label: "Instagram", href: "https://instagram.com" },
      { icon: "youtube", label: "YouTube", href: "https://youtube.com" },
    ],
  },

  // Icon-only (no showLabel): floatingButton isn't part of the translation
  // overlay system, so a visible label would stay English on the fr/ar pages.
  // The WhatsApp glyph needs no translation either way.
  floatingButton: {
    enabled: true,
    href: "https://wa.me/212600000148",
    label: "Chat on WhatsApp",
    icon: "whatsapp",
    position: { x: "right", y: "bottom" },
  },

  header: {
    scrollBehavior: "elevate",
    sticky: true,
    variant: "transparent",
    mobileMenu: "right",
    type: "minimal",

    cta: {
      label: "Free case review",
      href: "#contact",
      icon: "scale",
      variant: "primary",
    },
    // Custom toggle icons (overriding the moon/sun defaults) to fit the firm's tone.
    themeToggle: {
      enabled: true,
      iconLight: "moon-star",
      iconDark: "sun-medium",
      label: "Switch light / dark",
    },
  },

  footer: {
    tagline:
      "Casablanca trial lawyers for the seriously injured. No fee unless we win — and no shortcuts on the way there.",
    legal: "Attorney Advertising. Prior results do not guarantee a similar outcome. Merrick & Stone · 70 boulevard Mohammed V, 20000 Casablanca.",
  },

  seo: {
    title: "Merrick & Stone — Casablanca Trial Lawyers | No Fee Unless We Win",
    description:
      "Casablanca personal-injury and civil trial lawyers for car and truck accidents, medical malpractice, workplace injuries, and wrongful death. Free consultation. No fee unless we win.",
    keywords: [
      "Casablanca personal injury lawyer",
      "trial attorney",
      "medical malpractice lawyer",
      "car accident attorney",
      "no win no fee lawyer",
    ],
  },

  // Routed page. `nav: false` keeps it out of the header and puts it in the
  // footer's legal row instead. The body is authored once, in English, and
  // localises through `translations.fr.pages` / `translations.ar.pages` (for
  // this page's own title/SEO) plus the usual `translations.*.sections`
  // overlay keyed by this section's `id` (for the body) — the SAME mechanism
  // as the home page, which is the whole point: a page is not a special case.
  //
  // The processor list in "who else sees it" below MUST match the delivery
  // channels actually enabled on the contact section (email + Telegram), plus
  // the host. Naming a provider that doesn't handle the data is as wrong as
  // omitting one that does.
  pages: [
    {
      slug: "privacy",
      title: "Privacy",
      nav: false,
      seo: {
        title: "Privacy policy — Merrick & Stone",
        description:
          "How Merrick & Stone handles the information you send through our free case review form.",
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
                body: "We only collect what you type into our free case review form, plus a small amount of technical information your browser sends automatically.",
                bullets: [
                  "Your name and phone number, which we need to call you back.",
                  "Your email address, if you choose to give it.",
                  "The type of case you selected and, if you provide one, the date it happened.",
                  "Whatever you write in the \"What happened?\" field — share as much or as little as you're comfortable putting in writing before you've spoken to an attorney.",
                  "Your IP address, which limits automated abuse of the form and is included in the notification we receive.",
                  "Standard server logs kept by our website host, such as the pages requested and the time of the request.",
                ],
              },
              {
                heading: "Why we collect it",
                body: "We use your submission solely to evaluate whether we can help with your case and to arrange a free consultation. We do not sell your information, and we do not use it for advertising or profiling.",
              },
              {
                heading: "This form does not make you our client",
                body: "Submitting this form starts a conversation — it does not create an attorney-client relationship, and information you share before that relationship is formed in writing may not be protected by attorney-client privilege. If your matter is time-sensitive, call {phone} rather than relying on a written reply.",
              },
              {
                heading: "Who else sees it",
                body: "We share your information only with the providers that operate this website and deliver your submission to us:",
                bullets: [
                  "Vercel, which hosts this website and keeps standard server logs.",
                  "Telegram, which delivers your submission to our intake team's phone.",
                  "Resend, which delivers your submission to our intake team by email.",
                ],
              },
              {
                heading: "How long we keep it",
                body: "We keep a submission for as long as we need it to respond to you and to decide whether we can take on your case. If we do not take your case, we delete it after a reasonable review period. If we do, it becomes part of your client file and is kept under our normal file-retention practice. Ask us to delete a submission sooner and we will, unless we are already required to keep it.",
              },
              {
                heading: "Your rights",
                body: "You can ask us for a copy of the information we hold about you, ask us to correct it, or ask us to delete it. Email {email} and we will respond. If you are not satisfied with our response, you can complain to the CNDP (Commission nationale de contrôle de la protection des données à caractère personnel).",
              },
              {
                heading: "Cookies and browser storage",
                body: "This site sets no advertising or tracking cookies. If you switch the site between light and dark mode, or change its language, that choice is saved in your browser's local storage so the page does not flash the wrong theme or reset your language on your next visit. It stays on your device and is never sent to us.",
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

  // Trilingual: authored in English, with French + Arabic overlays. The header
  // language selector flips the active locale (?lang=), and `ar` renders RTL
  // with an Arabic font. Only the strings that change are listed per locale.
  i18n: {
    defaultLocale: "en",
    locales: [
      { code: "en", label: "English", dir: "ltr" },
      { code: "fr", label: "Français", dir: "ltr" },
      {
        code: "ar",
        label: "العربية",
        dir: "rtl",
        font: { heading: "Tajawal", body: "Cairo" },
      },
    ],
    switcher: { enabled: true },
  },

  translations: {
    // ── FRENCH ─────────────────────────────────────────────────────────────
    fr: {
      // The overlay covers metadata too: without this the French page inherits
      // the English <title> and description, so an hreflang alternate points at
      // a page that looks untranslated in the search result itself.
      seo: {
        title: "Merrick & Stone — Avocats plaidants à Casablanca | Aucuns honoraires sans résultat",
        description:
          "Avocats en dommages corporels et en contentieux civil à Casablanca : accidents de la route et de poids lourds, erreurs médicales, accidents du travail et décès par faute. Consultation gratuite. Aucuns honoraires sans résultat.",
      },
      // Le site a désormais une page routée (/privacy), donc les ancres de la
      // page d'accueil sont préfixées par "/" — un "#services" nu ne ferait
      // rien depuis cette page. Le moteur corrige n'importe quel "#..." au
      // rendu dès qu'un site a des pages (`rootRelativeAnchors` dans
      // lib/i18n.ts) ; le préfixe est écrit ici en toutes lettres pour que ce
      // tableau, écrit à la main, ne soit pas le seul endroit qui ait l'air
      // faux à la lecture.
      nav: [
        { label: "Domaines", href: "/#services" },
        { label: "Le cabinet", href: "/#about" },
        { label: "Équipe", href: "/#team" },
        { label: "Honoraires", href: "/#pricing" },
        { label: "Avis", href: "/#testimonials" },
        { label: "FAQ", href: "/#faq" },
        { label: "Adresse", href: "/#location" },
        { label: "Contact", href: "/#contact" },
      ],
      header: { cta: { label: "Consultation gratuite" } },
      footer: {
        tagline:
          "Avocats plaidants à Casablanca pour les personnes gravement blessées. Aucuns honoraires sans résultat — et aucun raccourci en chemin.",
        legal: "Publicité pour avocats. Les résultats passés ne garantissent pas un résultat similaire. Merrick & Stone · 70 boulevard Mohammed V, 20000 Casablanca.",
        exploreLabel: "Explorer",
        contactLabel: "Nous contacter",
        copyrightText: "© Merrick & Stone. Tous droits réservés.",
      },
      // Business-info panel (contact section) hours, in French.
      business: {
        hours: [
          { days: "Lun–Ven", hours: "8h00 – 18h00" },
          { days: "Samedi", hours: "Sur rendez-vous" },
          { days: "Dimanche", hours: "Lignes ouvertes 24/7" },
        ],
      },
      sections: {
        hero: {
          eyebrow: "Avocats plaidants · Consultation gratuite",
          title: "Quand tout est en jeu,",
          highlight: "il vous faut un plaideur.",
          subtitle:
            "Les assureurs paient davantage lorsqu'ils vous savent prêt à aller au tribunal. Nous sommes le cabinet qu'ils redoutent — et vous ne payez rien sans résultat.",
          bullets: [
            "Étude de dossier gratuite et confidentielle avec un avocat",
            "Aucuns honoraires sans indemnisation obtenue",
            "Vingt ans de verdicts, pas seulement de transactions",
          ],
          primaryCta: { label: "Obtenir une étude gratuite" },
          secondaryCta: { label: "Appeler le {phone}" },
          badges: [
            "Sans résultat, sans honoraires",
            "500 M DH+ obtenus",
            "Disponible 24/7",
          ],
        },
        services: {
          eyebrow: "Domaines d'intervention",
          title: "Les affaires que nous plaidons",
          subtitle:
            "Blessures graves et pertes réelles — les dossiers complexes et à fort enjeu que les autres cabinets préfèrent confier.",
          learnMoreLabel: "En savoir plus",
          items: [
            {
              icon: "car-front",
              title: "Accidents de la route et de camions",
              description:
                "Collisions catastrophiques avec transporteurs commerciaux, VTC et conducteurs non assurés — nous affrontons les assureurs pour que vous puissiez guérir.",
              href: "#contact",
            },
            {
              icon: "stethoscope",
              title: "Erreurs médicales",
              description:
                "Erreurs de diagnostic, fautes chirurgicales et lésions à la naissance, étayées par les experts médicaux qu'exigent ces dossiers.",
            },
            {
              icon: "hard-hat",
              title: "Accidents du travail",
              description:
                "Chantiers, industrie et recours contre tiers, au-delà d'une simple indemnisation d'accident du travail.",
            },
            {
              icon: "scale",
              title: "Décès injustifié",
              description:
                "Une représentation humaine et déterminée pour les familles en quête de justice après une perte inqualifiable.",
            },
            {
              icon: "briefcase",
              title: "Droit du travail",
              description:
                "Licenciement abusif, discrimination, harcèlement et salaires impayés — tenir les employeurs responsables devant la loi.",
            },
            {
              icon: "building-2",
              title: "Responsabilité des lieux",
              description:
                "Chutes, défaut de sécurité et lieux dangereux où la négligence d'un propriétaire est devenue votre blessure.",
            },
          ],
        },
        about: {
          eyebrow: "Pourquoi Merrick & Stone",
          title: "Un cabinet fait pour plaider, pas seulement pour transiger",
          body: [
            "La plupart des cabinets de dommages corporels traitent au volume — ils transigent vite et à bas prix parce qu'ils ne sont pas armés pour plaider votre dossier. Les assureurs savent exactement quels cabinets céderont. Nous n'en faisons pas partie.",
            "Depuis plus de vingt ans, Merrick & Stone porte les dossiers difficiles jusqu'au verdict lorsque l'offre n'est pas juste. C'est cette capacité à aller au procès qui explique des indemnisations plus élevées, et pourquoi la partie adverse prend nos appels au sérieux.",
          ],
          highlights: [
            "Fondé par deux anciens procureurs",
            "Votre dossier est suivi par un associé, pas délégué",
            "Plaideurs reconnus à l'échelle nationale",
            "Vous ne devez rien sans indemnisation obtenue",
          ],
          stats: [
            { value: "500 M DH+", label: "Obtenus pour nos clients" },
            { value: "20+", label: "Ans à plaider" },
            { value: "98%", label: "Gagnés ou transigés favorablement" },
          ],
          media: {
            src: "/photos/merrick-stone-law/about.64fc38af.jpg",
            alt: "L'équipe de Merrick & Stone devant le palais de justice",
          },
        },
        team: {
          eyebrow: "Vos avocats",
          title: "Rencontrez les avocats qui plaideront votre dossier",
          subtitle:
            "Ni gestionnaire de dossier ni centre d'appels — un associé nommé et une équipe qui a fait face à des jurys.",
          members: [
            {
              name: "Diane Merrick",
              photo: { src: "/art/merrick-stone-law/team-dm.svg", alt: "Diane Merrick" },
              role: "Associée fondatrice · Avocate plaidante",
              credentials: "J.D. · Certifiée en procès civil",
              bio: "Ancienne procureure ayant mené plus de 75 dossiers au verdict, réputée pour des contre-interrogatoires qui démontent les experts adverses.",
            },
            {
              name: "Andre Stone",
              photo: { src: "/photos/merrick-stone-law/team-as.206d8c07.jpg", alt: "Andre Stone" },
              role: "Associé fondateur",
              credentials: "J.D. · LL.M. Contentieux",
              bio: "Dirige les dossiers de blessures catastrophiques et d'erreurs médicales — et la science qui fait gagner ces affaires.",
            },
            {
              name: "Rosa Delgado",
              photo: { src: "/art/merrick-stone-law/team-rd.svg", alt: "Rosa Delgado" },
              role: "Avocate senior",
              credentials: "J.D.",
              bio: "Gère le droit du travail et les accidents professionnels, avec une expérience auprès des syndicats et des travailleurs blessés.",
            },
            {
              name: "Marcus Whitfield",
              photo: { src: "/photos/merrick-stone-law/team-mw.b03298c4.jpg", alt: "Marcus Whitfield" },
              role: "Avocat collaborateur",
              credentials: "J.D.",
              bio: "Spécialisé dans les dossiers de poids lourds et véhicules commerciaux, il fouille les registres et la télématique pour la vraie histoire.",
            },
            {
              name: "Karen Osei",
              photo: { src: "/art/merrick-stone-law/team-ko.svg", alt: "Karen Osei" },
              role: "Avocate-conseil · Appels",
              credentials: "J.D.",
              bio: "Protège les verdicts en appel et traite les mémoires et requêtes les plus complexes du cabinet.",
            },
            {
              name: "Nathan Cole",
              photo: { src: "/photos/merrick-stone-law/team-nc.86e7d9f2.jpg", alt: "Nathan Cole" },
              role: "Chargé de clientèle",
              credentials: "Gestionnaire de dossier",
              bio: "Votre interlocuteur au quotidien, qui vous tient informé et assure le suivi de vos soins et documents.",
            },
          ],
        },
        testimonials: {
          eyebrow: "Résultats clients",
          title: "Des issues qui ont changé la vie de nos clients",
          items: [
            {
              quote:
                "Après mon accident, l'assureur a proposé 40 000 $ comme offre finale. Merrick & Stone a plaidé, et le jury a accordé plus de dix fois cette somme. Ils n'ont jamais flanché.",
              author: "Robert A.",
              role: "Client — accident de camion",
              rating: 5,
            },
            {
              quote:
                "Ils ont traité le dossier d'erreur médicale de mon mari comme s'il était le seul au cabinet. Chaque appel retourné, chaque question répondue — et ils ont gagné.",
              author: "Yolanda P.",
              role: "Cliente — erreur médicale",
              rating: 5,
            },
            {
              quote:
                "J'étais sans travail et terrifié à l'idée des frais. Rien à payer d'avance, ils ont avancé tous les coûts. J'ai pu me concentrer sur ma guérison pendant qu'ils se battaient.",
              author: "Devin M.",
              role: "Client — accident du travail",
              rating: 5,
            },
          ],
        },
        pricing: {
          eyebrow: "Nos honoraires",
          title: "Comment nous sommes payés — et comment nous ne le sommes pas",
          subtitle:
            "Pas de provision, pas de facturation horaire, aucune facture tant que votre dossier est ouvert. Pour les dossiers de blessures, nous ne sommes payés que si nous gagnons.",
          tiers: [
            {
              name: "Étude de dossier",
              price: "0 $",
              period: "consultation",
              description:
                "Rencontrez un avocat — pas un agent d'accueil — et obtenez une réponse claire sur la solidité de votre dossier.",
              features: [
                "Sans frais, sans engagement",
                "Vous rencontrez un vrai avocat",
                "Un avis honnête sur votre réclamation",
                "Soirées et week-ends disponibles",
              ],
              cta: { label: "Réserver votre étude", href: "#contact" },
            },
            {
              name: "Honoraires de résultat",
              price: "Sans honoraires",
              period: "sauf si nous gagnons",
              description:
                "Vous ne payez rien d'avance. Nos honoraires sont une part de ce que nous récupérons — et rien du tout si nous ne gagnons pas.",
              features: [
                "0 $ à débourser pour commencer",
                "Nous avançons tous les frais",
                "Honoraires = part de l'indemnisation",
                "Rien à devoir si nous perdons",
                "Conditions convenues par écrit d'abord",
              ],
              cta: { label: "Lancer votre réclamation", href: "#contact" },
              highlighted: true,
              badge: "Le cas le plus fréquent",
            },
            {
              name: "Forfait",
              price: "Forfait",
              period: "annoncé d'avance",
              description:
                "Pour certains dossiers hors blessures — contrats, mises en demeure et relectures — un forfait clair, convenu avant de commencer.",
              features: [
                "Prix fixe par écrit",
                "Aucune surprise horaire",
                "Périmètre défini ensemble",
                "Idéal pour un dossier ponctuel",
              ],
              cta: { label: "Demander un forfait", href: "#contact" },
            },
          ],
          note: "Les pourcentages d'honoraires et les frais avancés sont toujours détaillés dans une convention écrite avant de commencer. Chaque consultation est confidentielle.",
        },
        faq: {
          eyebrow: "Questions fréquentes",
          title: "Ce qu'on nous demande avant d'appeler",
          items: [
            {
              question: "Combien cela coûte-t-il de vous engager ?",
              answer:
                "Pour les dossiers de blessures, rien d'avance. Nous travaillons au résultat : nos honoraires sont un pourcentage de ce que nous récupérons, et si nous ne gagnons pas, vous ne nous devez aucun honoraire. Les conditions exactes sont toujours mises par écrit avant de commencer.",
            },
            {
              question: "Ai-je vraiment un dossier ?",
              answer:
                "C'est tout l'objet de la consultation gratuite. Apportez ce que vous avez — constat, factures médicales, photos, lettre d'offre de l'assureur — et un avocat vous dira honnêtement si cela vaut la peine. Sans frais, sans engagement.",
            },
            {
              question: "Combien de temps mon dossier prendra-t-il ?",
              answer:
                "Cela dépend des blessures et de la bonne foi de la partie adverse. Certains dossiers se règlent en quelques mois ; ceux qui vont au procès peuvent durer un an ou plus. Nous visons le meilleur résultat, pas le plus rapide, et vous tenons informé à chaque étape.",
            },
            {
              question: "Mon dossier ira-t-il réellement au procès ?",
              answer:
                "La plupart se règlent — mais mieux lorsque la partie adverse sait que nous sommes prêts à plaider. Nous bâtissons chaque dossier comme s'il passait devant un jury. Cette préparation, c'est notre levier.",
            },
            {
              question: "De combien de temps je dispose pour agir ?",
              answer:
                "Chaque État fixe un délai, parfois plus court qu'on ne le croit — un an ou deux, et encore moins face à une entité publique. Plus vous appelez tôt, plus vous avez d'options ; attendre peut vous coûter le dossier entier.",
            },
          ],
        },
        cta: {
          title: "Blessé ? L'appel est gratuit — le conseil aussi.",
          description:
            "Parlez à un avocat plaidant dès aujourd'hui. Aucuns honoraires sans résultat, et jamais de pression.",
          primaryCta: {
            label: "Obtenir votre étude gratuite",
            href: "#contact",
          },
          secondaryCta: {
            label: "Appeler le {phone}",
            href: "{phoneHref}",
          },
        },
        contact: {
          eyebrow: "Étude de dossier gratuite",
          title: "Dites-nous ce qui s'est passé",
          subtitle: "Partagez quelques détails en toute confidentialité et un avocat vous recontactera — généralement le jour même. En cas d'urgence, appelez-nous au {phone}.",
          submitLabel: "Envoyer ma demande",
          sendingLabel: "Envoi en cours…",
          successTitle: "Message envoyé",
          successMessage:
            "Merci — votre message est confidentiel, et un avocat de Merrick & Stone vous recontactera sous peu, généralement en quelques heures.",
          sendAnotherLabel: "Envoyer un autre message",
          errorMessage:
            "L'envoi de votre message a échoué. Réessayez, ou contactez-nous directement avec les coordonnées ci-contre.",
          requiredMessage: "Ce champ est obligatoire.",
          selectPlaceholder: "Choisissez un type de dossier",
          infoLabels: {
            callUs: "Appelez-nous",
            email: "E-mail",
            visit: "Adresse",
            hours: "Horaires",
          },
          fields: [
            {
              name: "name",
              label: "Nom complet",
              type: "text",
              required: true,
            },
            { name: "phone", label: "Téléphone", type: "tel", required: true },
            { name: "email", label: "E-mail", type: "email" },
            {
              name: "matter",
              label: "Type de dossier",
              type: "select",
              required: true,
              placeholder: "Choisissez un type de dossier",
              options: [
                "Accident de voiture ou de camion",
                "Erreur médicale",
                "Accident du travail",
                "Décès injustifié",
                "Droit du travail",
                "Autre",
              ],
            },
            {
              name: "incidentDate",
              label: "Quand est-ce arrivé ?",
              type: "date",
            },
            {
              name: "message",
              label: "Que s'est-il passé ?",
              type: "textarea",
              placeholder:
                "Dites-en autant ou aussi peu que vous le souhaitez — tout ce que vous nous confiez reste confidentiel.",
            },
          ],
        },
        location: {
          eyebrow: "Notre cabinet",
          title: "Centre de Casablanca, à deux pas du palais de justice",
          subtitle:
            "Stationnement validé, et nous nous déplaçons à domicile ou à l'hôpital lorsque vous ne pouvez pas venir.",
          directionsLabel: "Itinéraire",
          infoLabels: {
            address: "Adresse",
            phone: "Téléphone",
            hours: "Horaires",
          },
        },
        "privacy-body": {
          eyebrow: "Mentions légales",
          title: "Politique de confidentialité",
          updated: "Dernière mise à jour : 3 août 2026",
          intro:
            "Cette politique explique quelles données personnelles {siteName} recueille via ce site, pourquoi nous les recueillons, et ce que vous pouvez nous demander d'en faire.",
          blocks: [
            {
              heading: "Qui nous sommes",
              body: "{siteName} est responsable du traitement des données décrites ici. Vous pouvez nous joindre à {email}, appeler le {phone}, ou nous écrire au {address}.",
            },
            {
              heading: "Ce que nous recueillons",
              body: "Nous ne recueillons que ce que vous saisissez dans le formulaire d'étude de dossier gratuite, plus quelques informations techniques que votre navigateur envoie automatiquement.",
              bullets: [
                "Vos nom et numéro de téléphone, nécessaires pour vous rappeler.",
                "Votre adresse e-mail, si vous choisissez de la donner.",
                "Le type de dossier sélectionné et, si vous la renseignez, la date des faits.",
                "Ce que vous écrivez dans le champ « Que s'est-il passé ? » — partagez ce que vous êtes à l'aise de mettre par écrit avant d'avoir parlé à un avocat.",
                "Votre adresse IP, qui limite les envois automatisés abusifs et figure dans la notification que nous recevons.",
                "Les journaux de serveur habituels tenus par notre hébergeur, comme les pages demandées et l'heure de la demande.",
              ],
            },
            {
              heading: "Pourquoi nous les recueillons",
              body: "Nous utilisons votre message uniquement pour évaluer si nous pouvons vous aider et pour organiser une consultation gratuite. Nous ne vendons pas vos données et ne les utilisons ni à des fins publicitaires ni de profilage.",
            },
            {
              heading: "Ce formulaire ne fait pas de vous notre client",
              body: "Envoyer ce formulaire ouvre une conversation — cela ne crée pas de relation avocat-client, et ce que vous partagez avant que cette relation ne soit formalisée par écrit peut ne pas être couvert par le secret professionnel. Si votre affaire est urgente, appelez le {phone} plutôt que d'attendre une réponse écrite.",
            },
            {
              heading: "Qui d'autre y a accès",
              body: "Nous ne partageons vos données qu'avec les prestataires qui font fonctionner ce site et nous transmettent votre message :",
              bullets: [
                "Vercel, qui héberge ce site et conserve les journaux de serveur habituels.",
                "Telegram, qui transmet votre message sur le téléphone de notre équipe d'accueil.",
                "Resend, qui achemine votre message par e-mail à notre équipe d'accueil.",
              ],
            },
            {
              heading: "Combien de temps nous les conservons",
              body: "Nous conservons un message le temps nécessaire pour vous répondre et pour décider si nous pouvons prendre votre dossier. Si nous ne le prenons pas, nous le supprimons après un délai raisonnable d'examen. Si nous le prenons, il rejoint votre dossier client et suit nos règles habituelles de conservation. Demandez-nous de le supprimer plus tôt et nous le ferons, sauf obligation contraire.",
            },
            {
              heading: "Vos droits",
              body: "Vous pouvez demander une copie des données que nous détenons sur vous, leur rectification ou leur suppression. Écrivez à {email} et nous vous répondrons. Si notre réponse ne vous satisfait pas, vous pouvez saisir la CNDP (Commission nationale de contrôle de la protection des données à caractère personnel).",
            },
            {
              heading: "Cookies et stockage du navigateur",
              body: "Ce site ne dépose aucun cookie publicitaire ni de mesure d'audience. Si vous basculez le site entre les modes clair et sombre, ou changez sa langue, ce choix est enregistré dans le stockage local de votre navigateur afin que la page n'affiche pas brièvement le mauvais thème ni ne réinitialise la langue à votre prochaine visite. Il reste sur votre appareil et ne nous est jamais transmis.",
            },
            {
              heading: "Modifications de cette politique",
              body: "Si nous changeons notre façon de traiter vos données, nous mettrons à jour cette page ainsi que la date indiquée en haut.",
            },
          ],
        },
      },
      pages: {
        privacy: {
          title: "Confidentialité",
          seo: {
            title: "Politique de confidentialité — Merrick & Stone",
            description:
              "Comment Merrick & Stone traite les informations que vous nous transmettez via le formulaire d'étude de dossier.",
          },
        },
      },
    },

    // ── ARABIC (RTL) ───────────────────────────────────────────────────────
    ar: {
      seo: {
        title: "ميريك وستون — محامون في الدار البيضاء | لا أتعاب دون نتيجة",
        description:
          "محامون متخصصون في الأضرار الجسدية والمنازعات المدنية في الدار البيضاء: حوادث السيارات والشاحنات، الأخطاء الطبية، إصابات العمل، والوفاة الناجمة عن خطأ. استشارة مجانية.",
      },
      // Le site a désormais une page routée (/privacy), donc les ancres de la
      // page d'accueil sont préfixées par "/" — un "#services" nu ne ferait
      // rien depuis cette page. Le moteur corrige n'importe quel "#..." au
      // rendu dès qu'un site a des pages (`rootRelativeAnchors` dans
      // lib/i18n.ts) ; le préfixe est écrit ici en toutes lettres pour que ce
      // tableau, écrit à la main, ne soit pas le seul endroit qui ait l'air
      // faux à la lecture.
      nav: [
        { label: "مجالات العمل", href: "/#services" },
        { label: "عن المكتب", href: "/#about" },
        { label: "الفريق", href: "/#team" },
        { label: "الأتعاب", href: "/#pricing" },
        { label: "التقييمات", href: "/#testimonials" },
        { label: "الأسئلة", href: "/#faq" },
        { label: "العنوان", href: "/#location" },
        { label: "تواصل", href: "/#contact" },
      ],
      header: { cta: { label: "استشارة مجانية" } },
      footer: {
        tagline:
          "محامو مرافعات في الدار البيضاء للمصابين إصابات بالغة. لا أتعاب إلا بعد الفوز — وبلا اختصارات في الطريق.",
        legal: "إعلان محاماة. النتائج السابقة لا تضمن نتيجة مماثلة. Merrick & Stone · 70 boulevard Mohammed V, 20000 Casablanca.",
        exploreLabel: "استكشف",
        contactLabel: "تواصل معنا",
        copyrightText: "© جميع الحقوق محفوظة — ميريك وستون.",
      },
      business: {
        hours: [
          { days: "الإثنين–الجمعة", hours: "8:00 ص – 6:00 م" },
          { days: "السبت", hours: "بموعد مسبق" },
          { days: "الأحد", hours: "الهاتف متاح 24/7" },
        ],
      },
      sections: {
        hero: {
          eyebrow: "محامو مرافعات · استشارة مجانية",
          title: "عندما يكون كل شيء على المحك،",
          highlight: "فأنت بحاجة إلى محامٍ مترافع.",
          subtitle:
            "شركات التأمين تدفع أكثر حين تعلم أنك مستعد للذهاب إلى المحكمة. نحن المكتب الذي لا يريدون مواجهته — ولا تدفع شيئًا إلا بعد الفوز.",
          bullets: [
            "مراجعة سرية ومجانية لقضيتك مع محامٍ",
            "لا أتعاب إلا إذا حصّلنا لك تعويضًا",
            "عقدان من الأحكام، وليس مجرد تسويات",
          ],
          primaryCta: { label: "احصل على مراجعة مجانية" },
          secondaryCta: { label: "اتصل على {phone}" },
          badges: [
            "لا فوز، لا أتعاب",
            "أكثر من 500 مليون درهم",
            "متاح على مدار الساعة",
          ],
        },
        services: {
          eyebrow: "مجالات الممارسة",
          title: "القضايا التي نأخذها إلى المحكمة",
          subtitle:
            "إصابات خطيرة وخسائر حقيقية — القضايا المعقدة وعالية المخاطر التي تحيلها المكاتب الأخرى.",
          learnMoreLabel: "اعرف المزيد",
          items: [
            {
              icon: "car-front",
              title: "حوادث السيارات والشاحنات",
              description:
                "تصادمات كارثية مع شركات النقل والمركبات المشتركة والسائقين غير المؤمَّنين — نواجه شركات التأمين لتتفرّغ أنت للتعافي.",
              href: "#contact",
            },
            {
              icon: "stethoscope",
              title: "الأخطاء الطبية",
              description:
                "أخطاء التشخيص والجراحة وإصابات الولادة، مدعومة بالخبراء الطبيين الذين تتطلبهم هذه القضايا.",
            },
            {
              icon: "hard-hat",
              title: "إصابات العمل",
              description:
                "قضايا البناء والصناعة والغير التي تتجاوز مجرد تعويض إصابة العمل.",
            },
            {
              icon: "scale",
              title: "الوفاة الظالمة",
              description:
                "تمثيل إنساني وحازم للعائلات التي تسعى للمساءلة بعد خسارة لا تُحتمل.",
            },
            {
              icon: "briefcase",
              title: "قانون العمل",
              description:
                "الفصل التعسفي والتمييز والتحرش والأجور غير المدفوعة — لمساءلة أصحاب العمل أمام القانون.",
            },
            {
              icon: "building-2",
              title: "مسؤولية الأماكن",
              description:
                "الانزلاق والسقوط وضعف الأمن والأماكن غير الآمنة حيث تحوّل تهاون المالك إلى إصابتك.",
            },
          ],
        },
        about: {
          eyebrow: "لماذا ميريك وستون",
          title: "مكتب بُني للمرافعة، لا لمجرّد التسوية",
          body: [
            "معظم مكاتب الإصابات تعمل بالكمّ — تسوّي بسرعة وبأقل قدر لأنها غير مهيّأة لمرافعة قضيتك. وشركات التأمين تعرف تمامًا أيّ المكاتب سيتراجع. نحن لسنا منهم.",
            "منذ أكثر من عشرين عامًا، تأخذ ميريك وستون القضايا الصعبة إلى الحكم حين يكون العرض غير عادل. هذا الاستعداد للمرافعة هو سبب ارتفاع تعويضات موكّلينا، وسبب أخذ الطرف الآخر لمكالماتنا على محمل الجدّ.",
          ],
          highlights: [
            "أسّسه مدّعيان عامّان سابقان",
            "قضيتك يتولاها شريك، لا تُحال لغيره",
            "محامو مرافعات معترف بهم وطنيًا",
            "لا تدين بشيء إلا إذا حصّلنا لك تعويضًا",
          ],
          stats: [
            { value: "+500 مليون درهم", label: "حُصّلت للموكّلين" },
            { value: "20+", label: "عامًا من المرافعات" },
            { value: "98%", label: "رُبحت أو سُوّيت لصالحنا" },
          ],
          media: { src: "/photos/merrick-stone-law/about.64fc38af.jpg", alt: "فريق ميريك وستون أمام المحكمة" },
        },
        team: {
          eyebrow: "محاموك",
          title: "تعرّف على المحامين الذين سيترافعون في قضيتك",
          subtitle:
            "لا مدير قضايا ولا مركز اتصال — شريك باسمه وفريق وقف أمام هيئات المحلّفين.",
          members: [
            {
              name: "Diane Merrick",
              photo: { src: "/art/merrick-stone-law/team-dm.svg", alt: "Diane Merrick" },
              role: "شريكة مؤسِّسة · محامية مرافعات",
              credentials: "J.D. · معتمدة في المحاكمات المدنية",
              bio: "مدّعية عامة سابقة ترافعت في أكثر من 75 قضية حتى الحكم، تشتهر باستجوابات تُفكّك خبراء الدفاع.",
            },
            {
              name: "Andre Stone",
              photo: { src: "/photos/merrick-stone-law/team-as.206d8c07.jpg", alt: "Andre Stone" },
              role: "شريك مؤسِّس",
              credentials: "J.D. · ماجستير في التقاضي",
              bio: "يقود قضايا الإصابات الكارثية والأخطاء الطبية — والعلم الذي يكسبها.",
            },
            {
              name: "Rosa Delgado",
              photo: { src: "/art/merrick-stone-law/team-rd.svg", alt: "Rosa Delgado" },
              role: "محامية أولى",
              credentials: "J.D.",
              bio: "تتولّى قضايا العمل وإصابات العمل، بخلفية في تمثيل النقابات والعمال المصابين.",
            },
            {
              name: "Marcus Whitfield",
              photo: { src: "/photos/merrick-stone-law/team-mw.b03298c4.jpg", alt: "Marcus Whitfield" },
              role: "محامٍ مساعد",
              credentials: "J.D.",
              bio: "يركّز على قضايا الشاحنات والمركبات التجارية، ويغوص في السجلات والتتبّع لكشف الحقيقة.",
            },
            {
              name: "Karen Osei",
              photo: { src: "/art/merrick-stone-law/team-ko.svg", alt: "Karen Osei" },
              role: "مستشارة · الاستئناف",
              credentials: "J.D.",
              bio: "تحمي الأحكام في الاستئناف وتتولّى أعقد المذكّرات والطلبات في المكتب.",
            },
            {
              name: "Nathan Cole",
              photo: { src: "/photos/merrick-stone-law/team-nc.86e7d9f2.jpg", alt: "Nathan Cole" },
              role: "مسؤول علاقة الموكّلين",
              credentials: "مدير قضايا",
              bio: "نقطة تواصلك اليومية، يبقيك على اطّلاع ويتابع علاجك ومستنداتك.",
            },
          ],
        },
        testimonials: {
          eyebrow: "نتائج الموكّلين",
          title: "نتائج غيّرت حياة موكّلينا",
          items: [
            {
              quote:
                "بعد حادثي عرضت شركة التأمين 40,000$ كعرض نهائي. ترافعت ميريك وستون، وعاد المحلّفون بأكثر من عشرة أضعاف. لم يتراجعوا لحظة.",
              author: "Robert A.",
              role: "موكّل — حادث شاحنة",
              rating: 5,
            },
            {
              quote:
                "عاملوا قضية زوجي الطبية وكأنها القضية الوحيدة في المكتب. كل مكالمة يُردّ عليها، وكل سؤال يُجاب — وربحوا.",
              author: "Yolanda P.",
              role: "موكّلة — خطأ طبي",
              rating: 5,
            },
            {
              quote:
                "كنت عاطلًا وخائفًا من التكاليف. لا شيء مستحق مقدمًا، وتحمّلوا كل النفقات. تفرّغت للتعافي بينما كانوا يقاتلون.",
              author: "Devin M.",
              role: "موكّل — إصابة عمل",
              rating: 5,
            },
          ],
        },
        pricing: {
          eyebrow: "أتعابنا",
          title: "كيف نتقاضى أتعابنا — وكيف لا نتقاضاها",
          subtitle:
            "لا دفعة مقدمة، ولا فوترة بالساعة، ولا فواتير ما دامت قضيتك مفتوحة. في قضايا الإصابات، لا نتقاضى إلا إذا فزنا.",
          tiers: [
            {
              name: "مراجعة القضية",
              price: "0$",
              period: "استشارة",
              description:
                "اجلس مع محامٍ — لا مع موظف استقبال — واحصل على إجابة واضحة عمّا إذا كانت لديك قضية.",
              features: [
                "بلا تكلفة وبلا التزام",
                "تقابل محاميًا حقيقيًا",
                "قراءة صادقة لمطالبتك",
                "متاح مساءً وفي العطلات",
              ],
              cta: { label: "احجز مراجعتك", href: "#contact" },
            },
            {
              name: "أتعاب مشروطة",
              price: "بلا أتعاب",
              period: "إلا إذا فزنا",
              description:
                "لا تدفع شيئًا مقدمًا. أتعابنا حصة مما نحصّله — ولا شيء إطلاقًا إن لم نفز.",
              features: [
                "0$ للبدء",
                "نتحمّل كل نفقات القضية",
                "الأتعاب حصة من التعويض",
                "لا شيء مستحق إن خسرنا",
                "الشروط تُكتب أولًا",
              ],
              cta: { label: "ابدأ مطالبتك", href: "#contact" },
              highlighted: true,
              badge: "الأكثر شيوعًا",
            },
            {
              name: "أتعاب مقطوعة",
              price: "مبلغ مقطوع",
              period: "يُحدَّد مسبقًا",
              description:
                "لبعض الأعمال غير المتعلقة بالإصابات — العقود وخطابات المطالبة والمراجعات — مبلغ واضح يُتّفق عليه قبل البدء.",
              features: [
                "سعر ثابت مكتوب",
                "لا مفاجآت بالساعة",
                "النطاق يُحدَّد معًا",
                "مثالي للمهام لمرة واحدة",
              ],
              cta: { label: "اسأل عن المبلغ المقطوع", href: "#contact" },
            },
          ],
          note: "نِسب الأتعاب المشروطة والنفقات المقدَّمة تُفصَّل دائمًا في اتفاق مكتوب قبل أن نبدأ. كل استشارة سرّية.",
        },
        faq: {
          eyebrow: "أسئلة شائعة",
          title: "ما يسأل عنه الناس قبل الاتصال",
          items: [
            {
              question: "كم يكلّف توكيلكم؟",
              answer:
                "في قضايا الإصابات، لا شيء مقدمًا. نعمل بأتعاب مشروطة: أتعابنا نسبة مما نحصّله لك، وإن لم نفز فلا تدين لنا بأي أتعاب. وتُكتب الشروط الدقيقة دائمًا قبل أن نبدأ.",
            },
            {
              question: "هل لديّ قضية فعلًا؟",
              answer:
                "لهذا الغرض الاستشارة المجانية. أحضِر ما لديك — محضر الشرطة، الفواتير الطبية، الصور، خطاب عرض التأمين — وسيعطيك المحامي قراءة صادقة عمّا إذا كان يستحق المتابعة. بلا تكلفة وبلا التزام.",
            },
            {
              question: "كم ستستغرق قضيتي؟",
              answer:
                "يعتمد على الإصابات ومدى تعقّل الطرف الآخر. بعض القضايا تُحسم في أشهر؛ وما يذهب للمحكمة قد يستغرق عامًا أو أكثر. نسعى لأفضل نتيجة لا لأسرعها، ونطلعك على كل مرحلة.",
            },
            {
              question: "هل ستذهب قضيتي إلى المحكمة فعلًا؟",
              answer:
                "معظم القضايا تُسوّى — لكنها تُسوّى بأفضل حين يعلم الطرف الآخر أننا مستعدون للمرافعة. نبني كل قضية وكأنها ذاهبة أمام هيئة محلّفين. هذا الاستعداد هو ورقتنا الرابحة.",
            },
            {
              question: "كم من الوقت أمامي لرفع مطالبة؟",
              answer:
                "لكل ولاية مهلة للرفع، وقد تكون أقصر مما تتوقع — عامًا أو عامين، وأقل ضد جهة حكومية. كلما اتصلت أبكر زادت خياراتك؛ والتأخير قد يكلّفك القضية بأكملها.",
            },
          ],
        },
        cta: {
          title: "أُصبت؟ المكالمة مجانية — والنصيحة كذلك.",
          description:
            "تحدّث إلى محامي مرافعات اليوم. لا أتعاب إلا بعد الفوز، وبلا أي ضغط إطلاقًا.",
          primaryCta: { label: "احصل على مراجعتك المجانية", href: "#contact" },
          secondaryCta: {
            label: "اتصل على {phone}",
            href: "{phoneHref}",
          },
        },
        contact: {
          eyebrow: "مراجعة مجانية للقضية",
          title: "أخبرنا بما حدث",
          subtitle: "شارك بعض التفاصيل بثقة وسيعاود محامٍ الاتصال بك — عادةً في اليوم نفسه. وإن كان الأمر عاجلًا، اتصل بنا في أي وقت على {phone}.",
          submitLabel: "أرسل طلبي",
          sendingLabel: "جارٍ الإرسال…",
          successTitle: "تم إرسال رسالتك",
          successMessage:
            "شكرًا — رسالتك سرّية، وسيتواصل معك محامٍ من ميريك وستون قريبًا، عادةً خلال ساعات.",
          sendAnotherLabel: "إرسال رسالة أخرى",
          errorMessage:
            "تعذّر إرسال رسالتك. حاول مرة أخرى، أو تواصل معنا مباشرةً عبر بيانات الاتصال الظاهرة في هذه الصفحة.",
          requiredMessage: "هذا الحقل مطلوب.",
          selectPlaceholder: "اختر نوع القضية",
          infoLabels: {
            callUs: "اتصل بنا",
            email: "البريد الإلكتروني",
            visit: "العنوان",
            hours: "ساعات العمل",
          },
          fields: [
            {
              name: "name",
              label: "الاسم الكامل",
              type: "text",
              required: true,
            },
            { name: "phone", label: "الهاتف", type: "tel", required: true },
            { name: "email", label: "البريد الإلكتروني", type: "email" },
            {
              name: "matter",
              label: "نوع القضية",
              type: "select",
              required: true,
              placeholder: "اختر نوع القضية",
              options: [
                "حادث سيارة أو شاحنة",
                "خطأ طبي",
                "إصابة عمل",
                "وفاة ظالمة",
                "قانون العمل",
                "شيء آخر",
              ],
            },
            { name: "incidentDate", label: "متى حدث ذلك؟", type: "date" },
            {
              name: "message",
              label: "ماذا حدث؟",
              type: "textarea",
              placeholder: "اكتب بقدر ما تشاء — كل ما تخبرنا به يبقى سرّيًا.",
            },
          ],
        },
        location: {
          eyebrow: "مكتبنا",
          title: "وسط الدار البيضاء، على بُعد خطوات من المحكمة",
          subtitle:
            "خدمة تصديق ركن السيارة متاحة، ونقوم بزيارات منزلية وفي المستشفى حين يتعذّر عليك القدوم.",
          directionsLabel: "الاتجاهات",
          infoLabels: {
            address: "العنوان",
            phone: "الهاتف",
            hours: "ساعات العمل",
          },
        },
        "privacy-body": {
          eyebrow: "إشعار قانوني",
          title: "سياسة الخصوصية",
          updated: "آخر تحديث: 3 أغسطس 2026",
          intro:
            "توضّح هذه السياسة البيانات الشخصية التي تجمعها {siteName} عبر هذا الموقع، ولماذا نجمعها، وما يمكنكم أن تطلبوا منا القيام به بشأنها.",
          blocks: [
            {
              heading: "من نحن",
              body: "{siteName} هي الجهة المسؤولة عن معالجة البيانات الموصوفة هنا. يمكنكم التواصل معنا عبر {email}، أو الاتصال بالرقم {phone}، أو مراسلتنا على العنوان {address}.",
            },
            {
              heading: "ما الذي نجمعه",
              body: "لا نجمع سوى ما تكتبونه في نموذج المراجعة المجانية للقضية، إضافة إلى بعض المعلومات التقنية التي يرسلها متصفحكم تلقائيًا.",
              bullets: [
                "اسمكم ورقم هاتفكم، اللازمان للاتصال بكم.",
                "بريدكم الإلكتروني، إن اخترتم تقديمه.",
                "نوع القضية المحدَّد، وتاريخ الواقعة إن ذكرتموه.",
                "ما تكتبونه في حقل «ماذا حدث؟» — شاركوا بقدر ما ترتاحون لكتابته قبل التحدث إلى محامٍ.",
                "عنوان IP الخاص بكم، الذي يحدّ من إساءة الاستخدام الآلي للنموذج ويظهر في الإشعار الذي نتلقاه.",
                "سجلات الخادوم المعتادة التي يحتفظ بها مضيف موقعنا، مثل الصفحات المطلوبة ووقت الطلب.",
              ],
            },
            {
              heading: "لماذا نجمعها",
              body: "نستخدم رسالتكم فقط لتقييم إمكانية مساعدتكم وتنظيم استشارة مجانية. لا نبيع بياناتكم ولا نستخدمها لأغراض إعلانية أو للتنميط.",
            },
            {
              heading: "هذا النموذج لا يجعلكم موكّلين لدينا",
              body: "إرسال هذا النموذج يفتح محادثة — ولا ينشئ علاقة محامٍ-موكّل، وما تشاركونه قبل إرساء هذه العلاقة كتابةً قد لا يكون مشمولًا بسرية المهنة. إن كانت قضيتكم عاجلة، اتصلوا بالرقم {phone} بدل انتظار رد كتابي.",
            },
            {
              heading: "من غيرنا يطّلع عليها",
              body: "لا نشارك بياناتكم إلا مع الجهات التي تُشغّل هذا الموقع وتنقل رسالتكم إلينا:",
              bullets: [
                "Vercel، التي تستضيف هذا الموقع وتحتفظ بسجلات الخادوم المعتادة.",
                "Telegram، التي تنقل رسالتكم إلى هاتف فريق الاستقبال لدينا.",
                "Resend، التي تُوصل رسالتكم عبر البريد الإلكتروني إلى فريق الاستقبال لدينا.",
              ],
            },
            {
              heading: "المدة التي نحتفظ بها",
              body: "نحتفظ بالرسالة للمدة اللازمة للرد عليكم وتقييم إمكانية تولّي قضيتكم. إن لم نتولَّها، نحذفها بعد فترة مراجعة معقولة. وإن تولّيناها، تصبح جزءًا من ملف موكّلكم وتخضع لقواعد الاحتفاظ المعتادة لدينا. اطلبوا منا حذف رسالتكم في وقت أبكر وسنفعل، ما لم يكن هناك التزام يقضي بخلاف ذلك.",
            },
            {
              heading: "حقوقكم",
              body: "يمكنكم طلب نسخة من البيانات التي نحتفظ بها عنكم، أو تصحيحها، أو حذفها. راسلونا على {email} وسنرد عليكم. وإذا لم يُرضِكم ردّنا، يمكنكم تقديم شكوى إلى اللجنة الوطنية لمراقبة حماية المعطيات ذات الطابع الشخصي (CNDP).",
            },
            {
              heading: "ملفات تعريف الارتباط وتخزين المتصفح",
              body: "لا يضع هذا الموقع أي ملفات تعريف ارتباط إعلانية أو تحليلية. عند تبديلكم الموقع بين الوضعين الفاتح والداكن، أو تغيير لغته، يُحفظ هذا الاختيار في التخزين المحلي لمتصفحكم حتى لا تعرض الصفحة السمة الخاطئة للحظة أو تُعيد ضبط اللغة عند زيارتكم التالية. يبقى هذا الاختيار على جهازكم ولا يُرسَل إلينا أبدًا.",
            },
            {
              heading: "التعديلات على هذه السياسة",
              body: "إذا غيّرنا طريقة تعاملنا مع بياناتكم، سنحدّث هذه الصفحة والتاريخ الموضّح أعلاه.",
            },
          ],
        },
      },
      pages: {
        privacy: {
          title: "سياسة الخصوصية",
          seo: {
            title: "سياسة الخصوصية — ميريك وستون",
            description:
              "كيف تتعامل ميريك وستون مع المعلومات التي ترسلونها عبر نموذج المراجعة المجانية للقضية.",
          },
        },
      },
    },
  },

  sections: [
    {
      type: "hero",
      enabled: true,
      props: {
        eyebrow: "Trial Attorneys · Free Consultation",
        title: "When everything's on the line,",
        highlight: "you want a trial lawyer.",
        subtitle:
          "Insurance companies pay more when they know you're ready to go to court. We're the firm they don't want across the table — and you pay nothing unless we win.",
        bullets: [
          "Free, confidential case review with an attorney",
          "No fee unless we recover money for you",
          "Two decades of verdicts, not just settlements",
        ],
        primaryCta: { label: "Get a free case review", href: "#contact" },
        secondaryCta: {
          label: "Call {phone}",
          href: "{phoneHref}",
          variant: "secondary",
        },
        badges: ["No win, no fee", "500M DH+ recovered", "Available 24/7"],
        layout: "centered",
        backdrop: "halftone",
      },
    },
    {
      type: "services",
      enabled: true,
      props: {
        eyebrow: "Practice areas",
        title: "The cases we take to trial",
        subtitle:
          "Serious injuries and real losses — the complex, high-stakes matters other firms refer out.",
        columns: 3,
        items: [
          {
            icon: "car-front",
            title: "Car & Truck Accidents",
            description:
              "Catastrophic collisions with commercial carriers, rideshares, and uninsured drivers — we take on the insurers so you can heal.",
            href: "#contact",
          },
          {
            icon: "stethoscope",
            title: "Medical Malpractice",
            description:
              "Misdiagnosis, surgical errors, and birth injuries, built with the medical experts these cases demand.",
          },
          {
            icon: "hard-hat",
            title: "Workplace Injuries",
            description:
              "Construction, industrial, and third-party claims that reach beyond a workers' comp check.",
          },
          {
            icon: "scale",
            title: "Wrongful Death",
            description:
              "Compassionate, determined representation for families seeking accountability after an unthinkable loss.",
          },
          {
            icon: "briefcase",
            title: "Employment Law",
            description:
              "Wrongful termination, discrimination, harassment, and unpaid wages — holding employers to the law.",
          },
          {
            icon: "building-2",
            title: "Premises Liability",
            description:
              "Slip-and-falls, negligent security, and unsafe properties where an owner's shortcut became your injury.",
          },
        ],
      },
    },
    {
      type: "about",
      enabled: true,
      props: {
        eyebrow: "Why Merrick & Stone",
        title: "A firm built to try cases, not just settle them",
        body: [
          "Most injury firms are volume shops — they settle fast and cheap because they aren't equipped to try your case. Insurers know exactly which firms will blink. We are not one of them.",
          "For more than twenty years, Merrick & Stone has taken hard cases to verdict when the offer wasn't fair. That trial-readiness is why our clients' recoveries tend to be larger, and why the other side takes our calls seriously.",
        ],
        highlights: [
          "Founded by two former trial prosecutors",
          "Your case is handled by a partner, not passed off",
          "Nationally recognized trial advocates",
          "You owe nothing unless we recover for you",
        ],
        stats: [
          { value: "500M DH+", label: "Recovered for clients" },
          { value: "20+", label: "Years trying cases" },
          { value: "98%", label: "Won or favorably settled" },
        ],
        mediaSide: "right",
        media: { src: "/photos/merrick-stone-law/about.64fc38af.jpg", alt: "The Merrick & Stone trial team outside the courthouse" },
      },
    },
    {
      type: "team",
      enabled: true,
      props: {
        eyebrow: "Your attorneys",
        title: "Meet the lawyers who'll try your case",
        subtitle:
          "Not a case manager or a call center — a named partner and a team that has stood in front of juries.",
        columns: 3,
        members: [
          {
            name: "Diane Merrick",
            photo: { src: "/art/merrick-stone-law/team-dm.svg", alt: "Diane Merrick" },
            role: "Founding Partner · Trial Attorney",
            credentials: "J.D. · Board-Certified Civil Trial",
            bio: "A former prosecutor who has tried more than 75 cases to verdict, known for cross-examinations that unravel the defense's experts.",
          },
          {
            name: "Andre Stone",
            photo: { src: "/photos/merrick-stone-law/team-as.206d8c07.jpg", alt: "Andre Stone" },
            role: "Founding Partner",
            credentials: "J.D. · LL.M. Litigation",
            bio: "Leads the firm's catastrophic-injury and medical-malpractice work — and the science that wins those cases.",
          },
          {
            name: "Rosa Delgado",
            photo: { src: "/art/merrick-stone-law/team-rd.svg", alt: "Rosa Delgado" },
            role: "Senior Associate",
            credentials: "J.D.",
            bio: "Handles employment and workplace-injury matters, with a background representing unions and injured workers.",
          },
          {
            name: "Marcus Whitfield",
            photo: { src: "/photos/merrick-stone-law/team-mw.b03298c4.jpg", alt: "Marcus Whitfield" },
            role: "Associate Attorney",
            credentials: "J.D.",
            bio: "Focuses on trucking and commercial-vehicle cases, digging through logs and telematics for the real story.",
          },
          {
            name: "Karen Osei",
            photo: { src: "/art/merrick-stone-law/team-ko.svg", alt: "Karen Osei" },
            role: "Of Counsel · Appeals",
            credentials: "J.D.",
            bio: "Protects verdicts on appeal and handles the firm's most complex briefing and motions.",
          },
          {
            name: "Nathan Cole",
            photo: { src: "/photos/merrick-stone-law/team-nc.86e7d9f2.jpg", alt: "Nathan Cole" },
            role: "Client Advocate",
            credentials: "Case Manager",
            bio: "Your day-to-day point of contact, keeping you informed and your treatment and records on track.",
          },
        ],
      },
    },
    {
      type: "testimonials",
      enabled: true,
      props: {
        eyebrow: "Client results",
        title: "Outcomes that changed our clients' lives",
        items: [
          {
            quote:
              "After my crash the insurer offered $40,000 and called it final. Merrick & Stone tried the case, and the jury came back with more than ten times that. They never once flinched.",
            author: "Robert A.",
            role: "Truck accident client",
            rating: 5,
          },
          {
            quote:
              "They treated my husband's malpractice case like it was the only one in the office. Every call returned, every question answered — and they won.",
            author: "Yolanda P.",
            role: "Medical malpractice client",
            rating: 5,
          },
          {
            quote:
              "I was out of work and terrified about money. Nothing was owed up front, and they fronted every cost. I could focus on healing while they fought.",
            author: "Devin M.",
            role: "Workplace injury client",
            rating: 5,
          },
        ],
      },
    },
    {
      type: "pricing",
      enabled: true,
      props: {
        eyebrow: "Our fees",
        title: "How we get paid — and how we don't",
        subtitle:
          "No retainer, no hourly billing, no invoices while your case is open. For injury cases, we only get paid if we win.",
        tiers: [
          {
            name: "Case Review",
            price: "$0",
            period: "consultation",
            description:
              "Sit down with an attorney — not an intake rep — and get a straight answer on whether you have a case.",
            features: [
              "No cost, no obligation",
              "You meet an actual attorney",
              "An honest read on your claim",
              "Evenings & weekends available",
            ],
            cta: { label: "Book your review", href: "#contact" },
          },
          {
            name: "Contingency",
            price: "No Fee",
            period: "unless we win",
            description:
              "You pay nothing up front. Our fee is a share of what we recover — and nothing at all if we don't win.",
            features: [
              "$0 out of pocket to start",
              "We advance all case costs",
              "Fee is a share of the recovery",
              "Nothing owed if we lose",
              "Terms agreed in writing first",
            ],
            cta: { label: "Start your claim", href: "#contact" },
            highlighted: true,
            badge: "How most cases work",
          },
          {
            name: "Flat-Fee Matters",
            price: "Flat Fee",
            period: "quoted upfront",
            description:
              "For select non-injury work — contracts, demand letters, and reviews — a clear flat fee, agreed before we start.",
            features: [
              "Fixed price in writing",
              "No hourly surprises",
              "Scope defined together",
              "Ideal for one-off matters",
            ],
            cta: { label: "Ask about flat fees", href: "#contact" },
          },
        ],
        note: "Contingency percentages and advanced costs are always spelled out in a written agreement before we begin. Every consultation is confidential.",
      },
    },
    {
      type: "faq",
      enabled: true,
      props: {
        eyebrow: "Common questions",
        title: "What people ask before they call",
        items: [
          {
            question: "How much does it cost to hire you?",
            answer:
              "For injury cases, nothing up front. We work on contingency: our fee is a percentage of what we recover for you, and if we don't win, you owe us no attorney's fee at all. The exact terms are always put in writing before we start.",
          },
          {
            question: "Do I actually have a case?",
            answer:
              "That's what the free consultation is for. Bring what you have — a police report, medical bills, photos, an insurer's offer letter — and an attorney will give you an honest read on whether it's worth pursuing. No charge, no obligation.",
          },
          {
            question: "How long will my case take?",
            answer:
              "It depends on the injuries and whether the other side is reasonable. Some cases resolve in months; those that go to trial can take a year or more. We push for the best result, not just the fastest one, and keep you posted at every stage.",
          },
          {
            question: "Will my case actually go to trial?",
            answer:
              "Most cases settle — but they settle for more when the other side knows we're prepared to try them. We build every case as if it's going in front of a jury. That readiness is our leverage.",
          },
          {
            question: "How long do I have to file a claim?",
            answer:
              "Every state sets a filing deadline, and it can be shorter than you'd expect — sometimes a year or two, and even less against a government entity. The sooner you call, the more options you have; waiting can cost you the case entirely.",
          },
        ],
      },
    },
    {
      type: "cta",
      enabled: true,
      props: {
        title: "Injured? The call is free — so is the advice.",
        description:
          "Talk to a trial attorney today. No fee unless we win, and no pressure, ever.",
        primaryCta: { label: "Get your free case review", href: "#contact" },
        secondaryCta: {
          label: "Call {phone}",
          href: "{phoneHref}",
        },
        variant: "band",
        backdrop: "rays",
      },
    },
    {
      type: "contact",
      enabled: true,
      props: {
        eyebrow: "Free case review",
        title: "Tell us what happened",
        subtitle: "Share a few details in confidence and an attorney will get back to you — usually the same day. If it's urgent, call us anytime at {phone}.",
        // Two channels configured: email and Telegram. Each is skipped without
        // its own environment variables (never stored here), so turning either
        // on later needs no code change. Covers the fr/ar overlays too — neither
        // declares its own `delivery`, so both inherit this by the translation
        // overlay's deep merge.
        delivery: { channels: ["email", "telegram"] },
        submitLabel: "Request my free review",
        successMessage:
          "Thank you — your message is confidential, and an attorney from Merrick & Stone will reach out shortly, usually within a few hours.",
        showBusinessInfo: true,
        fields: [
          { name: "name", label: "Full name", type: "text", required: true },
          { name: "phone", label: "Phone", type: "tel", required: true },
          { name: "email", label: "Email", type: "email" },
          {
            name: "matter",
            label: "Type of case",
            type: "select",
            required: true,
            placeholder: "Select a case type",
            options: [
              "Car or truck accident",
              "Medical malpractice",
              "Workplace injury",
              "Wrongful death",
              "Employment",
              "Something else",
            ],
          },
          { name: "incidentDate", label: "When did it happen?", type: "date" },
          {
            name: "message",
            label: "What happened?",
            type: "textarea",
            placeholder:
              "Share as much or as little as you'd like — anything you tell us is kept confidential.",
          },
        ],
      },
    },
    {
      type: "location",
      enabled: true,
      props: {
        eyebrow: "Our office",
        title: "Central Casablanca, steps from the courthouse",
        subtitle:
          "Parking validation available, and we make house and hospital calls when you can't come to us.",
        // address / phone / hours inherit from the global `business` block
        // (single source of truth). Set them here only to override — e.g. a
        // second office whose map differs from the main contact details.
      },
    },
    // Disabled: a trial firm leads with results and its attorneys, not a photo
    // gallery. Kept here to demonstrate per-client toggling — flip to `true`
    // (with images) to surface it with no other change.
    {
      type: "gallery",
      enabled: false,
      props: { title: "Gallery", images: [] },
    },
  ],
};

export default config;
