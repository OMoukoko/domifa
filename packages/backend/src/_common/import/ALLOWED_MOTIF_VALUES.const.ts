import { UsagerDecisionMotif } from "../../database/entities/usager/UsagerDecisionMotif.type";

export const ALLOWED_MOTIF_VALUES: UsagerDecisionMotif[] = [
  // RADIATIOn
  "A_SA_DEMANDE",
  "PLUS_DE_LIEN_COMMUNE",
  "FIN_DE_DOMICILIATION",
  "NON_MANIFESTATION_3_MOIS",
  "NON_RESPECT_REGLEMENT",
  "ENTREE_LOGEMENT",

  // REFUS
  "HORS_AGREMENT",
  "LIEN_COMMUNE",
  "SATURATION",

  // AUTRE
  "AUTRE",
];