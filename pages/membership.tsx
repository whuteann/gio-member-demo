import { useState } from "react";
import Head from "next/head";
import { useAppGuard } from "@/lib/useAppGuard";
import { useAppState } from "@/context/AppStateContext";
import type { BillingCycle } from "@/lib/types";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import Chip from "@/components/ui/Chip";
import Button from "@/components/ui/Button";

const PLANS: { cycle: BillingCycle; price: string; note: string }[] = [
  { cycle: "MONTHLY", price: "$12/mo", note: "Billed monthly, cancel anytime." },
  { cycle: "ANNUAL", price: "$96/yr", note: "Equivalent to $8/mo — save 33%." },
];

export default function MembershipPage() {
  const { settled, data } = useAppGuard();
  const { isPremiumActive, subscribe, cancelSubscription, reactivateSubscription } = useAppState();
  const [cycle, setCycle] = useState<BillingCycle>("ANNUAL");
  const [processing, setProcessing] = useState(false);

  if (!settled || !data) return null;

  const sub = data.subscription;

  function handleSubscribe() {
    setProcessing(true);
    setTimeout(() => {
      subscribe(cycle);
      setProcessing(false);
    }, 900);
  }

  return (
    <>
      <Head><title>Membership — Gio</title></Head>
      <AppShell title="Membership">
        <div className="mx-auto flex max-w-lg flex-col gap-5">
          <Card className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-foreground-muted">Current plan</p>
              <p className="font-display text-2xl font-semibold text-foreground">
                {sub.plan === "PREMIUM" ? "Premium" : "Free"}
              </p>
              {sub.status === "CANCELLED" && sub.expiresAt ? (
                <p className="mt-1 text-xs text-foreground-muted">
                  Cancels on {new Date(sub.expiresAt).toLocaleDateString()}
                </p>
              ) : sub.plan === "PREMIUM" && sub.renewsAt ? (
                <p className="mt-1 text-xs text-foreground-muted">
                  Renews {new Date(sub.renewsAt).toLocaleDateString()}
                </p>
              ) : null}
            </div>
            <Chip tone={isPremiumActive ? "gold" : "neutral"}>{sub.status}</Chip>
          </Card>

          {!sub.firstFreeReadingConsumedAt ? (
            <Card>
              <p className="text-sm text-foreground-muted">
                Your first Inner Reading is still free and hasn’t been used yet.
              </p>
            </Card>
          ) : null}

          {isPremiumActive ? (
            <Card className="flex flex-col gap-3">
              <h2 className="font-display text-lg font-semibold text-foreground">Manage subscription</h2>
              {sub.status === "CANCELLED" ? (
                <Button onClick={reactivateSubscription}>Reactivate Premium</Button>
              ) : (
                <Button variant="outline" onClick={cancelSubscription}>Cancel subscription</Button>
              )}
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                {PLANS.map((plan) => (
                  <button
                    key={plan.cycle}
                    onClick={() => setCycle(plan.cycle)}
                    className={`rounded-2xl border p-4 text-left transition-colors ${
                      cycle === plan.cycle ? "border-primary bg-primary/5" : "border-border bg-surface"
                    }`}
                  >
                    <p className="text-xs font-semibold uppercase tracking-wide text-foreground-muted">
                      {plan.cycle === "MONTHLY" ? "Monthly" : "Annual"}
                    </p>
                    <p className="font-display text-xl font-semibold text-foreground">{plan.price}</p>
                    <p className="mt-1 text-xs text-foreground-muted">{plan.note}</p>
                  </button>
                ))}
              </div>
              <Card className="flex flex-col gap-2">
                <h3 className="font-display text-base font-semibold text-foreground">Premium includes</h3>
                <ul className="flex flex-col gap-1.5 text-sm text-foreground-muted">
                  <li>• Unlimited Inner Readings</li>
                  <li>• Full check-in & reading history</li>
                  <li>• Full Core Personality detail + recalibration</li>
                  <li>• Full history-aware recommendations</li>
                  <li>• Full badges, quests and eligible rewards</li>
                </ul>
              </Card>
              <Button size="lg" disabled={processing} onClick={handleSubscribe}>
                {processing ? "Processing payment…" : `Subscribe · ${PLANS.find((p) => p.cycle === cycle)?.price}`}
              </Button>
              <p className="text-center text-xs text-foreground-muted">
                Demo checkout — no real payment is processed.
              </p>
            </>
          )}
        </div>
      </AppShell>
    </>
  );
}
