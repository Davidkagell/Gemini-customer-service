import catalog from "@/data/products.json";
import type { Locale } from "@/app/messages";
import type { Product } from "@/types/product";

export const products = catalog as Product[];

export function groupProductsByCategory(locale: Locale) {
  const groups: { category: string; products: Product[] }[] = [];
  const indexByCategory = new Map<string, number>();

  for (const product of products) {
    const category = product.category[locale];
    const existingIndex = indexByCategory.get(category);

    if (existingIndex === undefined) {
      indexByCategory.set(category, groups.length);
      groups.push({ category, products: [product] });
      continue;
    }

    groups[existingIndex].products.push(product);
  }

  return groups;
}

export function formatProductPrice(
  locale: Locale,
  price: number,
  currency: string,
) {
  return new Intl.NumberFormat(locale === "sv" ? "sv-SE" : "en-GB", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}
