import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import { useAuthGuard } from "@/lib/useAuthGuard";
import { useApiResource } from "@/lib/useApiResource";
import { useLanguage } from "@/lib/useLanguage";
import { getRecommendation } from "@/lib/api/recommendations";
import { ApiError } from "@/lib/api/client";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import RecommendationMagazine from "@/components/ui/RecommendationMagazine";

/**
 * The full brochure — a magazine layout (RecommendationMagazine) that the
 * compact letter-form card on /colour-psychology links out to via "More".
 * See gio-backend/docs/recommendation_engine.md.
 */
export default function RecommendationDetailPage() {
  const { settled, token } = useAuthGuard();
  const router = useRouter();
  const { t } = useTranslation("colourPsychology");
  const { language } = useLanguage();
  const id = typeof router.query.id === "string" ? router.query.id : null;

  const { data: recommendation, loading, error } = useApiResource(
    token && id
      ? () => getRecommendation(token, id).catch((e) => (e instanceof ApiError && e.status === 404 ? null : Promise.reject(e)))
      : null,
    [token, id]
  );

  if (!settled || !token) return null;

  return (
    <>
      <Head><title>{t("recommendationLetter.pageTitle")} — Auren</title></Head>
      <AppShell>
        <div className="mx-auto flex max-w-4xl flex-col gap-5">
          <Link href="/colour-psychology" className="text-sm font-semibold text-primary">
            {t("detail.back")}
          </Link>

          {loading ? (
            <p className="text-sm text-foreground-muted">{t("loading")}</p>
          ) : error ? (
            <p className="text-sm text-danger">{error}</p>
          ) : recommendation ? (
            <Card className="flex flex-col gap-5 sm:p-8">
              <h1 className="font-display text-3xl font-semibold text-foreground">
                {t("recommendationLetter.pageTitle")}
              </h1>
              <RecommendationMagazine recommendation={recommendation} language={language} />
            </Card>
          ) : (
            <p className="text-sm text-foreground-muted">{t("recommendationLetter.notFound")}</p>
          )}
        </div>
      </AppShell>
    </>
  );
}
