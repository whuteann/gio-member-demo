import { AnimatePresence, motion } from "motion/react";
import { EASE_OUT } from "@/lib/sessionMotion";

/**
 * Segmented progress: one segment per question, each filling in the colour of
 * its own dimension. The active segment breathes until it is answered.
 */
export default function StepProgress({
  step,
  colors,
  answered,
  label = "Check-In",
}: {
  step: number;
  colors: string[];
  answered: boolean[];
  label?: string;
}) {
  const total = colors.length;
  return (
    <div className="flex flex-col gap-2">
      <p className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-foreground-muted">
        <span>{label} ·</span>
        <span className="relative inline-block h-4 w-[0.7em] overflow-hidden text-center">
          <AnimatePresence initial={false} mode="popLayout">
            <motion.span
              key={step}
              className="absolute inset-0"
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -12, opacity: 0 }}
              transition={{ duration: 0.35, ease: EASE_OUT }}
            >
              {step + 1}
            </motion.span>
          </AnimatePresence>
        </span>
        <span>/ {total}</span>
      </p>
      <div className="flex gap-1.5">
        {colors.map((color, i) => {
          const complete = i < step || (i === step && answered[i]);
          const active = i === step;
          return (
            <div key={i} className="relative h-2.5 flex-1 overflow-hidden rounded-full bg-surface-muted">
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ backgroundColor: color, originX: 0 }}
                initial={false}
                animate={{
                  scaleX: complete || active ? 1 : 0,
                  opacity: complete ? 1 : active ? [0.22, 0.45, 0.22] : 0,
                }}
                transition={{
                  scaleX: { duration: 0.6, ease: EASE_OUT },
                  opacity: complete
                    ? { duration: 0.4, ease: EASE_OUT }
                    : { repeat: Infinity, duration: 2.2, ease: "easeInOut" },
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
