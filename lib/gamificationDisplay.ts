import type { Language } from "@/lib/types";
import type { BadgeOut, RewardOut } from "@/lib/api/types";

type Localizable = BadgeOut | RewardOut;
type TextField<T> = T extends BadgeOut ? "title" | "description" : "title" | "description" | "requirement";

/**
 * Badge and reward copy in the app's language.
 *
 * Same shape and same both-directions fallback as localizedReading() in
 * lib/readingDisplay.ts: the English side has no `_en` suffix (it lives in
 * the unsuffixed field), and a missing translation falls back to the other
 * language rather than rendering an empty tile.
 *
 * These come from static definitions in gio-backend's content.py, not the
 * database — so `_zh` is null only for a definition nobody has translated
 * yet, never because a background job is still running.
 */
export function localizedGamification<T extends Localizable>(
  item: T,
  field: TextField<T>,
  lang: Language
): string {
  const record = item as unknown as Record<string, string | null>;
  const zh = record[`${field}_zh`];
  const en = record[field];
  return (lang === "zh" ? zh ?? en : en ?? zh) ?? "";
}
