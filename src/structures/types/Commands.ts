import { ChatInputCommandInteraction, Message } from "discord.js";
import { QuickChatEventPayload } from "rce.js";
import BotClient from "../../bot";

interface TextCommandOptions {
  client: BotClient;
  message: Message;
  args: string[];
}

export type TextCommand = {
  name: string;
  aliases?: string[];
  description: string;
  args?: {
    name: string;
    type: string;
    description: string;
    required: boolean;
  }[];
  category: string;
  default_member_permissions?: bigint[];
  required_bot_permissions: bigint[];
  is_dm_allowed?: boolean;
  is_dev_only?: boolean;
  is_test_guild_only?: boolean;
  cooldown?: number;

  execute: (opts: TextCommandOptions) => Promise<void>;
};

interface SlashCommandOptions {
  client: BotClient;
  interaction: ChatInputCommandInteraction;
}

export type SlashCommand = {
  name: string;
  description: string;
  category: string;
  options?: {
    name: string;
    description: string;
    type: number;
    required?: boolean;
    choices?: { name: string; value: string }[];
  }[];
  default_member_permission?: bigint;
  is_dm_allowed?: boolean;
  is_dev_only?: boolean;
  is_test_guild_only?: boolean;
  cooldown?: number;

  execute: (opts: SlashCommandOptions) => Promise<void>;
};

interface SlashSubCommandOptions {
  client: BotClient;
  interaction: ChatInputCommandInteraction;
}

export type SlashSubCommand = {
  name: string;

  execute: (opts: SlashSubCommandOptions) => Promise<void>;
};

interface QuickChatCommandOptions {
  client: BotClient;
  payload: QuickChatEventPayload;
}

export type QuickChatCommand = {
  name: string;
  trigger: string;
  description: string;
  category: string;
  allowed_ranks: string[];
  allowed_servers?: string[];
  is_dev_only?: boolean;
  cooldown?: number;

  execute: (opts: QuickChatCommandOptions) => Promise<void>;
};
