import { api } from "./client";
import type { ColourOut, RecommendationOut } from "./types";

export function getLatestRecommendation(token: string) {
  return api.get<RecommendationOut>("/recommendations/latest", { token });
}

export function listRecommendations(token: string) {
  return api.get<RecommendationOut[]>("/recommendations", { token });
}

export function getRecommendation(token: string, id: string) {
  return api.get<RecommendationOut>(`/recommendations/${id}`, { token });
}

export function listColours(token: string) {
  return api.get<ColourOut[]>("/colours", { token });
}

export function getColour(token: string, key: string) {
  return api.get<ColourOut>(`/colours/${key}`, { token });
}
