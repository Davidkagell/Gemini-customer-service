export type LocalizedText = {
  sv: string;
  en: string;
};

export type Product = {
  id: string;
  category: LocalizedText;
  name: LocalizedText;
  description: LocalizedText;
  image: string;
  price: number;
  currency: string;
  quantity: number;
  inStock: boolean;
};

export type ProductSearchResult = {
  id: string;
  name: string;
  category: string;
  price: number;
  currency: string;
  inStock: boolean;
  quantity: number;
  url: string;
};
