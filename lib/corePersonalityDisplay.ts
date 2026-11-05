import { COLOUR_ORDER } from "@/lib/blueprints";
import type { ColourKey, Language } from "@/lib/types";
import type { CorePersonalityResultOut, NumberPoint } from "@/lib/api/types";
import { pickSuffixed } from "@/lib/languageFallback";

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
  lang: Language,
  preferred?: Language | null
): string {
  // One suffixed column per language, English included. Walks
  // lib/languageFallback's chain instead of dropping straight to English:
  // a personality whose Malay pass hasn't landed should show the account's
  // other language before falling all the way back, and never an empty card.
  return (
    pickSuffixed<string>(personality as unknown as Record<string, unknown>, field, lang, preferred) ?? ""
  );
}

export type LocalizedPointsField = "birthday_number_points" | "life_path_number_points" | "talent_number_points";

export function localizedPoints<F extends LocalizedPointsField>(
  personality: CorePersonalityResultOut,
  field: F,
  lang: Language,
  preferred?: Language | null
): NumberPoint[] {
  return (
    pickSuffixed<NumberPoint[]>(personality as unknown as Record<string, unknown>, field, lang, preferred) ?? []
  );
}
