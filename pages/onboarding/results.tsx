import { useRouter } from "next/router";
import Head from "next/head";
import { motion } from "motion/react";
import { useAuthGuard } from "@/lib/useAuthGuard";
import { useApiResource } from "@/lib/useApiResource";
import { getCurrentCorePersonality } from "@/lib/api/corePersonality";
import { ApiError } from "@/lib/api/client";
import { COLOUR_LIBRARY } from "@/lib/blueprints";
import { colourScores, localized, topColourKey } from "@/lib/corePersonalityDisplay";
import { EASE_OUT } from "@/lib/sessionMotion";
import type { Language } from "@/lib/types";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import ColourOfTheDay from "@/components/ui/ColourOfTheDay";
import ColourBreakdown from "@/components/ui/ColourBreakdown";
import SectionRail from "@/components/ui/SectionRail";
import AmbientField from "@/components/session/AmbientField";

const REVEAL_SECTIONS = [
  { id: "reveal-overview", label: "Overview" },
  { id: "reveal-colour", label: "Colour" },
  { id: "reveal-birthday", label: "Birthday" },
  { id: "reveal-lifepath", label: "Life Path" },
  { id: "reveal-talent", label: "Talent" },
  { id: "reveal-colourbreakdown", label: "Colours" },
];

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};
const rise = {
  hidden: { y: 18, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { duration: 0.55, ease: EASE_OUT } },
};

/**
 * A separate page from /onboarding on purpose — onboarding marks itself
 * complete (see gio-backend's docs/behaviour_log_0004.md) the instant
 * Core Personality generation succeeds, so /onboarding's own "already
 * completed, get out" guard would boot the user straight to /dashboard
 * before they ever saw their results if this content stayed on that page.
 * This page has no such guard conflict: reaching it *requires* onboarding
 * to already be complete.
 */
export default function OnboardingResultsPage() {
  const router = useRouter();
  const { settled, token, user } = useAuthGuard();

  const { data: personality, loading } = useApiResource(
    token
      ? () => getCurrentCorePersonality(token).catch((e) => (e instanceof ApiError && e.status === 404 ? null : Promise.reject(e)))
      : null,
    [token]
  );

  if (!settled || !token || !user) return null;
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <p className="text-sm text-foreground-muted">Loading your Core Personality…</p>
      </div>
    );
  }
  if (!personality) {
    // Nothing to reveal (e.g. reached this URL directly without ever
    // calculating) — back to the start of onboarding, not a dead end.
    router.replace("/onboarding");
    return null;
  }

  // primary_language reflects what was actually requested/generated at
  // /calculate time — the authoritative source here, not user.preferred_language
  // (onboarding no longer syncs that field; see submitBirthdate in
  // pages/onboarding.tsx).
  const language: Language = (personality.primary_language as Language) ?? "en";
  const topColour = topColourKey(personality);
  const colour = COLOUR_LIBRARY[topColour];

  return (
    <>
      <Head><title>Your Core Personality — Gio</title></Head>
      <div className="relative isolate min-h-screen overflow-hidden">
        <AmbientField color={colour.swatch} />
        <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-6 py-10">
          <motion.div variants={stagger} initial="hidden" animate="show" className="flex flex-col gap-5">
            <motion.div variants={rise}>
              <Card id="reveal-overview" className="flex flex-col items-center gap-2 text-center">
                <ColourOfTheDay colourKey={colour.key} swatch={colour.swatch} size={112} />
                <h2 className="font-display text-2xl font-semibold text-foreground">
                  {localized(personality, "title", language)}
                </h2>
                <p className="text-sm font-medium text-foreground-muted">
                  {localized(personality, "subtitle", language)}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-foreground-muted">
                  {localized(personality, "overview", language)}
                </p>
              </Card>
            </motion.div>

            <motion.div variants={rise}>
              <Card id="reveal-colour" className="flex flex-col gap-3">
                <h3 className="font-display text-lg font-semibold text-foreground">Your supportive colour</h3>
                <div className="flex items-center gap-3">
                  <span
                    className="h-10 w-10 flex-none rounded-full border border-border"
                    style={{ background: colour.swatch }}
                    aria-hidden
                  />
                  <div>
                    <p className="text-sm font-semibold text-foreground">{colour.name}</p>
                    <p className="text-xs text-foreground-muted">{colour.traits.join(" • ")}</p>
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-foreground-muted">{colour.benefit}</p>
              </Card>
            </motion.div>

            <motion.div variants={rise}>
              <Card id="reveal-birthday" className="flex flex-col gap-2">
                <div className="flex items-baseline justify-between">
                  <h3 className="font-display text-lg font-semibold text-foreground">Birthday Number</h3>
                  <span className="font-display text-2xl font-semibold text-primary">{personality.birthday_number}</span>
                </div>
                <p className="text-sm leading-relaxed text-foreground-muted">
                  {localized(personality, "birthday_number_content", language)}
                </p>
              </Card>
            </motion.div>

            <motion.div variants={rise}>
              <Card id="reveal-lifepath" className="flex flex-col gap-2">
                <div className="flex items-baseline justify-between">
                  <h3 className="font-display text-lg font-semibold text-foreground">Life Path Number</h3>
                  <span className="font-display text-2xl font-semibold text-primary">{personality.life_path_number}</span>
                </div>
                <p className="text-sm leading-relaxed text-foreground-muted">
                  {localized(personality, "life_path_number_content", language)}
                </p>
              </Card>
            </motion.div>

            <motion.div variants={rise}>
              <Card id="reveal-talent" className="flex flex-col gap-2">
                <div className="flex items-baseline justify-between">
                  <h3 className="font-display text-lg font-semibold text-foreground">Talent Number</h3>
                  <span className="font-display text-2xl font-semibold text-primary">{personality.talent_number}</span>
                </div>
                <p className="text-sm leading-relaxed text-foreground-muted">
                  {localized(personality, "talent_number_content", language)}
                </p>
              </Card>
            </motion.div>

            <motion.div id="reveal-colourbreakdown" variants={rise}>
              <ColourBreakdown scores={colourScores(personality)} />
            </motion.div>

            <motion.div variants={rise} className="flex flex-col gap-3">
              <Button fullWidth onClick={() => router.push("/inner-reading/session")}>
                Start my first Inner Reading
              </Button>
              <Button fullWidth variant="outline" onClick={() => router.push("/dashboard")}>
                Go to Dashboard
              </Button>
            </motion.div>
          </motion.div>
        </div>
        <SectionRail sections={REVEAL_SECTIONS} />
      </div>
    </>
  );
}
