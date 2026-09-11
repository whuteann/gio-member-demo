import type {
  ArchetypeKey,
  BadgeDefinition,
  ColourKey,
  ColourMeaning,
  DimensionKey,
  Product,
  QuestionVariant,
  RewardDefinition,
} from "./types";

export const CHECKIN_BLUEPRINT_VERSION = "checkin-v1";
export const READING_BLUEPRINT_VERSION = "reading-v1";
export const SCORING_VERSION = "score-v1";
export const ASSESSMENT_VERSION = "baseline-v1";

export const DIMENSIONS: { key: DimensionKey; label: string; lowLabel: string; highLabel: string; color: string }[] = [
  { key: "emotional_energy", label: "Emotional Energy", lowLabel: "Drained", highLabel: "Energised", color: "var(--color-energy)" },
  { key: "mental_clarity", label: "Mental Clarity", lowLabel: "Foggy", highLabel: "Clear", color: "var(--color-clarity)" },
  { key: "inner_pressure", label: "Inner Pressure", lowLabel: "Light", highLabel: "Heavy", color: "var(--color-pressure)" },
  { key: "grounding", label: "Grounding", lowLabel: "Unsteady", highLabel: "Rooted", color: "var(--color-grounding)" },
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

// Insight + reflection question variants for Inner Reading results, keyed by the
// same focus key that lib/scoring.ts#resolveFocusKey derives from a reading's
// dimension scores. One is picked per reading via a seeded hash (see
// lib/blueprints.ts#pickPhrasing) so results feel varied but stay reproducible.
export const INSIGHT_LIBRARY: Record<string, { insight: string; reflectionQuestion: string }[]> = {
  emotional_energy: [
    {
      insight: "You tend to keep giving even after your own tank runs low. Today's reading shows your reserves could use real refilling, not just a pause.",
      reflectionQuestion: "Where could you let your energy be the priority today, instead of last on the list?",
    },
    {
      insight: "There's a quiet tiredness running under today's reading — the kind that doesn't always show on the surface.",
      reflectionQuestion: "What would it look like to rest before you're running on empty, rather than after?",
    },
  ],
  mental_clarity: [
    {
      insight: "Your thoughts have been carrying more static than usual. Today's reading suggests the fog is about bandwidth, not ability.",
      reflectionQuestion: "What's one thing you could set down today just to think a little more clearly?",
    },
    {
      insight: "You're circling a few decisions without quite landing on them. That's less indecision than an overloaded plate.",
      reflectionQuestion: "If you only had to make one decision well today, which one would matter most?",
    },
  ],
  inner_pressure: [
    {
      insight: "You tend to take responsibility seriously. Today's reading shows you may be carrying tasks that aren't entirely yours to manage.",
      reflectionQuestion: "Which responsibility are you carrying because it's necessary, and which have you accepted out of habit?",
    },
    {
      insight: "There's more weight in today's reading than usual — the kind that builds quietly when nothing gets set down.",
      reflectionQuestion: "What's one thing you're holding onto today that you could hand off, delay, or simply let go?",
    },
  ],
  grounding: [
    {
      insight: "You've been moving fast enough that today's reading shows a little distance between you and your own footing.",
      reflectionQuestion: "What's one small, familiar routine that could bring you back to yourself today?",
    },
    {
      insight: "Today's reading suggests you're a little more untethered than usual — reacting to the day rather than rooted in it.",
      reflectionQuestion: "Where in your day could you slow down just enough to feel your own ground again?",
    },
  ],
  balanced: [
    {
      insight: "You're in a steady place across the board today — a good moment to build on momentum rather than just maintain it.",
      reflectionQuestion: "What's one thing you'd like to grow while things feel steady, rather than wait for a harder moment?",
    },
    {
      insight: "Today's reading shows things holding evenly. Steadiness like this is worth noticing, not just passing through.",
      reflectionQuestion: "What helped you get to this steady place, and how could you protect it going forward?",
    },
  ],
};

// Short title + subtitle variants for a reading's card/list appearance, keyed
// by the same focus key as INSIGHT_LIBRARY and picked the same seeded way.
export const HEADLINE_LIBRARY: Record<string, { title: string; subtitle: string }[]> = {
  emotional_energy: [
    { title: "Need for Recovery", subtitle: "You appeared to need more personal space and mental rest." },
    { title: "Running on Reserve", subtitle: "You're giving from a tank that hasn't had a real refill in a while." },
  ],
  mental_clarity: [
    { title: "Uncertainty Before Decision", subtitle: "You were seeking clarity and trying to avoid making the wrong choice." },
    { title: "Thoughts in Motion", subtitle: "Your mind was circling a few things without quite landing on them." },
  ],
  inner_pressure: [
    { title: "Responsibility & Mental Overload", subtitle: "Focused and capable, but your emotional energy was lower than usual." },
    { title: "Carrying More Than Usual", subtitle: "You were holding a heavier load than the day really asked for." },
  ],
  grounding: [
    { title: "Finding Your Footing", subtitle: "You felt a little more untethered than usual today." },
    { title: "Steadying the Ground", subtitle: "A few small routines could bring you back to your own rhythm." },
  ],
  balanced: [
    { title: "Steady Across the Board", subtitle: "Things were holding evenly — a good moment to build on." },
    { title: "Quiet Momentum", subtitle: "Nothing urgent stood out — just steady, sustainable footing." },
  ],
};

// Colour Psychology catalog. Each colour is its own "article" — traits,
// a short description (for the meaning grid) and a longer article body (for
// its detail page) — plus the copy used when a colour is surfaced as the
// current supportive recommendation (benefit + affirmations).
export const COLOUR_LIBRARY: Record<ColourKey, ColourMeaning> = {
  scarlet: {
    key: "scarlet",
    name: "Scarlet",
    swatch: "#c0392b",
    traits: ["Vitality", "Passion", "Courage"],
    description: "A bold, energising red that awakens motivation and physical vitality.",
    article:
      "Scarlet is the colour of movement — it's what the body reaches for when energy is running low and momentum needs a spark. Where cooler colours ask you to slow down, scarlet asks you to begin: to take the first step before you feel fully ready. It's associated with vitality, passion and courage — not recklessness, but the willingness to act on what matters. When your reserves feel drained, small doses of scarlet (a walk outdoors, a piece of clothing, a warm meal) can help rekindle the energy you need to re-engage with your day.",
    benefit: "You may benefit from more energy, motivation and a spark of courage.",
    affirmations: [
      "I welcome energy and momentum back into my day.",
      "I act with courage, even in small steps.",
    ],
  },
  russet: {
    key: "russet",
    name: "Russet",
    swatch: "#8b4a2b",
    traits: ["Stability", "Warmth", "Resilience"],
    description: "A warm, earthy brown-red that steadies you and restores a sense of resilience.",
    article:
      "Russet is the colour of solid ground — the warm brown-red of autumn leaves, worn leather and turned soil. It carries none of scarlet's urgency; instead it offers stability, the kind that comes from being rooted rather than rushing. Russet is linked to resilience and warmth, a reminder that steadiness is built slowly, through repetition, not through a single grand gesture. When you feel scattered or unmoored, russet points back toward routine, toward the small and familiar things that hold you together.",
    benefit: "You may benefit from more stability, warmth and steady resilience.",
    affirmations: [
      "I am steady, even when the ground feels uncertain.",
      "I build resilience one grounded step at a time.",
    ],
  },
  gold: {
    key: "gold",
    name: "Gold",
    swatch: "var(--color-gold)",
    traits: ["Confidence", "Abundance", "Radiance"],
    description: "A warm, radiant gold that reflects confidence and sustained, balanced progress.",
    article:
      "Gold is the colour of quiet achievement — not the loud win, but the steady accumulation of effort that's finally visible. It's associated with confidence, abundance and radiance, the sense that what you've built is real and worth recognising. Gold doesn't ask you to strive further; it asks you to notice what's already working. When your readings show a steady, balanced pattern, gold is a signal to consolidate rather than chase — to let the progress you've made shine before adding anything new.",
    benefit: "You may benefit from recognising your own progress and letting it build quiet confidence.",
    affirmations: [
      "I trust the progress I've already made.",
      "I let my steady effort shine.",
    ],
  },
  forest: {
    key: "forest",
    name: "Forest",
    swatch: "var(--color-grounding)",
    traits: ["Grounding", "Growth", "Renewal"],
    description: "A deep, grounding green that supports steadiness, emotional recovery and sustainable growth.",
    article:
      "Forest is the colour of steady, unhurried growth — the deep green of old trees rather than the bright green of a new sprout. It's tied to grounding, growth and renewal, the sense that recovery doesn't have to be dramatic to be real. Forest is especially supportive when pressure has been building: it doesn't ask you to push harder, but to root down, slow your pace and let recovery happen at its own speed. Time spent around real greenery, or simply making space to breathe, echoes what this colour represents.",
    benefit: "You may benefit from more grounding, balance and emotional recovery.",
    affirmations: [
      "I choose steady progress over unnecessary rush.",
      "I create space to grow with clarity and calm.",
    ],
  },
  ocean: {
    key: "ocean",
    name: "Ocean",
    swatch: "var(--color-clarity)",
    traits: ["Calm", "Clarity", "Communication"],
    description: "A cool, clear blue-teal that supports calm thinking and honest communication.",
    article:
      "Ocean is the colour of a clear mind — cool, spacious and unclouded. It's linked to calm, clarity and communication, the ability to think a thought all the way through and say what you actually mean. When your mind feels foggy or decisions feel tangled, ocean points toward stillness rather than more input: fewer tabs open, one conversation instead of many. It's a colour that rewards quiet — a few minutes of unhurried thought tend to do more for clarity than any amount of pushing through.",
    benefit: "You may benefit from a calmer mind and clearer, more honest communication.",
    affirmations: [
      "I think clearly and speak with calm honesty.",
      "I create quiet space for my mind to settle.",
    ],
  },
};

export const COLOUR_ORDER: ColourKey[] = ["scarlet", "russet", "gold", "forest", "ocean"];

// First reasoning bullet on the Colour Psychology page — keyed by the same
// currentFocus label produced by lib/scoring.ts#buildInnerState, describing
// the specific pattern in recent readings that drove this recommendation.
export const FOCUS_COLOUR_REASON: Record<string, { icon: string; text: string }> = {
  "Rebuilding energy": { icon: "⚡", text: "Your emotional energy has been running low in recent readings." },
  "Finding clarity": { icon: "🌫️", text: "Your mental clarity has felt foggy in recent readings." },
  "Releasing pressure": { icon: "🔥", text: "Your inner pressure has been elevated in recent readings." },
  "Regaining grounding": { icon: "🌪️", text: "You've felt a little less grounded in recent readings." },
  "Sustaining balance": { icon: "✨", text: "Your recent readings show a steady, balanced pattern." },
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
  traits: [string, string, string];
  reminder: string;
  icons: string[];
  circleClassName: string;
  colourReason: string;
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
    traits: ["Grounded", "Dependable", "Composed"],
    reminder: "Being capable doesn't mean you must manage everything alone.",
    icons: ["🌳", "⚓️", "🪨"],
    circleClassName: "bg-grounding",
    colourReason: "You tend to carry more responsibility than you let on.",
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
    traits: ["Expressive", "Vivid", "Spontaneous"],
    reminder: "Your feelings are information, not something to manage away.",
    icons: ["✨", "🔥", "🌟"],
    circleClassName: "bg-energy",
    colourReason: "Your feelings move quickly, which can be tiring to sustain.",
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
    traits: ["Observant", "Patient", "Analytical"],
    reminder: "Not every plan needs to be perfect before you begin.",
    icons: ["🦉", "♟️", "🧩"],
    circleClassName: "bg-clarity",
    colourReason: "You tend to think things through more than you rest.",
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
    traits: ["Curious", "Flexible", "Open-Minded"],
    reminder: "It's okay to finish what you started before chasing what's next.",
    icons: ["🧭", "🌅", "🦋"],
    circleClassName: "bg-gold",
    colourReason: "You're often moving toward what's next, rarely pausing fully.",
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

// A real backend would derive these from the entry's content (sentiment /
// topic extraction). For this mockup they're assigned deterministically from
// the entry id via pickPhrasing, simulating that analysis without one.
export const JOURNAL_MOODS = ["Calm", "Hopeful", "Tired", "Anxious", "Grateful", "Content", "Overwhelmed", "Energised"];
export const JOURNAL_THEMES = ["Growth", "Responsibility", "Relationships", "Self-Care", "Work", "Clarity", "Rest", "Gratitude"];

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
