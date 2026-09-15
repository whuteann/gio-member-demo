import { useState, type FormEvent } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Head from "next/head";
import AuthLayout from "@/components/layout/AuthLayout";
import TextField from "@/components/ui/TextField";
import Button from "@/components/ui/Button";
import LanguageSlider from "@/components/ui/LanguageSlider";
import { useAppState } from "@/context/AppStateContext";
import { DEMO_EMAIL, DEMO_PASSWORD } from "@/lib/seed";
import type { Language } from "@/lib/types";

export default function LoginPage() {
  const router = useRouter();
  const { login, loginDemo } = useAppState();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [language, setLanguage] = useState<Language>("en");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const result = login({ email, password });
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.push("/dashboard");
  }

  return (
    <>
      <Head><title>Log in — Gio</title></Head>
      <AuthLayout
        title="Welcome back"
        subtitle="Log in to continue your check-ins and readings."
        footer={
          <>
            New to Gio?{" "}
            <Link href="/auth/register" className="font-semibold text-primary">
              Create an account
            </Link>
          </>
        }
      >
        <LanguageSlider value={language} onChange={setLanguage} className="mb-5" />
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <TextField
            label="Email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            label="Password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="flex justify-end">
            <Link href="/auth/forgot-password" className="text-sm font-semibold text-primary">
              Forgot password?
            </Link>
          </div>
          {error ? <p className="text-sm font-medium text-danger">{error}</p> : null}
          <Button type="submit" fullWidth disabled={submitting}>
            {submitting ? "Signing in…" : "Log in"}
          </Button>
        </form>
        <div className="mt-5 flex items-center gap-3 text-xs text-foreground-muted">
          <div className="h-px flex-1 bg-border" />
          or
          <div className="h-px flex-1 bg-border" />
        </div>
        <Button
          type="button"
          variant="outline"
          fullWidth
          className="mt-5"
          onClick={() => {
            loginDemo();
            router.push("/dashboard");
          }}
        >
          Continue as Demo Member
        </Button>
        <p className="mt-3 text-center text-xs text-foreground-muted">
          Demo login: {DEMO_EMAIL} / {DEMO_PASSWORD}
        </p>
      </AuthLayout>
    </>
  );
}
