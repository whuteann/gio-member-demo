import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import type { GetServerSideProps } from "next";
import { motion } from "motion/react";
import { useAppGuard } from "@/lib/useAppGuard";
import { COLOUR_LIBRARY, DIMENSIONS } from "@/lib/blueprints";
import { colourKeyForFocus } from "@/lib/recommendation";
import { EASE_OUT, EASE_SOFT_BACK, GOLD_HEX } from "@/lib/sessionMotion";
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

// Same reveal rhythm as the "reading" assembly transition and the check-in
// completion screen this page follows on from — cards rise in one after
// another rather than appearing all at once.
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

export default function InnerReadingResultPage() {
  const { settled, data } = useAppGuard();
  const router = useRouter();
  const id = typeof router.query.id === "string" ? router.query.id : null;

  if (!settled || !data || !id) return null;

  const reading = data.innerReadings.find((r) => r.id === id);
  if (!reading || !reading.dimensionScores) {
    return (
      <AppShell title="Reading not found">
        <Link href="/inner-reading/history"><Button variant="outline-solid">Back to history</Button></Link>
      </AppShell>
    );
  }

  const snapshot = [...data.stateSnapshots].reverse().find((s) => s.sourceId === reading.id);
  const recommendedColour = snapshot ? COLOUR_LIBRARY[colourKeyForFocus(snapshot.currentFocus)] : null;
  const ambientColor = recommendedColour?.swatch ?? GOLD_HEX;
  const colourKey = recommendedColour?.key ?? "gold";

  return (
    <>
      <Head><title>Your Reading — Gio</title></Head>
      <AppShell title="Your Inner Reading">
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
                <ColourOfTheDay colourKey={colourKey} swatch={ambientColor} size={128} />
                {snapshot ? <Chip tone="primary">{snapshot.currentFocus}</Chip> : null}
                <p className="text-xs text-foreground-muted">
                  {new Date(reading.completedAt ?? "").toLocaleString()}
                </p>
              </Card>
            </motion.div>

            <motion.div variants={cardRise}>
              <Card className="flex flex-col gap-4">
                <h2 className="font-display text-lg font-semibold text-foreground">Dimensions</h2>
                <motion.div variants={pageStagger} className="flex flex-col gap-4">
                  {DIMENSIONS.map((dim) => {
                    const value =
                      dim.key === "emotional_energy"
                        ? reading.dimensionScores!.emotional_energy
                        : dim.key === "mental_clarity"
                          ? reading.dimensionScores!.mental_clarity
                          : dim.key === "inner_pressure"
                            ? reading.dimensionScores!.inner_pressure
                            : reading.dimensionScores!.grounding;
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

            <motion.div variants={cardRise}>
              <Card>
                <h2 className="mb-2 font-display text-lg font-semibold text-foreground">Your reading</h2>
                <p className="text-sm leading-relaxed text-foreground-muted">{reading.narrative}</p>
              </Card>
            </motion.div>

            {reading.insight ? (
              <motion.div variants={cardRise}>
                <Card className="flex flex-col gap-3">
                  <h2 className="font-display text-lg font-semibold text-foreground">Latest Insight</h2>
                  <p className="text-sm font-medium text-foreground">{reading.insight}</p>
                  {reading.reflectionQuestion ? (
                    <div className="flex flex-col gap-1 border-t border-border pt-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-foreground-muted">
                        💡 Reflection Question
                      </p>
                      <p className="text-sm text-foreground-muted">{reading.reflectionQuestion}</p>
                    </div>
                  ) : null}
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

// All member data lives client-side (localStorage), so this route's content
// is only ever resolved in the browser — SSR here just satisfies Next's
// requirement that dynamic Pages-Router routes have either getStaticPaths
// or getServerSideProps.
export const getServerSideProps: GetServerSideProps = async () => ({ props: {} });
