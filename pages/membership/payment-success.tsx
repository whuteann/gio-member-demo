import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuthGuard } from "@/lib/useAuthGuard";
import { useAppDispatch } from "@/store/hooks";
import { setSubscription } from "@/store/authSlice";
import { getSubscription } from "@/lib/api/subscription";
import { isPremiumActive } from "@/lib/api/entitlement";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

// Xendit redirects here after checkout — this page never treats the
// redirect itself as proof of payment (docs/behaviour_log_0009.md); it
// just re-fetches the real subscription state, which only the webhook
// (or the sync fallback) actually updates.
export default function PaymentSuccessPage() {
  const { settled, token } = useAuthGuard();
  const { t } = useTranslation("membership");
  const dispatch = useAppDispatch();
  const [checking, setChecking] = useState(true);
  const [premium, setPremium] = useState(false);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    getSubscription(token).then((sub) => {
      if (cancelled) return;
      dispatch(setSubscription(sub));
      setPremium(isPremiumActive(sub));
      setChecking(false);
    });
    return () => {
      cancelled = true;
    };
  }, [token, dispatch]);

  if (!settled || !token) return null;

  return (
    <>
      <Head><title>{t("paymentTitle")} — Auren</title></Head>
      <AppShell title={t("paymentTitle")}>
        <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-10 text-center">
          {checking ? (
            <p className="text-sm text-foreground-muted">{t("success.confirming")}</p>
          ) : premium ? (
            <Card className="flex w-full flex-col items-center gap-3">
              <span className="text-4xl" aria-hidden>✅</span>
              <h1 className="font-display text-xl font-semibold text-foreground">{t("success.confirmedTitle")}</h1>
              <p className="text-sm text-foreground-muted">{t("success.confirmedBody")}</p>
              <Link href="/membership" className="w-full"><Button fullWidth>{t("success.viewMembership")}</Button></Link>
            </Card>
          ) : (
            <Card className="flex w-full flex-col items-center gap-3">
              <span className="text-4xl" aria-hidden>⏳</span>
              <h1 className="font-display text-xl font-semibold text-foreground">{t("success.pendingTitle")}</h1>
              <p className="text-sm text-foreground-muted">
                {t("success.pendingBody")}
              </p>
              <Link href="/membership" className="w-full"><Button fullWidth variant="outline-solid">{t("success.backToMembership")}</Button></Link>
            </Card>
          )}
        </div>
      </AppShell>
    </>
  );
}
