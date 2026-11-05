import type { Language } from "@/lib/types";
import type { InnerStateSnapshotOut } from "@/lib/api/types";
import { pickSuffixed } from "@/lib/languageFallback";

export type SnapshotLocalizedField =
  | "insight"
  | "reflection_question"
  | "reminder"
  | "current_focus"
  | "friendly_advice"
  | "affirmation";

/** Same one-column-per-language convention as lib/corePersonalityDisplay.ts's
 * `localized()`, for InnerStateSnapshotOut's six AI narrative fields
 * (docs/behaviour_log_0006.md Phase 4) — English included as `_en`, since
 * these are flattened from a JSONB object rather than stored in columns.
 *
 * Any of these can be null: a snapshot may predate Phase 4, and one from
 * before migration b8d4f1a6c307 has no Malay and never will (no backfill),
 * which is what the fallback chain is for. */
export function localizedSnapshot(
  snapshot: InnerStateSnapshotOut,
  field: SnapshotLocalizedField,
  lang: Language,
  preferred?: Language | null
): string | null {
  return pickSuffixed<string>(snapshot as unknown as Record<string, unknown>, field, lang, preferred);
}
