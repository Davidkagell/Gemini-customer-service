import Typesense from "typesense";
import type { CollectionCreateSchema } from "typesense/lib/Typesense/Collections";
import type { Product } from "@/types/product";

export const PRODUCTS_COLLECTION = "products";

export type TypesenseProductDocument = {
  id: string;
  manufacturer: string;
  articleNumber: string;
  name_sv: string;
  name_en: string;
  description_sv: string;
  description_en: string;
  category_sv: string;
  category_en: string;
  price: number;
  currency: string;
  quantity: number;
  inStock: boolean;
};

export const productsCollectionSchema: CollectionCreateSchema = {
  name: PRODUCTS_COLLECTION,
  fields: [
    { name: "manufacturer", type: "string" },
    { name: "articleNumber", type: "string" },
    { name: "name_sv", type: "string" },
    { name: "name_en", type: "string" },
    { name: "description_sv", type: "string" },
    { name: "description_en", type: "string" },
    { name: "category_sv", type: "string", facet: true },
    { name: "category_en", type: "string", facet: true },
    { name: "price", type: "float" },
    { name: "currency", type: "string" },
    { name: "quantity", type: "int32" },
    { name: "inStock", type: "bool", facet: true },
  ],
  default_sorting_field: "price",
};

export function toTypesenseProduct(
  product: Product,
): TypesenseProductDocument {
  return {
    id: product.id,
    manufacturer: product.manufacturer,
    articleNumber: product.articleNumber,
    name_sv: product.name.sv,
    name_en: product.name.en,
    description_sv: product.description.sv,
    description_en: product.description.en,
    category_sv: product.category.sv,
    category_en: product.category.en,
    price: product.price,
    currency: product.currency,
    quantity: product.quantity,
    inStock: product.inStock,
  };
}

export function createTypesenseClient() {
  const host = process.env.TYPESENSE_HOST;
  const port = process.env.TYPESENSE_PORT;
  const protocol = process.env.TYPESENSE_PROTOCOL;
  const apiKey = process.env.TYPESENSE_API_KEY;

  if (!host || !port || !protocol || !apiKey) {
    throw new Error(
      "Missing Typesense env: TYPESENSE_HOST, TYPESENSE_PORT, TYPESENSE_PROTOCOL, TYPESENSE_API_KEY",
    );
  }

  return new Typesense.Client({
    nodes: [
      {
        host,
        port: Number(port),
        protocol,
      },
    ],
    apiKey,
    connectionTimeoutSeconds: 5,
  });
}

export const typesense = createTypesenseClient();
