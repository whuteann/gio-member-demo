import { useMemo, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { useAppGuard } from "@/lib/useAppGuard";
import { useAppState } from "@/context/AppStateContext";
import { buildQuestionOrder, CHECKIN_QUESTION_POOL, DIMENSIONS } from "@/lib/blueprints";
import { newId } from "@/lib/id";
import AppShell from "@/components/layout/AppShell";
import QuestionCard from "@/components/ui/QuestionCard";
import ProgressBar from "@/components/ui/ProgressBar";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Chip from "@/components/ui/Chip";

const QUESTION_COUNT = 4;

export default function CheckInPage() {
  const { settled } = useAppGuard();
  const { submitCheckIn } = useAppState();
  const router = useRouter();

  const questions = useMemo(
    () => buildQuestionOrder(CHECKIN_QUESTION_POOL, QUESTION_COUNT, newId("checkin-seed")),
    []
  );
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<Record<number, number>>({});
  const [note, setNote] = useState("");
  const [phase, setPhase] = useState<"questions" | "note" | "done">("questions");
  const [outcome, setOutcome] = useState<ReturnType<typeof submitCheckIn> | null>(null);

  if (!settled) return null;

  const dimensionMeta = DIMENSIONS.find((d) => d.key === questions[step]?.dimension)!;

  function finish() {
    const answers = questions.map((q, i) => ({
      questionId: `q-${i}`,
      dimension: q.dimension,
      questionText: q.text,
      value: values[i],
    }));
    const result = submitCheckIn(answers, note);
    setOutcome(result);
    setPhase("done");
  }

  return (
    <>
      <Head><title>Emotional Check-In — Gio</title></Head>
      <AppShell>
        <div className="mx-auto max-w-lg">
          {phase === "questions" && (
            <div className="flex flex-col gap-6">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-foreground-muted">
                  Check-In · {step + 1} / {questions.length}
                </p>
                <ProgressBar value={step + 1} max={questions.length} colorClassName="bg-accent" />
              </div>
              <QuestionCard
                questionText={questions[step].text}
                lowLabel={dimensionMeta.lowLabel}
                highLabel={dimensionMeta.highLabel}
                value={values[step] ?? null}
                onChange={(v) => setValues((prev) => ({ ...prev, [step]: v }))}
              />
              <div className="flex gap-3">
                {step > 0 ? (
                  <Button variant="outline" onClick={() => setStep(step - 1)}>
                    Back
                  </Button>
                ) : null}
                <Button
                  fullWidth
                  disabled={values[step] === undefined}
                  onClick={() => {
                    if (step + 1 < questions.length) setStep(step + 1);
                    else setPhase("note");
                  }}
                >
                  {step + 1 < questions.length ? "Next" : "Continue"}
                </Button>
              </div>
            </div>
          )}

          {phase === "note" && (
            <div className="flex flex-col gap-4">
              <h2 className="font-display text-2xl font-semibold text-foreground">
                Anything you want to note privately?
              </h2>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={5}
                placeholder="Optional — this stays private and is never used for recommendations."
                className="rounded-2xl border border-border bg-surface p-4 text-sm text-foreground outline-none focus:border-primary"
              />
              <p className="text-xs text-foreground-muted">
                Private notes are excluded from AI context and recommendations.
              </p>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setPhase("questions")}>
                  Back
                </Button>
                <Button fullWidth onClick={finish}>
                  Complete Check-In
                </Button>
              </div>
            </div>
          )}

          {phase === "done" && outcome && (
            <div className="flex flex-col items-center gap-5 py-8 text-center">
              <span className="text-4xl">🌤️</span>
              <h2 className="font-display text-2xl font-semibold text-foreground">Check-in complete</h2>
              <div className="flex flex-wrap justify-center gap-2">
                {outcome.outcome.xpAwarded > 0 ? <Chip tone="gold">+{outcome.outcome.xpAwarded} XP</Chip> : null}
                {outcome.outcome.bonusAwarded ? <Chip tone="gold">+10 XP quest bonus</Chip> : null}
                {outcome.outcome.milestone ? <Chip tone="accent">{outcome.outcome.milestone}-day streak!</Chip> : null}
                {outcome.outcome.newBadges.map((b) => (
                  <Chip key={b} tone="primary">New badge earned</Chip>
                ))}
              </div>
              <Card className="w-full text-left">
                <p className="text-sm text-foreground-muted">
                  Your recommendations have been refreshed based on this check-in.
                </p>
              </Card>
              <div className="flex w-full gap-3">
                <Button fullWidth variant="outline" onClick={() => router.push("/dashboard")}>
                  Dashboard
                </Button>
                <Button fullWidth onClick={() => router.push("/recommendation")}>
                  See recommendations
                </Button>
              </div>
            </div>
          )}
        </div>
      </AppShell>
    </>
  );
}
