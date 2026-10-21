import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Head from "next/head";
import { useTranslation } from "react-i18next";
import AuthLayout from "@/components/layout/AuthLayout";
import OtpField from "@/components/ui/OtpField";
import Button from "@/components/ui/Button";
import { getMe, resendVerification, verifyEmail } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { useAppDispatch } from "@/store/hooks";
import { setCredentials } from "@/store/authSlice";

const RESEND_COOLDOWN_SECONDS = 60;

/** Step 2 of signup: the emailed code. The account exists but holds no
 *  session — /auth/register deliberately issues no tokens — so the address
 *  travels in the URL, the same pattern reset-password uses. A valid code
 *  is what mints this account's first session, and only then does the user
 *  reach onboarding. */
export default function VerifyEmailPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { t } = useTranslation("auth");

  // Derived, not mirrored into state: router.query is the source of truth,
  // and copying it across in an effect causes a cascading render.
  const email = typeof router.query.email === "string" ? router.query.email : "";
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);

  // router.query only populates once isReady is true, so an empty email
  // before then means "not known yet", not "missing". Without an address
  // this page can do nothing, so send them back to sign up.
  useEffect(() => {
    if (router.isReady && !email) void router.replace("/auth/register");
  }, [router.isReady, email, router]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const submit = useCallback(
    async (code: string) => {
      setError(null);
      setSubmitting(true);
      try {
        const { access_token, refresh_token } = await verifyEmail({ email, otp: code });
        const me = await getMe(access_token);
        dispatch(setCredentials({
          token: access_token, refreshToken: refresh_token, user: me.user, subscription: me.subscription,
        }));
        // Straight to "Welcome to Auren" — this is the account's first
        // session, so onboarding has not run yet.
        router.push("/onboarding");
      } catch (err) {
        // Wrong, expired and attempt-exhausted codes all arrive as the same
        // 400 — show the server's generic message rather than guessing.
        setError(err instanceof ApiError ? err.message : t("genericError"));
        setSubmitting(false);
      }
    },
    [email, dispatch, router, t]
  );

  async function onResend() {
    setError(null);
    setOtp("");
    setCooldown(RESEND_COOLDOWN_SECONDS);
    try {
      await resendVerification({ email });
    } catch {
      // Answers 200 for every outcome, so there is nothing useful to say.
    }
  }

  return (
    <>
      <Head><title>{t("meta.verifyEmail")}</title></Head>
      <AuthLayout
        title={t("verifyEmail.title")}
        subtitle={email ? t("verifyEmail.subtitle", { email }) : undefined}
        footer={
          <Link href="/auth/login" className="font-semibold text-primary">
            {t("verifyEmail.backToLogin")}
          </Link>
        }
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void submit(otp);
          }}
          className="flex flex-col gap-4"
        >
          <OtpField
            label={t("verifyEmail.code")}
            value={otp}
            onChange={setOtp}
            // Submit as soon as the sixth digit lands — including on paste.
            onComplete={(code) => void submit(code)}
            error={error ?? undefined}
            disabled={submitting}
          />
          <Button type="submit" fullWidth loading={submitting} disabled={submitting || otp.length < 6}>
            {submitting ? t("verifyEmail.verifying") : t("verifyEmail.verify")}
          </Button>
          <button
            type="button"
            onClick={onResend}
            disabled={cooldown > 0}
            className="text-sm font-semibold text-primary disabled:opacity-50"
          >
            {cooldown > 0 ? t("verifyEmail.resendIn", { seconds: cooldown }) : t("verifyEmail.resend")}
          </button>
        </form>
      </AuthLayout>
    </>
  );
}
