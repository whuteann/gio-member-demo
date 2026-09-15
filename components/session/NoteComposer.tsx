import { useRef, useState, type ChangeEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { DimensionKey } from "@/lib/types";
import { DIMENSION_HEX, EASE_OUT, EASE_SOFT_BACK, GOLD_HEX } from "@/lib/sessionMotion";
import DimensionGlyph from "./DimensionGlyph";
import Button from "@/components/ui/Button";

type Answer = { dimension: DimensionKey; value: number };
type Particle = { id: number; x: number; drift: number };

const HEADING = "Anything you want to note privately?".split(" ");
const MAX_PARTICLES = 10;

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
};
const rise = {
  hidden: { y: 16, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { duration: 0.55, ease: EASE_OUT } },
};
const pop = {
  hidden: { scale: 0.4, opacity: 0, y: 8 },
  show: { scale: 1, opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_SOFT_BACK } },
};

export default function NoteComposer({
  answers,
  note,
  onNoteChange,
  onBack,
  onComplete,
}: {
  answers: Answer[];
  note: string;
  onNoteChange: (value: string) => void;
  onBack: () => void;
  onComplete: () => void;
}) {
  const reduce = useReducedMotion();
  const [focused, setFocused] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const nextId = useRef(0);
  const hasText = note.trim().length > 0;
  const wordCount = hasText ? note.trim().split(/\s+/).length : 0;

  function handleChange(e: ChangeEvent<HTMLTextAreaElement>) {
    const next = e.target.value;
    if (!reduce && next.length > note.length) {
      const id = nextId.current++;
      setParticles((prev) => [
        ...prev.slice(-(MAX_PARTICLES - 1)),
        { id, x: 8 + Math.random() * 84, drift: (Math.random() - 0.5) * 24 },
      ]);
    }
    onNoteChange(next);
  }

  return (
    <motion.div className="flex flex-col gap-5" variants={stagger} initial="hidden" animate="show">
      {/* The four answers, condensed into a small constellation. */}
      <motion.div variants={stagger} className="flex items-center gap-3">
        {answers.map((a, i) => (
          <motion.div
            key={i}
            variants={pop}
            className="flex h-12 w-12 items-center justify-center rounded-full border bg-surface"
            style={{ borderColor: `${DIMENSION_HEX[a.dimension]}55` }}
          >
            <DimensionGlyph dimension={a.dimension} value={a.value} size={40} />
          </motion.div>
        ))}
        <motion.p variants={rise} className="ml-1 text-xs font-semibold uppercase tracking-wide text-foreground-muted">
          Your check-in
        </motion.p>
      </motion.div>

      <motion.h2
        variants={stagger}
        className="font-display text-2xl font-semibold leading-snug text-foreground sm:text-3xl"
        aria-label={HEADING.join(" ")}
      >
        {HEADING.map((word, i) => (
          <motion.span key={i} variants={rise} className="mr-[0.28em] inline-block" aria-hidden>
            {word}
          </motion.span>
        ))}
      </motion.h2>

      <motion.div variants={rise} className="relative">
        {/* Border that draws itself on, then glows on focus. */}
        <svg className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" aria-hidden>
          <motion.rect
            x={0.75}
            y={0.75}
            width="calc(100% - 1.5px)"
            height="calc(100% - 1.5px)"
            rx={24}
            fill="none"
            strokeWidth={1.5}
            initial={{ pathLength: 0, stroke: "#e6ddc9" }}
            animate={{ pathLength: 1, stroke: focused ? GOLD_HEX : hasText ? `${GOLD_HEX}99` : "#e6ddc9" }}
            transition={{ pathLength: { duration: 1.4, ease: EASE_OUT, delay: 0.3 }, stroke: { duration: 0.4 } }}
          />
        </svg>
        <motion.div
          className="rounded-3xl"
          initial={false}
          animate={{
            boxShadow: focused
              ? `0 0 0 6px ${GOLD_HEX}1a, 0 18px 40px -24px ${GOLD_HEX}66`
              : "0 0 0 0px rgba(185,144,42,0), 0 10px 30px -24px rgba(38,43,33,0.25)",
          }}
          transition={{ duration: 0.45, ease: EASE_OUT }}
        >
          <textarea
            value={note}
            onChange={handleChange}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            rows={5}
            placeholder="Optional — this stays private and is never used for recommendations."
            className="block w-full resize-none rounded-3xl border border-transparent bg-surface p-5 text-sm leading-relaxed text-foreground outline-none"
          />
        </motion.div>
        {/* Ink motes that rise from the page as the user writes. */}
        <div className="pointer-events-none absolute inset-0 overflow-visible" aria-hidden>
          {particles.map((p) => (
            <motion.span
              key={p.id}
              className="absolute bottom-4 h-1.5 w-1.5 rounded-full"
              style={{ left: `${p.x}%`, backgroundColor: GOLD_HEX }}
              initial={{ y: 0, x: 0, opacity: 0.85, scale: 1 }}
              animate={{ y: -70, x: p.drift, opacity: 0, scale: 0.3 }}
              transition={{ duration: 1.3, ease: EASE_OUT }}
              onAnimationComplete={() => setParticles((prev) => prev.filter((q) => q.id !== p.id))}
            />
          ))}
        </div>
      </motion.div>

      <motion.div variants={rise} className="flex items-center gap-3 text-xs text-foreground-muted">
        <PrivacyLock sealed={hasText} />
        <span className="relative flex-1">
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={hasText ? "sealed" : "open"}
              className="block"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.3, ease: EASE_OUT }}
            >
              {hasText
                ? "Sealed. Only you can read this, and it never reaches AI context or recommendations."
                : "Private notes are excluded from AI context and recommendations."}
            </motion.span>
          </AnimatePresence>
        </span>
        <AnimatePresence>
          {wordCount > 0 ? (
            <motion.span
              key="count"
              className="shrink-0 rounded-full px-2.5 py-1 font-semibold"
              style={{ backgroundColor: `${GOLD_HEX}22`, color: GOLD_HEX }}
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.3, ease: EASE_SOFT_BACK }}
            >
              {wordCount} {wordCount === 1 ? "word" : "words"}
            </motion.span>
          ) : null}
        </AnimatePresence>
      </motion.div>

      <motion.div variants={rise} className="flex gap-3">
        <Button variant="outline-solid" onClick={onBack}>
          Back
        </Button>
        <motion.div className="flex-1" whileTap={{ scale: 0.98 }}>
          <Button fullWidth onClick={onComplete}>
            Complete Check-In
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

function PrivacyLock({ sealed }: { sealed: boolean }) {
  return (
    <motion.svg
      viewBox="0 0 24 24"
      width={22}
      height={22}
      aria-hidden
      className="shrink-0"
      initial={false}
      animate={{ color: sealed ? GOLD_HEX : "#666f5c" }}
      transition={{ duration: 0.4 }}
    >
      <motion.path
        d="M8 11 V8 a4 4 0 0 1 8 0 v3"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        style={{ originX: 0.5, originY: 1 }}
        initial={false}
        animate={{ y: sealed ? 0 : -3, rotate: sealed ? 0 : -14, x: sealed ? 0 : -1 }}
        transition={{ duration: 0.5, ease: EASE_SOFT_BACK }}
      />
      <motion.rect
        x={5}
        y={11}
        width={14}
        height={10}
        rx={2.5}
        fill="currentColor"
        initial={false}
        animate={{ fillOpacity: sealed ? 1 : 0.18, stroke: "currentColor" }}
        strokeWidth={1.6}
        transition={{ duration: 0.4 }}
      />
    </motion.svg>
  );
}
