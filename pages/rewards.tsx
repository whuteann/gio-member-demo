import Head from "next/head";
import { useAuthGuard } from "@/lib/useAuthGuard";
import { useApiResource } from "@/lib/useApiResource";
import { isPremiumActive } from "@/lib/api/entitlement";
import { listRewards, redeemReward } from "@/lib/api/progress";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import Chip from "@/components/ui/Chip";
import Button from "@/components/ui/Button";
import EntitlementGate from "@/components/ui/EntitlementGate";

export default function RewardsPage() {
  const { settled, token, subscription } = useAuthGuard();
  const premium = subscription ? isPremiumActive(subscription) : false;

  const { data: rewards, loading, refetch } = useApiResource(token ? () => listRewards(token) : null, [token]);

  if (!settled || !token) return null;
  if (loading || !rewards) {
    return (
      <AppShell title="Rewards">
        <p className="text-sm text-foreground-muted">Loading your rewards…</p>
      </AppShell>
    );
  }

  async function redeem(key: string) {
    if (!token) return;
    await redeemReward(token, key);
    refetch();
  }

  return (
    <>
      <Head><title>Rewards — Gio</title></Head>
      <AppShell title="Rewards">
        {!premium ? (
          <div className="mb-5">
            <EntitlementGate description="Premium members can unlock and redeem eligible rewards." />
          </div>
        ) : null}
        <div className="grid gap-4 sm:grid-cols-2">
          {rewards.map((def) => (
            <Card key={def.key} className="flex flex-col gap-3">
              <div className="flex items-start justify-between gap-3">
                <span className="text-3xl" aria-hidden>{def.icon}</span>
                {def.state === "REDEEMED" ? (
                  <Chip tone="success">Redeemed</Chip>
                ) : def.state === "UNLOCKED" ? (
                  <Chip tone="gold">Unlocked</Chip>
                ) : (
                  <Chip tone="neutral">Locked</Chip>
                )}
              </div>
              <div>
                <h3 className="font-display text-base font-semibold text-foreground">{def.title}</h3>
                <p className="mt-0.5 text-xs text-foreground-muted">{def.description}</p>
              </div>
              <p className="text-xs font-semibold text-foreground-muted">{def.requirement}</p>
              {premium && def.state === "UNLOCKED" ? (
                <Button size="sm" onClick={() => redeem(def.key)}>Redeem</Button>
              ) : null}
            </Card>
          ))}
        </div>
      </AppShell>
    </>
  );
}
