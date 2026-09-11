import type { AppData } from "./types";

const STORAGE_KEY = "gio-member-demo-v1";

// Bump whenever a persisted AppData/InnerReading/CorePersonality/etc. shape
// changes — this demo has no real migration path, so a version mismatch just
// discards the old (now-incompatible) local data and reseeds clean instead of
// crashing on missing fields.
const CURRENT_VERSION = 2;

export interface DB {
  version: typeof CURRENT_VERSION;
  accounts: Record<string, AppData>;
  session: { userId: string | null };
}

export function emptyDB(): DB {
  return { version: CURRENT_VERSION, accounts: {}, session: { userId: null } };
}

export function loadDB(): DB {
  if (typeof window === "undefined") return emptyDB();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyDB();
    const parsed = JSON.parse(raw) as DB;
    if (!parsed || parsed.version !== CURRENT_VERSION) return emptyDB();
    return parsed;
  } catch {
    return emptyDB();
  }
}

export function saveDB(db: DB): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch {
    // storage full or unavailable — demo state simply won't persist
  }
}

export function clearDB(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}
