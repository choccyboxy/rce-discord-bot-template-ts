import {
  TextCommand,
  SlashCommand,
  SlashSubCommand,
  QuickChatCommand,
  DiscordEvent,
  RustEvent,
} from "../types";
import { glob } from "glob";
import { ServerOptions } from "rce.js/dist/types";
import BotClient from "../../bot";
import path from "path";

export default class Loader {
  private client: BotClient;

  constructor(client: BotClient) {
    this.client = client;
  }

  public async init() {
    await this._handle_discord_events();
    await this._handle_rce_events();
    await this._load_text_commands();
    await this._load_slash_commands();
    await this._load_quick_chat_commands();
    await this._load_gameservers();
  }

  private async _handle_discord_events() {
    const files = (await glob("build/events/discord/**/*.js")).map((filePath) =>
      path.resolve(filePath)
    );

    files.map(async (file: string) => {
      const event: DiscordEvent = (await import(file)).default;

      if (!event.event)
        return (
          delete require.cache[require.resolve(file)] &&
          console.log(file.split("/").pop() + " does not have an event name...")
        );

      const execute = (...args: any) => event.execute(this.client, ...args);

      if (event.once) {
        this.client.once(event.event, execute);
      } else {
        this.client.on(event.event, execute);
      }

      return delete require.cache[require.resolve(file)];
    });
  }

  private async _handle_rce_events() {
    const files = (await glob("build/events/rce/**/*.js")).map((filePath) =>
      path.resolve(filePath)
    );

    files.map(async (file: string) => {
      const event: RustEvent = (await import(file)).default;

      if (!event.event)
        return (
          delete require.cache[require.resolve(file)] &&
          console.log(file.split("/").pop() + " does not have an event name...")
        );

      const execute = (...args: any) => event.execute(this.client, ...args);

      if (event.once) {
        this.client.rce_client.once(event.event, execute);
      } else {
        this.client.rce_client.on(event.event, execute);
      }

      return delete require.cache[require.resolve(file)];
    });
  }

  private async _load_text_commands() {
    const files = (await glob("build/commands/text/**/*.js")).map((filePath) =>
      path.resolve(filePath)
    );

    files.map(async (file: string) => {
      const text_command: TextCommand = (await import(file)).default;

      if (!text_command.name) {
        return (
          delete require.cache[require.resolve(file)] &&
          console.log(file.split("/").pop() + " does not have a name...")
        );
      }

      const names: string[] = [text_command.name];

      if (text_command.aliases) {
        text_command.aliases.forEach((alias) => names.push(alias));
      }

      this.client.commands.text.set(names, text_command);

      return delete require.cache[require.resolve(file)];
    });
  }

  private async _load_slash_commands() {
    const files = (await glob("build/commands/slash/**/*.js")).map((filePath) =>
      path.resolve(filePath)
    );

    files.map(async (file: string) => {
      const slash_command: SlashCommand | SlashSubCommand = (await import(file))
        .default;

      if (!slash_command.name) {
        return (
          delete require.cache[require.resolve(file)] &&
          console.log(file.split("/").pop() + " does not have a name...")
        );
      }

      if (file.split("/").pop()?.split(".")[2]) {
        return this.client.commands.sub.set(slash_command.name, slash_command);
      }

      this.client.commands.slash.set(
        slash_command.name,
        slash_command as SlashCommand
      );

      return delete require.cache[require.resolve(file)];
    });
  }

  private async _load_quick_chat_commands() {
    const files = (await glob("build/commands/quick_chat/**/*.js")).map(
      (filePath) => path.resolve(filePath)
    );

    files.map(async (file: string) => {
      const quick_chat_command: QuickChatCommand = (await import(file)).default;

      if (!quick_chat_command.name && !quick_chat_command.trigger) {
        return (
          delete require.cache[require.resolve(file)] &&
          console.log(
            file.split("/").pop() + " does not have a name or trigger..."
          )
        );
      }

      this.client.commands.quick_chat.set(
        quick_chat_command.trigger,
        quick_chat_command
      );

      return delete require.cache[require.resolve(file)];
    });
  }

  private async _load_gameservers() {
    const files = (await glob("build/rce/gameservers/**/*.js")).map(
      (filePath) => path.resolve(filePath)
    );

    files.map(async (file: string) => {
      const gameserver: ServerOptions = (await import(file)).default;

      if (
        !gameserver.identifier &&
        !gameserver.region &&
        !gameserver.serverId
      ) {
        return (
          delete require.cache[require.resolve(file)] &&
          this.client.logger.error(
            file.split("/").pop() + " is missing required fields..."
          )
        );
      }

      if (!["US", "EU"].includes(gameserver.region)) {
        return (
          delete require.cache[require.resolve(file)] &&
          this.client.logger.error(
            file.split("/").pop() + " has an invalid region..."
          )
        );
      }

      this.client.rce_client.addServer(gameserver);
    });
  }
}
