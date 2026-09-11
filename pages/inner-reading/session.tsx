import { useMemo, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { useAppGuard } from "@/lib/useAppGuard";
import { useAppState } from "@/context/AppStateContext";
import { buildQuestionOrder, READING_QUESTION_POOL, DIMENSIONS } from "@/lib/blueprints";
import { innerReadingGate } from "@/lib/entitlement";
import { newId } from "@/lib/id";
import AppShell from "@/components/layout/AppShell";
import SliderQuestionCard from "@/components/ui/SliderQuestionCard";
import Button from "@/components/ui/Button";
import EntitlementGate from "@/components/ui/EntitlementGate";
import Chip from "@/components/ui/Chip";

const QUESTION_COUNT = 8;

export default function InnerReadingSessionPage() {
  const { settled, data } = useAppGuard();
  const { submitInnerReading } = useAppState();
  const router = useRouter();

  const questions = useMemo(
    () => buildQuestionOrder(READING_QUESTION_POOL, QUESTION_COUNT, newId("reading-seed")),
    []
  );
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<Record<number, number>>({});
  const [submitting, setSubmitting] = useState(false);

  if (!settled || !data) return null;

  const gate = innerReadingGate(data.subscription);

  if (gate === "MEMBERSHIP_GATE") {
    return (
      <>
        <Head><title>Inner Reading — Gio</title></Head>
        <AppShell title="Inner Reading">
          <div className="mx-auto max-w-lg">
            <EntitlementGate
              title="You've used your free Inner Reading"
              description="Your first Inner Reading is included free. Repeat readings are available with Premium, along with full history and full recommendations."
              ctaLabel="View Premium plans"
            />
          </div>
        </AppShell>
      </>
    );
  }

  const dimensionMeta = DIMENSIONS.find((d) => d.key === questions[step]?.dimension)!;

  function finish() {
    setSubmitting(true);
    const answers = questions.map((q, i) => ({
      questionId: `q-${i}`,
      dimension: q.dimension,
      questionText: q.text,
      value: values[i],
    }));
    const result = submitInnerReading(answers);
    setSubmitting(false);
    if ("error" in result) {
      router.push("/membership");
      return;
    }
    router.push(`/inner-reading/${result.readingId}/result`);
  }

  return (
    <>
      <Head><title>Inner Reading — Gio</title></Head>
      <AppShell>
        <div className="mx-auto max-w-lg">
          <div className="mb-6 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-foreground-muted">
              Inner Reading · {step + 1} / {questions.length}
            </p>
            {gate === "ALLOW_FIRST_FREE" ? <Chip tone="accent">First reading — free</Chip> : <Chip tone="gold">Premium</Chip>}
          </div>
          <div className="flex items-center gap-1.5">
            {questions.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-colors ${i <= step ? "bg-gold" : "bg-surface-muted"}`}
              />
            ))}
          </div>
          <div className="mt-6">
            <SliderQuestionCard
              questionText={questions[step].text}
              lowLabel={dimensionMeta.lowLabel}
              highLabel={dimensionMeta.highLabel}
              value={values[step] ?? null}
              onChange={(v) => setValues((prev) => ({ ...prev, [step]: v }))}
            />
          </div>
          <div className="mt-6 flex gap-3">
            {step > 0 ? (
              <Button variant="outline" onClick={() => setStep(step - 1)}>
                Back
              </Button>
            ) : null}
            <Button
              fullWidth
              disabled={values[step] === undefined || submitting}
              onClick={() => {
                if (step + 1 < questions.length) setStep(step + 1);
                else finish();
              }}
            >
              {submitting ? "Reading…" : step + 1 < questions.length ? "Next" : "Complete Reading"}
            </Button>
          </div>
        </div>
      </AppShell>
    </>
  );
}
