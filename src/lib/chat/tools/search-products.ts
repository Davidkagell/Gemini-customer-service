import { tool } from "ai";
import { z } from "zod";
import type { Locale } from "@/app/messages";
import { searchProducts } from "@/lib/products";

export function createSearchProductsTool(locale: Locale) {
  return tool({
    description:
      "Search the store catalog by name, manufacturer, article number, category, or keywords. Use for questions about availability, price, stock, part numbers, or where to find items on the website.",
    inputSchema: z.object({
      query: z
        .string()
        .min(1)
        .describe(
          "Search terms, e.g. anchor, Yamaha, 5GH-13440-90-00, bilge pump",
        ),
    }),
    execute: async ({ query }) => {
      const results = await searchProducts(query, locale);
      return {
        query,
        count: results.length,
        results,
      };
    },
  });
}
