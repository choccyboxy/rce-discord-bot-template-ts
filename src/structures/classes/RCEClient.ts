import { Collection } from "discord.js";
import { RCEManager } from "rce.js";
import { AuthOptions, LoggerOptions } from "rce.js/dist/types";

export default class RCEClient extends RCEManager {
  public cooldowns: Collection<string, Collection<string, number>>;

  constructor(auth: AuthOptions, logger: LoggerOptions) {
    super(auth, logger);

    this.cooldowns = new Collection();
  }
}
