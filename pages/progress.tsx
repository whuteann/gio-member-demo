import Head from "next/head";
import Link from "next/link";
import { useAppGuard } from "@/lib/useAppGuard";
import { useAppState } from "@/context/AppStateContext";
import { BADGE_DEFINITIONS } from "@/lib/blueprints";
import { localDateString } from "@/lib/gamification";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import Chip from "@/components/ui/Chip";
import StreakFlame from "@/components/ui/StreakFlame";
import GardenIllustration from "@/components/ui/GardenIllustration";
import ProgressBar from "@/components/ui/ProgressBar";
import BadgeIcon from "@/components/ui/BadgeIcon";
import EntitlementGate from "@/components/ui/EntitlementGate";
import Button from "@/components/ui/Button";

const QUEST_LABELS: Record<string, { label: string; icon: string }> = {
  LOGIN: { label: "Log in", icon: "👋" },
  CHECK_IN: { label: "Emotional Check-In", icon: "💬" },
  INNER_READING: { label: "Inner Reading", icon: "🔮" },
};

const MILESTONES = [7, 30, 100];

export default function ProgressPage() {
  const { settled, data } = useAppGuard();
  const { isPremiumActive, xpTotal } = useAppState();
  if (!settled || !data) return null;

  const today = localDateString();
  const questsToday = new Set(data.quests.filter((q) => q.date === today).map((q) => q.quest));
  const allThreeDone = (["LOGIN", "CHECK_IN", "INNER_READING"] as const).every((q) => questsToday.has(q));
  const nextMilestone = MILESTONES.find((m) => m > data.streak.current) ?? null;
  const earnedBadgeKeys = new Set(data.badges.map((b) => b.key));

  return (
    <>
      <Head><title>Progress — Gio</title></Head>
      <AppShell title="Progress">
        <div className="grid gap-5 lg:grid-cols-2">
          <Card className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-foreground-muted">Total XP</p>
              <p className="font-display text-3xl font-semibold text-foreground">{xpTotal}</p>
            </div>
            <Chip tone="gold">Progression only · not spendable</Chip>
          </Card>

          <Card className="flex items-center justify-between">
            <StreakFlame current={data.streak.current} />
            {nextMilestone ? (
              <div className="text-right">
                <p className="text-xs font-semibold text-foreground-muted">Next milestone</p>
                <p className="font-display text-lg font-semibold text-foreground">{nextMilestone} days</p>
              </div>
            ) : (
              <Chip tone="success">All milestones reached</Chip>
            )}
          </Card>

          <Card className="flex flex-col gap-3">
            <h2 className="font-display text-lg font-semibold text-foreground">Today’s quests</h2>
            {(["LOGIN", "CHECK_IN", "INNER_READING"] as const).map((q) => (
              <div key={q} className="flex items-center justify-between rounded-xl bg-surface-muted px-3 py-2.5">
                <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <span aria-hidden>{QUEST_LABELS[q].icon}</span>
                  {QUEST_LABELS[q].label}
                </span>
                {questsToday.has(q) ? <Chip tone="success">Done</Chip> : <Chip tone="neutral">Pending</Chip>}
              </div>
            ))}
            <div className="flex items-center justify-between rounded-xl border border-dashed border-gold/50 bg-gold/5 px-3 py-2.5">
              <span className="text-sm font-medium text-foreground">Complete all three (+10 XP)</span>
              {allThreeDone ? <Chip tone="gold">Earned today</Chip> : <Chip tone="neutral">In progress</Chip>}
            </div>
          </Card>

          <Card className="flex flex-col items-center justify-center gap-3">
            <h2 className="self-start font-display text-lg font-semibold text-foreground">Growth Garden</h2>
            <GardenIllustration stage={data.garden.stage} />
            <p className="text-xs text-foreground-muted">Visual only — resets weekly, never issues XP.</p>
          </Card>

          <Card className="flex flex-col gap-4 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-foreground">Badges</h2>
              <Link href="/rewards" className="text-sm font-semibold text-primary">Rewards →</Link>
            </div>
            {isPremiumActive ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {BADGE_DEFINITIONS.map((badge) => (
                  <BadgeIcon key={badge.key} badge={badge} earned={earnedBadgeKeys.has(badge.key)} />
                ))}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {BADGE_DEFINITIONS.slice(0, 3).map((badge) => (
                    <BadgeIcon key={badge.key} badge={badge} earned={earnedBadgeKeys.has(badge.key)} />
                  ))}
                </div>
                <EntitlementGate description="See your full private badge collection with Premium." />
              </>
            )}
          </Card>

          {data.streak.milestonesAwarded.length > 0 ? (
            <Card className="lg:col-span-2">
              <div className="mb-2 flex justify-between text-xs font-semibold text-foreground-muted">
                <span>Streak progress</span>
                <span>{data.streak.current} / {nextMilestone ?? 100}</span>
              </div>
              <ProgressBar value={data.streak.current} max={nextMilestone ?? 100} colorClassName="bg-accent" />
            </Card>
          ) : null}

          <div className="lg:col-span-2">
            <Link href="/rewards"><Button variant="outline">View Rewards</Button></Link>
          </div>
        </div>
      </AppShell>
    </>
  );
}
