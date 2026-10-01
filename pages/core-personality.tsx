import { useState } from "react";
import Head from "next/head";
import { AnimatePresence, motion } from "motion/react";
import { useTranslation } from "react-i18next";
import { useAuthGuard } from "@/lib/useAuthGuard";
import { useApiResource } from "@/lib/useApiResource";
import { useLanguage } from "@/lib/useLanguage";
import { getCurrentCorePersonality } from "@/lib/api/corePersonality";
import { getUnlockedContent } from "@/lib/api/progress";
import { ApiError } from "@/lib/api/client";
import { COLOUR_LIBRARY } from "@/lib/blueprints";
import { colourScores, localized, localizedPoints, topColourKey } from "@/lib/corePersonalityDisplay";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import PersonalityColour from "@/components/ui/PersonalityColour";
import NumeralBadge from "@/components/ui/NumeralBadge";
import ColourBreakdown from "@/components/ui/ColourBreakdown";
import SectionRail from "@/components/ui/SectionRail";
import GrowthTree from "@/components/ui/GrowthTree";
import UnlockedGallery from "@/components/ui/UnlockedGallery";

export default function CorePersonalityPage() {
  const { settled, token } = useAuthGuard();
  const { t } = useTranslation("corePersonality");
  const { language } = useLanguage();
  const [tab, setTab] = useState<"overview" | "colour" | "collection">("overview");

  const OVERVIEW_SECTIONS = [
    { id: "cp-overview", label: t("rail.overview") },
    { id: "cp-birthday", label: t("rail.birthday") },
    { id: "cp-lifepath", label: t("rail.lifePath") },
    { id: "cp-talent", label: t("rail.talent") },
  ];

  const { data: personality, loading } = useApiResource(
    token
      ? () => getCurrentCorePersonality(token).catch((e) => (e instanceof ApiError && e.status === 404 ? null : Promise.reject(e)))
      : null,
    [token]
  );
  const { data: unlocks } = useApiResource(token ? () => getUnlockedContent(token) : null, [token]);

  if (!settled || !token) return null;
  if (loading) {
    return (
      <AppShell title={t("title")}>
        <p className="text-sm text-foreground-muted">{t("loading")}</p>
      </AppShell>
    );
  }
  if (!personality) {
    return (
      <AppShell title={t("title")}>
        <p className="text-sm text-foreground-muted">{t("notStarted")}</p>
      </AppShell>
    );
  }

  const topColour = topColourKey(personality);
  const colour = COLOUR_LIBRARY[topColour];

  return (
    <>
      <Head><title>{t("title")} — Gio</title></Head>
      <AppShell title={t("title")}>
        <div className="mx-auto flex max-w-lg flex-col gap-5">
          <div className="flex gap-1 rounded-full border border-border bg-surface p-1">
            <button
              type="button"
              onClick={() => setTab("overview")}
              className={`flex-1 rounded-full py-2 text-xs font-semibold transition-colors sm:text-sm ${
                tab === "overview" ? "bg-primary text-primary-foreground" : "text-foreground-muted"
              }`}
            >
              {t("tabs.overview")}
            </button>
            <button
              type="button"
              onClick={() => setTab("colour")}
              className={`flex-1 rounded-full py-2 text-xs font-semibold transition-colors sm:text-sm ${
                tab === "colour" ? "bg-primary text-primary-foreground" : "text-foreground-muted"
              }`}
            >
              {t("tabs.colour")}
            </button>
            <button
              type="button"
              onClick={() => setTab("collection")}
              className={`flex-1 rounded-full py-2 text-xs font-semibold transition-colors sm:text-sm ${
                tab === "collection" ? "bg-primary text-primary-foreground" : "text-foreground-muted"
              }`}
            >
              {t("tabs.collection")}
            </button>
          </div>

          <AnimatePresence mode="wait">
            {tab === "colour" ? (
              <motion.div
                key="colour"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                <ColourBreakdown scores={colourScores(personality)} />
              </motion.div>
            ) : tab === "collection" ? (
              <motion.div
                key="collection"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                {unlocks ? (
                  <Card className="flex flex-col items-center gap-3">
                    <div className="text-center">
                      <h3 className="font-display text-lg font-semibold text-foreground">{t("collection.title")}</h3>
                      <p className="text-xs text-foreground-muted">
                        {t("collection.subtitle")}
                      </p>
                    </div>
                    <UnlockedGallery
                      language={language}
                      sections={[
                        { key: "affirmations", label: t("collection.affirmations"), emoji: "✨", items: unlocks.affirmations },
                        { key: "insights", label: t("collection.insights"), emoji: "💡", items: unlocks.insights },
                        { key: "reflections", label: t("collection.reflections"), emoji: "🌿", items: unlocks.reflection_questions },
                      ]}
                    />
                  </Card>
                ) : (
                  <p className="text-center text-sm text-foreground-muted">{t("collection.loading")}</p>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="flex flex-col gap-5"
              >
                <Card id="cp-overview" className="flex flex-col items-center gap-2 text-center">
                  <PersonalityColour colourKey={colour.key} swatch={colour.swatch} size={112} />
                  <h2 className="font-display text-3xl font-semibold text-foreground">
                    {localized(personality, "title", language)}
                  </h2>
                  <p className="text-sm font-medium text-foreground-muted">
                    {localized(personality, "subtitle", language)}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-foreground-muted">
                    {localized(personality, "overview", language)}
                  </p>
                </Card>

                <Card id="cp-birthday" className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-lg font-semibold text-foreground">{t("sections.birthdayNumber")}</h3>
                    <NumeralBadge value={personality.birthday_number ?? "—"} accent="var(--gold)" />
                  </div>
                  <ul className="flex flex-col gap-2">
                    {localizedPoints(personality, "birthday_number_points", language).map((point, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm leading-relaxed text-foreground-muted">
                        <span aria-hidden>{point.emoji}</span>
                        <span>{point.text}</span>
                      </li>
                    ))}
                  </ul>
                </Card>

                <Card id="cp-lifepath" className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-lg font-semibold text-foreground">{t("sections.lifePathNumber")}</h3>
                    <NumeralBadge value={personality.life_path_number ?? "—"} accent="var(--accent)" />
                  </div>
                  <ul className="flex flex-col gap-2">
                    {localizedPoints(personality, "life_path_number_points", language).map((point, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm leading-relaxed text-foreground-muted">
                        <span aria-hidden>{point.emoji}</span>
                        <span>{point.text}</span>
                      </li>
                    ))}
                  </ul>
                </Card>

                <Card id="cp-talent" className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-lg font-semibold text-foreground">{t("sections.talentNumber")}</h3>
                    <NumeralBadge value={personality.talent_number ?? "—"} accent="var(--primary)" />
                  </div>
                  <ul className="flex flex-col gap-2">
                    {localizedPoints(personality, "talent_number_points", language).map((point, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm leading-relaxed text-foreground-muted">
                        <span aria-hidden>{point.emoji}</span>
                        <span>{point.text}</span>
                      </li>
                    ))}
                  </ul>
                </Card>

                {unlocks ? (
                  <Card id="cp-tree" className="flex flex-col items-center gap-1">
                    <h3 className="flex items-center gap-2 font-display text-lg font-semibold text-foreground">
                      <span aria-hidden>🌳</span> {t("tree.title")}
                    </h3>
                    <p className="mb-2 text-center text-xs text-foreground-muted">
                      {t("tree.subtitle")}
                    </p>
                    <GrowthTree
                      colourKey={topColour}
                      language={language}
                      size={220}
                      items={[
                        ...unlocks.affirmations.map((item) => ({ ...item, sectionLabel: t("tree.affirmation"), sectionEmoji: "✨" })),
                        ...unlocks.insights.map((item) => ({ ...item, sectionLabel: t("tree.insight"), sectionEmoji: "💡" })),
                        ...unlocks.reflection_questions.map((item) => ({ ...item, sectionLabel: t("tree.reflection"), sectionEmoji: "🌿" })),
                      ]}
                    />
                  </Card>
                ) : null}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {tab === "overview" ? <SectionRail sections={OVERVIEW_SECTIONS} /> : null}
      </AppShell>
    </>
  );
}
