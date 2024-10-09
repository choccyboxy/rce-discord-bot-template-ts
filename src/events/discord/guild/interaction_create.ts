import { ChatInputCommandInteraction, Events } from "discord.js";
import { DiscordEvent } from "../../../structures/types";

const interaction_create: DiscordEvent = {
  event: Events.InteractionCreate,
  description: "This event is triggered when an interaction is created.",
  once: false,

  execute: async (client, interaction: ChatInputCommandInteraction) => {
    if (!interaction) return;

    client.handler.handle_slash_commands(interaction);
  },
};

export default interaction_create;
