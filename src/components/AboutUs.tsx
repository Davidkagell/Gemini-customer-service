import { useTranslations } from "next-intl";

export default function AboutUs() {
  const t = useTranslations("nav");

  return (
    <main className="px-10 py-6">
      <h1 className="text-2xl font-semibold">{t("about")}</h1>
    </main>
  );
}
