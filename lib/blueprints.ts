import type {
  ArchetypeKey,
  BadgeDefinition,
  ColourKey,
  ColourMeaning,
  DimensionKey,
  FiveTraits,
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
    positiveTraits: [
      "🔥 Your energy motivates the people working alongside you.",
      "🚀 You take action while others are still deliberating.",
      "💪 You recover from setbacks with real physical resilience.",
      "🎯 Passion gives your work a genuine sense of urgency.",
      "🦁 Courage lets you speak up when it actually matters.",
    ],
    negativeTraits: [
      "🔥 Impatience can flare up before you've heard the full story.",
      "⚡ Impulsive decisions can outrun careful thought.",
      "🌋 Frustration can surface faster than you'd like it to.",
      "🏃 Restlessness can make it hard to sit with stillness.",
      "🎭 A drive to act can override a need to just feel first.",
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
    positiveTraits: [
      "🌳 You bring steadiness to situations that feel unstable.",
      "🍂 Your resilience helps you recover from setbacks patiently.",
      "🏡 You create a genuine sense of home wherever you land.",
      "🤎 Warmth makes people feel comfortable being honest with you.",
      "🪵 Your consistency is something others quietly rely on.",
    ],
    negativeTraits: [
      "🪨 A love of routine can turn into resistance toward change.",
      "🧱 Caution can slow you down when speed is actually needed.",
      "🕰️ You may stay in familiar situations past their useful life.",
      "🌫️ Reluctance to disrupt things can mean tolerating too much.",
      "🐌 Momentum can be harder for you to build than to sustain.",
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
    positiveTraits: [
      "✨ Confidence lets you take up space you've genuinely earned.",
      "🏆 You recognise your own progress instead of dismissing it.",
      "🌟 Your radiance draws people toward what you're building.",
      "💰 You have a healthy relationship with abundance and worth.",
      "🎖️ Steady effort, for you, actually compounds into results.",
    ],
    negativeTraits: [
      "👑 Confidence can tip into overestimating your own certainty.",
      "💸 A focus on results can crowd out enjoying the process.",
      "🪞 Recognition can start to matter more than the work itself.",
      "🏔️ Comparing your progress to others can quietly undercut it.",
      "🎗️ Pride can make it harder to hear useful criticism.",
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
    positiveTraits: [
      "🌲 You recover from hard periods without needing drama to do it.",
      "🌿 Growth, for you, is steady rather than sudden or forced.",
      "🍃 You're genuinely restored by time spent in quiet or nature.",
      "🌱 You give yourself permission to grow at your own pace.",
      "🪴 Your groundedness helps other people feel steadier too.",
    ],
    negativeTraits: [
      "🌫️ Slow recovery can be mistaken by others for disengagement.",
      "🍂 You may avoid necessary change to protect your stability.",
      "🌾 Patience with yourself can tip into avoiding real urgency.",
      "🪨 Staying grounded can sometimes mean staying too long.",
      "🌙 Quiet processing can look like withdrawal from the outside.",
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
    positiveTraits: [
      "🌊 Intuition guides you to make insightful decisions.",
      "💧 Adaptability helps you flow gracefully through life's changes.",
      "🦋 Emotional depth enriches your connections with others.",
      "🌌 Imagination fuels your creativity and vision.",
      "🧘 Calmness allows you to navigate stress with ease.",
    ],
    negativeTraits: [
      "🌫️ Emotional fluctuation can cloud your judgment at times.",
      "🕳️ Tendency to withdraw may limit your engagement with others.",
      "🌧️ Sensitivity can make you vulnerable to external negativity.",
      "🌊 Over-absorption of others' emotions may drain your energy.",
      "🦑 Ambiguity in direction can lead to feeling lost or unfocused.",
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

// Deterministic string hash used everywhere this file simulates "AI variety"
// without a real model call: the same seed always produces the same pick, so
// demo content is reproducible while still varying across seeds.
export function seededHash(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return hash;
}

export function pickPhrasing(seed: string, options: string[]): string {
  return options[seededHash(seed) % options.length];
}

// Onboarding's birthdate-derived "supportive colour" reveal (see
// lib/scoring.ts#scoreFromBirthdate) picks from the same 5-colour library
// used everywhere else, keyed off the birthdate string.
export function colourKeyFromSeed(seed: string): ColourKey {
  return COLOUR_ORDER[seededHash(seed) % COLOUR_ORDER.length];
}

// --- Onboarding/Core Personality numerology --------------------------------
// A birthdate feeds three classic numerology-style numbers, each mapped to
// its own trait library below. Like everything else derived from a
// birthdate in this file, the maths is deterministic (same date, same
// numbers every time) and stands in for what a real model would compute.

function digitalRoot(n: number): number {
  let value = Math.abs(Math.trunc(n));
  while (value > 9) {
    value = String(value)
      .split("")
      .reduce((sum, d) => sum + Number(d), 0);
  }
  return value === 0 ? 9 : value;
}

// Reduces the day of birth alone — e.g. the 23rd becomes 2+3 = 5.
export function birthdayNumber(birthdate: string): number {
  const day = Number(birthdate.slice(8, 10));
  return digitalRoot(day);
}

// Reduces every digit of the full YYYY-MM-DD date.
export function lifePathNumber(birthdate: string): number {
  const digits = birthdate.replace(/-/g, "").split("").map(Number);
  return digitalRoot(digits.reduce((sum, d) => sum + d, 0));
}

// Month + day, kept unreduced ("raw") alongside its single-digit reduction —
// shown in the UI as "26 → 8" to make the derivation visible.
export function talentNumber(birthdate: string): { raw: number; reduced: number } {
  const month = Number(birthdate.slice(5, 7));
  const day = Number(birthdate.slice(8, 10));
  const raw = month + day;
  return { raw, reduced: digitalRoot(raw) };
}

// Five 0-100 "how in tune are you with this colour" scores for the Colour
// Breakdown chart, seeded from the birthdate. The colour colourKeyFromSeed
// already picks as this person's supportive colour is always the highest,
// so the two features never contradict each other.
export function colourAffinityScores(birthdate: string): Record<ColourKey, number> {
  const dominant = colourKeyFromSeed(birthdate);
  const scores = {} as Record<ColourKey, number>;
  COLOUR_ORDER.forEach((key) => {
    if (key === dominant) {
      scores[key] = 88 + (seededHash(`${birthdate}:${key}:dominant`) % 10); // 88-97
    } else {
      scores[key] = 34 + (seededHash(`${birthdate}:${key}:affinity`) % 47); // 34-80
    }
  });
  return scores;
}

export const BIRTHDAY_NUMBER_TRAITS: Record<number, { light: FiveTraits; dark: FiveTraits }> = {
  1: {
    light: [
      "🔥 You lead with confidence and aren't afraid to go first.",
      "🎯 Your focus and drive turn ideas into real progress.",
      "🧭 You trust your own judgement, even when the path is unclear.",
      "🌱 You inspire others simply by taking initiative.",
      "⚡ Your independence gives you the courage to start over when needed.",
    ],
    dark: [
      "🦁 A strong need to lead can tip into impatience with others' pace.",
      "🧱 Independence can shade into difficulty asking for help.",
      "🎭 You may dismiss input that challenges your own view.",
      "🔥 Impatience can flare when things move slower than you'd like.",
      "🏔️ A drive to be first can leave you isolated at the top.",
    ],
  },
  2: {
    light: [
      "🤝 You build trust quickly through genuine warmth and tact.",
      "🕊️ You sense what others need before they say it.",
      "🎨 Your patience helps fragile situations come together gently.",
      "💞 You create harmony in groups that might otherwise drift apart.",
      "🌙 Your intuition often catches what logic alone would miss.",
    ],
    dark: [
      "🌊 A wish to keep the peace can mean swallowing your own needs.",
      "🪞 You may second-guess decisions long after they're made.",
      "🫥 Sensitivity to conflict can push you to avoid it altogether.",
      "🎈 You can lean too heavily on others for reassurance.",
      "🧵 Over-accommodating can leave your own voice thin.",
    ],
  },
  3: {
    light: [
      "🎨 Your imagination turns ordinary moments into something vivid.",
      "🗣️ You express feelings and ideas with natural charm.",
      "🎉 You bring lightness and joy into rooms you enter.",
      "✨ You see creative possibilities others miss entirely.",
      "📖 Your optimism helps you recover quickly from setbacks.",
    ],
    dark: [
      "🎈 Enthusiasm can scatter into a dozen unfinished ideas.",
      "🎭 You may perform a mood rather than sit with it honestly.",
      "🌪️ Restless energy can make follow-through hard to sustain.",
      "🪁 A need for attention can crowd out quieter listening.",
      "🍃 Depth can get traded for the next exciting distraction.",
    ],
  },
  4: {
    light: [
      "🧱 You build things that last through patient, steady effort.",
      "📐 Your discipline turns big goals into manageable steps.",
      "🛠️ You're the person others rely on to actually finish.",
      "🗂️ You bring order to chaos without losing your calm.",
      "🌳 Your reliability makes you a foundation for those around you.",
    ],
    dark: [
      "🔒 A love of structure can turn into resistance to any change.",
      "🧊 You may hold so tightly to a plan that you miss a better one.",
      "🪨 Stubbornness can make compromise feel like defeat.",
      "⚙️ Overwork can quietly become your default setting.",
      "🚧 Rules can matter more to you than the people they're meant to serve.",
    ],
  },
  5: {
    light: [
      "🌍 You thrive on variety and seek out new horizons wherever you go.",
      "🦋 Change excites you, and you adapt quickly to shifting circumstances.",
      "🚀 Your adventurous spirit inspires others to break free from routine.",
      "🎒 You are a natural explorer, always eager to learn and experience more.",
      "💡 Your curiosity leads you to discover unique solutions and fresh ideas.",
    ],
    dark: [
      "🌪️ Restlessness can make it hard for you to commit or settle down.",
      "🧩 You may scatter your energy, leaving projects unfinished.",
      "🎭 A craving for excitement can lead to impulsive or risky choices.",
      "🕳️ You might avoid routine responsibilities, seeking escape instead.",
      "🌫️ Inconsistency can make it difficult for others to rely on you.",
    ],
  },
  6: {
    light: [
      "🏡 You create a sense of home wherever you are.",
      "💗 You care for others with real, unglamorous consistency.",
      "🌸 Your presence brings comfort to people under stress.",
      "🤲 You take responsibility seriously and follow through on it.",
      "🎼 You have a natural sense for restoring balance in a room.",
    ],
    dark: [
      "🪢 Caring for everyone else can leave your own needs last.",
      "🧶 You may take on responsibilities nobody actually asked you to carry.",
      "🕯️ Self-sacrifice can quietly slide into resentment.",
      "🗝️ A wish to fix things can tip into controlling how others live.",
      "🪞 You can measure your worth by how needed you are.",
    ],
  },
  7: {
    light: [
      "🔭 You think deeply and rarely accept things at face value.",
      "🌌 Solitude recharges you rather than draining you.",
      "📚 Your analysis uncovers patterns others walk straight past.",
      "🕯️ You bring a quiet, grounded wisdom to hard questions.",
      "🧘 You trust process over shortcuts, and it usually pays off.",
    ],
    dark: [
      "🏝️ A need for solitude can drift into real isolation.",
      "🌫️ Overthinking can stall decisions that just need to be made.",
      "🧊 Skepticism can come across as distance or coldness.",
      "🕳️ You may retreat rather than say what's actually bothering you.",
      "🔍 Analysis can become a way of avoiding a feeling entirely.",
    ],
  },
  8: {
    light: [
      "🏛️ You think in terms of long-term impact, not quick wins.",
      "📊 You manage resources and responsibility with real competence.",
      "🎯 Your ambition is backed by genuine follow-through.",
      "🧱 You build systems and structures that outlast you.",
      "🤝 People trust you with authority because you use it well.",
    ],
    dark: [
      "⚖️ Ambition can tip into measuring life mostly by results.",
      "🪤 You may feel weighed down by expectations you set for yourself.",
      "🧰 Control can become a substitute for trust in others.",
      "💼 Work can quietly consume time meant for rest or people.",
      "🏔️ Status can start to matter more than the reason you wanted it.",
    ],
  },
  9: {
    light: [
      "🌏 You see the bigger picture and care about it genuinely.",
      "💝 Generosity comes naturally to you, without keeping score.",
      "🎇 You inspire people toward something larger than themselves.",
      "🕊️ You forgive easily and rarely hold onto grudges.",
      "🌈 Your idealism gives others permission to hope, too.",
    ],
    dark: [
      "🫧 Giving without limits can leave you quietly depleted.",
      "🌪️ Letting go of people or plans can be harder than it should be.",
      "🎭 Idealism can curdle into disappointment when reality falls short.",
      "🧳 You may carry others' burdens well past your own capacity.",
      "🌫️ A wish to help everyone can mean helping no one well.",
    ],
  },
};

export const LIFE_PATH_CAREERS: Record<number, FiveTraits> = {
  1: [
    "🚀 You thrive founding or leading something entirely your own.",
    "🎯 Roles that reward independent decision-making suit you well.",
    "🏗️ You're built for pioneering new products, teams or markets.",
    "🧭 Leadership positions let your natural initiative do its work.",
    "⚡ Fast-moving, high-autonomy environments bring out your best.",
  ],
  2: [
    "🤝 Mediation, HR and counselling roles fit your natural diplomacy.",
    "🎨 Collaborative creative work lets your sensitivity become an asset.",
    "🕊️ You do well in partnership-based roles — co-founding, coaching, pairing.",
    "📋 Coordination and support roles benefit from your attentiveness.",
    "💬 Client-facing work rewards your gift for making people feel heard.",
  ],
  3: [
    "🎭 Performance, writing and design careers suit your expressive nature.",
    "📣 Marketing and communications let your creativity reach an audience.",
    "🎨 You thrive in roles where original ideas are the actual product.",
    "🎤 Teaching, hosting or public speaking play to your natural charisma.",
    "🖌️ Any career built around storytelling will hold your interest.",
  ],
  4: [
    "📐 Engineering, architecture and planning suit your systematic mind.",
    "🧮 Accounting, operations and logistics reward your attention to detail.",
    "🛠️ Project management lets your discipline turn plans into results.",
    "🏛️ Roles with clear structure and process fit you naturally.",
    "📊 You do well anywhere reliability and precision are the point.",
  ],
  5: [
    "🌍 Travel, sales and business development suit your adaptable energy.",
    "📈 Marketing roles that shift constantly keep you genuinely engaged.",
    "🎪 Event work and hospitality reward your comfort with variety.",
    "🧳 Careers with built-in movement or travel play to your strengths.",
    "🔀 Fast-changing industries suit you better than stable, slow ones.",
  ],
  6: [
    "🏡 Teaching, healthcare and counselling suit your caring instincts.",
    "🌸 Community and non-profit work rewards your sense of responsibility.",
    "👨‍👩‍👧 Family-oriented businesses or services fit your nurturing style.",
    "🎼 Roles focused on harmony — HR, mediation, hospitality — suit you.",
    "🩺 You thrive wherever looking after people is the actual job.",
  ],
  7: [
    "🔬 Research, analysis and data-driven roles reward your depth.",
    "📚 Academia and writing suit your need to think things through fully.",
    "🧘 Spiritual, therapeutic or advisory work fits your introspective nature.",
    "🕵️ Investigative or technical roles reward your pattern-finding mind.",
    "🔭 You do well in specialist roles that reward sustained focus.",
  ],
  8: [
    "🏢 You excel in leadership roles that require strategic vision and authority.",
    "💼 Business, finance, and management are natural arenas for your ambition.",
    "🏆 You thrive in competitive environments where results and recognition matter.",
    "📈 Your practical mindset suits careers in entrepreneurship and resource management.",
    "🤝 You are effective in roles that involve negotiation, influence, and building networks.",
  ],
  9: [
    "🌏 Non-profit and humanitarian work suit your genuine idealism.",
    "🎨 Careers in the arts let your compassion shape something larger.",
    "🕊️ Counselling and advocacy roles reward your empathy at scale.",
    "🌱 Environmental or social-impact work fits your bigger-picture instincts.",
    "📖 Teaching or mentoring lets your wisdom reach beyond yourself.",
  ],
};

export const TALENT_NUMBER_TRAITS: Record<number, { abilities: FiveTraits; weaknesses: [string, string, string] }> = {
  1: {
    abilities: [
      "🚀 You can turn a raw idea into a moving project almost on your own.",
      "🎯 Decisive action under pressure comes naturally to you.",
      "🧭 You find your own direction rather than waiting to be told.",
      "🔥 You bring energy that gets stalled efforts moving again.",
      "🏆 Independent problem-solving is a genuine strength.",
    ],
    weaknesses: [
      "🪨 You may struggle to hand off control, even when you should.",
      "⏳ Patience with slower collaborators can wear thin fast.",
      "🧱 Asking for help can feel harder than it needs to be.",
    ],
  },
  2: {
    abilities: [
      "🤝 You build strong partnerships and foster lasting trust with others.",
      "🕊️ You defuse tension before it becomes a real conflict.",
      "🎨 Your sensitivity helps you read a room accurately.",
      "💞 You make collaborators feel genuinely safe to contribute.",
      "🌙 Your intuition often flags problems before they surface.",
    ],
    weaknesses: [
      "🌊 Keeping the peace can mean your own opinion goes unspoken.",
      "🪞 You may replay decisions long after they're settled.",
      "🫥 Conflict-avoidance can let real issues quietly fester.",
    ],
  },
  3: {
    abilities: [
      "🎨 You communicate ideas in ways that genuinely land with people.",
      "🗣️ You lift the energy of any group you're part of.",
      "✨ You generate more creative options than most people consider.",
      "🎉 You recover from setbacks faster than most.",
      "📖 You make complex things feel approachable and fun.",
    ],
    weaknesses: [
      "🎈 Follow-through can lag behind your enthusiasm.",
      "🪁 Attention can scatter across too many ideas at once.",
      "🌪️ Consistency is harder for you than starting something new.",
    ],
  },
  4: {
    abilities: [
      "🧱 You excel at creating stable foundations for long-term growth.",
      "📐 You turn ambitious goals into concrete, doable steps.",
      "🛠️ You catch details that others miss under time pressure.",
      "🗂️ You bring calm, reliable order to messy situations.",
      "🌳 People trust you to actually finish what you start.",
    ],
    weaknesses: [
      "🔒 Sudden change can throw off your whole rhythm.",
      "🧊 You may resist a better plan just because it's not yours.",
      "⚙️ Overworking quietly becomes your default response to stress.",
    ],
  },
  5: {
    abilities: [
      "🌍 You adapt to new environments faster than almost anyone.",
      "🦋 You stay resourceful when plans change at the last minute.",
      "🚀 Your energy makes routine tasks feel less like a grind.",
      "🎒 You pick up new skills quickly out of genuine curiosity.",
      "💡 You find workarounds that more rigid thinkers miss.",
    ],
    weaknesses: [
      "🌪️ Sticking with one thing long enough to finish it is hard.",
      "🧩 Your attention can fragment across too many directions.",
      "🕳️ Routine responsibilities are easy for you to quietly avoid.",
    ],
  },
  6: {
    abilities: [
      "🏡 You create genuine stability for the people around you.",
      "💗 You notice what people need before they ask.",
      "🌸 You calm tense situations just by being present.",
      "🤲 You follow through on commitments others have forgotten.",
      "🎼 You restore balance to groups that have drifted off course.",
    ],
    weaknesses: [
      "🪢 Your own needs tend to come last on the list.",
      "🧶 You take on more responsibility than anyone actually asked for.",
      "🕯️ Unspoken self-sacrifice can build into quiet resentment.",
    ],
  },
  7: {
    abilities: [
      "🔭 You find the pattern underneath a confusing problem.",
      "🌌 You do your best thinking away from noise and crowds.",
      "📚 You research a subject more thoroughly than most people bother to.",
      "🕯️ You bring calm, considered judgement to high-pressure moments.",
      "🧘 You trust a slow process even when others want a shortcut.",
    ],
    weaknesses: [
      "🏝️ Solitude can tip into real disconnection from others.",
      "🌫️ Overanalysis can delay decisions that need to be made.",
      "🧊 Reserve can be mistaken for indifference by people around you.",
    ],
  },
  8: {
    abilities: [
      "🤝 You build strong partnerships and foster lasting trust with others.",
      "💎 Your sense for value helps you manage resources with care and foresight.",
      "🧭 You navigate complex relationships with emotional intelligence and tact.",
      "🏗️ You excel at creating stable foundations for long-term growth and security.",
      "🛡️ Your loyalty and responsibility make you a reliable steward in business and family matters.",
    ],
    weaknesses: [
      "🪤 You may feel weighed down by others' expectations or financial pressures.",
      "🧱 Overcommitting to relationships can blur your boundaries and drain your energy.",
      "⚖️ Measuring your worth by results can leave quieter wins unnoticed.",
    ],
  },
  9: {
    abilities: [
      "🌏 You keep sight of the bigger picture when others get lost in detail.",
      "💝 You give generously without expecting anything back.",
      "🎇 You rally people around a cause bigger than any one person.",
      "🕊️ You let go of grudges faster than most, freeing up real energy.",
      "🌈 You make people feel hope is a reasonable thing to have.",
    ],
    weaknesses: [
      "🫧 Giving without limits can leave you quietly running on empty.",
      "🌪️ Letting go of a plan or a person can take far longer than it should.",
      "🧳 You can end up carrying weight that was never really yours.",
    ],
  },
};

// Connects a person's Core Personality archetype to their currently
// recommended colour, for the "colour affinity" breakdown shown on the Core
// Personality page. A real backend would generate this paragraph per person
// with an LLM; here `pickPhrasing` simulates that by re-rolling a seeded pick
// across a handful of template phrasings, so the copy varies with each new
// archetype/colour pairing (and re-rolls whenever a fresh recommendation
// comes in) while staying reproducible for a given seed.
export function buildColourPersonalityInsight(colour: ColourMeaning, archetype: ArchetypeCopy, seed: string): string {
  // archetype.name already reads "The Steady Anchor" etc. — strip the
  // leading article so it drops cleanly into the middle of a sentence
  // ("the steady anchor you are") instead of doubling up ("Your the...").
  const archetypeName = archetype.name.replace(/^the\s+/i, "").toLowerCase();
  const [traitA, traitB] = colour.traits.map((t) => t.toLowerCase());
  const colourName = colour.name;
  const colourNameLower = colourName.toLowerCase();

  const templates = [
    `As the ${archetypeName} you are, you already lean on ${archetype.traits[0].toLowerCase()} — ${colourName} builds on that by bringing more ${traitA} and ${traitB} into how you move through your day.`,
    `${colourName} pairs naturally with the ${archetypeName} type. ${archetype.colourReason} ${colourName} answers that directly, offering ${traitA} exactly where you tend to run low.`,
    `Your ${archetypeName} nature and ${colourNameLower} share the same instinct toward ${traitB}. Leaning into this colour right now reinforces a strength you already carry, rather than asking you to become someone else.`,
    `${archetype.colourReason} That's exactly where ${colourNameLower} is useful — its ${traitA} and ${traitB} give the ${archetypeName} in you a small, concrete way to rebalance.`,
  ];
  return pickPhrasing(seed, templates);
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
