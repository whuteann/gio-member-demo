import type {
  ArchetypeKey,
  BadgeDefinition,
  DimensionKey,
  Product,
  QuestionVariant,
  RewardDefinition,
} from "./types";

export const CHECKIN_BLUEPRINT_VERSION = "checkin-v1";
export const READING_BLUEPRINT_VERSION = "reading-v1";
export const SCORING_VERSION = "score-v1";
export const ASSESSMENT_VERSION = "baseline-v1";

export const DIMENSIONS: { key: DimensionKey; label: string; lowLabel: string; highLabel: string }[] = [
  { key: "emotional_energy", label: "Emotional Energy", lowLabel: "Drained", highLabel: "Energised" },
  { key: "mental_clarity", label: "Mental Clarity", lowLabel: "Foggy", highLabel: "Clear" },
  { key: "inner_pressure", label: "Inner Pressure", lowLabel: "Light", highLabel: "Heavy" },
  { key: "grounding", label: "Grounding", lowLabel: "Unsteady", highLabel: "Rooted" },
];

// Each dimension has several phrasing variants to simulate AI-generated wording
// bound to a stable, approved blueprint (PDF §9).
export const CHECKIN_QUESTION_POOL: Record<DimensionKey, string[]> = {
  emotional_energy: [
    "Right now, how much emotional energy do you have available?",
    "How charged or drained does your heart feel in this moment?",
    "If your energy were a battery, how full is it right now?",
  ],
  mental_clarity: [
    "How clearly are you able to think right now?",
    "Does your mind feel sharp today, or a little clouded?",
    "How easy is it to focus on what matters right now?",
  ],
  inner_pressure: [
    "How much pressure or weight are you carrying today?",
    "How loud does the pressure in your chest feel right now?",
    "How much is today asking of you compared to what you have to give?",
  ],
  grounding: [
    "How steady and rooted do you feel today?",
    "How connected do you feel to yourself right now?",
    "If someone nudged you, how easily would you sway?",
  ],
};

export const READING_QUESTION_POOL: Record<DimensionKey, string[]> = {
  emotional_energy: [
    "Looking back on the last few days, how has your emotional reserve held up?",
    "When you picture your inner light right now, how brightly is it burning?",
    "How much of yourself do you feel you have left to give today?",
  ],
  mental_clarity: [
    "How clearly can you see the path in front of you right now?",
    "When decisions come up lately, do they feel simple or tangled?",
    "How much noise is between you and a clear thought today?",
  ],
  inner_pressure: [
    "What is the weight you've been quietly carrying this week?",
    "How close do you feel to your limit right now?",
    "How much is unresolved and sitting heavy in your mind?",
  ],
  grounding: [
    "How anchored do you feel in who you are right now?",
    "When things shift around you, how solid does your footing stay?",
    "How connected do you feel to your own rhythm this week?",
  ],
};

export interface PillarPrompt {
  pillar: "thinking" | "emotionalSensitivity" | "adaptability" | "willpower";
  prompt: string;
  optionA: { label: string; weight: ArchetypeKey; pillarValue: number };
  optionB: { label: string; weight: ArchetypeKey; pillarValue: number };
}

// Baseline / recalibration assessment used to build the Core Personality profile.
// pillarValue (0-100) is the intensity of that pillar's trait expressed by picking the option.
export const BASELINE_ASSESSMENT: PillarPrompt[] = [
  {
    pillar: "thinking",
    prompt: "When a hard decision shows up, you tend to...",
    optionA: { label: "Map it out carefully before acting", weight: "quiet_strategist", pillarValue: 85 },
    optionB: { label: "Go with your first instinct", weight: "bright_spark", pillarValue: 40 },
  },
  {
    pillar: "thinking",
    prompt: "In a new situation, you usually...",
    optionA: { label: "Look for the underlying pattern", weight: "quiet_strategist", pillarValue: 80 },
    optionB: { label: "Explore and see what happens", weight: "open_horizon", pillarValue: 45 },
  },
  {
    pillar: "emotionalSensitivity",
    prompt: "When someone close to you is upset, you...",
    optionA: { label: "Feel it almost as strongly as they do", weight: "bright_spark", pillarValue: 85 },
    optionB: { label: "Stay calm so you can help steadily", weight: "steady_anchor", pillarValue: 40 },
  },
  {
    pillar: "emotionalSensitivity",
    prompt: "Your emotions during the day are usually...",
    optionA: { label: "Vivid and quick to shift", weight: "bright_spark", pillarValue: 80 },
    optionB: { label: "Steady and slow to move", weight: "steady_anchor", pillarValue: 35 },
  },
  {
    pillar: "adaptability",
    prompt: "When plans suddenly change, you...",
    optionA: { label: "Adjust quickly and keep moving", weight: "open_horizon", pillarValue: 85 },
    optionB: { label: "Prefer to re-anchor before continuing", weight: "steady_anchor", pillarValue: 40 },
  },
  {
    pillar: "adaptability",
    prompt: "A new environment feels...",
    optionA: { label: "Exciting — new ground to explore", weight: "open_horizon", pillarValue: 80 },
    optionB: { label: "Something to study before diving in", weight: "quiet_strategist", pillarValue: 45 },
  },
  {
    pillar: "willpower",
    prompt: "When something gets hard, you...",
    optionA: { label: "Keep going, one steady step at a time", weight: "steady_anchor", pillarValue: 85 },
    optionB: { label: "Find a spark to push through", weight: "bright_spark", pillarValue: 55 },
  },
  {
    pillar: "willpower",
    prompt: "You keep long-term commitments by...",
    optionA: { label: "Sticking to a plan even when it's dull", weight: "quiet_strategist", pillarValue: 80 },
    optionB: { label: "Staying open to whatever keeps you moving", weight: "open_horizon", pillarValue: 50 },
  },
];

export interface ArchetypeCopy {
  key: ArchetypeKey;
  name: string;
  tagline: string;
  overall: string;
  pillars: Record<
    "thinking" | "emotionalSensitivity" | "adaptability" | "willpower",
    string
  >;
}

export const ARCHETYPES: Record<ArchetypeKey, ArchetypeCopy> = {
  steady_anchor: {
    key: "steady_anchor",
    name: "The Steady Anchor",
    tagline: "Grounded, dependable, quietly unshakeable.",
    overall:
      "You hold steady when things get loud around you. Others lean on your calm the way a ship leans on its anchor — you don't need the spotlight to be the reason a room feels safe.",
    pillars: {
      thinking: "You think in a measured, unhurried way, preferring solid ground over speed.",
      emotionalSensitivity: "You feel things deeply but rarely let the surface show — steadiness is your love language.",
      adaptability: "You adapt slowly and deliberately, re-anchoring before you move again.",
      willpower: "Your willpower is quiet and relentless — you keep going long after the excitement fades.",
    },
  },
  bright_spark: {
    key: "bright_spark",
    name: "The Bright Spark",
    tagline: "Vivid, expressive, alive in the moment.",
    overall:
      "You move through the world in colour. Your feelings arrive fast and full, and that same aliveness is what lets you connect, create and light up a room without even trying.",
    pillars: {
      thinking: "You think fast and intuitively, trusting the first flash of insight.",
      emotionalSensitivity: "Your emotional range is wide and quick — you feel things vividly and in real time.",
      adaptability: "You adapt on the fly, energised rather than unsettled by change.",
      willpower: "Your willpower comes in bursts of inspiration rather than a steady grind.",
    },
  },
  quiet_strategist: {
    key: "quiet_strategist",
    name: "The Quiet Strategist",
    tagline: "Thoughtful, patient, always three steps ahead.",
    overall:
      "You see the shape of things before others do. You'd rather understand a system fully than rush an answer — patience is one of your quiet superpowers.",
    pillars: {
      thinking: "You think in structures and patterns, mapping things out before acting.",
      emotionalSensitivity: "You process feelings internally and thoroughly, rarely reacting before reflecting.",
      adaptability: "You prefer to study new ground before stepping onto it.",
      willpower: "Your willpower is disciplined — you can sustain effort on things that don't feel exciting yet.",
    },
  },
  open_horizon: {
    key: "open_horizon",
    name: "The Open Horizon",
    tagline: "Curious, flexible, drawn to what's next.",
    overall:
      "You're energised by possibility. New ground doesn't scare you — it invites you. Your flexibility is a genuine strength, letting you move where rigid people get stuck.",
    pillars: {
      thinking: "You think expansively, comfortable holding multiple possibilities at once.",
      emotionalSensitivity: "You feel a wide emotional range and let it inform, rather than derail, your choices.",
      adaptability: "You adapt easily and often seek change out rather than waiting for it.",
      willpower: "Your willpower is fuelled by curiosity — momentum comes easiest when something feels new.",
    },
  },
};

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  { key: "three_day_streak", group: "consistency", title: "Three Days Steady", description: "Reflected three days in a row.", icon: "🌤️" },
  { key: "two_week_rhythm", group: "consistency", title: "Two-Week Rhythm", description: "Kept a 14-day reflection streak.", icon: "🕰️" },
  { key: "first_insight", group: "depth", title: "First Insight", description: "Completed your first Inner Reading.", icon: "🔍" },
  { key: "deep_diver", group: "depth", title: "Deep Diver", description: "Completed five Inner Readings.", icon: "🌊" },
  { key: "first_bloom", group: "growth", title: "First Bloom", description: "Grew your Garden to full bloom in a week.", icon: "🌸" },
  { key: "momentum", group: "growth", title: "Momentum", description: "Earned 300 total XP.", icon: "⚡" },
];

export const REWARD_DEFINITIONS: RewardDefinition[] = [
  {
    key: "golden_hour_playlist",
    title: "Golden Hour Playlist",
    description: "A wind-down playlist curated for grounding evenings.",
    icon: "🎧",
    requirement: "Reach 50 XP",
    isEligible: ({ xp }) => xp >= 50,
  },
  {
    key: "grounding_ritual_guide",
    title: "Grounding Ritual Guide",
    description: "A short guide to a 5-minute grounding ritual.",
    icon: "📖",
    requirement: "Reach 150 XP",
    isEligible: ({ xp }) => xp >= 150,
  },
  {
    key: "founding_streak_candle",
    title: "Founding Streak Candle Discount",
    description: "15% toward any candle in the Gio store.",
    icon: "🕯️",
    requirement: "Reach a 7-day streak",
    isEligible: ({ streakBest }) => streakBest >= 7,
  },
  {
    key: "archetype_deep_dive",
    title: "Archetype Deep-Dive Report",
    description: "An extended written breakdown of your archetype.",
    icon: "📜",
    requirement: "Earn 3 badges",
    isEligible: ({ badges }) => badges.length >= 3,
  },
];

export const PRODUCTS: Product[] = [
  { id: "p_candle_amber", title: "Amber Root Candle", colourTag: "amber", elementTag: ["grounding", "calm"], price: 68, imageSeed: "gio-candle-amber", available: true },
  { id: "p_oil_clarity", title: "Clarity Roller Oil", colourTag: "teal", elementTag: ["clarity", "focus"], price: 42, imageSeed: "gio-oil-teal", available: true },
  { id: "p_tea_calm", title: "Quiet Hours Tea Blend", colourTag: "moss", elementTag: ["calm", "grounding"], price: 28, imageSeed: "gio-tea-moss", available: true },
  { id: "p_journal_deep", title: "Deep Focus Journal", colourTag: "clay", elementTag: ["clarity", "reflection"], price: 36, imageSeed: "gio-journal-clay", available: true },
  { id: "p_bracelet_anchor", title: "Anchor Bead Bracelet", colourTag: "ivory", elementTag: ["grounding", "steadiness"], price: 54, imageSeed: "gio-bracelet-ivory", available: true },
  { id: "p_incense_spark", title: "Bright Spark Incense", colourTag: "coral", elementTag: ["energy", "lift"], price: 24, imageSeed: "gio-incense-coral", available: true },
  { id: "p_soak_release", title: "Pressure Release Salt Soak", colourTag: "slate", elementTag: ["release", "calm"], price: 32, imageSeed: "gio-soak-slate", available: true },
  { id: "p_wrap_horizon", title: "Open Horizon Wrap Ring", colourTag: "gold", elementTag: ["adaptability", "lift"], price: 46, imageSeed: "gio-ring-gold", available: false },
];

export function pickPhrasing(seed: string, options: string[]): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return options[hash % options.length];
}

export function buildQuestionOrder(pool: Record<DimensionKey, string[]>, count: number, seed: string): QuestionVariant[] {
  const dims: DimensionKey[] = ["emotional_energy", "mental_clarity", "inner_pressure", "grounding"];
  const order: DimensionKey[] = [];
  for (let i = 0; i < count; i++) order.push(dims[i % dims.length]);
  return order.map((dimension, i) => ({
    dimension,
    text: pickPhrasing(`${seed}-${dimension}-${i}`, pool[dimension]),
  }));
}
