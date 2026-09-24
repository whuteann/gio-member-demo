import { api } from "./client";
import type { ApiSubscription } from "./types";

export function getSubscription(token: string) {
  return api.get<ApiSubscription>("/subscription", { token });
}

export function subscribe(token: string) {
  return api.post<ApiSubscription>("/subscription/subscribe", undefined, { token });
}

export function cancelSubscription(token: string) {
  return api.post<ApiSubscription>("/subscription/cancel", undefined, { token });
}

export function reactivateSubscription(token: string) {
  return api.post<ApiSubscription>("/subscription/reactivate", undefined, { token });
}

export function startTrial(token: string) {
  return api.post<ApiSubscription>("/subscription/start-trial", undefined, { token });
}
