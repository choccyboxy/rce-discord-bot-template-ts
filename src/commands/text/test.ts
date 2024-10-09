import { PermissionFlagsBits } from "discord.js";
import { CommandCategory, Emoji } from "../../constants";
import { TextCommand } from "../../structures/types";

const test: TextCommand = {
  name: "test",
  aliases: ["t"],
  description: "Test text command - DEV ONLY",
  category: CommandCategory.DEBUG,
  required_bot_permissions: [PermissionFlagsBits.SendMessages],
  is_dev_only: true,

  execute: async ({ client, message }) => {
    client.logger.bot("Test text command executed.", {
      log_channel: client.config.log_channel_id,
    });

    message.reply(
      `> ${Emoji.CHECK} \`${
        message.author.username
      }\` text command test successful\n-# Uptime: ${
        (client.uptime || 0) / 1000
      }s`
    );
  },
};

export default test;
