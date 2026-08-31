import type { SiteConfig } from "@/lib/types";

/**
 * Riverside Santé Familiale — cabinet de médecine générale et de soins primaires.
 *
 * Identité : calme, chaleureuse, rassurante — l'inverse du froid clinique. Un
 * fond blanc chaud, un vert-bleu apaisant en couleur principale et un corail
 * humain en accent. Typographie ronde et accueillante (Poppins + Nunito Sans)
 * avec le préréglage « soft » (grands rayons, ombres diffuses, respiration).
 * Ce qui compte pour les patients — être écouté, prendre rendez-vous
 * facilement, savoir qui l'on va voir — passe devant : les praticiens ont donc
 * leur propre section, et il n'y a ni tarifs ni galerie.
 *
 * Les numéros appartiennent aux plages fictives réservées par l'ARCEP
 * (05 36 49 XX XX).
 */
const config: SiteConfig = {
  client: "riverside-family-health",
  siteName: "Riverside Santé Familiale",
  // FORME 2 sur 3 — pastille monogramme + logotype. Sans image, le moteur
  // compose la marque à partir du thème : la pastille reprend le dégradé
  // primary → accent, le logotype reprend `siteName`.
  // (VoltEdge montre la forme 1 : une image par mode. Merrick montre la
  // forme 3 : le logotype seul.)
  logo: {
    alt: "Riverside Santé Familiale",
    monogram: "R",
  },

  theme: {
    stylePreset: "rounded",
    defaultMode: "light",
    // La palette sombre était auparavant une simple inversion RVB de la palette
    // claire. Elle passait tous les seuils de contraste, mais une inversion
    // mécanique ne conserve pas une identité : le vert-bleu apaisant devenait
    // rose, et un cabinet médical se retrouvait habillé comme une marque de
    // cosmétiques. Celle-ci est composée, pas calculée — mêmes teintes que le
    // mode clair, éclaircies pour un fond sombre. Toutes les valeurs sont
    // mesurées sur le fond ci-dessous.
    colorsDark: {
      primary: "#5EC5B5", // vert-bleu éclairci — 8,59:1 sur le fond
      secondary: "#2E8C7E", // vert-bleu profond — 4,38:1 (surfaces, non-texte)
      accent: "#E8927A", // corail chaud — 7,48:1, colore les étoiles (3:1 requis)
      background: "#0E1A18", // anthracite à nuance verte
      text: "#E8F1ED", // blanc cassé légèrement vert — 15,46:1
      muted: "#A3BBB4", // 8,75:1 sur le fond
    },
    // Assombrie le 04/08/2026 pour respecter WCAG AA. Les valeurs d'origine
    // passaient juste sous la barre : primary à 4,08:1 et muted à 4,37:1 sur ce
    // fond (AA exige 4,5), et accent à 2,53:1 alors que les étoiles de notation
    // qu'il colore exigent 3:1 en contenu non textuel. Mêmes teintes, quelques
    // pour cent plus sombres — mesuré, pas estimé à l'œil.
    colorsLight: {
      primary: "#117B6F", // vert-bleu apaisant — 4,88:1 sur le fond
      secondary: "#0B5A54", // bleu-vert profond
      accent: "#D36F57", // corail chaud — 3,23:1, utilisé pour les étoiles
      background: "#F6FAF8", // blanc chaud, nuance verte
      text: "#173430", // anthracite bleu-vert
      muted: "#58746E", // 4,82:1 sur le fond
    },
    fonts: {
      heading: "Poppins",
      body: "Nunito Sans",
    },
  },

  business: {
    phone: "+33 5 36 49 12 80",
    email: "contact@riverside-sante.fr",
    address: "12 avenue des Quais, 33000 Bordeaux",
    // Émis comme "@type" dans le JSON-LD. `MedicalClinic` convient à un cabinet
    // de groupe ; `Physician` décrirait un praticien seul.
    schemaType: "MedicalClinic",
    hours: [
      { days: "Lun – Ven", hours: "8h00 – 17h30" },
      { days: "Samedi", hours: "9h00 – 13h00" },
      { days: "Dimanche", hours: "Fermé" },
    ],
    socials: [
      { icon: "facebook", label: "Facebook", href: "https://facebook.com" },
      { icon: "instagram", label: "Instagram", href: "https://instagram.com" },
      { icon: "linkedin", label: "LinkedIn", href: "https://linkedin.com" },
    ],
  },

  // Un cabinet médical est le seul cas où ceci demande une vraie décision, pas
  // un réglage par défaut. WhatsApp n'offre aucune garantie sur l'hébergement
  // des données de santé : un patient qui y décrit ses symptômes place des
  // données sensibles hors du contrôle du cabinet. Le bouton pointe donc vers
  // `tel:` — même geste en un appui, aucune donnée de santé dans un historique
  // de conversation. Ne passez à un lien wa.me QUE si le cabinet l'a validé et
  // s'en tient à des réponses du type « merci de nous appeler ».
  floatingButton: {
    enabled: true,
    href: "{phoneHref}",
    label: "Appeler le cabinet",
    icon: "phone",
    variant: "primary",
    position: { x: "right", y: "bottom" },
  },

  // Explicite parce que les libellés déduits automatiquement (lib/nav.ts) sont
  // en anglais. Pas de page routée sur ce site : les ancres nues conviennent.
  nav: [
    { label: "Spécialités", href: "#services" },
    { label: "Le cabinet", href: "#about" },
    { label: "Équipe", href: "#team" },
    { label: "Témoignages", href: "#testimonials" },
    { label: "FAQ", href: "#faq" },
    { label: "Nous trouver", href: "#location" },
    { label: "Contact", href: "#contact" },
  ],

  header: {
    sticky: true,
    type: "centered",
    cta: {
      label: "Prendre rendez-vous",
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
      "Des soins primaires pour toute la famille, au cœur de Bordeaux — où l'on est une personne d'abord, un patient ensuite.",
    legal: "Cabinet conventionné secteur 1 · Tiers payant accepté",
    contactLabel: "Nous contacter",
    copyrightText: "© Tous droits réservés.",
    showHours: true,
  },

  // Site monolingue : `lang` suffit à fixer `<html lang="fr">`. Une première
  // version déclarait un bloc `i18n` d'une seule locale pour obtenir le même
  // résultat — mais `i18n` fait basculer TOUT le site en rendu dynamique (le
  // layout appelle `headers()`, la page attend `searchParams`), ce qui coûte le
  // rendu statique sans rien apporter quand il n'y a qu'une langue à choisir.
  lang: "fr",

  seo: {
    title:
      "Riverside Santé Familiale — médecine générale et soins primaires à Bordeaux",
    description:
      "Médecine générale, pédiatrie, santé de la femme et téléconsultation à Bordeaux. Rendez-vous le jour même, tiers payant accepté. Nouveaux patients bienvenus.",
    keywords: [
      "médecin généraliste Bordeaux",
      "soins primaires",
      "pédiatrie",
      "rendez-vous le jour même",
      "téléconsultation",
    ],
  },

  sections: [
    {
      type: "hero",
      enabled: true,
      props: {
        eyebrow: "Nous acceptons de nouveaux patients",
        title: "Une médecine qui",
        highlight: "écoute d'abord.",
        subtitle:
          "Des consultations sans précipitation, une équipe qui connaît votre nom, et des rendez-vous le jour même quand il le faut. Riverside, c'est la médecine de famille telle qu'elle devrait être.",
        bullets: [
          "Rendez-vous le jour même ou le lendemain",
          "Tiers payant et principales mutuelles acceptés",
          "Consultations au cabinet et téléconsultations sécurisées",
        ],
        primaryCta: {
          label: "Prendre rendez-vous",
          href: "#contact",
          icon: "calendar-check",
        },
        secondaryCta: {
          label: "Appeler le {phone}",
          href: "{phoneHref}",
          variant: "secondary",
        },
        badges: [
          "Praticiens diplômés",
          "4,9★ de satisfaction patients",
          "Conventionné secteur 1",
        ],
        // Bandeau plein cadre en rotation. Ce sont les `slides` qui s'affichent ;
        // les propriétés ci-dessus (bullets, badges, backdrop et le texte de
        // premier niveau) sont IGNORÉES par cette mise en page et conservées
        // uniquement pour que `layout: "split"` rétablisse l'ancien héros d'un
        // seul mot.
        layout: "slider",
        // Lent volontairement : un cabinet médical doit respirer le calme, pas la
        // promotion. La rotation se met en pause au survol, au focus clavier et
        // dans un onglet en arrière-plan, et elle est totalement désactivée pour
        // les visiteurs qui demandent une réduction des animations.
        autoplayMs: 7000,
        // Une diapositive par motif d'arrivée : nouveau patient, souffrant
        // aujourd'hui, ou empêché de se déplacer. Chacune porte son propre appel
        // à l'action : le carrousel fait donc un vrai travail au lieu de faire
        // tourner un même message sur des images qui changent. Les visiteurs
        // agissent bien davantage sur la première : le message le plus fort y
        // reste.
        slides: [
          {
            eyebrow: "Nous acceptons de nouveaux patients",
            title: "Une médecine qui",
            highlight: "écoute d'abord.",
            subtitle:
              "Des consultations sans précipitation, avec des praticiens diplômés qui connaissent votre nom. La médecine de famille telle qu'elle devrait être.",
            primaryCta: {
              label: "Prendre rendez-vous",
              href: "#contact",
              icon: "calendar-check",
            },
            secondaryCta: {
              label: "Appeler le {phone}",
              href: "{phoneHref}",
              variant: "secondary",
            },
            media: {
              src: "/photos/riverside-family-health/hero.05dbf5c3.jpg",
              alt: "Une salle d'examen du cabinet Riverside",
            },
            align: "start",
          },
          {
            eyebrow: "Vous ne vous sentez pas bien aujourd'hui ?",
            title: "Des rendez-vous le jour même,",
            highlight: "souvent en quelques heures.",
            subtitle:
              "Maux de gorge, infections, petites blessures et tout ce qui ne peut pas attendre la semaine prochaine. Tiers payant et principales mutuelles acceptés.",
            primaryCta: {
              label: "Consulter aujourd'hui",
              href: "#contact",
              icon: "calendar-check",
            },
            secondaryCta: {
              label: "Voir nos spécialités",
              href: "#services",
              variant: "secondary",
            },
            media: {
              src: "/photos/riverside-family-health/hero-2.eedc44f3.jpg",
              alt: "Un cabinet de consultation du centre Riverside",
            },
            align: "start",
          },
          {
            eyebrow: "Où que vous soyez",
            title: "La téléconsultation sécurisée",
            highlight: "quand vous ne pouvez pas venir.",
            subtitle:
              "Suivis, questions sur une ordonnance et conseils en visio, avec un cabinet conventionné que vous connaissez déjà.",
            primaryCta: {
              label: "Démarrer une téléconsultation",
              href: "#contact",
              icon: "video",
            },
            secondaryCta: {
              label: "Lire les témoignages",
              href: "#testimonials",
              variant: "secondary",
            },
            media: {
              src: "/photos/riverside-family-health/hero-3.5439ff7b.jpg",
              alt: "Une téléconsultation sécurisée avec un praticien Riverside",
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
        eyebrow: "Comment nous vous soignons",
        title: "Une prise en charge complète, au même endroit",
        subtitle:
          "Du premier examen de votre enfant au suivi des maladies chroniques — une équipe, un dossier, une relation.",
        columns: 3,
        items: [
          {
            icon: "heart-pulse",
            title: "Médecine générale",
            description:
              "Soins primaires à tout âge — examens de routine, maladies aiguës et tout ce qu'il y a entre les deux, avec un praticien qui connaît vos antécédents.",
          },
          {
            icon: "baby",
            title: "Pédiatrie",
            description:
              "Des soins doux et adaptés aux enfants, du suivi du nourrisson et des vaccins aux certificats scolaires et aux jours de fièvre.",
          },
          {
            icon: "flower",
            title: "Santé de la femme",
            description:
              "Suivi gynécologique, conseil en contraception et suivi de grossesse, dans un cadre confortable et sans jugement.",
          },
          {
            icon: "shield-check",
            title: "Prévention",
            description:
              "Dépistages, vaccinations et bilans de prévention pour repérer tôt et vous garder en bonne santé.",
          },
          {
            icon: "activity",
            title: "Maladies chroniques",
            description:
              "Un accompagnement coordonné et attentif pour le diabète, la tension, la thyroïde et les autres affections au long cours.",
          },
          {
            icon: "video",
            title: "Téléconsultation",
            description:
              "Des consultations vidéo sécurisées pour les suivis, les renouvellements d'ordonnance et les motifs simples — où que vous soyez.",
          },
        ],
      },
    },
    {
      type: "about",
      enabled: true,
      props: {
        eyebrow: "Notre approche",
        title: "Vous êtes une personne d'abord, un patient ensuite",
        body: [
          "Riverside est né d'un constat simple : la médecine avait cessé d'écouter. Nous avons construit un cabinet autour de consultations plus longues, de vraies relations, et de praticiens qui retiennent les détails qui comptent pour vous.",
          "Concrètement, vous voyez le plus souvent le même visage à chaque visite, vous repartez avec des réponses réellement compréhensibles, et vous n'avez jamais le sentiment qu'on vous pousse vers la porte. Une bonne médecine commence par une écoute.",
        ],
        highlights: [
          "Des consultations plus longues, sans précipitation",
          "Le même praticien à chaque visite",
          "Consultations le jour même en cas de maladie",
          "Orientations coordonnées et prélèvements sur place",
        ],
        stats: [
          { value: "25 000+", label: "Patients suivis" },
          { value: "12", label: "Praticiens au cabinet" },
          { value: "4,9★", label: "Satisfaction patients" },
        ],
        mediaSide: "right",
        media: {
          src: "/photos/riverside-family-health/about.2e1ddaca.jpg",
          alt: "La salle d'attente du cabinet Riverside",
        },
      },
    },
    {
      type: "team",
      enabled: true,
      props: {
        eyebrow: "Votre équipe soignante",
        title: "Les personnes que vous verrez vraiment",
        subtitle:
          "Diplômées, sincèrement bienveillantes, et là sur la durée.",
        columns: 3,
        members: [
          {
            name: "Dr Emma Ollivier",
            photo: {
              src: "/art/riverside-family-health/team-eo.svg",
              alt: "Dr Emma Ollivier",
            },
            role: "Médecine générale · Directrice médicale",
            credentials: "Docteure en médecine",
            bio: "Vingt ans de médecine générale, avec un faible pour la prévention et pour rendre un résultat d'analyse enfin compréhensible.",
          },
          {
            name: "Dr Mathieu Bernard",
            photo: {
              src: "/photos/riverside-family-health/team-mb.b1d02631.jpg",
              alt: "Dr Mathieu Bernard",
            },
            role: "Pédiatrie",
            credentials: "Pédiatre",
            bio: "Il fait rire même les tout-petits les plus inquiets. Développement, nutrition, et des parents rassurés.",
          },
          {
            name: "Dr Amina Reggani",
            photo: {
              src: "/art/riverside-family-health/team-ar.svg",
              alt: "Dr Amina Reggani",
            },
            role: "Santé de la femme",
            credentials: "Gynécologue obstétricienne",
            bio: "Un suivi bienveillant et fondé sur les preuves, à chaque étape — de l'adolescence à la ménopause.",
          },
          {
            name: "Nadia Chevalier, IPA",
            photo: {
              src: "/art/riverside-family-health/team-nc.svg",
              alt: "Nadia Chevalier, IPA",
            },
            role: "Infirmière en pratique avancée",
            credentials: "IPA, mention pathologies chroniques",
            bio: "Consultations du jour et suivi des maladies chroniques, avec le don de proposer des plans réellement tenables.",
          },
          {
            name: "Dr Jérôme Ollier",
            photo: {
              src: "/photos/riverside-family-health/team-jo.ef190cff.jpg",
              alt: "Dr Jérôme Ollier",
            },
            role: "Médecine interne",
            credentials: "Docteur en médecine",
            bio: "Il prend en charge les situations complexes, à plusieurs pathologies, avec patience et clarté.",
          },
          {
            name: "Perrine Naudin",
            photo: {
              src: "/art/riverside-family-health/team-pn.svg",
              alt: "Perrine Naudin",
            },
            role: "Diététicienne",
            credentials: "Diététicienne nutritionniste",
            bio: "Elle transforme « mangez mieux » en un plan compatible avec votre vraie vie, votre budget et votre cuisine.",
          },
        ],
      },
    },
    {
      type: "testimonials",
      enabled: true,
      props: {
        eyebrow: "Témoignages",
        title: "Des soins pour lesquels nos patients reviennent",
        items: [
          {
            quote:
              "Le premier cabinet où je ne me suis pas sentie être un numéro. La Dre Ollivier se souvenait vraiment de ce dont nous avions parlé la fois précédente, et elle a assuré le suivi. C'est rare.",
            author: "Camille M.",
            role: "Patiente depuis 2021",
            rating: 5,
          },
          {
            quote:
              "Mon fils est terrifié par les médecins, et le Dr Bernard a réussi à rendre sa visite amusante. Nous passons devant deux cabinets plus proches pour venir ici, et ça en vaut la peine.",
            author: "Thomas et Alice B.",
            role: "Parents de deux enfants",
            rating: 5,
          },
          {
            quote:
              "J'ai obtenu une téléconsultation le jour même pendant ma pause déjeuner, et mon ordonnance était prête avant que je retourne au bureau. Une médecine moderne qui reste humaine.",
            author: "Julien P.",
            role: "Patient en téléconsultation",
            rating: 5,
          },
        ],
      },
    },
    {
      type: "faq",
      enabled: true,
      props: {
        eyebrow: "Avant votre visite",
        title: "Les questions des nouveaux patients",
        items: [
          {
            question: "Acceptez-vous de nouveaux patients ?",
            answer:
              "Oui ! Nous accueillons actuellement de nouveaux patients de tous âges. Vous pouvez demander un rendez-vous via le formulaire ci-dessous, ou nous appeler et nous vous trouverons un créneau.",
          },
          {
            question: "Comment fonctionne la prise en charge ?",
            answer:
              "Le cabinet est conventionné secteur 1 : les tarifs sont ceux de l'Assurance Maladie, sans dépassement d'honoraires. Nous pratiquons le tiers payant sur la part obligatoire, et sur la part mutuelle pour la plupart des complémentaires. Munissez-vous de votre carte Vitale et de votre carte de mutuelle.",
          },
          {
            question: "Puis-je avoir un rendez-vous le jour même ?",
            answer:
              "Nous réservons chaque jour des créneaux pour les consultations urgentes et les motifs aigus. Appelez tôt le matin pour les meilleures disponibilités, ou faites une demande via le formulaire et nous trouverons l'ouverture la plus proche.",
          },
          {
            question: "Proposez-vous la téléconsultation ?",
            answer:
              "Oui. Des consultations vidéo sécurisées sont possibles pour les suivis, les renouvellements d'ordonnance et de nombreux motifs simples. Lors de votre demande de rendez-vous, indiquez simplement que vous préférez la téléconsultation.",
          },
          {
            question: "Que dois-je apporter à ma première visite ?",
            answer:
              "Merci d'apporter une pièce d'identité, votre carte Vitale et votre carte de mutuelle, la liste de vos traitements en cours, et tout compte rendu utile de vos précédents médecins. Arriver 15 minutes en avance nous laisse le temps de créer votre dossier.",
          },
        ],
      },
    },
    {
      type: "cta",
      enabled: true,
      props: {
        title: "Prêt à être enfin écouté ?",
        description:
          "La prise de rendez-vous prend environ une minute. Nous vous orientons vers le bon praticien et trouvons un horaire qui vous convient.",
        primaryCta: {
          label: "Prendre rendez-vous",
          href: "#contact",
          icon: "calendar-check",
        },
        secondaryCta: { label: "Appeler le cabinet", href: "{phoneHref}" },
        variant: "card",
        backdrop: "glow",
      },
    },
    {
      type: "contact",
      enabled: true,
      props: {
        eyebrow: "Rendez-vous",
        title: "Demander un rendez-vous",
        subtitle:
          "Donnez-nous quelques informations et le secrétariat vous rappelle pour confirmer un horaire. En cas d'urgence vitale, appelez le 15 (SAMU) ou le 112.",
        submitLabel: "Envoyer ma demande",
        successMessage:
          "Merci — le secrétariat vous appelle sous un jour ouvré pour confirmer votre rendez-vous.",
        showBusinessInfo: true,
        fields: [
          { name: "name", label: "Nom et prénom", type: "text", required: true },
          { name: "phone", label: "Téléphone", type: "tel", required: true },
          { name: "email", label: "E-mail", type: "email" },
          {
            name: "reason",
            label: "Motif de la consultation",
            type: "select",
            required: true,
            placeholder: "Choisissez un motif",
            options: [
              "Première consultation",
              "Bilan annuel",
              "Consultation pour maladie",
              "Consultation pédiatrique",
              "Santé de la femme",
              "Téléconsultation",
              "Autre motif",
            ],
          },
          { name: "preferred", label: "Date souhaitée", type: "date" },
          {
            name: "message",
            label: "Quelque chose à nous signaler ?",
            type: "textarea",
            placeholder:
              "Facultatif — dites-nous en quelques mots ce qui vous amène.",
          },
        ],
      },
    },
    {
      type: "location",
      enabled: true,
      props: {
        eyebrow: "Nous trouver",
        title: "Facile à trouver, facile à stationner",
        subtitle:
          "Sur les quais, avec un parking patients gratuit et un arrêt de tramway à une rue.",
        address: "12 avenue des Quais, 33000 Bordeaux",
        phone: "+33 5 36 49 12 80",
        hours: [
          { days: "Lun – Ven", hours: "8h00 – 17h30" },
          { days: "Samedi", hours: "9h00 – 13h00" },
          { days: "Dimanche", hours: "Fermé" },
        ],
      },
    },
    // Désactivées pour ce cabinet : les tarifs médicaux relèvent de la
    // convention, et une galerie photo n'est pas adaptée. Conservées ici pour
    // montrer l'activation/désactivation par client.
    { type: "pricing", enabled: false, props: { title: "Tarifs", tiers: [] } },
    {
      type: "gallery",
      enabled: false,
      props: {
        title: "Galerie",
        images: [
          {
            alt: "La salle d'attente de Riverside",
            src: "/art/riverside-family-health/gallery-1.svg",
          },
          {
            alt: "Un cabinet de consultation",
            src: "/art/riverside-family-health/gallery-2.svg",
          },
          {
            alt: "L'accueil du cabinet",
            src: "/art/riverside-family-health/gallery-3.svg",
          },
          {
            alt: "L'espace de prélèvements et de constantes",
            src: "/art/riverside-family-health/gallery-4.svg",
          },
          {
            alt: "Le coin des enfants",
            src: "/art/riverside-family-health/gallery-5.svg",
          },
          {
            alt: "L'entrée du bâtiment Riverside",
            src: "/art/riverside-family-health/gallery-6.svg",
          },
        ],
      },
    },
  ],
};

export default config;
