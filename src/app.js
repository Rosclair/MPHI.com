/* MPHI - comportements partagés (toutes les pages) */

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
     sur le bouton, avec Échap et clic extérieur pour refermer - identique
     sur desktop (bulle flottante) et sur mobile (bloc dans le panneau). */
  var boutonAdmissions = document.getElementById("boutonAdmissions");
  var menuAdmissions = document.getElementById("menuAdmissions");
  if (boutonAdmissions && menuAdmissions) {
    var fermerAdmissions = function () {
      menuAdmissions.classList.remove("ouverte");
      boutonAdmissions.setAttribute("aria-expanded", "false");
    };
    boutonAdmissions.addEventListener("click", function (e) {
      e.stopPropagation();
      var ouvert = menuAdmissions.classList.toggle("ouverte");
      boutonAdmissions.setAttribute("aria-expanded", ouvert ? "true" : "false");
    });
    document.addEventListener("click", function (e) {
      if (!e.target.closest(".nav-dropdown")) { fermerAdmissions(); }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { fermerAdmissions(); }
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

  var marquesDiacritiques = new RegExp("[" + String.fromCharCode(0x0300) + "-" + String.fromCharCode(0x036f) + "]", "g");
  function normaliser(texte) {
    return String(texte).normalize("NFD").replace(marquesDiacritiques, "").toLowerCase();
  }

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
    "orienteur": {
      titre: "Le test d'orientation arrive",
      texte: "En attendant, parcourez le catalogue : filtres par diplôme, par filière et recherche par nom.",
      cta: { texte: "Explorer le catalogue", href: "formations.html" }
    },
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

    var marquesDiacritiques404 = new RegExp("[" + String.fromCharCode(0x0300) + "-" + String.fromCharCode(0x036f) + "]", "g");
    function normaliser(texte) {
      return String(texte).normalize("NFD").replace(marquesDiacritiques404, "").toLowerCase();
    }

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
  var marquesDiacritiquesCatalogue = new RegExp("[" + String.fromCharCode(0x0300) + "-" + String.fromCharCode(0x036f) + "]", "g");
  function normaliser(texte) {
    return String(texte).normalize("NFD").replace(marquesDiacritiquesCatalogue, "").toLowerCase();
  }
  function lienWhatsApp(spec) {
    var message = "Bonjour MPHI, je souhaite des informations sur la spécialité "
      + spec.nom + " (" + spec.diplomeNom + ", filière " + spec.filiereNom + ").";
    return "https://wa.me/237655996913?text=" + encodeURIComponent(message);
  }

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
      avis.innerHTML = "<p><strong>Licence et Master professionnels</strong> - ils prolongent les BTS et HND ci-dessous. Programme détaillé et conditions d'accès au secrétariat, ou <a href=\"https://wa.me/237655996913?text=Bonjour%20MPHI%2C%20je%20souhaite%20des%20informations%20sur%20vos%20Licences%20et%20Masters%20professionnels.\" data-lead=\"avis-lm-whatsapp\" rel=\"noopener\">sur WhatsApp</a>.</p>";
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
    return "<article class=\"carte carte-spec\">"
      + "<p class=\"filiere-nom\">" + spec.filiereNom + "</p>"
      + "<h3>" + spec.nom + "</h3>"
      + "<ul class=\"badges\">"
      + "<li class=\"badge badge-dip\">" + spec.diplomeNom + "</li>"
      + "<li class=\"badge\">" + spec.admission + "</li>"
      + badgeLangue
      + "</ul>"
      + "<p class=\"actions\">"
      + "<a class=\"details\" href=\"fiche.html?f=" + spec.slug + "\">Détails</a>"
      + "<a class=\"btn btn-plein btn-wa\" rel=\"noopener\" data-lead=\"catalogue-wa-" + spec.slug + "\" href=\"" + lienWhatsApp(spec) + "\">"
      + "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M21 11.5a8.5 8.5 0 0 1-12.4 7.6L3 21l1.9-5.6A8.5 8.5 0 1 1 21 11.5z\"/></svg>"
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

  document.getElementById("surTitre").textContent = spec.filiereNom;
  document.getElementById("titreFiche").textContent = spec.nom;
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
  var messageWhatsApp = "Bonjour MPHI, je souhaite des informations sur la spécialité "
    + spec.nom + " (" + spec.diplomeNom + ", filière " + spec.filiereNom + ").";
  document.getElementById("ctaWhatsApp").href =
    "https://wa.me/237655996913?text=" + encodeURIComponent(messageWhatsApp);

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
      try { console.info("[MPHI lead]", "preinscription-whatsapp", champFormation.value.trim()); } catch (e) {}
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
      try { console.info("[MPHI lead]", "preinscription-endpoint", champFormation.value.trim()); } catch (e) {}
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
  if (via === "wa" || via === "direct") {
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
