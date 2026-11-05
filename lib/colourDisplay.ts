import type { ColourMeaning, Language } from "@/lib/types";

/** The text fields on ColourMeaning that exist once per language. */
type ColourTextField =
  | "name" | "description" | "article" | "benefit"
  | "traits" | "affirmations" | "positiveTraits" | "negativeTraits";

const SUFFIX: Record<Language, string> = { en: "", zh: "Zh", ms: "Ms" };

/**
 * Colour-library copy in the app's language.
 *
 * Every call site used to be `isZh ? colour.nameZh : colour.name`, which
 * silently became wrong the moment a third language existed — a Malay user
 * would have seen English. This resolves the suffix from the language
 * instead, so adding a language is a change here and nowhere else.
 *
 * Falls back to English when a translation is missing rather than rendering
 * nothing, matching localizedReading() and localizedGamification().
 */
export function localizedColour<F extends ColourTextField>(
  colour: ColourMeaning,
  field: F,
  lang: Language
): ColourMeaning[F] {
  const record = colour as unknown as Record<string, ColourMeaning[F]>;
  return record[`${field}${SUFFIX[lang]}`] ?? record[field];
}
