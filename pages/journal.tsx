import Head from "next/head";
import { useState } from "react";
import { useAppState } from "@/context/AppStateContext";
import { useAppGuard } from "@/lib/useAppGuard";
import { buildJournalInsights } from "@/lib/journal";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Chip from "@/components/ui/Chip";
import StatTile from "@/components/ui/StatTile";

export default function JournalPage() {
  const { settled, data } = useAppGuard();
  const { addJournalEntry } = useAppState();
  const [draft, setDraft] = useState("");

  if (!settled || !data) return null;

  const insights = buildJournalInsights(data.journalEntries);
  const entries = [...data.journalEntries].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  function save() {
    if (!draft.trim()) return;
    addJournalEntry(draft.trim());
    setDraft("");
  }

  return (
    <>
      <Head><title>Journal — Gio</title></Head>
      <AppShell title="Journal">
        <div className="grid gap-5 lg:grid-cols-3">
          <Card className="flex flex-col gap-3 lg:col-span-2">
            <h2 className="font-display text-lg font-semibold text-foreground">Today&apos;s Reflection</h2>
            <p className="text-sm text-foreground-muted">Write freely — your thoughts, feelings, or anything on your mind. Supports plain markdown.</p>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Write what comes to mind…"
              rows={6}
              className="w-full resize-none rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-primary focus:outline-none"
            />
            <div className="flex justify-end">
              <Button disabled={!draft.trim()} onClick={save}>
                Save Entry
              </Button>
            </div>
          </Card>

          <div className="grid grid-cols-3 gap-3 lg:col-span-1 lg:grid-cols-1">
            <StatTile icon={<span aria-hidden>📝</span>} label="Entries" value={insights.entriesThisWeek} hint={
              insights.entriesDelta === 0
                ? "Same as last week"
                : `${insights.entriesDelta > 0 ? "↑" : "↓"} ${Math.abs(insights.entriesDelta)} from last week`
            } />
            <StatTile icon={<span aria-hidden>🙂</span>} label="Most Common Mood" value={insights.topMood ?? "—"} />
            <StatTile icon={<span aria-hidden>🌱</span>} label="Top Theme" value={insights.topTheme ?? "—"} />
          </div>

          <Card className="flex flex-col gap-3 lg:col-span-3">
            <h2 className="font-display text-lg font-semibold text-foreground">Your Entries</h2>
            {entries.length === 0 ? (
              <p className="text-sm text-foreground-muted">No journal entries yet — write your first reflection above.</p>
            ) : (
              <div className="flex flex-col divide-y divide-border">
                {entries.map((entry) => (
                  <div key={entry.id} className="flex flex-col gap-2 py-4 first:pt-0 last:pb-0">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Chip tone="primary">{entry.mood}</Chip>
                        <Chip tone="neutral">{entry.theme}</Chip>
                      </div>
                      <p className="text-xs text-foreground-muted">
                        {new Date(entry.createdAt).toLocaleString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <p className="whitespace-pre-wrap text-sm text-foreground-muted">{entry.content}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </AppShell>
    </>
  );
}
