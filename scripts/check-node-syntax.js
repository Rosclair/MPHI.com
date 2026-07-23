#!/usr/bin/env node
/* Lance `node --check` sur app.js, build.js et les data/*.js. */
"use strict";

var path = require("path");
var execFileSync = require("child_process").execFileSync;

var ROOT = path.join(__dirname, "..");

var FICHIERS = [
  path.join(ROOT, "build.js"),
  path.join(ROOT, "pages.config.js"),
  path.join(ROOT, "src", "app.js"),
  path.join(ROOT, "src", "data", "formations.js"),
  path.join(ROOT, "src", "data", "frais.js"),
  path.join(ROOT, "src", "data", "calendrier.js")
];

function main() {
  var echecs = 0;

  FICHIERS.forEach(function (fichier) {
    var rel = path.relative(ROOT, fichier);
    try {
      execFileSync(process.execPath, ["--check", fichier], { stdio: "pipe" });
      console.log("OK   " + rel);
    } catch (err) {
      echecs += 1;
      console.error("FAIL " + rel);
      console.error(String(err.stderr || err.message).trim());
    }
  });

  if (echecs === 0) {
    console.log("OK — " + FICHIERS.length + " fichier(s) syntaxiquement valides.");
    process.exit(0);
  } else {
    console.error(echecs + " fichier(s) en échec.");
    process.exit(1);
  }
}

main();
