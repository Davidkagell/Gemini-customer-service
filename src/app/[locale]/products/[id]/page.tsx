import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { ProductCardItem } from "@/components/ProductCardItem";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import {
  formatProductPrice,
  getProductById,
  products,
} from "@/lib/products";

const MISSING_IMAGE = "/image-missing.jpg";

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    products.map((product) => ({ locale, id: product.id })),
  );
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale: requestedLocale, id } = await params;
  const locale = hasLocale(routing.locales, requestedLocale)
    ? requestedLocale
    : routing.defaultLocale;
  const product = getProductById(id);

  if (!product) {
    notFound();
  }

  const t = await getTranslations({ locale, namespace: "productsPage" });

  return (
    <main className="mx-auto w-full max-w-3xl px-10 py-6 pb-24">
      <Link
        href="/products"
        className="mb-6 inline-block text-sm text-textColor/70 underline-offset-4 hover:underline"
      >
        {t("backToProducts")}
      </Link>
      <ProductCardItem
        name={product.name[locale]}
        articleLabel={t("articleNumber", {
          manufacturer: product.manufacturer,
          number: product.articleNumber,
        })}
        description={product.description[locale]}
        images={product.images}
        fallbackImage={MISSING_IMAGE}
        priceLabel={formatProductPrice(locale, product.price, product.currency)}
        quantity={product.quantity}
        inStockLabel={t("inStock", { count: product.quantity })}
        outOfStockLabel={t("outOfStock")}
      />
    </main>
  );
}
