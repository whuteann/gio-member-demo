import { useState } from "react";
import Head from "next/head";
import { useAuthGuard } from "@/lib/useAuthGuard";
import { useApiResource } from "@/lib/useApiResource";
import { getCurrentCorePersonality } from "@/lib/api/corePersonality";
import { ApiError } from "@/lib/api/client";
import { COLOUR_LIBRARY } from "@/lib/blueprints";
import { colourScores, localized, topColourKey } from "@/lib/corePersonalityDisplay";
import type { Language } from "@/lib/types";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import ColourOfTheDay from "@/components/ui/ColourOfTheDay";
import ColourBreakdown from "@/components/ui/ColourBreakdown";
import SectionRail from "@/components/ui/SectionRail";

const OVERVIEW_SECTIONS = [
  { id: "cp-overview", label: "Overview" },
  { id: "cp-birthday", label: "Birthday" },
  { id: "cp-lifepath", label: "Life Path" },
  { id: "cp-talent", label: "Talent" },
];

export default function CorePersonalityPage() {
  const { settled, token } = useAuthGuard();
  const [tab, setTab] = useState<"overview" | "colour">("overview");

  const { data: personality, loading } = useApiResource(
    token
      ? () => getCurrentCorePersonality(token).catch((e) => (e instanceof ApiError && e.status === 404 ? null : Promise.reject(e)))
      : null,
    [token]
  );

  if (!settled || !token) return null;
  if (loading) {
    return (
      <AppShell title="Core Personality">
        <p className="text-sm text-foreground-muted">Loading your Core Personality…</p>
      </AppShell>
    );
  }
  if (!personality) {
    return (
      <AppShell title="Core Personality">
        <p className="text-sm text-foreground-muted">Complete onboarding to see your Core Personality.</p>
      </AppShell>
    );
  }

  // Core Personality is bilingual per-row (see gio-backend's
  // docs/behaviour_log_0003.md) but this page has no language switcher of
  // its own yet — show whichever language was generated first; the other
  // may still be null if the background backfill hasn't landed.
  const language: Language = (personality.primary_language as Language) ?? "en";
  const topColour = topColourKey(personality);
  const colour = COLOUR_LIBRARY[topColour];

  return (
    <>
      <Head><title>Core Personality — Gio</title></Head>
      <AppShell title="Core Personality">
        <div className="mx-auto flex max-w-lg flex-col gap-5">
          <div className="flex gap-1 rounded-full border border-border bg-surface p-1">
            <button
              type="button"
              onClick={() => setTab("overview")}
              className={`flex-1 rounded-full py-2 text-sm font-semibold transition-colors ${
                tab === "overview" ? "bg-primary text-primary-foreground" : "text-foreground-muted"
              }`}
            >
              Overview
            </button>
            <button
              type="button"
              onClick={() => setTab("colour")}
              className={`flex-1 rounded-full py-2 text-sm font-semibold transition-colors ${
                tab === "colour" ? "bg-primary text-primary-foreground" : "text-foreground-muted"
              }`}
            >
              Colour Breakdown
            </button>
          </div>

          {tab === "colour" ? (
            <ColourBreakdown scores={colourScores(personality)} />
          ) : (
            <>
              <Card id="cp-overview" className="flex flex-col items-center gap-2 text-center">
                <ColourOfTheDay colourKey={colour.key} swatch={colour.swatch} size={112} />
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

              <Card id="cp-birthday" className="flex flex-col gap-2">
                <div className="flex items-baseline justify-between">
                  <h3 className="font-display text-lg font-semibold text-foreground">Birthday Number</h3>
                  <span className="font-display text-2xl font-semibold text-primary">{personality.birthday_number}</span>
                </div>
                <p className="text-sm leading-relaxed text-foreground-muted">
                  {localized(personality, "birthday_number_content", language)}
                </p>
              </Card>

              <Card id="cp-lifepath" className="flex flex-col gap-2">
                <div className="flex items-baseline justify-between">
                  <h3 className="font-display text-lg font-semibold text-foreground">Life Path Number</h3>
                  <span className="font-display text-2xl font-semibold text-primary">{personality.life_path_number}</span>
                </div>
                <p className="text-sm leading-relaxed text-foreground-muted">
                  {localized(personality, "life_path_number_content", language)}
                </p>
              </Card>

              <Card id="cp-talent" className="flex flex-col gap-2">
                <div className="flex items-baseline justify-between">
                  <h3 className="font-display text-lg font-semibold text-foreground">Talent Number</h3>
                  <span className="font-display text-2xl font-semibold text-primary">{personality.talent_number}</span>
                </div>
                <p className="text-sm leading-relaxed text-foreground-muted">
                  {localized(personality, "talent_number_content", language)}
                </p>
              </Card>
            </>
          )}
        </div>
        {tab === "overview" ? <SectionRail sections={OVERVIEW_SECTIONS} /> : null}
      </AppShell>
    </>
  );
}
