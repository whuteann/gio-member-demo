import { ARCHETYPES, COLOUR_LIBRARY, PRODUCTS } from "./blueprints";
import type {
  ColourKey,
  CorePersonality,
  InnerStateSnapshot,
  RecommendationItem,
  RecommendationProfile,
  RecommendationTrigger,
} from "./types";

const FOCUS_PROFILE: Record<
  string,
  { tags: string[]; colourKey: ColourKey; routine: string }
> = {
  "Rebuilding energy": {
    tags: ["energy", "lift"],
    colourKey: "scarlet",
    routine: "A 10-minute walk before noon, away from screens.",
  },
  "Finding clarity": {
    tags: ["clarity", "focus"],
    colourKey: "ocean",
    routine: "Write down the one thing that matters most today, before anything else.",
  },
  "Releasing pressure": {
    tags: ["release", "calm"],
    colourKey: "forest",
    routine: "Set a 15-minute timer to do nothing but breathe and let your shoulders drop.",
  },
  "Regaining grounding": {
    tags: ["grounding", "steadiness"],
    colourKey: "russet",
    routine: "Stand barefoot for two minutes and name five things you can feel.",
  },
  "Sustaining balance": {
    tags: ["calm", "reflection"],
    colourKey: "gold",
    routine: "Keep doing what's working — a short reflection tonight will reinforce it.",
  },
};

export function colourKeyForFocus(currentFocus: string): ColourKey {
  return (FOCUS_PROFILE[currentFocus] ?? FOCUS_PROFILE["Sustaining balance"]).colourKey;
}

export function buildRecommendation(params: {
  id: string;
  userId: string;
  state: InnerStateSnapshot;
  personality: CorePersonality;
  trigger: RecommendationTrigger;
  triggerSourceId: string;
  isPremium: boolean;
}): RecommendationProfile {
  const { state, personality, isPremium } = params;
  const profile = FOCUS_PROFILE[state.currentFocus] ?? FOCUS_PROFILE["Sustaining balance"];
  const colour = COLOUR_LIBRARY[profile.colourKey];
  const archetypeName = ARCHETYPES[personality.archetype].name;

  const items: RecommendationItem[] = [];

  items.push({
    id: `${params.id}-colour`,
    type: "COLOUR",
    referenceId: profile.colourKey,
    title: colour.name,
    reason: `Matched to your current focus — ${state.currentFocus.toLowerCase()}.`,
    rank: 1,
  });

  items.push({
    id: `${params.id}-routine`,
    type: "ROUTINE",
    referenceId: null,
    title: profile.routine,
    reason: `A small, doable step suited to ${archetypeName.toLowerCase()}.`,
    rank: 2,
  });

  const matchedProducts = PRODUCTS.filter((p) => p.available)
    .map((p) => ({ product: p, score: p.elementTag.filter((t) => profile.tags.includes(t)).length }))
    .filter((m) => m.score > 0)
    .sort((a, b) => b.score - a.score);

  const productLimit = isPremium ? 3 : 1;
  matchedProducts.slice(0, productLimit).forEach((m, i) => {
    items.push({
      id: `${params.id}-product-${m.product.id}`,
      type: "PRODUCT",
      referenceId: m.product.id,
      title: m.product.title,
      reason: isPremium
        ? `Chosen from your recent history and current ${state.currentFocus.toLowerCase()} — pairs with ${colour.name.toLowerCase()}.`
        : `A simple match for ${state.currentFocus.toLowerCase()}.`,
      rank: 3 + i,
      imageUrl: `https://picsum.photos/seed/${m.product.imageSeed}/480/480`,
      price: m.product.price,
      destinationUrl: `/shop/${m.product.id}`,
    });
  });

  return {
    id: params.id,
    userId: params.userId,
    stateSnapshotId: state.id,
    corePersonalityId: personality.id,
    triggerType: params.trigger,
    triggerSourceId: params.triggerSourceId,
    currentFocus: state.currentFocus,
    summary: isPremium
      ? `Based on your full history, ${state.summary.toLowerCase()} As ${archetypeName.toLowerCase()}, focusing here tends to pay off fastest.`
      : state.summary,
    primaryColour: colour.swatch,
    status: "READY",
    items,
    generatedAt: new Date().toISOString(),
  };
}
