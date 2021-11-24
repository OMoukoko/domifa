import { appLogger } from "../../../../util";
import { messageEmailRepository } from "../../message-email";
import { dataEmailAnonymizer } from "./dataEmailAnonymizer";

export const dataMessageEmailAnonymizer = {
  anonymizeEmail,
};

async function anonymizeEmail() {
  const emailToSendToSkip = await messageEmailRepository.count({
    where: {
      status: "pending",
    },
  });

  appLogger.warn(
    `[dataMessageEmailAnonymizer] ${emailToSendToSkip} EMAIL to skip`
  );

  await messageEmailRepository.updateMany(
    { status: "pending" },
    {
      status: "sent",
    }
  );

  const emailPhoneNumberToAnonymizeCount = await messageEmailRepository.count(
    {}
  );
  appLogger.warn(
    `[dataMessageEmailAnonymizer] ${emailPhoneNumberToAnonymizeCount} EMAIL to anonymize`
  );

  await messageEmailRepository.updateMany(
    {},
    {
      sendDetails: {
        sent: [],
        skipped: [],
        serverResponse: "fake",
      },
      content: {
        from: {
          address: dataEmailAnonymizer.anonymizeEmail({
            prefix: "from",
            id: "1",
          }),
          personalName: "xxx",
        },
        html: "",
        text: "",
        subject: "",
        replyTo: {
          address: dataEmailAnonymizer.anonymizeEmail({
            prefix: "reply-to",
            id: "2",
          }),
          personalName: "xxx",
        },
        to: [
          {
            address: dataEmailAnonymizer.anonymizeEmail({
              prefix: "to",
              id: "3",
            }),
            personalName: "xxx",
          },
        ],
        icalEvent: null,
      },
    }
  );
}