#!/usr/bin/env node
/* Compare le texte visible de chaque page avant/après restructuration.
   "Avant" = _avant/<page>.html si déjà archivé, sinon les fichiers encore
   à la racine du projet (état pré-migration). Les seuls écarts attendus
   sont dans la nav (dropdown Admissions, colonne footer "Admissions") -
   tout écart en dehors du header/footer fait échouer le script. */
"use strict";

var fs = require("fs");
var path = require("path");

var ROOT = path.join(__dirname, "..");
var DIST = path.join(ROOT, "dist");
var AVANT = fs.existsSync(path.join(ROOT, "_avant")) ? path.join(ROOT, "_avant") : ROOT;

var PAGES = [
  "index.html", "formations.html", "fiche.html", "dossier.html", "campus.html",
  "contact.html", "admissions.html", "frais-et-bourses.html", "calendrier.html",
  "preinscription.html", "merci.html", "faq.html", "404.html"
];

var ENTITES = {
  amp: "&", lt: "<", gt: ">", quot: "\"", apos: "'", nbsp: " "
};

function decoderEntites(texte) {
  return texte.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, function (tout, code) {
    if (code.charAt(0) === "#") {
      var point = code.charAt(1).toLowerCase() === "x"
        ? parseInt(code.slice(2), 16)
        : parseInt(code.slice(1), 10);
      return isNaN(point) ? tout : String.fromCodePoint(point);
    }
    return Object.prototype.hasOwnProperty.call(ENTITES, code) ? ENTITES[code] : tout;
  });
}

/* Retire un <div id="..."> et son contenu en respectant l'imbrication
   (contrairement à un regex non-gourmand, s'arrête au bon </div> même si
   des <div> enfants existent à l'intérieur). */
function retirerDivParId(corps, id) {
  var debut = corps.search(new RegExp('<div\\b[^>]*\\bid="' + id + '"[^>]*>', "i"));
  if (debut === -1) { return corps; }
  var re = /<div\b[^>]*>|<\/div\s*>/gi;
  re.lastIndex = debut;
  var profondeur = 0;
  var m;
  while ((m = re.exec(corps))) {
    profondeur += m[0].charAt(1).toLowerCase() === "d" ? 1 : -1;
    if (profondeur === 0) { return corps.slice(0, debut) + corps.slice(re.lastIndex); }
  }
  return corps;
}

/* Extrait le texte visible : retire <head>, <script>, <style>, commentaires,
   toutes les balises, normalise les espaces. Ne capture pas ce qui est
   injecté par JS au runtime (catalogue, fiche, grilles) puisqu'on compare
   du HTML statique des deux côtés - c'est cohérent, ces deux zones sont
   vides dans le HTML brut avant comme après. Retire aussi l'écran de
   chargement (chrome ajouté après la migration, absent de "avant" par
   construction, comme le sont déjà nav/footer restructurés). */
function texteVisible(html, options) {
  var corps = html.replace(/^[\s\S]*?<body[^>]*>/i, "").replace(/<\/body>[\s\S]*$/i, "");
  corps = retirerDivParId(corps, "chargement");
  if (options && options.retirerNavPiedDePage) {
    corps = corps.replace(/<header\b[\s\S]*?<\/header>/i, "");
    corps = corps.replace(/<footer\b[\s\S]*?<\/footer>/i, "");
  }
  corps = corps.replace(/<!--[\s\S]*?-->/g, "");
  corps = corps.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
  corps = corps.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "");
  corps = corps.replace(/<[^>]+>/g, " ");
  corps = decoderEntites(corps);
  return corps.replace(/\s+/g, " ").trim();
}

function main() {
  var echecs = [];

  PAGES.forEach(function (page) {
    var avantPath = path.join(AVANT, page);
    var distPath = path.join(DIST, page);
    if (!fs.existsSync(avantPath) || !fs.existsSync(distPath)) {
      echecs.push(page + " : fichier manquant (avant=" + fs.existsSync(avantPath) + ", dist=" + fs.existsSync(distPath) + ")");
      return;
    }
    var avantHTML = fs.readFileSync(avantPath, "utf8");
    var distHTML = fs.readFileSync(distPath, "utf8");

    var avantComplet = texteVisible(avantHTML, { retirerNavPiedDePage: false });
    var distComplet = texteVisible(distHTML, { retirerNavPiedDePage: false });
    if (avantComplet === distComplet) { return; }

    /* Écart détecté : retenter en excluant header/footer (nav a changé
       volontairement - dropdown Admissions, colonne footer dédiée). */
    var avantSansNav = texteVisible(avantHTML, { retirerNavPiedDePage: true });
    var distSansNav = texteVisible(distHTML, { retirerNavPiedDePage: true });
    if (avantSansNav === distSansNav) {
      console.log(page + " : écart uniquement dans header/footer (attendu - nav restructurée).");
      return;
    }

    echecs.push(page + " : écart de contenu en dehors du header/footer.");
    var a = avantSansNav, d = distSansNav;
    var i = 0;
    while (i < a.length && i < d.length && a[i] === d[i]) { i++; }
    console.error("  " + page + " - divergence autour du caractère " + i + " :");
    console.error("    avant : ..." + a.slice(Math.max(0, i - 40), i + 40) + "...");
    console.error("    dist  : ..." + d.slice(Math.max(0, i - 40), i + 40) + "...");
  });

  if (echecs.length === 0) {
    console.log("OK - " + PAGES.length + " page(s), contenu visible identique (hors nav restructurée). Référence \"avant\" : " + path.relative(ROOT, AVANT) + "/");
    process.exit(0);
  } else {
    console.error(echecs.length + " page(s) en écart :");
    echecs.forEach(function (e) { console.error("  - " + e); });
    process.exit(1);
  }
}

main();
