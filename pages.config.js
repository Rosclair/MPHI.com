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
  }
];
