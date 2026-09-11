import Head from "next/head";
import Link from "next/link";
import { useAppGuard } from "@/lib/useAppGuard";
import { historyLimit, innerReadingGate } from "@/lib/entitlement";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import Chip from "@/components/ui/Chip";
import Button from "@/components/ui/Button";
import EntitlementGate from "@/components/ui/EntitlementGate";

export default function InnerReadingHistoryPage() {
  const { settled, data } = useAppGuard();
  if (!settled || !data) return null;

  const sorted = [...data.innerReadings].sort((a, b) => (b.completedAt ?? "").localeCompare(a.completedAt ?? ""));
  const limit = historyLimit(data.subscription, sorted.length, 3);
  const visible = sorted.slice(0, limit);
  const hiddenCount = sorted.length - visible.length;
  const gate = innerReadingGate(data.subscription);

  return (
    <>
      <Head><title>Inner Reading History — Gio</title></Head>
      <AppShell title="Inner Reading History">
        <div className="flex flex-col gap-3">
          <Link href="/inner-reading/session" className="self-start">
            <Chip tone={gate === "MEMBERSHIP_GATE" ? "gold" : "primary"}>
              {gate === "MEMBERSHIP_GATE" ? "🔒 New reading (Premium)" : "+ New Inner Reading"}
            </Chip>
          </Link>
          {visible.length === 0 ? (
            <Card><p className="text-sm text-foreground-muted">No readings yet.</p></Card>
          ) : (
            visible.map((reading) => (
              <Link key={reading.id} href={`/inner-reading/${reading.id}/result`}>
                <Card className="flex items-center justify-between gap-4 transition-shadow hover:shadow-[0_10px_30px_-18px_rgba(38,43,33,0.4)]">
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {reading.completedAt ? new Date(reading.completedAt).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" }) : "—"}
                    </p>
                    <p className="mt-0.5 line-clamp-1 text-xs text-foreground-muted">{reading.narrative}</p>
                  </div>
                  <Button variant="ghost" size="sm">View</Button>
                </Card>
              </Link>
            ))
          )}
          {hiddenCount > 0 ? (
            <EntitlementGate
              title="More history with Premium"
              description={`${hiddenCount} earlier readings are hidden on the Free plan.`}
            />
          ) : null}
        </div>
      </AppShell>
    </>
  );
}
