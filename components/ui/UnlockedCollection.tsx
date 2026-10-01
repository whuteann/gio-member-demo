import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { UnlockedItemOut } from "@/lib/api/types";
import type { Language } from "@/lib/types";
import { EASE_IN_OUT, EASE_SOFT_BACK } from "@/lib/sessionMotion";

interface Section {
  label: string;
  emoji: string;
  items: UnlockedItemOut[];
}

const AUTO_ROTATE_MS = 6000;

// Grows in / shrinks out rather than a flat crossfade, so each new item
// reads as "arriving" instead of just replacing the last one.
const itemVariants = {
  initial: { opacity: 0, scale: 0.85 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: EASE_SOFT_BACK } },
  exit: { opacity: 0, scale: 0.85, transition: { duration: 0.28, ease: EASE_IN_OUT } },
};

/**
 * Cycles through the user's growing collection of unlocked affirmations/
 * insights/reflection questions — see docs/behaviour_log_0011.md. The
 * dashboard passes `onlyUnlocked` so only earned items ever appear there;
 * the full 60-slot locked/unlocked gallery (visual-novel-style, browsable
 * rather than auto-rotating) lives on Core Personality instead, in
 * `UnlockedGallery`.
 */
export default function UnlockedCollection({
  sections,
  language,
  className = "",
  onlyUnlocked = false,
}: {
  sections: Section[];
  language: Language;
  className?: string;
  /** Dashboard usage: cycle only through items already unlocked — no black/locked
   * placeholders here, that gallery view lives on Core Personality instead. */
  onlyUnlocked?: boolean;
}) {
  const reduce = useReducedMotion();
  const flatAll = sections.flatMap((s) => s.items.map((item) => ({ ...item, sectionLabel: s.label, sectionEmoji: s.emoji })));
  const flat = onlyUnlocked ? flatAll.filter((item) => item.unlocked) : flatAll;

  const [index, setIndex] = useState(() => {
    const mostRecentUnlocked = flat
      .map((item, i) => ({ item, i }))
      .filter((x) => x.item.unlocked)
      .sort((a, b) => (b.item.unlocked_at ?? "").localeCompare(a.item.unlocked_at ?? ""))[0];
    return mostRecentUnlocked?.i ?? 0;
  });

  useEffect(() => {
    if (flat.length <= 1) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % flat.length), AUTO_ROTATE_MS);
    return () => clearInterval(id);
  }, [flat.length]);

  const unlockedCount = flatAll.filter((i) => i.unlocked).length;

  if (flat.length === 0) {
    return onlyUnlocked ? (
      <p className={`text-center text-sm text-foreground-muted ${className}`}>
        Complete a check-in or reading to start unlocking affirmations, insights, and reflections.
      </p>
    ) : null;
  }
  const current = flat[index];
  const text = (language === "zh" ? current.text_zh : current.text_en) ?? current.text_en;

  function go(delta: number) {
    setIndex((i) => (i + delta + flat.length) % flat.length);
  }

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      <div className="flex w-full items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => go(-1)}
          aria-label="Previous"
          className="flex h-8 w-8 flex-none items-center justify-center rounded-full text-lg text-foreground-muted hover:bg-surface-muted hover:text-foreground"
        >
          ‹
        </button>
        <div className="flex min-h-[104px] w-full max-w-xs flex-col items-center justify-center gap-2 overflow-hidden text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              className="flex flex-col items-center gap-2"
              initial={reduce ? undefined : "initial"}
              animate={reduce ? undefined : "animate"}
              exit={reduce ? undefined : "exit"}
              variants={itemVariants}
            >
              {current.unlocked ? (
                <>
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-primary">
                    {current.sectionEmoji} {current.sectionLabel}
                  </span>
                  <p className="font-display text-base font-medium leading-snug text-foreground">{text}</p>
                </>
              ) : (
                <>
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-foreground text-xl" aria-hidden>
                    🔒
                  </div>
                  <p className="text-xs text-foreground-muted">Keep reflecting to unlock this one.</p>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
        <button
          type="button"
          onClick={() => go(1)}
          aria-label="Next"
          className="flex h-8 w-8 flex-none items-center justify-center rounded-full text-lg text-foreground-muted hover:bg-surface-muted hover:text-foreground"
        >
          ›
        </button>
      </div>
      <p className="text-xs text-foreground-muted">
        {unlockedCount} / {flatAll.length} unlocked
      </p>
    </div>
  );
}
