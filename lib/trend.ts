import { addDays, localDateString, weekStartString } from "./gamification";
import type { DimensionKey, InnerStateSnapshot } from "./types";

export type TrendPeriod = "weekly" | "monthly";

export interface TrendPoint {
  date: string; // YYYY-MM-DD
  label: string; // short x-axis label
}

function weekdayLabel(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { weekday: "short" });
}

// Weekly = the current Mon-Sun week (same convention as the streak row on the
// Inner Reading hub). Monthly = every day of the current calendar month, so
// it's 28-31 points depending on the month, per spec ("30/31 days").
export function buildTrendRange(period: TrendPeriod, today: string = localDateString()): TrendPoint[] {
  if (period === "weekly") {
    const start = weekStartString(today);
    return Array.from({ length: 7 }, (_, i) => {
      const date = addDays(start, i);
      return { date, label: weekdayLabel(date) };
    });
  }
  const [y, m] = today.split("-").map(Number);
  const daysInMonth = new Date(y, m, 0).getDate();
  return Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const date = `${y}-${String(m).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return { date, label: String(day) };
  });
}

const DIM_KEYS: DimensionKey[] = ["emotional_energy", "mental_clarity", "inner_pressure", "grounding"];

function dimsOf(s: InnerStateSnapshot): Record<DimensionKey, number> {
  return {
    emotional_energy: s.emotionalEnergy,
    mental_clarity: s.mentalClarity,
    inner_pressure: s.innerPressure,
    grounding: s.grounding,
  };
}

// One value per day per dimension: the last snapshot recorded that day, or
// (for days with no check-in/reading) the most recent known value carried
// forward — so the line reflects "what your state was" rather than dropping
// to zero on quiet days. Days before any snapshot exists, and days after
// today, are left null (rendered as a gap, never a fabricated value).
export function buildTrendSeries(
  points: TrendPoint[],
  snapshots: InnerStateSnapshot[],
  today: string = localDateString()
): Record<DimensionKey, (number | null)[]> {
  const byDay = new Map<string, InnerStateSnapshot>();
  for (const s of snapshots) {
    const day = localDateString(new Date(s.createdAt));
    const existing = byDay.get(day);
    if (!existing || s.createdAt > existing.createdAt) byDay.set(day, s);
  }
  const sorted = [...snapshots].sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  const result = {} as Record<DimensionKey, (number | null)[]>;
  for (const dim of DIM_KEYS) result[dim] = [];

  const rangeStart = points[0]?.date;
  let lastKnown: Record<DimensionKey, number> | null = null;
  if (rangeStart) {
    for (const s of sorted) {
      const day = localDateString(new Date(s.createdAt));
      if (day < rangeStart) lastKnown = dimsOf(s);
      else break;
    }
  }

  for (const point of points) {
    if (point.date > today) {
      for (const dim of DIM_KEYS) result[dim].push(null);
      continue;
    }
    const snap = byDay.get(point.date);
    if (snap) lastKnown = dimsOf(snap);
    for (const dim of DIM_KEYS) result[dim].push(lastKnown ? lastKnown[dim] : null);
  }
  return result;
}
