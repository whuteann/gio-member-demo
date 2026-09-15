import { motion, useReducedMotion } from "motion/react";
import { EASE_IN_OUT } from "@/lib/sessionMotion";

// Soft tints drawn from the app palette (globals.css). Each shape gets its own
// tone so the field reads as part of the cream/sage/gold/terracotta system
// rather than a wash of one colour.
const SAGE = "#8a9b7c";
const GOLD = "#b9902a";
const TERRACOTTA = "#c97a4a";
const MOSS = "#33452f";

/**
 * Sparse geometric backdrop that drifts slowly behind the page content.
 *
 * The SVG has no viewBox: shapes are sized in CSS pixels and placed with
 * percentages, so the field keeps the same scale on a phone and a desktop
 * instead of stretching with the viewport. Drift uses transforms (x/y), which
 * are independent of the percentage anchors.
 *
 * The dashed ring is the only element that follows the current dimension
 * colour; everything else stays in the base palette.
 */
export default function AmbientField({ color }: { color: string }) {
  const reduce = useReducedMotion();
  const loop = (duration: number) => ({ repeat: Infinity, repeatType: "mirror" as const, duration, ease: "easeInOut" as const });

  return (
    <div
      className="pointer-events-none absolute -inset-x-4 -top-5 -bottom-28 -z-10 overflow-hidden lg:-inset-x-10 lg:-top-8 lg:-bottom-10"
      aria-hidden
    >
      <svg className="h-full w-full">
        <defs>
          <pattern id="checkin-dots" width="28" height="28" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.3" fill={SAGE} fillOpacity={0.4} />
          </pattern>
          <radialGradient id="checkin-glow-sage" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={SAGE} stopOpacity={0.42} />
            <stop offset="100%" stopColor={SAGE} stopOpacity={0} />
          </radialGradient>
          <radialGradient id="checkin-glow-clay" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={TERRACOTTA} stopOpacity={0.22} />
            <stop offset="100%" stopColor={TERRACOTTA} stopOpacity={0} />
          </radialGradient>
          <radialGradient id="checkin-glow-gold" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={GOLD} stopOpacity={0.36} />
            <stop offset="100%" stopColor={GOLD} stopOpacity={0} />
          </radialGradient>
        </defs>

        {/* Soft colour pools */}
        <motion.circle
          cx="86%"
          cy="16%"
          r={300}
          fill="url(#checkin-glow-sage)"
          animate={reduce ? undefined : { y: [0, 40] }}
          transition={loop(18)}
        />
        <motion.circle
          cx="8%"
          cy="84%"
          r={280}
          fill="url(#checkin-glow-gold)"
          animate={reduce ? undefined : { x: [0, 30], y: [0, -40] }}
          transition={loop(24)}
        />
        <motion.circle
          cx="4%"
          cy="42%"
          r={200}
          fill="url(#checkin-glow-clay)"
          animate={reduce ? undefined : { y: [0, 30] }}
          transition={loop(20)}
        />

        {/* Dot grid */}
        <motion.rect
          x={-40}
          y={0}
          width="calc(100% + 40px)"
          height="100%"
          fill="url(#checkin-dots)"
          animate={reduce ? undefined : { x: [0, 28] }}
          transition={loop(26)}
        />

        {/* Line geometry */}
        <motion.circle
          cx="86%"
          cy="18%"
          r={250}
          fill="none"
          stroke={SAGE}
          strokeWidth={1.5}
          opacity={0.6}
          animate={reduce ? undefined : { y: [0, 32] }}
          transition={loop(16)}
        />
        <motion.circle
          cx="84%"
          cy="20%"
          r={140}
          fill="none"
          strokeWidth={1.6}
          strokeDasharray="4 10"
          initial={{ stroke: color, opacity: 0.62 }}
          animate={reduce ? { stroke: color } : { stroke: color, rotate: 360 }}
          transition={{ stroke: { duration: 1.4, ease: EASE_IN_OUT }, rotate: { repeat: Infinity, duration: 120, ease: "linear" } }}
          style={{ originX: 0.5, originY: 0.5 }}
        />
        <motion.circle
          cx="6%"
          cy="82%"
          r={180}
          fill="none"
          stroke={GOLD}
          strokeWidth={1.5}
          opacity={0.55}
          animate={reduce ? undefined : { x: [0, 28], y: [0, -28] }}
          transition={loop(22)}
        />
        <motion.line
          x1="0%"
          y1="92%"
          x2="100%"
          y2="38%"
          stroke={TERRACOTTA}
          strokeWidth={1.2}
          opacity={0.38}
          animate={reduce ? undefined : { y: [0, -30] }}
          transition={loop(30)}
        />

        {/* Small accents. Nested <svg> elements accept percentage x/y, so the
            local shapes can be drawn in plain pixel coordinates. */}
        <svg x="12%" y="38%" overflow="visible">
          <motion.rect
            x={0}
            y={0}
            width={18}
            height={18}
            fill={TERRACOTTA}
            opacity={0.4}
            style={{ originX: 0.5, originY: 0.5 }}
            animate={reduce ? undefined : { rotate: [0, 90], y: [0, 30] }}
            transition={loop(18)}
          />
        </svg>
        <svg x="72%" y="74%" overflow="visible">
          <motion.polygon
            points="16,0 32,28 0,28"
            fill="none"
            stroke={MOSS}
            strokeWidth={1.4}
            opacity={0.45}
            style={{ originX: 0.5, originY: 0.5 }}
            animate={reduce ? undefined : { rotate: [0, -60], x: [0, 24] }}
            transition={loop(24)}
          />
        </svg>
        <motion.circle
          cx="90%"
          cy="58%"
          r={5}
          fill={GOLD}
          opacity={0.6}
          animate={reduce ? undefined : { y: [0, 20] }}
          transition={loop(12)}
        />
      </svg>
    </div>
  );
}
