import { useState } from "react";
import Head from "next/head";
import { useTranslation } from "react-i18next";
import { useAuthGuard } from "@/lib/useAuthGuard";
import { useApiResource } from "@/lib/useApiResource";
import { useLanguage } from "@/lib/useLanguage";
import { useAppDispatch } from "@/store/hooks";
import { setSubscription } from "@/store/authSlice";
import { isPremiumActive } from "@/lib/api/entitlement";
import {
  cancelSubscription,
  checkoutSubscription,
  listSubscriptionPayments,
  openInvoicePdf,
  reactivateSubscription,
  startTrial,
} from "@/lib/api/subscription";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import Chip from "@/components/ui/Chip";
import Button from "@/components/ui/Button";

type BillingCycle = "MONTHLY" | "YEARLY";

const PRICING: Record<BillingCycle, { price: string }> = {
  MONTHLY: { price: "RM19.90" },
  YEARLY: { price: "RM191.04" },
};

function daysUntil(iso: string): number {
  return Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / (24 * 60 * 60 * 1000)));
}

export default function MembershipPage() {
  const { settled, token, subscription } = useAuthGuard();
  const { t } = useTranslation("membership");
  const { language } = useLanguage();
  const dateLocale = language === "zh" ? "zh-CN" : "en-US";
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
  const formatDate = (iso: string) => new Date(iso).toLocaleDateString(dateLocale, { year: "numeric", month: "short", day: "numeric" });
  const statusLabel = (status: string) => t(`status.${status}`, { defaultValue: status });
  const cycleLabel = (cycle: BillingCycle) => (cycle === "MONTHLY" ? t("pricing.monthly") : t("pricing.yearly"));
  const cycleNote = (cycle: BillingCycle) => (cycle === "MONTHLY" ? t("pricing.monthlyNote") : t("pricing.yearlyNote"));

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

  function handleViewInvoice(paymentId: string) {
    if (!token) return;
    // Opened synchronously, before the PDF fetch, so browsers don't block
    // it as a popup — openInvoicePdf redirects this tab once the blob is ready.
    const tab = window.open("", "_blank");
    void openInvoicePdf(token, paymentId, tab);
  }

  return (
    <>
      <Head><title>{t("title")} — Gio</title></Head>
      <AppShell title={t("title")}>
        <div className="mx-auto flex max-w-lg flex-col gap-5">
          <Card className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-foreground-muted">{t("currentPlan")}</p>
              <p className="font-display text-2xl font-semibold text-foreground">
                {sub.plan === "PREMIUM" ? t("plan.premium") : trialActive ? t("plan.trial") : t("plan.free")}
              </p>
              {sub.status === "CANCELLED" && sub.expires_at ? (
                <p className="mt-1 text-xs text-foreground-muted">
                  {t("cancelsOn", { date: formatDate(sub.expires_at) })}
                </p>
              ) : sub.plan === "PREMIUM" && sub.renews_at ? (
                <p className="mt-1 text-xs text-foreground-muted">
                  {t("expires", { date: formatDate(sub.renews_at) })}
                </p>
              ) : trialActive && sub.trial_ends_at ? (
                <p className="mt-1 text-xs text-foreground-muted">
                  {t("trialEnds", { count: daysUntil(sub.trial_ends_at) })}
                </p>
              ) : null}
            </div>
            <Chip tone={premium ? "gold" : "neutral"}>{trialActive ? t("status.TRIAL") : statusLabel(sub.status)}</Chip>
          </Card>

          {!premium ? (
            <Card>
              <p className="text-sm text-foreground-muted">
                {t("freeNotice")}
              </p>
            </Card>
          ) : null}

          {paidPremium ? (
            <Card className="flex flex-col gap-3">
              <h2 className="font-display text-lg font-semibold text-foreground">{t("manage.title")}</h2>
              {sub.status === "CANCELLED" ? (
                <Button onClick={handleReactivate}>{t("manage.reactivate")}</Button>
              ) : (
                <Button variant="outline" onClick={handleCancel}>{t("manage.cancel")}</Button>
              )}
            </Card>
          ) : (
            <>
              <Card className="flex flex-col gap-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-foreground-muted">{t("pricing.premiumLabel")}</p>
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
                      {cycleLabel(cycle)}
                      {cycle === "YEARLY" ? <span className="ml-1 text-xs font-normal opacity-80">{t("pricing.yearlyDiscount")}</span> : null}
                    </button>
                  ))}
                </div>
                <div>
                  <p className="font-display text-2xl font-semibold text-foreground">{PRICING[billingCycle].price}</p>
                  <p className="text-xs text-foreground-muted">{cycleNote(billingCycle)}</p>
                </div>
              </Card>
              <Card className="flex flex-col gap-2">
                <h3 className="font-display text-base font-semibold text-foreground">{t("includes.title")}</h3>
                <ul className="flex flex-col gap-1.5 text-sm text-foreground-muted">
                  {(t("includes.items", { returnObjects: true }) as string[]).map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </Card>
              {trialActive ? null : trialAvailable ? (
                <Button size="lg" variant="outline" disabled={processing} onClick={handleStartTrial}>
                  {processing ? t("trial.starting") : t("trial.start")}
                </Button>
              ) : null}
              <Button size="lg" disabled={processing} onClick={handleSubscribe}>
                {processing ? t("subscribe.redirecting") : t("subscribe.cta", { price: PRICING[billingCycle].price })}
              </Button>
              <p className="text-center text-xs text-foreground-muted">
                {t("subscribe.note")}
              </p>
            </>
          )}

          {payments && payments.length > 0 ? (
            <Card className="flex flex-col gap-3">
              <div className="flex items-center justify-between print:hidden">
                <h2 className="font-display text-lg font-semibold text-foreground">{t("billing.title")}</h2>
                <Button variant="outline" size="sm" onClick={() => window.print()}>{t("billing.print")}</Button>
              </div>
              <div className="flex flex-col divide-y divide-border">
                {payments.map((p) => (
                  <div key={p.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                    <div>
                      <p className="font-medium text-foreground">{formatDate(p.created_at)}</p>
                      <p className="text-xs text-foreground-muted">
                        {p.billing_cycle === "YEARLY" ? t("pricing.yearly") : t("pricing.monthly")} · {p.currency} {p.amount.toFixed(2)} · {statusLabel(p.status)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 print:hidden">
                      <Chip tone={p.status === "COMPLETED" ? "success" : p.status === "PENDING" ? "neutral" : "danger"}>
                        {statusLabel(p.status)}
                      </Chip>
                      {p.invoice_url ? (
                        <button
                          type="button"
                          onClick={() => handleViewInvoice(p.id)}
                          className="text-xs font-semibold text-primary"
                        >
                          {t("billing.invoice")}
                        </button>
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
