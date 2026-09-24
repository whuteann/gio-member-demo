import { useState, type FormEvent } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Head from "next/head";
import AuthLayout from "@/components/layout/AuthLayout";
import TextField from "@/components/ui/TextField";
import Button from "@/components/ui/Button";
import LanguageSlider from "@/components/ui/LanguageSlider";
import { useAppState } from "@/context/AppStateContext";
import { useAppDispatch } from "@/store/hooks";
import { setCredentials } from "@/store/authSlice";
import { getMe, login as apiLogin } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import type { Language } from "@/lib/types";

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  // Kept only for the mock-preview path below — pages not yet wired to
  // gio-backend still read from this local, localStorage-only "account".
  // See docs/dev_log_0001.md.
  const { loginDemo } = useAppState();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [language, setLanguage] = useState<Language>("en");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const { access_token, refresh_token } = await apiLogin({ email, password });
      const me = await getMe(access_token);
      dispatch(setCredentials({ token: access_token, refreshToken: refresh_token, user: me.user, subscription: me.subscription }));
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
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
            router.push("/progress");
          }}
        >
          Preview Mock Demo Data
        </Button>
        <p className="mt-3 text-center text-xs text-foreground-muted">
          Local, offline preview data — separate from a real account, for
          pages not yet connected to the backend.
        </p>
      </AuthLayout>
    </>
  );
}
