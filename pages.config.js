/* MPHI - config centrale des pages.
   Chaque entrée pilote : le fichier de sortie, le <head> (titre, description,
   OG, robots, JSON-LD), la nav (barre + dropdown Admissions) et le plan du
   site du footer, et les scripts de données à charger.
   Ajouter une page = ajouter une entrée ici + un fichier dans src/pages/. */
"use strict";

/* URL absolue de production (sans slash final), utilisée pour og:url,
   og:image, twitter:image et le sitemap - les crawlers WhatsApp/Facebook
   exigent des URLs absolues. À remplacer avant mise en ligne. */
var SITE_URL = "<URL_A_REMPLACER>";

/* JSON-LD BreadcrumbList pour les pages à fil d'Ariane statique (le fil
   affiché à l'écran ne remonte qu'à "Admissions", pas à l'accueil - la
   structured data reprend exactement ce même fil, pas plus). */
function breadcrumbJsonLd(fil) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: fil.map(function (etape, i) {
      return { "@type": "ListItem", position: i + 1, name: etape.name, item: SITE_URL + "/" + etape.out };
    })
  };
}

/* Couche de démonstration : bandeau fixé en bas de chaque page + page
   "a-propos-maquette.html". Visible uniquement sur ce déploiement, tant que
   MODE_DEMO vaut true - build.js n'injecte le bandeau et ne génère la page
   que si ce drapeau est vrai (voir buildBandeauDemo() et le push conditionnel
   plus bas). Le jour où le site devient celui de MPHI : passer cette ligne à
   false retire intégralement les deux du build, sans reste CSS ni JS actif
   (les blocs concernés testent la présence de leurs éléments avant d'agir). */
var MODE_DEMO = true;

/* Numéro WhatsApp personnel pour la couche démo (jamais un canal MPHI) -
   format attendu : "237XXXXXXXXX" (sans le +). Laissé vide : le bouton
   affiche un repère explicite au lieu d'un lien cassé. */
var NUMERO_WHATSAPP_DEMO = "";

/* Email personnel, optionnel - affiché sur a-propos-maquette.html s'il est renseigné. */
var EMAIL_DEMO = "";

var pages = [
  {
    id: "contact",
    out: "contact.html",
    title: "Contact - MPHI · Bafoussam",
    description: "Contactez MPHI à Bafoussam : WhatsApp 655 99 69 13, téléphone 697 63 65 86, email et trois campus. Réponse rapide aux heures d'ouverture du secrétariat.",
    og: {
      title: "Contacter MPHI - Bafoussam",
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
    dataScripts: []
  },
  {
    id: "admissions",
    out: "admissions.html",
    title: "Admissions - MPHI · Bafoussam",
    description: "Rejoindre MPHI à Bafoussam : DQP dès le BEPC, BTS dès le BAC, HND après le GCE A/L. Conditions par diplôme, dossier en 7 pièces, bourse jusqu'à −50 %.",
    og: {
      title: "Admissions - rejoindre MPHI",
      description: "BEPC ou BAC : vous pouvez vous inscrire. Conditions par diplôme, dossier en 7 pièces, inscription en 4 temps, bourse jusqu'à −50 %.",
      image: "assets/og/accueil.jpg"
    },
    robots: null,
    jsonld: [],
    navGroup: "admissions",
    navLabel: "Vue d'ensemble",
    navSectionKey: "admissions",
    dataScripts: []
  },
  {
    id: "index",
    out: "index.html",
    title: "MPHI - Monga Polytechnic Higher Institute · Bafoussam",
    description: "Institut supérieur privé à Bafoussam : DQP, BTS, HND, Licence et Master professionnels. Une centaine de spécialités, 3 campus. Inscriptions 2026-2027 ouvertes.",
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
          { "@type": "PostalAddress", streetAddress: "Campus A - Carrefour Saint-Thomas", addressLocality: "Bafoussam", addressRegion: "Ouest", addressCountry: "CM" },
          { "@type": "PostalAddress", streetAddress: "Campus B - Bocom Marché B", addressLocality: "Bafoussam", addressRegion: "Ouest", addressCountry: "CM" },
          { "@type": "PostalAddress", streetAddress: "Campus C - Entrée de la ville (Borne fontaine)", addressLocality: "Bafoussam", addressRegion: "Ouest", addressCountry: "CM" }
        ]
      }
    ],
    navGroup: "principal",
    navLabel: "Accueil",
    navSectionKey: null,
    dataScripts: []
  },
  {
    id: "campus",
    out: "campus.html",
    title: "Nos campus à Bafoussam - MPHI",
    description: "Les trois campus MPHI à Bafoussam : Carrefour Saint-Thomas, Bocom Marché B et l'entrée de la ville. Itinéraires, cartes et dépôt des dossiers d'inscription.",
    og: {
      title: "Nos campus à Bafoussam - MPHI",
      description: "Trois adresses dans Bafoussam, un secrétariat sur chaque site pour vos renseignements et le dépôt du dossier d'inscription.",
      image: "assets/og/accueil.jpg"
    },
    robots: null,
    jsonld: [],
    navGroup: "principal",
    navLabel: "Campus",
    navSectionKey: "campus",
    dataScripts: []
  },
  {
    id: "institut",
    out: "institut.html",
    title: "L'institut - MPHI · Bafoussam",
    description: "MPHI, institut privé d'enseignement supérieur autorisé par le MINESUP (arrêté du 1er août 2023) à Bafoussam : diplômes reconnus par l'État, 106 spécialités, 26 filières, 3 campus.",
    og: {
      title: "L'institut - MPHI",
      description: "Institut autorisé par le MINESUP, diplômes reconnus par l'État : ce qui fait la crédibilité de MPHI, en un coup d'œil.",
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
        description: "Institut privé d'enseignement supérieur autorisé par le MINESUP (arrêté du 1er août 2023), à Bafoussam, Cameroun. Diplômes reconnus par l'État : DQP, BTS, HND, Licence et Master professionnels.",
        email: "mongahigherpolytechnicinstitute@gmail.com",
        telephone: "+237697636586",
        address: [
          { "@type": "PostalAddress", streetAddress: "Campus A - Carrefour Saint-Thomas", addressLocality: "Bafoussam", addressRegion: "Ouest", addressCountry: "CM" },
          { "@type": "PostalAddress", streetAddress: "Campus B - Bocom Marché B", addressLocality: "Bafoussam", addressRegion: "Ouest", addressCountry: "CM" },
          { "@type": "PostalAddress", streetAddress: "Campus C - Entrée de la ville (Borne fontaine)", addressLocality: "Bafoussam", addressRegion: "Ouest", addressCountry: "CM" }
        ],
        sameAs: [
          "https://www.facebook.com/MongaPolytechnic",
          "https://www.instagram.com/MongaPolytechnic"
        ]
      }
    ],
    navGroup: "principal",
    navLabel: "L'institut",
    navSectionKey: "institut",
    dataScripts: []
  },
  {
    id: "faq",
    out: "faq.html",
    title: "Questions fréquentes - MPHI · Bafoussam",
    description: "BEPC ou BAC, pièces du dossier, frais et bourse −50 %, permis offert, campus, rentrée : les réponses aux questions les plus posées sur MPHI Bafoussam.",
    og: {
      title: "Questions fréquentes - MPHI",
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
    dataScripts: []
  },
  {
    id: "404",
    out: "404.html",
    title: "Page introuvable - MPHI · Bafoussam",
    description: "Cette page n'existe pas ou n'est pas encore en ligne. Retrouvez votre formation dans le catalogue MPHI ou écrivez-nous sur WhatsApp.",
    og: null,
    robots: "noindex",
    jsonld: [],
    navGroup: null,
    navLabel: null,
    navSectionKey: null,
    dataScripts: ["formations"]
  },
  {
    id: "dossier",
    out: "dossier.html",
    title: "Constitution du dossier d'inscription - MPHI · Bafoussam",
    description: "Les 7 pièces du dossier d'inscription MPHI : demande, fiche, CNI, acte de naissance, diplôme, photos 4×4, reçu, carton. Cochez, imprimez, déposez au campus.",
    og: {
      title: "Constituer votre dossier d'inscription - MPHI",
      description: "Sept pièces, aucune surprise. La checklist officielle à cocher et à imprimer avant de déposer votre dossier au campus.",
      image: "assets/og/accueil.jpg"
    },
    robots: null,
    jsonld: [breadcrumbJsonLd([
      { name: "Admissions", out: "admissions.html" },
      { name: "Constitution du dossier", out: "dossier.html" }
    ])],
    navGroup: "admissions",
    navLabel: "Constitution du dossier",
    navSectionKey: "admissions",
    dataScripts: []
  },
  {
    id: "formations",
    out: "formations.html",
    title: "Formations et spécialités - MPHI · Bafoussam",
    description: "Le catalogue MPHI : une centaine de spécialités en BTS et HND - génie civil, informatique, santé, gestion, hôtellerie... Filtrez par diplôme et par filière.",
    og: {
      title: "Formations et spécialités - MPHI",
      description: "Une centaine de spécialités en BTS et HND à Bafoussam. Trouvez la vôtre et posez vos questions sur WhatsApp.",
      image: "assets/og/accueil.jpg"
    },
    robots: null,
    jsonld: [],
    navGroup: "principal",
    navLabel: "Formations",
    navSectionKey: "formations",
    dataScripts: ["formations"]
  },
  {
    id: "fiche",
    out: "fiche.html",
    title: "Fiche formation - MPHI · Bafoussam",
    description: "Diplôme préparé, conditions d'admission, langue et inscription : la fiche complète de votre formation chez MPHI à Bafoussam.",
    og: {
      title: "Fiche formation - MPHI",
      description: "Diplôme préparé, conditions d'admission et inscription en 3 étapes. Posez vos questions sur WhatsApp.",
      image: "assets/og/accueil.jpg"
    },
    robots: null,
    jsonld: [],
    navGroup: null,
    navLabel: null,
    navSectionKey: "formations",
    dataScripts: ["formations"]
  },
  {
    id: "orienteur",
    out: "orienteur.html",
    title: "Test d'orientation - MPHI · Bafoussam",
    description: "Trois questions pour découvrir les spécialités MPHI qui correspondent à votre profil : niveau d'études, domaine et priorités. Résultat en une minute, à affiner avec le secrétariat.",
    og: {
      title: "Le test d'orientation - MPHI",
      description: "Niveau d'études, domaine, priorités : trois questions et quelques pistes de spécialités, à affiner avec le secrétariat.",
      image: "assets/og/accueil.jpg"
    },
    robots: null,
    jsonld: [],
    navGroup: null,
    navLabel: null,
    navSectionKey: "formations",
    dataScripts: ["formations"]
  },
  {
    id: "frais-et-bourses",
    out: "frais-et-bourses.html",
    title: "Frais et bourse de formation - MPHI · Bafoussam",
    description: "Frais d'inscription, scolarité en tranches, bourse jusqu'à −50 % et permis offert dès la première tranche : ce qui est sûr, et comment obtenir votre tarif.",
    og: {
      title: "Frais et bourse de formation - MPHI",
      description: "Bourse jusqu'à −50 % à l'inscription, permis de conduire dès la première tranche, paiement en tranches. Demandez le tarif de votre formation en un message.",
      image: "assets/og/accueil.jpg"
    },
    robots: null,
    jsonld: [breadcrumbJsonLd([
      { name: "Admissions", out: "admissions.html" },
      { name: "Frais et bourses", out: "frais-et-bourses.html" }
    ])],
    navGroup: "admissions",
    navLabel: "Frais et bourses",
    navSectionKey: "admissions",
    dataScripts: ["frais"]
  },
  {
    id: "calendrier",
    out: "calendrier.html",
    title: "Calendrier 2026-2027 - MPHI · Bafoussam",
    description: "Le parcours d'inscription MPHI étape par étape, et les dates officielles de la rentrée 2026-2027 publiées dès leur validation. Demandez les dates sur WhatsApp.",
    og: {
      title: "Calendrier 2026-2027 - MPHI",
      description: "De la préparation du dossier à la rentrée : votre chronologie d'inscription, et les dates officielles dès leur publication.",
      image: "assets/og/accueil.jpg"
    },
    robots: null,
    jsonld: [breadcrumbJsonLd([
      { name: "Admissions", out: "admissions.html" },
      { name: "Calendrier", out: "calendrier.html" }
    ])],
    navGroup: "admissions",
    navLabel: "Calendrier",
    navSectionKey: "admissions",
    dataScripts: ["calendrier"]
  },
  {
    id: "preinscription",
    out: "preinscription.html",
    title: "Préinscription 2026-2027 - MPHI · Bafoussam",
    description: "Préinscrivez-vous chez MPHI en deux minutes : nom, téléphone, formation visée. Aucun document ni paiement en ligne - le secrétariat vous recontacte rapidement.",
    og: {
      title: "Préinscription 2026-2027 - MPHI",
      description: "Deux minutes, aucun document : réservez votre place pour la rentrée, le secrétariat vous recontacte.",
      image: "assets/og/accueil.jpg"
    },
    robots: null,
    jsonld: [breadcrumbJsonLd([
      { name: "Admissions", out: "admissions.html" },
      { name: "Préinscription", out: "preinscription.html" }
    ])],
    navGroup: "admissions",
    navLabel: "Préinscription",
    navSectionKey: "admissions",
    dataScripts: ["formations"]
  },
  {
    id: "merci",
    out: "merci.html",
    title: "Merci - préinscription reçue · MPHI Bafoussam",
    description: "Votre préinscription MPHI est en route. Prochaine étape : préparer les sept pièces du dossier et le déposer au campus.",
    og: null,
    robots: "noindex",
    jsonld: [],
    navGroup: null,
    navLabel: null,
    navSectionKey: "admissions",
    dataScripts: ["formations"]
  },
  {
    id: "mentions-legales",
    out: "mentions-legales.html",
    title: "Mentions légales - MPHI · Bafoussam",
    description: "Éditeur du site MPHI, statut de l'institut autorisé par le MINESUP et informations d'hébergement.",
    og: null,
    robots: null,
    jsonld: [],
    navGroup: null,
    navLabel: "Mentions légales",
    navSectionKey: null,
    dataScripts: []
  },
  {
    id: "confidentialite",
    out: "confidentialite.html",
    title: "Confidentialité - MPHI · Bafoussam",
    description: "Quelles données le formulaire de préinscription MPHI collecte, ce qui n'est jamais collecté en ligne, et comment demander une suppression.",
    og: null,
    robots: null,
    jsonld: [],
    navGroup: null,
    navLabel: "Confidentialité",
    navSectionKey: null,
    dataScripts: []
  }
];

/* Page de la couche démo : ajoutée uniquement si MODE_DEMO est vrai, pour
   que le build ne la génère jamais quand le drapeau repasse à false. */
if (MODE_DEMO) {
  pages.push({
    id: "a-propos-maquette",
    out: "a-propos-maquette.html",
    title: "À propos de cette maquette - MPHI",
    description: "Ce que contient cette maquette du site MPHI, ce qui a été volontairement laissé vide, cinq points relevés dans la brochure, et ce qu'ajouterait la version complète.",
    og: null,
    robots: "noindex",
    jsonld: [],
    navGroup: null,
    navLabel: null,
    navSectionKey: null,
    dataScripts: []
  });
}

pages.SITE_URL = SITE_URL;
pages.MODE_DEMO = MODE_DEMO;
pages.NUMERO_WHATSAPP_DEMO = NUMERO_WHATSAPP_DEMO;
pages.EMAIL_DEMO = EMAIL_DEMO;
module.exports = pages;
