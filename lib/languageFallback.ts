import type { Language } from "@/lib/types";

/** The frontend half of gio-backend's app/services/languages.py. Same order,
 *  same default — these two lists have to agree, because the backend decides
 *  which column a language lands in and this file decides which one to read.
 *
 *  Keep in sync with `SUPPORTED` there and `LOCALES` in lib/i18n.ts. */
export const SUPPORTED_LANGUAGES: readonly Language[] = ["en", "zh", "ms"];
export const DEFAULT_LANGUAGE: Language = "en";

/**
 * Which languages to try, in order, for a field the requested language is
 * missing.
 *
 * With two languages `a ?? b` was the whole story. With three it isn't: a
 * Malay reader opening a reading whose Malay pass hasn't finished should get
 * Chinese if that's their account's other language and English otherwise —
 * never a blank card. So: what was asked for, then the account preference if
 * it differs, then English, which every record has.
 */
export function fallbackChain(requested: Language, preferred?: Language | null): Language[] {
  const chain: Language[] = [requested];
  if (preferred && preferred !== requested) chain.push(preferred);
  if (!chain.includes(DEFAULT_LANGUAGE)) chain.push(DEFAULT_LANGUAGE);
  for (const code of SUPPORTED_LANGUAGES) {
    if (!chain.includes(code)) chain.push(code);
  }
  return chain;
}

type Row = Record<string, unknown>;

/**
 * Read a field stored the way InnerReading/CheckInSession/RecommendationItem
 * store it: English in the **unsuffixed** column, the rest in `_zh`/`_ms`.
 */
export function pickUnsuffixed<T>(row: Row | null | undefined, field: string, requested: Language, preferred?: Language | null): T | null {
  if (!row) return null;
  for (const code of fallbackChain(requested, preferred)) {
    const value = row[code === DEFAULT_LANGUAGE ? field : `${field}_${code}`];
    if (value !== null && value !== undefined && value !== "") return value as T;
  }
  return null;
}

/**
 * Read a field stored the way CorePersonality and InnerStateSnapshot store
 * it: one suffixed column per language, English included (`_en`).
 */
export function pickSuffixed<T>(row: Row | null | undefined, field: string, requested: Language, preferred?: Language | null): T | null {
  if (!row) return null;
  for (const code of fallbackChain(requested, preferred)) {
    const value = row[`${field}_${code}`];
    if (value !== null && value !== undefined && value !== "") return value as T;
  }
  return null;
}
