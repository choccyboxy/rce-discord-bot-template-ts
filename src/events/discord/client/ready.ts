import { Routes, REST, Events } from "discord.js";
import { DiscordEvent } from "../../../structures/types";
import * as models from "../../../database/models";
import "dotenv/config";

const ready: DiscordEvent = {
  event: Events.ClientReady,
  description: "This event is triggered when the client is ready.",
  once: true,

  execute: async (client) => {
    client.logger.bot(`Logged in as ${client.user?.tag}`, {
      log_channel: client.config.log_channel_id,
    });

    //@ts-ignore
    const rest = new REST().setToken(client.token);

    const set_guild_commands: any = await rest.put(
      Routes.applicationGuildCommands(
        //@ts-ignore
        client.user?.id,
        client.config.test_guild_id
      ),
      {
        body: client.format_command_data(
          client.commands.slash.filter((command) => command.is_test_guild_only)
        ),
      }
    );

    const set_global_commands: any = await rest.put(
      //@ts-ignore
      Routes.applicationCommands(client.user?.id),
      {
        body: client.format_command_data(
          client.commands.slash.filter((command) => !command.is_test_guild_only)
        ),
      }
    );

    client.logger.bot(
      `Registered ${set_global_commands.length} global slash commands`
    );
    client.logger.bot(
      `Registered ${set_guild_commands.length} test guild slash commands`
    );
    client.logger.bot(`Loaded ${client.commands.text.size} text commands`);
    client.logger.bot(
      `Loaded ${client.commands.quick_chat.size} quick_chat commands`
    );

    Object.keys(models).forEach((ele) => {
      //@ts-ignore
      models[ele].associate(models);
    });

    try {
      await client.db.sync({ force: false });
      client.logger.bot("Connecting to database...");
    } catch (err) {
      client.logger.error(`Could not connect to DB. ${err}`);
    }
  },
};

export default ready;
