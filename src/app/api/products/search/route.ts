import { hasLocale } from "next-intl";
import { searchProducts } from "@/lib/products";
import { routing } from "@/i18n/routing";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim() ?? "";
  const requestedLocale = searchParams.get("locale");
  const locale = hasLocale(routing.locales, requestedLocale)
    ? requestedLocale
    : routing.defaultLocale;

  if (!query) {
    return Response.json({ query, count: 0, results: [] });
  }

  const results = await searchProducts(query, locale);

  return Response.json({
    query,
    count: results.length,
    results,
  });
}
