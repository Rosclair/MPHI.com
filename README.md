# MPHI.com - site statique

Site vitrine de MPHI (Monga Polytechnic Higher Institute, Bafoussam). Généré par
un petit assembleur Node natif (`build.js`, zéro dépendance npm) depuis des
partials + une config centrale, vers un dossier `dist/` plat prêt à déployer.

## Commandes

```bash
node build.js            # génère dist/ une fois
node build.js --watch    # régénère dist/ à chaque changement dans src/ ou pages.config.js
```

Aucune installation requise (`node_modules`, npm install…) - seul Node.js est
nécessaire. `dist/` fonctionne aussi bien servi par un hébergeur qu'ouvert
directement en `file://` (aucun appel réseau vers un serveur applicatif).

## Arborescence

```
src/
  partials/
    annonce.html     lien d'évitement + bandeau d'annonce (statique, identique partout)
    header.html       header, avec {{NAV_ITEMS}} généré par build.js
    footer.html       footer, avec {{FOOTER_LE_SITE}} / {{FOOTER_ADMISSIONS}} générés
    head-meta.html    <head> commun, avec {{TITLE}}/{{DESCRIPTION}}/{{ROBOTS}}/{{OG_BLOCK}}/{{JSONLD_BLOCK}}
  pages/              un fichier par page = uniquement le <main> (+ <noscript> le cas échéant)
  styles.css          CSS unique du site (fusion des 13 <style> locaux d'origine)
  app.js              JS unique du site (site.js + les 10 scripts de page, concaténés)
  data/
    formations.js     26 filières, 106 spécialités - source du catalogue, des fiches, des datalists
    frais.js          grille des frais - null tant que non publiée (voir plus bas)
    calendrier.js     calendrier académique - null tant que non publié (voir plus bas)
build.js              assembleur (lit pages.config.js + src/, écrit dist/)
pages.config.js        config centrale : une entrée par page (voir plus bas)
scripts/               scripts de vérification, à lancer sur dist/ (voir plus bas)
dist/                  sortie du build - À DÉPLOYER (générée, non versionnée dans git)
_avant/                copie des 18 fichiers de la racine avant restructuration + 4
                        doublons de téléchargement, gardée pour comparaison rapide
                        (l'état complet reste aussi dans l'historique git, premier commit)
TODO-MPHI.md            tout ce qui reste à valider avec MPHI (données, pas du code)
```

## Ajouter une page

1. Créer `src/pages/<id>.html` avec uniquement le contenu de `<main id="contenu">…</main>`
   (et un `<noscript>` juste après si la page en a besoin).
2. Ajouter une entrée dans `pages.config.js` (voir les entrées existantes comme
   modèle) : `id`, `out` (nom de fichier de sortie), `title`, `description`,
   `og` (ou `null`), `robots` (ou `null`), `jsonld` (tableau, souvent vide),
   `navGroup` (`"principal"`, `"admissions"` ou `null` si la page ne doit pas
   apparaître dans la nav - cas de `fiche`, `merci`, `404`), `navLabel`,
   `navSectionKey` (quelle section de nav doit être marquée `aria-current` sur
   cette page), `inHeaderNav`, `dataScripts` (parmi `"formations"`, `"frais"`,
   `"calendrier"`).
3. `node build.js`.

La nav (barre + dropdown Admissions) et le plan du site du footer sont générés
automatiquement depuis `pages.config.js` - inutile de toucher aux partials pour
une page classique. Seules exceptions codées en dur dans les partials/`build.js` :
le lien « L'institut » (page pas encore livrée, volontairement 404) et
l'ordre fixe de la barre principale (Formations · Admissions ▾ · Campus ·
L'institut · Contact).

## Comment le client active les données

`src/data/frais.js` et `src/data/calendrier.js` valent `null` tant que MPHI n'a
pas validé sa grille de frais / son calendrier officiel - les pages
correspondantes affichent alors un état d'attente qui convertit la question en
message WhatsApp tracé. Pour publier :

1. Ouvrir le fichier concerné (`src/data/frais.js` ou `src/data/calendrier.js`).
2. Remplacer `null` par l'objet du modèle commenté dans le même fichier
   (structure documentée en commentaire, avec un exemple rempli).
3. `node build.js`.

La page se rend alors automatiquement (tableau des frais, ou liste des
événements triée avec les dates passées grisées) - aucune autre modification
n'est nécessaire.

## Vérifications (`scripts/`, à lancer sur `dist/` après chaque build)

```bash
node scripts/check-html-balance.js      # équilibre des balises, 13 pages
node scripts/check-css-classes.js       # chaque classe utilisée a une règle CSS
node scripts/check-node-syntax.js       # node --check sur app.js, build.js, data/*.js
node scripts/check-internal-links.js    # tout lien interne résout vers une page/ancre réelle
node scripts/check-content-parity.js    # texte visible identique à _avant/ (hors nav)
```

## Invariants à ne pas casser

- URLs de sortie identiques (`formations.html`, ancres `#campus-a/b/c`, `#dates`,
  les 17 ids de questions FAQ…) et paramètres d'URL (`?f=`, `?diplome=`,
  `?filiere=`, `?profil=`, `?via=&f=&d=`).
- `localStorage` (checklist dossier, clé `mphi_dossier_v1`) et `sessionStorage`
  (lien WhatsApp exact entre préinscription et merci, clé `mphi_pre_wa`)
  toujours accédés sous `try/catch`.
- `data-lead` sur chaque lien WhatsApp/téléphone/CTA - écouteur délégué dans
  `app.js`, couvre aussi les éléments injectés dynamiquement.
- Messages WhatsApp pré-remplis : texte inchangé depuis l'origine.
- Styles d'impression de `dossier.html` : scopés sous `body[data-page="dossier"]`
  dans `styles.css` pour ne pas affecter l'impression des autres pages.
- 404 intelligente : `PAGES_PREVUES` dans `app.js` (bloc `404.html`), liste
  actuelle : `orienteur`, `institut`, `mentions-legales`, `confidentialite`.
