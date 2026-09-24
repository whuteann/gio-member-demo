import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import type { GetServerSideProps } from "next";
import { motion } from "motion/react";
import { useAuthGuard } from "@/lib/useAuthGuard";
import { useApiResource } from "@/lib/useApiResource";
import { getCheckInResults } from "@/lib/api/reflections";
import { localizedSnapshot } from "@/lib/snapshotDisplay";
import { COLOUR_LIBRARY, DIMENSIONS } from "@/lib/blueprints";
import { EASE_OUT, EASE_SOFT_BACK, GOLD_HEX } from "@/lib/sessionMotion";
import type { ColourKey, Language } from "@/lib/types";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import ColourOfTheDay from "@/components/ui/ColourOfTheDay";
import ProgressBar from "@/components/ui/ProgressBar";
import Button from "@/components/ui/Button";
import Chip from "@/components/ui/Chip";
import AmbientField from "@/components/session/AmbientField";
import DimensionGlyph from "@/components/session/DimensionGlyph";

const DIM_COLOR: Record<string, string> = {
  emotional_energy: "bg-energy",
  mental_clarity: "bg-clarity",
  inner_pressure: "bg-pressure",
  grounding: "bg-grounding",
};

const pageStagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};
const cardRise = {
  hidden: { y: 18, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { duration: 0.55, ease: EASE_OUT } },
};
const glyphPop = {
  hidden: { scale: 0.5, opacity: 0 },
  show: { scale: 1, opacity: 1, transition: { duration: 0.5, ease: EASE_SOFT_BACK } },
};

export default function CheckInResultPage() {
  const { settled, token, user } = useAuthGuard();
  const router = useRouter();
  const id = typeof router.query.id === "string" ? router.query.id : null;
  const language: Language = (user?.preferred_language as Language) ?? "en";

  const { data: results, loading, error } = useApiResource(
    token && id ? () => getCheckInResults(token, id) : null,
    [token, id]
  );

  if (!settled || !token || !id) return null;
  if (loading) {
    return (
      <AppShell title="Your Check-In">
        <p className="text-sm text-foreground-muted">Loading your check-in…</p>
      </AppShell>
    );
  }
  if (error || !results) {
    return (
      <AppShell title="Check-in not found">
        <Link href="/check-in/history"><Button variant="outline-solid">Back to history</Button></Link>
      </AppShell>
    );
  }

  const { session, snapshot } = results;
  const dims = snapshot
    ? {
        emotional_energy: snapshot.emotional_energy,
        mental_clarity: snapshot.mental_clarity,
        inner_pressure: snapshot.inner_pressure,
        grounding: snapshot.grounding,
      }
    : Object.fromEntries(
        DIMENSIONS.map((dim) => [dim.key, session.answers.find((a) => a.dimension === dim.key)?.normalized_value ?? 50])
      );

  const colourKey = (snapshot?.colour_key as ColourKey | undefined) ?? "gold";
  const recommendedColour = COLOUR_LIBRARY[colourKey];
  const ambientColor = recommendedColour?.swatch ?? GOLD_HEX;

  const insight = snapshot ? localizedSnapshot(snapshot, "insight", language) : null;
  const reflectionQuestion = snapshot ? localizedSnapshot(snapshot, "reflection_question", language) : null;
  const reminder = snapshot ? localizedSnapshot(snapshot, "reminder", language) : null;
  const friendlyAdvice = snapshot ? localizedSnapshot(snapshot, "friendly_advice", language) : null;
  const affirmation = snapshot ? localizedSnapshot(snapshot, "affirmation", language) : null;
  const currentFocus = snapshot ? localizedSnapshot(snapshot, "current_focus", language) : null;

  return (
    <>
      <Head><title>Your Check-In — Gio</title></Head>
      <AppShell title="Your Check-In">
        <div className="session-stage relative isolate">
          <AmbientField color={ambientColor} />
          <motion.div
            variants={pageStagger}
            initial="hidden"
            animate="show"
            className="mx-auto flex max-w-lg flex-col gap-5"
          >
            <motion.div variants={cardRise}>
              <Card className="flex flex-col items-center gap-3 text-center">
                <ColourOfTheDay colourKey={recommendedColour?.key ?? "gold"} swatch={ambientColor} size={128} />
                <Chip tone="primary">{currentFocus ?? session.summary ?? "Check-in complete"}</Chip>
                <p className="text-xs text-foreground-muted">
                  {new Date(session.completed_at ?? session.started_at).toLocaleString()}
                </p>
              </Card>
            </motion.div>

            <motion.div variants={cardRise}>
              <Card className="flex flex-col gap-4">
                <h2 className="font-display text-lg font-semibold text-foreground">Dimensions</h2>
                <motion.div variants={pageStagger} className="flex flex-col gap-4">
                  {DIMENSIONS.map((dim) => {
                    const value = dims[dim.key as keyof typeof dims] as number;
                    return (
                      <motion.div key={dim.key} variants={cardRise} className="flex items-center gap-3">
                        <motion.div variants={glyphPop} className="shrink-0">
                          <DimensionGlyph dimension={dim.key} value={Math.max(1, Math.min(5, Math.round(value / 20)))} size={44} />
                        </motion.div>
                        <div className="min-w-0 flex-1">
                          <div className="mb-1 flex justify-between text-xs font-semibold text-foreground-muted">
                            <span>{dim.label}</span>
                            <span>{value}</span>
                          </div>
                          <ProgressBar value={value} colorClassName={DIM_COLOR[dim.key]} />
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              </Card>
            </motion.div>

            {insight ? (
              <motion.div variants={cardRise}>
                <Card className="flex flex-col gap-3">
                  <h2 className="font-display text-lg font-semibold text-foreground">Latest Insight</h2>
                  <p className="text-2xl leading-none text-accent">&ldquo;</p>
                  <p className="-mt-3 text-sm font-medium text-foreground">{insight}</p>
                  {reflectionQuestion ? (
                    <div className="flex flex-col gap-1 border-t border-border pt-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-foreground-muted">
                        💡 Reflection Question
                      </p>
                      <p className="text-sm text-foreground-muted">{reflectionQuestion}</p>
                    </div>
                  ) : null}
                </Card>
              </motion.div>
            ) : null}

            {reminder || friendlyAdvice || affirmation ? (
              <motion.div variants={cardRise}>
                <Card className="flex flex-col gap-3">
                  {reminder ? (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-foreground-muted">🌿 Reminder for you</p>
                      <p className="mt-1 text-sm text-foreground">{reminder}</p>
                    </div>
                  ) : null}
                  {friendlyAdvice ? (
                    <div className="border-t border-border pt-3 first:border-t-0 first:pt-0">
                      <p className="text-xs font-semibold uppercase tracking-wide text-foreground-muted">🤝 Friendly advice</p>
                      <p className="mt-1 text-sm text-foreground">{friendlyAdvice}</p>
                    </div>
                  ) : null}
                  {affirmation ? (
                    <div className="border-t border-border pt-3 first:border-t-0 first:pt-0">
                      <p className="text-xs font-semibold uppercase tracking-wide text-foreground-muted">✨ Affirmation</p>
                      <p className="mt-1 text-sm italic text-foreground">{affirmation}</p>
                    </div>
                  ) : null}
                </Card>
              </motion.div>
            ) : null}

            {session.private_note ? (
              <motion.div variants={cardRise}>
                <Card>
                  <h2 className="mb-2 font-display text-lg font-semibold text-foreground">Your note</h2>
                  <p className="text-sm leading-relaxed text-foreground-muted">{session.private_note}</p>
                </Card>
              </motion.div>
            ) : null}

            <motion.div variants={cardRise} className="flex gap-3">
              <Link href="/colour-psychology" className="flex-1">
                <Button fullWidth>See recommendations</Button>
              </Link>
              <Link href="/dashboard" className="flex-1">
                <Button fullWidth variant="outline-solid">Dashboard</Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </AppShell>
    </>
  );
}

// The API fetch happens client-side (needs the bearer token from Redux), so
// SSR here just satisfies Next's requirement that dynamic Pages-Router
// routes have either getStaticPaths or getServerSideProps.
export const getServerSideProps: GetServerSideProps = async () => ({ props: {} });
