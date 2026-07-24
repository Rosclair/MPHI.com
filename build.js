#!/usr/bin/env node
/* MPHI - assembleur de site statique (Node natif, zéro dépendance).
   Usage : node build.js [--watch]
   Lit pages.config.js + src/, écrit dist/. Voir README.md. */
"use strict";

var fs = require("fs");
var path = require("path");
var crypto = require("crypto");

var ROOT = __dirname;
var SRC = path.join(ROOT, "src");
var DIST = path.join(ROOT, "dist");
var PAGES_CONFIG_PATH = path.join(ROOT, "pages.config.js");

/* Colonnes fixes du footer (plan du site) : les libellés/hrefs viennent de
   pages.config.js, seul le regroupement en colonnes est figé ici. */
var FOOTER_LE_SITE_IDS = ["index", "formations", "campus", "institut", "contact", "faq"];
var FOOTER_ADMISSIONS_IDS = ["admissions", "dossier", "frais-et-bourses", "calendrier", "preinscription"];

/* Libellés courts pour le tag "(Depuis : ...)" des liens WhatsApp du header/
   pied de page - présents sur toutes les pages, donc le message pré-rempli
   doit indiquer d'où le visiteur écrit, quelle que soit la page cliquée. */
var WA_LABEL = {
  index: "Accueil", formations: "Catalogue des formations", fiche: "Fiche formation",
  campus: "Campus", institut: "L'institut", contact: "Contact",
  admissions: "Admissions", dossier: "Constitution du dossier",
  "frais-et-bourses": "Frais et bourses", calendrier: "Calendrier",
  preinscription: "Préinscription", merci: "Page de confirmation",
  faq: "Questions fréquentes", "404": "Page introuvable",
  orienteur: "Test d'orientation", "mentions-legales": "Mentions légales",
  confidentialite: "Confidentialité", "a-propos-maquette": "À propos de la maquette"
};

function waHrefEntete(p) {
  var label = WA_LABEL[p.id] || p.id;
  var message = "Bonjour MPHI, je souhaite des informations sur vos formations et les inscriptions 2026-2027. (Depuis : " + label + ")";
  return "https://wa.me/237655996913?text=" + encodeURIComponent(message);
}

function waHrefPied(p) {
  var label = WA_LABEL[p.id] || p.id;
  var message = "Bonjour MPHI, j'ai une question. (Depuis : " + label + ")";
  return "https://wa.me/237655996913?text=" + encodeURIComponent(message);
}

function read(p) {
  return fs.readFileSync(p, "utf8");
}

function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escAttr(s) {
  return esc(s).replace(/"/g, "&quot;");
}

function fill(template, tokens) {
  return template.replace(/\{\{(\w+)\}\}/g, function (m, key) {
    return Object.prototype.hasOwnProperty.call(tokens, key) ? tokens[key] : "";
  });
}

/* Cache-busting : suffixe de hash de contenu sur styles.css et app.js, pour
   que vercel.json puisse leur donner un Cache-Control immutable sans jamais
   servir une version périmée après un déploiement. */
function hashCourt(contenu) {
  return crypto.createHash("sha256").update(contenu).digest("hex").slice(0, 10);
}

function fusionnerObjets(a, b) {
  var r = {};
  Object.keys(a).forEach(function (k) { r[k] = a[k]; });
  Object.keys(b).forEach(function (k) { r[k] = b[k]; });
  return r;
}

function loadPages() {
  delete require.cache[require.resolve(PAGES_CONFIG_PATH)];
  return require(PAGES_CONFIG_PATH);
}

/* Chiffres de l'institut (spécialités, filières) : comptés au build depuis
   la source unique src/data/formations.js plutôt qu'écrits en dur dans une
   page - le fichier s'exécute tel quel (il s'attache à un objet "window"),
   fourni ici comme sandbox minimal. */
var comptesFormationsCache = null;
function comptesFormations() {
  if (comptesFormationsCache) { return comptesFormationsCache; }
  var sandbox = {};
  var code = read(path.join(SRC, "data", "formations.js"));
  new Function("window", code)(sandbox);
  comptesFormationsCache = {
    NB_SPECIALITES: sandbox.MPHI_FORMATIONS.specialites.length,
    NB_FILIERES: sandbox.MPHI_FORMATIONS.filieres.length
  };
  return comptesFormationsCache;
}

/* Utilisés uniquement en secours pendant la migration incrémentale (une page
   à la fois) : le header/footer référencent toutes les pages "principal"/
   "admissions" quelle que soit la page en cours de build. Une fois les 13
   pages migrées, pages.config.js contient tout et ce secours ne sert plus. */
var NAV_LABEL_FALLBACK = {
  index: "Accueil", formations: "Formations", campus: "Campus", contact: "Contact",
  admissions: "Vue d'ensemble", dossier: "Constitution du dossier",
  "frais-et-bourses": "Frais et bourses", calendrier: "Calendrier",
  preinscription: "Préinscription", faq: "Questions fréquentes"
};

function findPage(pages, id) {
  var p = pages.filter(function (x) { return x.id === id; })[0];
  if (p) { return p; }
  return { id: id, out: id + ".html", navLabel: NAV_LABEL_FALLBACK[id] || id, navSectionKey: null };
}

function navAttr(active) {
  return active ? ' aria-current="page"' : "";
}

/* ---- Nav principale (header) --------------------------------------- */

function buildAdmissionsDropdownItems(pages, activeId) {
  return pages
    .filter(function (p) { return p.navGroup === "admissions"; })
    .map(function (p) {
      return '        <li><a href="' + p.out + '"' + navAttr(p.id === activeId) + '>' + esc(p.navLabel) + "</a></li>";
    })
    .join("\n");
}

function buildNavItems(pages, activeId) {
  var active = findPage(pages, activeId);
  var section = active.navSectionKey;
  var formations = findPage(pages, "formations");
  var campus = findPage(pages, "campus");
  var institut = findPage(pages, "institut");
  var contact = findPage(pages, "contact");
  var admissionsActive = section === "admissions";

  return [
    '        <li><a href="' + formations.out + '"' + navAttr(section === "formations") + ">Formations</a></li>",
    '        <li class="nav-dropdown">',
    '          <button type="button" class="nav-dropdown-bouton" id="boutonAdmissions" aria-expanded="false" aria-controls="menuAdmissions"' + navAttr(admissionsActive) + ">",
    "            Admissions",
    '            <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>',
    "          </button>",
    '          <ul class="menu-deroulant" id="menuAdmissions">',
    buildAdmissionsDropdownItems(pages, activeId),
    "          </ul>",
    "        </li>",
    '        <li><a href="' + campus.out + '"' + navAttr(section === "campus") + ">Campus</a></li>",
    '        <li><a href="' + institut.out + '"' + navAttr(section === "institut") + ">" + esc(institut.navLabel) + "</a></li>",
    '        <li><a href="' + contact.out + '"' + navAttr(section === "contact") + ">Contact</a></li>"
  ].join("\n");
}

/* ---- Plan du site (footer) ------------------------------------------ */

function footerLink(pages, id) {
  if (id === "index") {
    return '        <li><a href="index.html">Accueil</a></li>';
  }
  var p = findPage(pages, id);
  return '        <li><a href="' + p.out + '">' + esc(p.navLabel) + "</a></li>";
}

function buildFooterLeSite(pages) {
  return FOOTER_LE_SITE_IDS.map(function (id) { return footerLink(pages, id); }).join("\n");
}

function buildFooterAdmissions(pages) {
  return FOOTER_ADMISSIONS_IDS.map(function (id) { return footerLink(pages, id); }).join("\n");
}

/* ---- <head> ------------------------------------------------------- */

function absolutiser(siteUrl, chemin) {
  return /^https?:\/\//i.test(chemin) ? chemin : siteUrl + "/" + chemin;
}

function buildHead(p, siteUrl, stylesHref) {
  var canonical = '<link rel="canonical" href="' + escAttr(absolutiser(siteUrl, p.out)) + '">';
  var robots = p.robots ? '<meta name="robots" content="' + escAttr(p.robots) + '">' : "";

  var og = "";
  if (p.og) {
    var image = absolutiser(siteUrl, p.og.image);
    og = [
      '<meta property="og:type" content="website">',
      '<meta property="og:locale" content="fr_FR">',
      '<meta property="og:site_name" content="MPHI - Monga Polytechnic Higher Institute">',
      '<meta property="og:title" content="' + escAttr(p.og.title) + '">',
      '<meta property="og:description" content="' + escAttr(p.og.description) + '">',
      '<meta property="og:image" content="' + escAttr(image) + '">',
      '<meta property="og:url" content="' + escAttr(absolutiser(siteUrl, p.out)) + '">',
      '<meta name="twitter:card" content="summary_large_image">',
      '<meta name="twitter:title" content="' + escAttr(p.og.title) + '">',
      '<meta name="twitter:description" content="' + escAttr(p.og.description) + '">',
      '<meta name="twitter:image" content="' + escAttr(image) + '">'
    ].join("\n");
  }

  var jsonld = (p.jsonld || [])
    .map(function (obj) {
      return '<script type="application/ld+json">\n' + JSON.stringify(obj, null, 2) + "\n</script>";
    })
    .join("\n");

  var headMetaTpl = read(path.join(SRC, "partials", "head-meta.html"));
  return fill(headMetaTpl, {
    TITLE: esc(p.title),
    DESCRIPTION: escAttr(p.description),
    CANONICAL: canonical,
    STYLES_HREF: stylesHref,
    ROBOTS: robots,
    OG_BLOCK: og,
    JSONLD_BLOCK: jsonld
  });
}

/* ---- Couche de démonstration (bandeau bas de page + page dédiée) -----
   Existe uniquement tant que pages.MODE_DEMO est vrai (voir pages.config.js).
   Le numéro WhatsApp démo est personnel, distinct des numéros MPHI utilisés
   partout ailleurs sur le site - tant qu'il n'est pas renseigné, un repère
   explicite s'affiche à sa place plutôt qu'un lien cassé. */

var MESSAGE_WHATSAPP_DEMO = "Bonjour, j'ai consulté la maquette du site MPHI.";

function demoWhatsAppHref(pages, p) {
  if (!pages.NUMERO_WHATSAPP_DEMO) { return null; }
  var label = WA_LABEL[p.id] || p.id;
  var message = MESSAGE_WHATSAPP_DEMO + " (Depuis : " + label + ")";
  return "https://wa.me/" + pages.NUMERO_WHATSAPP_DEMO + "?text=" + encodeURIComponent(message);
}

/* Bandeau fixé en bas de chaque page - "" si MODE_DEMO est faux, retirant
   intégralement le bloc du HTML généré (aucune règle CSS/JS orpheline : le
   JS de fermeture, dans app.js, ne fait rien en l'absence de #bandeauDemo). */
function buildBandeauDemo(pages, p) {
  if (!pages.MODE_DEMO) { return ""; }
  var href = demoWhatsAppHref(pages, p);
  var whatsapp = href
    ? '<a class="btn btn-plein bandeau-demo-wa" href="' + escAttr(href) + '" rel="noopener" data-lead="bandeau-demo-whatsapp">WhatsApp</a>'
    : '<span class="bandeau-demo-wa-manquant" title="À renseigner : NUMERO_WHATSAPP_DEMO dans pages.config.js">Numéro WhatsApp à renseigner</span>';
  var tpl = read(path.join(SRC, "partials", "bandeau-demo.html"));
  return fill(tpl, { BANDEAU_DEMO_WHATSAPP: whatsapp });
}

/* Tokens propres à a-propos-maquette.html (bouton WhatsApp, email optionnel) -
   fusionnés avec les tokens habituels de mainContent ; ne matchent que sur
   cette page puisque les autres n'utilisent pas ces {{jetons}}. */
function demoTokens(pages, p) {
  var href = demoWhatsAppHref(pages, p);
  var whatsapp = href
    ? '<a class="btn btn-or" href="' + escAttr(href) + '" rel="noopener" data-lead="a-propos-maquette-whatsapp">WhatsApp</a>'
    : '<span class="bandeau-demo-wa-manquant" title="À renseigner : NUMERO_WHATSAPP_DEMO dans pages.config.js">Numéro WhatsApp à renseigner</span>';
  var email = pages.EMAIL_DEMO
    ? '<p class="a-propos-email">Ou par email : <a href="mailto:' + escAttr(pages.EMAIL_DEMO) + '">' + esc(pages.EMAIL_DEMO) + "</a></p>"
    : "";
  return { DEMO_WHATSAPP_BOUTON: whatsapp, DEMO_EMAIL_BLOC: email };
}

/* ---- Page complète -------------------------------------------------- */

function buildPage(pages, p, stylesHref, appHref) {
  var annonce = read(path.join(SRC, "partials", "annonce.html"));
  var headerTpl = read(path.join(SRC, "partials", "header.html"));
  var footerTpl = read(path.join(SRC, "partials", "footer.html"));
  var tokens = fusionnerObjets(comptesFormations(), demoTokens(pages, p));
  var mainContent = fill(read(path.join(SRC, "pages", p.id + ".html")).trim(), tokens);

  var header = fill(headerTpl, {
    NAV_ITEMS: buildNavItems(pages, p.id),
    NAV_WHATSAPP_HREF: escAttr(waHrefEntete(p))
  });
  var footer = fill(footerTpl, {
    FOOTER_LE_SITE: buildFooterLeSite(pages),
    FOOTER_ADMISSIONS: buildFooterAdmissions(pages),
    PIED_WHATSAPP_HREF: escAttr(waHrefPied(p))
  });
  var head = buildHead(p, pages.SITE_URL, stylesHref);
  var bandeauDemo = buildBandeauDemo(pages, p);
  var classeCorps = pages.MODE_DEMO ? ' class="a-bandeau-demo"' : "";

  var scripts = (p.dataScripts || [])
    .map(function (s) { return '<script src="data/' + s + '.js"></script>'; })
    .concat(['<script src="' + appHref + '"></script>'])
    .join("\n");

  return [
    "<!DOCTYPE html>",
    '<html lang="fr">',
    "<head>",
    head,
    "</head>",
    '<body data-page="' + p.id + '"' + classeCorps + '>',
    annonce,
    "",
    header,
    "",
    mainContent,
    "",
    footer,
    bandeauDemo ? "\n" + bandeauDemo : "",
    "",
    scripts,
    "</body>",
    "</html>",
    ""
  ].join("\n");
}

/* ---- Build complet ---------------------------------------------------- */

function ensureDir(p) {
  if (!fs.existsSync(p)) { fs.mkdirSync(p, { recursive: true }); }
}

/* Copie récursive de src/assets/ vers dist/assets/ (images statiques :
   fond du hero, futures photos de campus, Open Graph...). Pas de
   dépendance npm : parcours manuel, à l'image du reste de build.js. */
function copierAssets() {
  var srcAssets = path.join(SRC, "assets");
  if (!fs.existsSync(srcAssets)) { return; }
  var distAssets = path.join(DIST, "assets");

  var copierDossier = function (depuis, vers) {
    ensureDir(vers);
    fs.readdirSync(depuis, { withFileTypes: true }).forEach(function (entree) {
      var depuisChemin = path.join(depuis, entree.name);
      var versChemin = path.join(vers, entree.name);
      if (entree.isDirectory()) {
        copierDossier(depuisChemin, versChemin);
      } else {
        fs.copyFileSync(depuisChemin, versChemin);
      }
    });
  };
  copierDossier(srcAssets, distAssets);
}

/* ---- Sitemap et robots.txt -------------------------------------------- */

/* Pages indexables uniquement : celles marquées p.robots (merci, 404) sont
   volontairement exclues du sitemap - elles portent déjà noindex. */
function buildSitemap(pages) {
  var urls = pages
    .filter(function (p) { return !p.robots; })
    .map(function (p) { return "  <url><loc>" + esc(pages.SITE_URL + "/" + p.out) + "</loc></url>"; });

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urls.join("\n"),
    "</urlset>",
    ""
  ].join("\n");
}

function buildRobots(siteUrl) {
  return [
    "User-agent: *",
    "Disallow: /merci.html",
    "",
    "Sitemap: " + siteUrl + "/sitemap.xml",
    ""
  ].join("\n");
}

/* Retire les anciens fichiers hashés (styles.<hash>.css / app.<hash>.js)
   d'un précédent build - sinon ils s'accumulent dans dist/ à chaque
   changement de contenu (le hash change, l'ancien nom ne l'est plus). */
function nettoyerAnciensHashes(prefixe, extension) {
  if (!fs.existsSync(DIST)) { return; }
  var re = new RegExp("^" + prefixe + "\\.[0-9a-f]{10}\\." + extension + "$");
  fs.readdirSync(DIST).forEach(function (f) {
    if (re.test(f)) { fs.unlinkSync(path.join(DIST, f)); }
  });
}

function build() {
  var pages = loadPages();

  ensureDir(DIST);
  ensureDir(path.join(DIST, "data"));

  var cssContenu = read(path.join(SRC, "styles.css"));
  var jsContenu = read(path.join(SRC, "app.js"));
  var stylesHref = "styles." + hashCourt(cssContenu) + ".css";
  var appHref = "app." + hashCourt(jsContenu) + ".js";

  pages.forEach(function (p) {
    var html = buildPage(pages, p, stylesHref, appHref);
    fs.writeFileSync(path.join(DIST, p.out), html, "utf8");
  });

  nettoyerAnciensHashes("styles", "css");
  nettoyerAnciensHashes("app", "js");
  fs.writeFileSync(path.join(DIST, stylesHref), cssContenu, "utf8");
  fs.writeFileSync(path.join(DIST, appHref), jsContenu, "utf8");
  fs.copyFileSync(path.join(SRC, "site.webmanifest"), path.join(DIST, "site.webmanifest"));
  copierAssets();

  ["formations", "frais", "calendrier"].forEach(function (name) {
    fs.copyFileSync(path.join(SRC, "data", name + ".js"), path.join(DIST, "data", name + ".js"));
  });

  fs.writeFileSync(path.join(DIST, "sitemap.xml"), buildSitemap(pages), "utf8");
  fs.writeFileSync(path.join(DIST, "robots.txt"), buildRobots(pages.SITE_URL), "utf8");

  console.log("Build OK -> dist/ (" + pages.length + " page(s))");
}

build();

if (process.argv.indexOf("--watch") !== -1) {
  console.log("--watch : reconstruction automatique sur changement dans src/ et pages.config.js");
  var rebuild = function () {
    try { build(); } catch (err) { console.error("Erreur de build :", err.message); }
  };
  /* Anti-rebond : un enregistrement déclenche souvent plusieurs événements
     fs.watch coup sur coup (éditeur, sauvegarde atomique...) - une seule
     reconstruction regroupe tout ce qui arrive dans la même fenêtre de 80ms. */
  var minuteurRebuild = null;
  var planifierRebuild = function () {
    clearTimeout(minuteurRebuild);
    minuteurRebuild = setTimeout(rebuild, 80);
  };
  fs.watch(SRC, { recursive: true }, planifierRebuild);
  fs.watch(PAGES_CONFIG_PATH, planifierRebuild);
}
