import { useState, type FormEvent } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { useTranslation } from "react-i18next";
import AuthLayout from "@/components/layout/AuthLayout";
import TextField from "@/components/ui/TextField";
import PhoneNumberField from "@/components/ui/PhoneNumberField";
import Button from "@/components/ui/Button";
import { useAppDispatch } from "@/store/hooks";
import { setCredentials } from "@/store/authSlice";
import { getMe } from "@/lib/api/auth";
import { authenticateGio, checkGioPhone, signInWithGio } from "@/lib/api/accountLink";
import { ApiError } from "@/lib/api/client";

// Social-login-style provisioning entry point — see
// AUREN_SIGN_IN_WITH_GIO_PLAN.md. Same two-step phone-then-password shape
// as components/profile/GioLinkSection.tsx, but this page can create a
// brand-new, fully independent Auren account in the same step (no
// existing Auren session or account required to start).
type Step = "phone" | "password";

export default function SignInWithGioPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { t } = useTranslation("auth");

  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleCheckPhone(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await checkGioPhone(phone);
      if (!res.exists) {
        setError(t("signInWithGio.notFound"));
      } else {
        setStep("password");
      }
    } catch (err) {
      // Generic on purpose — see GioLinkSection's identical handler.
      console.error("check-phone request failed:", err);
      setError(t("signInWithGio.genericError"));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSignIn(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const auth = await authenticateGio(phone, password);
      const { access_token, refresh_token } = await signInWithGio(
        auth.verify_gio_token,
        auth.display_name,
        password
      );
      const me = await getMe(access_token);
      dispatch(
        setCredentials({ token: access_token, refreshToken: refresh_token, user: me.user, subscription: me.subscription })
      );
      // No special-casing for new vs. returning here — useAuthGuard on
      // /dashboard already bounces any user with onboarding_completed_at
      // unset straight to /onboarding (see AUREN_SIGN_IN_WITH_GIO_PLAN.md §3
      // step 6).
      router.push("/dashboard");
    } catch (err) {
      // Generic on purpose — don't reveal whether phone or password was
      // the problem.
      console.error("sign-in-with-gio request failed:", err);
      setError(err instanceof ApiError && err.status === 409 ? err.message : t("signInWithGio.invalidCredentials"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Head><title>Sign in with Gio — Auren</title></Head>
      <AuthLayout
        title={t("signInWithGio.title")}
        subtitle={step === "phone" ? t("signInWithGio.phoneSubtitle") : t("signInWithGio.passwordSubtitle")}
        footer={
          <button type="button" className="font-semibold text-primary" onClick={() => router.push("/auth/login")}>
            {t("signInWithGio.backToLogin")}
          </button>
        }
      >
        {step === "phone" && (
          <form onSubmit={handleCheckPhone} className="flex flex-col gap-4">
            <PhoneNumberField label={t("signInWithGio.phoneLabel")} required value={phone} onChange={setPhone} />
            {error ? <p className="text-sm font-medium text-danger">{error}</p> : null}
            <Button type="submit" fullWidth disabled={submitting || !phone} loading={submitting}>
              {t("signInWithGio.continue")}
            </Button>
          </form>
        )}

        {step === "password" && (
          <form onSubmit={handleSignIn} className="flex flex-col gap-4">
            <TextField
              label={t("signInWithGio.passwordLabel")}
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error ? <p className="text-sm font-medium text-danger">{error}</p> : null}
            <Button type="submit" fullWidth disabled={submitting || !password} loading={submitting}>
              {submitting ? t("signInWithGio.signingIn") : t("signInWithGio.signIn")}
            </Button>
          </form>
        )}
      </AuthLayout>
    </>
  );
}
