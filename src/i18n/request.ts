import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { messages } from "@/app/messages";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale, locale }) => {
  const resolved = locale ?? (await requestLocale);

  const resolvedLocale = hasLocale(routing.locales, resolved)
    ? resolved
    : routing.defaultLocale;

  return {
    locale: resolvedLocale,
    messages: messages[resolvedLocale],
  };
});
