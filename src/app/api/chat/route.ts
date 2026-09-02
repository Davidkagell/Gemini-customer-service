import { hasLocale } from "next-intl";
import type { UIMessage } from "ai";
import { createChatResponse } from "@/lib/chat/pipeline";
import { routing } from "@/i18n/routing";
import {
  MAX_MESSAGE_LENGTH,
  type ChatUIMessage,
} from "@/types/chat";

function getTextFromMessage(message: UIMessage): string {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => (part.type === "text" ? part.text : ""))
    .join("")
    .trim();
}

function parseLocale(value: unknown) {
  if (typeof value === "string" && hasLocale(routing.locales, value)) {
    return value;
  }

  return routing.defaultLocale;
}

function missingApiKey(): string | null {
  const googleKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim();

  if (!googleKey || googleKey === "AIza...") {
    return "Saknad API-nyckel: GOOGLE_GENERATIVE_AI_API_KEY. Lägg till den i .env.local (se .env.example).";
  }

  return null;
}

export async function POST(req: Request) {
  try {
    const keyError = missingApiKey();
    if (keyError) {
      return Response.json({ error: keyError }, { status: 500 });
    }

    const body = await req.json();
    const messages = (body?.messages ?? []) as ChatUIMessage[];
    const locale = parseLocale(body?.locale);

    if (!Array.isArray(messages) || messages.length === 0) {
      return Response.json(
        { error: "Meddelandelistan får inte vara tom." },
        { status: 400 },
      );
    }

    const lastUserMessage = [...messages]
      .reverse()
      .find((message) => message.role === "user");

    if (!lastUserMessage) {
      return Response.json(
        { error: "Inget användarmeddelande hittades." },
        { status: 400 },
      );
    }

    const text = getTextFromMessage(lastUserMessage);
    if (!text) {
      return Response.json(
        { error: "Meddelandet får inte vara tomt." },
        { status: 400 },
      );
    }

    if (text.length > MAX_MESSAGE_LENGTH) {
      return Response.json(
        {
          error: `Meddelandet är för långt (max ${MAX_MESSAGE_LENGTH} tecken).`,
        },
        { status: 400 },
      );
    }

    return createChatResponse(messages, locale);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Kunde inte starta chatten.";
    return Response.json({ error: message }, { status: 500 });
  }
}
