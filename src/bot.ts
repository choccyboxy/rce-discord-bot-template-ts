import { Client, Collection } from "discord.js";
import {
  QuickChatCommand,
  SlashCommand,
  SlashSubCommand,
  TextCommand,
} from "./structures/types";
import { Handler, Loader, Logger, RCEClient } from "./structures/classes";
import { LogLevel } from "rce.js";
import { Sequelize } from "sequelize";
import fs from "fs";
import sequelize from "./database";
import "dotenv/config";

interface Config {
  test_guild_id: string;
  log_channel_id: string;
  default_prefix: string;
  default_cooldown: number;
  default_quick_chat_cooldown: number;
  dev_ids: string[];
  dev_igns: string[];
}

export default class BotClient extends Client {
  public config: Config;
  public db: Sequelize;
  public rce_client: RCEClient;
  public handler: Handler;
  public logger: Logger;
  public cooldowns: Collection<string, Collection<string, number>>;
  public commands: {
    text: Collection<string[], TextCommand>;
    slash: Collection<string, SlashCommand>;
    sub: Collection<string, SlashSubCommand>;
    quick_chat: Collection<string, QuickChatCommand>;
  };
  private _loader: Loader;

  constructor() {
    super({
      intents: [
        "MessageContent",
        "Guilds",
        "GuildMessages",
        "DirectMessages",
        "GuildMembers",
        "GuildMessageReactions",
      ],
      allowedMentions: { repliedUser: false },
    });

    this.config = require("../config.json");
    this.db = sequelize;
    this.rce_client = this._generate_rce_client();
    this.handler = new Handler(this);
    this.logger = new Logger(this);
    this.cooldowns = new Collection();
    this.commands = {
      text: new Collection(),
      slash: new Collection(),
      sub: new Collection(),
      quick_chat: new Collection(),
    };
    this._loader = new Loader(this);
  }

  public async init(): Promise<void> {
    await this.rce_client.init();
    await this._loader.init();

    this.login(process.env.BOT_TOKEN);
  }

  private _generate_rce_client(): RCEClient {
    return new RCEClient(
      {
        email: process.env.GPORTAL_EMAIL!,
        password: process.env.GPORTAL_PASSWORD!,
      },
      {
        logFile: this._generate_log_file(),
        logLevel: LogLevel.Info,
      }
    );
  }

  private _generate_log_file(): string {
    const date = new Date();
    const date_string = `${date.getUTCMonth()}-${date.getDate()}-${date.getUTCFullYear()}`;
    const time_string = `${date.getUTCHours()}:${date.getUTCMinutes()}:${date.getUTCSeconds()}`;
    const file_name = `${date_string}[${time_string}].log`;

    fs.writeFileSync(`./src/rce/logs/${file_name}`, "");
    return `./src/rce/logs/${file_name}`;
  }

  public format_command_data(
    commands: Collection<string, SlashCommand>
  ): object[] {
    const data: object[] = [];

    commands.forEach((command) => {
      data.push({
        name: command.name,
        description: command.description,
        options: command.options || null,
        default_member_permissions:
          command.default_member_permission?.toString() || null,
        dm_permission: command.is_dm_allowed || null,
      });
    });

    return data;
  }
}
