import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import type { GetServerSideProps } from "next";
import { useAppGuard } from "@/lib/useAppGuard";
import { DIMENSIONS } from "@/lib/blueprints";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import RadialGauge from "@/components/ui/RadialGauge";
import ProgressBar from "@/components/ui/ProgressBar";
import Button from "@/components/ui/Button";
import Chip from "@/components/ui/Chip";

const DIM_COLOR: Record<string, string> = {
  emotional_energy: "bg-energy",
  mental_clarity: "bg-clarity",
  inner_pressure: "bg-pressure",
  grounding: "bg-grounding",
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
        <Link href="/inner-reading/history"><Button variant="outline">Back to history</Button></Link>
      </AppShell>
    );
  }

  const snapshot = [...data.stateSnapshots].reverse().find((s) => s.sourceId === reading.id);
  const balance = snapshot?.balance ?? Math.round(
    (reading.dimensionScores.emotional_energy +
      reading.dimensionScores.mental_clarity +
      (100 - reading.dimensionScores.inner_pressure) +
      reading.dimensionScores.grounding) / 4
  );

  return (
    <>
      <Head><title>Your Reading — Gio</title></Head>
      <AppShell title="Your Inner Reading">
        <div className="mx-auto flex max-w-lg flex-col gap-5">
          <Card className="flex flex-col items-center gap-3 text-center">
            <RadialGauge value={balance} size={130} label="Balance" />
            {snapshot ? <Chip tone="primary">{snapshot.currentFocus}</Chip> : null}
            <p className="text-xs text-foreground-muted">
              {new Date(reading.completedAt ?? "").toLocaleString()}
            </p>
          </Card>

          <Card className="flex flex-col gap-4">
            <h2 className="font-display text-lg font-semibold text-foreground">Dimensions</h2>
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
                <div key={dim.key}>
                  <div className="mb-1 flex justify-between text-xs font-semibold text-foreground-muted">
                    <span>{dim.label}</span>
                    <span>{value}</span>
                  </div>
                  <ProgressBar value={value} colorClassName={DIM_COLOR[dim.key]} />
                </div>
              );
            })}
          </Card>

          <Card>
            <h2 className="mb-2 font-display text-lg font-semibold text-foreground">Your reading</h2>
            <p className="text-sm leading-relaxed text-foreground-muted">{reading.narrative}</p>
          </Card>

          {reading.insight ? (
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
          ) : null}

          <div className="flex gap-3">
            <Link href="/colour-psychology" className="flex-1">
              <Button fullWidth>See recommendations</Button>
            </Link>
            <Link href="/dashboard" className="flex-1">
              <Button fullWidth variant="outline">Dashboard</Button>
            </Link>
          </div>
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
