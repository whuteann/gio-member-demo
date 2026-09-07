import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { useAppState } from "@/context/AppStateContext";
import { BASELINE_ASSESSMENT } from "@/lib/blueprints";
import type { BaselineAnswer } from "@/lib/scoring";
import type { Language } from "@/lib/types";
import Button from "@/components/ui/Button";
import ProgressBar from "@/components/ui/ProgressBar";

type Step = "language" | "quiz" | "done";

export default function OnboardingPage() {
  const router = useRouter();
  const { ready, user, completeOnboardingBaseline, markOnboardingComplete, updateProfile } = useAppState();
  const [step, setStep] = useState<Step>("language");
  const [language, setLanguage] = useState<Language>("en");
  const [consent, setConsent] = useState(false);
  const [quizIndex, setQuizIndex] = useState(0);
  const [answers, setAnswers] = useState<BaselineAnswer[]>([]);
  const navigatingAwayRef = useRef(false);

  useEffect(() => {
    if (ready && !user) router.replace("/auth/login");
    if (ready && user?.onboardingCompletedAt && !navigatingAwayRef.current) {
      router.replace("/dashboard");
    }
  }, [ready, user, router]);

  if (!ready || !user || user.onboardingCompletedAt) return null;

  function chooseAnswer(choice: "A" | "B") {
    const nextAnswers = [...answers, { index: quizIndex, choice }];
    setAnswers(nextAnswers);
    if (quizIndex + 1 < BASELINE_ASSESSMENT.length) {
      setQuizIndex(quizIndex + 1);
    } else {
      completeOnboardingBaseline(nextAnswers);
      updateProfile({ preferredLanguage: language });
      setStep("done");
    }
  }

  return (
    <>
      <Head><title>Welcome — Gio</title></Head>
      <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-6 py-10">
        {step === "language" && (
          <div className="flex flex-col gap-6">
            <div>
              <span className="text-3xl" aria-hidden>🌿</span>
              <h1 className="mt-3 font-display text-3xl font-semibold text-foreground">Welcome to Gio</h1>
              <p className="mt-2 text-sm text-foreground-muted">
                Let’s set up your space. Your Life Code profile will be used alongside a short
                baseline assessment to build your Core Personality.
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

            <Button fullWidth disabled={!consent} onClick={() => setStep("quiz")}>
              Continue to baseline assessment
            </Button>
          </div>
        )}

        {step === "quiz" && (
          <div className="flex flex-col gap-6">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-foreground-muted">
                Baseline assessment · {quizIndex + 1} / {BASELINE_ASSESSMENT.length}
              </p>
              <ProgressBar value={quizIndex + 1} max={BASELINE_ASSESSMENT.length} />
            </div>
            <h2 className="font-display text-2xl font-medium leading-snug text-foreground">
              {BASELINE_ASSESSMENT[quizIndex].prompt}
            </h2>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => chooseAnswer("A")}
                className="rounded-2xl border border-border bg-surface p-4 text-left text-sm font-semibold text-foreground transition-colors hover:border-primary"
              >
                {BASELINE_ASSESSMENT[quizIndex].optionA.label}
              </button>
              <button
                onClick={() => chooseAnswer("B")}
                className="rounded-2xl border border-border bg-surface p-4 text-left text-sm font-semibold text-foreground transition-colors hover:border-primary"
              >
                {BASELINE_ASSESSMENT[quizIndex].optionB.label}
              </button>
            </div>
          </div>
        )}

        {step === "done" && (
          <div className="flex flex-col items-center gap-5 text-center">
            <span className="text-4xl" aria-hidden>✨</span>
            <h2 className="font-display text-2xl font-semibold text-foreground">
              Your Core Personality is ready
            </h2>
            <p className="text-sm text-foreground-muted">
              Next, let’s complete your first Inner Reading — it’s included free, and it will
              generate your first personalised recommendations.
            </p>
            <Button
              fullWidth
              onClick={() => {
                navigatingAwayRef.current = true;
                markOnboardingComplete();
                router.push("/inner-reading");
              }}
            >
              Start my first Inner Reading
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
