/* MPHI - comportements partagés (toutes les pages) */

/* Traçage de débogage additionnel (orienteur terminé, mode d'envoi de la
   préinscription, conversion sur merci.html) - à ne jamais activer en
   production ; distinct du point de branchement data-lead ci-dessous, qui
   reste actif partout puisqu'il alimente les futurs outils d'analytics. */
var MPHI_DEBUG = false;

/* Utilitaires communs à plusieurs pages - un seul point de vérité plutôt
   que des copies locales par page (recherche insensible aux accents/casse,
   lien WhatsApp pré-rempli pour une spécialité du catalogue). */
var MPHI_UTIL = (function () {
  "use strict";

  var marquesDiacritiques = new RegExp("[" + String.fromCharCode(0x0300) + "-" + String.fromCharCode(0x036f) + "]", "g");
  function normaliser(texte) {
    return String(texte).normalize("NFD").replace(marquesDiacritiques, "").toLowerCase();
  }

  function lienWhatsAppSpecialite(spec, source) {
    var message = "Bonjour MPHI, je souhaite des informations sur la spécialité "
      + spec.nom + " (" + spec.diplomeNom + ", filière " + spec.filiereNom + ")."
      + (source ? " (Depuis : " + source + ")" : "");
    return "https://wa.me/237655996913?text=" + encodeURIComponent(message);
  }

  return { normaliser: normaliser, lienWhatsAppSpecialite: lienWhatsAppSpecialite };
})();

(function () {
  "use strict";

  /* Menu mobile */
  var boutonMenu = document.getElementById("boutonMenu");
  var menu = document.getElementById("menu");
  if (boutonMenu && menu) {
    boutonMenu.addEventListener("click", function () {
      var ouvert = menu.classList.toggle("ouverte");
      boutonMenu.setAttribute("aria-expanded", ouvert ? "true" : "false");
    });
    menu.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        menu.classList.remove("ouverte");
        boutonMenu.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* Menu déroulant « Admissions » : replié par défaut, ouvert/fermé au clic
     sur le bouton, avec Échap (focus rendu au bouton) et clic extérieur pour
     refermer, et Haut/Bas pour naviguer entre ses liens - identique sur
     desktop (bulle flottante) et sur mobile (bloc dans le panneau). */
  var boutonAdmissions = document.getElementById("boutonAdmissions");
  var menuAdmissions = document.getElementById("menuAdmissions");
  if (boutonAdmissions && menuAdmissions) {
    var liensAdmissions = Array.prototype.slice.call(menuAdmissions.querySelectorAll("a"));
    var fermerAdmissions = function (rendreFocus) {
      menuAdmissions.classList.remove("ouverte");
      boutonAdmissions.setAttribute("aria-expanded", "false");
      if (rendreFocus) { boutonAdmissions.focus(); }
    };
    boutonAdmissions.addEventListener("click", function (e) {
      e.stopPropagation();
      var ouvert = menuAdmissions.classList.toggle("ouverte");
      boutonAdmissions.setAttribute("aria-expanded", ouvert ? "true" : "false");
    });
    document.addEventListener("click", function (e) {
      if (!e.target.closest(".nav-dropdown")) { fermerAdmissions(false); }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key !== "Escape") { return; }
      if (menuAdmissions.classList.contains("ouverte")) { fermerAdmissions(true); }
    });
    menuAdmissions.addEventListener("keydown", function (e) {
      if (e.key !== "ArrowDown" && e.key !== "ArrowUp") { return; }
      e.preventDefault();
      var position = liensAdmissions.indexOf(document.activeElement);
      var suivante = e.key === "ArrowDown"
        ? (position + 1) % liensAdmissions.length
        : (position - 1 + liensAdmissions.length) % liensAdmissions.length;
      liensAdmissions[suivante].focus();
    });
  }

  var reduireMouvement = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Ombre de l'en-tête au défilement, cadencée par requestAnimationFrame
     (un seul rappel par image, jamais un par événement scroll). */
  var entete = document.querySelector(".entete");
  var planifie = false;
  var majDefilement = function () {
    planifie = false;
    if (entete) { entete.classList.toggle("ombre", window.scrollY > 8); }
  };
  if (entete) {
    window.addEventListener("scroll", function () {
      if (!planifie) {
        planifie = true;
        window.requestAnimationFrame(majDefilement);
      }
    }, { passive: true });
    majDefilement();
  }

  /* Apparitions au défilement : légèrement anticipées (rootMargin) et mises
     en cascade entre éléments voisins d'un même conteneur (grilles de cartes,
     chiffres clés...) pour un effet de vague plutôt qu'un déclenchement
     groupé, tout en restant un seul déclenchement par élément. */
  var elements = Array.prototype.slice.call(document.querySelectorAll(".apparait"));
  if (!reduireMouvement && "IntersectionObserver" in window) {
    var rangsParConteneur = new WeakMap();
    var observateur = new IntersectionObserver(function (entrees) {
      entrees.forEach(function (entree) {
        if (!entree.isIntersecting) { return; }
        var cible = entree.target;
        var parent = cible.parentElement;
        var rang = rangsParConteneur.get(parent) || 0;
        rangsParConteneur.set(parent, rang + 1);
        cible.style.transitionDelay = Math.min(rang, 5) * 70 + "ms";
        cible.classList.add("visible");
        observateur.unobserve(cible);
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });
    elements.forEach(function (el) { observateur.observe(el); });
  } else {
    elements.forEach(function (el) { el.classList.add("visible"); });
  }

  /* Traçage des leads (WhatsApp, téléphone, CTA) - délégué :
     couvre aussi les éléments injectés dynamiquement (catalogue).
     Point de branchement unique pour un futur outil d'analytics. */
  document.addEventListener("click", function (e) {
    var lien = e.target.closest("[data-lead]");
    if (!lien) { return; }
    try {
      console.info("[MPHI lead]", lien.getAttribute("data-lead"), lien.href || "");
    } catch (err) { /* silencieux */ }
  });

  /* Année du pied de page */
  var annee = document.getElementById("annee");
  if (annee) { annee.textContent = String(new Date().getFullYear()); }
})();

/* Bandeau de démonstration - fermeture mémorisée pour la session en cours.
   N'existe (donc n'agit) que si MODE_DEMO est vrai côté build.js : sans
   #bandeauDemo dans la page, ce bloc ne fait rien. */
(function () {
  "use strict";

  var CLE_STOCKAGE = "mphi_demo_bandeau_ferme";
  var bandeau = document.getElementById("bandeauDemo");
  var boutonFermer = document.getElementById("bandeauDemoFermer");
  if (!bandeau || !boutonFermer) { return; }

  function estFerme() {
    try { return window.sessionStorage.getItem(CLE_STOCKAGE) === "1"; }
    catch (e) { return false; }
  }
  function memoriserFermeture() {
    try { window.sessionStorage.setItem(CLE_STOCKAGE, "1"); }
    catch (e) { /* stockage indisponible : le bandeau reste fonctionnel, juste non mémorisé */ }
  }

  if (estFerme()) {
    bandeau.hidden = true;
    document.body.classList.remove("a-bandeau-demo");
  }

  boutonFermer.addEventListener("click", function () {
    bandeau.hidden = true;
    document.body.classList.remove("a-bandeau-demo");
    memoriserFermeture();
  });
})();

/* campus.html - cartes Google Maps à la demande */
(function () {
  "use strict";

  /* Cartes Google Maps à la demande : on ne charge l'iframe qu'au clic. */
  document.querySelectorAll(".btn-carte").forEach(function (bouton) {
    bouton.addEventListener("click", function () {
      var zone = bouton.closest(".zone-carte");
      var requete = bouton.getAttribute("data-requete");
      var campus = bouton.getAttribute("data-campus");
      if (!zone || !requete) { return; }

      var cadre = document.createElement("iframe");
      cadre.src = "https://maps.google.com/maps?q=" + encodeURIComponent(requete) + "&z=16&output=embed";
      cadre.title = "Carte - Campus " + campus + " MPHI, Bafoussam";
      cadre.loading = "lazy";
      cadre.referrerPolicy = "no-referrer-when-downgrade";
      cadre.setAttribute("allowfullscreen", "");

      zone.innerHTML = "";
      zone.appendChild(cadre);
    });
  });
})();

/* faq.html - recherche instantanée, ancres profondes, tout déplier/replier */
(function () {
  "use strict";

  var champ = document.getElementById("rechercheFaq");
  var bascule = document.getElementById("basculeTout");
  var compte = document.getElementById("compteFaq");
  var vide = document.getElementById("faqVide");
  if (!champ || !bascule || !compte || !vide) { return; }

  var themes = Array.prototype.slice.call(document.querySelectorAll("[data-theme]"));
  var questions = Array.prototype.slice.call(document.querySelectorAll(".theme-faq details"));
  var total = questions.length;
  var programmatique = false;
  var normaliser = MPHI_UTIL.normaliser;

  /* ----- Ancres profondes : #id ouvre et défile ; ouvrir met à jour l'URL ----- */
  function ouvrirDepuisAncre() {
    var id = window.location.hash.replace("#", "");
    if (!id) { return; }
    var cible = document.getElementById(id);
    if (cible && cible.tagName === "DETAILS") {
      programmatique = true;
      cible.open = true;
      programmatique = false;
      cible.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }
  questions.forEach(function (q) {
    q.addEventListener("toggle", function () {
      if (programmatique) { return; }
      if (q.open) {
        window.history.replaceState(null, "", "#" + q.id);
      } else if (window.location.hash === "#" + q.id) {
        window.history.replaceState(null, "", window.location.pathname + window.location.search);
      }
    });
  });
  window.addEventListener("hashchange", ouvrirDepuisAncre);
  ouvrirDepuisAncre();

  /* ----- Recherche instantanée ----- */
  function filtrer() {
    var q = normaliser(champ.value.trim());
    var visibles = 0;
    programmatique = true;
    questions.forEach(function (question) {
      var texte = normaliser(question.textContent);
      var correspond = q.length < 2 || texte.indexOf(q) !== -1;
      question.hidden = !correspond;
      if (correspond) {
        visibles += 1;
        if (q.length >= 2) { question.open = true; }
      }
    });
    if (q.length < 2) {
      questions.forEach(function (question) { question.open = false; });
      ouvrirDepuisAncre();
    }
    programmatique = false;

    themes.forEach(function (theme) {
      var restantes = theme.querySelectorAll("details:not([hidden])").length;
      theme.hidden = restantes === 0;
    });

    vide.classList.toggle("visible", visibles === 0);
    if (q.length < 2) {
      compte.innerHTML = "<b>" + total + "</b> questions, cinq thèmes.";
    } else if (visibles === 0) {
      compte.innerHTML = "Aucune réponse trouvée.";
    } else {
      compte.innerHTML = "<b>" + visibles + "</b> réponse" + (visibles > 1 ? "s" : "") + " affichée" + (visibles > 1 ? "s" : "") + ".";
    }
    majBascule();
  }
  champ.addEventListener("input", filtrer);

  /* ----- Tout déplier / replier ----- */
  function majBascule() {
    var ouvertes = questions.filter(function (q) { return !q.hidden && q.open; }).length;
    var visibles = questions.filter(function (q) { return !q.hidden; }).length;
    bascule.textContent = (visibles > 0 && ouvertes === visibles) ? "Tout replier" : "Tout déplier";
  }
  bascule.addEventListener("click", function () {
    var visibles = questions.filter(function (q) { return !q.hidden; });
    var toutOuvrir = visibles.some(function (q) { return !q.open; });
    programmatique = true;
    visibles.forEach(function (q) { q.open = toutOuvrir; });
    programmatique = false;
    majBascule();
  });

  filtrer();
})();

/* 404.html - page prévue reconnue depuis l'URL + recherche instantanée */
(function () {
  "use strict";

  var titre404 = document.getElementById("titre404");
  if (!titre404) { return; }

  /* ----- Pages prévues (Lots 2-3) : retirer chaque entrée à sa livraison ----- */
  var PAGES_PREVUES = {
    "institut": {
      titre: "La présentation de l'institut arrive",
      texte: "Autorisation MINESUP, campus, chiffres clés : l'essentiel est déjà sur la page d'accueil.",
      cta: { texte: "Retour à l'accueil", href: "index.html" }
    },
    "mentions-legales": {
      titre: "Les mentions légales arrivent",
      texte: "Cette page sera publiée avec la mise en ligne officielle du site.",
      cta: { texte: "Retour à l'accueil", href: "index.html" }
    },
    "confidentialite": {
      titre: "La politique de confidentialité arrive",
      texte: "Cette page sera publiée avec la mise en ligne officielle du site.",
      cta: { texte: "Retour à l'accueil", href: "index.html" }
    }
  };

  /* ----- Détecter la page demandée (fonctionne une fois hébergé) ----- */
  var segments = window.location.pathname.split("/").filter(function (s) { return s !== ""; });
  var dernier = segments.length ? segments[segments.length - 1] : "";
  var nomPage = dernier.replace(/\.html?$/i, "").toLowerCase();
  var prevue = Object.prototype.hasOwnProperty.call(PAGES_PREVUES, nomPage) ? PAGES_PREVUES[nomPage] : null;

  if (prevue) {
    document.getElementById("pilule").hidden = false;
    titre404.textContent = prevue.titre;
    document.getElementById("texte404").textContent = prevue.texte;
    var cta = document.getElementById("cta404");
    cta.textContent = prevue.cta.texte;
    cta.href = prevue.cta.href;
    if (prevue.cta.href.indexOf("https://wa.me/") === 0) { cta.setAttribute("rel", "noopener"); }
    cta.setAttribute("data-lead", "404-prevu-" + nomPage);
    document.title = prevue.titre + " - MPHI · Bafoussam";
  }

  /* ----- Recherche instantanée dans les formations ----- */
  var donnees = window.MPHI_FORMATIONS;
  var bloc = document.getElementById("blocRecherche");
  if (donnees && bloc) {
    bloc.hidden = false;
    var champ = document.getElementById("recherche404");
    var zone = document.getElementById("suggestions404");
    var aucune = document.getElementById("aucune404");

    var normaliser = MPHI_UTIL.normaliser;

    champ.addEventListener("input", function () {
      var q = normaliser(champ.value.trim());
      zone.innerHTML = "";
      aucune.hidden = true;
      if (q.length < 2) { return; }

      var resultats = donnees.specialites.filter(function (s) {
        return normaliser(s.nom + " " + s.filiereNom).indexOf(q) !== -1;
      }).slice(0, 6);

      if (resultats.length === 0) { aucune.hidden = false; return; }

      resultats.forEach(function (s) {
        var lien = document.createElement("a");
        lien.className = "suggestion";
        lien.href = "fiche.html?f=" + encodeURIComponent(s.slug);
        lien.setAttribute("data-lead", "404-suggestion");
        var nom = document.createElement("b");
        nom.textContent = s.nom;
        if (s.langue === "en") { nom.lang = "en"; }
        var meta = document.createElement("small");
        meta.textContent = s.diplomeNom + " · " + s.filiereNom;
        lien.appendChild(nom);
        lien.appendChild(meta);
        zone.appendChild(lien);
      });
    });
  }
})();

/* dossier.html - checklist persistée (localStorage) + impression */
(function () {
  "use strict";

  var CLE_STOCKAGE = "mphi_dossier_v1";
  var cases = Array.prototype.slice.call(document.querySelectorAll(".piece input[type=checkbox]"));
  var puces = Array.prototype.slice.call(document.querySelectorAll(".profil .chip"));
  var compte = document.getElementById("comptePieces");
  var barre = document.getElementById("jaugeBarre");
  var toutDecocher = document.getElementById("toutDecocher");
  var titreDiplome = document.getElementById("pieceDiplomeTitre");
  var noteDiplome = document.getElementById("pieceDiplomeNote");
  var boutonImprimer = document.getElementById("imprimer");
  var dateImpression = document.getElementById("dateImpression");
  if (!compte || !barre || !toutDecocher || !boutonImprimer) { return; }

  var TEXTES_DIPLOME = {
    dqp:     { titre: "Photocopie du BEPC", note: "Le parcours DQP est accessible dès le BEPC." },
    bts:     { titre: "Photocopie du BAC", note: "Le BTS est accessible dès le BAC." },
    hnd:     { titre: "Photocopie du GCE A/L ou du BAC", note: "Cursus anglophone HND." },
    indecis: { titre: "Photocopie du diplôme requis", note: "Selon la formation visée : BEPC (DQP), BAC (BTS) ou GCE A/L (HND)." }
  };

  var etat = { profil: "indecis", pieces: [] };

  /* ----- Stockage local, toujours protégé ----- */
  function lireStockage() {
    try {
      var brut = window.localStorage.getItem(CLE_STOCKAGE);
      return brut ? JSON.parse(brut) : null;
    } catch (e) { return null; }
  }
  function ecrireStockage() {
    try {
      window.localStorage.setItem(CLE_STOCKAGE, JSON.stringify(etat));
    } catch (e) { /* stockage indisponible : la page reste fonctionnelle */ }
  }

  /* ----- État initial : stockage puis paramètre d'URL ----- */
  (function initialiser() {
    var sauvegarde = lireStockage();
    if (sauvegarde) {
      if (TEXTES_DIPLOME[sauvegarde.profil]) { etat.profil = sauvegarde.profil; }
      if (Array.isArray(sauvegarde.pieces)) { etat.pieces = sauvegarde.pieces; }
    }
    var profilURL = new URLSearchParams(window.location.search).get("profil");
    if (profilURL && TEXTES_DIPLOME[profilURL]) { etat.profil = profilURL; }
  })();

  function synchroniserURL() {
    var url = window.location.pathname
      + (etat.profil !== "indecis" ? "?profil=" + etat.profil : "");
    window.history.replaceState(null, "", url);
  }

  /* ----- Rendu ----- */
  function rendre() {
    puces.forEach(function (puce) {
      puce.setAttribute("aria-pressed", puce.getAttribute("data-profil") === etat.profil ? "true" : "false");
    });
    var textes = TEXTES_DIPLOME[etat.profil];
    titreDiplome.textContent = textes.titre;
    noteDiplome.textContent = textes.note;

    var total = cases.length;
    var prets = 0;
    cases.forEach(function (caseCoche) {
      var cochee = etat.pieces.indexOf(caseCoche.getAttribute("data-piece")) !== -1;
      caseCoche.checked = cochee;
      caseCoche.closest(".piece").classList.toggle("prete", cochee);
      if (cochee) { prets += 1; }
    });

    compte.innerHTML = "<b>" + prets + "</b>/" + total + " pièces prêtes";
    barre.style.width = (prets / total * 100) + "%";
    toutDecocher.hidden = prets === 0;
  }

  /* ----- Écouteurs ----- */
  cases.forEach(function (caseCoche) {
    caseCoche.addEventListener("change", function () {
      var id = caseCoche.getAttribute("data-piece");
      var position = etat.pieces.indexOf(id);
      if (caseCoche.checked && position === -1) { etat.pieces.push(id); }
      if (!caseCoche.checked && position !== -1) { etat.pieces.splice(position, 1); }
      rendre();
      ecrireStockage();
    });
  });

  puces.forEach(function (puce) {
    puce.addEventListener("click", function () {
      etat.profil = puce.getAttribute("data-profil");
      rendre();
      ecrireStockage();
      synchroniserURL();
    });
  });

  toutDecocher.addEventListener("click", function () {
    etat.pieces = [];
    rendre();
    ecrireStockage();
  });

  boutonImprimer.addEventListener("click", function () { window.print(); });

  /* ----- Date sur la version imprimée ----- */
  if (dateImpression) {
    try {
      dateImpression.textContent = new Date().toLocaleDateString("fr-FR",
        { day: "numeric", month: "long", year: "numeric" });
    } catch (e) {
      dateImpression.textContent = new Date().toISOString().slice(0, 10);
    }
  }

  rendre();
  synchroniserURL();
})();

/* formations.html - catalogue filtrable (recherche, diplôme, filière) */
(function () {
  "use strict";

  var donnees = window.MPHI_FORMATIONS;
  var grille = document.getElementById("grille");
  var vide = document.getElementById("vide");
  var avis = document.getElementById("avis");
  var compte = document.getElementById("compte");
  var champRecherche = document.getElementById("recherche");
  var selectFiliere = document.getElementById("filiere");
  var boutonRaz = document.getElementById("raz");
  var chips = Array.prototype.slice.call(document.querySelectorAll(".chip"));

  if (!donnees || !grille) { return; }

  var etat = { q: "", diplome: "tous", filiere: "toutes" };

  /* ----- Utilitaires ----- */
  var normaliser = MPHI_UTIL.normaliser;
  function lienWhatsApp(spec) { return MPHI_UTIL.lienWhatsAppSpecialite(spec, "Catalogue des formations"); }

  /* ----- Remplir le sélecteur de filières ----- */
  (function remplirFilieres() {
    var groupeFr = document.createElement("optgroup");
    groupeFr.label = "Filières BTS (francophone)";
    var groupeEn = document.createElement("optgroup");
    groupeEn.label = "HND fields (anglophone)";
    donnees.filieres.forEach(function (f) {
      var option = document.createElement("option");
      option.value = f.slug;
      option.textContent = f.nom;
      (f.langue === "fr" ? groupeFr : groupeEn).appendChild(option);
    });
    selectFiliere.appendChild(groupeFr);
    selectFiliere.appendChild(groupeEn);
  })();

  /* ----- Lecture des paramètres d'URL (liens depuis l'accueil) ----- */
  (function lireURL() {
    var params = new URLSearchParams(window.location.search);
    var d = params.get("diplome");
    var f = params.get("filiere") || params.get("domaine");
    var q = params.get("q");
    if (d && ["tous", "bts", "hnd", "dqp", "licence-master"].indexOf(d) !== -1) { etat.diplome = d; }
    if (f && donnees.filieres.some(function (x) { return x.slug === f; })) { etat.filiere = f; }
    if (q) { etat.q = q; }
  })();

  /* ----- Synchroniser l'interface avec l'état ----- */
  function synchroniserUI() {
    champRecherche.value = etat.q;
    selectFiliere.value = etat.filiere;
    chips.forEach(function (chip) {
      chip.setAttribute("aria-pressed", chip.getAttribute("data-diplome") === etat.diplome ? "true" : "false");
    });
  }

  function synchroniserURL() {
    var params = new URLSearchParams();
    if (etat.q) { params.set("q", etat.q); }
    if (etat.diplome !== "tous") { params.set("diplome", etat.diplome); }
    if (etat.filiere !== "toutes") { params.set("filiere", etat.filiere); }
    var chaine = params.toString();
    var url = window.location.pathname + (chaine ? "?" + chaine : "");
    window.history.replaceState(null, "", url);
  }

  /* ----- Avis contextuels (DQP, Licence/Master) ----- */
  function majAvis() {
    if (etat.diplome === "dqp") {
      avis.innerHTML = "<p><strong>Parcours DQP</strong> - accessible dès le BEPC, il suit les mêmes filières que le BTS ci-dessous, et se combine en «&nbsp;DQP&nbsp;+&nbsp;BTS en 2&nbsp;ans&nbsp;». La liste exacte des spécialités DQP est confirmée au secrétariat. <a href=\"admissions.html\">Voir les admissions</a></p>";
      avis.classList.add("visible");
    } else if (etat.diplome === "licence-master") {
      avis.innerHTML = "<p><strong>Licence et Master professionnels</strong> - ils prolongent les BTS et HND ci-dessous. Programme détaillé et conditions d'accès au secrétariat, ou <a href=\"https://wa.me/237655996913?text=Bonjour%20MPHI%2C%20je%20souhaite%20des%20informations%20sur%20vos%20Licences%20et%20Masters%20professionnels.%20(Depuis%20%3A%20Catalogue%20des%20formations)\" data-lead=\"avis-lm-whatsapp\" rel=\"noopener\">sur WhatsApp</a>.</p>";
      avis.classList.add("visible");
    } else {
      avis.innerHTML = "";
      avis.classList.remove("visible");
    }
  }

  /* ----- Filtrage ----- */
  function filtrer() {
    var q = normaliser(etat.q.trim());
    return donnees.specialites.filter(function (spec) {
      if (etat.diplome === "bts" || etat.diplome === "dqp") {
        if (spec.diplome !== "bts") { return false; }
      } else if (etat.diplome === "hnd") {
        if (spec.diplome !== "hnd") { return false; }
      }
      /* "tous" et "licence-master" : pas de restriction de diplôme */
      if (etat.filiere !== "toutes" && spec.filiere !== etat.filiere) { return false; }
      if (q) {
        var cible = normaliser(spec.nom + " " + spec.filiereNom + " " + spec.diplomeNom);
        if (cible.indexOf(q) === -1) { return false; }
      }
      return true;
    });
  }

  /* ----- Rendu ----- */
  function carteHTML(spec) {
    var badgeLangue = spec.langue === "en"
      ? "<li class=\"badge badge-en\">English</li>"
      : "<li class=\"badge\">Français</li>";
    var langAttr = spec.langue === "en" ? " lang=\"en\"" : "";
    return "<article class=\"carte carte-spec\">"
      + "<p class=\"filiere-nom\">" + spec.filiereNom + "</p>"
      + "<h3" + langAttr + ">" + spec.nom + "</h3>"
      + "<ul class=\"badges\">"
      + "<li class=\"badge badge-dip\">" + spec.diplomeNom + "</li>"
      + "<li class=\"badge\">" + spec.admission + "</li>"
      + badgeLangue
      + "</ul>"
      + "<p class=\"actions\">"
      + "<a class=\"details\" href=\"fiche.html?f=" + spec.slug + "\">Détails</a>"
      + "<a class=\"btn btn-plein btn-wa\" rel=\"noopener\" data-lead=\"catalogue-wa-" + spec.slug + "\" href=\"" + lienWhatsApp(spec) + "\">"
      + "<svg viewBox=\"0 0 32 32\" fill=\"currentColor\" aria-hidden=\"true\"><path d=\"M26.576 5.363c-2.69-2.69-6.406-4.354-10.511-4.354-8.209 0-14.865 6.655-14.865 14.865 0 2.732 0.737 5.291 2.022 7.491l-0.038-0.070-2.109 7.702 7.879-2.067c2.051 1.139 4.498 1.809 7.102 1.809h0.006c8.209-0.003 14.862-6.659 14.862-14.868 0-4.103-1.662-7.817-4.349-10.507l0 0zM16.062 28.228h-0.005c-0 0-0.001 0-0.001 0-2.319 0-4.489-0.64-6.342-1.753l0.056 0.031-0.451-0.267-4.675 1.227 1.247-4.559-0.294-0.467c-1.185-1.862-1.889-4.131-1.889-6.565 0-6.822 5.531-12.353 12.353-12.353s12.353 5.531 12.353 12.353c0 6.822-5.53 12.353-12.353 12.353h-0zM22.838 18.977c-0.371-0.186-2.197-1.083-2.537-1.208-0.341-0.124-0.589-0.185-0.837 0.187-0.246 0.371-0.958 1.207-1.175 1.455-0.216 0.249-0.434 0.279-0.805 0.094-1.15-0.466-2.138-1.087-2.997-1.852l0.010 0.009c-0.799-0.74-1.484-1.587-2.037-2.521l-0.028-0.052c-0.216-0.371-0.023-0.572 0.162-0.757 0.167-0.166 0.372-0.434 0.557-0.65 0.146-0.179 0.271-0.384 0.366-0.604l0.006-0.017c0.043-0.087 0.068-0.188 0.068-0.296 0-0.131-0.037-0.253-0.101-0.357l0.002 0.003c-0.094-0.186-0.836-2.014-1.145-2.758-0.302-0.724-0.609-0.625-0.836-0.637-0.216-0.010-0.464-0.012-0.712-0.012-0.395 0.010-0.746 0.188-0.988 0.463l-0.001 0.002c-0.802 0.761-1.3 1.834-1.3 3.023 0 0.026 0 0.053 0.001 0.079l-0-0.004c0.131 1.467 0.681 2.784 1.527 3.857l-0.012-0.015c1.604 2.379 3.742 4.282 6.251 5.564l0.094 0.043c0.548 0.248 1.25 0.513 1.968 0.74l0.149 0.041c0.442 0.14 0.951 0.221 1.479 0.221 0.303 0 0.601-0.027 0.889-0.078l-0.031 0.004c1.069-0.223 1.956-0.868 2.497-1.749l0.009-0.017c0.165-0.366 0.261-0.793 0.261-1.242 0-0.185-0.016-0.366-0.047-0.542l0.003 0.019c-0.092-0.155-0.34-0.247-0.712-0.434z\"/></svg>"
      + "WhatsApp</a>"
      + "</p>"
      + "</article>";
  }

  function rendre() {
    var resultats = filtrer();
    grille.innerHTML = resultats.map(carteHTML).join("");
    vide.classList.toggle("visible", resultats.length === 0);

    if (resultats.length === 0) {
      compte.innerHTML = "Aucune spécialité ne correspond à vos critères.";
    } else if (resultats.length === 1) {
      compte.innerHTML = "<b>1</b> spécialité affichée.";
    } else {
      compte.innerHTML = "<b>" + resultats.length + "</b> spécialités affichées.";
    }

    var actif = etat.q.trim() !== "" || etat.diplome !== "tous" || etat.filiere !== "toutes";
    boutonRaz.classList.toggle("visible", actif);

    majAvis();
    synchroniserURL();
  }

  /* ----- Écouteurs ----- */
  champRecherche.addEventListener("input", function () {
    etat.q = champRecherche.value;
    rendre();
  });
  selectFiliere.addEventListener("change", function () {
    etat.filiere = selectFiliere.value;
    rendre();
  });
  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      etat.diplome = chip.getAttribute("data-diplome");
      synchroniserUI();
      rendre();
    });
  });
  boutonRaz.addEventListener("click", function () {
    etat = { q: "", diplome: "tous", filiere: "toutes" };
    synchroniserUI();
    rendre();
    champRecherche.focus();
  });

  /* ----- Démarrage ----- */
  synchroniserUI();
  rendre();
})();

/* fiche.html - modèle unique rempli depuis ?f=<slug> */
(function () {
  "use strict";

  var donnees = window.MPHI_FORMATIONS;
  var contenu = document.getElementById("contenuFiche");
  var erreur = document.getElementById("ficheErreur");
  if (!contenu || !erreur) { return; }

  function afficherErreur() {
    contenu.style.display = "none";
    erreur.classList.add("visible");
    document.title = "Fiche introuvable - MPHI · Bafoussam";
  }

  if (!donnees) { afficherErreur(); return; }

  var slug = new URLSearchParams(window.location.search).get("f");
  var spec = null;
  donnees.specialites.forEach(function (s) { if (s.slug === slug) { spec = s; } });
  if (!spec) { afficherErreur(); return; }

  /* ----- Libellés ----- */
  var DIPLOME_LONG = {
    bts: "BTS - Brevet de technicien supérieur",
    hnd: "HND - Higher national diploma"
  };
  var langueLabel = spec.langue === "en" ? "Anglais (English track)" : "Français";
  var phraseLangue = spec.langue === "en"
    ? "Cursus anglophone, accessible après le GCE A/L ou le BAC."
    : "Cursus francophone, accessible dès le BAC.";

  /* ----- Titre, fil, badges, intro ----- */
  document.title = spec.nom + " · " + spec.diplomeNom + " - MPHI Bafoussam";
  var metaDescription = document.querySelector("meta[name=description]");
  if (metaDescription) {
    metaDescription.setAttribute("content",
      spec.nom + " (" + spec.diplomeNom + ", filière " + spec.filiereNom
      + ") chez MPHI à Bafoussam : conditions d'admission, inscription en 3 étapes, questions sur WhatsApp.");
  }

  var lienFilCatalogue = "formations.html?filiere=" + encodeURIComponent(spec.filiere);
  var filFiliere = document.getElementById("filFiliere");
  filFiliere.textContent = spec.filiereNom;
  filFiliere.href = lienFilCatalogue;
  document.getElementById("filNom").textContent = spec.nom;

  /* ----- JSON-LD (Course + fil d'Ariane) : page rendue côté client depuis
     ?f=<slug>, donc générée ici plutôt qu'au build (à la différence des
     autres pages, statiques) - reprend les mêmes champs que le <head>. */
  (function injecterJsonLd() {
    var origine = window.location.origin + window.location.pathname.replace(/\/[^/]*$/, "/");
    var course = {
      "@context": "https://schema.org",
      "@type": "Course",
      name: spec.nom,
      description: spec.nom + " (" + spec.diplomeNom + ", filière " + spec.filiereNom + ") chez MPHI à Bafoussam.",
      provider: { "@type": "EducationalOrganization", name: "Monga Polytechnic Higher Institute", url: origine + "index.html" },
      educationalCredentialAwarded: spec.diplomeNom,
      inLanguage: spec.langue
    };
    var fil = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Formations", item: origine + "formations.html" },
        { "@type": "ListItem", position: 2, name: spec.filiereNom, item: origine + lienFilCatalogue },
        { "@type": "ListItem", position: 3, name: spec.nom, item: window.location.href }
      ]
    };
    [course, fil].forEach(function (objet) {
      var script = document.createElement("script");
      script.type = "application/ld+json";
      script.textContent = JSON.stringify(objet);
      document.head.appendChild(script);
    });
  })();

  document.getElementById("surTitre").textContent = spec.filiereNom;
  var titreFiche = document.getElementById("titreFiche");
  titreFiche.textContent = spec.nom;
  if (spec.langue === "en") { titreFiche.lang = "en"; }
  document.getElementById("introFiche").textContent =
    "Formation " + spec.diplomeNom + " de la filière " + spec.filiereNom + ". " + phraseLangue;

  var badges = document.getElementById("badgesFiche");
  function ajouterBadge(texte, classes) {
    var li = document.createElement("li");
    li.className = classes;
    li.textContent = texte;
    badges.appendChild(li);
  }
  ajouterBadge(spec.diplomeNom, "badge badge-dip");
  ajouterBadge(spec.admission, "badge");
  ajouterBadge(spec.langue === "en" ? "English" : "Français", spec.langue === "en" ? "badge badge-en" : "badge");

  /* ----- Informations clés ----- */
  document.getElementById("infoDiplome").textContent = DIPLOME_LONG[spec.diplome];
  var infoFiliere = document.getElementById("infoFiliere");
  infoFiliere.textContent = spec.filiereNom;
  infoFiliere.href = lienFilCatalogue;
  document.getElementById("infoAdmission").textContent = spec.admission;
  document.getElementById("infoLangue").textContent = langueLabel;

  /* ----- Appels à l'action ----- */
  document.getElementById("ctaWhatsApp").href = MPHI_UTIL.lienWhatsAppSpecialite(spec, "Fiche formation");

  var lienPreinscription = "preinscription.html?f=" + encodeURIComponent(spec.slug);
  document.getElementById("ctaPreinscription").href = lienPreinscription;
  document.getElementById("lienPreinscriptionEtape").href = lienPreinscription;

  var lienDossier = "dossier.html?profil=" + spec.diplome;
  document.getElementById("ctaDossier").href = lienDossier;
  document.getElementById("lienDossierEtape").href = lienDossier;

  if (spec.langue === "fr") {
    document.getElementById("noteDqp").hidden = false;
  }

  /* ----- Dans la même filière ----- */
  var soeurs = donnees.specialites.filter(function (s) {
    return s.filiere === spec.filiere && s.slug !== spec.slug;
  }).slice(0, 8);
  var blocSoeurs = document.getElementById("blocSoeurs");
  if (soeurs.length === 0) {
    blocSoeurs.hidden = true;
  } else {
    var listeSoeurs = document.getElementById("listeSoeurs");
    soeurs.forEach(function (s) {
      var lien = document.createElement("a");
      lien.className = "chip";
      lien.href = "fiche.html?f=" + encodeURIComponent(s.slug);
      lien.setAttribute("data-lead", "fiche-meme-filiere");
      lien.textContent = s.nom;
      if (s.langue === "en") { lien.lang = "en"; }
      listeSoeurs.appendChild(lien);
    });
  }

  /* ----- Partage ----- */
  var adresseFiche = window.location.href;
  var messagePartage = "À découvrir chez MPHI Bafoussam : " + spec.nom
    + " (" + spec.diplomeNom + "). " + adresseFiche;
  document.getElementById("partageWhatsApp").href =
    "https://wa.me/?text=" + encodeURIComponent(messagePartage);

  var boutonCopier = document.getElementById("copierLien");
  var retourCopie = document.getElementById("retourCopie");
  function confirmerCopie(ok) {
    retourCopie.textContent = ok ? "Lien copié !" : "Copie impossible - sélectionnez l'adresse du navigateur.";
    window.setTimeout(function () { retourCopie.textContent = ""; }, 2500);
  }
  boutonCopier.addEventListener("click", function () {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(adresseFiche)
        .then(function () { confirmerCopie(true); })
        .catch(function () { confirmerCopie(false); });
      return;
    }
    try {
      var zone = document.createElement("textarea");
      zone.value = adresseFiche;
      zone.setAttribute("readonly", "");
      zone.style.position = "absolute";
      zone.style.left = "-9999px";
      document.body.appendChild(zone);
      zone.select();
      var ok = document.execCommand("copy");
      document.body.removeChild(zone);
      confirmerCopie(ok);
    } catch (e) { confirmerCopie(false); }
  });
})();

/* orienteur.html - questionnaire d'orientation en 3 questions, 100% client.
   Aucune donnée nouvelle : tout part de window.MPHI_FORMATIONS (26 filières,
   106 spécialités). Les seules constructions propres à cette page sont :
   - le regroupement des 26 filières en 8 "domaines" (mêmes intitulés que
     les cartes de la page d'accueil - aucun intitulé inventé) ;
   - une table de pondération d'affichage pour la question 3 (booste
     l'ordre des résultats, ne filtre jamais).

   Événement "orienteur-termine" : à chaque fois qu'un résultat est calculé
   (fin du questionnaire ou lien partagé ouvert directement), on émet un
   événement DOM avec le niveau, les domaines et la priorité choisis.
   Pourquoi : c'est aujourd'hui le seul point du site où un visiteur exprime
   explicitement "ce qui l'intéresse" avant même de contacter le secrétariat -
   contrairement aux clics WhatsApp (qui ne remontent qu'un intérêt déjà
   décidé), ce signal permet à MPHI de savoir quels domaines attirent le plus
   de monde AVANT l'inscription, utile pour prioriser une campagne, renforcer
   une filière ou dimensionner un campus. Point de branchement volontairement
   simple (CustomEvent + console.info, comme le reste du site) pour un futur
   outil d'analytics, sans dépendance ajoutée aujourd'hui. */
(function () {
  "use strict";

  var donnees = window.MPHI_FORMATIONS;
  var formulaire = document.getElementById("formulaireOrienteur");
  var resultats = document.getElementById("orienteurResultats");
  if (!donnees || !formulaire || !resultats) { return; }

  var reduireMouvementOrienteur = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ----- Filière -> domaine (8 domaines identiques à la page d'accueil) ----- */
  var DOMAINE_PAR_FILIERE = {
    "genie-civil": "genie-civil", "eau": "genie-civil",
    "genie-informatique": "genie-informatique", "reseaux-telecom": "genie-informatique", "computer-en": "genie-informatique",
    "medico-sanitaire": "medico-sanitaire", "genie-biologique": "medico-sanitaire", "biomedical": "medico-sanitaire", "genie-chimie": "medico-sanitaire", "medical-en": "medico-sanitaire",
    "gestion": "gestion", "staps": "gestion", "commerce-vente": "gestion", "economie-sociale": "gestion", "management-en": "gestion", "business-finance-en": "gestion",
    "hotellerie-tourisme": "hotellerie-tourisme", "home-economics-en": "hotellerie-tourisme", "tourism-en": "hotellerie-tourisme",
    "genie-electrique": "genie-electrique", "genie-mecanique": "genie-electrique", "electrical-en": "genie-electrique", "mechanical-en": "genie-electrique",
    "agriculture-elevage": "agriculture-elevage", "agric-food-en": "agriculture-elevage",
    "arts-culture": "arts-culture"
  };
  var DOMAINES_VALIDES = ["genie-civil", "genie-informatique", "medico-sanitaire", "gestion",
    "hotellerie-tourisme", "genie-electrique", "agriculture-elevage", "arts-culture"];

  /* ----- Question 3 : pondération d'affichage uniquement (jamais un filtre) ----- */
  var FILIERES_PAR_PRIORITE = {
    manuel: ["genie-civil", "eau", "genie-electrique", "genie-mecanique", "reseaux-telecom", "genie-chimie", "agriculture-elevage", "electrical-en", "mechanical-en", "agric-food-en"],
    contact: ["hotellerie-tourisme", "commerce-vente", "medico-sanitaire", "staps", "economie-sociale", "home-economics-en", "tourism-en", "medical-en"],
    chiffres: ["gestion", "commerce-vente", "economie-sociale", "management-en", "business-finance-en"],
    sante: ["medico-sanitaire", "biomedical", "genie-biologique", "genie-chimie", "medical-en"],
    creation: ["arts-culture", "genie-informatique", "computer-en"]
  };

  var DIPLOME_PAR_NIVEAU = { bepc: "dqp", bac: "bts", gce: "hnd", superieur: "licence-master" };

  var AVIS_PAR_DIPLOME = {
    dqp: "Le parcours DQP - accessible dès le BEPC - suit les mêmes filières que le BTS ci-dessous, et se combine en « DQP + BTS en 2 ans ». La liste exacte des spécialités DQP est confirmée au secrétariat.",
    "licence-master": "Licence et Master professionnels : ils prolongent les BTS et HND ci-dessous. Programme détaillé et conditions d'accès au secrétariat."
  };

  var TITRES_ETAPES = ["Niveau d'études", "Domaine qui vous attire", "Ce qui compte le plus"];
  var TEXTE_ERREUR_DOMAINE_VIDE = "Choisissez au moins un domaine (trois maximum).";
  var TEXTE_ERREUR_DOMAINE_MAX = "Trois domaines maximum - décochez-en un pour en choisir un autre.";

  var etapes = Array.prototype.slice.call(document.querySelectorAll(".orienteur-etape"));
  var boutonPrecedent = document.getElementById("orienteurPrecedent");
  var progression = document.getElementById("orienteurProgression");
  var jaugeBarre = document.getElementById("orienteurJaugeBarre");
  var erreurDomaine = document.getElementById("erreurDomaine");
  var grille = document.getElementById("orienteurGrille");
  var avis = document.getElementById("orienteurAvis");
  var titreResultats = document.getElementById("titreResultats");
  var boutonVoirToutes = document.getElementById("orienteurVoirToutes");
  var boutonRecommencer = document.getElementById("orienteurRecommencer");

  var etat = { n: null, dom: [], p: null };
  var etapeCourante = 1;

  /* ----- État <-> URL (?n=&dom=&p=) : un résultat reste partageable tel quel ----- */
  function litURL() {
    var params = new URLSearchParams(window.location.search);
    var n = params.get("n");
    var dom = params.get("dom");
    var p = params.get("p");
    if (n && DIPLOME_PAR_NIVEAU[n]) { etat.n = n; }
    if (dom) {
      etat.dom = dom.split(",").filter(function (d) { return DOMAINES_VALIDES.indexOf(d) !== -1; }).slice(0, 3);
    }
    if (p && FILIERES_PAR_PRIORITE[p]) { etat.p = p; }
  }

  function ecritURL() {
    var params = new URLSearchParams();
    if (etat.n) { params.set("n", etat.n); }
    if (etat.dom.length) { params.set("dom", etat.dom.join(",")); }
    if (etat.p) { params.set("p", etat.p); }
    var chaine = params.toString();
    window.history.replaceState(null, "", window.location.pathname + (chaine ? "?" + chaine : ""));
  }

  function synchroniserChamps() {
    formulaire.querySelectorAll('input[name="niveau"]').forEach(function (i) {
      i.checked = i.value === etat.n;
      i.closest(".orienteur-option").classList.toggle("selectionnee", i.checked);
    });
    formulaire.querySelectorAll('input[name="domaine"]').forEach(function (i) {
      i.checked = etat.dom.indexOf(i.value) !== -1;
      i.closest(".orienteur-option").classList.toggle("selectionnee", i.checked);
    });
    formulaire.querySelectorAll('input[name="priorite"]').forEach(function (i) {
      i.checked = i.value === etat.p;
      i.closest(".orienteur-option").classList.toggle("selectionnee", i.checked);
    });
  }

  /* ----- Sélection visuelle + limite à 3 domaines ----- */
  formulaire.querySelectorAll('input[name="niveau"], input[name="priorite"]').forEach(function (radio) {
    radio.addEventListener("change", function () {
      radio.closest(".orienteur-etape").querySelectorAll(".orienteur-option").forEach(function (opt) {
        opt.classList.remove("selectionnee");
      });
      radio.closest(".orienteur-option").classList.add("selectionnee");
    });
  });
  formulaire.querySelectorAll('input[name="domaine"]').forEach(function (case_) {
    case_.addEventListener("change", function () {
      var coches = formulaire.querySelectorAll('input[name="domaine"]:checked').length;
      if (coches > 3) {
        case_.checked = false;
        erreurDomaine.textContent = TEXTE_ERREUR_DOMAINE_MAX;
        erreurDomaine.hidden = false;
        return;
      }
      case_.closest(".orienteur-option").classList.toggle("selectionnee", case_.checked);
      erreurDomaine.hidden = true;
    });
  });

  function domainesCoches() {
    return Array.prototype.slice.call(formulaire.querySelectorAll('input[name="domaine"]:checked')).map(function (i) { return i.value; });
  }

  function validerEtape(num) {
    if (num === 1) { return !!formulaire.querySelector('input[name="niveau"]:checked'); }
    if (num === 2) { return domainesCoches().length > 0; }
    return !!formulaire.querySelector('input[name="priorite"]:checked');
  }

  function jouerTransition(element) {
    if (reduireMouvementOrienteur) { return; }
    element.classList.add("orienteur-transition-entree");
    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () { element.classList.remove("orienteur-transition-entree"); });
    });
  }

  /* ----- Navigation entre questions ----- */
  function afficherEtape(num, deplacerFocus) {
    etapeCourante = num;
    resultats.hidden = true;
    formulaire.hidden = false;
    etapes.forEach(function (fieldset) {
      fieldset.hidden = Number(fieldset.getAttribute("data-etape")) !== num;
    });

    boutonPrecedent.hidden = num === 1;
    document.getElementById("orienteurSuivant").textContent = num === 3 ? "Voir mes pistes" : "Suivant";

    progression.textContent = "Question " + num + " sur 3 : " + TITRES_ETAPES[num - 1];
    jaugeBarre.style.width = (num / 3 * 100) + "%";

    var etape = etapes[num - 1];
    jouerTransition(etape);
    if (deplacerFocus) {
      var legende = etape.querySelector("legend");
      if (legende) { legende.focus(); }
    }
  }

  formulaire.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!validerEtape(etapeCourante)) {
      if (etapeCourante === 2) {
        erreurDomaine.textContent = TEXTE_ERREUR_DOMAINE_VIDE;
        erreurDomaine.hidden = false;
        formulaire.querySelector('input[name="domaine"]').focus();
      }
      return;
    }
    if (etapeCourante === 1) {
      etat.n = formulaire.querySelector('input[name="niveau"]:checked').value;
      ecritURL();
      afficherEtape(2, true);
    } else if (etapeCourante === 2) {
      etat.dom = domainesCoches();
      ecritURL();
      afficherEtape(3, true);
    } else {
      etat.p = formulaire.querySelector('input[name="priorite"]:checked').value;
      ecritURL();
      montrerResultats(true);
    }
  });

  boutonPrecedent.addEventListener("click", function () {
    afficherEtape(Math.max(1, etapeCourante - 1), true);
  });

  /* ----- Calcul des résultats -----
     1) filtre par diplôme déduit du niveau (mêmes règles que le catalogue :
        DQP suit les filières BTS, Licence/Master ne restreint pas) ;
     2) trie par domaines choisis, puis par pondération de la question 3 ;
     3) si moins de 4 pistes dans les domaines choisis, complète avec le
        reste du catalogue (même diplôme) plutôt que de renvoyer une liste
        trop courte - toujours annoncé, jamais silencieux. */
  function correspondDiplome(spec, diplomeFiltre) {
    if (diplomeFiltre === "bts" || diplomeFiltre === "dqp") { return spec.diplome === "bts"; }
    if (diplomeFiltre === "hnd") { return spec.diplome === "hnd"; }
    return true; /* licence-master : prolonge BTS et HND, pas de restriction */
  }

  function trierParPriorite(liste, priorite) {
    var favoris = FILIERES_PAR_PRIORITE[priorite] || [];
    return liste.slice().sort(function (a, b) {
      var scoreA = favoris.indexOf(a.filiere) !== -1 ? 1 : 0;
      var scoreB = favoris.indexOf(b.filiere) !== -1 ? 1 : 0;
      return scoreB - scoreA;
    });
  }

  function calculerResultats() {
    var diplomeFiltre = DIPLOME_PAR_NIVEAU[etat.n];
    var pool = donnees.specialites.filter(function (s) { return correspondDiplome(s, diplomeFiltre); });
    var parDomaine = trierParPriorite(pool.filter(function (s) {
      return etat.dom.indexOf(DOMAINE_PAR_FILIERE[s.filiere]) !== -1;
    }), etat.p);

    var liste = parDomaine.slice(0, 6);
    var elargi = liste.length < 4;
    if (elargi) {
      var dejaPris = {};
      liste.forEach(function (s) { dejaPris[s.slug] = true; });
      var reste = trierParPriorite(pool.filter(function (s) { return !dejaPris[s.slug]; }), etat.p);
      var i = 0;
      while (liste.length < 4 && i < reste.length) { liste.push(reste[i]); i += 1; }
    }
    return { liste: liste, elargi: elargi, diplomeFiltre: diplomeFiltre };
  }

  function carteResultatHTML(spec) {
    var langAttr = spec.langue === "en" ? " lang=\"en\"" : "";
    return "<article class=\"carte carte-spec\">"
      + "<p class=\"filiere-nom\">" + spec.filiereNom + "</p>"
      + "<h3" + langAttr + ">" + spec.nom + "</h3>"
      + "<ul class=\"badges\">"
      + "<li class=\"badge badge-dip\">" + spec.diplomeNom + "</li>"
      + "<li class=\"badge\">" + spec.admission + "</li>"
      + "</ul>"
      + "<p class=\"actions\">"
      + "<a class=\"details\" href=\"fiche.html?f=" + encodeURIComponent(spec.slug) + "\" data-lead=\"orienteur-fiche-" + spec.slug + "\">Voir la fiche</a>"
      + "<a class=\"btn btn-plein btn-wa\" rel=\"noopener\" data-lead=\"orienteur-wa-" + spec.slug + "\" href=\"" + MPHI_UTIL.lienWhatsAppSpecialite(spec, "Test d'orientation") + "\">"
      + "<svg viewBox=\"0 0 32 32\" fill=\"currentColor\" aria-hidden=\"true\"><path d=\"M26.576 5.363c-2.69-2.69-6.406-4.354-10.511-4.354-8.209 0-14.865 6.655-14.865 14.865 0 2.732 0.737 5.291 2.022 7.491l-0.038-0.070-2.109 7.702 7.879-2.067c2.051 1.139 4.498 1.809 7.102 1.809h0.006c8.209-0.003 14.862-6.659 14.862-14.868 0-4.103-1.662-7.817-4.349-10.507l0 0zM16.062 28.228h-0.005c-0 0-0.001 0-0.001 0-2.319 0-4.489-0.64-6.342-1.753l0.056 0.031-0.451-0.267-4.675 1.227 1.247-4.559-0.294-0.467c-1.185-1.862-1.889-4.131-1.889-6.565 0-6.822 5.531-12.353 12.353-12.353s12.353 5.531 12.353 12.353c0 6.822-5.53 12.353-12.353 12.353h-0zM22.838 18.977c-0.371-0.186-2.197-1.083-2.537-1.208-0.341-0.124-0.589-0.185-0.837 0.187-0.246 0.371-0.958 1.207-1.175 1.455-0.216 0.249-0.434 0.279-0.805 0.094-1.15-0.466-2.138-1.087-2.997-1.852l0.010 0.009c-0.799-0.74-1.484-1.587-2.037-2.521l-0.028-0.052c-0.216-0.371-0.023-0.572 0.162-0.757 0.167-0.166 0.372-0.434 0.557-0.65 0.146-0.179 0.271-0.384 0.366-0.604l0.006-0.017c0.043-0.087 0.068-0.188 0.068-0.296 0-0.131-0.037-0.253-0.101-0.357l0.002 0.003c-0.094-0.186-0.836-2.014-1.145-2.758-0.302-0.724-0.609-0.625-0.836-0.637-0.216-0.010-0.464-0.012-0.712-0.012-0.395 0.010-0.746 0.188-0.988 0.463l-0.001 0.002c-0.802 0.761-1.3 1.834-1.3 3.023 0 0.026 0 0.053 0.001 0.079l-0-0.004c0.131 1.467 0.681 2.784 1.527 3.857l-0.012-0.015c1.604 2.379 3.742 4.282 6.251 5.564l0.094 0.043c0.548 0.248 1.25 0.513 1.968 0.74l0.149 0.041c0.442 0.14 0.951 0.221 1.479 0.221 0.303 0 0.601-0.027 0.889-0.078l-0.031 0.004c1.069-0.223 1.956-0.868 2.497-1.749l0.009-0.017c0.165-0.366 0.261-0.793 0.261-1.242 0-0.185-0.016-0.366-0.047-0.542l0.003 0.019c-0.092-0.155-0.34-0.247-0.712-0.434z\"/></svg>"
      + "WhatsApp</a>"
      + "</p>"
      + "</article>";
  }

  function montrerResultats(deplacerFocus) {
    var r = calculerResultats();
    grille.innerHTML = r.liste.map(carteResultatHTML).join("");

    var messages = [];
    if (AVIS_PAR_DIPLOME[r.diplomeFiltre]) { messages.push(AVIS_PAR_DIPLOME[r.diplomeFiltre]); }
    if (r.elargi) { messages.push("Peu de spécialités correspondaient exactement aux domaines choisis : la sélection ci-dessous est élargie pour vous proposer plusieurs pistes."); }
    if (messages.length) {
      avis.innerHTML = messages.map(function (m) { return "<p>" + m + "</p>"; }).join("");
      avis.classList.add("visible");
    } else {
      avis.innerHTML = "";
      avis.classList.remove("visible");
    }

    boutonVoirToutes.href = "formations.html?diplome=" + encodeURIComponent(r.diplomeFiltre);

    etapes.forEach(function (f) { f.hidden = true; });
    formulaire.hidden = true;
    resultats.hidden = false;
    jouerTransition(resultats);

    progression.textContent = "Résultat : " + r.liste.length + " spécialité" + (r.liste.length > 1 ? "s" : "") + " proposée" + (r.liste.length > 1 ? "s" : "") + ".";
    jaugeBarre.style.width = "100%";

    if (deplacerFocus && titreResultats) { titreResultats.focus(); }

    try {
      document.dispatchEvent(new CustomEvent("orienteur-termine", {
        detail: { niveau: etat.n, domaines: etat.dom.slice(), priorite: etat.p, nbResultats: r.liste.length }
      }));
      if (MPHI_DEBUG) { console.info("[MPHI lead]", "orienteur-termine", etat.n, etat.dom.join("+"), etat.p); }
    } catch (e) { /* CustomEvent indisponible : silencieux, aucune fonctionnalité perdue */ }
  }

  boutonRecommencer.addEventListener("click", function () {
    etat = { n: null, dom: [], p: null };
    formulaire.reset();
    formulaire.querySelectorAll(".orienteur-option").forEach(function (opt) { opt.classList.remove("selectionnee"); });
    erreurDomaine.hidden = true;
    window.history.replaceState(null, "", window.location.pathname);
    afficherEtape(1, true);
  });

  /* ----- Démarrage : reprend l'état depuis l'URL (résultat partagé, ou étape en cours) ----- */
  litURL();
  synchroniserChamps();
  if (etat.n && etat.dom.length && etat.p) {
    montrerResultats(false);
  } else if (etat.n && etat.dom.length) {
    afficherEtape(3, false);
  } else if (etat.n) {
    afficherEtape(2, false);
  } else {
    afficherEtape(1, false);
  }
})();

/* frais-et-bourses.html - rendu automatique dès que data/frais.js est rempli */
(function () {
  "use strict";

  var attente = document.getElementById("grilleAttente");
  var cadre = document.getElementById("cadreGrille");
  var corps = document.getElementById("corpsGrille");
  var maj = document.getElementById("majGrille");
  if (!attente || !cadre || !corps || !maj) { return; }

  /* Rendu automatique de la grille officielle dès que data/frais.js
     est rempli (MPHI_FRAIS non nul). Sinon : état d'attente. */
  var grille = window.MPHI_FRAIS;
  if (!grille || !Array.isArray(grille.lignes) || grille.lignes.length === 0) { return; }

  var devise = grille.devise || "FCFA";
  var espaceInsecable = String.fromCharCode(0x00A0);

  function montant(valeur) {
    if (typeof valeur !== "number") { return String(valeur); }
    try {
      return valeur.toLocaleString("fr-FR") + espaceInsecable + devise;
    } catch (e) {
      return valeur + " " + devise;
    }
  }

  corps.innerHTML = "";
  grille.lignes.forEach(function (ligne) {
    var tr = document.createElement("tr");

    var th = document.createElement("th");
    th.setAttribute("scope", "row");
    th.textContent = ligne.libelle;
    tr.appendChild(th);

    [["Frais d'inscription", montant(ligne.inscription)],
     ["Scolarité", montant(ligne.scolarite)],
     ["Paiement", ligne.tranches || "-"]].forEach(function (paire) {
      var td = document.createElement("td");
      td.setAttribute("data-label", paire[0]);
      td.textContent = paire[1];
      tr.appendChild(td);
    });

    corps.appendChild(tr);
  });

  attente.hidden = true;
  cadre.hidden = false;

  var texteMaj = "Grille officielle";
  if (grille.valideLe) {
    try {
      texteMaj += " - validée le " + new Date(grille.valideLe + "T00:00:00")
        .toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
    } catch (e) { texteMaj += " - validée le " + grille.valideLe; }
  }
  if (grille.note) { texteMaj += ". " + grille.note; }
  maj.textContent = texteMaj;
  maj.hidden = false;
})();

/* calendrier.html - rendu automatique dès que data/calendrier.js est rempli */
(function () {
  "use strict";

  var datesAttente = document.getElementById("datesAttente");
  var datesListe = document.getElementById("datesListe");
  var zoneAVenir = document.getElementById("listeAVenir");
  var zonePasses = document.getElementById("listePasses");
  if (!datesAttente || !datesListe || !zoneAVenir || !zonePasses) { return; }

  /* Rendu automatique des dates officielles dès que data/calendrier.js
     est rempli (MPHI_CALENDRIER non nul). Sinon : état d'attente. */
  var calendrier = window.MPHI_CALENDRIER;
  if (!calendrier || !Array.isArray(calendrier.evenements) || calendrier.evenements.length === 0) { return; }

  var MOIS_COURTS = ["jan", "fév", "mar", "avr", "mai", "juin", "juil", "août", "sep", "oct", "nov", "déc"];
  var CATEGORIES = {
    inscriptions: { texte: "Inscriptions", classe: "badge badge-en" },
    rentree: { texte: "Rentrée", classe: "badge badge-dip" },
    paiement: { texte: "Paiement", classe: "badge" },
    examen: { texte: "Examens", classe: "badge" }
  };

  function versDate(chaine) {
    var d = new Date(chaine + "T00:00:00");
    return isNaN(d.getTime()) ? null : d;
  }
  function dateLongue(d) {
    try {
      return d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
    } catch (e) { return d.toISOString().slice(0, 10); }
  }

  var evenements = calendrier.evenements.map(function (e) {
    var debut = versDate(e.date);
    if (!debut) { return null; }
    return {
      debut: debut,
      fin: e.dateFin ? versDate(e.dateFin) : null,
      titre: e.titre || "Événement",
      description: e.description || "",
      categorie: e.categorie || ""
    };
  }).filter(Boolean).sort(function (a, b) { return a.debut - b.debut; });

  if (evenements.length === 0) { return; }

  var aujourdhui = new Date();
  aujourdhui.setHours(0, 0, 0, 0);

  function carteEvenement(e, passe) {
    var article = document.createElement("article");
    article.className = "evenement" + (passe ? " passe" : "");

    var temps = document.createElement("time");
    temps.setAttribute("datetime", e.debut.toISOString().slice(0, 10));
    var jour = document.createElement("b");
    jour.textContent = String(e.debut.getDate());
    var mois = document.createElement("span");
    mois.textContent = MOIS_COURTS[e.debut.getMonth()] + " " + e.debut.getFullYear();
    temps.appendChild(jour);
    temps.appendChild(mois);

    var corps = document.createElement("div");
    corps.className = "corps";
    var titre = document.createElement("h3");
    titre.textContent = e.titre;
    var cat = CATEGORIES[e.categorie];
    if (cat || e.categorie) {
      var badge = document.createElement("span");
      badge.className = cat ? cat.classe : "badge";
      badge.textContent = cat ? cat.texte : e.categorie;
      titre.appendChild(badge);
    }
    corps.appendChild(titre);

    var details = [];
    if (e.fin) { details.push("Jusqu'au " + dateLongue(e.fin) + "."); }
    if (e.description) { details.push(e.description); }
    if (details.length) {
      var p = document.createElement("p");
      p.textContent = details.join(" ");
      corps.appendChild(p);
    }

    article.appendChild(temps);
    article.appendChild(corps);
    return article;
  }

  var aVenir = [], passes = [];
  evenements.forEach(function (e) {
    var reference = e.fin || e.debut;
    (reference >= aujourdhui ? aVenir : passes).push(e);
  });

  aVenir.forEach(function (e) { zoneAVenir.appendChild(carteEvenement(e, false)); });
  passes.forEach(function (e) { zonePasses.appendChild(carteEvenement(e, true)); });
  document.getElementById("titreAVenir").hidden = aVenir.length === 0;
  document.getElementById("titrePasses").hidden = passes.length === 0;

  var maj = document.getElementById("majCalendrier");
  var texteMaj = "Calendrier officiel";
  if (calendrier.valideLe) {
    var v = versDate(calendrier.valideLe);
    if (v) { texteMaj += " - validé le " + dateLongue(v); }
  }
  if (calendrier.note) { texteMaj += ". " + calendrier.note; }
  maj.textContent = texteMaj;
  maj.hidden = false;

  datesAttente.hidden = true;
  datesListe.hidden = false;
})();

/* preinscription.html - validation, message WhatsApp structuré, envoi */
(function () {
  "use strict";

  var formulaire = document.getElementById("formulairePre");
  if (!formulaire) { return; }

  /* ================================================================
     CONFIGURATION D'ENVOI
     "" (vide) -> mode WhatsApp : la demande s'ouvre dans WhatsApp.
     URL Formspree (https://formspree.io/f/XXXX) ou Web3Forms
     (https://api.web3forms.com/submit + champ access_key) -> envoi
     direct, avec WhatsApp en secours si le réseau échoue.
     ================================================================ */
  var POINT_ENVOI = "";

  var NUMERO_WHATSAPP = "237655996913";
  var donnees = window.MPHI_FORMATIONS;

  var champNom = document.getElementById("nom");
  var champTel = document.getElementById("telephone");
  var champFormation = document.getElementById("formation");
  var champDiplome = document.getElementById("diplome");
  var champCampus = document.getElementById("campus");
  var champEmail = document.getElementById("email");
  var champMessage = document.getElementById("message");
  var caseConsentement = document.getElementById("consentement");
  var bouton = document.getElementById("boutonEnvoyer");
  var modeNote = document.getElementById("modeNote");
  var etatSucces = document.getElementById("etatSucces");
  var etatErreur = document.getElementById("etatErreur");

  var modeEndpoint = POINT_ENVOI !== "";

  /* ----- Libellés selon le mode ----- */
  if (modeEndpoint) {
    bouton.textContent = "Envoyer ma préinscription";
    modeNote.textContent = "Envoi direct au secrétariat - vous êtes recontacté rapidement.";
  }

  /* ----- Datalist des 106 formations + préremplissage ?f= ----- */
  function libelleSpec(spec) { return spec.nom + " - " + spec.diplomeNom; }

  if (donnees) {
    var liste = document.getElementById("listeFormations");
    donnees.specialites.forEach(function (spec) {
      var option = document.createElement("option");
      option.value = libelleSpec(spec);
      if (spec.langue === "en") { option.lang = "en"; }
      liste.appendChild(option);
    });

    var slug = new URLSearchParams(window.location.search).get("f");
    if (slug) {
      donnees.specialites.forEach(function (spec) {
        if (spec.slug === slug) {
          champFormation.value = libelleSpec(spec);
          champDiplome.value = spec.diplomeNom;
        }
      });
    }

    champFormation.addEventListener("change", function () {
      var valeur = champFormation.value.trim();
      donnees.specialites.forEach(function (spec) {
        if (libelleSpec(spec) === valeur) { champDiplome.value = spec.diplomeNom; }
      });
    });
  }

  /* ----- Validation ----- */
  function poserErreur(champ, idErreur, invalide) {
    document.getElementById(idErreur).hidden = !invalide;
    champ.setAttribute("aria-invalid", invalide ? "true" : "false");
    return invalide;
  }
  function valider() {
    var premierInvalide = null;
    if (poserErreur(champNom, "err-nom", champNom.value.trim() === "")) { premierInvalide = premierInvalide || champNom; }
    var chiffres = champTel.value.replace(/\D/g, "");
    if (poserErreur(champTel, "err-telephone", chiffres.length < 9)) { premierInvalide = premierInvalide || champTel; }
    if (poserErreur(champFormation, "err-formation", champFormation.value.trim() === "")) { premierInvalide = premierInvalide || champFormation; }
    var sansConsentement = !caseConsentement.checked;
    document.getElementById("err-consentement").hidden = !sansConsentement;
    if (sansConsentement) { premierInvalide = premierInvalide || caseConsentement; }
    if (premierInvalide) { premierInvalide.focus(); return false; }
    return true;
  }

  /* ----- Message WhatsApp structuré ----- */
  function composerMessage() {
    var sautDeLigne = String.fromCharCode(10);
    var lignes = [
      "Préinscription MPHI - rentrée 2026-2027",
      "Nom : " + champNom.value.trim(),
      "Téléphone : " + champTel.value.trim(),
      "Formation visée : " + champFormation.value.trim(),
      "Diplôme : " + champDiplome.value,
      "Campus souhaité : " + champCampus.value
    ];
    if (champEmail.value.trim() !== "") { lignes.push("Email : " + champEmail.value.trim()); }
    if (champMessage.value.trim() !== "") { lignes.push("Message : " + champMessage.value.trim()); }
    return lignes.join(sautDeLigne);
  }
  function lienWhatsApp() {
    return "https://wa.me/" + NUMERO_WHATSAPP + "?text=" + encodeURIComponent(composerMessage());
  }
  function cibleMerci(via) {
    var f = "", d = "";
    var valeur = champFormation.value.trim();
    if (donnees) {
      donnees.specialites.forEach(function (spec) {
        if (libelleSpec(spec) === valeur) { f = spec.slug; d = spec.diplome; }
      });
    }
    if (!d) {
      d = { "DQP": "dqp", "BTS": "bts", "HND": "hnd", "Licence / Master": "lm" }[champDiplome.value] || "";
    }
    var parametres = new URLSearchParams();
    parametres.set("via", via);
    if (f) { parametres.set("f", f); }
    if (d) { parametres.set("d", d); }
    return "merci.html?" + parametres.toString();
  }
  function memoriserLien(lien) {
    try { window.sessionStorage.setItem("mphi_pre_wa", lien); } catch (e) { /* stockage indisponible */ }
  }

  /* ----- Bascule des états ----- */
  function montrerEtat(etat) {
    formulaire.hidden = etat !== null;
    etatSucces.hidden = etat !== "succes";
    etatErreur.hidden = etat !== "erreur";
    if (etat) { window.scrollTo({ top: 0, behavior: "smooth" }); }
  }
  function revenir() { montrerEtat(null); champNom.focus(); }
  document.getElementById("retourFormulaire").addEventListener("click", revenir);
  document.getElementById("retourFormulaire2").addEventListener("click", revenir);

  /* ----- Envoi ----- */
  formulaire.addEventListener("submit", function (evenement) {
    evenement.preventDefault();
    if (formulaire.querySelector(".piege").value !== "") { return; } /* anti-spam */
    if (!valider()) { return; }

    var lien = lienWhatsApp();
    document.getElementById("succesRouvrir").href = lien;
    document.getElementById("erreurWhatsApp").href = lien;

    if (!modeEndpoint) {
      var fenetre = window.open(lien, "_blank", "noopener");
      if (MPHI_DEBUG) { try { console.info("[MPHI lead]", "preinscription-whatsapp", champFormation.value.trim()); } catch (e) {} }
      if (fenetre) {
        memoriserLien(lien);
        window.location.href = cibleMerci("wa");
      } else {
        montrerEtat("succes"); /* fenêtre bloquée : confirmation sur place, lien exact conservé */
      }
      return;
    }

    bouton.disabled = true;
    bouton.textContent = "Envoi en cours…";
    var donneesFormulaire = new FormData(formulaire);
    fetch(POINT_ENVOI, {
      method: "POST",
      body: donneesFormulaire,
      headers: { "Accept": "application/json" }
    }).then(function (reponse) {
      if (!reponse.ok) { throw new Error("HTTP " + reponse.status); }
      memoriserLien(lien);
      if (MPHI_DEBUG) { try { console.info("[MPHI lead]", "preinscription-endpoint", champFormation.value.trim()); } catch (e) {} }
      window.location.href = cibleMerci("direct");
    }).catch(function () {
      montrerEtat("erreur");
    }).finally(function () {
      bouton.disabled = false;
      bouton.textContent = "Envoyer ma préinscription";
    });
  });
})();

/* merci.html - point d'atterrissage unique après préinscription */
(function () {
  "use strict";

  var titre = document.getElementById("titreMerci");
  var texte = document.getElementById("texteMerci");
  var boutonRouvrir = document.getElementById("boutonRouvrir");
  var noteNeutre = document.getElementById("noteNeutre");
  var boutonDossier = document.getElementById("boutonDossier");
  if (!titre || !texte || !boutonRouvrir || !noteNeutre || !boutonDossier) { return; }

  var parametres = new URLSearchParams(window.location.search);
  var via = parametres.get("via");
  var slug = parametres.get("f");
  var profil = parametres.get("d");

  /* ----- Variante selon le mode d'envoi ----- */
  if (via === "wa") {
    titre.textContent = "Votre message est prêt !";
    texte.textContent = "Appuyez sur « Envoyer » dans WhatsApp pour transmettre votre préinscription - le secrétariat vous répond pour confirmer.";
    boutonRouvrir.hidden = false;
    var lienExact = null;
    try { lienExact = window.sessionStorage.getItem("mphi_pre_wa"); } catch (e) { /* stockage indisponible */ }
    if (lienExact) { boutonRouvrir.href = lienExact; }
  } else if (via !== "direct") {
    /* Visite sans paramètres : variante neutre */
    titre.textContent = "Merci !";
    texte.textContent = "Si vous venez d'envoyer votre préinscription, le secrétariat vous recontacte rapidement.";
    noteNeutre.hidden = false;
  }

  /* ----- Rappel de la formation reconnue ----- */
  var donnees = window.MPHI_FORMATIONS;
  if (slug && donnees) {
    donnees.specialites.forEach(function (spec) {
      if (spec.slug === slug) {
        document.getElementById("recapNom").textContent = spec.nom;
        document.getElementById("recapDiplome").textContent = spec.diplomeNom;
        document.getElementById("recapFormation").hidden = false;
        if (!profil) { profil = spec.diplome; }
      }
    });
  }

  /* ----- Checklist pré-adaptée + pièce diplôme ----- */
  if (profil === "bts" || profil === "hnd" || profil === "dqp") {
    boutonDossier.href = "dossier.html?profil=" + profil;
    var LIBELLES = {
      dqp: "Photocopie du BEPC<small>parcours DQP</small>",
      bts: "Photocopie du BAC<small>cursus BTS</small>",
      hnd: "Photocopie du GCE A/L ou du BAC<small>cursus HND</small>"
    };
    document.getElementById("pieceDiplomeMerci").innerHTML = LIBELLES[profil];
  }

  /* ----- Balise de conversion (point de branchement analytics) ----- */
  if (MPHI_DEBUG && (via === "wa" || via === "direct")) {
    try {
      console.info("[MPHI conversion]", "preinscription", via, slug || "formation-libre");
    } catch (e) {}
  }
})();

/* Photos de campus : repli élégant si le fichier n'existe pas encore -
   masque l'image cassée pour laisser voir le fond et la lettre filigrane. */
(function () {
  "use strict";

  var photos = Array.prototype.slice.call(document.querySelectorAll(".campus-visuel img"));
  photos.forEach(function (img) {
    img.addEventListener("error", function () {
      var carte = img.closest(".campus-visuel");
      if (carte) { carte.classList.add("sans-photo"); }
    }, { once: true });
  });
})();
