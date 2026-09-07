import { useState, type FormEvent } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import AuthLayout from "@/components/layout/AuthLayout";
import TextField from "@/components/ui/TextField";
import Button from "@/components/ui/Button";
import { useAppState } from "@/context/AppStateContext";

export default function ResetPasswordPage() {
  const router = useRouter();
  const { resetPassword } = useAppState();
  const emailFromQuery = typeof router.query.email === "string" ? router.query.email : "";
  const [email, setEmail] = useState(emailFromQuery);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    const result = resetPassword({ email, newPassword: password });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setDone(true);
  }

  return (
    <>
      <Head><title>Reset password — Gio</title></Head>
      <AuthLayout title="Set a new password" subtitle="This completes your password recovery.">
        {done ? (
          <div className="flex flex-col gap-4 text-center">
            <span className="text-3xl">✅</span>
            <p className="text-sm text-foreground-muted">Your password has been updated.</p>
            <Button fullWidth onClick={() => router.push("/auth/login")}>
              Go to log in
            </Button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <TextField
              label="Email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              label="New password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error ? <p className="text-sm font-medium text-danger">{error}</p> : null}
            <Button type="submit" fullWidth>
              Set new password
            </Button>
          </form>
        )}
      </AuthLayout>
    </>
  );
}
