import Head from "next/head";
import Link from "next/link";
import { useAppGuard } from "@/lib/useAppGuard";
import { historyLimit } from "@/lib/entitlement";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import Chip from "@/components/ui/Chip";
import EntitlementGate from "@/components/ui/EntitlementGate";

export default function CheckInHistoryPage() {
  const { settled, data } = useAppGuard();
  if (!settled || !data) return null;

  const sorted = [...data.checkIns].sort((a, b) => (b.completedAt ?? "").localeCompare(a.completedAt ?? ""));
  const limit = historyLimit(data.subscription, sorted.length, 5);
  const visible = sorted.slice(0, limit);
  const hiddenCount = sorted.length - visible.length;

  return (
    <>
      <Head><title>Check-In History — Gio</title></Head>
      <AppShell title="Check-In History">
        <div className="flex flex-col gap-3">
          <Link href="/check-in" className="self-start">
            <Chip tone="primary">+ New Check-In</Chip>
          </Link>
          {visible.length === 0 ? (
            <Card><p className="text-sm text-foreground-muted">No check-ins yet.</p></Card>
          ) : (
            visible.map((session) => {
              const dims = ["emotional_energy", "mental_clarity", "inner_pressure", "grounding"] as const;
              return (
                <Card key={session.id} className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {session.completedAt ? new Date(session.completedAt).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" }) : "—"}
                    </p>
                    <p className="text-xs text-foreground-muted">
                      {session.questions.length} questions · {session.source === "WHATSAPP" ? "via WhatsApp" : "via Web"}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    {dims.map((d) => {
                      const q = session.questions.find((x) => x.dimension === d);
                      return q ? (
                        <span key={d} className="rounded-full bg-surface-muted px-2 py-1 text-[10px] font-semibold text-foreground-muted">
                          {q.normalizedValue}
                        </span>
                      ) : null;
                    })}
                  </div>
                </Card>
              );
            })
          )}
          {hiddenCount > 0 ? (
            <EntitlementGate
              title="More history with Premium"
              description={`${hiddenCount} earlier check-ins are hidden on the Free plan.`}
            />
          ) : null}
        </div>
      </AppShell>
    </>
  );
}
