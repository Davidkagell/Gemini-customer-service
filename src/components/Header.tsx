import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function Header() {
  const t = useTranslations("nav");

  return (
    <section className=" ">
      <ul className="ml-10 h-20 items-center flex flex-row gap-5">
        <li>
          <Link href="/">{t("start")}</Link>
        </li>
        <li>
          <Link href="/products">{t("products")}</Link>
        </li>
        <li>
          <Link href="/about">{t("about")}</Link>
        </li>
        <li>
          <Link href="/contact">{t("contact")}</Link>
        </li>
      </ul>
    </section>
  );
}
