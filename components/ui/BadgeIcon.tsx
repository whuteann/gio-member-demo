import type { BadgeOut } from "@/lib/api/types";
import { useLanguage } from "@/lib/useLanguage";
import { localizedGamification } from "@/lib/gamificationDisplay";

// Typed against BadgeOut, the shape the API actually sends. It previously
// claimed BadgeDefinition — the dead client-side type from lib/types.ts —
// which type-checked only because the two happened to overlap, and hid the
// fact that the bilingual `_zh` fields were available all along.
export default function BadgeIcon({ badge, earned }: { badge: BadgeOut; earned: boolean }) {
  const { language } = useLanguage();
  return (
    <div
      className={`flex flex-col items-center gap-2 rounded-2xl border p-4 text-center ${
        earned ? "border-gold/40 bg-gold/10" : "border-border bg-surface-muted opacity-60"
      }`}
    >
      <span className={`text-3xl ${earned ? "" : "grayscale"}`} aria-hidden>
        {badge.icon}
      </span>
      <p className="font-display text-sm font-semibold text-foreground">{localizedGamification(badge, "title", language)}</p>
      <p className="text-[11px] leading-snug text-foreground-muted">{localizedGamification(badge, "description", language)}</p>
    </div>
  );
}
