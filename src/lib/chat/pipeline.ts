import { google } from "@ai-sdk/google";
import {
  convertToModelMessages,
  createUIMessageStream,
  streamText,
  toUIMessageStream,
} from "ai";
import type { ChatUIMessage } from "@/types/chat";

const GEMINI_MODEL = google("gemini-3.6-flash");

const SYSTEM_INSTRUCTIONS = `You are a customer service agent for Davids boat parts.
Davids boat parts is a company that sells boat parts.
Respond  the user's question clearly and thoroughly. 
Respond the same language as user. 
If there is something you don't know, don't guess.`

export function createChatStream(uiMessages: ChatUIMessage[]) {
  return createUIMessageStream<ChatUIMessage>({
    originalMessages: uiMessages,
    onError: (error) => {
      if (error instanceof Error) return error.message;
      return "Något gick fel i chatten.";
    },
    execute: async ({ writer }) => {
      const modelMessages = await convertToModelMessages(uiMessages);

      const result = streamText({
        model: GEMINI_MODEL,
        temperature: 0.1,
        instructions: SYSTEM_INSTRUCTIONS,
        messages: modelMessages,
      });

      writer.merge(
        toUIMessageStream({
          stream: result.stream,
        }),
      );
    },
  });
}
