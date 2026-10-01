import { COLOUR_ORDER } from "@/lib/blueprints";
import type { ColourKey, Language } from "@/lib/types";
import type { CorePersonalityResultOut, NumberPoint } from "@/lib/api/types";

export const COLOUR_SCORE_FIELD: Record<ColourKey, keyof CorePersonalityResultOut> = {
  scarlet: "scarlet_score",
  russet: "russet_score",
  gold: "gold_score",
  forest: "forest_score",
  ocean: "ocean_score",
};

export function topColourKey(personality: CorePersonalityResultOut): ColourKey {
  let best: ColourKey = COLOUR_ORDER[0];
  let bestScore = -1;
  for (const key of COLOUR_ORDER) {
    const score = (personality[COLOUR_SCORE_FIELD[key]] as number | null) ?? 0;
    if (score > bestScore) {
      bestScore = score;
      best = key;
    }
  }
  return best;
}

export function colourScores(personality: CorePersonalityResultOut): Record<ColourKey, number> {
  return {
    scarlet: personality.scarlet_score ?? 0,
    russet: personality.russet_score ?? 0,
    gold: personality.gold_score ?? 0,
    forest: personality.forest_score ?? 0,
    ocean: personality.ocean_score ?? 0,
  };
}

export type LocalizedField = "title" | "subtitle" | "overview" | "summary";

export function localized<F extends LocalizedField>(
  personality: CorePersonalityResultOut,
  field: F,
  lang: Language
): string {
  const key = `${field}_${lang}` as `${F}_en` | `${F}_zh`;
  // Falls back to English (same convention as lib/snapshotDisplay.ts's
  // localizedSnapshot) rather than going blank — a personality whose zh
  // backfill hasn't landed yet still shows something when the UI language
  // is switched, instead of an empty card.
  return personality[key] ?? personality[`${field}_en`] ?? "";
}

export type LocalizedPointsField = "birthday_number_points" | "life_path_number_points" | "talent_number_points";

export function localizedPoints<F extends LocalizedPointsField>(
  personality: CorePersonalityResultOut,
  field: F,
  lang: Language
): NumberPoint[] {
  const key = `${field}_${lang}` as `${F}_en` | `${F}_zh`;
  return personality[key] ?? personality[`${field}_en`] ?? [];
}
