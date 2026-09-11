import Head from "next/head";
import Link from "next/link";
import { useAppGuard } from "@/lib/useAppGuard";
import { innerReadingGate } from "@/lib/entitlement";
import { addDays, localDateString, weekStartString } from "@/lib/gamification";
import { resolveFocusKey } from "@/lib/scoring";
import type { DimensionKey, InnerReading } from "@/lib/types";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Chip from "@/components/ui/Chip";

const FEATURES = [
  { icon: "🔒", label: "Private & Secure", body: "Your answers are encrypted and private." },
  { icon: "🧑", label: "Personalised Insight", body: "Receive insights tailored to you." },
  { icon: "💡", label: "Better Clarity", body: "Understand your thoughts, emotions and needs." },
];

const BEFORE_TIPS = [
  { icon: "🔇", title: "Find a quiet space", body: "Give yourself undisturbed time.", circleClassName: "bg-clarity/15" },
  { icon: "❤️", title: "Be honest with yourself", body: "There are no right or wrong answers.", circleClassName: "bg-danger/10" },
  { icon: "🎯", title: "Focus on the present", body: "Answer based on how you feel now.", circleClassName: "bg-surface-muted" },
  { icon: "🌿", title: "Take your time", body: "There is no rush. Breathe and flow.", circleClassName: "bg-grounding/15" },
];

const FOCUS_TAG: Record<string, { label: string; icon: string; circleClassName: string }> = {
  emotional_energy: { label: "Personal", icon: "🌙", circleClassName: "bg-energy/15" },
  mental_clarity: { label: "Decision Making", icon: "🌊", circleClassName: "bg-clarity/15" },
  inner_pressure: { label: "Work", icon: "🌿", circleClassName: "bg-pressure/15" },
  grounding: { label: "Recovery", icon: "🪨", circleClassName: "bg-grounding/15" },
  balanced: { label: "Reflection", icon: "✨", circleClassName: "bg-secondary/15" },
};

function focusTagFor(reading: InnerReading) {
  const key = reading.dimensionScores ? resolveFocusKey(reading.dimensionScores as Record<DimensionKey, number>) : "balanced";
  return FOCUS_TAG[key] ?? FOCUS_TAG.balanced;
}

function formatReadingTimestamp(iso: string, today: string): string {
  const date = new Date(iso);
  const dateStr = localDateString(date);
  const time = date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  if (dateStr === today) return `Today, ${time}`;
  if (dateStr === addDays(today, -1)) return `Yesterday, ${time}`;
  return `${date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}, ${time}`;
}

function weekdayLabel(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { weekday: "short" });
}

export default function InnerReadingHubPage() {
  const { settled, data } = useAppGuard();
  if (!settled || !data) return null;

  const gate = innerReadingGate(data.subscription);
  const locked = gate === "MEMBERSHIP_GATE";
  const today = localDateString();
  const latestState = data.stateSnapshots[data.stateSnapshots.length - 1] ?? null;
  const recentReadings = [...data.innerReadings]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 3);

  const weekStart = weekStartString(today);
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const dateStr = addDays(weekStart, i);
    return {
      dateStr,
      label: weekdayLabel(dateStr),
      done: data.quests.some((q) => q.quest === "INNER_READING" && q.date === dateStr),
      isToday: dateStr === today,
    };
  });

  return (
    <>
      <Head><title>Inner Reading — Gio</title></Head>
      <AppShell>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="flex items-center gap-2 font-display text-2xl font-semibold text-foreground lg:text-3xl">
              Inner Reading <span aria-hidden>🌿</span>
            </h1>
            <p className="mt-1 text-sm text-foreground-muted">
              Take a few minutes to understand your current inner state.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2">
              <span aria-hidden>⏱️</span>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-foreground-muted">
                  Estimated time
                </p>
                <p className="text-sm font-semibold text-foreground">3–5 minutes</p>
              </div>
            </div>
            {locked ? (
              <Chip tone="gold">🔒 Premium</Chip>
            ) : (
              <Link href="/inner-reading/session">
                <Button icon={<span aria-hidden>+</span>}>Start New Reading</Button>
              </Link>
            )}
          </div>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-3">
          <div className="flex flex-col gap-5 lg:col-span-2">
            {locked ? (
              <Card className="flex flex-col gap-4 border-gold/30 bg-gold/5 sm:flex-row sm:items-center">
                <div
                  className="flex h-28 w-full flex-none items-center justify-center rounded-2xl bg-gold/10 text-5xl sm:w-40"
                  aria-hidden
                >
                  🔒
                </div>
                <div className="flex flex-col gap-3">
                  <h2 className="font-display text-xl font-semibold text-foreground">
                    Unlock More Inner Readings
                  </h2>
                  <p className="text-sm text-foreground-muted">
                    You&apos;ve used your free Inner Reading. Upgrade to Premium for unlimited
                    readings, full history and full recommendations.
                  </p>
                  <Link href="/membership" className="w-full sm:w-auto">
                    <Button variant="accent">Upgrade to Premium</Button>
                  </Link>
                </div>
              </Card>
            ) : (
              <Card className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <div
                  className="flex h-32 w-full flex-none items-center justify-center rounded-2xl bg-surface-muted text-6xl sm:w-40"
                  aria-hidden
                >
                  🧘
                </div>
                <div className="flex flex-1 flex-col gap-3">
                  <h2 className="font-display text-xl font-semibold text-foreground">Begin Your Inner Reading</h2>
                  <p className="text-sm text-foreground-muted">
                    Answer a few simple questions honestly. Gio will help you understand
                    what&apos;s happening within you and what you may need most today.
                  </p>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {FEATURES.map((f) => (
                      <div key={f.label} className="flex items-start gap-2">
                        <span aria-hidden>{f.icon}</span>
                        <div>
                          <p className="text-xs font-semibold text-foreground">{f.label}</p>
                          <p className="text-[11px] leading-snug text-foreground-muted">{f.body}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Link href="/inner-reading/session">
                    <Button fullWidth>Begin Inner Reading</Button>
                  </Link>
                </div>
              </Card>
            )}

            <Card className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-semibold text-foreground">Recent Readings</h2>
                <Link href="/inner-reading/history" className="text-sm font-semibold text-primary">
                  View all
                </Link>
              </div>
              {recentReadings.length > 0 ? (
                <div className="flex flex-col divide-y divide-border">
                  {recentReadings.map((reading) => {
                    const tag = focusTagFor(reading);
                    return (
                      <Link key={reading.id} href={`/inner-reading/${reading.id}/result`}>
                        <div className="flex items-center gap-3 py-4">
                          <div
                            className={`flex h-11 w-11 flex-none items-center justify-center rounded-full text-lg ${tag.circleClassName}`}
                          >
                            <span aria-hidden>{tag.icon}</span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="truncate text-sm font-semibold text-foreground">{reading.title}</p>
                              <Chip tone="neutral">{tag.label}</Chip>
                            </div>
                            <p className="line-clamp-2 text-xs text-foreground-muted">{reading.subtitle}</p>
                          </div>
                          <div className="flex flex-none flex-col items-end gap-1 text-foreground-muted">
                            <span className="text-xs">{formatReadingTimestamp(reading.createdAt, today)}</span>
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

            <Card className="flex items-start gap-4">
              <div
                className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-secondary/15 text-xl"
                aria-hidden
              >
                🌸
              </div>
              <div>
                <h3 className="font-display text-base font-semibold text-foreground">What is Inner Reading?</h3>
                <p className="mt-1 text-sm text-foreground-muted">
                  Inner Reading is a reflection practice designed to help you understand your
                  current thoughts, emotions and needs. The more you reflect, the more accurate
                  and meaningful your insights will become.
                </p>
              </div>
            </Card>
          </div>

          <div className="flex flex-col gap-5">
            <Card className="flex flex-col gap-4">
              <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-foreground">
                <span aria-hidden>🌿</span> Before you begin
              </h2>
              {BEFORE_TIPS.map((tip) => (
                <div key={tip.title} className="flex items-start gap-3">
                  <div
                    className={`flex h-9 w-9 flex-none items-center justify-center rounded-full ${tip.circleClassName}`}
                    aria-hidden
                  >
                    {tip.icon}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{tip.title}</p>
                    <p className="text-xs text-foreground-muted">{tip.body}</p>
                  </div>
                </div>
              ))}
            </Card>

            <Card className="flex flex-col gap-4">
              <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-foreground">
                <span aria-hidden>🔥</span> Your Reading Streak
              </h2>
              <div className="flex items-center gap-4">
                <div>
                  <p className="font-display text-3xl font-bold leading-none text-foreground">
                    {data.streak.current}
                  </p>
                  <p className="text-xs text-foreground-muted">days</p>
                </div>
                <p className="text-xs text-foreground-muted">
                  {data.streak.current > 0
                    ? "Keep going! Consistency builds deeper awareness."
                    : "Start today to begin your streak."}
                </p>
              </div>
              <div className="flex justify-between">
                {weekDays.map((day) => (
                  <div key={day.dateStr} className="flex flex-col items-center gap-1.5">
                    <div
                      className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                        day.done
                          ? "bg-success text-white"
                          : day.isToday
                            ? "border-2 border-dashed border-border text-foreground-muted"
                            : "bg-surface-muted text-foreground-muted"
                      }`}
                    >
                      {day.done ? "✓" : ""}
                    </div>
                    <span className="text-[10px] text-foreground-muted">{day.label}</span>
                  </div>
                ))}
              </div>
            </Card>

            {latestState ? (
              <Card className="flex flex-col gap-2">
                <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-foreground">
                  <span aria-hidden>🌿</span> Suggested Reading Focus
                </h2>
                <p className="font-display text-base font-semibold text-foreground">{latestState.currentFocus}</p>
                <p className="text-sm text-foreground-muted">{latestState.summary}</p>
                <Link href="/progress" className="text-sm font-semibold text-primary">
                  Learn more about this focus →
                </Link>
              </Card>
            ) : null}
          </div>
        </div>
      </AppShell>
    </>
  );
}
