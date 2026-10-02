import { useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Head from "next/head";
import { useTranslation } from "react-i18next";
import { useAppState } from "@/context/AppStateContext";
import { useAppSelector } from "@/store/hooks";
import Button from "@/components/ui/Button";

export default function Home() {
  const router = useRouter();
  const { t } = useTranslation("landing");
  const { loginDemo } = useAppState();
  const token = useAppSelector((s) => s.auth.token);
  const user = useAppSelector((s) => s.auth.user);

  useEffect(() => {
    if (token && user) {
      router.replace(user.onboarding_completed_at ? "/dashboard" : "/onboarding");
    }
  }, [token, user, router]);

  if (token && user) return null;

  return (
    <>
      <Head>
        <title>Auren — Know your inner state</title>
      </Head>
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-12 text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/auren-logo-icon.png" alt="" aria-hidden className="h-16 w-16" />
        <h1 className="mt-5 max-w-xs font-display text-4xl font-semibold leading-tight text-foreground">
          Auren
        </h1>
        <p className="mt-3 max-w-xs text-base text-foreground-muted">{t("tagline")}</p>
        <div className="mt-8 flex w-full max-w-xs flex-col gap-3">
          <Link href="/auth/register" className="w-full">
            <Button fullWidth size="lg">{t("getStarted")}</Button>
          </Link>
          <Link href="/auth/login" className="w-full">
            <Button fullWidth size="lg" variant="outline">{t("logIn")}</Button>
          </Link>
          {/* <button
            onClick={() => {
              loginDemo();
              router.push("/inner-reading");
            }}
            className="mt-2 text-sm font-semibold text-accent underline-offset-4 hover:underline"
          >
            {t("previewDemo")}
          </button> */}
        </div>
      </div>
    </>
  );
}
