export type UsagerImportObject = {
  customId?: string;
  civilite: string;
  nom: string;
  prenom: string;
  surnom?: string;
  dateNaissance: string;
  lieuNaissance: string;
  phone?: string;
  email?: string;
  statutDom: string;
  motifRefus?: string;
  motifRadiation?: string;
  typeDom: string;
  dateDebutDom: string;
  dateFinDom: string;
  datePremiereDom?: string;
  dateDernierPassage?: string;
  orientation?: string;
  orientationDetail?: string;
  domiciliationExistante?: string;
  revenus?: string;
  revenusDetail?: string;
  liencommune?: string;
  liencommuneDetail?: string;
  compositionMenage?: string;
  situationResidentielle?: string;
  situationDetails?: string;
  causeInstabilite?: string;
  causeDetail?: string;
  raisonDemande?: string;
  raisonDemandeDetail?: string;
  accompagnement?: string;
  accompagnementDetail?: string;
  commentaires?: string;
  ayantsDroits?: {
    nom: string;
    prenom: string;
    dateNaissance: string;
    lienParente: string;
  }[];
};
