import {
  ARCHETYPES,
  ASSESSMENT_VERSION,
  BASELINE_ASSESSMENT,
  HEADLINE_LIBRARY,
  INSIGHT_LIBRARY,
  pickPhrasing,
} from "./blueprints";
import type {
  AnsweredQuestion,
  ArchetypeKey,
  CorePersonality,
  DimensionKey,
  InnerStateSourceType,
  InnerStateSnapshot,
} from "./types";

export function normalize(rawValue: number): number {
  return Math.round(((rawValue - 1) / 4) * 100);
}

function average(values: number[]): number {
  if (values.length === 0) return 50;
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
}

export function dimensionAverages(
  questions: AnsweredQuestion[]
): Record<DimensionKey, number> {
  const dims: DimensionKey[] = [
    "emotional_energy",
    "mental_clarity",
    "inner_pressure",
    "grounding",
  ];
  const result = {} as Record<DimensionKey, number>;
  for (const dim of dims) {
    const vals = questions.filter((q) => q.dimension === dim).map((q) => q.normalizedValue);
    result[dim] = average(vals);
  }
  return result;
}

const FOCUS_COPY: Record<string, { focus: string; summary: string }> = {
  emotional_energy: {
    focus: "Rebuilding energy",
    summary: "Your reserves are running low — small, gentle recharge matters most right now.",
  },
  mental_clarity: {
    focus: "Finding clarity",
    summary: "Things feel a little foggy. A slower pace could help the picture sharpen.",
  },
  inner_pressure: {
    focus: "Releasing pressure",
    summary: "You're carrying more than usual — this is a good moment to set something down.",
  },
  grounding: {
    focus: "Regaining grounding",
    summary: "You feel a little untethered. Reconnecting with routine could help you settle.",
  },
  balanced: {
    focus: "Sustaining balance",
    summary: "You're in a steady place across the board — a good moment to build on momentum.",
  },
};

export function resolveFocusKey(dims: Record<DimensionKey, number>): string {
  const needs: { key: string; need: number }[] = [
    { key: "emotional_energy", need: 100 - dims.emotional_energy },
    { key: "mental_clarity", need: 100 - dims.mental_clarity },
    { key: "inner_pressure", need: dims.inner_pressure },
    { key: "grounding", need: 100 - dims.grounding },
  ];
  needs.sort((a, b) => b.need - a.need);
  const top = needs[0];
  return top.need >= 55 ? top.key : "balanced";
}

export function buildInnerState(params: {
  id: string;
  userId: string;
  sourceType: InnerStateSourceType;
  sourceId: string;
  dims: Record<DimensionKey, number>;
}): InnerStateSnapshot {
  const { dims } = params;
  const balance = Math.round(
    (dims.emotional_energy + dims.mental_clarity + (100 - dims.inner_pressure) + dims.grounding) / 4
  );

  const copy = FOCUS_COPY[resolveFocusKey(dims)];

  return {
    id: params.id,
    userId: params.userId,
    sourceType: params.sourceType,
    sourceId: params.sourceId,
    emotionalEnergy: dims.emotional_energy,
    mentalClarity: dims.mental_clarity,
    innerPressure: dims.inner_pressure,
    grounding: dims.grounding,
    balance,
    currentFocus: copy.focus,
    summary: copy.summary,
    createdAt: new Date().toISOString(),
  };
}

export function buildReadingNarrative(
  dims: Record<DimensionKey, number>,
  archetypeName: string
): string {
  const balance = Math.round(
    (dims.emotional_energy + dims.mental_clarity + (100 - dims.inner_pressure) + dims.grounding) / 4
  );
  const tone =
    balance >= 70
      ? "You're moving through this chapter with real steadiness."
      : balance >= 45
        ? "You're holding things together, though a few threads feel a little stretched."
        : "This has clearly been a heavier stretch than usual.";

  return [
    tone,
    `Your energy sits around ${dims.emotional_energy}/100, your clarity around ${dims.mental_clarity}/100, and the pressure you're carrying reads ${dims.inner_pressure}/100 — with grounding at ${dims.grounding}/100.`,
    `As ${archetypeName}, this pattern tends to show up as a quiet pull toward whatever restores your footing fastest, rather than the loudest fix in the room.`,
    "Use this reading as a mirror, not a verdict — it reflects this moment, and it will keep moving as you do.",
  ].join(" ");
}

export function buildReadingInsight(
  dims: Record<DimensionKey, number>,
  seed: string
): { insight: string; reflectionQuestion: string } {
  const variants = INSIGHT_LIBRARY[resolveFocusKey(dims)];
  const insight = pickPhrasing(`${seed}-insight`, variants.map((v) => v.insight));
  const match = variants.find((v) => v.insight === insight)!;
  return { insight, reflectionQuestion: match.reflectionQuestion };
}

export function buildReadingHeadline(
  dims: Record<DimensionKey, number>,
  seed: string
): { title: string; subtitle: string } {
  const variants = HEADLINE_LIBRARY[resolveFocusKey(dims)];
  const title = pickPhrasing(`${seed}-headline`, variants.map((v) => v.title));
  return variants.find((v) => v.title === title)!;
}

export interface BaselineAnswer {
  index: number;
  choice: "A" | "B";
}

export function scoreBaseline(
  answers: BaselineAnswer[],
  params: { id: string; userId: string; version: number }
): CorePersonality {
  const archetypeTally: Record<ArchetypeKey, number> = {
    steady_anchor: 0,
    bright_spark: 0,
    quiet_strategist: 0,
    open_horizon: 0,
  };
  const pillarValues: Record<string, number[]> = {
    thinking: [],
    emotionalSensitivity: [],
    adaptability: [],
    willpower: [],
  };

  answers.forEach(({ index, choice }) => {
    const prompt = BASELINE_ASSESSMENT[index];
    const option = choice === "A" ? prompt.optionA : prompt.optionB;
    archetypeTally[option.weight] += 1;
    pillarValues[prompt.pillar].push(option.pillarValue);
  });

  const archetype = (Object.keys(archetypeTally) as ArchetypeKey[]).reduce((best, key) =>
    archetypeTally[key] > archetypeTally[best] ? key : best
  , "steady_anchor" as ArchetypeKey);

  const copy = ARCHETYPES[archetype];

  return {
    id: params.id,
    userId: params.userId,
    version: params.version,
    archetype,
    icon: pickPhrasing(params.id, copy.icons),
    thinking: average(pillarValues.thinking),
    emotionalSensitivity: average(pillarValues.emotionalSensitivity),
    adaptability: average(pillarValues.adaptability),
    willpower: average(pillarValues.willpower),
    overallExplanation: copy.overall,
    pillarExplanations: copy.pillars,
    assessmentVersion: ASSESSMENT_VERSION,
    isCurrent: true,
    generatedAt: new Date().toISOString(),
    recalibratedAt: params.version > 1 ? new Date().toISOString() : null,
  };
}
