import { LogType } from "../../constants";
import BotClient from "../../bot";

interface DiscordLogOptions {
  log_channel: string;
}

export default class Logger {
  client: BotClient;

  constructor(client: BotClient) {
    this.client = client;
  }

  public info(message: string, discord?: DiscordLogOptions): void {
    console.log(`[${LogType.INFO}]        ${message}`);

    if (discord) {
      this._discord(message, LogType.INFO, discord.log_channel).catch((ex) =>
        this.error(ex.message)
      );
    }
  }

  public error(message: string, discord?: DiscordLogOptions): void {
    console.log(`[${LogType.ERROR}]        ${message}`);

    if (discord) {
      this._discord(message, LogType.ERROR, discord.log_channel).catch((ex) =>
        this.error(ex.message)
      );
    }
  }

  public warn(message: string, discord?: DiscordLogOptions): void {
    console.log(`[${LogType.WARN}]        ${message}`);

    if (discord) {
      this._discord(message, LogType.WARN, discord.log_channel).catch((ex) =>
        this.error(ex.message)
      );
    }
  }

  public bot(message: string, discord?: DiscordLogOptions): void {
    console.log(`[${LogType.BOT}]        ${message}`);

    if (discord) {
      this._discord(message, LogType.BOT, discord.log_channel).catch((ex) =>
        this.error(ex.message)
      );
    }
  }

  private async _discord(
    message: string,
    log_type: string,
    log_channel: string
  ): Promise<void> {
    let channel = this.client.channels.cache.get(log_channel);

    if (!channel) {
      channel = (await this.client.channels.fetch(log_channel)) as any;
    }

    if (!channel) {
      return this.error(`Log channel ${log_channel} not found.`);
    }

    if (!channel.isSendable()) {
      return this.error(`Log channel ${log_channel} not sendable.`);
    }

    channel.send(
      `\`[${log_type}]\` ${message}\n-# <t:${(
        new Date().valueOf() / 1000
      ).toFixed()}:D>`
    );
  }
}
