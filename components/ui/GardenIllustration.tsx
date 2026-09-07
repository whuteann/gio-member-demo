const STAGES = [
  { emoji: "🌱", label: "Seed" },
  { emoji: "🌿", label: "Sprouting" },
  { emoji: "🪴", label: "Budding" },
  { emoji: "🌸", label: "Blooming" },
  { emoji: "🌳", label: "Full bloom" },
];

export default function GardenIllustration({ stage, size = "md" }: { stage: number; size?: "sm" | "md" | "lg" }) {
  const clamped = Math.max(0, Math.min(4, stage));
  const current = STAGES[clamped];
  const emojiSize = size === "lg" ? "text-6xl" : size === "sm" ? "text-3xl" : "text-5xl";

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-b from-secondary/20 to-surface-muted ${size === "sm" ? "h-16 w-16" : ""}`}>
        <span className={emojiSize} role="img" aria-label={current.label}>
          {current.emoji}
        </span>
      </div>
      <p className="text-xs font-semibold text-foreground-muted">{current.label} this week</p>
      <div className="flex gap-1">
        {STAGES.map((_, i) => (
          <span
            key={i}
            className={`h-1.5 w-4 rounded-full ${i <= clamped ? "bg-secondary" : "bg-surface-muted"}`}
          />
        ))}
      </div>
    </div>
  );
}
