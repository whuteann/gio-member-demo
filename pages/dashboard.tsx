import Head from "next/head";
import Link from "next/link";
import { useState } from "react";
import { useAppState, useCurrentPersonality } from "@/context/AppStateContext";
import { useAppGuard } from "@/lib/useAppGuard";
import { localDateString } from "@/lib/gamification";
import { innerReadingGate } from "@/lib/entitlement";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Chip from "@/components/ui/Chip";
import MultiRingGauge from "@/components/ui/MultiRingGauge";
import StreakFlame from "@/components/ui/StreakFlame";
import GardenIllustration from "@/components/ui/GardenIllustration";
import ProductCard from "@/components/ui/ProductCard";
import { ARCHETYPES, DIMENSIONS } from "@/lib/blueprints";

const DATE_BADGE_TONES = ["bg-secondary/20 text-primary", "bg-accent/15 text-accent", "bg-gold/15 text-gold-foreground"];

export default function DashboardPage() {
  const { settled, data } = useAppGuard();
  const { isPremiumActive, xpTotal, addJournalEntry } = useAppState();
  const personality = useCurrentPersonality();
  const [journalDraft, setJournalDraft] = useState("");
  const [justSaved, setJustSaved] = useState(false);

  if (!settled || !data) return null;

  const today = localDateString();
  const checkedInToday = data.checkIns.some((c) => c.completedAt?.startsWith(today));
  const latestState = data.stateSnapshots[data.stateSnapshots.length - 1] ?? null;
  const latestReading = data.innerReadings[data.innerReadings.length - 1] ?? null;
  const latestRecommendation = data.recommendations[data.recommendations.length - 1] ?? null;
  const recentReadings = [...data.innerReadings]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 3);
  const gate = innerReadingGate(data.subscription);
  const questsToday = data.quests.filter((q) => q.date === today).map((q) => q.quest);

  return (
    <>
      <Head><title>Dashboard — Gio</title></Head>
      <AppShell title={`Hi, ${data.user.displayName.split(" ")[0]}`}>
        <div className="grid gap-5 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-foreground">Your inner state</h2>
              {latestState ? <Chip tone="primary">{latestState.currentFocus}</Chip> : null}
            </div>
            {latestState ? (
              <div className="mt-4 flex flex-col gap-5 sm:flex-row sm:items-center">
                <MultiRingGauge
                  size={128}
                  strokeWidth={8}
                  gap={3}
                  rings={DIMENSIONS.map((dim) => ({
                    value:
                      dim.key === "emotional_energy"
                        ? latestState.emotionalEnergy
                        : dim.key === "mental_clarity"
                          ? latestState.mentalClarity
                          : dim.key === "inner_pressure"
                            ? latestState.innerPressure
                            : latestState.grounding,
                    color: dim.color,
                  }))}
                >
                  <span className="font-display text-xl font-semibold text-foreground">
                    {Math.round(latestState.balance)}
                  </span>
                </MultiRingGauge>
                <div className="grid flex-1 grid-cols-2 gap-3">
                  {DIMENSIONS.map((dim) => {
                    const value =
                      dim.key === "emotional_energy"
                        ? latestState.emotionalEnergy
                        : dim.key === "mental_clarity"
                          ? latestState.mentalClarity
                          : dim.key === "inner_pressure"
                            ? latestState.innerPressure
                            : latestState.grounding;
                    return (
                      <div key={dim.key}>
                        <p className="flex items-center gap-1.5 text-xs font-semibold text-foreground-muted">
                          <span
                            className="inline-block h-2 w-2 rounded-full"
                            style={{ background: dim.color }}
                          />
                          {dim.label}
                        </p>
                        <p className="font-display text-xl font-semibold text-foreground">{value}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <p className="mt-3 text-sm text-foreground-muted">
                Complete a check-in or Inner Reading to see your first snapshot.
              </p>
            )}
            <p className="mt-4 text-sm text-foreground-muted">{latestState?.summary}</p>
          </Card>

          <Card className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-foreground">Latest Insight</h2>
              {latestReading ? (
                <Link
                  href={`/inner-reading/${latestReading.id}/result`}
                  className="text-sm font-semibold text-primary"
                >
                  View Full Reading
                </Link>
              ) : null}
            </div>
            {latestReading?.insight ? (
              <>
                <p className="text-2xl leading-none text-accent">&ldquo;</p>
                <p className="-mt-3 text-sm font-medium text-foreground">{latestReading.insight}</p>
                {latestReading.reflectionQuestion ? (
                  <div className="mt-1 flex flex-col gap-1 border-t border-border pt-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-foreground-muted">
                      💡 Reflection Question
                    </p>
                    <p className="text-sm text-foreground-muted">{latestReading.reflectionQuestion}</p>
                  </div>
                ) : null}
              </>
            ) : (
              <p className="text-sm text-foreground-muted">
                Complete an Inner Reading to get your first personal insight.
              </p>
            )}
          </Card>

          <Card className="flex flex-col gap-3">
            <h2 className="font-display text-lg font-semibold text-foreground">Today</h2>
            <div className="flex items-center justify-between rounded-xl bg-surface-muted px-3 py-2.5">
              <span className="text-sm font-medium text-foreground">Emotional Check-In</span>
              {checkedInToday ? <Chip tone="success">Done</Chip> : <Chip tone="neutral">Pending</Chip>}
            </div>
            {!checkedInToday ? (
              <Link href="/check-in">
                <Button fullWidth>Check in now</Button>
              </Link>
            ) : (
              <Link href="/check-in/history">
                <Button fullWidth variant="outline">View check-in history</Button>
              </Link>
            )}
          </Card>

          <Card className="flex flex-col gap-3">
            <h2 className="font-display text-lg font-semibold text-foreground">Inner Reading</h2>
            {latestReading ? (
              <p className="text-sm text-foreground-muted line-clamp-3">{latestReading.narrative}</p>
            ) : (
              <p className="text-sm text-foreground-muted">
                Your first Inner Reading is free and unlocks your recommendations.
              </p>
            )}
            <Link href={latestReading ? `/inner-reading/${latestReading.id}/result` : "/inner-reading/session"}>
              <Button fullWidth variant="outline">
                {latestReading ? "View latest reading" : "Start free reading"}
              </Button>
            </Link>
            {gate === "MEMBERSHIP_GATE" ? (
              <p className="text-xs text-foreground-muted">Repeat readings need Premium.</p>
            ) : null}
          </Card>

          <Card className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-foreground">Your Personality</h2>
              <Link href="/core-personality" className="text-sm font-semibold text-primary">
                View Profile
              </Link>
            </div>
            {personality ? (
              <>
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-14 w-14 flex-none items-center justify-center rounded-full text-2xl ${ARCHETYPES[personality.archetype].circleClassName}`}
                  >
                    <span aria-hidden>{personality.icon}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-display text-base font-semibold text-foreground">
                      {ARCHETYPES[personality.archetype].name}
                    </p>
                    <p className="truncate text-xs text-foreground-muted">
                      {ARCHETYPES[personality.archetype].traits.join(" • ")}
                    </p>
                  </div>
                </div>
                <p className="line-clamp-3 text-xs text-foreground-muted">
                  {ARCHETYPES[personality.archetype].overall}
                </p>
                <div className="flex items-start gap-2 rounded-xl bg-surface-muted px-3 py-2.5">
                  <span aria-hidden>🌿</span>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-foreground-muted">
                      Reminder for you
                    </p>
                    <p className="text-xs font-medium text-foreground">
                      {ARCHETYPES[personality.archetype].reminder}
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-sm text-foreground-muted">
                Complete your baseline assessment to see your Core Personality.
              </p>
            )}
          </Card>

          <Card className="flex flex-col gap-3 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-foreground">For you</h2>
              <Link href="/recommendation" className="text-sm font-semibold text-primary">
                See all
              </Link>
            </div>
            {latestRecommendation ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {latestRecommendation.items.slice(0, 3).map((item) => (
                  <ProductCard key={item.id} item={item} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-foreground-muted">
                Complete a check-in or reading to get your first recommendations.
              </p>
            )}
          </Card>

          <Card className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-foreground">Progress</h2>
              <Chip tone="gold">{xpTotal} XP</Chip>
            </div>
            <div className="flex items-center justify-between">
              <StreakFlame current={data.streak.current} />
              <GardenIllustration stage={data.garden.stage} size="sm" />
            </div>
            <div className="flex gap-1.5">
              {(["LOGIN", "CHECK_IN", "INNER_READING"] as const).map((q) => (
                <span
                  key={q}
                  className={`h-1.5 flex-1 rounded-full ${questsToday.includes(q) ? "bg-primary" : "bg-surface-muted"}`}
                />
              ))}
            </div>
            <Link href="/progress">
              <Button fullWidth variant="outline">View progress</Button>
            </Link>
          </Card>

          <Card className="flex flex-col gap-3 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-foreground">Recent Readings</h2>
              <Link href="/inner-reading/history" className="text-sm font-semibold text-primary">
                View All
              </Link>
            </div>
            {recentReadings.length > 0 ? (
              <div className="flex flex-col divide-y divide-border">
                {recentReadings.map((reading, i) => {
                  const created = new Date(reading.createdAt);
                  return (
                    <Link key={reading.id} href={`/inner-reading/${reading.id}/result`}>
                      <div className="flex items-center gap-3 py-4">
                        <div
                          className={`flex h-12 w-12 flex-none flex-col items-center justify-center rounded-xl ${DATE_BADGE_TONES[i % DATE_BADGE_TONES.length]}`}
                        >
                          <span className="text-[10px] font-semibold uppercase tracking-wide">
                            {created.toLocaleDateString(undefined, { month: "short" })}
                          </span>
                          <span className="text-base font-bold leading-none">{created.getDate()}</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-foreground">{reading.title}</p>
                          <p className="line-clamp-2 text-xs text-foreground-muted">{reading.subtitle}</p>
                        </div>
                        <div className="flex flex-none flex-col items-end gap-1 text-foreground-muted">
                          <span className="text-xs">
                            {created.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}
                          </span>
                          <span aria-hidden>›</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-foreground-muted">
                Your completed Inner Readings will show up here.
              </p>
            )}
            <Link href="/inner-reading/history" className="text-sm font-semibold text-primary">
              Explore all your readings →
            </Link>
          </Card>

          <Card className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-foreground">Continue Your Reflection</h2>
              <Link href="/journal" className="text-sm font-semibold text-primary">
                New Journal Entry
              </Link>
            </div>
            <p className="text-sm text-foreground-muted">What has taken most of your emotional energy today?</p>
            <textarea
              value={journalDraft}
              onChange={(e) => setJournalDraft(e.target.value)}
              placeholder="Write what comes to mind…"
              rows={3}
              className="w-full resize-none rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-primary focus:outline-none"
            />
            <div className="flex items-center justify-between gap-3">
              <Link href="/journal" className="text-sm font-semibold text-primary">
                View Journal
              </Link>
              <Button
                size="sm"
                disabled={!journalDraft.trim()}
                onClick={() => {
                  addJournalEntry(journalDraft.trim());
                  setJournalDraft("");
                  setJustSaved(true);
                  setTimeout(() => setJustSaved(false), 2000);
                }}
              >
                {justSaved ? "Saved ✓" : "🔒 Save Privately"}
              </Button>
            </div>
          </Card>

          {!isPremiumActive ? (
            <Card className="flex flex-col gap-3 border-accent/40 bg-accent/5 lg:col-span-3">
              <h2 className="font-display text-lg font-semibold text-foreground">Go Premium</h2>
              <p className="text-sm text-foreground-muted">
                Unlock repeat Inner Readings, full history, full recommendations and full Core
                Personality detail.
              </p>
              <Link href="/membership" className="w-full sm:w-auto">
                <Button variant="accent">View plans</Button>
              </Link>
            </Card>
          ) : null}
        </div>
      </AppShell>
    </>
  );
}
