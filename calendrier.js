/* ============================================================
   MPHI — calendrier académique (données)
   État actuel : AUCUNE date publiée par MPHI (brochure muette).
   La page calendrier.html affiche donc la chronologie du candidat
   et un état d'attente pour les dates officielles.

   ACTIVATION (le jour où la direction fixe ses dates) :
   1. Remplacer « null » ci-dessous par l'objet du modèle commenté.
   2. Renseigner uniquement des dates OFFICIELLES (format AAAA-MM-JJ).
   3. Recharger la page : la liste se rend automatiquement, triée,
      avec les événements passés grisés.

   Catégories reconnues (pour la pastille colorée) :
   "inscriptions" · "rentree" · "paiement" · "examen" · autre texte libre.
   ============================================================ */

window.MPHI_CALENDRIER = null;

/* ----- MODÈLE À REMPLIR (copier hors du commentaire) -----------

window.MPHI_CALENDRIER = {
  valideLe: "2026-08-15",             // date de validation par la direction
  note: "Dates susceptibles d'ajustement — confirmées au secrétariat.",
  evenements: [
    {
      date: "2026-07-01",             // début (obligatoire)
      dateFin: "2026-10-31",          // fin (facultatif, pour une période)
      titre: "Inscriptions 2026-2027",
      description: "Dépôt des dossiers au secrétariat des trois campus.",
      categorie: "inscriptions"
    },
    {
      date: "2026-10-05",
      titre: "Rentrée académique",
      description: "Tous campus.",
      categorie: "rentree"
    },
    {
      date: "2026-11-30",
      titre: "Échéance de la 1re tranche",
      categorie: "paiement"
    }
  ]
};

---------------------------------------------------------------- */
