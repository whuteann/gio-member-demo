import type { Subscription } from "./types";

export function isPremiumActive(sub: Subscription): boolean {
  if (sub.plan !== "PREMIUM") return false;
  if (sub.status === "ACTIVE" || sub.status === "PENDING") return true;
  if (sub.status === "CANCELLED" && sub.expiresAt && new Date(sub.expiresAt) > new Date()) {
    return true;
  }
  return false;
}

export type InnerReadingGate = "ALLOW_PREMIUM" | "ALLOW_FIRST_FREE" | "MEMBERSHIP_GATE";

export function innerReadingGate(sub: Subscription): InnerReadingGate {
  if (isPremiumActive(sub)) return "ALLOW_PREMIUM";
  if (!sub.firstFreeReadingConsumedAt) return "ALLOW_FIRST_FREE";
  return "MEMBERSHIP_GATE";
}

export function historyLimit(sub: Subscription, full: number, limited: number): number {
  return isPremiumActive(sub) ? full : limited;
}
