/* MPHI — comportements partagés (toutes les pages) */
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

  /* Menu déroulant « Admissions » (desktop : clic + Échap + clic extérieur ;
     sur mobile le sous-groupe reste toujours déplié via CSS, ce bloc n'y a
     alors aucun effet visible). */
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

  /* Ombre de l'en-tête au défilement */
  var entete = document.querySelector(".entete");
  if (entete) {
    var majOmbre = function () {
      entete.classList.toggle("ombre", window.scrollY > 8);
    };
    window.addEventListener("scroll", majOmbre, { passive: true });
    majOmbre();
  }

  /* Apparitions au défilement */
  var reduireMouvement = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var elements = document.querySelectorAll(".apparait");
  if (!reduireMouvement && "IntersectionObserver" in window) {
    var observateur = new IntersectionObserver(function (entrees) {
      entrees.forEach(function (entree) {
        if (entree.isIntersecting) {
          entree.target.classList.add("visible");
          observateur.unobserve(entree.target);
        }
      });
    }, { threshold: 0.15 });
    elements.forEach(function (el) { observateur.observe(el); });
  } else {
    elements.forEach(function (el) { el.classList.add("visible"); });
  }

  /* Traçage des leads (WhatsApp, téléphone, CTA) — délégué :
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

/* campus.html — cartes Google Maps à la demande */
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
      cadre.title = "Carte — Campus " + campus + " MPHI, Bafoussam";
      cadre.loading = "lazy";
      cadre.referrerPolicy = "no-referrer-when-downgrade";
      cadre.setAttribute("allowfullscreen", "");

      zone.innerHTML = "";
      zone.appendChild(cadre);
    });
  });
})();

/* faq.html — recherche instantanée, ancres profondes, tout déplier/replier */
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
