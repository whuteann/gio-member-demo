import { api } from "./client";
import type { JournalEntryOut, JournalInsightsOut } from "./types";

export function listJournalEntries(token: string) {
  return api.get<JournalEntryOut[]>("/journal/entries", { token });
}

export function createJournalEntry(token: string, content: string) {
  return api.post<JournalEntryOut>("/journal/entries", { content }, { token });
}

export function getJournalInsights(token: string) {
  return api.get<JournalInsightsOut>("/journal/insights", { token });
}
