import { useState, type FormEvent } from "react";
import Link from "next/link";
import Head from "next/head";
import { useTranslation } from "react-i18next";
import AuthLayout from "@/components/layout/AuthLayout";
import TextField from "@/components/ui/TextField";
import Button from "@/components/ui/Button";

export default function ForgotPasswordPage() {
  const { t } = useTranslation("auth");
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSent(true);
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
        {sent ? (
          <div className="flex flex-col gap-4 text-center">
            <span className="text-3xl">📬</span>
            <p className="text-sm text-foreground-muted">{t("forgotPassword.sentNotice", { email })}</p>
            <Link href={`/auth/reset-password?email=${encodeURIComponent(email)}`}>
              <Button fullWidth variant="outline">
                {t("forgotPassword.openDemoLink")}
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <TextField
              label={t("forgotPassword.email")}
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button type="submit" fullWidth>
              {t("forgotPassword.sendResetLink")}
            </Button>
          </form>
        )}
      </AuthLayout>
    </>
  );
}
