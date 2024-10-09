import {
  ChatInputCommandInteraction,
  Collection,
  EmbedBuilder,
  Message,
  MessageType,
} from "discord.js";
import { QuickChatEventPayload } from "rce.js";
import { Emoji } from "../../constants";
import { QuickChatCommand, SlashCommand, TextCommand } from "../types";
import { Guilds } from "../../database/models";
import BotClient from "../../bot";

export default class Handler {
  private client: BotClient;

  constructor(client: BotClient) {
    this.client = client;
  }

  public async handle_text_commands(message: Message) {
    if (message.author.bot) return;
    if (message.poll) return;
    if (
      message.type !== MessageType.Default &&
      message.type !== MessageType.Reply
    )
      return;

    const guild: any = await Guilds.findOne({
      where: { guild_id: message.guild?.id },
    }).catch((ex) => {
      this.client.logger.error(ex);
    });

    if (!guild) {
      await new Guilds({
        guild_id: message.guild?.id,
      })
        .save()
        .catch((ex) => {
          this.client.logger.error(ex);
        });
    }

    const prefix: string = guild?.prefix || this.client.config.default_prefix;
    const data: string[] = message.content
      .slice(prefix.length)
      .trim()
      .split(" ");
    const commandName: string = data.shift()?.toLowerCase()!;

    if (message.content === `<@${this.client.user?.id}>`)
      return message.reply(`> ${Emoji.CHECK} My prefix is \`${prefix}\``);

    if (message.content.slice(0, prefix.length) != prefix) return;

    let command: TextCommand | undefined;

    //TODO: Find better way to go about getting the command data from the collection with alias support.
    this.client.commands.text.forEach((cmd) => {
      if (cmd.aliases?.includes(commandName)) {
        command = cmd;
        return;
      }

      if (cmd.name === commandName) {
        command = cmd;
        return;
      }
    });

    if (!command) return;

    if (command.default_member_permissions) {
      for (const member_permission of command.default_member_permissions) {
        if (!message.member?.permissions.has(member_permission)) return;
      }
    }

    for (const bot_permission of command.required_bot_permissions) {
      if (!message.guild?.members.me?.permissions.has(bot_permission))
        message.reply(
          `> ${Emoji.CROSS} I do not have the permissions required to run this command.`
        );
    }

    if (!command.is_dm_allowed) {
      if (!message.guild) return;
    }

    if (command.is_dev_only) {
      if (!this.client.config.dev_ids.includes(message.author.id)) return;
    }

    if (command.is_test_guild_only) {
      if (message.guildId !== this.client.config.test_guild_id) return;
    }

    const { cooldowns } = this.client;
    if (!cooldowns.has(command.name)) {
      cooldowns.set(command.name, new Collection());
    }

    const now = Date.now();
    const timestamps = cooldowns.get(command.name)!;
    const cooldownAmount =
      (command.cooldown || this.client.config.default_cooldown) * 1000;

    if (
      timestamps.has(message.author.id) &&
      now < (timestamps.get(message.author.id) || 0) + cooldownAmount
    ) {
      message
        .reply({
          embeds: [
            new EmbedBuilder()
              .setColor("Red")
              .setDescription(
                `${Emoji.CROSS} Please wait another \`${(
                  ((timestamps.get(message.author.id) || 0) +
                    cooldownAmount -
                    now) /
                  1000
                ).toFixed(1)}\`s to run this command`
              ),
          ],
        })
        .then((response) => {
          setTimeout(
            () =>
              response.delete().catch((ex) => {
                this.client.logger.error(ex);
              }),
            15000
          );
        });
    }

    timestamps.set(message.author.id, now);
    setTimeout(() => {
      timestamps.delete(message.author.id);
    }, cooldownAmount);

    try {
      await command.execute({ client: this.client, message, args: data });
    } catch (ex) {
      message.reply(
        `> An unexpected error occurred while running the command.`
      );
      this.client.logger.error(
        `Error occured whilerunning command\n\nName: ${command.name}\nExecuted by: ${message.author.username}\nFull message: ${message.content}\n${ex}}`
      );
    }
  }

  public async handle_slash_commands(interaction: ChatInputCommandInteraction) {
    if (!interaction.isChatInputCommand()) return;

    const command: SlashCommand | undefined = this.client.commands.slash.get(
      interaction.commandName
    );

    if (!command) {
      this.client.commands.slash.delete(interaction.commandName);

      interaction.reply({
        content: "This command does not exist",
        ephemeral: true,
      });

      return;
    }

    const { cooldowns } = this.client;
    if (!cooldowns.has(command.name)) {
      cooldowns.set(command.name, new Collection());
    }

    const now = Date.now();
    const timestamps = cooldowns.get(command.name)!;
    const cooldownAmount =
      (command.cooldown || this.client.config.default_cooldown) * 1000;

    if (
      timestamps.has(interaction.user.id) &&
      now < (timestamps.get(interaction.user.id) || 0) + cooldownAmount
    ) {
      interaction
        .reply({
          embeds: [
            new EmbedBuilder()
              .setColor("Red")
              .setDescription(
                `${Emoji.CROSS} Please wait another \`${(
                  ((timestamps.get(interaction.user.id) || 0) +
                    cooldownAmount -
                    now) /
                  1000
                ).toFixed(1)}\`s to run this command`
              ),
          ],
        })
        .then((response) => {
          setTimeout(
            () =>
              response.delete().catch((ex) => {
                this.client.logger.error(ex);
              }),
            15000
          );
        });
    }

    timestamps.set(interaction.user.id, now);
    setTimeout(() => {
      timestamps.delete(interaction.user.id);
    }, cooldownAmount);

    try {
      const sub_command_group = interaction.options.getSubcommandGroup(false);
      const sub_command = `${interaction.commandName}${
        sub_command_group ? `.${sub_command_group}` : ""
      }.${interaction.options.getSubcommand(false) || ""}`;

      this.client.commands.sub
        .get(sub_command)
        ?.execute({ client: this.client, interaction }) ||
        command.execute({ client: this.client, interaction });

      return;
    } catch (error) {
      interaction.reply({
        content: "Error while running command.",
        ephemeral: true,
      });
      console.log(error);
    }
  }

  public async handle_quick_chat_commands(payload: QuickChatEventPayload) {
    const { message, ign, server } = payload;
    const { rce_client } = this.client;

    const command: QuickChatCommand | undefined =
      this.client.commands.quick_chat.get(message);

    if (!command) return;

    if (
      command.allowed_servers &&
      !command.allowed_servers.includes(server.identifier)
    )
      return;

    if (command.is_dev_only && !this.client.config.dev_igns.includes(ign))
      return;

    if (command.allowed_ranks) {
      const rank = await this.get_player_rank(payload);

      if (!command.allowed_ranks.includes(rank)) return;
    }

    const { cooldowns } = rce_client;
    if (!cooldowns.has(command.name)) {
      cooldowns.set(command.name, new Collection());
    }

    const now = Date.now();
    const timestamps = cooldowns.get(command.name)!;
    const cooldownAmount =
      (command.cooldown || this.client.config.default_quick_chat_cooldown) *
      1000;

    if (
      timestamps.has(ign) &&
      now < (timestamps.get(ign) || 0) + cooldownAmount
    ) {
      return;
    }

    timestamps.set(ign, now);
    setTimeout(() => {
      timestamps.delete(ign);
    }, cooldownAmount);

    try {
      await command.execute({ client: this.client, payload });
    } catch (ex) {
      this.client.logger.error(
        `Failed to execute quick chat command ${command.name}\n\n` + ex
      );
    }
  }

  private async get_player_rank(payload: QuickChatEventPayload) {
    const { server, ign } = payload;
    const { rce_client } = this.client;

    const rank_data = await rce_client.sendCommand(
      server.identifier,
      `global.getauthlevel "${ign}"`,
      true
    );

    if (!rank_data) {
      this.client.logger.error(`Failed to get rank for ${ign}...`, {
        log_channel: this.client.config.log_channel_id,
      });
      return "unknown";
    }

    const rank = rank_data.split(" ")[2];

    return rank;
  }
}
