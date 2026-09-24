import { api } from "./client";
import type { BaselineQuestionOut, ColourBreakdownOut, CorePersonalityOut, NumerologyOut, RecalibrateResponse } from "./types";

export function submitOnboarding(token: string, birthdate: string) {
  return api.post<CorePersonalityOut>("/personality/onboarding", { birthdate }, { token });
}

export function completeOnboarding(token: string) {
  return api.post("/onboarding/complete", undefined, { token });
}

export function getCurrentPersonality(token: string) {
  return api.get<CorePersonalityOut>("/personality/current", { token });
}

export function getBaselineQuestions(token: string) {
  return api.get<BaselineQuestionOut[]>("/personality/baseline-questions", { token });
}

export function recalibrate(token: string, answers: { index: number; choice: "A" | "B" }[]) {
  return api.post<RecalibrateResponse>("/personality/recalibrate", { answers }, { token });
}

export function getNumerology(token: string) {
  return api.get<NumerologyOut>("/personality/numerology", { token });
}

export function getColourBreakdown(token: string) {
  return api.get<ColourBreakdownOut>("/personality/colour-breakdown", { token });
}
