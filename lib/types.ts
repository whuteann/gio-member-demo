// Domain types mirroring the Phase 1 System Outline (§12 Database Model Outline).
// This is a client-only demo "backend" — these types stand in for DB rows.

export type Language = "en" | "zh";

export type SubscriptionPlan = "FREE" | "PREMIUM";
export type BillingCycle = "MONTHLY" | "ANNUAL";
export type SubscriptionStatus =
  | "ACTIVE"
  | "PENDING"
  | "PAYMENT_FAILED"
  | "CANCELLED"
  | "EXPIRED";

export interface Subscription {
  plan: SubscriptionPlan;
  billingCycle: BillingCycle | null;
  status: SubscriptionStatus;
  startsAt: string | null;
  renewsAt: string | null;
  expiresAt: string | null;
  cancelledAt: string | null;
  firstFreeReadingConsumedAt: string | null;
}

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  displayName: string;
  gid: string;
  status: "ACTIVE";
  preferredLanguage: Language;
  timezone: string;
  onboardingCompletedAt: string | null;
  corePersonalityLastRecalibratedAt: string | null;
  lastLoginAt: string | null;
  createdAt: string;
}

export type DimensionKey =
  | "emotional_energy"
  | "mental_clarity"
  | "inner_pressure"
  | "grounding";

export interface QuestionVariant {
  dimension: DimensionKey;
  text: string;
}

export interface AnsweredQuestion {
  questionId: string;
  dimension: DimensionKey;
  questionText: string;
  answerValue: number; // 1-5 raw scale
  normalizedValue: number; // 0-100
  generationSource: "AI" | "STATIC_FALLBACK";
  orderIndex: number;
  answeredAt: string;
}

export type SessionStatus = "STARTED" | "IN_PROGRESS" | "COMPLETED" | "ABANDONED";
export type SessionSource = "WEB" | "WHATSAPP";

export interface CheckInSession {
  id: string;
  userId: string;
  source: SessionSource;
  status: SessionStatus;
  blueprintVersion: string;
  questions: AnsweredQuestion[];
  privateNote: string | null;
  summary: string | null;
  startedAt: string;
  completedAt: string | null;
}

export interface InnerReading {
  id: string;
  userId: string;
  status: SessionStatus;
  blueprintVersion: string;
  questions: AnsweredQuestion[];
  dimensionScores: Record<DimensionKey, number> | null;
  resultSummary: string | null;
  narrative: string | null;
  insight: string | null;
  reflectionQuestion: string | null;
  title: string | null;
  subtitle: string | null;
  startedAt: string;
  completedAt: string | null;
  createdAt: string;
}

export type InnerStateSourceType = "CHECK_IN" | "INNER_READING";

export interface InnerStateSnapshot {
  id: string;
  userId: string;
  sourceType: InnerStateSourceType;
  sourceId: string;
  emotionalEnergy: number;
  mentalClarity: number;
  innerPressure: number;
  grounding: number;
  balance: number;
  currentFocus: string;
  summary: string;
  createdAt: string;
}

export type ArchetypeKey =
  | "steady_anchor"
  | "bright_spark"
  | "quiet_strategist"
  | "open_horizon";

export interface CorePersonality {
  id: string;
  userId: string;
  version: number;
  archetype: ArchetypeKey;
  icon: string;
  thinking: number;
  emotionalSensitivity: number;
  adaptability: number;
  willpower: number;
  overallExplanation: string;
  pillarExplanations: Record<
    "thinking" | "emotionalSensitivity" | "adaptability" | "willpower",
    string
  >;
  assessmentVersion: string;
  isCurrent: boolean;
  generatedAt: string;
  recalibratedAt: string | null;
}

export type RecommendationItemType =
  | "COLOUR"
  | "ROUTINE"
  | "SCENT"
  | "WEARABLE"
  | "PRODUCT";

export interface RecommendationItem {
  id: string;
  type: RecommendationItemType;
  referenceId: string | null;
  title: string;
  reason: string;
  rank: number;
  imageUrl?: string;
  price?: number;
  destinationUrl?: string;
}

export type ColourKey = "scarlet" | "russet" | "gold" | "forest" | "ocean";

export interface ColourMeaning {
  key: ColourKey;
  name: string;
  swatch: string;
  traits: [string, string, string];
  description: string;
  article: string;
  benefit: string;
  affirmations: [string, string];
}

export type RecommendationTrigger = "CHECK_IN" | "INNER_READING";
export type RecommendationStatus = "GENERATING" | "READY" | "FAILED";

export interface RecommendationProfile {
  id: string;
  userId: string;
  stateSnapshotId: string;
  corePersonalityId: string;
  triggerType: RecommendationTrigger;
  triggerSourceId: string;
  currentFocus: string;
  summary: string;
  primaryColour: string;
  status: RecommendationStatus;
  items: RecommendationItem[];
  generatedAt: string;
}

export type XPSourceAction =
  | "CHECK_IN"
  | "INNER_READING"
  | "DAILY_QUEST_BONUS"
  | "STREAK_MILESTONE";

export interface XPTransaction {
  id: string;
  amount: number;
  sourceAction: XPSourceAction;
  sourceKey: string; // dedupe key, e.g. `CHECK_IN:2026-09-06`
  createdAt: string;
}

export type QuestKey = "LOGIN" | "CHECK_IN" | "INNER_READING";

export interface UserQuest {
  date: string; // local YYYY-MM-DD
  quest: QuestKey;
  completedAt: string;
}

export interface UserStreak {
  current: number;
  best: number;
  lastReflectionDate: string | null; // YYYY-MM-DD
  milestonesAwarded: number[]; // [7, 30, 100]
}

export interface GardenProgress {
  weekStart: string; // YYYY-MM-DD (Monday)
  stage: number; // 0-4
  actionsThisWeek: number;
}

export type BadgeGroup = "consistency" | "depth" | "growth";

export interface BadgeDefinition {
  key: string;
  group: BadgeGroup;
  title: string;
  description: string;
  icon: string;
}

export interface UserBadge {
  key: string;
  earnedAt: string;
}

export interface RewardDefinition {
  key: string;
  title: string;
  description: string;
  icon: string;
  requirement: string;
  isEligible: (ctx: { xp: number; streakBest: number; badges: string[] }) => boolean;
}

export type RewardState = "LOCKED" | "UNLOCKED" | "REDEEMED";

export interface UserReward {
  key: string;
  state: RewardState;
  unlockedAt: string | null;
  redeemedAt: string | null;
}

export interface Product {
  id: string;
  title: string;
  colourTag: string;
  elementTag: string[];
  price: number;
  imageSeed: string;
  available: boolean;
}

export interface JournalEntry {
  id: string;
  userId: string;
  content: string;
  mood: string;
  theme: string;
  createdAt: string;
}

export interface AppData {
  user: User;
  subscription: Subscription;
  corePersonalities: CorePersonality[];
  checkIns: CheckInSession[];
  innerReadings: InnerReading[];
  stateSnapshots: InnerStateSnapshot[];
  recommendations: RecommendationProfile[];
  xpTransactions: XPTransaction[];
  quests: UserQuest[];
  streak: UserStreak;
  garden: GardenProgress;
  badges: UserBadge[];
  rewards: UserReward[];
  journalEntries: JournalEntry[];
}
