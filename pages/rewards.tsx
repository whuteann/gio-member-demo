import Head from "next/head";
import { useAppGuard } from "@/lib/useAppGuard";
import { useAppState } from "@/context/AppStateContext";
import { REWARD_DEFINITIONS } from "@/lib/blueprints";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import Chip from "@/components/ui/Chip";
import Button from "@/components/ui/Button";
import EntitlementGate from "@/components/ui/EntitlementGate";

export default function RewardsPage() {
  const { settled, data } = useAppGuard();
  const { isPremiumActive, redeemReward } = useAppState();
  if (!settled || !data) return null;

  const stateByKey = new Map(data.rewards.map((r) => [r.key, r]));

  return (
    <>
      <Head><title>Rewards — Gio</title></Head>
      <AppShell title="Rewards">
        {!isPremiumActive ? (
          <div className="mb-5">
            <EntitlementGate description="Premium members can unlock and redeem eligible rewards." />
          </div>
        ) : null}
        <div className="grid gap-4 sm:grid-cols-2">
          {REWARD_DEFINITIONS.map((def) => {
            const state = stateByKey.get(def.key)?.state ?? "LOCKED";
            return (
              <Card key={def.key} className="flex flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                  <span className="text-3xl" aria-hidden>{def.icon}</span>
                  {state === "REDEEMED" ? (
                    <Chip tone="success">Redeemed</Chip>
                  ) : state === "UNLOCKED" ? (
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
                {isPremiumActive && state === "UNLOCKED" ? (
                  <Button size="sm" onClick={() => redeemReward(def.key)}>Redeem</Button>
                ) : null}
              </Card>
            );
          })}
        </div>
      </AppShell>
    </>
  );
}
