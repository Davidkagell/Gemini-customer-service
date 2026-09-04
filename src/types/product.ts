export type LocalizedText = {
  sv: string;
  en: string;
};

export type Product = {
  id: string;
  manufacturer: string;
  articleNumber: string;
  category: LocalizedText;
  name: LocalizedText;
  description: LocalizedText;
  images: string[];
  price: number;
  currency: string;
  quantity: number;
  inStock: boolean;
};

export type ProductSearchResult = {
  id: string;
  name: string;
  manufacturer: string;
  articleNumber: string;
  category: string;
  price: number;
  currency: string;
  inStock: boolean;
  quantity: number;
  url: string;
};
