import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import type { GetServerSideProps } from "next";
import { useAppGuard } from "@/lib/useAppGuard";
import { COLOUR_LIBRARY } from "@/lib/blueprints";
import type { ColourKey } from "@/lib/types";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import Chip from "@/components/ui/Chip";

function isColourKey(value: string | null): value is ColourKey {
  return !!value && value in COLOUR_LIBRARY;
}

export default function ColourMeaningPage() {
  const { settled } = useAppGuard();
  const router = useRouter();
  const key = typeof router.query.key === "string" ? router.query.key : null;
  const colour = isColourKey(key) ? COLOUR_LIBRARY[key] : null;

  if (!settled) return null;

  return (
    <>
      <Head><title>{colour ? `${colour.name} — Colour Psychology` : "Colour Psychology"} — Gio</title></Head>
      <AppShell>
        <div className="mx-auto flex max-w-2xl flex-col gap-5">
          <Link href="/colour-psychology" className="text-sm font-semibold text-primary">
            ← Back to Colour Psychology
          </Link>

          {colour ? (
            <article className="flex flex-col gap-5">
              <div className="h-48 w-full rounded-[1.75rem] sm:h-64" style={{ background: colour.swatch }} aria-hidden />

              <div>
                <h1 className="font-display text-3xl font-semibold text-foreground">{colour.name}</h1>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {colour.traits.map((t) => (
                    <Chip key={t} tone="primary">{t}</Chip>
                  ))}
                </div>
              </div>

              <p className="text-base font-medium leading-relaxed text-foreground">{colour.description}</p>

              <Card>
                <h2 className="mb-2 font-display text-lg font-semibold text-foreground">About {colour.name}</h2>
                <p className="text-sm leading-relaxed text-foreground-muted">{colour.article}</p>
              </Card>

              <Card>
                <h2 className="mb-2 font-display text-lg font-semibold text-foreground">When it&apos;s recommended</h2>
                <p className="text-sm leading-relaxed text-foreground-muted">{colour.benefit}</p>
              </Card>

              <Card className="flex flex-col gap-2">
                <h2 className="font-display text-lg font-semibold text-foreground">Affirmations</h2>
                {colour.affirmations.map((a) => (
                  <p key={a} className="text-sm font-medium text-foreground">&ldquo;{a}&rdquo;</p>
                ))}
              </Card>
            </article>
          ) : (
            <Card className="flex flex-col items-center gap-3 py-10 text-center">
              <p className="text-sm text-foreground-muted">Colour not found.</p>
            </Card>
          )}
        </div>
      </AppShell>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async () => ({ props: {} });
