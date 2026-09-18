import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useAppGuard } from "@/lib/useAppGuard";
import { useAppState, useCurrentPersonality } from "@/context/AppStateContext";
import { ARCHETYPES, BASELINE_ASSESSMENT, buildColourPersonalityInsight, COLOUR_LIBRARY } from "@/lib/blueprints";
import { colourKeyForFocus } from "@/lib/recommendation";
import type { BaselineAnswer } from "@/lib/scoring";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import ColourOfTheDay from "@/components/ui/ColourOfTheDay";
import Button from "@/components/ui/Button";
import ProgressBar from "@/components/ui/ProgressBar";
import EntitlementGate from "@/components/ui/EntitlementGate";
import NumerologySection from "@/components/ui/NumerologySection";
import ColourBreakdown from "@/components/ui/ColourBreakdown";
import SectionRail from "@/components/ui/SectionRail";

const PILLARS = [
  { key: "thinking" as const, label: "Thinking" },
  { key: "emotionalSensitivity" as const, label: "Emotional Sensitivity" },
  { key: "adaptability" as const, label: "Adaptability" },
  { key: "willpower" as const, label: "Willpower" },
];

const OVERVIEW_SECTIONS = [
  { id: "cp-overview", label: "Overview" },
  { id: "cp-colour", label: "Colour" },
  { id: "cp-pillars", label: "Pillars" },
  { id: "numerology-birthday", label: "Birthday" },
  { id: "numerology-lifepath", label: "Life Path" },
  { id: "numerology-talent", label: "Talent" },
];

function formatCountdown(ms: number): string {
  const totalMinutes = Math.ceil(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
}

export default function CorePersonalityPage() {
  const { settled, data } = useAppGuard();
  const { isPremiumActive, recalibratePersonality, cooldownRemainingMs } = useAppState();
  const personality = useCurrentPersonality();
  const [recalibrating, setRecalibrating] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<BaselineAnswer[]>([]);
  const [tab, setTab] = useState<"overview" | "colour">("overview");
  const [, forceTick] = useState(0);

  useEffect(() => {
    const t = setInterval(() => forceTick((n) => n + 1), 30000);
    return () => clearInterval(t);
  }, []);

  if (!settled || !personality || !data) return null;

  const cooldownMs = cooldownRemainingMs();
  const canRecalibrate = cooldownMs <= 0;
  const archetype = ARCHETYPES[personality.archetype];
  const latestRecommendation = data.recommendations[data.recommendations.length - 1] ?? null;
  const colourAffinity = latestRecommendation
    ? {
        colour: COLOUR_LIBRARY[colourKeyForFocus(latestRecommendation.currentFocus)],
        insight: buildColourPersonalityInsight(
          COLOUR_LIBRARY[colourKeyForFocus(latestRecommendation.currentFocus)],
          archetype,
          `${personality.id}-${latestRecommendation.id}`
        ),
      }
    : null;

  function chooseAnswer(choice: "A" | "B") {
    const nextAnswers = [...answers, { index: step, choice }];
    setAnswers(nextAnswers);
    if (step + 1 < BASELINE_ASSESSMENT.length) {
      setStep(step + 1);
    } else {
      recalibratePersonality(nextAnswers);
      setRecalibrating(false);
      setStep(0);
      setAnswers([]);
    }
  }

  if (recalibrating) {
    return (
      <>
        <Head><title>Recalibrate — Gio</title></Head>
        <AppShell title="Recalibrate Core Personality">
          <div className="mx-auto flex max-w-lg flex-col gap-6">
            <ProgressBar value={step + 1} max={BASELINE_ASSESSMENT.length} />
            <h2 className="font-display text-2xl font-medium text-foreground">{BASELINE_ASSESSMENT[step].prompt}</h2>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => chooseAnswer("A")}
                className="rounded-2xl border border-border bg-surface p-4 text-left text-sm font-semibold text-foreground hover:border-primary"
              >
                {BASELINE_ASSESSMENT[step].optionA.label}
              </button>
              <button
                onClick={() => chooseAnswer("B")}
                className="rounded-2xl border border-border bg-surface p-4 text-left text-sm font-semibold text-foreground hover:border-primary"
              >
                {BASELINE_ASSESSMENT[step].optionB.label}
              </button>
            </div>
            <Button variant="ghost" onClick={() => { setRecalibrating(false); setStep(0); setAnswers([]); }}>
              Cancel
            </Button>
          </div>
        </AppShell>
      </>
    );
  }

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
            data.user.birthdate ? (
              <ColourBreakdown birthdate={data.user.birthdate} />
            ) : (
              <Card className="flex flex-col gap-2">
                <h3 className="font-display text-lg font-semibold text-foreground">Colour Breakdown</h3>
                <p className="text-sm text-foreground-muted">
                  This is derived from your birthdate, collected during onboarding. It isn&apos;t on file for
                  this account yet.
                </p>
              </Card>
            )
          ) : (
            <>
            <Card id="cp-overview" className="flex flex-col items-center gap-2 text-center">
              {colourAffinity ? (
                <ColourOfTheDay colourKey={colourAffinity.colour.key} swatch={colourAffinity.colour.swatch} size={112} />
              ) : null}
              <h2 className="font-display text-3xl font-semibold text-foreground">{archetype.name}</h2>
              <p className="text-sm text-foreground-muted">{archetype.tagline}</p>
            </Card>

            <Card>
              <h3 className="mb-2 font-display text-lg font-semibold text-foreground">Overview</h3>
              <p className="text-sm leading-relaxed text-foreground-muted">{personality.overallExplanation}</p>
            </Card>

            <div id="cp-colour">
            {colourAffinity ? (
              <Card className="flex flex-col gap-3">
                <h3 className="font-display text-lg font-semibold text-foreground">Your colour affinity</h3>
                <div className="flex items-center gap-3">
                  <span
                    className="h-10 w-10 flex-none rounded-full border border-border"
                    style={{ background: colourAffinity.colour.swatch }}
                    aria-hidden
                  />
                  <div>
                    <p className="text-sm font-semibold text-foreground">{colourAffinity.colour.name}</p>
                    <p className="text-xs text-foreground-muted">{colourAffinity.colour.traits.join(" • ")}</p>
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-foreground-muted">{colourAffinity.insight}</p>
                <Link
                  href={`/colour-psychology/${colourAffinity.colour.key}`}
                  className="text-sm font-semibold text-primary"
                >
                  Learn more about {colourAffinity.colour.name.toLowerCase()} →
                </Link>
              </Card>
            ) : (
              <Card className="flex flex-col gap-2">
                <h3 className="font-display text-lg font-semibold text-foreground">Your colour affinity</h3>
                <p className="text-sm text-foreground-muted">
                  Complete a check-in or Inner Reading to see how your recommended colour connects to your personality.
                </p>
              </Card>
            )}
            </div>

            <div id="cp-pillars">
            {isPremiumActive ? (
              <Card className="flex flex-col gap-4">
                <h3 className="font-display text-lg font-semibold text-foreground">The four pillars</h3>
                {PILLARS.map((pillar) => (
                  <div key={pillar.key}>
                    <div className="mb-1 flex justify-between text-xs font-semibold text-foreground-muted">
                      <span>{pillar.label}</span>
                      <span>{personality[pillar.key]}</span>
                    </div>
                    <ProgressBar value={personality[pillar.key]} />
                    <p className="mt-1.5 text-xs text-foreground-muted">{personality.pillarExplanations[pillar.key]}</p>
                  </div>
                ))}
              </Card>
            ) : (
              <EntitlementGate
                title="See your full pillar breakdown"
                description="Premium unlocks Thinking, Emotional Sensitivity, Adaptability and Willpower detail, plus recalibration."
              />
            )}
            </div>

            {data.user.birthdate ? <NumerologySection birthdate={data.user.birthdate} /> : null}

            <Card className="flex flex-col gap-2">
              <h3 className="font-display text-lg font-semibold text-foreground">Recalibrate</h3>
              <p className="text-sm text-foreground-muted">
                Recalibration creates a new, versioned personality snapshot. It’s rate-limited to
                once every 24 hours.
              </p>
              {isPremiumActive ? (
                <Button
                  variant="outline"
                  disabled={!canRecalibrate}
                  onClick={() => setRecalibrating(true)}
                >
                  {canRecalibrate ? "Recalibrate now" : `Available in ${formatCountdown(cooldownMs)}`}
                </Button>
              ) : (
                <p className="text-xs font-semibold text-accent">Available with Premium.</p>
              )}
            </Card>
            </>
          )}
        </div>
        {tab === "overview" ? <SectionRail sections={OVERVIEW_SECTIONS} /> : null}
      </AppShell>
    </>
  );
}
