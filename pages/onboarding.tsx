import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { AnimatePresence, motion } from "motion/react";
import { useAppState } from "@/context/AppStateContext";
import { ARCHETYPES, buildColourPersonalityInsight, colourKeyFromSeed, COLOUR_LIBRARY } from "@/lib/blueprints";
import { EASE_OUT, EASE_IN_OUT, EASE_SOFT_BACK } from "@/lib/sessionMotion";
import type { ColourKey, CorePersonality, Language } from "@/lib/types";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import ProgressBar from "@/components/ui/ProgressBar";
import BalanceOrb from "@/components/ui/BalanceOrb";
import ColourOfTheDay from "@/components/ui/ColourOfTheDay";
import NumerologySection from "@/components/ui/NumerologySection";
import ColourBreakdown from "@/components/ui/ColourBreakdown";
import SectionRail from "@/components/ui/SectionRail";
import AmbientField from "@/components/session/AmbientField";

type Step = "language" | "birthdate" | "reading" | "reveal";

// How long the "reading" ceremony plays before the reveal — this is the
// member's very first Core Personality moment, so it holds a beat longer
// than the routine per-reading transition on the Inner Reading flow.
const READING_TRANSITION_MS = 2600;

const TODAY = new Date().toISOString().slice(0, 10);

const PILLARS = [
  { key: "thinking" as const, label: "Thinking" },
  { key: "emotionalSensitivity" as const, label: "Emotional Sensitivity" },
  { key: "adaptability" as const, label: "Adaptability" },
  { key: "willpower" as const, label: "Willpower" },
];

const REVEAL_SECTIONS = [
  { id: "reveal-overview", label: "Overview" },
  { id: "reveal-colour", label: "Colour" },
  { id: "reveal-pillars", label: "Pillars" },
  { id: "numerology-birthday", label: "Birthday" },
  { id: "numerology-lifepath", label: "Life Path" },
  { id: "numerology-talent", label: "Talent" },
  { id: "reveal-colourbreakdown", label: "Colours" },
];

const phaseVariants = {
  enter: { opacity: 0, y: 24, filter: "blur(6px)" },
  center: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.55, ease: EASE_OUT } },
  exit: { opacity: 0, y: -18, filter: "blur(6px)", transition: { duration: 0.26, ease: EASE_IN_OUT } },
};
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};
// Text on the "reading" ceremony waits for the orb's pop-in to settle before
// starting, unlike the reveal's stagger which begins almost immediately.
const readingStagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.6 } },
};
const rise = {
  hidden: { y: 18, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { duration: 0.55, ease: EASE_OUT } },
};

export default function OnboardingPage() {
  const router = useRouter();
  const { ready, user, completeOnboardingBirthdate, markOnboardingComplete, updateProfile } = useAppState();
  const [step, setStep] = useState<Step>("language");
  const [language, setLanguage] = useState<Language>("en");
  const [consent, setConsent] = useState(false);
  const [birthdate, setBirthdate] = useState("");
  const [personality, setPersonality] = useState<CorePersonality | null>(null);
  const [colourKey, setColourKey] = useState<ColourKey | null>(null);
  const navigatingAwayRef = useRef(false);

  useEffect(() => {
    if (ready && !user) router.replace("/auth/login");
    if (ready && user?.onboardingCompletedAt && !navigatingAwayRef.current) {
      router.replace("/dashboard");
    }
  }, [ready, user, router]);

  // Hold on the "reading" ceremony for a fixed beat, then reveal — mirrors
  // the Inner Reading session's post-answer transition.
  useEffect(() => {
    if (step !== "reading") return;
    const timer = setTimeout(() => setStep("reveal"), READING_TRANSITION_MS);
    return () => clearTimeout(timer);
  }, [step]);

  if (!ready || !user || user.onboardingCompletedAt) return null;

  function submitBirthdate() {
    const created = completeOnboardingBirthdate(birthdate);
    updateProfile({ preferredLanguage: language });
    setPersonality(created);
    // Onboarding's one-time "supportive colour" reveal — a birthdate-seeded
    // pick from the same 5-colour library check-ins and readings recommend
    // from later, standing in for the AI derivation the product describes.
    setColourKey(colourKeyFromSeed(birthdate));
    setStep("reading");
  }

  const archetype = personality ? ARCHETYPES[personality.archetype] : null;
  const colour = colourKey ? COLOUR_LIBRARY[colourKey] : null;
  const ambientColor = colour?.swatch ?? "#8a9b7c";

  return (
    <>
      <Head><title>Welcome — Gio</title></Head>
      <div className="relative isolate min-h-screen overflow-hidden">
        {step === "reading" || step === "reveal" ? <AmbientField color={ambientColor} /> : null}
        <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-6 py-10">
          <AnimatePresence mode="wait">
            {step === "language" && (
              <motion.div key="language" variants={phaseVariants} initial="enter" animate="center" exit="exit" className="flex flex-col gap-6">
                <div>
                  <span className="text-3xl" aria-hidden>🌿</span>
                  <h1 className="mt-3 font-display text-3xl font-semibold text-foreground">Welcome to Gio</h1>
                  <p className="mt-2 text-sm text-foreground-muted">
                    Let&apos;s set up your space. Next, we&apos;ll use your birthdate to reveal your
                    Core Personality and your supportive colour.
                  </p>
                </div>

                <div>
                  <p className="mb-2 text-sm font-semibold text-foreground">Preferred language</p>
                  <div className="grid grid-cols-2 gap-3">
                    {(["en", "zh"] as Language[]).map((lang) => (
                      <button
                        key={lang}
                        onClick={() => setLanguage(lang)}
                        className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition-colors ${
                          language === lang ? "border-primary bg-primary text-primary-foreground" : "border-border bg-surface text-foreground"
                        }`}
                      >
                        {lang === "en" ? "English" : "中文 (Mandarin)"}
                      </button>
                    ))}
                  </div>
                </div>

                <label className="flex items-start gap-3 rounded-2xl border border-border bg-surface p-4 text-sm text-foreground-muted">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="mt-0.5 h-4 w-4"
                  />
                  I consent to Gio storing my check-in and reading history to personalise my
                  experience. Private notes are never used for AI context or recommendations.
                </label>

                <Button fullWidth disabled={!consent} onClick={() => setStep("birthdate")}>
                  Continue
                </Button>
              </motion.div>
            )}

            {step === "birthdate" && (
              <motion.div key="birthdate" variants={phaseVariants} initial="enter" animate="center" exit="exit" className="flex flex-col gap-6">
                <div>
                  <span className="text-3xl" aria-hidden>🎂</span>
                  <h1 className="mt-3 font-display text-3xl font-semibold text-foreground">When were you born?</h1>
                  <p className="mt-2 text-sm text-foreground-muted">
                    Gio reads your birthdate to derive your Core Personality archetype and a
                    supportive colour matched to it — the same AI reading the rest of the app
                    builds on.
                  </p>
                </div>
                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-semibold text-foreground">Birthdate</span>
                  <input
                    type="date"
                    value={birthdate}
                    max={TODAY}
                    onChange={(e) => setBirthdate(e.target.value)}
                    className="rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-primary"
                  />
                </label>
                <Button fullWidth disabled={!birthdate} onClick={submitBirthdate}>
                  Reveal my Core Personality
                </Button>
              </motion.div>
            )}

            {step === "reading" && (
              <motion.div
                key="reading"
                variants={phaseVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="flex flex-col items-center gap-6 py-10 text-center"
              >
                <motion.div
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: [0.9, 1.06, 1], opacity: 1 }}
                  transition={{ duration: 1.4, ease: EASE_SOFT_BACK }}
                >
                  <BalanceOrb color={ambientColor} size={128}>
                    <span className="text-3xl" aria-hidden>✨</span>
                  </BalanceOrb>
                </motion.div>
                <motion.div variants={readingStagger} initial="hidden" animate="show" className="flex flex-col items-center gap-2">
                  <motion.h2 variants={rise} className="font-display text-2xl font-semibold text-foreground">
                    Reading your birth code
                  </motion.h2>
                  <motion.p variants={rise} className="max-w-xs text-sm text-foreground-muted">
                    Deriving your Core Personality archetype and a colour to support it.
                  </motion.p>
                </motion.div>
              </motion.div>
            )}

            {step === "reveal" && archetype && colour && personality && (
              <motion.div key="reveal" variants={phaseVariants} initial="enter" animate="center" exit="exit" className="flex flex-col gap-5">
                <motion.div variants={stagger} initial="hidden" animate="show" className="flex flex-col gap-5">
                  <motion.div variants={rise}>
                    <Card id="reveal-overview" className="flex flex-col items-center gap-2 text-center">
                      <ColourOfTheDay colourKey={colour.key} swatch={colour.swatch} size={112} />
                      <h2 className="font-display text-2xl font-semibold text-foreground">{archetype.name}</h2>
                      <p className="text-sm text-foreground-muted">{archetype.tagline}</p>
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
                      <p className="text-sm leading-relaxed text-foreground-muted">
                        {buildColourPersonalityInsight(colour, archetype, `${personality.id}-onboarding`)}
                      </p>
                    </Card>
                  </motion.div>

                  <motion.div variants={rise}>
                    <Card id="reveal-pillars" className="flex flex-col gap-4">
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
                  </motion.div>

                  <motion.div variants={rise}>
                    <Card className="flex items-start gap-3 bg-surface-muted">
                      <span aria-hidden>{personality.icon}</span>
                      <p className="text-sm text-foreground-muted">{archetype.reminder}</p>
                    </Card>
                  </motion.div>

                  {/* Animates itself rather than inheriting the parent stagger's
                      "rise" variant — with 6+ staggered siblings, the
                      inherited variant intermittently never fired for this
                      one (stuck at its hidden state indefinitely; verified
                      via computed styles, not just a slow transition). An
                      explicit initial/animate sidesteps that entirely. */}
                  <motion.div
                    initial={{ y: 18, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.55, ease: EASE_OUT, delay: 0.3 }}
                    className="flex flex-col gap-5"
                  >
                    <NumerologySection birthdate={birthdate} />
                  </motion.div>

                  <motion.div
                    id="reveal-colourbreakdown"
                    initial={{ y: 18, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.55, ease: EASE_OUT, delay: 0.4 }}
                  >
                    <ColourBreakdown birthdate={birthdate} />
                  </motion.div>

                  <motion.div variants={rise}>
                    <Button
                      fullWidth
                      onClick={() => {
                        navigatingAwayRef.current = true;
                        markOnboardingComplete();
                        router.push("/inner-reading/session");
                      }}
                    >
                      Start my first Inner Reading
                    </Button>
                  </motion.div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {step === "reveal" ? <SectionRail sections={REVEAL_SECTIONS} /> : null}
      </div>
    </>
  );
}
