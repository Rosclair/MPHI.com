#!/usr/bin/env node
/* Vérifie que chaque classe utilisée (attributs class="" des pages,
   classes construites dynamiquement par app.js) a une règle réelle dans
   styles.css - à l'exception des classes d'état purement JS (whitelist). */
"use strict";

var fs = require("fs");
var path = require("path");

var DIST = path.join(__dirname, "..", "dist");

var WHITELIST_JS = ["visible", "ouverte", "ombre", "prete", "btn-carte", "passe"];

function classesDefiniesDansCSS(css) {
  css = css.replace(/\/\*[\s\S]*?\*\//g, "");
  var classes = {};
  var re = /\.(-?[a-zA-Z_][\w-]*)/g;
  var m;
  while ((m = re.exec(css))) { classes[m[1]] = true; }
  return classes;
}

function classesUtiliseesDansHTML(html) {
  var classes = {};
  var re = /class=["']([^"']+)["']/g;
  var m;
  while ((m = re.exec(html))) {
    m[1].trim().split(/\s+/).forEach(function (c) { if (c) { classes[c] = true; } });
  }
  return classes;
}

function classesUtiliseesDansJS(js) {
  var classes = {};
  var motifs = [
    /classList\.(?:add|remove|toggle)\(\s*["']([^"']+)["']/g,
    /className\s*=\s*["']([^"']+)["']/g,
    /class=\\?["']([^"'\\]+)\\?["']/g
  ];
  motifs.forEach(function (re) {
    var m;
    while ((m = re.exec(js))) {
      m[1].trim().split(/\s+/).forEach(function (c) { if (c) { classes[c] = true; } });
    }
  });
  return classes;
}

function main() {
  var css = fs.readFileSync(path.join(DIST, "styles.css"), "utf8");
  var js = fs.readFileSync(path.join(DIST, "app.js"), "utf8");
  var definies = classesDefiniesDansCSS(css);

  var utilisees = {};
  fs.readdirSync(DIST).filter(function (f) { return f.endsWith(".html"); }).forEach(function (f) {
    var html = fs.readFileSync(path.join(DIST, f), "utf8");
    Object.keys(classesUtiliseesDansHTML(html)).forEach(function (c) {
      (utilisees[c] = utilisees[c] || []).push(f);
    });
  });
  Object.keys(classesUtiliseesDansJS(js)).forEach(function (c) {
    (utilisees[c] = utilisees[c] || []).push("app.js");
  });

  var orphelines = Object.keys(utilisees).filter(function (c) {
    return !definies[c] && WHITELIST_JS.indexOf(c) === -1;
  });

  if (orphelines.length === 0) {
    console.log("OK - " + Object.keys(utilisees).length + " classe(s) utilisée(s), toutes couvertes par styles.css ou la whitelist JS.");
    process.exit(0);
  } else {
    console.error(orphelines.length + " classe(s) sans règle CSS :");
    orphelines.forEach(function (c) {
      console.error("  - ." + c + " (dans : " + utilisees[c].join(", ") + ")");
    });
    process.exit(1);
  }
}

main();
