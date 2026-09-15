import { motion, useReducedMotion } from "motion/react";
import type { DimensionKey } from "@/lib/types";
import { DIMENSION_HEX, MORPH } from "@/lib/sessionMotion";

type GlyphProps = {
  dimension: DimensionKey;
  value: number | null;
  size?: number;
  className?: string;
};

type PartProps = { t: number; color: string; animateLoops: boolean };

/**
 * One abstract figure per emotional dimension. `value` (1–5) is mapped to
 * t ∈ [0, 1] and every geometric property eases toward its new target, so the
 * shape visibly "answers back" as the user picks a number.
 *
 * Each animated element receives the same object as `initial` and `animate`:
 * Motion only reads `initial` on mount, so the first frame is painted with
 * valid attributes and later value changes still tween from the old state.
 */
export default function DimensionGlyph({ dimension, value, size = 160, className = "" }: GlyphProps) {
  const reduce = useReducedMotion();
  const t = value === null ? 0.5 : (value - 1) / 4;
  const settled = value !== null;
  const color = DIMENSION_HEX[dimension];
  const part: PartProps = { t, color, animateLoops: !reduce };
  const halo = { opacity: settled ? 0.07 + t * 0.09 : 0.05 };
  const body = { opacity: settled ? 1 : 0.55 };

  return (
    <svg viewBox="0 0 200 200" width={size} height={size} className={className} aria-hidden>
      {/* Solid backing disc — without this the shape is just thin translucent
          lines and whatever sits behind the glyph (the ambient field) shows
          straight through it. Every dimension glyph sits on its own opaque
          card, never directly on the page background. */}
      <circle cx={100} cy={100} r={96} fill="#ffffff" stroke={color} strokeOpacity={0.18} strokeWidth={2} />
      <motion.circle cx={100} cy={100} r={82} fill={color} initial={halo} animate={halo} transition={MORPH} />
      <motion.g initial={body} animate={body} transition={MORPH}>
        {dimension === "emotional_energy" && <Energy {...part} />}
        {dimension === "mental_clarity" && <Clarity {...part} />}
        {dimension === "inner_pressure" && <Pressure {...part} />}
        {dimension === "grounding" && <Grounding {...part} />}
      </motion.g>
    </svg>
  );
}

/* Emotional Energy — a core with rays that lengthen and multiply. */
const RAY_COUNT = 16;
function Energy({ t, color, animateLoops }: PartProps) {
  const coreR = 16 + t * 14;
  const inner = coreR + 9;
  const length = 8 + t * 38;
  const core = { r: coreR, opacity: 0.6 + t * 0.4 };

  return (
    <>
      {animateLoops ? (
        <motion.circle
          cx={100}
          cy={100}
          r={coreR + 4}
          opacity={0}
          fill="none"
          stroke={color}
          strokeWidth={1.5}
          initial={false}
          animate={{ r: [coreR + 4, coreR + 34], opacity: [0.15 + t * 0.4, 0] }}
          transition={{ repeat: Infinity, duration: 2.6, ease: "easeOut" }}
        />
      ) : null}
      <motion.g
        style={{ originX: 0.5, originY: 0.5 }}
        animate={animateLoops ? { rotate: 360 } : undefined}
        transition={{ repeat: Infinity, duration: 70, ease: "linear" }}
      >
        {Array.from({ length: RAY_COUNT }, (_, i) => {
          const angle = (i / RAY_COUNT) * Math.PI * 2;
          const cos = Math.cos(angle);
          const sin = Math.sin(angle);
          const isSecondary = i % 2 === 1;
          const len = isSecondary ? length * 0.65 : length;
          const ray = {
            x1: 100 + cos * inner,
            y1: 100 + sin * inner,
            x2: 100 + cos * (inner + len),
            y2: 100 + sin * (inner + len),
            strokeWidth: isSecondary ? 1.5 + t * 1.5 : 2.5 + t * 2,
            opacity: isSecondary ? Math.max(0, (t - 0.25) / 0.75) : 0.55 + t * 0.45,
          };
          return (
            <motion.line
              key={i}
              stroke={color}
              strokeLinecap="round"
              initial={ray}
              animate={ray}
              transition={MORPH}
            />
          );
        })}
      </motion.g>
      <motion.circle cx={100} cy={100} fill={color} initial={core} animate={core} transition={MORPH} />
    </>
  );
}

/* Mental Clarity — scattered lenses converge into one crisp ring. */
const LENS_OFFSETS = [
  { x: -28, y: -18 },
  { x: 26, y: -24 },
  { x: -22, y: 24 },
  { x: 28, y: 18 },
  { x: 0, y: 0 },
];
function Clarity({ t, color, animateLoops }: PartProps) {
  const spread = 1 - t;
  const focus = { r: 1 + t * 4, opacity: t };
  return (
    <motion.g
      style={{ originX: 0.5, originY: 0.5 }}
      animate={animateLoops ? { scale: [1, 1.035, 1] } : undefined}
      transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
    >
      {LENS_OFFSETS.map((o, i) => {
        const lens = {
          cx: 100 + o.x * spread,
          cy: 100 + o.y * spread,
          strokeWidth: 1.2 + t * 2.4,
          fillOpacity: 0.16 * spread,
          opacity: 0.5 + t * 0.5,
        };
        return (
          <motion.circle
            key={i}
            r={36}
            stroke={color}
            fill={color}
            initial={lens}
            animate={lens}
            transition={{ ...MORPH, delay: i * 0.03 }}
          />
        );
      })}
      <motion.circle cx={100} cy={100} fill={color} initial={focus} animate={focus} transition={MORPH} />
    </motion.g>
  );
}

/* Inner Pressure — airy rings compress under a descending weight. */
const RING_COUNT = 5;
function Pressure({ t, color, animateLoops }: PartProps) {
  const weight = { y1: 20 + t * 30, y2: 20 + t * 30, strokeWidth: 2 + t * 4, opacity: 0.2 + t * 0.8 };
  return (
    <motion.g
      style={{ originX: 0.5, originY: 1 }}
      animate={animateLoops ? { scaleY: [1, 0.985, 1] } : undefined}
      transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }}
    >
      {Array.from({ length: RING_COUNT }, (_, i) => {
        const base = 18 + i * 15;
        const ring = {
          cx: 100,
          cy: 100 + t * 28,
          rx: base * (1 + t * 0.12),
          ry: base * (1 - t * 0.55),
          strokeWidth: 1.4 + t * 2.2,
          opacity: 0.4 + t * 0.55,
        };
        return (
          <motion.ellipse
            key={i}
            fill="none"
            stroke={color}
            initial={ring}
            animate={ring}
            transition={{ ...MORPH, delay: (RING_COUNT - i) * 0.04 }}
          />
        );
      })}
      <motion.line
        x1={68}
        x2={132}
        stroke={color}
        strokeLinecap="round"
        initial={weight}
        animate={weight}
        transition={MORPH}
      />
    </motion.g>
  );
}

/* Grounding — a swaying triangle steadies, widens, and grows roots. */
function Grounding({ t, color, animateLoops }: PartProps) {
  const halfWidth = 26 + t * 38;
  const apexY = 52 - t * 8;
  const baseY = 138;
  const tilt = 7 * (1 - t);
  const swaying = animateLoops && tilt > 0.05;
  const triangle = {
    d: `M 100 ${apexY} L ${100 + halfWidth} ${baseY} L ${100 - halfWidth} ${baseY} Z`,
    fillOpacity: 0.25 + t * 0.6,
    strokeWidth: 2 + t * 1.5,
  };
  const ground = { x1: 100 - halfWidth - 12, x2: 100 + halfWidth + 12, strokeWidth: 2 + t * 2.5 };
  const roots = [
    `M 100 ${baseY} C 92 ${baseY + 14}, 72 ${baseY + 16}, 62 ${baseY + 32}`,
    `M 100 ${baseY} C 100 ${baseY + 16}, 100 ${baseY + 22}, 100 ${baseY + 38}`,
    `M 100 ${baseY} C 108 ${baseY + 14}, 128 ${baseY + 16}, 138 ${baseY + 32}`,
  ];

  return (
    <>
      <motion.g
        style={{ originX: 0.5, originY: 1 }}
        animate={swaying ? { rotate: [-tilt, tilt] } : { rotate: 0 }}
        transition={swaying ? { repeat: Infinity, repeatType: "mirror", duration: 2.4, ease: "easeInOut" } : MORPH}
      >
        <motion.path
          fill={color}
          stroke={color}
          strokeLinejoin="round"
          initial={triangle}
          animate={triangle}
          transition={MORPH}
        />
        <motion.line
          y1={baseY}
          y2={baseY}
          stroke={color}
          strokeLinecap="round"
          initial={ground}
          animate={ground}
          transition={MORPH}
        />
      </motion.g>
      {roots.map((d, i) => {
        const root = { pathLength: Math.max(0.02, t), opacity: t * 0.9 };
        return (
          <motion.path
            key={i}
            d={d}
            fill="none"
            stroke={color}
            strokeWidth={2.2}
            strokeLinecap="round"
            initial={root}
            animate={root}
            transition={{ ...MORPH, delay: i * 0.08 }}
          />
        );
      })}
    </>
  );
}
