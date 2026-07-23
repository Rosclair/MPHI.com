/* MPHI — config centrale des pages.
   Chaque entrée pilote : le fichier de sortie, le <head> (titre, description,
   OG, robots, JSON-LD), la nav (barre + dropdown Admissions) et le plan du
   site du footer, et les scripts de données à charger.
   Ajouter une page = ajouter une entrée ici + un fichier dans src/pages/. */
"use strict";

module.exports = [
  {
    id: "contact",
    out: "contact.html",
    title: "Contact — MPHI · Bafoussam",
    description: "Contactez MPHI à Bafoussam : WhatsApp 655 99 69 13, téléphone 697 63 65 86, email et trois campus. Réponse rapide aux heures d'ouverture du secrétariat.",
    og: {
      title: "Contacter MPHI — Bafoussam",
      description: "WhatsApp, téléphone, email et trois campus dans Bafoussam. Posez votre question, le secrétariat vous répond rapidement.",
      image: "assets/og/accueil.jpg"
    },
    robots: null,
    jsonld: [
      {
        "@context": "https://schema.org",
        "@type": "EducationalOrganization",
        name: "Monga Polytechnic Higher Institute",
        alternateName: "MPHI",
        email: "mongahigherpolytechnicinstitute@gmail.com",
        contactPoint: [
          { "@type": "ContactPoint", contactType: "admissions", telephone: "+237697636586", availableLanguage: ["fr", "en"] },
          { "@type": "ContactPoint", contactType: "admissions", telephone: "+237655996913", availableLanguage: ["fr", "en"] }
        ],
        sameAs: [
          "https://www.facebook.com/MongaPolytechnic",
          "https://www.instagram.com/MongaPolytechnic"
        ]
      }
    ],
    navGroup: "principal",
    navLabel: "Contact",
    navSectionKey: "contact",
    inHeaderNav: true,
    dataScripts: []
  },
  {
    id: "admissions",
    out: "admissions.html",
    title: "Admissions — MPHI · Bafoussam",
    description: "Rejoindre MPHI à Bafoussam : DQP dès le BEPC, BTS dès le BAC, HND après le GCE A/L, Licence et Master en poursuite. Conditions, dossier en 7 pièces, bourse jusqu'à −50 %.",
    og: {
      title: "Admissions — rejoindre MPHI",
      description: "BEPC ou BAC : vous pouvez vous inscrire. Conditions par diplôme, dossier en 7 pièces, inscription en 4 temps, bourse jusqu'à −50 %.",
      image: "assets/og/accueil.jpg"
    },
    robots: null,
    jsonld: [],
    navGroup: "admissions",
    navLabel: "Vue d'ensemble",
    navSectionKey: "admissions",
    inHeaderNav: true,
    dataScripts: []
  },
  {
    id: "index",
    out: "index.html",
    title: "MPHI — Monga Polytechnic Higher Institute · Bafoussam",
    description: "Institut supérieur privé à Bafoussam : DQP, BTS, HND, Licence et Master professionnels. Une centaine de spécialités, 3 campus, inscriptions 2026-2027 ouvertes dès le BEPC ou le BAC.",
    og: {
      title: "MPHI · Former aujourd'hui, bâtir demain",
      description: "DQP, BTS, HND, Licence et Master professionnels à Bafoussam. Une centaine de spécialités, 3 campus. Inscriptions 2026-2027 ouvertes.",
      image: "assets/og/accueil.jpg"
    },
    robots: null,
    jsonld: [
      {
        "@context": "https://schema.org",
        "@type": "EducationalOrganization",
        name: "Monga Polytechnic Higher Institute",
        alternateName: "MPHI",
        slogan: "Former aujourd'hui, bâtir demain",
        email: "mongahigherpolytechnicinstitute@gmail.com",
        telephone: "+237697636586",
        address: [
          { "@type": "PostalAddress", streetAddress: "Campus A — Carrefour Saint-Thomas", addressLocality: "Bafoussam", addressRegion: "Ouest", addressCountry: "CM" },
          { "@type": "PostalAddress", streetAddress: "Campus B — Bocom Marché B", addressLocality: "Bafoussam", addressRegion: "Ouest", addressCountry: "CM" },
          { "@type": "PostalAddress", streetAddress: "Campus C — Entrée de la ville (Borne fontaine)", addressLocality: "Bafoussam", addressRegion: "Ouest", addressCountry: "CM" }
        ]
      }
    ],
    navGroup: "principal",
    navLabel: "Accueil",
    navSectionKey: null,
    inHeaderNav: false,
    dataScripts: []
  },
  {
    id: "campus",
    out: "campus.html",
    title: "Nos campus à Bafoussam — MPHI",
    description: "Les trois campus MPHI à Bafoussam : Carrefour Saint-Thomas, Bocom Marché B et l'entrée de la ville. Itinéraires, cartes et dépôt des dossiers d'inscription.",
    og: {
      title: "Nos campus à Bafoussam — MPHI",
      description: "Trois adresses dans Bafoussam, un secrétariat sur chaque site pour vos renseignements et le dépôt du dossier d'inscription.",
      image: "assets/og/accueil.jpg"
    },
    robots: null,
    jsonld: [],
    navGroup: "principal",
    navLabel: "Campus",
    navSectionKey: "campus",
    inHeaderNav: true,
    dataScripts: []
  },
  {
    id: "faq",
    out: "faq.html",
    title: "Questions fréquentes — MPHI · Bafoussam",
    description: "BEPC ou BAC, pièces du dossier, frais et bourse −50 %, permis offert, campus, rentrée : les réponses aux questions les plus posées sur MPHI Bafoussam.",
    og: {
      title: "Questions fréquentes — MPHI",
      description: "Inscription dès le BEPC ou le BAC, dossier en 7 pièces, bourse jusqu'à −50 %, permis offert : toutes les réponses.",
      image: "assets/og/accueil.jpg"
    },
    robots: null,
    jsonld: [
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: [
          { "@type": "Question", name: "Puis-je m'inscrire avec seulement le BEPC ?", acceptedAnswer: { "@type": "Answer", text: "Oui. Le BEPC ouvre le parcours DQP (diplôme de qualification professionnelle), combinable cette année en DQP + BTS en 2 ans." } },
          { "@type": "Question", name: "Puis-je m'inscrire avec le BAC ?", acceptedAnswer: { "@type": "Answer", text: "Oui : le BAC donne accès au BTS en 2 ans (environ 87 spécialités francophones), avec poursuite possible en Licence et Master professionnels." } },
          { "@type": "Question", name: "Quelles pièces composent le dossier d'inscription ?", acceptedAnswer: { "@type": "Answer", text: "Sept pièces : demande d'admission au directeur, fiche d'inscription, photocopies de la CNI et de l'acte de naissance, photocopie du diplôme requis, deux photos 4x4, reçu des frais d'inscription et un carton de format." } },
          { "@type": "Question", name: "Puis-je envoyer mon dossier par internet ?", acceptedAnswer: { "@type": "Answer", text: "Non, volontairement : aucun document ne transite en ligne. La préinscription en ligne réserve votre contact en deux minutes ; le dossier se dépose au secrétariat du campus." } },
          { "@type": "Question", name: "Combien coûte la formation ?", acceptedAnswer: { "@type": "Answer", text: "Les frais varient selon la formation et le diplôme préparé ; ils sont communiqués au secrétariat, avec un paiement en tranches." } },
          { "@type": "Question", name: "Comment obtenir la bourse de moins 50 % ?", acceptedAnswer: { "@type": "Answer", text: "La bourse de formation s'applique au moment de l'inscription, jusqu'à moins 50 %, selon les conditions en vigueur au secrétariat." } },
          { "@type": "Question", name: "Le permis de conduire est-il vraiment offert ?", acceptedAnswer: { "@type": "Answer", text: "Oui : le bonus permis de conduire s'active dès le paiement de la première tranche de scolarité, selon les conditions en vigueur au secrétariat." } },
          { "@type": "Question", name: "Vos diplômes sont-ils reconnus ?", acceptedAnswer: { "@type": "Answer", text: "Oui : les diplômes sont reconnus par l'État et l'institut est autorisé par le MINESUP (arrêté du 1er août 2023)." } }
        ]
      }
    ],
    navGroup: "admissions",
    navLabel: "Questions fréquentes",
    navSectionKey: "admissions",
    inHeaderNav: true,
    dataScripts: []
  },
  {
    id: "404",
    out: "404.html",
    title: "Page introuvable — MPHI · Bafoussam",
    description: "Cette page n'existe pas ou n'est pas encore en ligne. Retrouvez votre formation dans le catalogue MPHI ou écrivez-nous sur WhatsApp.",
    og: null,
    robots: "noindex",
    jsonld: [],
    navGroup: null,
    navLabel: null,
    navSectionKey: null,
    inHeaderNav: false,
    dataScripts: ["formations"]
  },
  {
    id: "dossier",
    out: "dossier.html",
    title: "Constitution du dossier d'inscription — MPHI · Bafoussam",
    description: "Les 7 pièces du dossier d'inscription MPHI : demande d'admission, fiche d'inscription, CNI et acte de naissance, diplôme, photos 4×4, reçu, carton. Cochez, imprimez, déposez au campus.",
    og: {
      title: "Constituer votre dossier d'inscription — MPHI",
      description: "Sept pièces, aucune surprise. La checklist officielle à cocher et à imprimer avant de déposer votre dossier au campus.",
      image: "assets/og/accueil.jpg"
    },
    robots: null,
    jsonld: [],
    navGroup: "admissions",
    navLabel: "Constitution du dossier",
    navSectionKey: "admissions",
    inHeaderNav: true,
    dataScripts: []
  },
  {
    id: "formations",
    out: "formations.html",
    title: "Formations et spécialités — MPHI · Bafoussam",
    description: "Le catalogue MPHI : une centaine de spécialités en BTS et HND à Bafoussam — génie civil, informatique, santé, gestion, hôtellerie, agriculture… Filtrez par diplôme et par filière.",
    og: {
      title: "Formations et spécialités — MPHI",
      description: "Une centaine de spécialités en BTS et HND à Bafoussam. Trouvez la vôtre et posez vos questions sur WhatsApp.",
      image: "assets/og/accueil.jpg"
    },
    robots: null,
    jsonld: [],
    navGroup: "principal",
    navLabel: "Formations",
    navSectionKey: "formations",
    inHeaderNav: true,
    dataScripts: ["formations"]
  }
];
