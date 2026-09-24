import Head from "next/head";
import Link from "next/link";
import { useAuthGuard } from "@/lib/useAuthGuard";
import { useApiResource } from "@/lib/useApiResource";
import { INNER_READING_WEEKLY_FREE_LIMIT, isPremiumActive, readingsUsedThisWeek } from "@/lib/api/entitlement";
import { listInnerReadings } from "@/lib/api/reflections";
import { localDateString } from "@/lib/gamification";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import Chip from "@/components/ui/Chip";

export default function InnerReadingHistoryPage() {
  const { settled, token, subscription } = useAuthGuard();
  const premium = subscription ? isPremiumActive(subscription) : false;

  const { data: readings, loading } = useApiResource(token ? () => listInnerReadings(token) : null, [token]);
  const atWeeklyLimit = !premium && !!readings && readingsUsedThisWeek(readings) >= INNER_READING_WEEKLY_FREE_LIMIT;

  if (!settled || !token) return null;
  if (loading || !readings) {
    return (
      <AppShell title="Inner Reading History">
        <p className="text-sm text-foreground-muted">Loading your reading history…</p>
      </AppShell>
    );
  }

  return (
    <>
      <Head><title>Inner Reading History — Gio</title></Head>
      <AppShell title="Inner Reading History">
        <div className="flex flex-col gap-3">
          <Link href="/inner-reading/session" className="self-start">
            <Chip tone={atWeeklyLimit ? "gold" : "primary"}>
              {atWeeklyLimit ? "🔒 New reading (Premium)" : "+ New Inner Reading"}
            </Chip>
          </Link>
          {readings.length === 0 ? (
            <Card><p className="text-sm text-foreground-muted">No readings yet.</p></Card>
          ) : (
            readings.map((reading) => {
              const today = localDateString();
              const date = reading.completed_at ? new Date(reading.completed_at) : null;
              return (
                <Link key={reading.id} href={`/inner-reading/${reading.id}/result`}>
                  <Card className="flex items-center gap-3 transition-shadow hover:shadow-[0_10px_30px_-18px_rgba(38,43,33,0.4)]">
                    <div className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-surface-muted text-lg" aria-hidden>
                      {reading.emoji}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-semibold text-foreground">{reading.title}</p>
                        <Chip tone="neutral">{reading.category}</Chip>
                      </div>
                      <p className="line-clamp-1 text-xs text-foreground-muted">{reading.subtitle}</p>
                    </div>
                    <div className="flex flex-none flex-col items-end gap-1 text-foreground-muted">
                      <span className="text-xs">
                        {date ? (localDateString(date) === today ? "Today" : date.toLocaleDateString(undefined, { month: "short", day: "numeric" })) : "—"}
                      </span>
                      <span aria-hidden>›</span>
                    </div>
                  </Card>
                </Link>
              );
            })
          )}
        </div>
      </AppShell>
    </>
  );
}
