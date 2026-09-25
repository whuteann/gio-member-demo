import Head from "next/head";
import Link from "next/link";
import { useAuthGuard } from "@/lib/useAuthGuard";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export default function PaymentFailedPage() {
  const { settled, token } = useAuthGuard();
  if (!settled || !token) return null;

  return (
    <>
      <Head><title>Payment — Gio</title></Head>
      <AppShell title="Payment">
        <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-10 text-center">
          <Card className="flex w-full flex-col items-center gap-3">
            <span className="text-4xl" aria-hidden>❌</span>
            <h1 className="font-display text-xl font-semibold text-foreground">Payment didn&apos;t go through</h1>
            <p className="text-sm text-foreground-muted">
              No charge was made. You can try again from your membership page.
            </p>
            <Link href="/membership" className="w-full"><Button fullWidth>Back to membership</Button></Link>
          </Card>
        </div>
      </AppShell>
    </>
  );
}
