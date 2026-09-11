import { JOURNAL_MOODS, JOURNAL_THEMES, pickPhrasing } from "./blueprints";
import { localDateString, weekStartString } from "./gamification";
import type { JournalEntry } from "./types";

export function tagJournalEntry(entryId: string): { mood: string; theme: string } {
  return {
    mood: pickPhrasing(`${entryId}-mood`, JOURNAL_MOODS),
    theme: pickPhrasing(`${entryId}-theme`, JOURNAL_THEMES),
  };
}

function mostCommon(values: string[]): string | null {
  if (values.length === 0) return null;
  const counts = new Map<string, number>();
  for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1);
  let best: string | null = null;
  let bestCount = 0;
  for (const [value, count] of counts) {
    if (count > bestCount) {
      best = value;
      bestCount = count;
    }
  }
  return best;
}

export interface JournalInsights {
  entriesThisWeek: number;
  entriesDelta: number;
  topMood: string | null;
  topTheme: string | null;
}

export function buildJournalInsights(entries: JournalEntry[], today: string = localDateString()): JournalInsights {
  const thisWeekStart = weekStartString(today);
  const priorWeekDate = new Date(thisWeekStart);
  priorWeekDate.setDate(priorWeekDate.getDate() - 7);
  const priorWeekStart = weekStartString(localDateString(priorWeekDate));

  const thisWeek = entries.filter((e) => weekStartString(localDateString(new Date(e.createdAt))) === thisWeekStart);
  const priorWeek = entries.filter((e) => weekStartString(localDateString(new Date(e.createdAt))) === priorWeekStart);

  return {
    entriesThisWeek: thisWeek.length,
    entriesDelta: thisWeek.length - priorWeek.length,
    topMood: mostCommon(thisWeek.map((e) => e.mood)),
    topTheme: mostCommon(thisWeek.map((e) => e.theme)),
  };
}
