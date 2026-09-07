import type { AppData } from "./types";

const STORAGE_KEY = "gio-member-demo-v1";

export interface DB {
  version: 1;
  accounts: Record<string, AppData>;
  session: { userId: string | null };
}

function emptyDB(): DB {
  return { version: 1, accounts: {}, session: { userId: null } };
}

export function loadDB(): DB {
  if (typeof window === "undefined") return emptyDB();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyDB();
    const parsed = JSON.parse(raw) as DB;
    if (!parsed || parsed.version !== 1) return emptyDB();
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
