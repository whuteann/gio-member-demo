import type { Language } from "@/lib/types";

/** BCP-47 tag for Intl date/time formatting, per app language. Nine pages
 *  previously each wrote `language === "zh" ? "zh-CN" : "en-US"`, which gave
 *  a Malay user US-formatted dates. */
const DATE_LOCALE: Record<Language, string> = {
  en: "en-US",
  zh: "zh-CN",
  ms: "ms-MY",
};

export function dateLocaleFor(language: Language): string {
  return DATE_LOCALE[language] ?? "en-US";
}
