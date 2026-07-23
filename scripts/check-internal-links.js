#!/usr/bin/env node
/* Vérifie que tout lien interne de dist/*.html résout vers un fichier
   réel de dist/ (ancre/paramètres facultatifs) ou vers l'une des pages
   volontairement 404 (orienteur, institut, mentions-legales,
   confidentialite). Vérifie aussi que les ancres #id ciblent un id
   existant dans la page de destination. */
"use strict";

var fs = require("fs");
var path = require("path");

var DIST = path.join(__dirname, "..", "dist");
var PAGES_404_PREVUES = ["orienteur.html", "institut.html", "mentions-legales.html", "confidentialite.html"];

function listerPages() {
  return fs.readdirSync(DIST).filter(function (f) { return f.endsWith(".html"); });
}

function idsDe(html) {
  var ids = {};
  var re = /\bid=["']([^"']+)["']/g;
  var m;
  while ((m = re.exec(html))) { ids[m[1]] = true; }
  return ids;
}

function main() {
  var pages = listerPages();
  var contenu = {};
  var idsParPage = {};
  pages.forEach(function (p) {
    contenu[p] = fs.readFileSync(path.join(DIST, p), "utf8");
    idsParPage[p] = idsDe(contenu[p]);
  });

  var anomalies = [];
  var reAncre = /<a\b[^>]*\bhref=["']([^"']+)["']/gi;

  pages.forEach(function (page) {
    var m;
    reAncre.lastIndex = 0;
    while ((m = reAncre.exec(contenu[page]))) {
      var href = m[1];

      if (/^(https?:|mailto:|tel:|data:|javascript:)/i.test(href)) { continue; }

      if (href.charAt(0) === "#") {
        var idLocal = href.slice(1);
        if (idLocal && !idsParPage[page][idLocal]) {
          anomalies.push(page + " -> " + href + " (ancre locale introuvable)");
        }
        continue;
      }

      var sansHash = href.split("#");
      var cheminEtQuery = sansHash[0];
      var ancre = sansHash[1];
      var cible = cheminEtQuery.split("?")[0];

      if (cible === "") { continue; } /* lien de type "?x=y" ou "#..." déjà traité */

      var estPagePrevue = PAGES_404_PREVUES.indexOf(cible) !== -1;
      var estPageReelle = pages.indexOf(cible) !== -1;

      if (!estPagePrevue && !estPageReelle) {
        anomalies.push(page + " -> " + href + " (cible inconnue)");
        continue;
      }

      if (ancre && estPageReelle && !idsParPage[cible][ancre]) {
        anomalies.push(page + " -> " + href + " (ancre #" + ancre + " absente de " + cible + ")");
      }
    }
  });

  if (anomalies.length === 0) {
    console.log("OK - liens internes de " + pages.length + " page(s) tous résolus (pages prévues 404 : " + PAGES_404_PREVUES.join(", ") + ").");
    process.exit(0);
  } else {
    console.error(anomalies.length + " anomalie(s) :");
    anomalies.forEach(function (a) { console.error("  - " + a); });
    process.exit(1);
  }
}

main();
