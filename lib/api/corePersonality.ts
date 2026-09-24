import { api } from "./client";
import type { CorePersonalityResultOut } from "./types";

export function calculateCorePersonality(token: string, params: { date_of_birth: string; language: "en" | "zh" }) {
  return api.post<CorePersonalityResultOut>("/core-personality/calculate", params, { token });
}

export function getCorePersonalityResults(token: string, id: string) {
  return api.get<CorePersonalityResultOut>(`/core-personality/${id}/results`, { token });
}

export function getCurrentCorePersonality(token: string) {
  return api.get<CorePersonalityResultOut>("/core-personality/current", { token });
}
