import { useState, type FormEvent } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Head from "next/head";
import AuthLayout from "@/components/layout/AuthLayout";
import TextField from "@/components/ui/TextField";
import Button from "@/components/ui/Button";
import LanguageSlider from "@/components/ui/LanguageSlider";
import { useAppDispatch } from "@/store/hooks";
import { setCredentials } from "@/store/authSlice";
import { getMe, register as apiRegister } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import type { Language } from "@/lib/types";

export default function RegisterPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [language, setLanguage] = useState<Language>("en");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    setSubmitting(true);
    try {
      const { access_token, refresh_token } = await apiRegister({ email, password, display_name: displayName, language });
      const me = await getMe(access_token);
      dispatch(setCredentials({ token: access_token, refreshToken: refresh_token, user: me.user, subscription: me.subscription }));
      router.push("/onboarding");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Head><title>Create account — Gio</title></Head>
      <AuthLayout
        title="Create your account"
        subtitle="Your local Gio account links to your GioByQuartzic identity."
        footer={
          <>
            Already a member?{" "}
            <Link href="/auth/login" className="font-semibold text-primary">
              Log in
            </Link>
          </>
        }
      >
        <LanguageSlider value={language} onChange={setLanguage} className="mb-5" />
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <TextField
            label="Display name"
            required
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
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
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <TextField
            label="Confirm password"
            type="password"
            autoComplete="new-password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={confirmPassword.length > 0 && confirmPassword !== password ? "Passwords don't match." : undefined}
          />
          {error ? <p className="text-sm font-medium text-danger">{error}</p> : null}
          <p className="text-xs leading-relaxed text-foreground-muted">
            By continuing, you agree that Gio will store your check-in and reading history to
            personalise your experience. Private notes are never used for recommendations.
          </p>
          <Button type="submit" fullWidth disabled={submitting}>
            {submitting ? "Creating account…" : "Create account"}
          </Button>
        </form>
      </AuthLayout>
    </>
  );
}
