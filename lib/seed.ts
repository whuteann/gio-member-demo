import { hashPassword, generateGid } from "./auth";
import { newId } from "./id";
import {
  CHECKIN_BLUEPRINT_VERSION,
  READING_BLUEPRINT_VERSION,
} from "./blueprints";
import { buildInnerState, buildReadingHeadline, buildReadingInsight, buildReadingNarrative, scoreBaseline } from "./scoring";
import { buildRecommendation } from "./recommendation";
import { tagJournalEntry } from "./journal";
import {
  awardXP,
  completeQuest,
  evaluateBadges,
  evaluateRewards,
  localDateString,
  totalXP,
  updateGardenForReflection,
  updateStreakForReflection,
  weekStartString,
} from "./gamification";
import type {
  AnsweredQuestion,
  AppData,
  CheckInSession,
  DimensionKey,
  InnerReading,
  JournalEntry,
  Language,
  User,
} from "./types";

export function createEmptyAppData(user: User): AppData {
  return {
    user,
    subscription: {
      plan: "FREE",
      billingCycle: null,
      status: "ACTIVE",
      startsAt: user.createdAt,
      renewsAt: null,
      expiresAt: null,
      cancelledAt: null,
      firstFreeReadingConsumedAt: null,
    },
    corePersonalities: [],
    checkIns: [],
    innerReadings: [],
    stateSnapshots: [],
    recommendations: [],
    xpTransactions: [],
    quests: [],
    streak: { current: 0, best: 0, lastReflectionDate: null, milestonesAwarded: [] },
    garden: { weekStart: weekStartString(localDateString()), stage: 0, actionsThisWeek: 0 },
    badges: [],
    rewards: [],
    journalEntries: [],
  };
}

export function createUser(params: {
  email: string;
  password: string;
  displayName: string;
  language: Language;
}): User {
  const now = new Date().toISOString();
  return {
    id: newId("user"),
    email: params.email.toLowerCase().trim(),
    passwordHash: hashPassword(params.password),
    displayName: params.displayName,
    gid: generateGid(),
    status: "ACTIVE",
    preferredLanguage: params.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone ?? "UTC",
    onboardingCompletedAt: null,
    corePersonalityLastRecalibratedAt: null,
    lastLoginAt: now,
    createdAt: now,
  };
}

function fakeAnswer(dimension: DimensionKey, index: number, value: number): AnsweredQuestion {
  return {
    questionId: newId("q"),
    dimension,
    questionText: "",
    answerValue: value,
    normalizedValue: Math.round(((value - 1) / 4) * 100),
    generationSource: "AI",
    orderIndex: index,
    answeredAt: new Date().toISOString(),
  };
}

export const DEMO_EMAIL = "demo@gio.app";
export const DEMO_PASSWORD = "gioDemo123";

export function createDemoAppData(): AppData {
  const now = new Date();
  const nowIso = now.toISOString();
  const user: User = {
    id: "user_demo",
    email: DEMO_EMAIL,
    passwordHash: hashPassword(DEMO_PASSWORD),
    displayName: "Alex Rivera",
    gid: "GIO-DEMO-0001",
    status: "ACTIVE",
    preferredLanguage: "en",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone ?? "UTC",
    onboardingCompletedAt: new Date(now.getTime() - 12 * 86400000).toISOString(),
    corePersonalityLastRecalibratedAt: null,
    lastLoginAt: nowIso,
    createdAt: new Date(now.getTime() - 12 * 86400000).toISOString(),
  };

  const personality = scoreBaseline(
    [
      { index: 0, choice: "B" },
      { index: 1, choice: "B" },
      { index: 2, choice: "B" },
      { index: 3, choice: "B" },
      { index: 4, choice: "B" },
      { index: 5, choice: "A" },
      { index: 6, choice: "A" },
      { index: 7, choice: "A" },
    ],
    { id: newId("cp"), userId: user.id, version: 1 }
  );
  personality.generatedAt = new Date(now.getTime() - 12 * 86400000).toISOString();

  const checkIns: CheckInSession[] = [];
  const stateSnapshots: AppData["stateSnapshots"] = [];
  let xpTransactions: AppData["xpTransactions"] = [];
  let quests: AppData["quests"] = [];
  let streak: AppData["streak"] = { current: 0, best: 0, lastReflectionDate: null, milestonesAwarded: [] };
  let garden: AppData["garden"] = { weekStart: weekStartString(localDateString()), stage: 0, actionsThisWeek: 0 };

  // 6 consecutive days of check-ins leading up to today (excluding today itself).
  for (let i = 6; i >= 1; i--) {
    const day = new Date(now);
    day.setDate(day.getDate() - i);
    const dateStr = localDateString(day);
    const values: [DimensionKey, number][] = [
      ["emotional_energy", 3 + (i % 2)],
      ["mental_clarity", 3 + ((i + 1) % 2)],
      ["inner_pressure", 2 + (i % 2)],
      ["grounding", 3 + ((i + 1) % 2)],
    ];
    const questions = values.map(([dim, v], idx) => fakeAnswer(dim, idx, v));
    const dims: Record<DimensionKey, number> = {
      emotional_energy: questions[0].normalizedValue,
      mental_clarity: questions[1].normalizedValue,
      inner_pressure: questions[2].normalizedValue,
      grounding: questions[3].normalizedValue,
    };
    const session: CheckInSession = {
      id: newId("checkin"),
      userId: user.id,
      source: "WEB",
      status: "COMPLETED",
      blueprintVersion: CHECKIN_BLUEPRINT_VERSION,
      questions,
      privateNote: null,
      summary: "Daily emotional check-in.",
      startedAt: day.toISOString(),
      completedAt: day.toISOString(),
    };
    checkIns.push(session);
    const snapshot = buildInnerState({
      id: newId("state"),
      userId: user.id,
      sourceType: "CHECK_IN",
      sourceId: session.id,
      dims,
    });
    snapshot.createdAt = day.toISOString();
    stateSnapshots.push(snapshot);

    xpTransactions = awardXP(xpTransactions, 10, "CHECK_IN", `CHECK_IN:${dateStr}`).transactions;
    quests = completeQuest(quests, "LOGIN", dateStr).quests;
    quests = completeQuest(quests, "CHECK_IN", dateStr).quests;
    const streakResult = updateStreakForReflection(streak, dateStr);
    streak = streakResult.streak;
    garden = updateGardenForReflection(garden, dateStr);
  }

  // Today's login quest (matches a normal "returning member" session).
  const todayStr = localDateString(now);
  quests = completeQuest(quests, "LOGIN", todayStr).quests;

  // Two completed Inner Readings, several days apart.
  const innerReadings: InnerReading[] = [];
  [9, 3].forEach((daysAgo) => {
    const day = new Date(now);
    day.setDate(day.getDate() - daysAgo);
    const dateStr = localDateString(day);
    const values: [DimensionKey, number][] = [
      ["emotional_energy", 3],
      ["mental_clarity", 4],
      ["inner_pressure", 2],
      ["grounding", 4],
      ["emotional_energy", 3],
      ["mental_clarity", 3],
      ["inner_pressure", 2],
      ["grounding", 4],
    ];
    const questions = values.map(([dim, v], idx) => fakeAnswer(dim, idx, v));
    const dims: Record<DimensionKey, number> = {
      emotional_energy: Math.round((questions[0].normalizedValue + questions[4].normalizedValue) / 2),
      mental_clarity: Math.round((questions[1].normalizedValue + questions[5].normalizedValue) / 2),
      inner_pressure: Math.round((questions[2].normalizedValue + questions[6].normalizedValue) / 2),
      grounding: Math.round((questions[3].normalizedValue + questions[7].normalizedValue) / 2),
    };
    const readingId = newId("reading");
    const { insight, reflectionQuestion } = buildReadingInsight(dims, readingId);
    const { title, subtitle } = buildReadingHeadline(dims, readingId);
    const reading: InnerReading = {
      id: readingId,
      userId: user.id,
      status: "COMPLETED",
      blueprintVersion: READING_BLUEPRINT_VERSION,
      questions,
      dimensionScores: dims,
      resultSummary: "A steady, grounded reading.",
      narrative: buildReadingNarrative(dims, personality.overallExplanation.split(".")[0]),
      insight,
      reflectionQuestion,
      title,
      subtitle,
      startedAt: day.toISOString(),
      completedAt: day.toISOString(),
      createdAt: day.toISOString(),
    };
    innerReadings.push(reading);
    const snapshot = buildInnerState({
      id: newId("state"),
      userId: user.id,
      sourceType: "INNER_READING",
      sourceId: reading.id,
      dims,
    });
    snapshot.createdAt = day.toISOString();
    stateSnapshots.push(snapshot);
    xpTransactions = awardXP(xpTransactions, 25, "INNER_READING", `INNER_READING:${dateStr}`).transactions;
    quests = completeQuest(quests, "INNER_READING", dateStr).quests;
    // Streak/garden are advanced strictly in chronological order from the
    // check-in loop above; these two readings sit outside that window
    // (9 and 3 days back) so they intentionally don't also touch streak/garden
    // here — doing so out of date order would corrupt the running streak.
  });

  const latestState = stateSnapshots[stateSnapshots.length - 1];
  const recommendation = buildRecommendation({
    id: newId("rec"),
    userId: user.id,
    state: latestState,
    personality,
    trigger: "INNER_READING",
    triggerSourceId: innerReadings[innerReadings.length - 1].id,
    isPremium: true,
  });

  const badgeResult = evaluateBadges([], {
    streakBest: streak.best,
    readingsCount: innerReadings.length,
    gardenStage: garden.stage,
    totalXpAmount: totalXP(xpTransactions),
  });

  const rewards = evaluateRewards([], {
    xp: totalXP(xpTransactions),
    streakBest: streak.best,
    badges: badgeResult.newlyEarned,
  });

  const journalNotes: { daysAgo: number; hour: number; minute: number; content: string }[] = [
    { daysAgo: 0, hour: 22, minute: 45, content: "I felt a lot of pressure today carrying multiple responsibilities. But I also noticed moments where I chose to slow down and breathe instead of pushing through." },
    { daysAgo: 1, hour: 21, minute: 15, content: "Today I made a decision that I had been postponing for a while. It feels good to take action, even if it's just one small step." },
    { daysAgo: 3, hour: 20, minute: 20, content: "A quiet morning, a good coffee, a kind message from a friend. Little things that remind me life is already good." },
    { daysAgo: 6, hour: 23, minute: 0, content: "Some things didn't go as planned today. I reminded myself that not everything is within my control, and that's okay." },
  ];
  const journalEntries: JournalEntry[] = journalNotes.map(({ daysAgo, hour, minute, content }) => {
    const day = new Date(now);
    day.setDate(day.getDate() - daysAgo);
    day.setHours(hour, minute, 0, 0);
    const id = newId("journal");
    const { mood, theme } = tagJournalEntry(id);
    return { id, userId: user.id, content, mood, theme, createdAt: day.toISOString() };
  });

  return {
    user,
    subscription: {
      plan: "PREMIUM",
      billingCycle: "ANNUAL",
      status: "ACTIVE",
      startsAt: new Date(now.getTime() - 9 * 86400000).toISOString(),
      renewsAt: new Date(now.getTime() + 356 * 86400000).toISOString(),
      expiresAt: null,
      cancelledAt: null,
      firstFreeReadingConsumedAt: new Date(now.getTime() - 9 * 86400000).toISOString(),
    },
    corePersonalities: [personality],
    checkIns,
    innerReadings,
    stateSnapshots,
    recommendations: [recommendation],
    xpTransactions,
    quests,
    streak,
    garden,
    badges: badgeResult.badges,
    rewards,
    journalEntries,
  };
}
