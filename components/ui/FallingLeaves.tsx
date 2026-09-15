import { motion, useReducedMotion } from "motion/react";
import type { ColourKey } from "@/lib/types";

// Uploaded vector leaves (public/icons), one per supportive colour.
const LEAF_ICON: Record<ColourKey, string> = {
  scarlet: "scarlettleaf",
  russet: "russetleaf",
  gold: "goldleaf",
  forest: "forestleaf",
  ocean: "oceanleaf",
};

// Native size is 528×440 — scaled down to ~50px wide with the same ratio applied.
const LEAF_WIDTH = 50;
const LEAF_HEIGHT = Math.round(LEAF_WIDTH * (440 / 528));

// Hand-placed rather than randomised, so the scatter is identical on every
// render (no server/client hydration mismatch from Math.random at render
// time) while still reading as varied and natural. Fall is in vh, so each
// leaf always crosses the full viewport regardless of screen height. All six
// share the current "Color of the Day" — only their motion differs.
const LEAVES = [
  { left: "5%", duration: 24, delay: 0, drift: 22, spin: 45 },
  { left: "20%", duration: 29, delay: 6, drift: -28, spin: -55 },
  { left: "38%", duration: 21, delay: 12, drift: 18, spin: 40 },
  { left: "56%", duration: 31, delay: 3, drift: -24, spin: -35 },
  { left: "73%", duration: 26, delay: 16, drift: 26, spin: 50 },
  { left: "89%", duration: 28, delay: 9, drift: -16, spin: -45 },
] as const;

/**
 * A quiet backdrop of drifting leaves for the home page, tinted to the
 * current "Color of the Day" (see ColourOfTheDay) so the two stay in sync.
 * Fixed to the viewport (so it reads consistently regardless of scroll
 * position or page height), layered above ordinary content but below the
 * app chrome (nav is z-30) at very low opacity and with pointer-events
 * disabled, so it never competes with reading or clicking. Deliberately
 * faint, slow, and few in number so it reads as ambience rather than
 * something you consciously notice; disabled entirely under reduced-motion
 * preferences.
 */
export default function FallingLeaves({ colourKey }: { colourKey: ColourKey }) {
  const reduce = useReducedMotion();
  if (reduce) return null;

  const src = `/icons/${LEAF_ICON[colourKey]}.png`;

  return (
    <div className="pointer-events-none fixed inset-0 z-20 overflow-hidden" aria-hidden>
      {LEAVES.map((leaf, i) => (
        <motion.img
          key={i}
          src={src}
          alt=""
          className="absolute top-0"
          style={{ left: leaf.left, width: LEAF_WIDTH, height: LEAF_HEIGHT }}
          initial={{ y: "-10vh", x: 0, rotate: 0, opacity: 0 }}
          animate={{
            y: ["-10vh", "110vh"],
            x: [0, leaf.drift, 0],
            rotate: [0, leaf.spin],
            opacity: [0, 0.22, 0.22, 0],
          }}
          transition={{
            y: { duration: leaf.duration, delay: leaf.delay, repeat: Infinity, ease: "linear" },
            x: { duration: leaf.duration, delay: leaf.delay, repeat: Infinity, ease: "easeInOut" },
            rotate: { duration: leaf.duration, delay: leaf.delay, repeat: Infinity, ease: "linear" },
            opacity: {
              duration: leaf.duration,
              delay: leaf.delay,
              repeat: Infinity,
              ease: "linear",
              times: [0, 0.08, 0.85, 1],
            },
          }}
        />
      ))}
    </div>
  );
}
