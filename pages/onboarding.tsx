import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { AnimatePresence, motion } from "motion/react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setUser } from "@/store/authSlice";
import { calculateCorePersonality } from "@/lib/api/corePersonality";
import { EASE_OUT, EASE_IN_OUT, EASE_SOFT_BACK } from "@/lib/sessionMotion";
import type { Language } from "@/lib/types";
import Button from "@/components/ui/Button";
import BalanceOrb from "@/components/ui/BalanceOrb";
import AmbientField from "@/components/session/AmbientField";

type Step = "language" | "birthdate" | "reading";

// Minimum time the "reading" ceremony stays on screen, even if the real
// generation call resolves faster — the actual advance is gated on
// Promise.all([apiCall, this timer]), so a slow real response never gets
// cut short either.
const READING_MIN_DISPLAY_MS = 2600;

// Results render on their own page (/onboarding/results), not here — this
// page marks onboarding complete the instant generation succeeds (see
// gio-backend's docs/behaviour_log_0004.md), and this page's own guard
// below redirects away as soon as that happens. Rendering the reveal here
// too raced that redirect and booted the user to /dashboard before they
// ever saw it.
const AMBIENT_FALLBACK = "#8a9b7c";

const TODAY = new Date().toISOString().slice(0, 10);

const phaseVariants = {
  enter: { opacity: 0, y: 24, filter: "blur(6px)" },
  center: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.55, ease: EASE_OUT } },
  exit: { opacity: 0, y: -18, filter: "blur(6px)", transition: { duration: 0.26, ease: EASE_IN_OUT } },
};
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
  const dispatch = useAppDispatch();
  const token = useAppSelector((s) => s.auth.token);
  const user = useAppSelector((s) => s.auth.user);
  const [step, setStep] = useState<Step>("language");
  const [language, setLanguage] = useState<Language>("en");
  const [consent, setConsent] = useState(false);
  const [birthdate, setBirthdate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const navigatingAwayRef = useRef(false);

  useEffect(() => {
    if (!token) {
      router.replace("/auth/login");
      return;
    }
    if (user?.onboarding_completed_at && !navigatingAwayRef.current) {
      router.replace("/dashboard");
    }
  }, [token, user, router]);

  if (!token || !user || user.onboarding_completed_at) return null;

  async function submitBirthdate() {
    if (!token) return;
    setError(null);
    setSubmitting(true);
    setStep("reading");
    try {
      const minDisplay = new Promise((resolve) => setTimeout(resolve, READING_MIN_DISPLAY_MS));
      await Promise.all([calculateCorePersonality(token, { date_of_birth: birthdate, language }), minDisplay]);
      // Onboarding is complete the moment generation succeeds (the backend
      // already marked it so). Suppress this page's own "already
      // completed" redirect *before* dispatching, then navigate ourselves
      // to the results page — otherwise the guard effect above races our
      // own navigation and both try to redirect at once.
      navigatingAwayRef.current = true;
      dispatch(setUser({ ...user!, onboarding_completed_at: new Date().toISOString() }));
      router.push("/onboarding/results");
    } catch {
      setError("Something went wrong reading your birthdate. Please try again.");
      setStep("birthdate");
      setSubmitting(false);
    }
  }

  return (
    <>
      <Head><title>Welcome — Gio</title></Head>
      <div className="relative isolate min-h-screen overflow-hidden">
        {step === "reading" ? <AmbientField color={AMBIENT_FALLBACK} /> : null}
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
                    Gio reads your birthdate to derive your Core Personality and a
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
                {error ? <p className="text-sm font-medium text-danger">{error}</p> : null}
                <Button fullWidth disabled={!birthdate || submitting} onClick={submitBirthdate}>
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
                  <BalanceOrb color={AMBIENT_FALLBACK} size={128}>
                    <span className="text-3xl" aria-hidden>✨</span>
                  </BalanceOrb>
                </motion.div>
                <motion.div variants={readingStagger} initial="hidden" animate="show" className="flex flex-col items-center gap-2">
                  <motion.h2 variants={rise} className="font-display text-2xl font-semibold text-foreground">
                    Reading your birth code
                  </motion.h2>
                  <motion.p variants={rise} className="max-w-xs text-sm text-foreground-muted">
                    Deriving your Core Personality and a colour to support it — this takes a
                    little longer than usual, it&apos;s worth the wait.
                  </motion.p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
