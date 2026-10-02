import { useState, type FormEvent } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Head from "next/head";
import { useTranslation } from "react-i18next";
import AuthLayout from "@/components/layout/AuthLayout";
import TextField from "@/components/ui/TextField";
import Button from "@/components/ui/Button";
import LanguageSlider from "@/components/ui/LanguageSlider";
import { useAppState } from "@/context/AppStateContext";
import { useAppDispatch } from "@/store/hooks";
import { setCredentials } from "@/store/authSlice";
import { useLanguage } from "@/lib/useLanguage";
import { getMe, login as apiLogin } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { t } = useTranslation("auth");
  // Kept only for the mock-preview path below — pages not yet wired to
  // gio-backend still read from this local, localStorage-only "account".
  // See docs/dev_log_0001.md.
  const { loginDemo } = useAppState();
  const { language, setLanguage } = useLanguage();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const { access_token, refresh_token } = await apiLogin({ phone_number: phoneNumber, password });
      const me = await getMe(access_token);
      dispatch(setCredentials({ token: access_token, refreshToken: refresh_token, user: me.user, subscription: me.subscription }));
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("genericError"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Head><title>Log in — Auren</title></Head>
      <AuthLayout
        title={t("login.title")}
        subtitle={t("login.subtitle")}
        footer={
          <>
            {t("login.newToGio")}{" "}
            <Link href="/auth/register" className="font-semibold text-primary">
              {t("login.createAccount")}
            </Link>
          </>
        }
      >
        <LanguageSlider value={language} onChange={setLanguage} className="mb-5" />
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <TextField
            label={t("login.phoneNumber")}
            type="tel"
            autoComplete="tel"
            required
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
          />
          <TextField
            label={t("login.password")}
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="flex justify-end">
            <Link href="/auth/forgot-password" className="text-sm font-semibold text-primary">
              {t("login.forgotPassword")}
            </Link>
          </div>
          {error ? <p className="text-sm font-medium text-danger">{error}</p> : null}
          <Button type="submit" fullWidth disabled={submitting}>
            {submitting ? t("login.signingIn") : t("login.logIn")}
          </Button>
        </form>
        <div className="mt-5 flex items-center gap-3 text-xs text-foreground-muted">
          <div className="h-px flex-1 bg-border" />
          {t("login.or")}
          <div className="h-px flex-1 bg-border" />
        </div>
        {/* <Button
          type="button"
          variant="outline"
          fullWidth
          className="mt-5"
          onClick={() => {
            loginDemo();
            router.push("/progress");
          }}
        >
          {t("login.previewDemo")}
        </Button> */}
        <p className="mt-3 text-center text-xs text-foreground-muted">{t("login.previewDemoNote")}</p>
      </AuthLayout>
    </>
  );
}
