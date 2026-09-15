import type { DimensionKey } from "./types";

// Shared easing curves for the Check-In and Inner Reading question flows.
// Cubic-bezier tuples are the format Motion expects for `ease`.
export const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];
export const EASE_IN_OUT: [number, number, number, number] = [0.65, 0, 0.35, 1];
export const EASE_SOFT_BACK: [number, number, number, number] = [0.34, 1.3, 0.64, 1];

// Transition used when a glyph morphs between answer states.
export const MORPH = { duration: 0.9, ease: EASE_IN_OUT };

// Mirrors the dimension tokens in styles/globals.css. Motion needs literal
// colour values to interpolate, so CSS variables are not used here.
export const DIMENSION_HEX: Record<DimensionKey, string> = {
  emotional_energy: "#e0704f",
  mental_clarity: "#3f8f8a",
  inner_pressure: "#c98f2a",
  grounding: "#4a6b3d",
};

export const GOLD_HEX = "#b9902a";
export const SECONDARY_HEX = "#8a9b7c";
