"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/app/messages";
import type { ProductSearchResult } from "@/types/product";

type SearchPanelProps = {
  id: string;
  results: ProductSearchResult[];
  isPending: boolean;
  locale: Locale;
  onSelect: () => void;
};

function formatPrice(locale: Locale, price: number, currency: string) {
  return new Intl.NumberFormat(locale === "sv" ? "sv-SE" : "en-GB", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}

export function SearchPanel({
  id,
  results,
  isPending,
  locale,
  onSelect,
}: SearchPanelProps) {
  const t = useTranslations("nav");

  return (
    <ul
      id={id}
      role="listbox"
      className="absolute top-full right-0 z-50 mt-2 max-h-80 w-full overflow-auto rounded-xl border border-black/10 bg-background py-1 shadow-lg dark:border-white/15"
    >
      {isPending && results.length === 0 ? (
        <li className="px-3 py-2 text-sm text-foreground/60">
          {t("searchLoading")}
        </li>
      ) : null}
      {!isPending && results.length === 0 ? (
        <li className="px-3 py-2 text-sm text-foreground/60">
          {t("searchEmpty")}
        </li>
      ) : null}
      {results.map((product) => (
        <li key={product.id} role="option">
          <Link
            href={`/products/${product.id}`}
            onClick={onSelect}
            className="block px-3 py-2 hover:bg-foreground/5"
          >
            <span className="block text-sm font-medium leading-snug">
              {product.name}
            </span>
            <span className="mt-0.5 flex items-center justify-between gap-2 text-xs text-foreground/55">
              <span>
                {product.manufacturer} · {product.articleNumber}
              </span>
              <span className="shrink-0 text-textColor">
                {formatPrice(locale, product.price, product.currency)}
              </span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
