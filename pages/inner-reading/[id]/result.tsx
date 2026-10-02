import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import type { GetServerSideProps } from "next";
import { motion } from "motion/react";
import { useTranslation } from "react-i18next";
import { useAuthGuard } from "@/lib/useAuthGuard";
import { useApiResource } from "@/lib/useApiResource";
import { useLanguage } from "@/lib/useLanguage";
import { getInnerReading } from "@/lib/api/reflections";
import { COLOUR_LIBRARY, DIMENSIONS } from "@/lib/blueprints";
import { colourKeyForFocus } from "@/lib/recommendation";
import { buildInnerState } from "@/lib/scoring";
import { EASE_OUT, EASE_SOFT_BACK, GOLD_HEX } from "@/lib/sessionMotion";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import ColourOfTheDay from "@/components/ui/ColourOfTheDay";
import ProgressBar from "@/components/ui/ProgressBar";
import Button from "@/components/ui/Button";
import Chip from "@/components/ui/Chip";
import EntitlementGate from "@/components/ui/EntitlementGate";
import AmbientField from "@/components/session/AmbientField";
import DimensionGlyph from "@/components/session/DimensionGlyph";

const LIFE_AREA_KEYS = ["work", "relationships", "personal_growth", "conflict_management"] as const;
const LIFE_AREA_ICONS: Record<string, string> = {
  work: "💼",
  relationships: "🤝",
  personal_growth: "🌱",
  conflict_management: "🕊️",
};

const DIM_COLOR: Record<string, string> = {
  emotional_energy: "bg-energy",
  mental_clarity: "bg-clarity",
  inner_pressure: "bg-pressure",
  grounding: "bg-grounding",
};

const pageStagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};
const cardRise = {
  hidden: { y: 18, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { duration: 0.55, ease: EASE_OUT } },
};
const glyphPop = {
  hidden: { scale: 0.5, opacity: 0 },
  show: { scale: 1, opacity: 1, transition: { duration: 0.5, ease: EASE_SOFT_BACK } },
};

export default function InnerReadingResultPage() {
  const { settled, token } = useAuthGuard();
  const router = useRouter();
  const { t } = useTranslation("innerReading");
  const { language } = useLanguage();
  const dateLocale = language === "zh" ? "zh-CN" : "en-US";
  const id = typeof router.query.id === "string" ? router.query.id : null;

  const { data: reading, loading, error } = useApiResource(
    token && id ? () => getInnerReading(token, id) : null,
    [token, id]
  );

  if (!settled || !token || !id) return null;
  if (loading) {
    return (
      <AppShell title={t("result.pageTitle")}>
        <p className="text-sm text-foreground-muted">{t("result.loading")}</p>
      </AppShell>
    );
  }
  if (error || !reading || reading.emotional_energy === null) {
    return (
      <AppShell title={t("result.notFoundTitle")}>
        <Link href="/inner-reading/history"><Button variant="outline-solid">{t("result.backToHistory")}</Button></Link>
      </AppShell>
    );
  }

  const dims = {
    emotional_energy: reading.emotional_energy!,
    mental_clarity: reading.mental_clarity!,
    inner_pressure: reading.inner_pressure!,
    grounding: reading.grounding!,
  };
  const derived = buildInnerState({ id: reading.id, userId: "", sourceType: "INNER_READING", sourceId: reading.id, dims });
  const recommendedColour = COLOUR_LIBRARY[colourKeyForFocus(derived.currentFocus)];
  const ambientColor = recommendedColour?.swatch ?? GOLD_HEX;
  const colourKey = recommendedColour?.key ?? "gold";

  return (
    <>
      <Head><title>{t("result.pageTitle")} — Auren</title></Head>
      <AppShell title={t("result.pageTitle")}>
        <div className="session-stage relative isolate">
          <AmbientField color={ambientColor} />
          <motion.div
            variants={pageStagger}
            initial="hidden"
            animate="show"
            className="mx-auto flex max-w-lg flex-col gap-5"
          >
            <motion.div variants={cardRise}>
              <Card className="flex flex-col items-center gap-3 text-center">
                <ColourOfTheDay colourKey={colourKey} swatch={ambientColor} size={128} />
                <Chip tone="primary">{derived.currentFocus}</Chip>
                <p className="text-xs text-foreground-muted">
                  {new Date(reading.completed_at ?? "").toLocaleString(dateLocale)}
                </p>
              </Card>
            </motion.div>

            <motion.div variants={cardRise}>
              <Card className="flex flex-col gap-4">
                <h2 className="font-display text-lg font-semibold text-foreground">{t("result.dimensions")}</h2>
                <motion.div variants={pageStagger} className="flex flex-col gap-4">
                  {DIMENSIONS.map((dim) => {
                    const value = dims[dim.key as keyof typeof dims];
                    return (
                      <motion.div key={dim.key} variants={cardRise} className="flex items-center gap-3">
                        <motion.div variants={glyphPop} className="shrink-0">
                          <DimensionGlyph dimension={dim.key} value={Math.max(1, Math.min(5, Math.round(value / 20)))} size={44} />
                        </motion.div>
                        <div className="min-w-0 flex-1">
                          <div className="mb-1 flex justify-between text-xs font-semibold text-foreground-muted">
                            <span>{t(`common:dimensions.${dim.key}.label`)}</span>
                            <span>{value}</span>
                          </div>
                          <ProgressBar value={value} colorClassName={DIM_COLOR[dim.key]} />
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              </Card>
            </motion.div>

            <motion.div variants={cardRise}>
              <Card>
                <h2 className="mb-2 font-display text-lg font-semibold text-foreground">{t("result.yourReading")}</h2>
                <p className="text-sm leading-relaxed text-foreground-muted">{reading.narrative}</p>
              </Card>
            </motion.div>

            {reading.insight ? (
              <motion.div variants={cardRise}>
                <Card className="flex flex-col gap-3">
                  <h2 className="font-display text-lg font-semibold text-foreground">{t("result.latestInsight")}</h2>
                  <p className="text-sm font-medium text-foreground">{reading.insight}</p>
                  {reading.reflection_question ? (
                    <div className="flex flex-col gap-1 border-t border-border pt-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-foreground-muted">
                        {t("result.reflectionQuestion")}
                      </p>
                      <p className="text-sm text-foreground-muted">{reading.reflection_question}</p>
                    </div>
                  ) : null}
                </Card>
              </motion.div>
            ) : null}

            {reading.is_premium_content && reading.life_area_insights ? (
              <motion.div variants={cardRise}>
                <Card className="flex flex-col gap-4">
                  <h2 className="font-display text-lg font-semibold text-foreground">{t("result.inDepthTitle")}</h2>
                  {LIFE_AREA_KEYS.map((key) => (
                    <div key={key} className="flex items-start gap-3 border-t border-border pt-3 first:border-t-0 first:pt-0">
                      <span className="text-lg" aria-hidden>{LIFE_AREA_ICONS[key]}</span>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-foreground-muted">
                          {t(`result.lifeAreas.${key}`)}
                        </p>
                        <p className="mt-1 text-sm text-foreground-muted">{reading.life_area_insights![key as keyof typeof reading.life_area_insights]}</p>
                      </div>
                    </div>
                  ))}
                </Card>
              </motion.div>
            ) : (
              <motion.div variants={cardRise}>
                <EntitlementGate
                  title={t("result.unlockTitle")}
                  description={t("result.unlockBody")}
                />
              </motion.div>
            )}

            <motion.div variants={cardRise} className="flex gap-3">
              <Link href="/colour-psychology" className="flex-1">
                <Button fullWidth>{t("result.seeRecommendations")}</Button>
              </Link>
              <Link href="/dashboard" className="flex-1">
                <Button fullWidth variant="outline-solid">{t("result.dashboard")}</Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </AppShell>
    </>
  );
}

// The API fetch happens client-side (needs the bearer token from Redux), so
// SSR here just satisfies Next's requirement that dynamic Pages-Router
// routes have either getStaticPaths or getServerSideProps.
export const getServerSideProps: GetServerSideProps = async () => ({ props: {} });
