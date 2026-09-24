import Head from "next/head";
import Link from "next/link";
import { useAuthGuard } from "@/lib/useAuthGuard";
import { useApiResource } from "@/lib/useApiResource";
import { getLatestRecommendation, listRecommendations } from "@/lib/api/recommendations";
import { getCurrentPersonality } from "@/lib/api/personality";
import { isPremiumActive } from "@/lib/api/entitlement";
import { ApiError } from "@/lib/api/client";
import { ARCHETYPES, COLOUR_LIBRARY, COLOUR_ORDER, FOCUS_COLOUR_REASON } from "@/lib/blueprints";
import { colourKeyForFocus } from "@/lib/recommendation";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import Chip from "@/components/ui/Chip";
import ProductCard from "@/components/ui/ProductCard";
import ColourOfTheDay from "@/components/ui/ColourOfTheDay";
import EntitlementGate from "@/components/ui/EntitlementGate";

const HOW_TO_USE = [
  { icon: "👕", title: "Wear it", body: "Use it in your clothing or everyday accessories." },
  { icon: "🌿", title: "See it", body: "Spend time in natural greenery or matching surroundings." },
  { icon: "🪴", title: "Bring it near you", body: "Add it to your workspace or daily essentials." },
  { icon: "🔔", title: "Be reminded", body: "Use it as a gentle visual cue throughout your day." },
];

export default function ColourPsychologyPage() {
  const { settled, token, subscription } = useAuthGuard();
  const premium = subscription ? isPremiumActive(subscription) : false;

  const { data, loading } = useApiResource(
    token
      ? async () => {
          const [recommendation, personality, history] = await Promise.all([
            getLatestRecommendation(token).catch((e) => (e instanceof ApiError && e.status === 404 ? null : Promise.reject(e))),
            getCurrentPersonality(token).catch((e) => (e instanceof ApiError && e.status === 404 ? null : Promise.reject(e))),
            listRecommendations(token).catch((e) => (e instanceof ApiError && e.status === 404 ? [] : Promise.reject(e))),
          ]);
          return { recommendation, personality, history };
        }
      : null,
    [token]
  );

  if (!settled || !token) return null;
  if (loading || !data) {
    return (
      <AppShell>
        <p className="text-sm text-foreground-muted">Loading your colour profile…</p>
      </AppShell>
    );
  }

  const { recommendation, personality, history } = data;
  const currentColourKey = recommendation ? colourKeyForFocus(recommendation.current_focus) : null;
  const currentColour = currentColourKey ? COLOUR_LIBRARY[currentColourKey] : null;
  const focusReason = recommendation ? FOCUS_COLOUR_REASON[recommendation.current_focus] : null;
  const archetype = personality ? ARCHETYPES[personality.archetype as keyof typeof ARCHETYPES] : null;
  const productItems = recommendation?.items.filter((i) => i.type === "PRODUCT") ?? [];
  // "Your colour history" is premium-only — history from the API is already
  // limited to 1 (today's) for free users server-side, so the earlier
  // entries beyond that only ever exist for premium.
  const patternHistory = history.filter((h) => h.id !== recommendation?.id);

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
                  {premium ? (
                    <>
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
                    </>
                  ) : (
                    <div className="flex items-start gap-2">
                      <span aria-hidden>🌱</span>
                      <p className="text-xs text-foreground-muted">{currentColour.benefit}</p>
                    </div>
                  )}
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
                    <ProductCard
                      key={`${item.type}-${item.rank}`}
                      item={{
                        id: String(item.rank),
                        type: item.type as "COLOUR" | "ROUTINE" | "SCENT" | "WEARABLE" | "PRODUCT",
                        referenceId: item.reference_id,
                        title: item.title,
                        reason: item.reason,
                        rank: item.rank,
                        imageUrl: item.image_url ?? undefined,
                        price: item.price ?? undefined,
                        destinationUrl: item.destination_url ?? undefined,
                      }}
                    />
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

            {premium ? (
              <Card className="flex flex-col gap-3">
                <h2 className="font-display text-lg font-semibold text-foreground">Your colour history</h2>
                {patternHistory.length > 0 ? (
                  <div className="flex flex-wrap gap-3">
                    {patternHistory.map((entry) => {
                      const colour = COLOUR_LIBRARY[entry.colour_key as keyof typeof COLOUR_LIBRARY];
                      return (
                        <div key={entry.id} className="flex flex-col items-center gap-1">
                          <span
                            className="h-9 w-9 rounded-full border border-border"
                            style={{ background: entry.colour_swatch }}
                            aria-hidden
                          />
                          <p className="text-[10px] text-foreground-muted">
                            {new Date(entry.generated_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                          </p>
                          <p className="text-[10px] text-foreground-muted">{colour?.name ?? entry.colour_name}</p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-foreground-muted">
                    Your colour pattern will build up here as you check in and reflect over time.
                  </p>
                )}
              </Card>
            ) : (
              <EntitlementGate
                title="See your colour pattern"
                description="Premium reveals how your supportive colour has shifted over time, not just today's."
              />
            )}
          </div>
        </div>
      </AppShell>
    </>
  );
}
