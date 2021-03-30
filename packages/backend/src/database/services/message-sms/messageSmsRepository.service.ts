import { AppUser } from "../../../_common/model";
import { InteractionType } from "../../../_common/model/interaction";
import { MessageSms } from "../../../_common/model/message-sms";
import { UsagerLight } from "../../entities";
import { MessageSmsTable } from "../../entities/message-sms/MessageSmsTable.typeorm";
import { pgRepository } from "../_postgres";

const baseRepository = pgRepository.get<MessageSmsTable, MessageSms>(
  MessageSmsTable
);

export const SMS_ON_HOLD_INTERACTION: (keyof MessageSms)[] = [
  "uuid",
  "usagerRef",
  "structureId",
  "content",
  "smsId",
  "status",
  "scheduledDate",
  "sendDate",
  "interactionMetas",
  "lastUpdate",
  "statusUpdates",
];

export const messageSmsRepository = {
  ...baseRepository,
  findSmsOnHold,
};

async function findSmsOnHold({
  usager,
  user,
  interactionType,
}: {
  usager: Pick<UsagerLight, "ref">;
  user: Pick<AppUser, "structureId">;
  interactionType: InteractionType;
}): Promise<MessageSms> {
  return messageSmsRepository.findOneWithQuery<MessageSms>({
    select: SMS_ON_HOLD_INTERACTION,
    where: `"interactionMetas"->>'interactionType' = :interactionType and
    status='TO_SEND' and
    "usagerRef"= :usagerRef and
    "structureId"=:structureId `,
    params: {
      usagerRef: usager.ref,
      structureId: user.structureId,
      interactionType,
    },
  });
}
