import Head from "next/head";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { useAuthGuard } from "@/lib/useAuthGuard";
import { useApiResource } from "@/lib/useApiResource";
import { useLanguage } from "@/lib/useLanguage";
import { getLatestRecommendation, listRecommendations } from "@/lib/api/recommendations";
import { getCurrentCorePersonality } from "@/lib/api/corePersonality";
import { isPremiumActive } from "@/lib/api/entitlement";
import { ApiError } from "@/lib/api/client";
import { COLOUR_LIBRARY, COLOUR_ORDER, FOCUS_COLOUR_REASON } from "@/lib/blueprints";
import { localized } from "@/lib/corePersonalityDisplay";
import { colourKeyForFocus } from "@/lib/recommendation";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import Chip from "@/components/ui/Chip";
import RecommendationLetter from "@/components/ui/RecommendationLetter";
import PhoneCaseSection from "@/components/ui/PhoneCaseSection";
import ColourOfTheDay from "@/components/ui/ColourOfTheDay";
import EntitlementGate from "@/components/ui/EntitlementGate";

export default function ColourPsychologyPage() {
  const { settled, token, subscription } = useAuthGuard();
  const { t } = useTranslation("colourPsychology");
  const { language } = useLanguage();
  const isZh = language === "zh";
  const dateLocale = isZh ? "zh-CN" : "en-US";
  const premium = subscription ? isPremiumActive(subscription) : false;
  const howToTips = t("howTo.tips", { returnObjects: true }) as { title: string; body: string }[];
  const HOW_TO_ICONS = ["👕", "🌿", "🪴", "🔔"];

  const { data, loading, error } = useApiResource(
    token
      ? async () => {
          const [recommendation, personality, history] = await Promise.all([
            getLatestRecommendation(token).catch((e) => (e instanceof ApiError && e.status === 404 ? null : Promise.reject(e))),
            getCurrentCorePersonality(token).catch((e) => (e instanceof ApiError && e.status === 404 ? null : Promise.reject(e))),
            listRecommendations(token).catch((e) => (e instanceof ApiError && e.status === 404 ? [] : Promise.reject(e))),
          ]);
          return { recommendation, personality, history };
        }
      : null,
    [token]
  );

  if (!settled || !token) return null;
  if (error) {
    return (
      <AppShell>
        <p className="text-sm text-danger">{error}</p>
      </AppShell>
    );
  }
  if (loading || !data) {
    return (
      <AppShell>
        <p className="text-sm text-foreground-muted">{t("loading")}</p>
      </AppShell>
    );
  }

  const { recommendation, personality, history } = data;
  const currentColourKey = recommendation ? colourKeyForFocus(recommendation.current_focus) : null;
  const currentColour = currentColourKey ? COLOUR_LIBRARY[currentColourKey] : null;
  const focusReason = recommendation ? FOCUS_COLOUR_REASON[recommendation.current_focus] : null;
  const personalitySubtitle = personality ? localized(personality, "subtitle", language) : null;
  // "Your colour history" is premium-only — history from the API is already
  // limited to 1 (today's) for free users server-side, so the earlier
  // entries beyond that only ever exist for premium.
  const patternHistory = history.filter((h) => h.id !== recommendation?.id);

  return (
    <>
      <Head><title>{t("meta.title")}</title></Head>
      <AppShell>
        <div>
          <h1 className="flex items-center gap-2 font-display text-2xl font-semibold text-foreground lg:text-3xl">
            {t("header.title")} <span aria-hidden>🌿</span>
          </h1>
          <p className="mt-1 text-sm text-foreground-muted">
            {t("header.subtitle")}
          </p>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-3">
          <div className="flex flex-col gap-5 lg:col-span-2">
            {currentColour ? (
              <Card className="flex flex-col gap-5 sm:flex-row">
                <div className="flex h-40 w-full flex-none items-center justify-center rounded-2xl sm:h-auto sm:w-40">
                  <ColourOfTheDay colourKey={currentColour.key} swatch={currentColour.swatch} size={152} />
                </div>
                <div className="flex flex-1 flex-col gap-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-foreground-muted">
                    {t("current.label")}
                  </p>
                  <h2 className="font-display text-2xl font-semibold text-foreground">{isZh ? currentColour.nameZh : currentColour.name}</h2>
                  <div className="flex flex-wrap gap-1.5">
                    {(isZh ? currentColour.traitsZh : currentColour.traits).map((tr) => (
                      <Chip key={tr} tone="neutral">{tr}</Chip>
                    ))}
                  </div>
                  <p className="text-sm text-foreground-muted">{isZh ? currentColour.descriptionZh : currentColour.description}</p>
                  <div className="rounded-xl bg-surface-muted p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-foreground-muted">
                      {t("current.affirmationLabel")}
                    </p>
                    <p className="mt-1 text-sm font-medium text-foreground">
                      {(isZh ? currentColour.affirmationsZh : currentColour.affirmations).join(" ")}
                    </p>
                  </div>
                </div>
                <div className="flex w-full flex-none flex-col gap-3 sm:w-56">
                  <p className="text-sm font-semibold text-foreground">{t("current.whyTitle")}</p>
                  {premium ? (
                    <>
                      {focusReason ? (
                        <div className="flex items-start gap-2">
                          <span aria-hidden>{focusReason.icon}</span>
                          <p className="text-xs text-foreground-muted">{isZh ? focusReason.textZh : focusReason.text}</p>
                        </div>
                      ) : null}
                      {personalitySubtitle ? (
                        <div className="flex items-start gap-2">
                          <span aria-hidden>🧭</span>
                          <p className="text-xs text-foreground-muted">{personalitySubtitle}</p>
                        </div>
                      ) : null}
                      <div className="flex items-start gap-2">
                        <span aria-hidden>🌱</span>
                        <p className="text-xs text-foreground-muted">{isZh ? currentColour.benefitZh : currentColour.benefit}</p>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-start gap-2">
                      <span aria-hidden>🌱</span>
                      <p className="text-xs text-foreground-muted">{isZh ? currentColour.benefitZh : currentColour.benefit}</p>
                    </div>
                  )}
                  <Link
                    href={`/colour-psychology/${currentColour.key}`}
                    className="text-sm font-semibold text-primary"
                  >
                    {t("current.learnMore", { name: (isZh ? currentColour.nameZh : currentColour.name).toLowerCase() })}
                  </Link>
                </div>
              </Card>
            ) : (
              <Card className="flex flex-col items-center gap-3 py-10 text-center">
                <span className="text-3xl" aria-hidden>🎨</span>
                <p className="text-sm text-foreground-muted">
                  {t("current.empty")}
                </p>
              </Card>
            )}

            <Card className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-semibold text-foreground">{t("explore.title")}</h2>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                {COLOUR_ORDER.map((key) => {
                  const colour = COLOUR_LIBRARY[key];
                  const isCurrent = key === currentColourKey;
                  return (
                    <Link
                      key={key}
                      href={`/colour-psychology/${key}`}
                      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface transition-shadow hover:shadow-[0_10px_30px_-18px_rgba(38,43,33,0.4)]"
                    >
                      <div className="relative h-20 w-full" style={{ background: colour.swatch }}>
                        {isCurrent ? (
                          <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-surface text-[10px] text-success" aria-hidden>
                            ✓
                          </span>
                        ) : null}
                      </div>
                      <div className="flex flex-1 flex-col gap-1 p-3">
                        <p className="text-sm font-semibold text-foreground">{isZh ? colour.nameZh : colour.name}</p>
                        <p className="line-clamp-2 text-[11px] leading-snug text-foreground-muted">
                          {(isZh ? colour.traitsZh : colour.traits).join(" • ")}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </Card>

            <Card className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-semibold text-foreground">{t("recommended.title")}</h2>
              </div>
              <p className="text-xs text-foreground-muted">{t("recommended.subtitle")}</p>
              {recommendation ? (
                <RecommendationLetter recommendation={recommendation} language={language} />
              ) : (
                <p className="text-sm text-foreground-muted">{t("recommended.empty")}</p>
              )}
            </Card>

            {recommendation ? (
              <Card className="flex flex-col gap-3">
                <h2 className="font-display text-lg font-semibold text-foreground">{t("recommendationLetter.phoneCaseCardTitle")}</h2>
                <p className="text-xs text-foreground-muted">{t("recommendationLetter.phoneCaseCardSubtitle")}</p>
                <PhoneCaseSection
                  items={recommendation.items.filter((i) => i.type === "PHONE_CASE")}
                  language={language}
                />
              </Card>
            ) : null}
          </div>

          <div className="flex flex-col gap-5">
            <Card className="flex flex-col gap-4">
              <h2 className="font-display text-lg font-semibold text-foreground">{t("howTo.title")}</h2>
              {howToTips.map((tip, i) => (
                <div key={tip.title} className="flex items-start gap-3">
                  <div className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-surface-muted" aria-hidden>
                    {HOW_TO_ICONS[i]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{tip.title}</p>
                    <p className="text-xs text-foreground-muted">{tip.body}</p>
                  </div>
                </div>
              ))}
            </Card>

            {premium ? (
              <Card className="flex flex-col gap-3">
                <h2 className="font-display text-lg font-semibold text-foreground">{t("history.title")}</h2>
                {patternHistory.length > 0 ? (
                  <div className="flex flex-wrap gap-3">
                    {patternHistory.map((entry) => {
                      const colour = COLOUR_LIBRARY[entry.colour_key as keyof typeof COLOUR_LIBRARY];
                      return (
                        <div key={entry.id} className="flex flex-col items-center gap-1">
                          <span
                            className="h-9 w-9 rounded-full border border-border"
                            style={{ background: entry.colour_swatch }}
                            aria-hidden
                          />
                          <p className="text-[10px] text-foreground-muted">
                            {new Date(entry.generated_at).toLocaleDateString(dateLocale, { month: "short", day: "numeric" })}
                          </p>
                          <p className="text-[10px] text-foreground-muted">{(isZh ? colour?.nameZh : colour?.name) ?? entry.colour_name}</p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-foreground-muted">
                    {t("history.empty")}
                  </p>
                )}
              </Card>
            ) : (
              <EntitlementGate
                title={t("history.gateTitle")}
                description={t("history.gateBody")}
              />
            )}
          </div>
        </div>
      </AppShell>
    </>
  );
}
