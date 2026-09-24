import Head from "next/head";
import Link from "next/link";
import { useAuthGuard } from "@/lib/useAuthGuard";
import { useApiResource } from "@/lib/useApiResource";
import { isPremiumActive } from "@/lib/api/entitlement";
import { listCheckIns } from "@/lib/api/reflections";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import Chip from "@/components/ui/Chip";
import EntitlementGate from "@/components/ui/EntitlementGate";

const DIMS = ["emotional_energy", "mental_clarity", "inner_pressure", "grounding"] as const;

export default function CheckInHistoryPage() {
  const { settled, token, subscription } = useAuthGuard();
  const premium = subscription ? isPremiumActive(subscription) : false;

  const { data: sessions, loading } = useApiResource(token ? () => listCheckIns(token) : null, [token]);

  if (!settled || !token) return null;
  if (loading || !sessions) {
    return (
      <AppShell title="Check-In History">
        <p className="text-sm text-foreground-muted">Loading your check-in history…</p>
      </AppShell>
    );
  }

  return (
    <>
      <Head><title>Check-In History — Gio</title></Head>
      <AppShell title="Check-In History">
        <div className="flex flex-col gap-3">
          <Link href="/check-in/session" className="self-start">
            <Chip tone="primary">+ New Check-In</Chip>
          </Link>
          {sessions.length === 0 ? (
            <Card><p className="text-sm text-foreground-muted">No check-ins yet.</p></Card>
          ) : (
            sessions.map((session) => (
              <Link key={session.id} href={`/check-in/${session.id}/result`}>
                <Card className="flex items-center justify-between gap-4 transition-opacity hover:opacity-80">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">
                      {session.completed_at ? new Date(session.completed_at).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" }) : "—"}
                    </p>
                    <p className="truncate text-xs text-foreground-muted">{session.summary ?? `${session.answers.length} questions`}</p>
                  </div>
                  <div className="flex flex-none items-center gap-2">
                    <div className="flex gap-1">
                      {DIMS.map((d) => {
                        const q = session.answers.find((x) => x.dimension === d);
                        return q ? (
                          <span key={d} className="rounded-full bg-surface-muted px-2 py-1 text-[10px] font-semibold text-foreground-muted">
                            {q.normalized_value}
                          </span>
                        ) : null;
                      })}
                    </div>
                    <span aria-hidden="true" className="text-foreground-muted">&rsaquo;</span>
                  </div>
                </Card>
              </Link>
            ))
          )}
          {!premium ? (
            <EntitlementGate
              title="More history with Premium"
              description="Free shows check-ins from the last 7 days — Premium unlocks your full history."
            />
          ) : null}
        </div>
      </AppShell>
    </>
  );
}
