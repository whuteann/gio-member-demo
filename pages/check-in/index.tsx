import Head from "next/head";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { useAuthGuard } from "@/lib/useAuthGuard";
import { useApiResource } from "@/lib/useApiResource";
import { useLanguage } from "@/lib/useLanguage";
import { listCheckIns } from "@/lib/api/reflections";
import { addDays, localDateString, weekStartString } from "@/lib/gamification";
import AppShell from "@/components/layout/AppShell";
import Chip from "@/components/ui/Chip";

export default function CheckInHubPage() {
  const { settled, token } = useAuthGuard();
  const { t } = useTranslation("checkIn");
  const { language } = useLanguage();
  const dateLocale = language === "zh" ? "zh-CN" : "en-US";
  const { data: sessions, loading } = useApiResource(token ? () => listCheckIns(token) : null, [token]);

  if (!settled || !token) return null;
  if (loading || !sessions) {
    return (
      <AppShell>
        <p className="text-sm text-foreground-muted">{t("loading")}</p>
      </AppShell>
    );
  }

  const completed = sessions
    .filter((session) => session.status === "COMPLETED" && session.completed_at)
    .sort((a, b) => b.completed_at!.localeCompare(a.completed_at!));
  const today = localDateString();
  const completedDays = new Set(completed.map((session) => localDateString(new Date(session.completed_at!))));
  const checkedInToday = completedDays.has(today);
  const weekStart = weekStartString(today);
  const dayLabels = t("week.days", { returnObjects: true }) as string[];
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = addDays(weekStart, index);
    return { date, done: completedDays.has(date) };
  });

  return (
    <>
      <Head><title>{t("meta.title")}</title></Head>
      <AppShell>
        <div className="mx-auto max-w-4xl">
          <header>
            <h1 className="font-display text-2xl font-semibold text-foreground lg:text-3xl">{t("header.title")}</h1>
            <p className="mt-2 text-sm text-foreground-muted">{t("header.subtitle")}</p>
          </header>

          <section className="mt-8" aria-labelledby="begin-check-in">
            <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_240px] md:items-center md:gap-10">
              <div className="rounded-[1.75rem] border border-border bg-white p-6 shadow-[0_10px_30px_-18px_rgba(38,43,33,0.35)] sm:p-8">
                <p className="mb-3 text-xs font-semibold text-primary">{checkedInToday ? t("hero.eyebrowDone") : t("hero.eyebrowPending")}</p>
                <h2 id="begin-check-in" className="font-display text-2xl font-semibold text-foreground">{checkedInToday ? t("hero.titleDone") : t("hero.titlePending")}</h2>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-foreground-muted">{t("hero.body")}</p>
                <div className="mt-6 flex flex-wrap items-center gap-4">
                  <Link href="/check-in/session" className="inline-flex items-center justify-center gap-3 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
                    {checkedInToday ? t("hero.ctaAgain") : t("hero.ctaBegin")}<span aria-hidden="true">&rarr;</span>
                  </Link>
                  <span className="text-xs text-foreground-muted">{t("hero.meta")}</span>
                </div>
              </div>

              <div className="border-t border-border pt-6 md:border-l md:border-t-0 md:pl-8 md:pt-0">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold text-foreground">{t("week.title")}</h3>
                  <span className="text-xs text-foreground-muted">{t("week.count", { count: days.filter((day) => day.done).length })}</span>
                </div>
                <div className="mt-4 grid grid-cols-7 gap-1">
                  {days.map((day, index) => (
                    <div
                      key={day.date}
                      className="flex min-w-0 flex-col items-center gap-2"
                      aria-label={`${day.date}${day.date === today ? t("week.ariaToday") : ""}: ${day.done ? t("week.ariaCompleted") : t("week.ariaPending")}`}
                    >
                      <span className="text-[10px] text-foreground-muted">{dayLabels[index]}</span>
                      <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${day.done ? "bg-primary text-primary-foreground" : day.date === today ? "border border-primary bg-surface text-primary" : "bg-surface-muted text-foreground-muted"}`} aria-hidden="true">{day.done ? "✓" : "·"}</span>
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-xs leading-relaxed text-foreground-muted">{checkedInToday ? t("week.footerDone") : t("week.footerPending")}</p>
              </div>
            </div>
          </section>

          <section className="mt-8" aria-labelledby="recent-check-ins">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 id="recent-check-ins" className="font-display text-lg font-semibold text-foreground">{t("recent.title")}</h2>
              <Link href="/check-in/history" className="text-sm font-semibold text-primary hover:underline">{t("recent.viewHistory")} <span aria-hidden="true">&rarr;</span></Link>
            </div>
            {completed.length ? (
              <ul className="mt-3 divide-y divide-border">
                {completed.slice(0, 3).map((session) => {
                  const date = new Date(session.completed_at!);
                  return (
                    <li key={session.id}>
                      <Link
                        href={`/check-in/${session.id}/result`}
                        className="flex items-center gap-3 py-4 transition-opacity hover:opacity-80"
                      >
                        <div className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-surface-muted text-lg" aria-hidden>
                          {session.emoji}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="truncate text-sm font-semibold text-foreground">{(language === "zh" ? session.title_zh : session.title) ?? session.title ?? (localDateString(date) === today ? t("recent.today") : date.toLocaleDateString(dateLocale, { weekday: "short", month: "short", day: "numeric" }))}</p>
                            {session.category ? <Chip tone="neutral">{session.category}</Chip> : null}
                          </div>
                          <p className="line-clamp-2 text-xs text-foreground-muted">{(language === "zh" ? session.subtitle_zh : session.subtitle) ?? session.subtitle ?? session.summary ?? t("recent.questionsAnswered", { count: session.answers.length })}</p>
                        </div>
                        <div className="flex flex-none flex-col items-end gap-1 text-foreground-muted">
                          <span className="text-xs">{date.toLocaleTimeString(dateLocale, { hour: "numeric", minute: "2-digit" })}</span>
                          <span aria-hidden="true">&rsaquo;</span>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="mt-3 border-b border-border py-8">
                <p className="text-sm font-medium text-foreground">{t("recent.emptyTitle")}</p>
                <p className="mt-2 text-sm text-foreground-muted">{t("recent.emptyBody")}</p>
              </div>
            )}
          </section>
        </div>
      </AppShell>
    </>
  );
}
