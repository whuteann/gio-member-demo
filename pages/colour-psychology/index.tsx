import Head from "next/head";
import Link from "next/link";
import { useAppGuard } from "@/lib/useAppGuard";
import { useCurrentPersonality } from "@/context/AppStateContext";
import { ARCHETYPES, COLOUR_LIBRARY, COLOUR_ORDER, FOCUS_COLOUR_REASON } from "@/lib/blueprints";
import { colourKeyForFocus } from "@/lib/recommendation";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import Chip from "@/components/ui/Chip";
import ProductCard from "@/components/ui/ProductCard";
import ColourOfTheDay from "@/components/ui/ColourOfTheDay";

const HOW_TO_USE = [
  { icon: "👕", title: "Wear it", body: "Use it in your clothing or everyday accessories." },
  { icon: "🌿", title: "See it", body: "Spend time in natural greenery or matching surroundings." },
  { icon: "🪴", title: "Bring it near you", body: "Add it to your workspace or daily essentials." },
  { icon: "🔔", title: "Be reminded", body: "Use it as a gentle visual cue throughout your day." },
];

export default function ColourPsychologyPage() {
  const { settled, data } = useAppGuard();
  const personality = useCurrentPersonality();
  if (!settled || !data) return null;

  const latestRecommendation = data.recommendations[data.recommendations.length - 1] ?? null;
  const currentColourKey = latestRecommendation ? colourKeyForFocus(latestRecommendation.currentFocus) : null;
  const currentColour = currentColourKey ? COLOUR_LIBRARY[currentColourKey] : null;
  const focusReason = latestRecommendation ? FOCUS_COLOUR_REASON[latestRecommendation.currentFocus] : null;
  const archetype = personality ? ARCHETYPES[personality.archetype] : null;
  const productItems = latestRecommendation?.items.filter((i) => i.type === "PRODUCT") ?? [];

  const history = [...data.recommendations]
    .sort((a, b) => b.generatedAt.localeCompare(a.generatedAt))
    .slice(0, 8)
    .map((rec) => ({
      id: rec.id,
      colourKey: colourKeyForFocus(rec.currentFocus),
      focus: rec.currentFocus,
      date: new Date(rec.generatedAt),
    }));

  return (
    <>
      <Head><title>Colour Psychology — Gio</title></Head>
      <AppShell>
        <div>
          <h1 className="flex items-center gap-2 font-display text-2xl font-semibold text-foreground lg:text-3xl">
            Colour Psychology <span aria-hidden>🌿</span>
          </h1>
          <p className="mt-1 text-sm text-foreground-muted">
            Colours influence how we think, feel and respond. Discover the colours that support
            your current state and growth.
          </p>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-3">
          <div className="flex flex-col gap-5 lg:col-span-2">
            {currentColour ? (
              <Card className="flex flex-col gap-5 sm:flex-row">
                <div className="flex h-40 w-full flex-none items-center justify-center rounded-2xl sm:h-auto sm:w-40">
                  <ColourOfTheDay colourKey={currentColour.key} swatch={currentColour.swatch} size={152} />
                </div>
                <div className="flex flex-1 flex-col gap-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-foreground-muted">
                    Your current supportive colour
                  </p>
                  <h2 className="font-display text-2xl font-semibold text-foreground">{currentColour.name}</h2>
                  <div className="flex flex-wrap gap-1.5">
                    {currentColour.traits.map((t) => (
                      <Chip key={t} tone="neutral">{t}</Chip>
                    ))}
                  </div>
                  <p className="text-sm text-foreground-muted">{currentColour.description}</p>
                  <div className="rounded-xl bg-surface-muted p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-foreground-muted">
                      Affirmation for you
                    </p>
                    <p className="mt-1 text-sm font-medium text-foreground">
                      {currentColour.affirmations[0]} {currentColour.affirmations[1]}
                    </p>
                  </div>
                </div>
                <div className="flex w-full flex-none flex-col gap-3 sm:w-56">
                  <p className="text-sm font-semibold text-foreground">Why this colour for you?</p>
                  {focusReason ? (
                    <div className="flex items-start gap-2">
                      <span aria-hidden>{focusReason.icon}</span>
                      <p className="text-xs text-foreground-muted">{focusReason.text}</p>
                    </div>
                  ) : null}
                  {archetype ? (
                    <div className="flex items-start gap-2">
                      <span aria-hidden>{personality?.icon}</span>
                      <p className="text-xs text-foreground-muted">{archetype.colourReason}</p>
                    </div>
                  ) : null}
                  <div className="flex items-start gap-2">
                    <span aria-hidden>🌱</span>
                    <p className="text-xs text-foreground-muted">{currentColour.benefit}</p>
                  </div>
                  <Link
                    href={`/colour-psychology/${currentColour.key}`}
                    className="text-sm font-semibold text-primary"
                  >
                    Learn more about {currentColour.name.toLowerCase()} →
                  </Link>
                </div>
              </Card>
            ) : (
              <Card className="flex flex-col items-center gap-3 py-10 text-center">
                <span className="text-3xl" aria-hidden>🎨</span>
                <p className="text-sm text-foreground-muted">
                  Complete a check-in or Inner Reading to get your first supportive colour.
                </p>
              </Card>
            )}

            <Card className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-semibold text-foreground">Explore Colour Meanings</h2>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                {COLOUR_ORDER.map((key) => {
                  const colour = COLOUR_LIBRARY[key];
                  const isCurrent = key === currentColourKey;
                  return (
                    <Link
                      key={key}
                      href={`/colour-psychology/${key}`}
                      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface transition-shadow hover:shadow-[0_10px_30px_-18px_rgba(38,43,33,0.4)]"
                    >
                      <div className="relative h-20 w-full" style={{ background: colour.swatch }}>
                        {isCurrent ? (
                          <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-surface text-[10px] text-success" aria-hidden>
                            ✓
                          </span>
                        ) : null}
                      </div>
                      <div className="flex flex-1 flex-col gap-1 p-3">
                        <p className="text-sm font-semibold text-foreground">{colour.name}</p>
                        <p className="line-clamp-2 text-[11px] leading-snug text-foreground-muted">
                          {colour.traits.join(" • ")}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </Card>

            <Card className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-semibold text-foreground">Recommended for You</h2>
              </div>
              <p className="text-xs text-foreground-muted">Handpicked selections that align with your current energy.</p>
              {productItems.length > 0 ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {productItems.map((item) => (
                    <ProductCard key={item.id} item={item} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-foreground-muted">No product matches available right now.</p>
              )}
            </Card>
          </div>

          <div className="flex flex-col gap-5">
            <Card className="flex flex-col gap-4">
              <h2 className="font-display text-lg font-semibold text-foreground">How to use colour intentionally</h2>
              {HOW_TO_USE.map((tip) => (
                <div key={tip.title} className="flex items-start gap-3">
                  <div className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-surface-muted" aria-hidden>
                    {tip.icon}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{tip.title}</p>
                    <p className="text-xs text-foreground-muted">{tip.body}</p>
                  </div>
                </div>
              ))}
            </Card>

            <Card className="flex flex-col gap-3">
              <h2 className="font-display text-lg font-semibold text-foreground">Your colour history</h2>
              {history.length > 0 ? (
                <div className="flex flex-col divide-y divide-border">
                  {history.map((h) => (
                    <div key={h.id} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 flex-none rounded-full"
                          style={{ background: COLOUR_LIBRARY[h.colourKey].swatch }}
                          aria-hidden
                        />
                        <div>
                          <p className="text-xs font-semibold text-foreground">{COLOUR_LIBRARY[h.colourKey].name}</p>
                          <p className="text-[11px] text-foreground-muted">{h.focus}</p>
                        </div>
                      </div>
                      <p className="text-[11px] text-foreground-muted">
                        {h.date.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-foreground-muted">
                  Your colour history builds up as you complete check-ins and readings.
                </p>
              )}
            </Card>
          </div>
        </div>
      </AppShell>
    </>
  );
}
