import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { EASE_OUT } from "@/lib/sessionMotion";

const SCALE = [1, 2, 3, 4, 5];
const SPRING = { type: "spring" as const, stiffness: 380, damping: 30 };

/**
 * Inner Reading's continuous drag slider, recoloured per question dimension
 * and carrying the same spring/ripple motion language as the check-in's
 * ScaleSelector — the floating value badge eases into position instead of
 * jumping, and a ring pulses out from it each time the value changes.
 */
export default function MotionSlider({
  value,
  onChange,
  color,
  lowLabel,
  highLabel,
}: {
  value: number | null;
  onChange: (value: number) => void;
  color: string;
  lowLabel: string;
  highLabel: string;
}) {
  const [burst, setBurst] = useState(0);
  const display = value ?? 3;
  const pct = ((display - 1) / 4) * 100;

  function handleChange(next: number) {
    if (next === value) return;
    onChange(next);
    setBurst((b) => b + 1);
  }

  return (
    // px-[18px] reserves exactly half the value badge's width (h-9/w-9 = 36px)
    // on each side, so the badge stays fully on-screen when it's centred over
    // the 1 or 5 end of the track instead of being clipped by the container.
    <div className="flex flex-col gap-4 px-[18px]">
      <div className="relative pt-3">
        <motion.div
          className="pointer-events-none absolute -top-1 flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold shadow-md"
          initial={false}
          animate={{
            left: `${pct}%`,
            backgroundColor: value === null ? "#ffffff" : color,
            color: value === null ? "var(--color-foreground-muted)" : "#ffffff",
            borderColor: value === null ? "var(--color-border)" : color,
          }}
          style={{ x: "-50%", borderWidth: value === null ? 1 : 0, borderStyle: "solid" }}
          transition={{ left: SPRING, default: { duration: 0.3, ease: EASE_OUT } }}
        >
          <AnimatePresence>
            {value !== null ? (
              <motion.span
                key={burst}
                className="pointer-events-none absolute inset-0 rounded-full border-2"
                style={{ borderColor: color }}
                initial={{ scale: 1, opacity: 0.75 }}
                animate={{ scale: 1.9, opacity: 0 }}
                transition={{ duration: 0.65, ease: EASE_OUT }}
              />
            ) : null}
          </AnimatePresence>
          <span className="relative">{display}</span>
        </motion.div>
        <input
          type="range"
          min={1}
          max={5}
          step={1}
          value={display}
          onChange={(e) => handleChange(Number(e.target.value))}
          aria-label={`${lowLabel} to ${highLabel}`}
          className="h-2 w-full cursor-pointer appearance-none rounded-full [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-surface [&::-moz-range-thumb]:shadow [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-surface [&::-webkit-slider-thumb]:shadow"
          style={{
            background: `linear-gradient(to right, ${color} ${pct}%, var(--color-surface-muted) ${pct}%)`,
          }}
        />
        <div className="mt-2 flex justify-between px-0.5">
          {SCALE.map((n) => (
            <motion.span
              key={n}
              className="h-1 w-1 rounded-full"
              initial={false}
              animate={{ backgroundColor: n <= display ? color : "var(--color-border)", scale: n === display ? 1.6 : 1 }}
              transition={{ duration: 0.3, ease: EASE_OUT }}
            />
          ))}
        </div>
      </div>
      <div className="flex justify-between text-xs font-medium">
        <motion.span
          initial={false}
          animate={{ color: display <= 2 ? color : "var(--color-foreground-muted)", fontWeight: display <= 2 ? 700 : 500 }}
          transition={{ duration: 0.35, ease: EASE_OUT }}
        >
          {lowLabel}
        </motion.span>
        <motion.span
          initial={false}
          animate={{ color: display >= 4 ? color : "var(--color-foreground-muted)", fontWeight: display >= 4 ? 700 : 500 }}
          transition={{ duration: 0.35, ease: EASE_OUT }}
        >
          {highLabel}
        </motion.span>
      </div>
    </div>
  );
}
