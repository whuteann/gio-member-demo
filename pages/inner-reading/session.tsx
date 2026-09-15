import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { AnimatePresence, motion, MotionConfig } from "motion/react";
import { useAppGuard } from "@/lib/useAppGuard";
import { useAppState } from "@/context/AppStateContext";
import { buildQuestionOrder, READING_QUESTION_POOL, DIMENSIONS } from "@/lib/blueprints";
import { innerReadingGate } from "@/lib/entitlement";
import { newId } from "@/lib/id";
import { DIMENSION_HEX, EASE_IN_OUT, EASE_OUT, EASE_SOFT_BACK, GOLD_HEX } from "@/lib/sessionMotion";
import AppShell from "@/components/layout/AppShell";
import Button from "@/components/ui/Button";
import Chip from "@/components/ui/Chip";
import EntitlementGate from "@/components/ui/EntitlementGate";
import AmbientField from "@/components/session/AmbientField";
import DimensionGlyph from "@/components/session/DimensionGlyph";
import MotionSlider from "@/components/session/MotionSlider";
import StepProgress from "@/components/session/StepProgress";
import CompletionMandala from "@/components/session/CompletionMandala";

const QUESTION_COUNT = 8;
// How long the "reading" transition plays before navigating to the result.
// Long enough for the 8-glyph mandala below to fully assemble (its last piece
// lands around ~1.8s) plus the heading fade, short enough not to feel stalled.
const READING_TRANSITION_MS = 2200;

// Question-to-question transition. `custom` carries the direction of travel
// (+1 forward, -1 back) so the slide always moves the way the user went.
const questionVariants = {
  enter: (dir: number) => ({ x: dir * 56, opacity: 0 }),
  center: { x: 0, opacity: 1, transition: { duration: 0.5, ease: EASE_OUT, staggerChildren: 0.07 } },
  exit: (dir: number) => ({
    x: dir * -40,
    opacity: 0,
    transition: { duration: 0.32, ease: EASE_IN_OUT, staggerChildren: 0.03 },
  }),
};
const glyphVariants = {
  enter: (dir: number) => ({ scale: 0.6, rotate: dir * 24, opacity: 0 }),
  center: { scale: 1, rotate: 0, opacity: 1, transition: { duration: 0.8, ease: EASE_SOFT_BACK } },
  exit: (dir: number) => ({ scale: 0.75, rotate: dir * -16, opacity: 0, transition: { duration: 0.3, ease: EASE_IN_OUT } }),
};
const lineVariants = {
  enter: { y: 18, opacity: 0 },
  center: { y: 0, opacity: 1, transition: { duration: 0.55, ease: EASE_OUT } },
  exit: { y: -8, opacity: 0, transition: { duration: 0.22, ease: EASE_IN_OUT } },
};

// Phase-to-phase transition (questions → reading).
const phaseVariants = {
  enter: { opacity: 0, y: 24, filter: "blur(6px)" },
  center: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.55, ease: EASE_OUT } },
  exit: { opacity: 0, y: -18, filter: "blur(6px)", transition: { duration: 0.26, ease: EASE_IN_OUT } },
};

// Text starts fading in partway through the mandala's assembly (rather than
// waiting for it to finish, as check-in's persistent "done" screen can afford
// to) so both are settled well before READING_TRANSITION_MS elapses.
const readingStagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.55 } },
};
const readingRise = {
  hidden: { y: 12, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { duration: 0.5, ease: EASE_OUT } },
};

export default function InnerReadingSessionPage() {
  const { settled, data } = useAppGuard();
  const { submitInnerReading } = useAppState();
  const router = useRouter();

  const questions = useMemo(
    () => buildQuestionOrder(READING_QUESTION_POOL, QUESTION_COUNT, newId("reading-seed")),
    []
  );
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [values, setValues] = useState<Record<number, number>>({});
  const [phase, setPhase] = useState<"questions" | "reading">("questions");

  // Once the last answer is in, hold on the assembling-glyphs transition for
  // a beat before handing off to the result page — it gives the "reading"
  // some ceremony instead of an instant jump-cut.
  useEffect(() => {
    if (phase !== "reading") return;
    const timer = setTimeout(() => {
      const answers = questions.map((q, i) => ({
        questionId: `q-${i}`,
        dimension: q.dimension,
        questionText: q.text,
        value: values[i],
      }));
      const result = submitInnerReading(answers);
      if ("error" in result) {
        router.push("/membership");
        return;
      }
      router.push(`/inner-reading/${result.readingId}/result`);
    }, READING_TRANSITION_MS);
    return () => clearTimeout(timer);
    // Deliberately only re-runs when `phase` flips to "reading" — `values`
    // and `questions` are read from the closure at that moment and don't
    // change again before the redirect fires.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

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

  const current = questions[step];
  const dimensionMeta = DIMENSIONS.find((d) => d.key === current?.dimension)!;
  const currentColor = DIMENSION_HEX[current.dimension];
  const ambientColor = phase === "questions" ? currentColor : GOLD_HEX;
  const answered = questions.map((_, i) => values[i] !== undefined);
  const answerSummary = questions.map((q, i) => ({ dimension: q.dimension, value: values[i] ?? 3 }));

  function goTo(nextStep: number) {
    setDirection(nextStep > step ? 1 : -1);
    setStep(nextStep);
  }

  return (
    <>
      <Head><title>Inner Reading — Gio</title></Head>
      <MotionConfig reducedMotion="user">
        <AppShell>
          <div className="session-stage relative isolate">
            <AmbientField color={ambientColor} />
            <div className="mx-auto max-w-lg">
              <AnimatePresence mode="wait">
                {phase === "questions" && (
                  <motion.div
                    key="questions"
                    variants={phaseVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="flex flex-col gap-6"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1">
                        <StepProgress
                          step={step}
                          colors={questions.map((q) => DIMENSION_HEX[q.dimension])}
                          answered={answered}
                          label="Inner Reading"
                        />
                      </div>
                      {gate === "ALLOW_FIRST_FREE" ? (
                        <Chip tone="accent">First reading — free</Chip>
                      ) : (
                        <Chip tone="gold">Premium</Chip>
                      )}
                    </div>

                    <div className="relative overflow-hidden">
                      <AnimatePresence mode="wait" custom={direction} initial={false}>
                        <motion.div
                          key={step}
                          custom={direction}
                          variants={questionVariants}
                          initial="enter"
                          animate="center"
                          exit="exit"
                          className="flex flex-col gap-6"
                        >
                          <motion.div
                            variants={glyphVariants}
                            custom={direction}
                            className="-mb-2 self-start rounded-full shadow-[0_14px_30px_-18px_rgba(38,43,33,0.4)]"
                          >
                            <DimensionGlyph dimension={current.dimension} value={values[step] ?? null} size={148} />
                          </motion.div>
                          <motion.p
                            variants={lineVariants}
                            className="text-xs font-semibold uppercase tracking-wide"
                            style={{ color: currentColor }}
                          >
                            {dimensionMeta.label}
                          </motion.p>
                          <motion.h2
                            variants={lineVariants}
                            className="font-display text-2xl font-medium leading-snug text-foreground sm:text-3xl"
                          >
                            {current.text}
                          </motion.h2>
                          <motion.div variants={lineVariants}>
                            <MotionSlider
                              value={values[step] ?? null}
                              onChange={(v) => setValues((prev) => ({ ...prev, [step]: v }))}
                              color={currentColor}
                              lowLabel={dimensionMeta.lowLabel}
                              highLabel={dimensionMeta.highLabel}
                            />
                          </motion.div>
                        </motion.div>
                      </AnimatePresence>
                    </div>

                    <div className="flex gap-3">
                      <AnimatePresence initial={false}>
                        {step > 0 ? (
                          <motion.div
                            key="back"
                            initial={{ opacity: 0, width: 0, marginRight: -12 }}
                            animate={{ opacity: 1, width: "auto", marginRight: 0 }}
                            exit={{ opacity: 0, width: 0, marginRight: -12 }}
                            transition={{ duration: 0.35, ease: EASE_OUT }}
                            className="overflow-hidden"
                          >
                            <Button variant="outline-solid" onClick={() => goTo(step - 1)}>
                              Back
                            </Button>
                          </motion.div>
                        ) : null}
                      </AnimatePresence>
                      <motion.div
                        className="flex-1"
                        initial={false}
                        animate={values[step] === undefined ? { scale: 1 } : { scale: [1, 1.02, 1] }}
                        transition={{ duration: 0.5, ease: EASE_OUT }}
                        whileTap={values[step] === undefined ? undefined : { scale: 0.98 }}
                      >
                        <Button
                          fullWidth
                          disabled={values[step] === undefined}
                          onClick={() => {
                            if (step + 1 < questions.length) goTo(step + 1);
                            else setPhase("reading");
                          }}
                        >
                          {step + 1 < questions.length ? "Next" : "Complete Reading"}
                        </Button>
                      </motion.div>
                    </div>
                  </motion.div>
                )}

                {phase === "reading" && (
                  <motion.div
                    key="reading"
                    variants={phaseVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="flex flex-col items-center gap-6 py-10 text-center"
                  >
                    <CompletionMandala answers={answerSummary} />
                    <motion.div variants={readingStagger} initial="hidden" animate="show" className="flex flex-col items-center gap-2">
                      <motion.h2 variants={readingRise} className="font-display text-2xl font-semibold text-foreground">
                        Reading your inner state
                      </motion.h2>
                      <motion.p variants={readingRise} className="max-w-xs text-sm text-foreground-muted">
                        Weighing what you shared against your recent patterns.
                      </motion.p>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </AppShell>
      </MotionConfig>
    </>
  );
}
