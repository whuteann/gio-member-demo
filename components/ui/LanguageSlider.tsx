import { motion } from "motion/react";
import type { Language } from "@/lib/types";

const OPTIONS: { value: Language; label: string }[] = [
  { value: "en", label: "English" },
  { value: "zh", label: "中文" },
];

/**
 * A two-option pill toggle with a sliding highlight, used wherever a member
 * picks their preferred language before or during onboarding. This demo has
 * no live translations wired up yet — the selection is stored as a
 * preference (see AppStateContext#updateProfile) but doesn't change any
 * on-screen copy today.
 */
export default function LanguageSlider({
  value,
  onChange,
  className = "",
}: {
  value: Language;
  onChange: (language: Language) => void;
  className?: string;
}) {
  return (
    <div className={`relative flex w-full rounded-full border border-border bg-surface-muted p-1 ${className}`}>
      <motion.div
        className="absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-full bg-primary"
        initial={false}
        animate={{ x: value === "en" ? "0%" : "100%" }}
        transition={{ type: "spring", stiffness: 420, damping: 34 }}
      />
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          aria-pressed={value === opt.value}
          className={`relative z-10 flex-1 rounded-full py-1.5 text-sm font-semibold transition-colors ${
            value === opt.value ? "text-primary-foreground" : "text-foreground-muted"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
