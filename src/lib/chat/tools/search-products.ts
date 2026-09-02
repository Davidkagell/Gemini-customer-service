import { tool } from "ai";
import { z } from "zod";
import type { Locale } from "@/app/messages";
import { searchProducts } from "@/lib/products";

export function createSearchProductsTool(locale: Locale) {
  return tool({
    description:
      "Search the store catalog for products by name, category, or keywords. Use for questions about availability, price, stock, or where to find items on the website.",
    inputSchema: z.object({
      query: z
        .string()
        .min(1)
        .describe("Search terms, e.g. anchor, propeller, bilge pump"),
    }),
    execute: async ({ query }) => {
      const results = searchProducts(query, locale);
      return {
        query,
        count: results.length,
        results,
      };
    },
  });
}
