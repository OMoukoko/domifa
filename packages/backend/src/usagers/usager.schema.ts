// tslint:disable: object-literal-sort-keys
import * as mongoose from "mongoose";
import { Usager } from "./interfaces/usagers";
mongoose.set("debug", true);

export const UsagerSchema = new mongoose.Schema({
  id: {
    type: Number,
    unique: true
  },

  agent: String,
  structure: String,

  nom: String,
  prenom: String,
  surnom: String,
  email: String,
  phone: String,
  sexe: String,

  contactPreference: String,
  dateNaissance: Date,
  villeNaissance: String,

  ayantsDroits: [],
  ayantsDroitsExist: Boolean,

  etapeDemande: Number,

  decision: {
    agent: String,
    dateDebut: Date,
    dateDemande: Date,
    dateFin: Date,
    dateInstruction: Date,
    motif: String,
    motifDetails: String,
    orientation: String,
    orientationDetails: String,
    statut: String,

    userDecisionId: Number,
    userDecisionName: String,
    userInstructionId: Number,
    userInstructionName: String
  },

  historique: String,

  rdv: {
    dateRdv: Date,
    userId: Number,
    userName: String
  },

  entretien: {
    domiciliation: Boolean,
    liencommune: String,
    residence: String,
    residenceDetail: String,
    revenus: Boolean,
    cause: String,
    causeDetail: String,
    pourquoi: String,
    pourquoiDetail: String,
    accompagnement: Boolean,
    accompagnementDetail: String,
    commentaires: String
  },

  lastInteraction: {
    type: {
      nbCourrier: {
        type: Number,
        default: 0
      },
      courrierIn: {
        type: Date,
        default: null
      },
      courrierOut: {
        type: Date,
        default: null
      },
      recommandeIn: {
        type: Date,
        default: null
      },
      recommandeOut: {
        type: Date,
        default: null
      },
      appel: {
        type: Date,
        default: null
      },
      visite: {
        type: Date,
        default: null
      }
    },
    default: {
      nbCourrier: 0,
      courrierIn: null,
      courrierOut: null,
      recommandeIn: null,
      recommandeOut: null,
      appel: null,
      visite: null
    }
  },

  preference: {
    email: Boolean,
    phone: Boolean
  },

  interactions: [],
  docs: [],
  docsPath: []
});

UsagerSchema.pre<Usager>("save", function(next) {
  this.nom = this.nom.charAt(0).toUpperCase() + this.nom.slice(1);
  this.prenom = this.prenom.charAt(0).toUpperCase() + this.prenom.slice(1);
  next();
});
