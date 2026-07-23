/* ============================================================
   MPHI — grille des frais (données)
   État actuel : AUCUN montant publié par MPHI (brochure muette).
   La page frais-et-bourses.html affiche donc un état d'attente.

   ACTIVATION (le jour où la direction valide sa grille) :
   1. Remplacer « null » ci-dessous par l'objet du modèle commenté.
   2. Renseigner chaque ligne avec les montants OFFICIELS uniquement.
   3. Recharger la page : le tableau se rend automatiquement,
      avec la date de validation affichée.

   RÈGLE : ne jamais publier un montant estimé, arrondi ou
   « d'après souvenir ». Pas de chiffre validé = null.
   ============================================================ */

window.MPHI_FRAIS = null;

/* ----- MODÈLE À REMPLIR (copier hors du commentaire) -----------

window.MPHI_FRAIS = {
  devise: "FCFA",
  valideLe: "2026-09-01",            // date de validation par la direction
  note: "Paiement possible en 3 tranches. Bourse appliquée à l'inscription.",
  lignes: [
    {
      libelle: "BTS — filières industrielles",   // formation ou catégorie
      inscription: 0,                             // frais d'inscription
      scolarite: 0,                               // scolarité annuelle
      tranches: "3 tranches"                      // texte libre (échéancier)
    },
    {
      libelle: "BTS — filières de gestion",
      inscription: 0,
      scolarite: 0,
      tranches: "3 tranches"
    },
    {
      libelle: "HND — all fields",
      inscription: 0,
      scolarite: 0,
      tranches: "3 installments"
    }
  ]
};

---------------------------------------------------------------- */
