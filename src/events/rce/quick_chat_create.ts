import { QuickChatEventPayload, RCEEvent } from "rce.js";
import { RustEvent } from "../../structures/types";

const quick_chat_create: RustEvent = {
  event: RCEEvent.QuickChat,
  description: "This event is triggered when a quick chat is created.",
  once: false,

  execute: async (client, payload: QuickChatEventPayload) => {
    if (!payload.message) return;

    client.handler.handle_quick_chat_commands(payload);
  },
};

export default quick_chat_create;
