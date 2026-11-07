import { useTranslation } from "react-i18next";
import type { Language } from "@/lib/types";

/** Read the actual fields: older rows can say READY but predate Malay. */
export default function ContentLanguageNotice({
  content,
  fields,
  language,
  englishSuffixed = false,
}: {
  content: object;
  fields: string[];
  language: Language;
  englishSuffixed?: boolean;
}) {
  const { t } = useTranslation("common");
  const row = content as Record<string, unknown>;
  const suffix = language === "en" && !englishSuffixed ? "" : `_${language}`;
  const missing = fields.some((field) => {
    const value = row[`${field}${suffix}`];
    return value === null || value === undefined || value === "";
  });
  if (!missing) return null;
  return <p className="text-xs leading-relaxed text-foreground-muted">{t("ui.contentLanguageUnavailable")}</p>;
}
