#!/usr/bin/env node
/* Vérifie l'équilibre des balises HTML de chaque page dans dist/. */
"use strict";

var fs = require("fs");
var path = require("path");

var DIST = path.join(__dirname, "..", "dist");

var VIDES = ["area", "base", "br", "col", "embed", "hr", "img", "input",
  "link", "meta", "param", "source", "track", "wbr", "!doctype"];

function verifierFichier(fichier) {
  var html = fs.readFileSync(fichier, "utf8");

  /* Retire commentaires, puis contenu de <script>/<style> (peut contenir
     des "<" qui ne sont pas des balises). */
  html = html.replace(/<!--[\s\S]*?-->/g, "");
  html = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "<script></script>");
  html = html.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "<style></style>");

  var pile = [];
  var erreurs = [];
  var re = /<\/?([a-zA-Z][a-zA-Z0-9-]*)((?:[^>"']|"[^"]*"|'[^']*')*)>/g;
  var m;
  while ((m = re.exec(html))) {
    var brut = m[0];
    var nom = m[1].toLowerCase();
    var attrs = m[2] || "";
    var fermante = brut.charAt(1) === "/";
    var autofermee = /\/\s*$/.test(attrs) || VIDES.indexOf(nom) !== -1;

    if (fermante) {
      if (VIDES.indexOf(nom) !== -1) { continue; }
      if (pile.length === 0 || pile[pile.length - 1] !== nom) {
        erreurs.push("</" + nom + "> inattendue (pile: " + (pile[pile.length - 1] || "vide") + ")");
        continue;
      }
      pile.pop();
    } else if (!autofermee) {
      pile.push(nom);
    }
  }

  if (pile.length > 0) { erreurs.push("balises jamais fermées : " + pile.join(", ")); }
  return erreurs;
}

function main() {
  var fichiers = fs.readdirSync(DIST).filter(function (f) { return f.endsWith(".html"); });
  var total = 0;

  fichiers.forEach(function (f) {
    var erreurs = verifierFichier(path.join(DIST, f));
    if (erreurs.length > 0) {
      total += erreurs.length;
      console.log(f + " :");
      erreurs.forEach(function (e) { console.log("  - " + e); });
    }
  });

  if (total === 0) {
    console.log("OK - " + fichiers.length + " page(s), balises équilibrées.");
    process.exit(0);
  } else {
    console.error(total + " erreur(s) d'équilibrage.");
    process.exit(1);
  }
}

main();
