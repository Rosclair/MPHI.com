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
  }
];
