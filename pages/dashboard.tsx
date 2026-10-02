import Head from "next/head";
import Link from "next/link";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuthGuard } from "@/lib/useAuthGuard";
import { useApiResource } from "@/lib/useApiResource";
import { useLanguage } from "@/lib/useLanguage";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Chip from "@/components/ui/Chip";
import ColourOfTheDay from "@/components/ui/ColourOfTheDay";
import FallingLeaves from "@/components/ui/FallingLeaves";
import StreakFlame from "@/components/ui/StreakFlame";
import GardenIllustration from "@/components/ui/GardenIllustration";
import InstallPrompt from "@/components/ui/InstallPrompt";
import ProductCard from "@/components/ui/ProductCard";
import TrendChart from "@/components/ui/TrendChart";
import UnlockedCollection from "@/components/ui/UnlockedCollection";
import { COLOUR_LIBRARY, DIMENSIONS } from "@/lib/blueprints";
import { localized, topColourKey } from "@/lib/corePersonalityDisplay";
import { localizedSnapshot } from "@/lib/snapshotDisplay";
import type { ColourKey, Language } from "@/lib/types";
import { INNER_READING_WEEKLY_FREE_LIMIT, isPremiumActive, readingsUsedThisWeek } from "@/lib/api/entitlement";
import { getLatestSnapshot, getTrend, listCheckIns, listInnerReadings } from "@/lib/api/reflections";
import { getLatestRecommendation } from "@/lib/api/recommendations";
import { getCurrentCorePersonality } from "@/lib/api/corePersonality";
import { getProgress, getUnlockedContent } from "@/lib/api/progress";
import { createJournalEntry } from "@/lib/api/journal";
import { ApiError } from "@/lib/api/client";
import type {
  CorePersonalityResultOut,
  InnerReadingOut,
  InnerStateSnapshotOut,
  ProgressOut,
  RecommendationOut,
  TrendOut,
  UnlockedContentOut,
} from "@/lib/api/types";

const DATE_BADGE_TONES = ["bg-secondary/20 text-primary", "bg-accent/15 text-accent", "bg-gold/15 text-gold-foreground"];

interface DashboardData {
  snapshot: InnerStateSnapshotOut | null;
  readings: InnerReadingOut[];
  checkedInToday: boolean;
  recommendation: RecommendationOut | null;
  personality: CorePersonalityResultOut | null;
  progress: ProgressOut;
  trend: TrendOut;
  unlocks: UnlockedContentOut;
}

export default function DashboardPage() {
  const { settled, token, user, subscription } = useAuthGuard();
  const { t } = useTranslation("dashboard");
  const { language } = useLanguage();
  const [journalDraft, setJournalDraft] = useState("");
  const [justSaved, setJustSaved] = useState(false);
  const [trendPeriod, setTrendPeriod] = useState<"weekly" | "monthly">("weekly");

  const premium = subscription ? isPremiumActive(subscription) : false;
  const effectiveTrendPeriod = premium ? trendPeriod : "weekly";

  const { data, loading, error } = useApiResource<DashboardData>(
    token
      ? async () => {
          const today = new Date().toISOString().slice(0, 10);
          const [snapshot, readings, checkIns, recommendation, personality, progress, trend, unlocks] = await Promise.all([
            getLatestSnapshot(token).catch((e) => (e instanceof ApiError && e.status === 404 ? null : Promise.reject(e))),
            listInnerReadings(token),
            listCheckIns(token),
            getLatestRecommendation(token).catch((e) => (e instanceof ApiError && e.status === 404 ? null : Promise.reject(e))),
            getCurrentCorePersonality(token).catch((e) => (e instanceof ApiError && e.status === 404 ? null : Promise.reject(e))),
            getProgress(token),
            getTrend(token, effectiveTrendPeriod),
            getUnlockedContent(token),
          ]);
          return {
            snapshot,
            readings,
            checkedInToday: checkIns.some((c) => c.completed_at?.startsWith(today)),
            recommendation,
            personality,
            progress,
            trend,
            unlocks,
          };
        }
      : null,
    [token, effectiveTrendPeriod]
  );

  if (!settled || !token) return null;
  if (loading) {
    return (
      <AppShell title={user ? t("greeting", { name: user.display_name.split(" ")[0] }) : undefined}>
        <p className="text-sm text-foreground-muted">{t("loading")}</p>
      </AppShell>
    );
  }
  // Checked before `!data`: a failed fetch also leaves data null forever,
  // and that combination used to fall through to the "Loading" branch
  // above instead of ever showing the error — looked identical to a stuck
  // spinner from the outside.
  if (error) {
    return (
      <AppShell title={t("title")}>
        <p className="text-sm text-danger">{error}</p>
      </AppShell>
    );
  }
  if (!data) return null;

  const { snapshot, readings, checkedInToday, recommendation, personality, progress, unlocks } = data;
  const latestReading = readings[0] ?? null;
  const recentReadings = readings.slice(0, 3);
  const currentColourKey = (recommendation?.colour_key as ColourKey | undefined) ?? "gold";
  const recommendedColour = COLOUR_LIBRARY[currentColourKey];
  const personalityLanguage: Language = (personality?.primary_language as Language) ?? "en";
  const userLanguage: Language = language;
  const atWeeklyLimit = !premium && readingsUsedThisWeek(readings) >= INNER_READING_WEEKLY_FREE_LIMIT;
  const trendPoints = data.trend.points.map((p) => ({ date: p.date, label: p.label }));
  const trendSeries = {
    emotional_energy: data.trend.points.map((p) => p.emotional_energy),
    mental_clarity: data.trend.points.map((p) => p.mental_clarity),
    inner_pressure: data.trend.points.map((p) => p.inner_pressure),
    grounding: data.trend.points.map((p) => p.grounding),
  };

  function dimValueOf(state: InnerStateSnapshotOut, key: string) {
    if (key === "emotional_energy") return state.emotional_energy;
    if (key === "mental_clarity") return state.mental_clarity;
    if (key === "inner_pressure") return state.inner_pressure;
    return state.grounding;
  }

  function dimDeltaOf(state: InnerStateSnapshotOut, key: string) {
    if (key === "emotional_energy") return state.emotional_energy_delta;
    if (key === "mental_clarity") return state.mental_clarity_delta;
    if (key === "inner_pressure") return state.inner_pressure_delta;
    return state.grounding_delta;
  }

  async function saveJournalDraft() {
    if (!token || !journalDraft.trim()) return;
    await createJournalEntry(token, journalDraft.trim());
    setJournalDraft("");
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
  }

  return (
    <>
      <Head><title>Dashboard — Auren</title></Head>
      <FallingLeaves colourKey={currentColourKey} />
      <AppShell title={t("greeting", { name: user?.display_name.split(" ")[0] ?? "" })}>
        <div className="grid gap-5 lg:grid-cols-3">
          <InstallPrompt />
          <Card className="flex flex-col gap-1 lg:col-span-3">
            <h2 className="font-display text-lg font-semibold text-foreground">{t("collection.title")}</h2>
            <p className="mb-2 text-xs text-foreground-muted">{t("collection.subtitle")}</p>
            <UnlockedCollection
              language={userLanguage}
              onlyUnlocked
              sections={[
                { label: t("collection.affirmations"), emoji: "✨", items: unlocks.affirmations },
                { label: t("collection.insights"), emoji: "💡", items: unlocks.insights },
                { label: t("collection.reflections"), emoji: "🌿", items: unlocks.reflection_questions },
              ]}
            />
          </Card>

          <Card className="lg:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-foreground">{t("innerState.title")}</h2>
              {snapshot ? (
                <Chip tone="primary">{localizedSnapshot(snapshot, "current_focus", userLanguage) ?? t("innerState.defaultFocus")}</Chip>
              ) : null}
            </div>
            {snapshot ? (
              <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-5">
                {(() => {
                  const dimValue = (dim: (typeof DIMENSIONS)[number]) => dimValueOf(snapshot, dim.key);
                  const stackedLabel = (label: string) => {
                    const [first, ...rest] = label.split(" ");
                    if (rest.length === 0) return label;
                    return (
                      <>
                        {first}
                        <br />
                        {rest.join(" ")}
                      </>
                    );
                  };
                  const stat = (dim: (typeof DIMENSIONS)[number]) => {
                    const delta = dimDeltaOf(snapshot, dim.key);
                    const deltaTone = delta > 0 ? "text-success" : delta < 0 ? "text-danger" : "text-foreground-muted";
                    const deltaLabel = delta > 0 ? `+${delta}` : `${delta}`;
                    return (
                      <div key={dim.key} className="min-w-0">
                        <p className="flex items-start gap-1.5 text-[10px] font-semibold leading-snug text-foreground-muted min-h-[27.5px]">
                          <span className="mt-0.5 inline-block h-2 w-2 shrink-0 rounded-full" style={{ background: dim.color }} />
                          <span>{stackedLabel(dim.label)}</span>
                        </p>
                        <p className="flex items-baseline gap-1.5 font-display text-xl font-semibold text-foreground">
                          <span>{dimValue(dim)}</span>
                          <span className={`text-xs font-semibold ${deltaTone}`}>({deltaLabel})</span>
                        </p>
                      </div>
                    );
                  };
                  const left = [DIMENSIONS[0], DIMENSIONS[2]];
                  const right = [DIMENSIONS[1], DIMENSIONS[3]];
                  return (
                    <>
                      <div className="flex min-w-0 flex-col gap-4">{left.map(stat)}</div>
                      <ColourOfTheDay colourKey={recommendedColour.key} swatch={recommendedColour.swatch} size={92} />
                      <div className="flex min-w-0 flex-col items-end gap-4 text-right">{right.map(stat)}</div>
                    </>
                  );
                })()}
              </div>
            ) : (
              <p className="mt-3 text-sm text-foreground-muted">{t("innerState.empty")}</p>
            )}
            {snapshot ? (
              <p className="mt-4 text-sm text-foreground-muted">{localizedSnapshot(snapshot, "insight", userLanguage)}</p>
            ) : null}
          </Card>

          <Card className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-foreground">{t("latestInsight.title")}</h2>
              {latestReading ? (
                <Link href={`/inner-reading/${latestReading.id}/result`} className="text-sm font-semibold text-primary">
                  {t("latestInsight.viewFull")}
                </Link>
              ) : null}
            </div>
            {latestReading?.insight ? (
              <>
                <p className="text-2xl leading-none text-accent">&ldquo;</p>
                <p className="-mt-3 text-sm font-medium text-foreground">{latestReading.insight}</p>
                {latestReading.reflection_question ? (
                  <div className="mt-1 flex flex-col gap-1 border-t border-border pt-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-foreground-muted">
                      💡 {t("latestInsight.reflectionQuestion")}
                    </p>
                    <p className="text-sm text-foreground-muted">{latestReading.reflection_question}</p>
                  </div>
                ) : null}
              </>
            ) : (
              <p className="text-sm text-foreground-muted">{t("latestInsight.empty")}</p>
            )}
          </Card>

          <Card className="flex flex-col gap-3">
            <h2 className="font-display text-lg font-semibold text-foreground">{t("today.title")}</h2>
            <div className="flex items-center justify-between rounded-xl bg-surface-muted px-3 py-2.5">
              <span className="text-sm font-medium text-foreground">{t("today.checkIn")}</span>
              {checkedInToday ? <Chip tone="success">{t("today.done")}</Chip> : <Chip tone="neutral">{t("today.pending")}</Chip>}
            </div>
            {!checkedInToday ? (
              <Link href="/check-in/session">
                <Button fullWidth>{t("today.checkInNow")}</Button>
              </Link>
            ) : (
              <Link href="/check-in/history">
                <Button fullWidth variant="outline">{t("today.viewHistory")}</Button>
              </Link>
            )}
          </Card>

          <Card className="flex flex-col gap-3">
            <h2 className="font-display text-lg font-semibold text-foreground">{t("innerReading.title")}</h2>
            {latestReading ? (
              <p className="text-sm text-foreground-muted line-clamp-3">{latestReading.narrative}</p>
            ) : (
              <p className="text-sm text-foreground-muted">{t("innerReading.emptyFree")}</p>
            )}
            <Link href={latestReading ? `/inner-reading/${latestReading.id}/result` : "/inner-reading/session"}>
              <Button fullWidth variant="outline">
                {latestReading ? t("innerReading.viewLatest") : t("innerReading.startFree")}
              </Button>
            </Link>
            {atWeeklyLimit ? (
              <p className="text-xs text-foreground-muted">{t("innerReading.weeklyLimitReached")}</p>
            ) : null}
          </Card>

          <Card className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-foreground">{t("personality.title")}</h2>
              <Link href="/core-personality" className="text-sm font-semibold text-primary">
                {t("personality.viewProfile")}
              </Link>
            </div>
            {personality ? (
              <>
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-14 w-14 flex-none items-center justify-center rounded-full border border-border"
                    style={{ background: COLOUR_LIBRARY[topColourKey(personality)].swatch }}
                    aria-hidden
                  />
                  <div className="min-w-0">
                    <p className="truncate font-display text-base font-semibold text-foreground">
                      {localized(personality, "title", personalityLanguage)}
                    </p>
                    <p className="truncate text-xs text-foreground-muted">
                      {localized(personality, "subtitle", personalityLanguage)}
                    </p>
                  </div>
                </div>
                <p className="line-clamp-3 text-xs text-foreground-muted">
                  {localized(personality, "overview", personalityLanguage)}
                </p>
              </>
            ) : (
              <p className="text-sm text-foreground-muted">{t("personality.empty")}</p>
            )}
          </Card>

          <Card className="flex flex-col gap-3 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-foreground">{t("forYou.title")}</h2>
              <Link href="/colour-psychology" className="text-sm font-semibold text-primary">
                {t("forYou.seeAll")}
              </Link>
            </div>
            {recommendation ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {recommendation.items.slice(0, 3).map((item) => (
                  <ProductCard
                    key={`${item.type}-${item.rank}`}
                    language={userLanguage}
                    item={{
                      id: String(item.rank),
                      type: item.type as "COLOUR" | "ROUTINE" | "SCENT" | "WEARABLE" | "PRODUCT",
                      referenceId: item.reference_id,
                      title: item.title,
                      titleZh: item.title_zh,
                      reason: item.reason,
                      reasonZh: item.reason_zh,
                      rank: item.rank,
                      imageUrl: item.image_url ?? undefined,
                      price: item.price ?? undefined,
                      currency: item.currency,
                      destinationUrl: item.destination_url ?? undefined,
                    }}
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-foreground-muted">{t("forYou.empty")}</p>
            )}
          </Card>

          <Card className="flex flex-col gap-4 lg:col-span-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-lg font-semibold text-foreground">{t("trend.title")}</h2>
                <p className="text-xs text-foreground-muted">
                  {effectiveTrendPeriod === "weekly" ? t("trend.thisWeek") : t("trend.thisMonth")}
                </p>
              </div>
              <div className="flex items-center gap-1 rounded-full bg-surface-muted p-1">
                <button
                  type="button"
                  onClick={() => setTrendPeriod("weekly")}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                    effectiveTrendPeriod === "weekly" ? "bg-surface text-foreground shadow-sm" : "text-foreground-muted"
                  }`}
                >
                  {t("trend.weekly")}
                </button>
                <button
                  type="button"
                  onClick={() => (premium ? setTrendPeriod("monthly") : undefined)}
                  disabled={!premium}
                  title={premium ? undefined : t("trend.monthlyLocked")}
                  className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed ${
                    effectiveTrendPeriod === "monthly" ? "bg-surface text-foreground shadow-sm" : "text-foreground-muted"
                  }`}
                >
                  {!premium ? <span aria-hidden>🔒</span> : null}
                  {t("trend.monthly")}
                </button>
              </div>
            </div>
            <TrendChart points={trendPoints} series={trendSeries} dimensions={DIMENSIONS} />
            {!premium ? (
              <p className="text-xs text-foreground-muted">
                {t("trend.freeNotice")}{" "}
                <Link href="/membership" className="font-semibold text-primary">
                  {t("trend.upgrade")}
                </Link>{" "}
                {t("trend.upgradeSuffix")}
              </p>
            ) : null}
          </Card>

          <Card className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-foreground">{t("progress.title")}</h2>
              <Chip tone="gold">{t("progress.xp", { count: progress.xp_total })}</Chip>
            </div>
            <div className="flex items-center justify-between">
              <StreakFlame current={progress.streak.current} />
              <GardenIllustration stage={progress.garden.stage} size="sm" />
            </div>
            <div className="flex gap-1.5">
              {(["LOGIN", "CHECK_IN", "INNER_READING"] as const).map((q) => (
                <span
                  key={q}
                  className={`h-1.5 flex-1 rounded-full ${progress.quests_today.includes(q) ? "bg-primary" : "bg-surface-muted"}`}
                />
              ))}
            </div>
            <Link href="/progress">
              <Button fullWidth variant="outline">{t("progress.viewProgress")}</Button>
            </Link>
          </Card>

          <Card className="flex flex-col gap-3 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-foreground">{t("recentReadings.title")}</h2>
              <Link href="/inner-reading/history" className="text-sm font-semibold text-primary">
                {t("recentReadings.viewAll")}
              </Link>
            </div>
            {recentReadings.length > 0 ? (
              <div className="flex flex-col divide-y divide-border">
                {recentReadings.map((reading, i) => {
                  const created = new Date(reading.created_at);
                  return (
                    <Link key={reading.id} href={`/inner-reading/${reading.id}/result`}>
                      <div className="flex items-center gap-3 py-4">
                        <div className={`flex h-12 w-12 flex-none flex-col items-center justify-center rounded-xl ${DATE_BADGE_TONES[i % DATE_BADGE_TONES.length]}`}>
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
              <p className="text-sm text-foreground-muted">{t("recentReadings.empty")}</p>
            )}
            <Link href="/inner-reading/history" className="text-sm font-semibold text-primary">
              {t("recentReadings.exploreAll")}
            </Link>
          </Card>

          <Card className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-foreground">{t("journal.title")}</h2>
              <Link href="/journal" className="text-sm font-semibold text-primary">
                {t("journal.newEntry")}
              </Link>
            </div>
            <p className="text-sm text-foreground-muted">{t("journal.prompt")}</p>
            <textarea
              value={journalDraft}
              onChange={(e) => setJournalDraft(e.target.value)}
              placeholder={t("journal.placeholder")}
              rows={3}
              className="w-full resize-none rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-primary focus:outline-none"
            />
            <div className="flex items-center justify-between gap-3">
              <Link href="/journal" className="text-sm font-semibold text-primary">
                {t("journal.viewJournal")}
              </Link>
              <Button size="sm" disabled={!journalDraft.trim()} onClick={saveJournalDraft}>
                {justSaved ? t("journal.saved") : t("journal.savePrivately")}
              </Button>
            </div>
          </Card>

          {!premium ? (
            <Card className="flex flex-col gap-3 border-accent/40 bg-accent/5 lg:col-span-3">
              <h2 className="font-display text-lg font-semibold text-foreground">{t("premium.title")}</h2>
              <p className="text-sm text-foreground-muted">{t("premium.body")}</p>
              <Link href="/membership" className="w-full sm:w-auto">
                <Button variant="accent">{t("premium.viewPlans")}</Button>
              </Link>
            </Card>
          ) : null}
        </div>
      </AppShell>
    </>
  );
}
