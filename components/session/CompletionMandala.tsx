import { motion, useReducedMotion } from "motion/react";
import type { DimensionKey } from "@/lib/types";
import { DIMENSION_HEX, EASE_OUT, EASE_SOFT_BACK, SECONDARY_HEX } from "@/lib/sessionMotion";
import DimensionGlyph from "./DimensionGlyph";

type Answer = { dimension: DimensionKey; value: number };

// Sized for the check-in's 4 answers by default; Inner Reading's 8 answers
// need a wider orbit and smaller glyphs so they don't overlap.
const BASE_LAYOUT = { size: 240, orbit: 78, glyph: 72 };
const WIDE_LAYOUT = { size: 320, orbit: 108, glyph: 46 };

/**
 * The answered glyphs assemble from the centre into a ring: the visual
 * "signature" of this check-in or Inner Reading.
 */
export default function CompletionMandala({ answers }: { answers: Answer[] }) {
  const reduce = useReducedMotion();
  const { size: SIZE, orbit: ORBIT, glyph: GLYPH } = answers.length > 4 ? WIDE_LAYOUT : BASE_LAYOUT;
  const step = 360 / answers.length;
  // Tighter stagger for larger answer sets so the whole assembly still
  // resolves in roughly the same total time as the check-in's 4-item case.
  const stagger = answers.length > 4 ? 0.06 : 0.12;
  const centre = SIZE / 2;

  return (
    <div className="relative" style={{ width: SIZE, height: SIZE }} aria-hidden>
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="absolute inset-0 h-full w-full">
        <motion.circle
          cx={centre}
          cy={centre}
          r={ORBIT + 40}
          fill="none"
          stroke={SECONDARY_HEX}
          strokeWidth={1}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.5 }}
          transition={{ duration: 1.6, ease: EASE_OUT, delay: 0.2 }}
        />
        <motion.circle
          cx={centre}
          cy={centre}
          r={ORBIT}
          fill="none"
          stroke={SECONDARY_HEX}
          strokeWidth={1}
          strokeDasharray="3 9"
          style={{ originX: 0.5, originY: 0.5 }}
          initial={{ opacity: 0 }}
          animate={reduce ? { opacity: 0.6 } : { opacity: 0.6, rotate: 360 }}
          transition={{ opacity: { duration: 1, delay: 0.5 }, rotate: { repeat: Infinity, duration: 90, ease: "linear" } }}
        />
        {answers.map((a, i) => {
          const angle = (-90 + i * step) * (Math.PI / 180);
          return (
            <motion.line
              key={i}
              x1={centre}
              y1={centre}
              x2={centre + Math.cos(angle) * ORBIT}
              y2={centre + Math.sin(angle) * ORBIT}
              stroke={DIMENSION_HEX[a.dimension]}
              strokeWidth={1.2}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.45 }}
              transition={{ duration: 0.8, ease: EASE_OUT, delay: 0.5 + i * stagger }}
            />
          );
        })}
        <motion.circle
          cx={centre}
          cy={centre}
          r={6}
          fill="#b9902a"
          initial={{ scale: 0, opacity: 0 }}
          animate={reduce ? { scale: 1, opacity: 1 } : { scale: [1, 1.25, 1], opacity: 1 }}
          style={{ originX: 0.5, originY: 0.5 }}
          transition={{ opacity: { duration: 0.4, delay: 1 }, scale: { repeat: Infinity, duration: 3, ease: "easeInOut", delay: 1 } }}
        />
      </svg>
      {answers.map((a, i) => {
        const angle = (-90 + i * step) * (Math.PI / 180);
        return (
          <motion.div
            key={i}
            className="absolute flex items-center justify-center rounded-full bg-surface shadow-[0_10px_24px_-16px_rgba(38,43,33,0.5)]"
            style={{
              width: GLYPH,
              height: GLYPH,
              left: centre - GLYPH / 2,
              top: centre - GLYPH / 2,
              border: `1px solid ${DIMENSION_HEX[a.dimension]}55`,
            }}
            initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
            animate={{ x: Math.cos(angle) * ORBIT, y: Math.sin(angle) * ORBIT, scale: 1, opacity: 1 }}
            transition={{ duration: 0.9, ease: EASE_SOFT_BACK, delay: 0.35 + i * stagger }}
          >
            <DimensionGlyph dimension={a.dimension} value={a.value} size={GLYPH - 10} />
          </motion.div>
        );
      })}
    </div>
  );
}
