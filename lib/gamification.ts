import { BADGE_DEFINITIONS, REWARD_DEFINITIONS } from "./blueprints";
import type {
  GardenProgress,
  QuestKey,
  UserBadge,
  UserQuest,
  UserReward,
  UserStreak,
  XPSourceAction,
  XPTransaction,
} from "./types";

export function localDateString(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function addDays(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  return localDateString(date);
}

export function weekStartString(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const day = date.getDay(); // 0 Sun .. 6 Sat
  const diffToMonday = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diffToMonday);
  return localDateString(date);
}

const XP_VALUES: Record<XPSourceAction, number> = {
  CHECK_IN: 10,
  INNER_READING: 25,
  DAILY_QUEST_BONUS: 10,
  STREAK_MILESTONE: 0, // dynamic, passed explicitly
};

export function awardXP(
  transactions: XPTransaction[],
  amount: number,
  sourceAction: XPSourceAction,
  sourceKey: string
): { transactions: XPTransaction[]; awarded: boolean } {
  if (transactions.some((t) => t.sourceKey === sourceKey)) {
    return { transactions, awarded: false };
  }
  const tx: XPTransaction = {
    id: `xp_${sourceKey}_${Date.now()}`,
    amount,
    sourceAction,
    sourceKey,
    createdAt: new Date().toISOString(),
  };
  return { transactions: [...transactions, tx], awarded: true };
}

export function totalXP(transactions: XPTransaction[]): number {
  return transactions.reduce((sum, t) => sum + t.amount, 0);
}

export function completeQuest(
  quests: UserQuest[],
  quest: QuestKey,
  date: string
): { quests: UserQuest[]; newlyCompleted: boolean } {
  if (quests.some((q) => q.quest === quest && q.date === date)) {
    return { quests, newlyCompleted: false };
  }
  return {
    quests: [...quests, { date, quest, completedAt: new Date().toISOString() }],
    newlyCompleted: true,
  };
}

export function questsForDate(quests: UserQuest[], date: string): QuestKey[] {
  return quests.filter((q) => q.date === date).map((q) => q.quest);
}

export function allThreeQuestsComplete(quests: UserQuest[], date: string): boolean {
  const done = new Set(questsForDate(quests, date));
  return done.has("LOGIN") && done.has("CHECK_IN") && done.has("INNER_READING");
}

const STREAK_MILESTONES = [7, 30, 100];
export const STREAK_MILESTONE_XP: Record<number, number> = { 7: 50, 30: 150, 100: 400 };

export function updateStreakForReflection(
  streak: UserStreak,
  todayStr: string
): { streak: UserStreak; newMilestone: number | null } {
  if (streak.lastReflectionDate === todayStr) {
    return { streak, newMilestone: null };
  }
  const yesterday = addDays(todayStr, -1);
  const current = streak.lastReflectionDate === yesterday ? streak.current + 1 : 1;
  const best = Math.max(streak.best, current);
  const milestone = STREAK_MILESTONES.find(
    (m) => current >= m && !streak.milestonesAwarded.includes(m)
  );
  return {
    streak: {
      current,
      best,
      lastReflectionDate: todayStr,
      milestonesAwarded: milestone
        ? [...streak.milestonesAwarded, milestone]
        : streak.milestonesAwarded,
    },
    newMilestone: milestone ?? null,
  };
}

const GARDEN_THRESHOLDS = [1, 3, 5, 7]; // actions needed to reach stage 1..4

export function updateGardenForReflection(
  garden: GardenProgress,
  todayStr: string
): GardenProgress {
  const currentWeekStart = weekStartString(todayStr);
  const base: GardenProgress =
    garden.weekStart === currentWeekStart
      ? garden
      : { weekStart: currentWeekStart, stage: 0, actionsThisWeek: 0 };
  const actionsThisWeek = base.actionsThisWeek + 1;
  let stage = 0;
  for (let i = 0; i < GARDEN_THRESHOLDS.length; i++) {
    if (actionsThisWeek >= GARDEN_THRESHOLDS[i]) stage = i + 1;
  }
  return { weekStart: currentWeekStart, actionsThisWeek, stage: Math.max(base.stage, stage) };
}

export function refreshGardenWeek(garden: GardenProgress, todayStr: string): GardenProgress {
  const currentWeekStart = weekStartString(todayStr);
  if (garden.weekStart === currentWeekStart) return garden;
  return { weekStart: currentWeekStart, stage: 0, actionsThisWeek: 0 };
}

export function evaluateBadges(
  existing: UserBadge[],
  ctx: { streakBest: number; readingsCount: number; gardenStage: number; totalXpAmount: number }
): { badges: UserBadge[]; newlyEarned: string[] } {
  const have = new Set(existing.map((b) => b.key));
  const newlyEarned: string[] = [];
  const additions: UserBadge[] = [];

  const checks: Record<string, boolean> = {
    three_day_streak: ctx.streakBest >= 3,
    two_week_rhythm: ctx.streakBest >= 14,
    first_insight: ctx.readingsCount >= 1,
    deep_diver: ctx.readingsCount >= 5,
    first_bloom: ctx.gardenStage >= 4,
    momentum: ctx.totalXpAmount >= 300,
  };

  for (const def of BADGE_DEFINITIONS) {
    if (!have.has(def.key) && checks[def.key]) {
      additions.push({ key: def.key, earnedAt: new Date().toISOString() });
      newlyEarned.push(def.key);
    }
  }

  return { badges: [...existing, ...additions], newlyEarned };
}

export function evaluateRewards(
  existing: UserReward[],
  ctx: { xp: number; streakBest: number; badges: string[] }
): UserReward[] {
  return REWARD_DEFINITIONS.map((def) => {
    const prior = existing.find((r) => r.key === def.key);
    if (prior?.state === "REDEEMED") return prior;
    const eligible = def.isEligible(ctx);
    if (eligible) {
      return {
        key: def.key,
        state: "UNLOCKED" as const,
        unlockedAt: prior?.unlockedAt ?? new Date().toISOString(),
        redeemedAt: null,
      };
    }
    return prior ?? { key: def.key, state: "LOCKED" as const, unlockedAt: null, redeemedAt: null };
  });
}

export { XP_VALUES };
