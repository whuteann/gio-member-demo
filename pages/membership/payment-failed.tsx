import Head from "next/head";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { useAuthGuard } from "@/lib/useAuthGuard";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export default function PaymentFailedPage() {
  const { settled, token } = useAuthGuard();
  const { t } = useTranslation("membership");
  if (!settled || !token) return null;

  return (
    <>
      <Head><title>{t("paymentTitle")} — Gio</title></Head>
      <AppShell title={t("paymentTitle")}>
        <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-10 text-center">
          <Card className="flex w-full flex-col items-center gap-3">
            <span className="text-4xl" aria-hidden>❌</span>
            <h1 className="font-display text-xl font-semibold text-foreground">{t("failed.title")}</h1>
            <p className="text-sm text-foreground-muted">
              {t("failed.body")}
            </p>
            <Link href="/membership" className="w-full"><Button fullWidth>{t("failed.backToMembership")}</Button></Link>
          </Card>
        </div>
      </AppShell>
    </>
  );
}
