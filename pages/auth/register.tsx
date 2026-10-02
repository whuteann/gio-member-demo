import { useState, type FormEvent } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Head from "next/head";
import { useTranslation } from "react-i18next";
import AuthLayout from "@/components/layout/AuthLayout";
import TextField from "@/components/ui/TextField";
import Button from "@/components/ui/Button";
import LanguageSlider from "@/components/ui/LanguageSlider";
import { useAppDispatch } from "@/store/hooks";
import { setCredentials } from "@/store/authSlice";
import { useLanguage } from "@/lib/useLanguage";
import { getMe, register as apiRegister } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";

export default function RegisterPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { t } = useTranslation("auth");
  // The picked language is both the live UI language (via useLanguage)
  // and the account's initial preferred_language sent at registration —
  // no separate confirmation step, one control does both.
  const { language, setLanguage } = useLanguage();
  const [displayName, setDisplayName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError(t("register.passwordTooShort"));
      return;
    }
    if (password !== confirmPassword) {
      setError(t("register.passwordMismatch"));
      return;
    }
    setSubmitting(true);
    try {
      const { access_token, refresh_token } = await apiRegister({ phone_number: phoneNumber, password, display_name: displayName, language });
      const me = await getMe(access_token);
      dispatch(setCredentials({ token: access_token, refreshToken: refresh_token, user: me.user, subscription: me.subscription }));
      router.push("/onboarding");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("genericError"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Head><title>Create account — Auren</title></Head>
      <AuthLayout
        title={t("register.title")}
        subtitle={t("register.subtitle")}
        footer={
          <>
            {t("register.alreadyMember")}{" "}
            <Link href="/auth/login" className="font-semibold text-primary">
              {t("register.logIn")}
            </Link>
          </>
        }
      >
        <LanguageSlider value={language} onChange={setLanguage} className="mb-5" />
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <TextField
            label={t("register.displayName")}
            required
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
          <TextField
            label={t("register.phoneNumber")}
            type="tel"
            autoComplete="tel"
            required
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
          />
          <TextField
            label={t("register.password")}
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <TextField
            label={t("register.confirmPassword")}
            type="password"
            autoComplete="new-password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={confirmPassword.length > 0 && confirmPassword !== password ? t("register.passwordMismatch") : undefined}
          />
          {error ? <p className="text-sm font-medium text-danger">{error}</p> : null}
          <p className="text-xs leading-relaxed text-foreground-muted">{t("register.consent")}</p>
          <Button type="submit" fullWidth disabled={submitting}>
            {submitting ? t("register.creatingAccount") : t("register.createAccount")}
          </Button>
        </form>
      </AuthLayout>
    </>
  );
}
