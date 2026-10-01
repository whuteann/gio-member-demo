import Head from "next/head";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { useAuthGuard } from "@/lib/useAuthGuard";
import { useApiResource } from "@/lib/useApiResource";
import { useLanguage } from "@/lib/useLanguage";
import { isPremiumActive, INNER_READING_WEEKLY_FREE_LIMIT, readingsUsedThisWeek } from "@/lib/api/entitlement";
import { getLatestSnapshot, listInnerReadings } from "@/lib/api/reflections";
import { getProgress } from "@/lib/api/progress";
import { localizedSnapshot } from "@/lib/snapshotDisplay";
import { ApiError } from "@/lib/api/client";
import { addDays, localDateString, weekStartString } from "@/lib/gamification";
import type { InnerReadingOut, InnerStateSnapshotOut, ProgressOut } from "@/lib/api/types";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Chip from "@/components/ui/Chip";

interface HubData {
  readings: InnerReadingOut[];
  progress: ProgressOut;
  snapshot: InnerStateSnapshotOut | null;
}

export default function InnerReadingHubPage() {
  const { settled, token, subscription } = useAuthGuard();
  const { t } = useTranslation("innerReading");
  const { language } = useLanguage();
  const dateLocale = language === "zh" ? "zh-CN" : "en-US";

  const features = t("begin.features", { returnObjects: true }) as { label: string; body: string }[];
  const beforeTips = t("beforeYouBegin.tips", { returnObjects: true }) as { title: string; body: string }[];
  const BEFORE_ICONS = ["🔇", "❤️", "🎯", "🌿"];
  const BEFORE_CIRCLE_CLASSES = ["bg-clarity/15", "bg-danger/10", "bg-surface-muted", "bg-grounding/15"];
  const FEATURE_ICONS = ["🔒", "🧑", "💡"];

  function formatReadingTimestamp(iso: string, today: string): string {
    const date = new Date(iso);
    const dateStr = localDateString(date);
    const time = date.toLocaleTimeString(dateLocale, { hour: "numeric", minute: "2-digit" });
    if (dateStr === today) return `${t("recent.today")}, ${time}`;
    if (dateStr === addDays(today, -1)) return `${t("recent.yesterday")}, ${time}`;
    return `${date.toLocaleDateString(dateLocale, { day: "numeric", month: "short", year: "numeric" })}, ${time}`;
  }

  function weekdayLabel(dateStr: string): string {
    const [y, m, d] = dateStr.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString(dateLocale, { weekday: "short" });
  }

  const { data, loading } = useApiResource<HubData>(
    token
      ? async () => {
          const [readings, progress, snapshot] = await Promise.all([
            listInnerReadings(token),
            getProgress(token),
            getLatestSnapshot(token).catch((e) => (e instanceof ApiError && e.status === 404 ? null : Promise.reject(e))),
          ]);
          return { readings, progress, snapshot };
        }
      : null,
    [token]
  );

  if (!settled || !token) return null;
  if (loading || !data) {
    return (
      <AppShell>
        <p className="text-sm text-foreground-muted">{t("loading")}</p>
      </AppShell>
    );
  }

  const { readings, progress, snapshot } = data;
  const premium = subscription ? isPremiumActive(subscription) : false;
  const locked = !premium && readingsUsedThisWeek(readings) >= INNER_READING_WEEKLY_FREE_LIMIT;
  const today = localDateString();
  const recentReadings = readings.slice(0, 3);

  const completedDays = new Set(readings.map((r) => localDateString(new Date(r.created_at))));
  const weekStart = weekStartString(today);
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const dateStr = addDays(weekStart, i);
    return { dateStr, label: weekdayLabel(dateStr), done: completedDays.has(dateStr), isToday: dateStr === today };
  });

  return (
    <>
      <Head><title>{t("meta.title")}</title></Head>
      <AppShell>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="flex items-center gap-2 font-display text-2xl font-semibold text-foreground lg:text-3xl">
              {t("header.title")} <span aria-hidden>🌿</span>
            </h1>
            <p className="mt-1 text-sm text-foreground-muted">
              {t("header.subtitle")}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2">
              <span aria-hidden>⏱️</span>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-foreground-muted">
                  {t("estimatedTime.label")}
                </p>
                <p className="text-sm font-semibold text-foreground">{t("estimatedTime.value")}</p>
              </div>
            </div>
            {locked ? (
              <Chip tone="gold">{t("premiumChip")}</Chip>
            ) : (
              <Link href="/inner-reading/session">
                <Button icon={<span aria-hidden>+</span>}>{t("startNewReading")}</Button>
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
                    {t("locked.title")}
                  </h2>
                  <p className="text-sm text-foreground-muted">
                    {t("locked.body")}
                  </p>
                  <Link href="/membership" className="w-full sm:w-auto">
                    <Button variant="accent">{t("locked.cta")}</Button>
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
                  <h2 className="font-display text-xl font-semibold text-foreground">{t("begin.title")}</h2>
                  <p className="text-sm text-foreground-muted">
                    {t("begin.body")}
                  </p>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {features.map((f, i) => (
                      <div key={f.label} className="flex items-start gap-2">
                        <span aria-hidden>{FEATURE_ICONS[i]}</span>
                        <div>
                          <p className="text-xs font-semibold text-foreground">{f.label}</p>
                          <p className="text-[11px] leading-snug text-foreground-muted">{f.body}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Link href="/inner-reading/session">
                    <Button fullWidth>{t("begin.cta")}</Button>
                  </Link>
                </div>
              </Card>
            )}

            <Card className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-semibold text-foreground">{t("recent.title")}</h2>
                <Link href="/inner-reading/history" className="text-sm font-semibold text-primary">
                  {t("recent.viewAll")}
                </Link>
              </div>
              {recentReadings.length > 0 ? (
                <div className="flex flex-col divide-y divide-border">
                  {recentReadings.map((reading) => (
                    <Link key={reading.id} href={`/inner-reading/${reading.id}/result`}>
                      <div className="flex items-center gap-3 py-4">
                        <div
                          className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-surface-muted text-lg"
                          aria-hidden
                        >
                          {reading.emoji}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="truncate text-sm font-semibold text-foreground">{reading.title}</p>
                            <Chip tone="neutral">{reading.category}</Chip>
                          </div>
                          <p className="line-clamp-2 text-xs text-foreground-muted">{reading.subtitle}</p>
                        </div>
                        <div className="flex flex-none flex-col items-end gap-1 text-foreground-muted">
                          <span className="text-xs">{formatReadingTimestamp(reading.created_at, today)}</span>
                          <span aria-hidden>›</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-foreground-muted">
                  {t("recent.empty")}
                </p>
              )}
              <Link href="/inner-reading/history" className="text-sm font-semibold text-primary">
                {t("recent.exploreAll")}
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
                <h3 className="font-display text-base font-semibold text-foreground">{t("whatIs.title")}</h3>
                <p className="mt-1 text-sm text-foreground-muted">
                  {t("whatIs.body")}
                </p>
              </div>
            </Card>
          </div>

          <div className="flex flex-col gap-5">
            <Card className="flex flex-col gap-4">
              <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-foreground">
                <span aria-hidden>🌿</span> {t("beforeYouBegin.title")}
              </h2>
              {beforeTips.map((tip, i) => (
                <div key={tip.title} className="flex items-start gap-3">
                  <div
                    className={`flex h-9 w-9 flex-none items-center justify-center rounded-full ${BEFORE_CIRCLE_CLASSES[i]}`}
                    aria-hidden
                  >
                    {BEFORE_ICONS[i]}
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
                <span aria-hidden>🔥</span> {t("streak.title")}
              </h2>
              <div className="flex items-center gap-4">
                <div>
                  <p className="font-display text-3xl font-bold leading-none text-foreground">
                    {progress.streak.current}
                  </p>
                  <p className="text-xs text-foreground-muted">{t("streak.days")}</p>
                </div>
                <p className="text-xs text-foreground-muted">
                  {progress.streak.current > 0 ? t("streak.activeMessage") : t("streak.emptyMessage")}
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

            {snapshot ? (
              <Card className="flex flex-col gap-2">
                <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-foreground">
                  <span aria-hidden>🌿</span> {t("suggestedFocus.title")}
                </h2>
                <p className="font-display text-base font-semibold text-foreground">
                  {localizedSnapshot(snapshot, "current_focus", language)}
                </p>
                <p className="text-sm text-foreground-muted">
                  {localizedSnapshot(snapshot, "insight", language)}
                </p>
                <Link href="/progress" className="text-sm font-semibold text-primary">
                  {t("suggestedFocus.learnMore")}
                </Link>
              </Card>
            ) : null}
          </div>
        </div>
      </AppShell>
    </>
  );
}
