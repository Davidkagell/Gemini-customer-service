import { createAgentUIStreamResponse } from "ai";
import type { Locale } from "@/app/messages";
import { createCustomerServiceAgent } from "@/lib/chat/agent";
import type { ChatUIMessage } from "@/types/chat";

export function createChatResponse(
  uiMessages: ChatUIMessage[],
  locale: Locale,
) {
  const agent = createCustomerServiceAgent(locale);

  return createAgentUIStreamResponse({
    agent,
    uiMessages,
  });
}
