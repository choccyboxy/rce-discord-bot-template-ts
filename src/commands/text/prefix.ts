import { PermissionFlagsBits } from "discord.js";
import { CommandCategory, Emoji } from "../../constants";
import { TextCommand } from "../../structures/types";

const prefix: TextCommand = {
  name: "prefix",
  aliases: ["p"],
  description: "Change the bot's prefix.",
  category: CommandCategory.GENERAL,
  args: [
    {
      name: "prefix",
      type: "string",
      description: "The new prefix for the bot.",
      required: true,
    },
  ],
  required_bot_permissions: [PermissionFlagsBits.SendMessages],
  default_member_permissions: [PermissionFlagsBits.Administrator],

  execute: async ({ client, message, args }) => {
    const new_prefix = args[0];

    if (!new_prefix) {
      message.reply(`> ${Emoji.CROSS} Please provide a new prefix.`);
    }

    if (new_prefix.length > 32) {
      message.reply(`> ${Emoji.CROSS} Prefix must be 32 characters or less.`);
    }

    await client.db.models.Guilds.update(
      { prefix: new_prefix },
      { where: { guild_id: message.guild?.id } }
    )
      .then(() => {
        message.reply(
          `> ${Emoji.CHECK} Prefix has been updated to \`${new_prefix}\`.`
        );
      })
      .catch((ex) => {
        client.logger.error(`Error updating prefix: ` + ex);
        message.reply(
          `> ${Emoji.CROSS} An error occurred while updating the prefix.`
        );
      });
  },
};

export default prefix;
