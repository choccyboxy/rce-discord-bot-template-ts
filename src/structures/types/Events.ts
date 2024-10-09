import { ClientEvents } from "discord.js";
import { RCEEventTypes } from "rce.js/dist/types";
import BotClient from "../../bot";

export type DiscordEvent = {
  event: keyof ClientEvents;
  description: string;
  once: boolean;

  execute: (client: BotClient, ...args: any[]) => Promise<void>;
};

export type RustEvent = {
  event: keyof RCEEventTypes;
  description: string;
  once: boolean;

  execute: (client: BotClient, ...args: any[]) => Promise<void>;
};
