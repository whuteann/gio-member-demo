import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { useTranslation } from "react-i18next";
import { useAppDispatch } from "@/store/hooks";
import { setCredentials } from "@/store/authSlice";
import { exchangeSsoToken } from "@/lib/api/accountLink";
import { getMe } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import Button from "@/components/ui/Button";

// Landing page for the Gio -> Auren cross-platform handoff (see
// AUREN_GIO_ACCOUNT_LINKING_PLAN.md). bracelet-website redirects here with
// a short-lived ?token=; this page is reached with NO existing Auren
// session, so it deliberately doesn't use useAuthGuard (that would bounce
// straight to /auth/login before the exchange ever runs).
export default function SsoHandoffPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { t } = useTranslation("profile");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!router.isReady) return;
    const token = router.query.token;
    if (typeof token !== "string") {
      setError(t("gioLink.ssoMissingToken"));
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const { access_token, refresh_token } = await exchangeSsoToken(token);
        const me = await getMe(access_token);
        if (cancelled) return;
        dispatch(setCredentials({ token: access_token, refreshToken: refresh_token, user: me.user, subscription: me.subscription }));
        router.replace("/profile");
      } catch (err) {
        if (cancelled) return;
        console.error("sso-exchange failed:", err);
        setError(err instanceof ApiError ? t("gioLink.ssoExpired") : t("gioLink.genericError"));
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady, router.query.token]);

  return (
    <>
      <Head><title>Signing in — Auren</title></Head>
      <div className="flex min-h-screen items-center justify-center bg-background px-6">
        <div className="flex flex-col items-center gap-4 text-center">
          {error ? (
            <>
              <p className="text-sm font-medium text-danger">{error}</p>
              <Button variant="outline" onClick={() => router.replace("/auth/login")}>
                {t("gioLink.ssoBackToLogin")}
              </Button>
            </>
          ) : (
            <p className="text-sm text-foreground-muted">{t("gioLink.ssoSigningIn")}</p>
          )}
        </div>
      </div>
    </>
  );
}
