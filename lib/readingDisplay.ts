import type { Language } from "@/lib/types";
import type { InnerReadingOut } from "@/lib/api/types";
import { pickUnsuffixed } from "@/lib/languageFallback";

export type ReadingLocalizedField =
  | "narrative"
  | "title"
  | "subtitle"
  | "insight"
  | "reflection_question"
  | "current_focus"
  | "result_summary";

type LifeAreas = InnerReadingOut["life_area_insights"];

/** InnerReading's per-language columns, with English in the unsuffixed one
 * (the backend keeps it there, matching CheckInSession) and `_zh`/`_ms`
 * beside it.
 *
 * Walks lib/languageFallback's chain rather than falling back in one
 * direction, because the missing language is whichever pass hasn't landed —
 * not predictably the non-English one. Four real cases:
 *  - a reading whose background passes haven't all finished (check
 *    `languages_ready` for which ones have);
 *  - readings from before migration c7f2b9a04d31 (English only) or
 *    b8d4f1a6c307 (no Malay), which stay that way — no backfill;
 *  - a background pass that failed outright, which leaves the row PARTIAL
 *    forever by design.
 * Showing another language beats showing an empty card. */
export function localizedReading(
  reading: InnerReadingOut,
  field: ReadingLocalizedField,
  lang: Language,
  preferred?: Language | null
): string | null {
  return pickUnsuffixed<string>(reading as unknown as Record<string, unknown>, field, lang, preferred);
}

export function localizedLifeAreas(
  reading: InnerReadingOut,
  lang: Language,
  preferred?: Language | null
): LifeAreas {
  return (
    pickUnsuffixed<NonNullable<LifeAreas>>(
      reading as unknown as Record<string, unknown>,
      "life_area_insights",
      lang,
      preferred
    ) ?? null
  );
}
