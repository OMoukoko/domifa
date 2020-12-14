import { Injectable } from "@nestjs/common";
import { domifaConfig } from "../../config";
import {
  MessageEmail,
  MessageEmailContent,
  messageEmailRepository,
  MessageEmailTable,
} from "../../database";
import { MessageEmailConsummer } from "./message-email-consumer.service";

@Injectable()
export class MessageEmailSender {
  constructor(private messageEmailConsummer: MessageEmailConsummer) {}

  public async sendMailLater(
    content: MessageEmailContent,
    {
      initialScheduledDate,
      emailId,
    }: Pick<MessageEmail, "initialScheduledDate" | "emailId">
  ) {
    const messageEmail = new MessageEmailTable({
      status: "pending",
      initialScheduledDate,
      nextScheduledDate: initialScheduledDate,
      emailId,
      content,
    });

    await messageEmailRepository.save(messageEmail);

    if (domifaConfig().cron.emailConsumer.enableSendImmadiately) {
      this.messageEmailConsummer.triggerNextSending();
    }
  }
}