import { useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Head from "next/head";
import { useAppState } from "@/context/AppStateContext";
import Button from "@/components/ui/Button";

export default function Home() {
  const router = useRouter();
  const { ready, user, loginDemo } = useAppState();

  useEffect(() => {
    if (ready && user) {
      router.replace(user.onboardingCompletedAt ? "/dashboard" : "/onboarding");
    }
  }, [ready, user, router]);

  if (ready && user) return null;

  return (
    <>
      <Head>
        <title>Gio — Know your inner state</title>
      </Head>
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-12 text-center">
        <span className="text-5xl" aria-hidden>🌿</span>
        <h1 className="mt-5 max-w-xs font-display text-4xl font-semibold leading-tight text-foreground">
          Gio
        </h1>
        <p className="mt-3 max-w-xs text-base text-foreground-muted">
          Check in with yourself, read your inner state, and grow at your own pace.
        </p>
        <div className="mt-8 flex w-full max-w-xs flex-col gap-3">
          <Link href="/auth/register" className="w-full">
            <Button fullWidth size="lg">Get started</Button>
          </Link>
          <Link href="/auth/login" className="w-full">
            <Button fullWidth size="lg" variant="outline">Log in</Button>
          </Link>
          <button
            onClick={() => {
              loginDemo();
              router.push("/dashboard");
            }}
            className="mt-2 text-sm font-semibold text-accent underline-offset-4 hover:underline"
          >
            Continue as Demo Member →
          </button>
        </div>
      </div>
    </>
  );
}
