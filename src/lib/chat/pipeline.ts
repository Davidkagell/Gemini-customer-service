import { google } from "@ai-sdk/google";
import {
  convertToModelMessages,
  createUIMessageStream,
  streamText,
  toUIMessageStream,
} from "ai";
import type { ChatUIMessage } from "@/types/chat";

const GEMINI_MODEL = google("gemini-3.6-flash");

const SYSTEM_PROMPT = `You are a helpful, accurate assistant. Answer the user's question clearly and thoroughly.`;

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
        temperature: 0.3,
        system: SYSTEM_PROMPT,
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
