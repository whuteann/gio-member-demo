import type { Language } from "@/lib/types";
import type { BadgeOut, RewardOut } from "@/lib/api/types";
import { pickUnsuffixed } from "@/lib/languageFallback";

type Localizable = BadgeOut | RewardOut;
type TextField<T> = T extends BadgeOut ? "title" | "description" : "title" | "description" | "requirement";

/**
 * Badge and reward copy in the app's language.
 *
 * Same storage shape as localizedReading() in lib/readingDisplay.ts — the
 * English side has no `_en` suffix — and the same fallback chain, so a
 * definition nobody has translated yet renders in another language instead
 * of as an empty tile.
 *
 * These come from static definitions in gio-backend's content.py, not the
 * database, so a missing `_zh`/`_ms` means an untranslated definition, never
 * a background job still running.
 */
export function localizedGamification<T extends Localizable>(
  item: T,
  field: TextField<T>,
  lang: Language,
  preferred?: Language | null
): string {
  return pickUnsuffixed<string>(item as unknown as Record<string, unknown>, field, lang, preferred) ?? "";
}
