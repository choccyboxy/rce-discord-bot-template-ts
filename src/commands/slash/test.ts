import { CommandCategory, Emoji } from "../../constants";
import { SlashCommand } from "../../structures/types";

const test: SlashCommand = {
  name: "test",
  description: "Test slash command - DEV ONLY",
  category: CommandCategory.DEBUG,
  is_test_guild_only: true,
  is_dev_only: true,

  execute: async ({ client, interaction }) => {
    client.logger.bot("Test slash command executed.", {
      log_channel: client.config.log_channel_id,
    });

    interaction.reply(
      `> ${Emoji.CHECK} \`${
        interaction.user.username
      }\` slash command test successful\n-# Uptime: ${
        (client.uptime || 0) / 1000
      }s`
    );
  },
};

export default test;
