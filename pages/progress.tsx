import Head from "next/head";
import Link from "next/link";
import { useTranslation } from "react-i18next";
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

const QUEST_ICONS: Record<string, string> = {
  LOGIN: "👋",
  CHECK_IN: "💬",
  INNER_READING: "🔮",
};

const MILESTONES = [7, 30, 100];

export default function ProgressPage() {
  const { settled, token, subscription } = useAuthGuard();
  const { t } = useTranslation("progress");
  const premium = subscription ? isPremiumActive(subscription) : false;

  const { data: progress, loading } = useApiResource(token ? () => getProgress(token) : null, [token]);

  if (!settled || !token) return null;
  if (loading || !progress) {
    return (
      <AppShell title={t("title")}>
        <p className="text-sm text-foreground-muted">{t("loading")}</p>
      </AppShell>
    );
  }

  const questsToday = new Set(progress.quests_today);
  const allThreeDone = (["LOGIN", "CHECK_IN", "INNER_READING"] as const).every((q) => questsToday.has(q));
  const nextMilestone = MILESTONES.find((m) => m > progress.streak.current) ?? null;
  const QUEST_LABEL_KEYS: Record<string, string> = { LOGIN: "quests.login", CHECK_IN: "quests.checkIn", INNER_READING: "quests.innerReading" };

  return (
    <>
      <Head><title>{t("title")} — Auren</title></Head>
      <AppShell title={t("title")}>
        <div className="grid gap-5 lg:grid-cols-2">
          <Card className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-foreground-muted">{t("totalXp")}</p>
              <p className="font-display text-3xl font-semibold text-foreground">{progress.xp_total}</p>
            </div>
            <Chip tone="gold">{t("xpNote")}</Chip>
          </Card>

          <Card className="flex items-center justify-between">
            <StreakFlame current={progress.streak.current} />
            {nextMilestone ? (
              <div className="text-right">
                <p className="text-xs font-semibold text-foreground-muted">{t("nextMilestone")}</p>
                <p className="font-display text-lg font-semibold text-foreground">{t("days", { count: nextMilestone })}</p>
              </div>
            ) : (
              <Chip tone="success">{t("allMilestones")}</Chip>
            )}
          </Card>

          <Card className="flex flex-col gap-3">
            <h2 className="font-display text-lg font-semibold text-foreground">{t("quests.title")}</h2>
            {(["LOGIN", "CHECK_IN", "INNER_READING"] as const).map((q) => (
              <div key={q} className="flex items-center justify-between rounded-xl bg-surface-muted px-3 py-2.5">
                <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <span aria-hidden>{QUEST_ICONS[q]}</span>
                  {t(QUEST_LABEL_KEYS[q])}
                </span>
                {questsToday.has(q) ? <Chip tone="success">{t("quests.done")}</Chip> : <Chip tone="neutral">{t("quests.pending")}</Chip>}
              </div>
            ))}
            <div className="flex items-center justify-between rounded-xl border border-dashed border-gold/50 bg-gold/5 px-3 py-2.5">
              <span className="text-sm font-medium text-foreground">{t("quests.bonus")}</span>
              {allThreeDone ? <Chip tone="gold">{t("quests.earnedToday")}</Chip> : <Chip tone="neutral">{t("quests.inProgress")}</Chip>}
            </div>
            {!questsToday.has("LOGIN") ? (
              <p className="text-[11px] text-foreground-muted">
                {t("quests.loginNotWired")}
              </p>
            ) : null}
          </Card>

          <Card className="flex flex-col items-center justify-center gap-3">
            <h2 className="self-start font-display text-lg font-semibold text-foreground">{t("garden.title")}</h2>
            <GardenIllustration stage={progress.garden.stage} />
            <p className="text-xs text-foreground-muted">{t("garden.note")}</p>
          </Card>

          <Card className="flex flex-col gap-4 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-foreground">{t("badges.title")}</h2>
              <Link href="/rewards" className="text-sm font-semibold text-primary">{t("badges.rewards")}</Link>
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
                <EntitlementGate description={t("badges.gate")} />
              </>
            )}
          </Card>

          {progress.streak.milestones_awarded.length > 0 ? (
            <Card className="lg:col-span-2">
              <div className="mb-2 flex justify-between text-xs font-semibold text-foreground-muted">
                <span>{t("streak.title")}</span>
                <span>{progress.streak.current} / {nextMilestone ?? 100}</span>
              </div>
              <ProgressBar value={progress.streak.current} max={nextMilestone ?? 100} colorClassName="bg-accent" />
            </Card>
          ) : null}

          <div className="lg:col-span-2">
            <Link href="/rewards"><Button variant="outline">{t("viewRewards")}</Button></Link>
          </div>
        </div>
      </AppShell>
    </>
  );
}
