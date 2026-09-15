import { useMemo, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import { AnimatePresence, motion, MotionConfig } from "motion/react";
import { useAppGuard } from "@/lib/useAppGuard";
import { useAppState } from "@/context/AppStateContext";
import { buildQuestionOrder, CHECKIN_QUESTION_POOL, DIMENSIONS } from "@/lib/blueprints";
import { newId } from "@/lib/id";
import { DIMENSION_HEX, EASE_IN_OUT, EASE_OUT, EASE_SOFT_BACK, GOLD_HEX, SECONDARY_HEX } from "@/lib/sessionMotion";
import AppShell from "@/components/layout/AppShell";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Chip from "@/components/ui/Chip";
import AmbientField from "@/components/session/AmbientField";
import DimensionGlyph from "@/components/session/DimensionGlyph";
import ScaleSelector from "@/components/session/ScaleSelector";
import StepProgress from "@/components/session/StepProgress";
import NoteComposer from "@/components/session/NoteComposer";
import CompletionMandala from "@/components/session/CompletionMandala";

const QUESTION_COUNT = 4;

// Question-to-question transition. `custom` carries the direction of travel
// (+1 forward, -1 back) so the slide always moves the way the user went.
const questionVariants = {
  enter: (dir: number) => ({ x: dir * 56, opacity: 0 }),
  center: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.5, ease: EASE_OUT, staggerChildren: 0.07 },
  },
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

// Phase-to-phase transition (questions → note → done).
const phaseVariants = {
  enter: { opacity: 0, y: 24, filter: "blur(6px)" },
  center: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.55, ease: EASE_OUT } },
  exit: { opacity: 0, y: -18, filter: "blur(6px)", transition: { duration: 0.26, ease: EASE_IN_OUT } },
};

const doneStagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.8 } },
};
const doneRise = {
  hidden: { y: 16, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { duration: 0.55, ease: EASE_OUT } },
};
const chipPop = {
  hidden: { scale: 0.6, opacity: 0 },
  show: { scale: 1, opacity: 1, transition: { duration: 0.5, ease: EASE_SOFT_BACK } },
};

export default function CheckInPage() {
  const { settled } = useAppGuard();
  const { submitCheckIn } = useAppState();
  const router = useRouter();

  const questions = useMemo(
    () => buildQuestionOrder(CHECKIN_QUESTION_POOL, QUESTION_COUNT, newId("checkin-seed")),
    []
  );
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [values, setValues] = useState<Record<number, number>>({});
  const [note, setNote] = useState("");
  const [phase, setPhase] = useState<"questions" | "note" | "done">("questions");
  const [outcome, setOutcome] = useState<ReturnType<typeof submitCheckIn> | null>(null);

  if (!settled) return null;

  const current = questions[step];
  const dimensionMeta = DIMENSIONS.find((d) => d.key === current?.dimension)!;
  const currentColor = DIMENSION_HEX[current.dimension];
  const ambientColor = phase === "questions" ? currentColor : phase === "note" ? GOLD_HEX : SECONDARY_HEX;
  const answered = questions.map((_, i) => values[i] !== undefined);
  const answerSummary = questions.map((q, i) => ({ dimension: q.dimension, value: values[i] ?? 3 }));

  function goTo(nextStep: number) {
    setDirection(nextStep > step ? 1 : -1);
    setStep(nextStep);
  }

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
      <MotionConfig reducedMotion="user">
        <AppShell>
          <div className="session-stage relative isolate">
            <AmbientField color={ambientColor} />
            <div className="mx-auto max-w-lg">
              <Link href="/check-in" className="mb-6 inline-block text-sm font-semibold text-primary">
                &larr; Emotional Check-In
              </Link>

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
                    <StepProgress
                      step={step}
                      colors={questions.map((q) => DIMENSION_HEX[q.dimension])}
                      answered={answered}
                    />

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
                            <ScaleSelector
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
                            else setPhase("note");
                          }}
                        >
                          {step + 1 < questions.length ? "Next" : "Continue"}
                        </Button>
                      </motion.div>
                    </div>
                  </motion.div>
                )}

                {phase === "note" && (
                  <motion.div key="note" variants={phaseVariants} initial="enter" animate="center" exit="exit">
                    <NoteComposer
                      answers={answerSummary}
                      note={note}
                      onNoteChange={setNote}
                      onBack={() => setPhase("questions")}
                      onComplete={finish}
                    />
                  </motion.div>
                )}

                {phase === "done" && outcome && (
                  <motion.div
                    key="done"
                    variants={phaseVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="flex flex-col items-center gap-5 py-4 text-center"
                  >
                    <CompletionMandala answers={answerSummary} />
                    <motion.div variants={doneStagger} initial="hidden" animate="show" className="flex w-full flex-col items-center gap-5">
                      <motion.h2 variants={doneRise} className="font-display text-2xl font-semibold text-foreground">
                        Check-in complete
                      </motion.h2>
                      <motion.div variants={doneStagger} className="flex flex-wrap justify-center gap-2">
                        {outcome.outcome.xpAwarded > 0 ? (
                          <motion.span variants={chipPop}><Chip tone="gold">+{outcome.outcome.xpAwarded} XP</Chip></motion.span>
                        ) : null}
                        {outcome.outcome.bonusAwarded ? (
                          <motion.span variants={chipPop}><Chip tone="gold">+10 XP quest bonus</Chip></motion.span>
                        ) : null}
                        {outcome.outcome.milestone ? (
                          <motion.span variants={chipPop}><Chip tone="accent">{outcome.outcome.milestone}-day streak!</Chip></motion.span>
                        ) : null}
                        {outcome.outcome.newBadges.map((b) => (
                          <motion.span key={b} variants={chipPop}><Chip tone="primary">New badge earned</Chip></motion.span>
                        ))}
                      </motion.div>
                      <motion.div variants={doneRise} className="w-full">
                        <Card className="w-full text-left">
                          <p className="text-sm text-foreground-muted">
                            Your recommendations have been refreshed based on this check-in.
                          </p>
                        </Card>
                      </motion.div>
                      <motion.div variants={doneRise} className="flex w-full gap-3">
                        <Button fullWidth variant="outline-solid" onClick={() => router.push("/dashboard")}>
                          Dashboard
                        </Button>
                        <Button fullWidth onClick={() => router.push("/colour-psychology")}>
                          See recommendations
                        </Button>
                      </motion.div>
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
