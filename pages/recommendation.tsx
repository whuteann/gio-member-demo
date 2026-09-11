import Head from "next/head";
import Link from "next/link";
import { useAppGuard } from "@/lib/useAppGuard";
import { useAppState } from "@/context/AppStateContext";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import Chip from "@/components/ui/Chip";
import Button from "@/components/ui/Button";
import ProductCard from "@/components/ui/ProductCard";

export default function RecommendationPage() {
  const { settled, data } = useAppGuard();
  const { isPremiumActive } = useAppState();
  if (!settled || !data) return null;

  const profile = data.recommendations[data.recommendations.length - 1] ?? null;

  if (!profile) {
    return (
      <AppShell title="For You">
        <Card className="flex flex-col items-center gap-3 py-10 text-center">
          <span className="text-3xl">✨</span>
          <p className="text-sm text-foreground-muted">
            Complete a check-in or Inner Reading to get your first recommendations.
          </p>
          <Link href="/check-in"><Button>Start a check-in</Button></Link>
        </Card>
      </AppShell>
    );
  }

  const colourItem = profile.items.find((i) => i.type === "COLOUR");
  const routineItem = profile.items.find((i) => i.type === "ROUTINE");
  const productItems = profile.items.filter((i) => i.type === "PRODUCT");

  return (
    <>
      <Head><title>For You — Gio</title></Head>
      <AppShell title="For You">
        <div className="mx-auto flex max-w-2xl flex-col gap-5">
          <Card className="flex items-center gap-4">
            <span
              className="h-14 w-14 shrink-0 rounded-full border border-border"
              style={{ backgroundColor: profile.primaryColour }}
              aria-hidden
            />
            <div>
              <Chip tone="primary">{profile.currentFocus}</Chip>
              <p className="mt-1.5 text-sm text-foreground-muted">{profile.summary}</p>
            </div>
          </Card>

          {routineItem ? (
            <Card>
              <h3 className="mb-1 font-display text-lg font-semibold text-foreground">Suggested routine</h3>
              <p className="text-sm text-foreground-muted">{routineItem.title}</p>
              <p className="mt-1 text-xs text-foreground-muted">{routineItem.reason}</p>
            </Card>
          ) : null}

          {colourItem ? (
            <Link href={colourItem.referenceId ? `/colour-psychology/${colourItem.referenceId}` : "/colour-psychology"}>
              <Card className="transition-shadow hover:shadow-[0_10px_30px_-18px_rgba(38,43,33,0.4)]">
                <h3 className="mb-1 font-display text-lg font-semibold text-foreground">Colour to lean into</h3>
                <p className="text-sm text-foreground-muted">{colourItem.title}</p>
                <p className="mt-1 text-xs text-foreground-muted">{colourItem.reason}</p>
              </Card>
            </Link>
          ) : null}

          <div>
            <h3 className="mb-3 font-display text-lg font-semibold text-foreground">Matched from the Gio store</h3>
            {productItems.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {productItems.map((item) => (
                  <ProductCard key={item.id} item={item} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-foreground-muted">No product matches available right now.</p>
            )}
          </div>

          {!isPremiumActive ? (
            <Card className="border-accent/40 bg-accent/5">
              <p className="text-sm text-foreground-muted">
                You’re seeing a basic recommendation. Premium uses your full history for deeper,
                more precise matches.
              </p>
              <Link href="/membership" className="mt-3 inline-block">
                <Button variant="accent" size="sm">Upgrade to Premium</Button>
              </Link>
            </Card>
          ) : null}
        </div>
      </AppShell>
    </>
  );
}
