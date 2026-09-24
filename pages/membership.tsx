import { useState } from "react";
import Head from "next/head";
import { useAuthGuard } from "@/lib/useAuthGuard";
import { useAppDispatch } from "@/store/hooks";
import { setSubscription } from "@/store/authSlice";
import { isPremiumActive } from "@/lib/api/entitlement";
import { cancelSubscription, reactivateSubscription, startTrial, subscribe } from "@/lib/api/subscription";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import Chip from "@/components/ui/Chip";
import Button from "@/components/ui/Button";

const PLAN = { price: "RM19.90/mo", note: "Billed monthly, cancel anytime." };

function daysUntil(iso: string): number {
  return Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / (24 * 60 * 60 * 1000)));
}

export default function MembershipPage() {
  const { settled, token, subscription } = useAuthGuard();
  const dispatch = useAppDispatch();
  const [processing, setProcessing] = useState(false);

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
      const updated = await subscribe(token);
      dispatch(setSubscription(updated));
    } finally {
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
                  Renews {new Date(sub.renews_at).toLocaleDateString()}
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
              <Card className="flex flex-col gap-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-foreground-muted">Premium</p>
                <p className="font-display text-2xl font-semibold text-foreground">{PLAN.price}</p>
                <p className="text-xs text-foreground-muted">{PLAN.note}</p>
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
                {processing ? "Processing payment…" : `Subscribe · ${PLAN.price}`}
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
