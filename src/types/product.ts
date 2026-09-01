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
  inStock: boolean;
};
