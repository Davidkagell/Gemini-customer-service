import catalog from "@/data/products.json";
import type { Locale } from "@/app/messages";
import { routing } from "@/i18n/routing";
import type { Product, ProductSearchResult } from "@/types/product";

export const products = catalog as Product[];

const MAX_SEARCH_RESULTS = 8;

function normalizeSearchText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[,]/g, ".");
}

function productSearchBlob(product: Product) {
  return normalizeSearchText(
    [
      product.id,
      product.name.sv,
      product.name.en,
      product.category.sv,
      product.category.en,
      product.description.sv,
      product.description.en,
    ].join(" "),
  );
}

export function productPath(id: string, locale: Locale) {
  const prefix = locale === routing.defaultLocale ? "" : `/${locale}`;
  return `${prefix}/products/${id}`;
}

export function getProductById(id: string) {
  return products.find((product) => product.id === id);
}

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

function scoreProduct(product: Product, query: string) {
  const normalizedQuery = normalizeSearchText(query.trim());
  if (!normalizedQuery) return 0;

  const tokens = normalizedQuery.split(/\s+/).filter(Boolean);
  const blob = productSearchBlob(product);
  let score = 0;

  for (const token of tokens) {
    if (blob.includes(token)) {
      score += 1;
    }
  }

  return score;
}

export function searchProducts(
  query: string,
  locale: Locale,
): ProductSearchResult[] {
  const ranked = products
    .map((product) => ({
      product,
      score: scoreProduct(product, query),
    }))
    .filter((entry) => entry.score > 0)
    .toSorted((a, b) => b.score - a.score)
    .slice(0, MAX_SEARCH_RESULTS);

  return ranked.map(({ product }) => ({
    id: product.id,
    name: product.name[locale],
    category: product.category[locale],
    price: product.price,
    currency: product.currency,
    inStock: product.inStock,
    quantity: product.quantity,
    url: productPath(product.id, locale),
  }));
}
