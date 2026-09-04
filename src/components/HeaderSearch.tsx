"use client";

import { Search } from "lucide-react";
import { hasLocale, useLocale, useTranslations } from "next-intl";
import {
  useEffect,
  useEffectEvent,
  useId,
  useRef,
  useState,
  useTransition,
} from "react";
import { SearchPanel } from "@/components/SearchPanel";
import { routing } from "@/i18n/routing";
import type { ProductSearchResult } from "@/types/product";

const DEBOUNCE_MS = 250;

export default function HeaderSearch() {
  const t = useTranslations("nav");
  const requestedLocale = useLocale();
  const locale = hasLocale(routing.locales, requestedLocale)
    ? requestedLocale
    : routing.defaultLocale;
  const listboxId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ProductSearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const runSearch = useEffectEvent(async (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
      startTransition(() => {
        setResults([]);
        setOpen(false);
      });
      return;
    }

    try {
      const response = await fetch(
        `/api/products/search?q=${encodeURIComponent(trimmed)}&locale=${locale}`,
      );
      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`);
      }
      const data = (await response.json()) as {
        results: ProductSearchResult[];
      };
      startTransition(() => {
        setResults(data.results);
        setOpen(true);
      });
    } catch {
      startTransition(() => {
        setResults([]);
        setOpen(true);
      });
    }
  });

  useEffect(() => {
    const timeout = setTimeout(() => {
      void runSearch(query);
    }, DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  const showPanel = open && query.trim().length > 0;

  return (
    <div ref={containerRef} className="relative w-56 sm:w-72">
      <label className="sr-only" htmlFor="header-product-search">
        {t("searchLabel")}
      </label>
      <div className="relative">
        <Search
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-foreground/45"
        />
        <input
          id="header-product-search"
          type="search"
          value={query}
          autoComplete="off"
          placeholder={t("searchPlaceholder")}
          aria-autocomplete="list"
          aria-controls={listboxId}
          aria-expanded={showPanel}
          role="combobox"
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => {
            if (query.trim() && results.length > 0) {
              setOpen(true);
            }
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setOpen(false);
            }
          }}
          className="h-10 w-full rounded-lg border border-black/15 bg-background pr-3 pl-9 text-sm outline-none placeholder:text-foreground/40 focus:border-textColor dark:border-white/20"
        />
      </div>

      {showPanel ? (
        <SearchPanel
          id={listboxId}
          results={results}
          isPending={isPending}
          locale={locale}
          onSelect={() => {
            setOpen(false);
            setQuery("");
            setResults([]);
          }}
        />
      ) : null}
    </div>
  );
}
