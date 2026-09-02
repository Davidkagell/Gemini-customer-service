import { InferAgentUIMessage, ToolLoopAgent } from "ai";
import type { Locale } from "@/app/messages";
import { org } from "@/config/org";
import { geminiModel } from "@/lib/chat/gemini-model";
import { createSearchProductsTool } from "@/lib/chat/tools/search-products";

function buildInstructions(locale: Locale) {
  const storeName = locale === "sv" ? org.name : org.nameEn;
  const storeDescription = locale === "sv" ? org.description : org.descriptionEn;

  return `You are a customer service agent for ${storeName}.
${storeDescription}

Rules:
- Respond in the same language as the user. Default is swedish.
- Use the searchProducts tool for questions about products, stock, prices, or where to find items on the website.
- Do not guess about inventory or products. If searchProducts returns no results, say you could not find a match and offer to help refine the search.
- When sharing product links, use markdown with the exact url from search results: [product name](url).
- Be helpful, clear, and concise.`;
}

export function createCustomerServiceAgent(locale: Locale) {
  return new ToolLoopAgent({
    model: geminiModel,
    temperature: 0.1,
    instructions: buildInstructions(locale),
    tools: {
      searchProducts: createSearchProductsTool(locale),
    },
  });
}

const typeAgent = createCustomerServiceAgent("sv");
export type ChatUIMessage = InferAgentUIMessage<typeof typeAgent>;
