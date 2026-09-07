import type { BadgeDefinition } from "@/lib/types";

export default function BadgeIcon({ badge, earned }: { badge: BadgeDefinition; earned: boolean }) {
  return (
    <div
      className={`flex flex-col items-center gap-2 rounded-2xl border p-4 text-center ${
        earned ? "border-gold/40 bg-gold/10" : "border-border bg-surface-muted opacity-60"
      }`}
    >
      <span className={`text-3xl ${earned ? "" : "grayscale"}`} aria-hidden>
        {badge.icon}
      </span>
      <p className="font-display text-sm font-semibold text-foreground">{badge.title}</p>
      <p className="text-[11px] leading-snug text-foreground-muted">{badge.description}</p>
    </div>
  );
}
