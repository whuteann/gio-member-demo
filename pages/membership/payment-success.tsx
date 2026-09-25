import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
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
      <Head><title>Payment — Gio</title></Head>
      <AppShell title="Payment">
        <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-10 text-center">
          {checking ? (
            <p className="text-sm text-foreground-muted">Confirming your payment…</p>
          ) : premium ? (
            <Card className="flex w-full flex-col items-center gap-3">
              <span className="text-4xl" aria-hidden>✅</span>
              <h1 className="font-display text-xl font-semibold text-foreground">You&apos;re Premium</h1>
              <p className="text-sm text-foreground-muted">Your payment was confirmed and Premium is now active.</p>
              <Link href="/membership" className="w-full"><Button fullWidth>View membership</Button></Link>
            </Card>
          ) : (
            <Card className="flex w-full flex-col items-center gap-3">
              <span className="text-4xl" aria-hidden>⏳</span>
              <h1 className="font-display text-xl font-semibold text-foreground">Still confirming</h1>
              <p className="text-sm text-foreground-muted">
                Payment can take a short moment to confirm. Check back on your membership page shortly.
              </p>
              <Link href="/membership" className="w-full"><Button fullWidth variant="outline-solid">Back to membership</Button></Link>
            </Card>
          )}
        </div>
      </AppShell>
    </>
  );
}
