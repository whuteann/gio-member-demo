import Head from "next/head";
import Link from "next/link";
import { useAuthGuard } from "@/lib/useAuthGuard";
import { useApiResource } from "@/lib/useApiResource";
import { listCheckIns } from "@/lib/api/reflections";
import { addDays, localDateString, weekStartString } from "@/lib/gamification";
import AppShell from "@/components/layout/AppShell";

export default function CheckInHubPage() {
  const { settled, token } = useAuthGuard();
  const { data: sessions, loading } = useApiResource(token ? () => listCheckIns(token) : null, [token]);

  if (!settled || !token) return null;
  if (loading || !sessions) {
    return (
      <AppShell>
        <p className="text-sm text-foreground-muted">Loading your check-ins…</p>
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
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = addDays(weekStart, index);
    return { date, done: completedDays.has(date) };
  });

  return (
    <>
      <Head><title>Emotional Check-In — Gio</title></Head>
      <AppShell>
        <div className="mx-auto max-w-4xl">
          <header>
            <h1 className="font-display text-2xl font-semibold text-foreground lg:text-3xl">Emotional Check-In</h1>
            <p className="mt-2 text-sm text-foreground-muted">A little space to notice how you feel today.</p>
          </header>

          <section className="mt-8" aria-labelledby="begin-check-in">
            <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_240px] md:items-center md:gap-10">
              <div className="rounded-[1.75rem] border border-border bg-white p-6 shadow-[0_10px_30px_-18px_rgba(38,43,33,0.35)] sm:p-8">
                <p className="mb-3 text-xs font-semibold text-primary">{checkedInToday ? "You've made time for yourself today" : "Your daily moment of reflection"}</p>
                <h2 id="begin-check-in" className="font-display text-2xl font-semibold text-foreground">{checkedInToday ? "How are you feeling now?" : "How are you feeling today?"}</h2>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-foreground-muted">Pause for a moment. Notice your energy, your thoughts, and what you need. Every feeling has a place here.</p>
                <div className="mt-6 flex flex-wrap items-center gap-4">
                  <Link href="/check-in/session" className="inline-flex items-center justify-center gap-3 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
                    {checkedInToday ? "Check In Again" : "Begin Check-In"}<span aria-hidden="true">&rarr;</span>
                  </Link>
                  <span className="text-xs text-foreground-muted">4 questions · About 1 minute</span>
                </div>
              </div>

              <div className="border-t border-border pt-6 md:border-l md:border-t-0 md:pl-8 md:pt-0">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold text-foreground">This week</h3>
                  <span className="text-xs text-foreground-muted">{days.filter((day) => day.done).length} / 7 days</span>
                </div>
                <div className="mt-4 grid grid-cols-7 gap-1">
                  {days.map((day, index) => (
                    <div key={day.date} className="flex min-w-0 flex-col items-center gap-2" aria-label={`${day.date}${day.date === today ? ", today" : ""}: ${day.done ? "completed" : "no check-in"}`}>
                      <span className="text-[10px] text-foreground-muted">{["M", "T", "W", "T", "F", "S", "S"][index]}</span>
                      <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${day.done ? "bg-primary text-primary-foreground" : day.date === today ? "border border-primary bg-surface text-primary" : "bg-surface-muted text-foreground-muted"}`} aria-hidden="true">{day.done ? "✓" : "·"}</span>
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-xs leading-relaxed text-foreground-muted">{checkedInToday ? "Today's check-in is complete. Come back whenever you need a moment." : "One small pause, at your own pace."}</p>
              </div>
            </div>
          </section>

          <section className="mt-8" aria-labelledby="recent-check-ins">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 id="recent-check-ins" className="font-display text-lg font-semibold text-foreground">Recent Check-Ins</h2>
              <Link href="/check-in/history" className="text-sm font-semibold text-primary hover:underline">View history <span aria-hidden="true">&rarr;</span></Link>
            </div>
            {completed.length ? (
              <ul className="mt-3 divide-y divide-border">
                {completed.slice(0, 3).map((session) => {
                  const date = new Date(session.completed_at!);
                  return (
                    <li key={session.id}>
                      <Link
                        href={`/check-in/${session.id}/result`}
                        className="flex items-start justify-between gap-4 py-5 transition-opacity hover:opacity-80"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-foreground">{localDateString(date) === today ? "Today" : date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}</p>
                          <p className="mt-1 text-xs leading-relaxed text-foreground-muted">{session.summary ?? `${session.answers.length} questions answered`}</p>
                        </div>
                        <div className="flex flex-none items-center gap-2 text-right">
                          <div>
                            <p className="text-xs text-foreground-muted">{date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}</p>
                            <p className="mt-1 text-xs font-medium text-primary">Completed</p>
                          </div>
                          <span aria-hidden="true" className="text-foreground-muted">&rsaquo;</span>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="mt-3 border-b border-border py-8">
                <p className="text-sm font-medium text-foreground">Your first moment starts here.</p>
                <p className="mt-2 text-sm text-foreground-muted">Your completed check-ins will appear here as your journey unfolds.</p>
              </div>
            )}
          </section>
        </div>
      </AppShell>
    </>
  );
}
