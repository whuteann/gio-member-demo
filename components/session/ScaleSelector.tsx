import { motion } from "motion/react";
import { EASE_OUT } from "@/lib/sessionMotion";

const SCALE = [1, 2, 3, 4, 5];
const SPRING = { type: "spring" as const, stiffness: 420, damping: 26, mass: 0.8 };

export default function ScaleSelector({
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
  const scaleFor = (n: number) => {
    if (value === null) return 1;
    const distance = Math.abs(n - value);
    if (distance === 0) return 1.1;
    if (distance === 1) return 0.94;
    return 1;
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-2">
        {SCALE.map((n) => {
          const selected = value === n;
          return (
            <motion.button
              key={n}
              type="button"
              onClick={() => onChange(n)}
              aria-pressed={selected}
              className="relative flex h-14 flex-1 items-center justify-center rounded-2xl border text-lg font-semibold shadow-[0_6px_18px_-10px_rgba(38,43,33,0.35)]"
              initial={false}
              animate={{
                scale: scaleFor(n),
                backgroundColor: selected ? color : "#ffffff",
                borderColor: selected ? color : "#e6ddc9",
                color: selected ? "#fff8f2" : "#262b21",
              }}
              whileHover={selected ? undefined : { borderColor: color, y: -2 }}
              whileTap={{ scale: 0.9 }}
              transition={{ scale: SPRING, y: SPRING, default: { duration: 0.35, ease: EASE_OUT } }}
            >
              {selected ? (
                <motion.span
                  key={`ripple-${n}`}
                  className="pointer-events-none absolute inset-0 rounded-2xl border-2"
                  style={{ borderColor: color }}
                  initial={{ scale: 1, opacity: 0.8 }}
                  animate={{ scale: 1.7, opacity: 0 }}
                  transition={{ duration: 0.75, ease: EASE_OUT }}
                />
              ) : null}
              <span className="relative">{n}</span>
            </motion.button>
          );
        })}
      </div>
      <div className="flex justify-between text-xs font-medium">
        <motion.span
          initial={false}
          animate={{
            color: value !== null && value <= 2 ? color : "#666f5c",
            fontWeight: value !== null && value <= 2 ? 700 : 500,
          }}
          transition={{ duration: 0.4, ease: EASE_OUT }}
        >
          {lowLabel}
        </motion.span>
        <motion.span
          initial={false}
          animate={{
            color: value !== null && value >= 4 ? color : "#666f5c",
            fontWeight: value !== null && value >= 4 ? 700 : 500,
          }}
          transition={{ duration: 0.4, ease: EASE_OUT }}
        >
          {highLabel}
        </motion.span>
      </div>
    </div>
  );
}
