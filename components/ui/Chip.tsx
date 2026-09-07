import type { ReactNode } from "react";

type Tone = "neutral" | "primary" | "accent" | "gold" | "success" | "danger";

const TONE_CLASSES: Record<Tone, string> = {
  neutral: "bg-surface-muted text-foreground-muted",
  primary: "bg-primary/10 text-primary",
  accent: "bg-accent/15 text-accent",
  gold: "bg-gold/15 text-gold",
  success: "bg-success/15 text-success",
  danger: "bg-danger/15 text-danger",
};

export default function Chip({ tone = "neutral", children, icon }: { tone?: Tone; children: ReactNode; icon?: ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${TONE_CLASSES[tone]}`}>
      {icon}
      {children}
    </span>
  );
}
