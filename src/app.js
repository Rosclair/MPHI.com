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
