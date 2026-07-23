/* ============================================================
   MPHI — données des formations (source : brochure papier 2026)
   Fichier de données unique : catalogue, fiches, orienteur et
   sitemap se génèrent depuis cette structure.

   À VALIDER AVEC MPHI (atelier contenu) :
   [D-1] Filière STAPS : la brochure ne liste aucune spécialité —
         une entrée générique est créée en attendant.
   [D-2] Filière « Ingénierie et gestion de l'eau » : les intitulés
         imprimés se recoupent ; les 3 entrées reproduisent la
         brochure telle quelle.
   [D-3] Spécialités DQP : non listées sur la brochure (le parcours
         « DQP + BTS en 2 ans » suit les filières BTS). Le catalogue
         affiche un avis, pas une liste inventée.
   [D-4] Licence / Master : secteurs annoncés (volet anglais) mais
         aucune liste de spécialités — même traitement.
   [D-5] Campus d'enseignement par spécialité : information absente
         de la brochure — volontairement non affichée.
   ============================================================ */

(function () {
  "use strict";

  /* --- Filières ------------------------------------------------
     langue "fr" => cursus BTS (dès le BAC)
     langue "en" => cursus HND (after A/L or BAC)               */
  var FILIERES = [
    { slug: "gestion",              nom: "Gestion",                                      langue: "fr" },
    { slug: "staps",                nom: "Sciences et techniques des APS",               langue: "fr" },
    { slug: "arts-culture",         nom: "Arts et métiers de la culture",                langue: "fr" },
    { slug: "hotellerie-tourisme",  nom: "Tourisme, hôtellerie et restauration",         langue: "fr" },
    { slug: "medico-sanitaire",     nom: "Études médico-sanitaires",                     langue: "fr" },
    { slug: "agriculture-elevage",  nom: "Agriculture et élevage",                       langue: "fr" },
    { slug: "genie-civil",          nom: "Génie civil",                                  langue: "fr" },
    { slug: "genie-electrique",     nom: "Génie électrique",                             langue: "fr" },
    { slug: "reseaux-telecom",      nom: "Réseaux et télécommunication",                 langue: "fr" },
    { slug: "eau",                  nom: "Ingénierie et gestion de l'eau",               langue: "fr" },
    { slug: "genie-mecanique",      nom: "Génie mécanique et productique",               langue: "fr" },
    { slug: "genie-informatique",   nom: "Génie informatique",                           langue: "fr" },
    { slug: "commerce-vente",       nom: "Commerce et vente",                            langue: "fr" },
    { slug: "genie-biologique",     nom: "Génie biologique",                             langue: "fr" },
    { slug: "biomedical",           nom: "Sciences et techniques biomédicales",          langue: "fr" },
    { slug: "genie-chimie",         nom: "Génie chimie",                                 langue: "fr" },
    { slug: "economie-sociale",     nom: "Économie et entrepreneuriat social",           langue: "fr" },
    { slug: "management-en",        nom: "Management",                                   langue: "en" },
    { slug: "business-finance-en",  nom: "Business and finance",                         langue: "en" },
    { slug: "electrical-en",        nom: "Electrical and electronic engineering",        langue: "en" },
    { slug: "agric-food-en",        nom: "Agricultural and food sciences",               langue: "en" },
    { slug: "computer-en",          nom: "Computer engineering",                         langue: "en" },
    { slug: "home-economics-en",    nom: "Home economics and social work",               langue: "en" },
    { slug: "mechanical-en",        nom: "Mechanical engineering",                       langue: "en" },
    { slug: "tourism-en",           nom: "Tourism and hotel management",                 langue: "en" },
    { slug: "medical-en",           nom: "Medical and biomedical sciences",              langue: "en" }
  ];

  /* --- Spécialités par filière : [slug, nom] ------------------ */
  var SPECIALITES = {
    "gestion": [
      ["assistant-manager", "Assistant manager"],
      ["assurances", "Assurances"],
      ["banque-finance", "Banque et finance"],
      ["comptabilite-gestion-entreprises", "Comptabilité et gestion des entreprises"],
      ["gestion-ong", "Gestion des ONG"],
      ["gestion-projets", "Gestion des projets"],
      ["gestion-ressources-humaines", "Gestion des ressources humaines"],
      ["gestion-systemes-information", "Gestion des systèmes d'information"],
      ["gestion-logistique-transport", "Gestion logistique et transport"],
      ["management-sport", "Management du sport"],
      ["statistiques", "Statistiques"],
      ["fiscalite-collectivites", "Fiscalité des collectivités territoriales"],
      ["comptabilite-finances-publiques", "Comptabilité et finances publiques"],
      ["administration-collectivites", "Administration des collectivités territoriales"]
    ],
    "staps": [
      ["activites-physiques-sportives", "Sciences et techniques des activités physiques et sportives"]
    ],
    "arts-culture": [
      ["caricature-illustration-bd", "Caricature, illustration et bande dessinée"],
      ["design-mode", "Design de mode"],
      ["design-interieur", "Design d'intérieur"],
      ["design-produit", "Design produit"],
      ["dessin-anime", "Dessin animé"],
      ["infographie-web-design", "Infographie et web design"],
      ["management-evenementiel", "Management événementiel"],
      ["photographie-audiovisuel", "Photographie et audiovisuel"],
      ["industrie-habillement", "Industrie de l'habillement"]
    ],
    "hotellerie-tourisme": [
      ["gestion-management-hotelier", "Gestion et management hôtelier"],
      ["technique-hebergement", "Management et technique d'hébergement"],
      ["genie-culinaire", "Génie culinaire"],
      ["commercialisation-restauration", "Commercialisation et service de restauration"],
      ["management-touristique", "Management touristique"]
    ],
    "medico-sanitaire": [
      ["sage-femme", "Sage-femme"],
      ["sciences-infirmieres", "Sciences infirmières"],
      ["odontostomatologie", "Odontostomatologie"],
      ["kinesitherapie", "Kinésithérapie"],
      ["opticien-lunetier", "Opticien-lunetier"]
    ],
    "agriculture-elevage": [
      ["aquaculture", "Aquaculture"],
      ["production-vegetale", "Production végétale"],
      ["production-animale", "Production animale"],
      ["conseil-agropastoral", "Conseil agropastoral"],
      ["entrepreneuriat-agropastoral", "Entrepreneuriat agropastoral"]
    ],
    "genie-civil": [
      ["batiment", "Bâtiment"],
      ["travaux-publics", "Travaux publics"],
      ["geometrie-topographie", "Géométrie et topographie"],
      ["geotechnique-geologie", "Géotechnique et géologie appliquée"],
      ["menuiserie-ebenisterie", "Menuiserie et ébénisterie"],
      ["installation-sanitaire", "Installation sanitaire"]
    ],
    "genie-electrique": [
      ["electrotechnique", "Électrotechnique"],
      ["maintenance-systemes-electroniques", "Maintenance des systèmes électroniques"],
      ["maintenance-appareils-biomedicaux", "Maintenance des appareils biomédicaux"],
      ["maintenance-equipements-industriels", "Maintenance des équipements industriels"],
      ["controle-instrumentation-regulation", "Contrôle, instrumentation et régulation"]
    ],
    "reseaux-telecom": [
      ["reseaux-securite", "Réseaux et sécurité"],
      ["telecommunications", "Télécommunications"]
    ],
    "eau": [
      ["hydraulique-assainissement", "Hydraulique et assainissement des eaux"],
      ["traitement-eaux-assainissement", "Hydraulique, traitement des eaux et assainissement"],
      ["eau-potable-hydro-agricole", "Approvisionnement en eau potable et aménagement hydro-agricole"]
    ],
    "genie-mecanique": [
      ["chaudronnerie-soudure", "Chaudronnerie et soudure"],
      ["construction-metallique", "Construction métallique"],
      ["construction-mecanique", "Construction mécanique"],
      ["fabrication-mecanique", "Fabrication mécanique"],
      ["maintenance-apres-vente-automobile", "Maintenance et après-vente automobile"],
      ["maintenance-industrielle-productique", "Maintenance industrielle et productique"],
      ["mecatronique", "Mécatronique"],
      ["mecanique-navale", "Mécanique navale"],
      ["navigation-maritime", "Navigation maritime"],
      ["hygiene-securite-environnement", "Hygiène, sécurité et environnement"],
      ["gestion-administration-ports", "Gestion et administration des ports"]
    ],
    "genie-informatique": [
      ["informatique-industrielle-automatisme", "Informatique industrielle et automatisme"],
      ["maintenance-systemes-informatiques", "Maintenance des systèmes informatiques"],
      ["genie-logiciel", "Génie logiciel"],
      ["e-commerce-marketing-numerique", "E-commerce et marketing numérique"]
    ],
    "commerce-vente": [
      ["marketing", "Marketing"],
      ["commerce-et-vente", "Commerce et vente"],
      ["commerce-international", "Commerce international"]
    ],
    "genie-biologique": [
      ["analyses-biologiques-biochimiques", "Analyses biologiques et biochimiques"],
      ["biotechnologie", "Biotechnologie"],
      ["biotechnologie-agricole", "Biotechnologie agricole"],
      ["dietetique", "Diététique"],
      ["industries-alimentaires", "Industries alimentaires"],
      ["phytotherapie-aromatherapie", "Phytothérapie et aromathérapie"]
    ],
    "biomedical": [
      ["techniques-laboratoire", "Techniques de laboratoire"],
      ["radiologie-imagerie-medicale", "Radiologie et imagerie médicale"],
      ["techniques-pharmaceutiques", "Techniques pharmaceutiques"]
    ],
    "genie-chimie": [
      ["genie-chimique-procedes", "Génie chimique et des procédés"],
      ["chimie-generale", "Chimie générale"]
    ],
    "economie-sociale": [
      ["esthetique-cosmetique", "Esthétique-cosmétique"],
      ["coiffure", "Coiffure"],
      ["puericulture-gerontologie", "Puériculture et gérontologie"]
    ],
    "management-en": [
      ["human-resource-management", "Human resource management"]
    ],
    "business-finance-en": [
      ["accountancy", "Accountancy"],
      ["marketing-trade-sale", "Marketing, trade and sale"],
      ["insurance", "Insurance"]
    ],
    "electrical-en": [
      ["electrotechnics", "Electrotechnics"]
    ],
    "agric-food-en": [
      ["agro-pastoral-entrepreneurship", "Agro-pastoral entrepreneurship"]
    ],
    "computer-en": [
      ["software-engineering", "Software engineering"],
      ["e-commerce-digital-marketing", "E-commerce and digital marketing"]
    ],
    "home-economics-en": [
      ["bakery-food-processing", "Bakery and food processing"],
      ["fashion-clothing-textiles", "Fashion, clothing and textiles"],
      ["social-work", "Social work"],
      ["fashion-design", "Fashion design"]
    ],
    "mechanical-en": [
      ["mechanical-manufacturing", "Mechanical manufacturing"],
      ["metal-construction", "Metal construction"],
      ["boiler-making-welding", "Boiler making and welding"]
    ],
    "tourism-en": [
      ["hotel-management-catering", "Hotel management and catering"]
    ],
    "medical-en": [
      ["midwifery", "Midwifery (MID)"],
      ["nursing", "Nursing (NUS)"],
      ["physiotherapy", "Physiotherapy (PHY)"]
    ]
  };

  /* --- Construction de la liste à plat ------------------------ */
  var parSlug = {};
  FILIERES.forEach(function (f) { parSlug[f.slug] = f; });

  var liste = [];
  Object.keys(SPECIALITES).forEach(function (slugFiliere) {
    var filiere = parSlug[slugFiliere];
    SPECIALITES[slugFiliere].forEach(function (paire) {
      liste.push({
        slug: paire[0],
        nom: paire[1],
        filiere: filiere.slug,
        filiereNom: filiere.nom,
        langue: filiere.langue,
        diplome: filiere.langue === "fr" ? "bts" : "hnd",
        diplomeNom: filiere.langue === "fr" ? "BTS" : "HND",
        admission: filiere.langue === "fr" ? "Dès le BAC" : "After A/L or BAC"
      });
    });
  });

  window.MPHI_FORMATIONS = {
    filieres: FILIERES,
    specialites: liste
  };
})();
