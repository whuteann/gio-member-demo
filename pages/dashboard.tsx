import Head from "next/head";
import Link from "next/link";
import { useAppState } from "@/context/AppStateContext";
import { useAppGuard } from "@/lib/useAppGuard";
import { localDateString } from "@/lib/gamification";
import { innerReadingGate } from "@/lib/entitlement";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Chip from "@/components/ui/Chip";
import RadialGauge from "@/components/ui/RadialGauge";
import StreakFlame from "@/components/ui/StreakFlame";
import GardenIllustration from "@/components/ui/GardenIllustration";
import ProductCard from "@/components/ui/ProductCard";
import { DIMENSIONS } from "@/lib/blueprints";

export default function DashboardPage() {
  const { settled, data } = useAppGuard();
  const { isPremiumActive, xpTotal } = useAppState();

  if (!settled || !data) return null;

  const today = localDateString();
  const checkedInToday = data.checkIns.some((c) => c.completedAt?.startsWith(today));
  const latestState = data.stateSnapshots[data.stateSnapshots.length - 1] ?? null;
  const latestReading = data.innerReadings[data.innerReadings.length - 1] ?? null;
  const latestRecommendation = data.recommendations[data.recommendations.length - 1] ?? null;
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
                <RadialGauge value={latestState.balance} label="Balance" size={112} />
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
                        <p className="text-xs font-semibold text-foreground-muted">{dim.label}</p>
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
            <Link href={latestReading ? `/inner-reading/${latestReading.id}/result` : "/inner-reading"}>
              <Button fullWidth variant="outline">
                {latestReading ? "View latest reading" : "Start free reading"}
              </Button>
            </Link>
            {gate === "MEMBERSHIP_GATE" ? (
              <p className="text-xs text-foreground-muted">Repeat readings need Premium.</p>
            ) : null}
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
