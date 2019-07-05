import { Injectable, Logger } from "@nestjs/common";
import * as fs from "fs";
import pdftk = require("node-pdftk");
import * as path from "path";
import { User } from "../../users/user.interface";
import { Usager } from "../interfaces/usagers";

@Injectable()
export class CerfaService {
  public pdfForm: string;
  public infosPdf: any;

  public moisDemande: string;
  public jourDemande: string;
  public anneeDemande: string;

  public phone: string;
  public dateNaissance: any;
  public dateDemande: any;
  public dateRdv: {
    annee: string;
    jour: string;
    mois: string;
    hours: string;
    minutes: string;
  };
  public motifRefus: string;
  public sexe: string;

  private readonly logger = new Logger(CerfaService.name);

  public async attestation(usager: Usager, user: User) {
    const motifsRefusLabels = {
      refus1: "Existence d'un hébergement stable",
      refus2:
        "Nombre de domiciliations de votre organisme prévu par l’agrément atteint (associations)",
      refus3: "En dehors des critères du public domicilié (associations)",
      refus4: "Absence de lien avec la commune (CCAS/commune)",
      refusAutre: "Autre motif"
    };

    let ayantsDroitsTexte = "";

    for (const ayantDroit of usager.ayantsDroits) {
      ayantsDroitsTexte =
        ayantsDroitsTexte +
        ayantDroit.nom +
        " " +
        ayantDroit.prenom +
        " né(e) le " +
        ayantDroit.dateNaissance +
        " - ";
    }

    this.sexe = usager.sexe === "femme" ? "1" : "2";
    this.dateNaissance = this.convertDate(usager.dateNaissance);

    this.logger.log("--- Erreur Cerfa ");
    this.logger.log(usager.dateNaissance);
    this.logger.log(this.dateNaissance);

    this.dateDemande = this.convertDate(usager.decision.dateInstruction);
    this.dateRdv = this.convertDate(usager.rdv.dateRdv);
    this.motifRefus = "";

    if (usager.decision.statut === "refus") {
      this.motifRefus = motifsRefusLabels[usager.decision.motif];
      if (usager.decision.motif === "refusAutre") {
        this.motifRefus =
          this.motifRefus + " : " + usager.decision.motifDetails;
      }
    }

    usager.villeNaissance = usager.villeNaissance.toUpperCase();
    usager.nom = usager.nom.toUpperCase();
    usager.prenom = usager.prenom.toUpperCase();

    const adresseStructure =
      user.structure.adresse +
      ", " +
      user.structure.complementAdresse +
      ", " +
      user.structure.ville +
      ", " +
      user.structure.codePostal;

    this.infosPdf = {
      "topmostSubform[0].Page1[0].AyantsDroits[0]": ayantsDroitsTexte,
      "topmostSubform[0].Page1[0].Datenaissance1[0]": this.dateNaissance.jour,
      "topmostSubform[0].Page1[0].Datenaissance2[0]": this.dateNaissance.mois,
      "topmostSubform[0].Page1[0].Datenaissance3[0]": this.dateNaissance.annee,
      "topmostSubform[0].Page1[0].LieuNaissance[0]": usager.villeNaissance,
      "topmostSubform[0].Page1[0].Mme-Monsieur1[0]": this.sexe,
      "topmostSubform[0].Page1[0].Noms[0]": usager.nom,
      "topmostSubform[0].Page1[0].Prénoms[0]": usager.prenom,
      "topmostSubform[0].Page2[0].NomOrgaDomiciliataire[0]": user.structure.nom,
      "topmostSubform[0].Page2[0].NuméroAgrément[0]": user.structure.agrement,
      "topmostSubform[0].Page2[0].PrefectureDelivrAgrément[0]":
        user.structure.departement
    };

    if (usager.decision.statut === "valide") {
      this.pdfForm = "../../ressources/attestation.pdf";

      this.infosPdf["topmostSubform[0].Page1[0].Nomdelorganisme[0]"] =
        user.structure.nom;

      this.infosPdf["topmostSubform[0].Page1[0].RespOrganisme[0]"] =
        user.structure.responsable.nom +
        " " +
        user.structure.responsable.prenom;

      this.infosPdf["topmostSubform[0].Page1[0].PréfectureayantDélivré[0]"] =
        user.structure.departement;

      this.infosPdf["topmostSubform[0].Page1[0].NumAgrement[0]"] =
        user.structure.agrement;

      this.infosPdf[
        "topmostSubform[0].Page1[0].AdressePostaleOrganisme[0]"
      ] = adresseStructure;

      this.infosPdf["topmostSubform[0].Page1[0].Courriel[0]"] =
        user.structure.email;

      this.infosPdf["topmostSubform[0].Page1[0].téléphone[0]"] =
        user.structure.phone;

      this.infosPdf["topmostSubform[0].Page1[0].Noms2[0]"] = usager.nom;

      this.infosPdf["topmostSubform[0].Page1[0].Prénoms2[0]"] = usager.prenom;

      this.infosPdf[
        "topmostSubform[0].Page1[0].AdressePostale[0]"
      ] = adresseStructure;
    } else {
      this.pdfForm = "../../ressources/demande.pdf";

      this.infosPdf["topmostSubform[0].Page1[0].téléphone[0]"] = usager.phone;

      this.infosPdf["topmostSubform[0].Page1[0].Courriel[0]"] = usager.email;

      this.infosPdf["topmostSubform[0].Page1[0].Groupe_de_boutons_radio[0]"] =
        "1";

      this.infosPdf["topmostSubform[0].Page1[0].LieuNaissance[1]"] =
        usager.villeNaissance;

      this.infosPdf["topmostSubform[0].Page2[0].Mme-Monsieur2[0]"] = this.sexe;

      this.infosPdf["topmostSubform[0].Page2[0].NomsDemandeur[0]"] = usager.nom;

      this.infosPdf["topmostSubform[0].Page2[0].PrénomsDemandeur[0]"] =
        usager.prenom;

      this.infosPdf[
        "topmostSubform[0].Page2[0].JourNaissanceDemandeur[0]"
      ] = this.dateNaissance.jour;

      this.infosPdf[
        "topmostSubform[0].Page2[0].MoisNaissanceDemandeur[0]"
      ] = this.dateNaissance.mois;

      this.infosPdf[
        "topmostSubform[0].Page2[0].AnnéeNaissanceDemandeur[0]"
      ] = this.dateNaissance.annee;

      this.infosPdf["topmostSubform[0].Page2[0].LieuNaissanceDemandeur[0]"] =
        usager.villeNaissance;

      /* FAIT LE */
      this.infosPdf[
        "topmostSubform[0].Page1[0].FaitLeOrganisme1[0]"
      ] = this.dateDemande.jour;

      this.infosPdf[
        "topmostSubform[0].Page1[0].FaitLeOrganisme2[0]"
      ] = this.dateDemande.mois;

      this.infosPdf[
        "topmostSubform[0].Page1[0].FaitLeOrganisme3[0]"
      ] = this.dateDemande.annee;

      this.infosPdf[
        "topmostSubform[0].Page1[0].FaitLeDemandeur1[0]"
      ] = this.dateDemande.jour;

      this.infosPdf[
        "topmostSubform[0].Page1[0].FaitLeDemandeur2[0]"
      ] = this.dateDemande.mois;

      this.infosPdf[
        "topmostSubform[0].Page1[0].FaitLeDemandeur3[0]"
      ] = this.dateDemande.annee;

      this.infosPdf[
        "topmostSubform[0].Page1[0].Jourconvocation[0]"
      ] = this.dateRdv.jour;

      this.infosPdf[
        "topmostSubform[0].Page1[0].Moisconvocation[0]"
      ] = this.dateRdv.mois;

      this.infosPdf[
        "topmostSubform[0].Page1[0].Annéeconvocation[0]"
      ] = this.dateRdv.annee;

      this.infosPdf[
        "topmostSubform[0].Page1[0].Heureconvocation[0]"
      ] = this.dateRdv.hours;

      this.infosPdf[
        "topmostSubform[0].Page1[0].Minuteconvocation[0]"
      ] = this.dateRdv.minutes;

      this.infosPdf["topmostSubform[0].Page1[0].Nomdelorganisme[0]"] =
        user.structure.nom;

      this.infosPdf["topmostSubform[0].Page1[0].PréfectureayantDélivré[0]"] =
        user.structure.departement;

      this.infosPdf["topmostSubform[0].Page1[0].NumAgrement[0]"] =
        user.structure.agrement;

      this.infosPdf[
        "topmostSubform[0].Page1[0].AdressePostale[0]"
      ] = adresseStructure;

      this.infosPdf["topmostSubform[0].Page1[0].Courriel[1]"] =
        user.structure.email;

      this.infosPdf["topmostSubform[0].Page1[0].téléphone[1]"] =
        user.structure.phone;

      this.infosPdf["topmostSubform[0].Page1[0].EntretienAvec[0]"] =
        usager.rdv.userName;

      this.infosPdf[
        "topmostSubform[0].Page1[0].EntretienAdresse[0]"
      ] = adresseStructure;

      if (usager.decision.statut === "refus") {
        this.infosPdf["topmostSubform[0].Page2[0].Décision[0]"] = "2";

        this.infosPdf[
          "topmostSubform[0].Page2[0].MotifRefus[0]"
        ] = this.motifRefus;

        this.infosPdf[
          "topmostSubform[0].Page2[0].OrientationProposée[0]"
        ] = usager.decision.orientationDetails.toString();
      }
    }

    this.logger.log("------- >this.pdfForm");
    this.logger.log(this.infosPdf);

    return pdftk
      .input(fs.readFileSync(path.resolve(__dirname, this.pdfForm)))
      .fillForm(this.infosPdf)
      .output();
  }

  public convertDate(date: any) {
    if (date !== null) {
      return {
        annee: date.getFullYear().toString(),
        hours: date.getHours().toString(),
        jour:
          date.getDate() < 10
            ? "0" + date.getDate().toString()
            : date.getDate().toString(),
        minutes: date.getMinutes().toString(),
        mois:
          date.getMonth() < 9
            ? "0" + (date.getMonth() + 1).toString()
            : (date.getMonth() + 1).toString()
      };
    }
    return {
      annee: "",
      hours: "",
      jour: "",
      minutes: "",
      mois: ""
    };
  }
}
