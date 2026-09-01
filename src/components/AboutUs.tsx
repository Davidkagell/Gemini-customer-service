import { useTranslations } from "next-intl";

export default function AboutUs() {
  const t = useTranslations();

  return (
    <main className="mx-auto w-full max-w-3xl px-10 py-6 pb-24">
      <h1 className="text-2xl font-semibold">{t("aboutPage.title")}</h1>
      <p className="mt-4 text-lg leading-relaxed text-textColor">{t("aboutPage.lead")}</p>
      <p className="mt-6 text-base leading-relaxed text-zinc-700 dark:text-zinc-300">
        {t("aboutPage.story")}
      </p>
      <p className="mt-4 text-base leading-relaxed text-zinc-700 dark:text-zinc-300">
        {t("aboutPage.help")}
      </p>
    </main>
  );
}
