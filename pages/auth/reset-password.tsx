import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Head from "next/head";
import { useTranslation } from "react-i18next";
import AuthLayout from "@/components/layout/AuthLayout";
import TextField from "@/components/ui/TextField";
import OtpField from "@/components/ui/OtpField";
import Button from "@/components/ui/Button";
import Sheet from "@/components/ui/Sheet";
import { forgotPassword, resetPassword, verifyResetOtp } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";

type Stage = "otp" | "password" | "done";

const RESEND_COOLDOWN_SECONDS = 60;
const MIN_PASSWORD_LENGTH = 6;

/** Steps 3–5 of the forgot-password flow in one route: enter the emailed
 *  code, set a new password, confirm. One page rather than two so the code
 *  never has to survive a route change — it lives in component state only,
 *  never localStorage and never the URL. */
export default function ResetPasswordPage() {
  const router = useRouter();
  const { t } = useTranslation("auth");

  // Derived, not mirrored into state: router.query is the source of truth,
  // and copying it across in an effect causes a cascading render (the
  // react-hooks/set-state-in-effect rule catches exactly that).
  const email = typeof router.query.email === "string" ? router.query.email : "";
  const [stage, setStage] = useState<Stage>("otp");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);

  // router.query is only populated client-side once isReady is true, so an
  // empty email before then means "not known yet", not "missing". Only once
  // the router has settled is it really absent — and then there is nothing
  // this page can do, so go back a step. Navigating is an external effect,
  // which is what useEffect is for.
  useEffect(() => {
    if (router.isReady && !email) void router.replace("/auth/forgot-password");
  }, [router.isReady, email, router]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const submitOtp = useCallback(
    async (code: string) => {
      setError(null);
      setSubmitting(true);
      try {
        await verifyResetOtp({ email, otp: code });
        setStage("password");
      } catch (err) {
        // A wrong code, an expired one and one that hit the attempt ceiling
        // all arrive as the same 400 — show the server's generic message
        // rather than guessing which it was.
        setError(err instanceof ApiError ? err.message : t("genericError"));
      } finally {
        setSubmitting(false);
      }
    },
    [email, t]
  );

  async function onResend() {
    setError(null);
    setOtp("");
    setCooldown(RESEND_COOLDOWN_SECONDS);
    try {
      await forgotPassword({ email });
    } catch {
      // Same reasoning as the send step: this endpoint answers 200 for
      // every outcome, so there is nothing useful to tell the user here.
    }
  }

  async function onSubmitPassword(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(t("resetPassword.passwordTooShort"));
      return;
    }
    if (password !== confirmPassword) {
      setError(t("resetPassword.passwordMismatch"));
      return;
    }
    setSubmitting(true);
    try {
      await resetPassword({ email, otp, new_password: password });
      setStage("done");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("genericError"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Head><title>Reset password — Auren</title></Head>
      <AuthLayout
        title={stage === "otp" ? t("verifyOtp.title") : t("resetPassword.title")}
        subtitle={
          stage === "otp"
            ? email
              ? t("verifyOtp.subtitle", { email })
              : undefined
            : t("resetPassword.subtitle")
        }
        footer={
          <Link href="/auth/login" className="font-semibold text-primary">
            {t("forgotPassword.backToLogin")}
          </Link>
        }
      >
        {stage === "otp" ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void submitOtp(otp);
            }}
            className="flex flex-col gap-4"
          >
            <OtpField
              label={t("verifyOtp.code")}
              value={otp}
              onChange={setOtp}
              // Submit as soon as the sixth digit lands — including on paste
              // — so nobody has to hunt for the button afterwards.
              onComplete={(code) => void submitOtp(code)}
              error={error ?? undefined}
              disabled={submitting}
            />
            <Button type="submit" fullWidth loading={submitting} disabled={submitting || otp.length < 6}>
              {submitting ? t("verifyOtp.verifying") : t("verifyOtp.verify")}
            </Button>
            <button
              type="button"
              onClick={onResend}
              disabled={cooldown > 0}
              className="text-sm font-semibold text-primary disabled:opacity-50"
            >
              {cooldown > 0 ? t("verifyOtp.resendIn", { seconds: cooldown }) : t("verifyOtp.resend")}
            </button>
          </form>
        ) : null}

        {stage === "password" ? (
          <form onSubmit={onSubmitPassword} className="flex flex-col gap-4">
            <TextField
              label={t("resetPassword.newPassword")}
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <TextField
              label={t("resetPassword.confirmPassword")}
              type="password"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={
                confirmPassword.length > 0 && confirmPassword !== password
                  ? t("resetPassword.passwordMismatch")
                  : undefined
              }
            />
            {error ? <p className="text-sm font-medium text-danger">{error}</p> : null}
            <Button type="submit" fullWidth loading={submitting} disabled={submitting}>
              {submitting ? t("resetPassword.saving") : t("resetPassword.setNewPassword")}
            </Button>
          </form>
        ) : null}

        {stage === "done" ? (
          <div className="flex flex-col gap-4 text-center">
            <span className="text-3xl">✅</span>
            <p className="text-sm text-foreground-muted">{t("resetPassword.done")}</p>
            <Button fullWidth onClick={() => router.push("/auth/login")}>
              {t("resetPassword.goToLogin")}
            </Button>
          </div>
        ) : null}
      </AuthLayout>

      {/* The success state is shown both in-page and as a modal over it, so
          it reads as a completion regardless of where the user's eye is. */}
      <Sheet open={stage === "done"} onClose={() => router.push("/auth/login")} title={t("resetPassword.successTitle")}>
        <p className="text-sm leading-relaxed text-foreground-muted">{t("resetPassword.done")}</p>
        <Button fullWidth className="mt-5" onClick={() => router.push("/auth/login")}>
          {t("resetPassword.goToLogin")}
        </Button>
      </Sheet>
    </>
  );
}
