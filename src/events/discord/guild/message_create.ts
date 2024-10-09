import { Events, Message } from "discord.js";
import { DiscordEvent } from "../../../structures/types";

const message_create: DiscordEvent = {
  event: Events.MessageCreate,
  description: "This event is triggered when a message is created.",
  once: false,

  execute: async (client, message: Message) => {
    if (!message.content) return;

    client.handler.handle_text_commands(message);
  },
};

export default message_create;
