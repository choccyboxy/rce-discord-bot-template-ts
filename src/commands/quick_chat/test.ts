import { QuickChat } from "rce.js";
import { CommandCategory, RCERanks } from "../../constants";
import { QuickChatCommand } from "../../structures/types";

const test: QuickChatCommand = {
  name: "test",
  trigger: QuickChat.RESPONSES_Hello,
  description: "Test slash command - DEV ONLY",
  category: CommandCategory.DEBUG,
  allowed_ranks: [RCERanks.OWNER],
  allowed_servers: ["example"],
  is_dev_only: true,

  execute: async ({ client, payload }) => {
    client.logger.bot("Test quick_chat command executed.", {
      log_channel: client.config.log_channel_id,
    });

    client.rce_client.sendCommand(
      payload.server.identifier,
      `say Hello, ${payload.ign}!`
    );
  },
};

export default test;
