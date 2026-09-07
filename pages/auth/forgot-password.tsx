import { useState, type FormEvent } from "react";
import Link from "next/link";
import Head from "next/head";
import AuthLayout from "@/components/layout/AuthLayout";
import TextField from "@/components/ui/TextField";
import Button from "@/components/ui/Button";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSent(true);
  }

  return (
    <>
      <Head><title>Forgot password — Gio</title></Head>
      <AuthLayout
        title="Reset your password"
        subtitle="We'll simulate sending a reset link for this demo."
        footer={
          <Link href="/auth/login" className="font-semibold text-primary">
            Back to log in
          </Link>
        }
      >
        {sent ? (
          <div className="flex flex-col gap-4 text-center">
            <span className="text-3xl">📬</span>
            <p className="text-sm text-foreground-muted">
              If an account exists for <strong>{email}</strong>, a reset link has been sent.
            </p>
            <Link href={`/auth/reset-password?email=${encodeURIComponent(email)}`}>
              <Button fullWidth variant="outline">
                Open demo reset link
              </Button>
            </Link>
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
            <Button type="submit" fullWidth>
              Send reset link
            </Button>
          </form>
        )}
      </AuthLayout>
    </>
  );
}
