import type { Language } from "@/lib/types";
import type { InnerReadingOut } from "@/lib/api/types";

export type ReadingLocalizedField =
  | "narrative"
  | "title"
  | "subtitle"
  | "insight"
  | "reflection_question"
  | "current_focus"
  | "result_summary";

type LifeAreas = InnerReadingOut["life_area_insights"];

/** Same convention as corePersonalityDisplay's `localized()` and
 * snapshotDisplay's `localizedSnapshot()`, for InnerReading's bilingual
 * columns — except the English side has no `_en` suffix (the backend keeps
 * English in the unsuffixed column, matching CheckInSession).
 *
 * Falls back to the other language rather than going blank, in **both**
 * directions. Three real cases need it:
 *  - a reading whose background pass hasn't finished (generation_status
 *    still PARTIAL) — and that gap cuts both ways, since the pending
 *    language is whichever one the user did *not* submit in;
 *  - readings taken before migration c7f2b9a04d31, which are English-only
 *    and always will be;
 *  - a background pass that failed outright, which leaves the row PARTIAL
 *    forever by design.
 * Showing the other language beats showing an empty card. */
export function localizedReading(
  reading: InnerReadingOut,
  field: ReadingLocalizedField,
  lang: Language
): string | null {
  const zh = reading[`${field}_zh`];
  const en = reading[field];
  return (lang === "zh" ? zh ?? en : en ?? zh) ?? null;
}

export function localizedLifeAreas(reading: InnerReadingOut, lang: Language): LifeAreas {
  const zh = reading.life_area_insights_zh;
  const en = reading.life_area_insights;
  return (lang === "zh" ? zh ?? en : en ?? zh) ?? null;
}
