import { useLocale, useTranslations } from "next-intl";
import { org } from "@/config/org";

export default function Footer() {
  const t = useTranslations();
  const locale = useLocale();
  const name = locale === "sv" ? org.name : org.nameEn;
  const description = locale === "sv" ? org.description : org.descriptionEn;
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t-2 px-10 py-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-md space-y-1">
          <p className="font-semibold">{name}</p>
          <p className="text-sm text-foreground/70">{description}</p>
        </div>
      </div>
      <p className="mt-6 text-xs text-foreground/50">
        {t("footer.copyright", { year, name })}
      </p>
    </footer>
  );
}
