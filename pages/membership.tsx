import { useState } from "react";
import Head from "next/head";
import { useAuthGuard } from "@/lib/useAuthGuard";
import { useApiResource } from "@/lib/useApiResource";
import { useAppDispatch } from "@/store/hooks";
import { setSubscription } from "@/store/authSlice";
import { isPremiumActive } from "@/lib/api/entitlement";
import {
  cancelSubscription,
  checkoutSubscription,
  listSubscriptionPayments,
  reactivateSubscription,
  startTrial,
} from "@/lib/api/subscription";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import Chip from "@/components/ui/Chip";
import Button from "@/components/ui/Button";

type BillingCycle = "MONTHLY" | "YEARLY";

const PRICING: Record<BillingCycle, { label: string; price: string; note: string }> = {
  MONTHLY: { label: "Monthly", price: "RM19.90", note: "Billed monthly." },
  YEARLY: { label: "Yearly", price: "RM191.04", note: "Billed once a year." },
};

function daysUntil(iso: string): number {
  return Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / (24 * 60 * 60 * 1000)));
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export default function MembershipPage() {
  const { settled, token, subscription } = useAuthGuard();
  const dispatch = useAppDispatch();
  const [processing, setProcessing] = useState(false);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("MONTHLY");

  const { data: payments } = useApiResource(token ? () => listSubscriptionPayments(token) : null, [token]);

  if (!settled || !token || !subscription) return null;

  const sub = subscription;
  const premium = isPremiumActive(sub);
  const trialActive = !!sub.trial_ends_at && new Date(sub.trial_ends_at) > new Date();
  const paidPremium = sub.plan === "PREMIUM";
  const trialAvailable = !paidPremium && !sub.trial_ends_at;

  async function handleStartTrial() {
    if (!token) return;
    setProcessing(true);
    try {
      const updated = await startTrial(token);
      dispatch(setSubscription(updated));
    } finally {
      setProcessing(false);
    }
  }

  async function handleSubscribe() {
    if (!token) return;
    setProcessing(true);
    try {
      const result = await checkoutSubscription(token, billingCycle);
      window.location.href = result.invoice_url;
    } catch {
      setProcessing(false);
    }
  }

  async function handleCancel() {
    if (!token) return;
    const updated = await cancelSubscription(token);
    dispatch(setSubscription(updated));
  }

  async function handleReactivate() {
    if (!token) return;
    const updated = await reactivateSubscription(token);
    dispatch(setSubscription(updated));
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
                {sub.plan === "PREMIUM" ? "Premium" : trialActive ? "Free trial" : "Free"}
              </p>
              {sub.status === "CANCELLED" && sub.expires_at ? (
                <p className="mt-1 text-xs text-foreground-muted">
                  Cancels on {new Date(sub.expires_at).toLocaleDateString()}
                </p>
              ) : sub.plan === "PREMIUM" && sub.renews_at ? (
                <p className="mt-1 text-xs text-foreground-muted">
                  Expires {new Date(sub.renews_at).toLocaleDateString()}
                </p>
              ) : trialActive && sub.trial_ends_at ? (
                <p className="mt-1 text-xs text-foreground-muted">
                  Trial ends in {daysUntil(sub.trial_ends_at)} day{daysUntil(sub.trial_ends_at) === 1 ? "" : "s"}
                </p>
              ) : null}
            </div>
            <Chip tone={premium ? "gold" : "neutral"}>{trialActive ? "TRIAL" : sub.status}</Chip>
          </Card>

          {!premium ? (
            <Card>
              <p className="text-sm text-foreground-muted">
                Free plan includes 3 Inner Readings per 7 days and 7 days of check-in history.
              </p>
            </Card>
          ) : null}

          {paidPremium ? (
            <Card className="flex flex-col gap-3">
              <h2 className="font-display text-lg font-semibold text-foreground">Manage subscription</h2>
              {sub.status === "CANCELLED" ? (
                <Button onClick={handleReactivate}>Reactivate Premium</Button>
              ) : (
                <Button variant="outline" onClick={handleCancel}>Cancel subscription</Button>
              )}
            </Card>
          ) : (
            <>
              <Card className="flex flex-col gap-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-foreground-muted">Premium</p>
                <div className="flex gap-2">
                  {(Object.keys(PRICING) as BillingCycle[]).map((cycle) => (
                    <button
                      key={cycle}
                      type="button"
                      onClick={() => setBillingCycle(cycle)}
                      className={`flex-1 rounded-xl border px-3 py-2 text-sm font-semibold transition-colors ${
                        billingCycle === cycle
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-surface text-foreground hover:bg-surface-muted"
                      }`}
                    >
                      {PRICING[cycle].label}
                      {cycle === "YEARLY" ? <span className="ml-1 text-xs font-normal opacity-80">-20%</span> : null}
                    </button>
                  ))}
                </div>
                <div>
                  <p className="font-display text-2xl font-semibold text-foreground">{PRICING[billingCycle].price}</p>
                  <p className="text-xs text-foreground-muted">{PRICING[billingCycle].note}</p>
                </div>
              </Card>
              <Card className="flex flex-col gap-2">
                <h3 className="font-display text-base font-semibold text-foreground">Premium includes</h3>
                <ul className="flex flex-col gap-1.5 text-sm text-foreground-muted">
                  <li>• Unlimited Inner Readings</li>
                  <li>• Full check-in & reading history</li>
                  <li>• In-depth colour reasoning + your colour history</li>
                  <li>• In-depth Inner Reading — work, relationships, personal growth, conflict management</li>
                  <li>• Monthly progress trends</li>
                </ul>
              </Card>
              {trialActive ? null : trialAvailable ? (
                <Button size="lg" variant="outline" disabled={processing} onClick={handleStartTrial}>
                  {processing ? "Starting…" : "Start 7-day free trial"}
                </Button>
              ) : null}
              <Button size="lg" disabled={processing} onClick={handleSubscribe}>
                {processing ? "Redirecting to payment…" : `Subscribe · ${PRICING[billingCycle].price}`}
              </Button>
              <p className="text-center text-xs text-foreground-muted">
                You&apos;ll be redirected to Xendit to complete payment securely.
              </p>
            </>
          )}

          {payments && payments.length > 0 ? (
            <Card className="flex flex-col gap-3">
              <div className="flex items-center justify-between print:hidden">
                <h2 className="font-display text-lg font-semibold text-foreground">Billing history</h2>
                <Button variant="outline" size="sm" onClick={() => window.print()}>Print</Button>
              </div>
              <div className="flex flex-col divide-y divide-border">
                {payments.map((p) => (
                  <div key={p.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                    <div>
                      <p className="font-medium text-foreground">{formatDate(p.created_at)}</p>
                      <p className="text-xs text-foreground-muted">
                        {p.billing_cycle === "YEARLY" ? "Yearly" : "Monthly"} · {p.currency} {p.amount.toFixed(2)} · {p.status}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 print:hidden">
                      <Chip tone={p.status === "COMPLETED" ? "success" : p.status === "PENDING" ? "neutral" : "danger"}>
                        {p.status}
                      </Chip>
                      {p.invoice_url ? (
                        <a href={p.invoice_url} target="_blank" rel="noreferrer" className="text-xs font-semibold text-primary">
                          Invoice
                        </a>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ) : null}
        </div>
      </AppShell>
    </>
  );
}
