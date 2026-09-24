import { api } from "./client";
import type { ProgressOut, RewardOut } from "./types";

export function getProgress(token: string) {
  return api.get<ProgressOut>("/progress", { token });
}

export function listRewards(token: string) {
  return api.get<RewardOut[]>("/rewards", { token });
}

export function redeemReward(token: string, key: string) {
  return api.post<RewardOut>(`/rewards/${key}/redeem`, undefined, { token });
}
