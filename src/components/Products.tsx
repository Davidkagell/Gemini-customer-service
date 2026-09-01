import { hasLocale } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";
import ProductCard from "@/components/ProductCard";
import { routing } from "@/i18n/routing";
import { formatProductPrice, groupProductsByCategory } from "@/lib/products";

const MISSING_IMAGE = "/image-missing.jpg";

export default async function Products() {
  const requestedLocale = await getLocale();
  const locale = hasLocale(routing.locales, requestedLocale)
    ? requestedLocale
    : routing.defaultLocale;
  const t = await getTranslations("productsPage");
  const groups = groupProductsByCategory(locale);

  return (
    <main className="mx-auto w-full max-w-6xl px-10 py-6 pb-24">
      <h1 className="text-2xl font-semibold">{t("title")}</h1>
      {groups.map((group) => (
        <section key={group.category} className="mt-10">
          <h2 className="mb-4 text-lg font-semibold text-textColor">
            {group.category}
          </h2>
          <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {group.products.map((product) => (
              <li key={product.id}>
                <ProductCard
                  name={product.name[locale]}
                  description={product.description[locale]}
                  image={product.image}
                  fallbackImage={MISSING_IMAGE}
                  priceLabel={formatProductPrice(
                    locale,
                    product.price,
                    product.currency,
                  )}
                  inStock={product.inStock}
                  inStockLabel={t("inStock")}
                  outOfStockLabel={t("outOfStock")}
                />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </main>
  );
}
