import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import { loadDB, saveDB, type DB } from "@/lib/storage";
import { createDemoAppData, createEmptyAppData, createUser, DEMO_EMAIL } from "@/lib/seed";
import { hashPassword, verifyPassword } from "@/lib/auth";
import { newId } from "@/lib/id";
import { BASELINE_ASSESSMENT } from "@/lib/blueprints";
import { buildInnerState, buildReadingNarrative, scoreBaseline, type BaselineAnswer } from "@/lib/scoring";
import { buildRecommendation } from "@/lib/recommendation";
import {
  allThreeQuestsComplete,
  awardXP,
  completeQuest,
  evaluateBadges,
  evaluateRewards,
  localDateString,
  refreshGardenWeek,
  STREAK_MILESTONE_XP,
  totalXP,
  updateGardenForReflection,
  updateStreakForReflection,
} from "@/lib/gamification";
import { isPremiumActive, innerReadingGate, type InnerReadingGate } from "@/lib/entitlement";
import type {
  AnsweredQuestion,
  AppData,
  BillingCycle,
  CheckInSession,
  CorePersonality,
  DimensionKey,
  InnerReading,
  Language,
  User,
} from "@/lib/types";

interface CompletionOutcome {
  xpAwarded: number;
  bonusAwarded: boolean;
  milestone: number | null;
  newBadges: string[];
}

interface AppStateValue {
  ready: boolean;
  user: User | null;
  data: AppData | null;
  isPremiumActive: boolean;
  innerReadingGate: InnerReadingGate;
  xpTotal: number;

  register: (params: { email: string; password: string; displayName: string; language: Language }) => { ok: true } | { ok: false; error: string };
  login: (params: { email: string; password: string }) => { ok: true } | { ok: false; error: string };
  loginDemo: () => void;
  logout: () => void;
  resetPassword: (params: { email: string; newPassword: string }) => { ok: true } | { ok: false; error: string };

  completeOnboardingBaseline: (answers: BaselineAnswer[]) => void;
  markOnboardingComplete: () => void;

  submitCheckIn: (answers: { questionId: string; dimension: DimensionKey; questionText: string; value: number }[], privateNote: string | null) => { sessionId: string; outcome: CompletionOutcome };
  submitInnerReading: (answers: { questionId: string; dimension: DimensionKey; questionText: string; value: number }[]) => { readingId: string; outcome: CompletionOutcome } | { error: "GATE" };

  recalibratePersonality: (answers: BaselineAnswer[]) => { ok: true } | { ok: false; nextEligibleAt: string };
  cooldownRemainingMs: () => number;

  subscribe: (billingCycle: BillingCycle) => void;
  cancelSubscription: () => void;
  reactivateSubscription: () => void;

  redeemReward: (key: string) => void;
  updateProfile: (partial: Partial<Pick<User, "displayName" | "preferredLanguage" | "timezone">>) => void;
}

const AppStateContext = createContext<AppStateValue | null>(null);

function currentPersonality(data: AppData): CorePersonality | null {
  return data.corePersonalities.find((p) => p.isCurrent) ?? null;
}

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<DB>({ version: 1, accounts: {}, session: { userId: null } });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // One-time hydration from localStorage — an external system that isn't
    // available during SSR, so it can only be read after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDb(loadDB());
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) saveDB(db);
  }, [db, ready]);

  const user = db.session.userId ? db.accounts[db.session.userId]?.user ?? null : null;
  const data = db.session.userId ? db.accounts[db.session.userId] ?? null : null;

  const mutateCurrent = useCallback((updater: (data: AppData) => AppData) => {
    setDb((prev) => {
      if (!prev.session.userId) return prev;
      const existing = prev.accounts[prev.session.userId];
      if (!existing) return prev;
      const next = updater(existing);
      return { ...prev, accounts: { ...prev.accounts, [prev.session.userId]: next } };
    });
  }, []);

  // Keep the Growth Garden's week fresh and complete today's Login quest once per session/day.
  useEffect(() => {
    if (!data) return;
    const today = localDateString();
    const needsLoginQuest = !data.quests.some((q) => q.quest === "LOGIN" && q.date === today);
    const refreshedGarden = refreshGardenWeek(data.garden, today);
    if (needsLoginQuest || refreshedGarden !== data.garden) {
      // Syncs today's Login quest / garden-week rollover against localStorage
      // on mount and whenever the active account changes — not a response to
      // in-React state, so it has to run as an effect.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      mutateCurrent((cur) => {
        const quests = needsLoginQuest ? completeQuest(cur.quests, "LOGIN", today).quests : cur.quests;
        const garden = refreshGardenWeek(cur.garden, today);
        return { ...cur, quests, garden, user: { ...cur.user, lastLoginAt: new Date().toISOString() } };
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.user.id]);

  const register = useCallback<AppStateValue["register"]>((params) => {
    const email = params.email.toLowerCase().trim();
    const exists = Object.values(db.accounts).some((a) => a.user.email === email);
    if (exists) return { ok: false, error: "An account with this email already exists." };
    const newUser = createUser(params);
    const appData = createEmptyAppData(newUser);
    setDb((prev) => ({
      ...prev,
      accounts: { ...prev.accounts, [newUser.id]: appData },
      session: { userId: newUser.id },
    }));
    return { ok: true };
  }, [db.accounts]);

  const login = useCallback<AppStateValue["login"]>((params) => {
    const email = params.email.toLowerCase().trim();
    const account = Object.values(db.accounts).find((a) => a.user.email === email);
    if (!account || !verifyPassword(params.password, account.user.passwordHash)) {
      return { ok: false, error: "Invalid email or password." };
    }
    setDb((prev) => ({ ...prev, session: { userId: account.user.id } }));
    return { ok: true };
  }, [db.accounts]);

  const loginDemo = useCallback(() => {
    setDb((prev) => {
      const demoExists = Object.values(prev.accounts).some((a) => a.user.email === DEMO_EMAIL);
      if (demoExists) {
        const demoUser = Object.values(prev.accounts).find((a) => a.user.email === DEMO_EMAIL)!.user;
        return { ...prev, session: { userId: demoUser.id } };
      }
      const demoData = createDemoAppData();
      return {
        ...prev,
        accounts: { ...prev.accounts, [demoData.user.id]: demoData },
        session: { userId: demoData.user.id },
      };
    });
  }, []);

  const logout = useCallback(() => {
    setDb((prev) => ({ ...prev, session: { userId: null } }));
  }, []);

  const resetPassword = useCallback<AppStateValue["resetPassword"]>((params) => {
    const email = params.email.toLowerCase().trim();
    const account = Object.values(db.accounts).find((a) => a.user.email === email);
    if (!account) return { ok: false, error: "No account found for this email." };
    setDb((prev) => ({
      ...prev,
      accounts: {
        ...prev.accounts,
        [account.user.id]: {
          ...account,
          user: { ...account.user, passwordHash: hashPassword(params.newPassword) },
        },
      },
    }));
    return { ok: true };
  }, [db.accounts]);

  const completeOnboardingBaseline = useCallback((answers: BaselineAnswer[]) => {
    mutateCurrent((cur) => {
      const personality = scoreBaseline(answers, { id: newId("cp"), userId: cur.user.id, version: 1 });
      return { ...cur, corePersonalities: [personality] };
    });
  }, [mutateCurrent]);

  const markOnboardingComplete = useCallback(() => {
    mutateCurrent((cur) => ({
      ...cur,
      user: { ...cur.user, onboardingCompletedAt: new Date().toISOString() },
    }));
  }, [mutateCurrent]);

  function toAnswered(
    raw: { questionId: string; dimension: DimensionKey; questionText: string; value: number }[]
  ): AnsweredQuestion[] {
    return raw.map((r, idx) => ({
      questionId: r.questionId,
      dimension: r.dimension,
      questionText: r.questionText,
      answerValue: r.value,
      normalizedValue: Math.round(((r.value - 1) / 4) * 100),
      generationSource: "AI",
      orderIndex: idx,
      answeredAt: new Date().toISOString(),
    }));
  }

  function dimensionAverage(questions: AnsweredQuestion[]): Record<DimensionKey, number> {
    const dims: DimensionKey[] = ["emotional_energy", "mental_clarity", "inner_pressure", "grounding"];
    const result = {} as Record<DimensionKey, number>;
    for (const dim of dims) {
      const vals = questions.filter((q) => q.dimension === dim).map((q) => q.normalizedValue);
      result[dim] = vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 50;
    }
    return result;
  }

  const applyReflectionSideEffects = useCallback(
    (
      cur: AppData,
      params: { questKey: "CHECK_IN" | "INNER_READING"; xpAmount: number; dims: Record<DimensionKey, number>; sourceType: "CHECK_IN" | "INNER_READING"; sourceId: string }
    ): { data: AppData; outcome: CompletionOutcome } => {
      const today = localDateString();
      const snapshot = buildInnerState({
        id: newId("state"),
        userId: cur.user.id,
        sourceType: params.sourceType,
        sourceId: params.sourceId,
        dims: params.dims,
      });

      let xpTransactions = cur.xpTransactions;
      const primaryAward = awardXP(
        xpTransactions,
        params.xpAmount,
        params.questKey,
        `${params.questKey}:${today}`
      );
      xpTransactions = primaryAward.transactions;

      const quests = completeQuest(cur.quests, params.questKey, today).quests;

      let bonusAwarded = false;
      if (allThreeQuestsComplete(quests, today)) {
        const bonus = awardXP(xpTransactions, 10, "DAILY_QUEST_BONUS", `DAILY_QUEST_BONUS:${today}`);
        if (bonus.awarded) bonusAwarded = true;
        xpTransactions = bonus.transactions;
      }

      const streakResult = updateStreakForReflection(cur.streak, today);
      const streak = streakResult.streak;
      if (streakResult.newMilestone) {
        const milestoneXp = STREAK_MILESTONE_XP[streakResult.newMilestone];
        xpTransactions = awardXP(
          xpTransactions,
          milestoneXp,
          "STREAK_MILESTONE",
          `STREAK_MILESTONE:${streakResult.newMilestone}`
        ).transactions;
      }

      const garden = updateGardenForReflection(cur.garden, today);

      const badgeResult = evaluateBadges(cur.badges, {
        streakBest: streak.best,
        readingsCount: cur.innerReadings.filter((r) => r.status === "COMPLETED").length +
          (params.sourceType === "INNER_READING" ? 1 : 0),
        gardenStage: garden.stage,
        totalXpAmount: totalXP(xpTransactions),
      });

      const rewards = evaluateRewards(cur.rewards, {
        xp: totalXP(xpTransactions),
        streakBest: streak.best,
        badges: badgeResult.badges.map((b) => b.key),
      });

      let recommendations = cur.recommendations;
      const personality = currentPersonality({ ...cur });
      if (personality) {
        const rec = buildRecommendation({
          id: newId("rec"),
          userId: cur.user.id,
          state: snapshot,
          personality,
          trigger: params.sourceType,
          triggerSourceId: params.sourceId,
          isPremium: isPremiumActive(cur.subscription),
        });
        recommendations = [...recommendations, rec];
      }

      const nextData: AppData = {
        ...cur,
        stateSnapshots: [...cur.stateSnapshots, snapshot],
        xpTransactions,
        quests,
        streak,
        garden,
        badges: badgeResult.badges,
        rewards,
        recommendations,
      };

      return {
        data: nextData,
        outcome: {
          xpAwarded: primaryAward.awarded ? params.xpAmount : 0,
          bonusAwarded,
          milestone: streakResult.newMilestone,
          newBadges: badgeResult.newlyEarned,
        },
      };
    },
    []
  );

  const submitCheckIn = useCallback<AppStateValue["submitCheckIn"]>((answers, privateNote) => {
    let sessionId = "";
    let outcome: CompletionOutcome = { xpAwarded: 0, bonusAwarded: false, milestone: null, newBadges: [] };
    mutateCurrent((cur) => {
      const questions = toAnswered(answers);
      const dims = dimensionAverage(questions);
      const now = new Date().toISOString();
      const session: CheckInSession = {
        id: newId("checkin"),
        userId: cur.user.id,
        source: "WEB",
        status: "COMPLETED",
        blueprintVersion: "checkin-v1",
        questions,
        privateNote: privateNote && privateNote.trim() ? privateNote.trim() : null,
        summary: "Daily emotional check-in.",
        startedAt: now,
        completedAt: now,
      };
      sessionId = session.id;
      const { data: withEffects, outcome: o } = applyReflectionSideEffects(cur, {
        questKey: "CHECK_IN",
        xpAmount: 10,
        dims,
        sourceType: "CHECK_IN",
        sourceId: session.id,
      });
      outcome = o;
      return { ...withEffects, checkIns: [...cur.checkIns, session] };
    });
    return { sessionId, outcome };
  }, [applyReflectionSideEffects, mutateCurrent]);

  const submitInnerReading = useCallback<AppStateValue["submitInnerReading"]>((answers) => {
    if (!data) return { error: "GATE" };
    const gate = innerReadingGate(data.subscription);
    if (gate === "MEMBERSHIP_GATE") return { error: "GATE" };

    let readingId = "";
    let outcome: CompletionOutcome = { xpAwarded: 0, bonusAwarded: false, milestone: null, newBadges: [] };
    mutateCurrent((cur) => {
      const questions = toAnswered(answers);
      const dims = dimensionAverage(questions);
      const now = new Date().toISOString();
      const personality = currentPersonality(cur);
      const reading: InnerReading = {
        id: newId("reading"),
        userId: cur.user.id,
        status: "COMPLETED",
        blueprintVersion: "reading-v1",
        questions,
        dimensionScores: dims,
        resultSummary: "Inner Reading complete.",
        narrative: buildReadingNarrative(dims, personality ? personality.archetype : "steady_anchor"),
        startedAt: now,
        completedAt: now,
      };
      readingId = reading.id;
      const { data: withEffects, outcome: o } = applyReflectionSideEffects(cur, {
        questKey: "INNER_READING",
        xpAmount: 25,
        dims,
        sourceType: "INNER_READING",
        sourceId: reading.id,
      });
      outcome = o;
      const gateNow = innerReadingGate(cur.subscription);
      const subscription =
        gateNow === "ALLOW_FIRST_FREE"
          ? { ...withEffects.subscription, firstFreeReadingConsumedAt: now }
          : withEffects.subscription;
      return { ...withEffects, innerReadings: [...cur.innerReadings, reading], subscription };
    });
    return { readingId, outcome };
  }, [applyReflectionSideEffects, data, mutateCurrent]);

  const cooldownRemainingMs = useCallback(() => {
    if (!user?.corePersonalityLastRecalibratedAt) return 0;
    const last = new Date(user.corePersonalityLastRecalibratedAt).getTime();
    const remaining = last + 24 * 60 * 60 * 1000 - Date.now();
    return Math.max(0, remaining);
  }, [user]);

  const recalibratePersonality = useCallback<AppStateValue["recalibratePersonality"]>((answers) => {
    if (!user) return { ok: false, nextEligibleAt: new Date().toISOString() };
    const remaining = cooldownRemainingMs();
    if (remaining > 0) {
      return { ok: false, nextEligibleAt: new Date(Date.now() + remaining).toISOString() };
    }
    mutateCurrent((cur) => {
      const nextVersion = cur.corePersonalities.length + 1;
      const personality = scoreBaseline(answers, { id: newId("cp"), userId: cur.user.id, version: nextVersion });
      return {
        ...cur,
        corePersonalities: [
          ...cur.corePersonalities.map((p) => ({ ...p, isCurrent: false })),
          personality,
        ],
        user: { ...cur.user, corePersonalityLastRecalibratedAt: new Date().toISOString() },
      };
    });
    return { ok: true };
  }, [cooldownRemainingMs, mutateCurrent, user]);

  const subscribe = useCallback((billingCycle: BillingCycle) => {
    mutateCurrent((cur) => {
      const now = new Date();
      const renews = new Date(now);
      renews.setMonth(renews.getMonth() + (billingCycle === "ANNUAL" ? 12 : 1));
      return {
        ...cur,
        subscription: {
          plan: "PREMIUM",
          billingCycle,
          status: "ACTIVE",
          startsAt: now.toISOString(),
          renewsAt: renews.toISOString(),
          expiresAt: null,
          cancelledAt: null,
          firstFreeReadingConsumedAt: cur.subscription.firstFreeReadingConsumedAt,
        },
      };
    });
  }, [mutateCurrent]);

  const cancelSubscription = useCallback(() => {
    mutateCurrent((cur) => {
      const expires = cur.subscription.renewsAt ?? new Date().toISOString();
      return {
        ...cur,
        subscription: {
          ...cur.subscription,
          status: "CANCELLED",
          cancelledAt: new Date().toISOString(),
          expiresAt: expires,
        },
      };
    });
  }, [mutateCurrent]);

  const reactivateSubscription = useCallback(() => {
    mutateCurrent((cur) => ({
      ...cur,
      subscription: {
        ...cur.subscription,
        status: "ACTIVE",
        cancelledAt: null,
        expiresAt: null,
      },
    }));
  }, [mutateCurrent]);

  const redeemReward = useCallback((key: string) => {
    mutateCurrent((cur) => ({
      ...cur,
      rewards: cur.rewards.map((r) =>
        r.key === key && r.state === "UNLOCKED"
          ? { ...r, state: "REDEEMED" as const, redeemedAt: new Date().toISOString() }
          : r
      ),
    }));
  }, [mutateCurrent]);

  const updateProfile = useCallback<AppStateValue["updateProfile"]>((partial) => {
    mutateCurrent((cur) => ({ ...cur, user: { ...cur.user, ...partial } }));
  }, [mutateCurrent]);

  const value = useMemo<AppStateValue>(() => ({
    ready,
    user,
    data,
    isPremiumActive: data ? isPremiumActive(data.subscription) : false,
    innerReadingGate: data ? innerReadingGate(data.subscription) : "ALLOW_FIRST_FREE",
    xpTotal: data ? totalXP(data.xpTransactions) : 0,
    register,
    login,
    loginDemo,
    logout,
    resetPassword,
    completeOnboardingBaseline,
    markOnboardingComplete,
    submitCheckIn,
    submitInnerReading,
    recalibratePersonality,
    cooldownRemainingMs,
    subscribe,
    cancelSubscription,
    reactivateSubscription,
    redeemReward,
    updateProfile,
  }), [
    ready,
    user,
    data,
    register,
    login,
    loginDemo,
    logout,
    resetPassword,
    completeOnboardingBaseline,
    markOnboardingComplete,
    submitCheckIn,
    submitInnerReading,
    recalibratePersonality,
    cooldownRemainingMs,
    subscribe,
    cancelSubscription,
    reactivateSubscription,
    redeemReward,
    updateProfile,
  ]);

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState(): AppStateValue {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState must be used within AppStateProvider");
  return ctx;
}

export function useCurrentPersonality(): CorePersonality | null {
  const { data } = useAppState();
  return data ? currentPersonality(data) : null;
}

export function getBaselineQuestions() {
  return BASELINE_ASSESSMENT;
}
