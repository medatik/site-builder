import type { SiteConfig } from "@/lib/types";

/**
 * VoltEdge Électricité — électriciens qualifiés, résidentiel et tertiaire.
 *
 * Identité : franche, contrastée, industrielle. Un fond graphite-marine avec un
 * ambre haute visibilité (sécurité / électricité) et un éclat cyan. La
 * typographie condensée (Barlow Condensed) et le préréglage « sharp » donnent
 * le ton technique, celui d'une entreprise de terrain. Ce qui compte pour ses
 * clients — être assuré et qualifié, intervenir vite, annoncer le prix
 * d'avance — passe en premier.
 *
 * Les numéros de téléphone appartiennent aux plages fictives réservées par
 * l'ARCEP (07 55 53 XX XX), l'équivalent français du 555-01XX américain.
 */
const config: SiteConfig = {
  client: "voltedge-electric",
  siteName: "VoltEdge Électricité",
  // FORME 1 sur 3 — logo en image. Les deux fichiers diffèrent réellement, ce
  // qui exerce la bascule par mode : les deux <img> sont rendues et le CSS
  // masque celle du mode inactif. Ce doit être du CSS et non du JS, car le
  // sélecteur de thème modifie `data-mode` sans re-rendre React.
  // (Riverside montre la forme 2 : monogramme + logotype. Merrick montre la
  // forme 3 : logotype seul.)
  logo: {
    alt: "VoltEdge Électricité",
    srcLight: "/logo/voltedge-electric/logo-light.svg",
    srcDark: "/logo/voltedge-electric/logo-dark.svg",
  },

  theme: {
    stylePreset: "sharp",
    defaultMode: "light",
    // Le mode sombre est la signature VoltEdge : ambre + cyan sur graphite.
    colorsDark: {
      primary: "#FFB020", // ambre haute visibilité
      secondary: "#12324F", // bleu acier profond
      accent: "#38D2F0", // éclat cyan
      background: "#0C1622", // graphite marine
      text: "#EAF1F8",
      muted: "#8DA2B8",
    },
    // Variante claire : même identité, mais le bleu acier passe devant (pour que
    // le texte sur `primary` reste lisible sur fond clair), l'ambre reste l'éclat.
    colorsLight: {
      primary: "#123E63", // bleu acier
      secondary: "#0C1622", // graphite
      // Assombri depuis #E8930A (2,27:1) pour respecter WCAG AA sur ce fond
      // presque blanc : `--accent` colore les étoiles de notation, qui portent
      // du sens et exigent donc 3:1 en tant que contenu non textuel. La palette
      // sombre garde l'éclat vif — #38D2F0 est déjà à 10,10:1 sur le graphite.
      accent: "#C17A08", // éclat ambre — 3,23:1 sur le fond
      background: "#F4F7FB", // blanc cassé froid
      text: "#0F1C2B", // encre graphite
      muted: "#566574",
    },
    fonts: {
      heading: "Barlow Condensed",
      body: "Inter",
    },
  },

  business: {
    phone: "+33 7 55 53 41 20",
    email: "contact@voltedge-electricite.fr",
    address: "18 rue de l'Industrie, 69007 Lyon",
    // Émis comme "@type" dans le JSON-LD. Le type schema.org le plus précis
    // devance le "LocalBusiness" par défaut pour le pack local et la recherche
    // « électricien près de chez moi ».
    schemaType: "Electrician",
    hours: [
      { days: "Lun – Ven", hours: "7h00 – 18h00" },
      { days: "Samedi", hours: "8h00 – 16h00" },
      { days: "Dimanche", hours: "Urgences uniquement" },
    ],
    socials: [
      { icon: "facebook", label: "Facebook", href: "https://facebook.com" },
      { icon: "instagram", label: "Instagram", href: "https://instagram.com" },
      { icon: "linkedin", label: "LinkedIn", href: "https://linkedin.com" },
    ],
  },

  // Explicite parce que les libellés déduits automatiquement (lib/nav.ts) sont
  // en anglais. Ce site ayant des pages routées, les ancres de la page d'accueil
  // sont préfixées par "/" — un "#services" nu ne ferait rien depuis /confidentialite.
  nav: [
    { label: "Prestations", href: "/#services" },
    { label: "Le cabinet", href: "/#about" },
    { label: "Réalisations", href: "/#gallery" },
    { label: "Tarifs", href: "/#pricing" },
    { label: "Avis", href: "/#testimonials" },
    { label: "FAQ", href: "/#faq" },
    { label: "Nous trouver", href: "/#location" },
    { label: "Contact", href: "/#contact" },
  ],

  header: {
    sticky: true,
    cta: {
      label: "Urgence 24h/24",
      href: "{phoneHref}",
      icon: "phone",
      variant: "primary",
    },
    // Les deux palettes sont définies plus haut : on propose donc le sélecteur
    // clair/sombre. Icônes par défaut lune (en clair) / soleil (en sombre) —
    // remplaçables via iconLight/iconDark.
    themeToggle: { enabled: true },
  },

  // Bouton WhatsApp flottant, épinglé en bas à droite. Entièrement configurable :
  // déplacez-le dans n'importe quel coin via `position`, changez l'icône et le
  // lien pour un autre canal, ou passez `enabled: false` pour le masquer.
  floatingButton: {
    enabled: true,
    href: "https://wa.me/33755534120",
    label: "Écrire sur WhatsApp",
    icon: "whatsapp",
    position: { x: "right", y: "bottom" },
  },

  footer: {
    tagline:
      "Qualifiés, assurés et joignables jour et nuit, pour les particuliers et les professionnels de la métropole lyonnaise.",
    legal: "Qualifelec E2 · RGE · Assurance décennale n° 1043927",
  },

  // Déclare la langue du site. Sans bloc `i18n`, `pickLocale` retombe sur "en"
  // et le document sort en `<html lang="en">` — un lecteur d'écran prononcerait
  // alors le français avec la phonétique anglaise, et les moteurs de recherche
  // se tromperaient de langue. Une seule locale suffit : le sélecteur reste
  // masqué, seule la langue du document est fixée.
  i18n: {
    defaultLocale: "fr",
    locales: [{ code: "fr", label: "Français", dir: "ltr" }],
    switcher: { enabled: false },
  },

  seo: {
    title: "VoltEdge Électricité — électriciens à Lyon, urgences 24h/24",
    description:
      "Travaux électriques résidentiels et tertiaires réalisés dans les règles de l'art. Mise aux normes de tableau, bornes de recharge, éclairage et dépannage 24h/24. Qualifiés, assurés, prix annoncé d'avance.",
    keywords: [
      "électricien",
      "électricien Lyon",
      "installation borne de recharge",
      "mise aux normes tableau électrique",
      "électricien urgence",
    ],
  },

  // Pages routées. `nav: false` sort la politique de l'en-tête et la place dans
  // la rangée légale du pied de page : accessible, sans concurrencer les
  // Prestations.
  //
  // La liste des destinataires ci-dessous DOIT correspondre aux canaux de
  // livraison réellement activés sur la section contact (Telegram), plus
  // l'hébergeur. Nommer un prestataire qui ne traite pas la donnée est aussi
  // faux qu'en omettre un qui la traite : si le canal change, ceci change aussi.
  pages: [
    {
      slug: "confidentialite",
      title: "Confidentialité",
      nav: false,
      seo: {
        title: "Politique de confidentialité — VoltEdge Électricité",
        description:
          "Comment VoltEdge Électricité traite les informations que vous nous transmettez via le formulaire de contact.",
      },
      sections: [
        {
          type: "legal",
          id: "privacy-body",
          enabled: true,
          props: {
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
                body: "Nous ne recueillons que ce que vous saisissez dans le formulaire de demande d'intervention, plus quelques informations techniques que votre navigateur envoie automatiquement.",
                bullets: [
                  "Vos nom et numéro de téléphone, nécessaires pour vous rappeler.",
                  "Votre adresse e-mail, si vous choisissez de la donner.",
                  "La prestation sélectionnée et ce que vous écrivez dans la description des travaux.",
                  "Votre adresse IP, utilisée pour limiter les envois automatisés abusifs et incluse dans la notification que nous recevons.",
                  "Les journaux de serveur habituels tenus par notre hébergeur, comme les pages demandées et l'heure de la demande.",
                ],
              },
              {
                heading: "Pourquoi nous les recueillons",
                body: "Nous utilisons votre demande uniquement pour vous recontacter au sujet des travaux électriques évoqués et pour les planifier. Nous ne vendons pas vos données et ne les utilisons ni à des fins publicitaires ni de profilage.",
              },
              {
                heading: "Qui d'autre y a accès",
                body: "Nous ne partageons vos données qu'avec les prestataires qui font fonctionner ce site et nous transmettent votre demande :",
                bullets: [
                  "Vercel, qui héberge ce site et conserve les journaux de serveur habituels.",
                  "Telegram, qui transmet votre demande sur le téléphone de notre régulateur.",
                ],
              },
              {
                heading: "Combien de temps nous les conservons",
                body: "Nous conservons les demandes d'intervention le temps nécessaire pour vous répondre et pour garder une trace des travaux réalisés, trace qui peut également nous être utile au titre de la garantie, de l'assurance et de nos qualifications. Ensuite, nous les supprimons. Si vous nous demandez de supprimer votre demande plus tôt, nous le ferons.",
              },
              {
                heading: "Vos droits",
                body: "Vous pouvez demander une copie des données que nous détenons sur vous, leur rectification ou leur suppression. Écrivez à {email} et nous vous répondrons. Si notre réponse ne vous satisfait pas, vous pouvez saisir la CNIL.",
              },
              {
                heading: "Cookies et stockage du navigateur",
                body: "Ce site ne dépose aucun cookie publicitaire ni de mesure d'audience. Si vous basculez le site entre les modes clair et sombre, ce choix est enregistré dans le stockage local de votre navigateur afin que la page n'affiche pas brièvement le mauvais thème à votre retour. Il reste sur votre appareil et ne nous est jamais transmis.",
              },
              {
                heading: "Modifications de cette politique",
                body: "Si nous changeons notre façon de traiter vos données, nous mettrons à jour cette page ainsi que la date indiquée en haut.",
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
        eyebrow: "Qualifiés · Assurés · 24h/24",
        title: "Une électricité",
        highlight: "sur laquelle compter.",
        subtitle:
          "D'une prise morte à la mise aux normes complète du tableau ou à la pose d'une borne de recharge — VoltEdge intervient en sécurité, dans les délais, et au prix annoncé avant de commencer.",
        bullets: [
          "Tarifs forfaitaires annoncés d'avance — aucune facture surprise",
          "Interventions le jour même et urgences 24h/24",
          "Chaque chantier couvert par notre garantie de bonne exécution",
        ],
        primaryCta: {
          label: "Appeler le {phone}",
          href: "{phoneHref}",
          icon: "phone",
        },
        secondaryCta: {
          label: "Demander un devis",
          href: "#contact",
          variant: "secondary",
        },
        badges: [
          "Qualifiés & assurés",
          "4,9★ · plus de 500 avis",
          "Prix annoncé d'avance",
        ],
        layout: "split",
        backdrop: "aurora",
        media: {
          alt: "Électricien VoltEdge intervenant sur un tableau électrique",
          src: "/photos/voltedge-electric/hero.9ce174d3.jpg",
        },
      },
    },
    {
      type: "services",
      enabled: true,
      props: {
        eyebrow: "Nos prestations",
        title: "Des travaux électriques conformes aux normes",
        subtitle:
          "De la rénovation complète d'une installation à un simple point lumineux qui clignote — la même équipe, les mêmes exigences.",
        columns: 3,
        items: [
          {
            icon: "house",
            title: "Installation résidentielle",
            description:
              "Rénovation d'installation, création de circuits, prises, interrupteurs et recherche de pannes, dans l'ancien comme dans le neuf.",
          },
          {
            icon: "gauge",
            title: "Mise aux normes du tableau",
            description:
              "Passage à un tableau conforme NF C 15-100, remplacement des tableaux vétustes et ajout de puissance pour les usages actuels.",
          },
          {
            icon: "plug-zap",
            title: "Bornes de recharge",
            description:
              "Pose de bornes de recharge à domicile — déclarées, dimensionnées après bilan de puissance, compatibles avec tous les véhicules.",
          },
          {
            icon: "lightbulb",
            title: "Conception d'éclairage",
            description:
              "Éclairage encastré, extérieur et d'accentuation, pensé à partir de l'usage réel de chaque pièce.",
          },
          {
            icon: "siren",
            title: "Dépannage d'urgence",
            description:
              "Coupure de courant, odeur de brûlé, disjoncteur qui saute — nous sommes joignables 24h/24 quand cela ne peut pas attendre.",
          },
          {
            icon: "power",
            title: "Groupes électrogènes",
            description:
              "Installation de groupes de secours, fixes ou mobiles, pour que la lumière reste allumée quand le réseau lâche.",
          },
        ],
      },
    },
    {
      type: "about",
      enabled: true,
      props: {
        eyebrow: "Pourquoi VoltEdge",
        title: "L'électricien que vous recommanderiez à vos parents",
        body: [
          "VoltEdge a démarré en 2009 avec une seule camionnette et une règle : traiter chaque logement comme le nôtre. Quinze ans plus tard, la règle n'a pas bougé — seule la taille de l'équipe a changé.",
          "Nous sommes qualifiés Qualifelec, couverts par une assurance décennale, et chaque intervenant jusqu'au dernier apprenti est identifié. Vous recevez un devis ferme avant que nous touchions au moindre fil, un chantier propre à notre départ, et une garantie qui signifie que nous revenons si quelque chose ne va pas.",
        ],
        highlights: [
          "Qualifelec E2 & assurance décennale",
          "Devis détaillés, annoncés d'avance",
          "Créneaux d'arrivée respectés",
          "Garantie de bonne exécution d'un an",
        ],
        stats: [
          { value: "15+", label: "Ans d'activité" },
          { value: "8 200+", label: "Chantiers réalisés" },
          { value: "4,9★", label: "Note moyenne" },
        ],
        mediaSide: "left",
        media: {
          src: "/photos/voltedge-electric/about.36f302ba.jpg",
          alt: "L'équipe VoltEdge et son véhicule d'intervention",
        },
      },
    },
    {
      type: "pricing",
      enabled: true,
      props: {
        eyebrow: "Des prix clairs",
        title: "Connaître le prix avant que nous commencions",
        subtitle:
          "Un forfait sur les interventions courantes, un devis écrit et ferme sur tout le reste. Pas de mauvaise surprise à l'heure.",
        tiers: [
          {
            name: "Déplacement diagnostic",
            price: "89 €",
            period: "par intervention",
            description:
              "Un électricien qualifié chez vous pour identifier la panne — montant déduit de la réparation.",
            features: [
              "Vérification complète de sécurité",
              "Diagnostic écrit",
              "Montant déduit des travaux",
              "Créneaux le jour même",
            ],
            cta: { label: "Réserver une intervention", href: "#contact" },
          },
          {
            name: "Mise aux normes du tableau",
            price: "à partir de 1 850 €",
            description:
              "Passage à un tableau conforme — démarches, main-d'œuvre et remise en état comprises.",
            features: [
              "Tableau et protections neufs",
              "Déclarations et contrôle pris en charge",
              "Bilan de puissance du logement",
              "Garantie de bonne exécution d'un an",
              "Paiement en plusieurs fois possible",
            ],
            cta: { label: "Demander un devis", href: "#contact" },
            highlighted: true,
            badge: "Le plus demandé",
          },
          {
            name: "Pose de borne de recharge",
            price: "à partir de 650 €",
            description:
              "Recharge à domicile, installée et déclarée par des professionnels qualifiés.",
            features: [
              "Circuit dédié 230 V",
              "Bilan de puissance et déclaration",
              "Compatible avec tous les véhicules",
              "Aide au montage du dossier de prime",
            ],
            cta: { label: "Demander un devis", href: "#contact" },
          },
        ],
        note: "Les devis sont toujours gratuits. Les tarifs d'urgence et de nuit diffèrent — nous vous les annonçons avant de nous déplacer.",
      },
    },
    {
      type: "gallery",
      enabled: true,
      props: {
        eyebrow: "Réalisations récentes",
        title: "Sorties de nos camionnettes ce mois-ci",
        columns: 3,
        images: [
          {
            src: "/photos/voltedge-electric/gallery-1.dd705410.jpg",
            alt: "Tableau électrique mis aux normes",
            label: "Tableau électrique",
            caption: "Mise aux normes complète du tableau — Croix-Rousse",
          },
          {
            src: "/photos/voltedge-electric/gallery-2.2a7d29f7.jpg",
            alt: "Pose d'éclairage encastré",
            label: "Éclairage encastré",
            caption: "Rénovation de l'éclairage d'une cuisine",
          },
          {
            src: "/photos/voltedge-electric/gallery-3.bc2f348e.jpg",
            alt: "Installation d'une borne de recharge",
            label: "Borne de recharge",
            caption: "Borne de recharge à domicile, 7,4 kW",
          },
          {
            src: "/photos/voltedge-electric/gallery-4.2611f525.jpg",
            alt: "Éclairage de locaux professionnels",
            label: "Tertiaire",
            caption: "Passage d'un entrepôt en LED — 40 % d'énergie économisée",
          },
          {
            src: "/photos/voltedge-electric/gallery-5.96cba473.jpg",
            alt: "Batteries et onduleur d'une alimentation de secours",
            label: "Alimentation de secours",
            caption: "Batteries et onduleur pour un logement entier",
          },
          {
            src: "/photos/voltedge-electric/gallery-6.5919ed75.jpg",
            alt: "Éclairage extérieur",
            label: "Extérieur",
            caption: "Éclairage extérieur en très basse tension",
          },
        ],
      },
    },
    {
      type: "testimonials",
      enabled: true,
      props: {
        eyebrow: "Avis clients",
        title: "Des voisins qui nous confient leur logement",
        items: [
          {
            quote:
              "Notre tableau datait d'une maison des années 1950 et a fini par lâcher. VoltEdge a annoncé un forfait, s'est occupé des démarches, et le courant était revenu le jour même. Travail impeccable.",
            author: "Marise T.",
            role: "Croix-Rousse, Lyon",
            rating: 5,
          },
          {
            quote:
              "J'ai appelé à 23h quand la moitié de la maison s'est retrouvée dans le noir. Un vrai électricien a répondu, m'a guidée pour sécuriser l'installation, et est passé dès le lendemain matin. Ils m'ont sauvée.",
            author: "Delphine K.",
            role: "Villeurbanne",
            rating: 5,
          },
          {
            quote:
              "Devis reçu le mardi, chantier terminé le jeudi, et le prix final était exactement celui du devis. C'est devenu assez rare pour être signalé.",
            author: "Olivier M.",
            role: "Caluire-et-Cuire",
            rating: 5,
          },
          {
            quote:
              "J'avais demandé trois devis pour une borne de recharge. VoltEdge est le seul à avoir fait un vrai bilan de puissance au lieu d'estimer au jugé. Pose soignée, prix juste.",
            author: "Priya S.",
            role: "Bron",
            rating: 5,
          },
        ],
      },
    },
    {
      type: "faq",
      enabled: true,
      props: {
        eyebrow: "Bon à savoir",
        title: "Les questions qui reviennent souvent",
        items: [
          {
            question: "Êtes-vous qualifiés et assurés ?",
            answer:
              "Oui — nous sommes qualifiés Qualifelec E2 et couverts par une assurance décennale (n° 1043927). Nous transmettons volontiers les attestations avant tout début de travaux.",
          },
          {
            question: "Assurez-vous réellement les urgences 24h/24 ?",
            answer:
              "Oui. C'est un véritable électricien — et non un centre d'appels — qui répond en dehors des heures ouvrées pour les urgences réelles : coupure de courant, odeur de brûlé, arc électrique. Les tarifs de nuit s'appliquent et nous vous les confirmons avant de nous déplacer.",
          },
          {
            question: "Sous quel délai pouvez-vous intervenir ?",
            answer:
              "La plupart des demandes non urgentes sont planifiées sous 1 à 2 jours ouvrés, et nous gardons des créneaux le jour même pour les situations pressantes. Les urgences sont traitées à toute heure.",
          },
          {
            question: "Les devis sont-ils payants ?",
            answer:
              "Les devis sur travaux planifiés — tableau électrique, borne de recharge, éclairage — sont toujours gratuits. Le déplacement diagnostic est facturé 89 €, montant déduit de la réparation si vous donnez suite.",
          },
          {
            question: "Garantissez-vous vos travaux ?",
            answer:
              "Chaque chantier bénéficie d'une garantie de bonne exécution d'un an, qui s'ajoute aux garanties des fabricants. Si quelque chose ne va pas, nous revenons et nous le reprenons.",
          },
        ],
      },
    },
    {
      type: "cta",
      enabled: true,
      props: {
        title: "Plus de courant ? Un disjoncteur qui refuse de se réarmer ?",
        description:
          "Nous sommes joignables 24h/24. Parlez tout de suite à un électricien qualifié.",
        primaryCta: {
          label: "Appeler le {phone}",
          href: "{phoneHref}",
          icon: "phone",
        },
        secondaryCta: {
          label: "Nous écrire sur WhatsApp",
          href: "https://wa.me/33755534120",
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
        eyebrow: "Nous contacter",
        title: "Demander une intervention ou un devis gratuit",
        subtitle:
          "Dites-nous ce qui se passe et nous revenons vers vous rapidement — en général dans l'heure pendant les heures ouvrées.",
        submitLabel: "Envoyer ma demande",
        successMessage:
          "Merci — un régulateur VoltEdge vous rappelle très vite. En cas d'urgence, appelez le {phone}.",
        showBusinessInfo: true,
        // Les demandes partent vers Telegram. Le jeton du bot et l'identifiant de
        // conversation sont des VARIABLES D'ENVIRONNEMENT sur Vercel
        // (TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID) — jamais ici. Le canal est
        // nommé explicitement plutôt que laissé à l'environnement seul, pour
        // rester cohérent avec le destinataire cité dans la politique de
        // confidentialité ci-dessus.
        delivery: { channels: ["telegram"] },
        fields: [
          { name: "name", label: "Nom et prénom", type: "text", required: true },
          { name: "phone", label: "Téléphone", type: "tel", required: true },
          { name: "email", label: "E-mail", type: "email" },
          {
            name: "service",
            label: "De quoi avez-vous besoin ?",
            type: "select",
            required: true,
            placeholder: "Choisissez une prestation",
            options: [
              "Dépannage d'urgence",
              "Mise aux normes du tableau",
              "Pose d'une borne de recharge",
              "Éclairage",
              "Groupe électrogène",
              "Autre demande",
            ],
          },
          {
            name: "message",
            label: "Décrivez les travaux",
            type: "textarea",
            placeholder: "ex. La moitié des prises de la cuisine ne fonctionnent plus…",
          },
        ],
      },
    },
    {
      type: "location",
      enabled: true,
      props: {
        eyebrow: "Zone d'intervention",
        title: "Basés à Lyon, au service de la métropole",
        subtitle:
          "Lyon, Villeurbanne, Caluire-et-Cuire, Bron, Vénissieux et les communes alentour.",
        address: "18 rue de l'Industrie, 69007 Lyon",
        phone: "+33 7 55 53 41 20",
        hours: [
          { days: "Lun – Ven", hours: "7h00 – 18h00" },
          { days: "Samedi", hours: "8h00 – 16h00" },
          { days: "Dimanche", hours: "Urgences uniquement" },
        ],
      },
    },
    // Désactivée : une petite équipe n'a pas besoin d'une page trombinoscope.
    // Conservée ici pour montrer l'interrupteur activer/désactiver — passez à
    // `true` pour la faire apparaître, sans aucune autre modification.
    {
      type: "team",
      enabled: false,
      props: {
        title: "L'équipe",
        members: [],
      },
    },
  ],
};

export default config;
