import Head from "next/head";
import Link from "next/link";
import { useAuthGuard } from "@/lib/useAuthGuard";
import { useApiResource } from "@/lib/useApiResource";
import { isPremiumActive } from "@/lib/api/entitlement";
import { getProgress } from "@/lib/api/progress";
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
  const { settled, token, subscription } = useAuthGuard();
  const premium = subscription ? isPremiumActive(subscription) : false;

  const { data: progress, loading } = useApiResource(token ? () => getProgress(token) : null, [token]);

  if (!settled || !token) return null;
  if (loading || !progress) {
    return (
      <AppShell title="Progress">
        <p className="text-sm text-foreground-muted">Loading your progress…</p>
      </AppShell>
    );
  }

  const questsToday = new Set(progress.quests_today);
  const allThreeDone = (["LOGIN", "CHECK_IN", "INNER_READING"] as const).every((q) => questsToday.has(q));
  const nextMilestone = MILESTONES.find((m) => m > progress.streak.current) ?? null;

  return (
    <>
      <Head><title>Progress — Gio</title></Head>
      <AppShell title="Progress">
        <div className="grid gap-5 lg:grid-cols-2">
          <Card className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-foreground-muted">Total XP</p>
              <p className="font-display text-3xl font-semibold text-foreground">{progress.xp_total}</p>
            </div>
            <Chip tone="gold">Progression only · not spendable</Chip>
          </Card>

          <Card className="flex items-center justify-between">
            <StreakFlame current={progress.streak.current} />
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
            {!questsToday.has("LOGIN") ? (
              <p className="text-[11px] text-foreground-muted">
                The &quot;Log in&quot; quest isn&apos;t wired up yet on the backend — see docs/dev_log_0001.md.
              </p>
            ) : null}
          </Card>

          <Card className="flex flex-col items-center justify-center gap-3">
            <h2 className="self-start font-display text-lg font-semibold text-foreground">Growth Garden</h2>
            <GardenIllustration stage={progress.garden.stage} />
            <p className="text-xs text-foreground-muted">Visual only — resets weekly, never issues XP.</p>
          </Card>

          <Card className="flex flex-col gap-4 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-foreground">Badges</h2>
              <Link href="/rewards" className="text-sm font-semibold text-primary">Rewards →</Link>
            </div>
            {premium ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {progress.badges.map((badge) => (
                  <BadgeIcon key={badge.key} badge={badge} earned={badge.earned} />
                ))}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {progress.badges.slice(0, 3).map((badge) => (
                    <BadgeIcon key={badge.key} badge={badge} earned={badge.earned} />
                  ))}
                </div>
                <EntitlementGate description="See your full private badge collection with Premium." />
              </>
            )}
          </Card>

          {progress.streak.milestones_awarded.length > 0 ? (
            <Card className="lg:col-span-2">
              <div className="mb-2 flex justify-between text-xs font-semibold text-foreground-muted">
                <span>Streak progress</span>
                <span>{progress.streak.current} / {nextMilestone ?? 100}</span>
              </div>
              <ProgressBar value={progress.streak.current} max={nextMilestone ?? 100} colorClassName="bg-accent" />
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
