#!/usr/bin/env node
/* MPHI — assembleur de site statique (Node natif, zéro dépendance).
   Usage : node build.js [--watch]
   Lit pages.config.js + src/, écrit dist/. Voir README.md. */
"use strict";

var fs = require("fs");
var path = require("path");

var ROOT = __dirname;
var SRC = path.join(ROOT, "src");
var DIST = path.join(ROOT, "dist");
var PAGES_CONFIG_PATH = path.join(ROOT, "pages.config.js");

/* Colonnes fixes du footer (plan du site) : les libellés/hrefs viennent de
   pages.config.js, seul le regroupement en colonnes est figé ici. */
var FOOTER_LE_SITE_IDS = ["index", "formations", "campus", "contact", "faq"];
var FOOTER_ADMISSIONS_IDS = ["admissions", "dossier", "frais-et-bourses", "calendrier", "preinscription"];

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

function loadPages() {
  delete require.cache[require.resolve(PAGES_CONFIG_PATH)];
  return require(PAGES_CONFIG_PATH);
}

function findPage(pages, id) {
  var p = pages.filter(function (x) { return x.id === id; })[0];
  if (!p) { throw new Error("pages.config.js : entrée manquante pour id=\"" + id + "\""); }
  return p;
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
    '        <li><a href="institut.html">L\'institut</a></li>',
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
  var links = FOOTER_LE_SITE_IDS.map(function (id) { return footerLink(pages, id); });
  links.splice(3, 0, '        <li><a href="institut.html">L\'institut</a></li>');
  return links.join("\n");
}

function buildFooterAdmissions(pages) {
  return FOOTER_ADMISSIONS_IDS.map(function (id) { return footerLink(pages, id); }).join("\n");
}

/* ---- <head> ------------------------------------------------------- */

function buildHead(p) {
  var robots = p.robots ? '<meta name="robots" content="' + escAttr(p.robots) + '">' : "";

  var og = "";
  if (p.og) {
    og = [
      '<meta property="og:type" content="website">',
      '<meta property="og:locale" content="fr_FR">',
      '<meta property="og:site_name" content="MPHI — Monga Polytechnic Higher Institute">',
      '<meta property="og:title" content="' + escAttr(p.og.title) + '">',
      '<meta property="og:description" content="' + escAttr(p.og.description) + '">',
      '<meta property="og:image" content="' + escAttr(p.og.image) + '">'
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
    ROBOTS: robots,
    OG_BLOCK: og,
    JSONLD_BLOCK: jsonld
  });
}

/* ---- Page complète -------------------------------------------------- */

function buildPage(pages, p) {
  var annonce = read(path.join(SRC, "partials", "annonce.html"));
  var headerTpl = read(path.join(SRC, "partials", "header.html"));
  var footerTpl = read(path.join(SRC, "partials", "footer.html"));
  var mainContent = read(path.join(SRC, "pages", p.id + ".html")).trim();

  var header = fill(headerTpl, { NAV_ITEMS: buildNavItems(pages, p.id) });
  var footer = fill(footerTpl, {
    FOOTER_LE_SITE: buildFooterLeSite(pages),
    FOOTER_ADMISSIONS: buildFooterAdmissions(pages)
  });
  var head = buildHead(p);

  var scripts = (p.dataScripts || [])
    .map(function (s) { return '<script src="data/' + s + '.js"></script>'; })
    .concat(['<script src="app.js"></script>'])
    .join("\n");

  return [
    "<!DOCTYPE html>",
    '<html lang="fr">',
    "<head>",
    head,
    "</head>",
    '<body data-page="' + p.id + '">',
    annonce,
    "",
    header,
    "",
    mainContent,
    "",
    footer,
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

function build() {
  var pages = loadPages();

  ensureDir(DIST);
  ensureDir(path.join(DIST, "data"));

  pages.forEach(function (p) {
    var html = buildPage(pages, p);
    fs.writeFileSync(path.join(DIST, p.out), html, "utf8");
  });

  fs.copyFileSync(path.join(SRC, "styles.css"), path.join(DIST, "styles.css"));
  fs.copyFileSync(path.join(SRC, "app.js"), path.join(DIST, "app.js"));

  ["formations", "frais", "calendrier"].forEach(function (name) {
    fs.copyFileSync(path.join(SRC, "data", name + ".js"), path.join(DIST, "data", name + ".js"));
  });

  console.log("Build OK -> dist/ (" + pages.length + " page(s))");
}

build();

if (process.argv.indexOf("--watch") !== -1) {
  console.log("--watch : reconstruction automatique sur changement dans src/ et pages.config.js");
  var rebuild = function () {
    try { build(); } catch (err) { console.error("Erreur de build :", err.message); }
  };
  fs.watch(SRC, { recursive: true }, rebuild);
  fs.watch(PAGES_CONFIG_PATH, rebuild);
}
