import type { ColourKey } from "./types";

/**
 * Which supportive colour goes with a given current-focus label.
 *
 * All that remains of a client-side recommendation builder that used to
 * assemble product picks, routines and reasons from a hardcoded catalog.
 * Recommendations come from the API now; this map survives only because
 * two pages still need a colour for a focus label when rendering, and the
 * mapping is presentation, not invented content. The `tags` and `routine`
 * strings that used to sit alongside each entry went with the builder.
 */
const FOCUS_COLOUR: Record<string, ColourKey> = {
  "Rebuilding energy": "scarlet",
  "Finding clarity": "ocean",
  "Releasing pressure": "forest",
  "Regaining grounding": "russet",
  "Sustaining balance": "gold",
};

export function colourKeyForFocus(currentFocus: string): ColourKey {
  return FOCUS_COLOUR[currentFocus] ?? FOCUS_COLOUR["Sustaining balance"];
}
