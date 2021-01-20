import moment = require("moment");
import {
  AppUserForAdminEmail,
  MessageEmailContent,
  MessageEmailIcalEvent,
} from "../../../database";
import { Usager } from "../../../usagers/interfaces/usagers";
import { usagerAppointmentCreatedEmailRenderer } from "../templates-renderers";
import { DOMIFA_DEFAULT_MAIL_CONFIG, messageEmailSender } from "../_core";

export const usagerAppointmentCreatedEmailSender = { sendMail };

async function sendMail({
  user,
  usager,
  icalEvent,
  message,
}: {
  user: AppUserForAdminEmail;
  usager: Usager;
  icalEvent: MessageEmailIcalEvent;
  message: string;
}): Promise<void> {
  const prenomUsager =
    (usager.sexe === "homme" ? "M. " : "Mme. ") +
    usager.nom +
    " " +
    usager.prenom;

  const date = moment(new Date(usager.rdv.dateRdv)).locale("fr").format("L");
  const heure = moment(new Date(usager.rdv.dateRdv)).locale("fr").format("LT");

  const model = {
    prenom: user.prenom,
    usager: prenomUsager,
    date,
    heure,
    message,
  };

  const renderedTemplate = await usagerAppointmentCreatedEmailRenderer.renderTemplate(
    model
  );

  const messageContent: MessageEmailContent = {
    ...DOMIFA_DEFAULT_MAIL_CONFIG,
    ...renderedTemplate,
    to: [
      {
        address: user.email,
        personalName: user.prenom + " " + user.nom,
      },
    ],
    icalEvent,
  };

  messageEmailSender.sendMessageLater(messageContent, {
    emailId: "usager-appointment-created",
  });
}