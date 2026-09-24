import type { Language } from "@/lib/types";
import type { InnerStateSnapshotOut } from "@/lib/api/types";

export type SnapshotLocalizedField =
  | "insight"
  | "reflection_question"
  | "reminder"
  | "current_focus"
  | "friendly_advice"
  | "affirmation";

/** Same _en/_zh flattening convention as lib/corePersonalityDisplay.ts's
 * `localized()`, for InnerStateSnapshotOut's six AI narrative fields
 * (docs/behaviour_log_0006.md Phase 4). Any of these can be null — Inner
 * Reading doesn't generate them yet, and a snapshot may predate Phase 4. */
export function localizedSnapshot(
  snapshot: InnerStateSnapshotOut,
  field: SnapshotLocalizedField,
  lang: Language
): string | null {
  const key = `${field}_${lang}` as `${SnapshotLocalizedField}_en` | `${SnapshotLocalizedField}_zh`;
  return snapshot[key] ?? snapshot[`${field}_en`] ?? null;
}
