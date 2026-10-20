import { useState, type FormEvent } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Head from "next/head";
import { useTranslation } from "react-i18next";
import AuthLayout from "@/components/layout/AuthLayout";
import TextField from "@/components/ui/TextField";
import Button from "@/components/ui/Button";
import { forgotPassword } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { t } = useTranslation("auth");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await forgotPassword({ email });
      // The endpoint answers identically whether or not an account exists,
      // so this page must not imply one does either — it just moves on, and
      // the next page carries the "if an account exists" wording.
      router.push({ pathname: "/auth/reset-password", query: { email } });
    } catch (err) {
      // Only a malformed address (422) or the API being unreachable gets
      // here; a missing account is a 200.
      setError(err instanceof ApiError ? err.message : t("genericError"));
      setSubmitting(false);
    }
  }

  return (
    <>
      <Head><title>Forgot password — Auren</title></Head>
      <AuthLayout
        title={t("forgotPassword.title")}
        subtitle={t("forgotPassword.subtitle")}
        footer={
          <Link href="/auth/login" className="font-semibold text-primary">
            {t("forgotPassword.backToLogin")}
          </Link>
        }
      >
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <TextField
            label={t("forgotPassword.email")}
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {error ? <p className="text-sm font-medium text-danger">{error}</p> : null}
          <Button type="submit" fullWidth loading={submitting} disabled={submitting}>
            {submitting ? t("forgotPassword.sending") : t("forgotPassword.sendCode")}
          </Button>
        </form>
      </AuthLayout>
    </>
  );
}
