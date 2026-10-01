import { motion, useReducedMotion } from "motion/react";
import { DIMENSION_HEX, GOLD_HEX, SECONDARY_HEX } from "@/lib/sessionMotion";

const SIZE = 168;
const CENTRE = SIZE / 2;
const ORBIT = 56;
const DOT_COLORS = [
  DIMENSION_HEX.emotional_energy,
  DIMENSION_HEX.mental_clarity,
  DIMENSION_HEX.inner_pressure,
  DIMENSION_HEX.grounding,
];

/**
 * Shown while this session's questions are still being generated — a
 * before-the-mandala state. The four dimension-coloured dots orbit without
 * ever settling (unlike CompletionMandala's ring, which assembles and
 * holds) to read as "still forming", not stalled or broken.
 */
export default function PreparingSession({ label }: { label: string }) {
  const reduce = useReducedMotion();
  const origin = { transformOrigin: `${CENTRE}px ${CENTRE}px` };

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-7 text-center">
      <div className="relative" style={{ width: SIZE, height: SIZE }} aria-hidden>
        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="absolute inset-0 h-full w-full overflow-visible">
          <motion.circle
            cx={CENTRE}
            cy={CENTRE}
            r={ORBIT + 24}
            fill="none"
            stroke={SECONDARY_HEX}
            strokeWidth={1}
            style={origin}
            initial={{ opacity: 0.22, scale: 1 }}
            animate={reduce ? { opacity: 0.38 } : { opacity: [0.22, 0.4, 0.22], scale: [1, 1.04, 1] }}
            transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }}
          />
          <motion.circle
            cx={CENTRE}
            cy={CENTRE}
            r={ORBIT}
            fill="none"
            stroke={GOLD_HEX}
            strokeWidth={1.3}
            strokeDasharray="3 10"
            opacity={0.5}
            style={origin}
            animate={reduce ? undefined : { rotate: 360 }}
            transition={{ repeat: Infinity, duration: 42, ease: "linear" }}
          />
          <motion.g style={origin} animate={reduce ? undefined : { rotate: 360 }} transition={{ repeat: Infinity, duration: 16, ease: "linear" }}>
            {DOT_COLORS.map((color, i) => {
              const angle = (i / DOT_COLORS.length) * Math.PI * 2;
              return (
                <motion.circle
                  key={color}
                  cx={CENTRE + Math.cos(angle) * ORBIT}
                  cy={CENTRE + Math.sin(angle) * ORBIT}
                  r={5}
                  fill={color}
                  style={{ transformOrigin: `${CENTRE + Math.cos(angle) * ORBIT}px ${CENTRE + Math.sin(angle) * ORBIT}px` }}
                  initial={{ opacity: 0.5, scale: 0.85 }}
                  animate={reduce ? { opacity: 0.85, scale: 1 } : { opacity: [0.5, 1, 0.5], scale: [0.85, 1.15, 0.85] }}
                  transition={{ repeat: Infinity, duration: 2.6, ease: "easeInOut", delay: i * 0.3 }}
                />
              );
            })}
          </motion.g>
          <motion.circle
            cx={CENTRE}
            cy={CENTRE}
            r={7}
            fill={GOLD_HEX}
            style={origin}
            animate={reduce ? { scale: 1, opacity: 0.95 } : { scale: [1, 1.3, 1], opacity: [0.85, 1, 0.85] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          />
        </svg>
      </div>
      <motion.p
        className="max-w-xs text-sm font-medium text-foreground-muted"
        animate={reduce ? undefined : { opacity: [0.55, 1, 0.55] }}
        transition={{ repeat: Infinity, duration: 2.6, ease: "easeInOut" }}
      >
        {label}
      </motion.p>
    </div>
  );
}
