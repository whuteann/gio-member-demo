import { useEffect, useState } from "react";
import Head from "next/head";
import { useAppGuard } from "@/lib/useAppGuard";
import { useAppState, useCurrentPersonality } from "@/context/AppStateContext";
import { ARCHETYPES, BASELINE_ASSESSMENT } from "@/lib/blueprints";
import type { BaselineAnswer } from "@/lib/scoring";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import Chip from "@/components/ui/Chip";
import Button from "@/components/ui/Button";
import ProgressBar from "@/components/ui/ProgressBar";
import EntitlementGate from "@/components/ui/EntitlementGate";

const PILLARS = [
  { key: "thinking" as const, label: "Thinking" },
  { key: "emotionalSensitivity" as const, label: "Emotional Sensitivity" },
  { key: "adaptability" as const, label: "Adaptability" },
  { key: "willpower" as const, label: "Willpower" },
];

function formatCountdown(ms: number): string {
  const totalMinutes = Math.ceil(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
}

export default function CorePersonalityPage() {
  const { settled } = useAppGuard();
  const { isPremiumActive, recalibratePersonality, cooldownRemainingMs } = useAppState();
  const personality = useCurrentPersonality();
  const [recalibrating, setRecalibrating] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<BaselineAnswer[]>([]);
  const [, forceTick] = useState(0);

  useEffect(() => {
    const t = setInterval(() => forceTick((n) => n + 1), 30000);
    return () => clearInterval(t);
  }, []);

  if (!settled || !personality) return null;

  const cooldownMs = cooldownRemainingMs();
  const canRecalibrate = cooldownMs <= 0;
  const archetype = ARCHETYPES[personality.archetype];

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
          <Card className="flex flex-col items-center gap-2 text-center">
            <Chip tone="primary">Version {personality.version}</Chip>
            <h2 className="font-display text-3xl font-semibold text-foreground">{archetype.name}</h2>
            <p className="text-sm text-foreground-muted">{archetype.tagline}</p>
          </Card>

          <Card>
            <h3 className="mb-2 font-display text-lg font-semibold text-foreground">Overview</h3>
            <p className="text-sm leading-relaxed text-foreground-muted">{personality.overallExplanation}</p>
          </Card>

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
        </div>
      </AppShell>
    </>
  );
}
