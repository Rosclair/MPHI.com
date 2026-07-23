# À valider avec MPHI

Consolidation des commentaires `À VALIDER AVEC MPHI` (et équivalents) qui étaient
en tête de chaque page avant la restructuration. Groupés par page, texte intégral
conservé. Ces points concernent des données/décisions à obtenir de MPHI — aucun
n'est un point technique du site.

Deux notes de nettoyage relevées pendant la migration, non liées à une donnée
MPHI, sont en fin de document.

## index.html

- **[TODO-1]** Numéro complet de l'autorisation MINESUP (la brochure indique « du
  1er août 2023 », le numéro est partiellement lisible). Ne jamais publier un
  numéro approximatif.
- **[TODO-2]** Frais de formation : absents de la brochure — volontairement non
  affichés ici.
- **[TODO-3]** Incohérence sur la brochure elle-même : le volet photos inverse
  les repères des campus B et C par rapport aux blocs contacts. Version retenue
  (blocs contacts, 3 occurrences concordantes) : A = Carrefour Saint-Thomas,
  B = Bocom Marché B, C = Entrée de la ville (Borne fontaine). À trancher avec
  MPHI.
- **[TODO-4]** Image Open Graph : créer `assets/og/accueil.jpg` (1200×630) avant
  mise en ligne.
- **[TODO-5]** Liens sociaux : la brochure indique @MongaPolytechnic — vérifier
  les URL exactes.

## dossier.html

- **[TODO-1]** Le volet anglais omet la photocopie du diplôme, présente côté
  français — probable oubli d'impression, à confirmer.
- **[TODO-2]** Horaires d'ouverture des secrétariats : non publiés — la page
  renvoie « aux heures d'ouverture » sans inventer de créneaux.
- **[TODO-3]** « Un carton de format » : le format exact est « précisé au
  secrétariat » (mention du volet EN), repris tel quel.

## campus.html

- **[TODO-1]** Coordonnées GPS exactes ou Plus Codes des 3 campus, à récupérer
  lors de la création des fiches Google Business (Lot 3). Remplacer alors les
  requêtes des cartes et des itinéraires.
- **[TODO-2]** Répartition des filières par campus : information absente de la
  brochure — volontairement non affichée.
- **[TODO-3]** Photos réelles des 3 campus à fournir (gabarits « Photo à
  venir »).
- **[TODO-4]** Repères des campus B et C : la brochure se contredit entre son
  volet photos et ses blocs contacts (cf. index.html [TODO-3]).

## fiche.html (modèle × 106)

- **[TODO-1]** Durée « 2 ans » : standard BTS/HND, affichée comme indicative —
  à confirmer spécialité par spécialité à l'atelier contenu.
- **[TODO-2]** Débouchés et programme par spécialité : à collecter (champ prévu
  dans `data/formations.js` le moment venu).
- **[TODO-3]** Aperçus de partage (Open Graph) : en statique avec `?f=`,
  WhatsApp affichera l'aperçu générique. Une conversion vers un générateur de
  routes dédiées par fiche (`/formations/[slug]/`) permettrait un OG spécifique
  par spécialité.

## contact.html

- **[TODO-1]** Deux adresses email différentes sont imprimées sur la même
  brochure : `mongahigherpolytechnicinstitute@gmail.com` (volet FR) et
  `mongapolytechnic@gmail.com` (volet EN). Trancher l'officielle. La première
  est utilisée ici et dans tous les pieds de page.
- **[TODO-2]** Horaires d'ouverture : non publiés. La mention « du lundi au
  samedi », apparue par erreur sur l'accueil, a été retirée.
- **[TODO-3]** URLs exactes des réseaux (@MongaPolytechnic) à vérifier — la
  brochure montre les icônes Facebook et Instagram.

## admissions.html

- **[TODO-1]** Modalités exactes du parcours combiné « DQP + BTS en 2 ans »
  (conditions d'entrée, organisation) : annoncé sur la brochure sans détail —
  présenté ici fidèlement, détail renvoyé au secrétariat.
- **[TODO-2]** Grille des frais par formation : jamais publiée — aucun montant
  n'est affiché sur le site. À collecter pour créer la page dédiée.
- **[TODO-3]** Dates du calendrier académique (rentrée, sessions) : non
  publiées — renvoi au secrétariat.
- **[TODO-4]** Durée des Licences et Masters professionnels : non précisée.

## frais-et-bourses.html

- **[TODO-1]** Assiette exacte de la bourse : la brochure dit « jusqu'à 50 % de
  réduction à l'inscription » (EN : « discount on registration ») — réduction
  SUR les frais d'inscription, ou AU MOMENT de l'inscription sur la scolarité ?
  Ambigu dans les deux langues. Le site reprend la formulation prudente
  actuelle.
- **[TODO-2]** Grille officielle des frais par formation → à saisir dans
  `src/data/frais.js` (voir le modèle commenté dans le fichier).
- **[TODO-3]** Nombre et échéances des tranches : non publiés.
- **[TODO-4]** Conditions précises de la bourse et du bonus permis.

## calendrier.html

- **[TODO-1]** Confirmer officiellement l'ouverture des inscriptions 2026-2027
  et sa période — c'est la seule affirmation datée du site (bandeau
  d'annonce), héritée de la campagne de la brochure (« tu peux t'inscrire »).
- **[TODO-2]** Dates officielles (rentrée, échéances, sessions) → à saisir dans
  `src/data/calendrier.js` (voir le modèle commenté dans le fichier).

## preinscription.html

- **[TODO-1]** Destinataire des préinscriptions (adresse email du secrétariat —
  lié à l'ambiguïté des deux emails de la brochure, cf. contact.html).
- **[TODO-2]** Choix du service d'envoi direct si le mode WhatsApp est
  abandonné (Formspree ~50 envois/mois gratuits, Web3Forms ~250) selon le
  volume attendu en période de rentrée. Actuellement `POINT_ENVOI = ""` dans
  `src/app.js` : mode WhatsApp actif.
- **[TODO-3]** Page `confidentialite.html` à rédiger avant d'activer le mode
  endpoint (mentions de collecte) — le lien existe déjà sous le formulaire.

## faq.html — à mettre à jour quand MPHI publie ses données

- Coût des formations → `src/data/frais.js`.
- Date de rentrée → `src/data/calendrier.js`.
- Campus par spécialité.
- FAQ vivante : à chaque mise à jour, ajouter les vraies questions récurrentes
  de WhatsApp — les intentions tracées (`contact-wa-*`, `admissions-whatsapp-*`,
  `frais-whatsapp-*`) indiquent lesquelles.

## index.html, formations.html, 404.html, merci.html

Pas de point « À valider avec MPHI » propre à ces pages (au-delà des points
communs déjà listés pour index.html ci-dessus).

---

## Notes de nettoyage (pas des données MPHI, corrigées pendant la migration)

- **404.html — `PAGES_PREVUES`** contenait encore une entrée `"faq"` alors que
  `faq.html` était déjà livrée. Retirée lors de la migration vers `app.js`,
  conformément à l'instruction « ENTRETIEN » du fichier d'origine.
- **admissions.html** — son commentaire d'en-tête affirmait que
  `frais-et-bourses.html` et `calendrier.html` seraient « absorbées en
  sections », alors que ces deux pages existaient déjà comme pages dédiées.
  Commentaire obsolète, non repris dans la nouvelle structure.
