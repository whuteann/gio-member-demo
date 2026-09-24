// Same rules as lib/entitlement.ts (which operates on the old mock's
// camelCase Subscription shape) re-applied to the real backend's snake_case
// ApiSubscription — the backend is the source of truth for gating now, this
// just mirrors its own app/services/entitlement.py logic for client-side UI
// decisions (e.g. disabling a button before a request even goes out).
import type { ApiSubscription } from "./types";

export function isPremiumActive(sub: ApiSubscription): boolean {
  if (sub.trial_ends_at && new Date(sub.trial_ends_at) > new Date()) return true;
  if (sub.plan !== "PREMIUM") return false;
  if (sub.status === "ACTIVE" || sub.status === "PENDING") return true;
  if (sub.status === "CANCELLED" && sub.expires_at && new Date(sub.expires_at) > new Date()) return true;
  return false;
}

export const INNER_READING_WEEKLY_FREE_LIMIT = 3;

// Purely advisory client-side count for UI messaging ("2 of 3 used this
// week") — the server is still the authoritative gate on submit (returns a
// 403 at the real limit, same as before).
export function readingsUsedThisWeek(readings: { created_at: string }[]): number {
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  return readings.filter((r) => new Date(r.created_at).getTime() >= weekAgo).length;
}
