import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { Language } from "@/lib/types";

/** Each language is labelled in its own script — a Malay speaker looking
 *  for their language should see "Bahasa Melayu", not "Malay". Standard
 *  practice, and the reason these aren't translation keys. */
const OPTIONS: { value: Language; label: string; short: string }[] = [
  { value: "en", label: "English", short: "EN" },
  { value: "zh", label: "中文", short: "中" },
  { value: "ms", label: "Bahasa Melayu", short: "MS" },
];

/**
 * The language picker. Replaces the two-option pill slider, which couldn't
 * grow past two and had no room for a label as long as "Bahasa Melayu".
 *
 * A custom listbox rather than a native <select> so it can be styled to
 * match the rest of the app, with the keyboard behaviour a native select
 * would have given for free implemented explicitly: Escape closes, arrows
 * move, Enter picks, click-away dismisses, and focus returns to the
 * trigger on close.
 */
export default function LanguageSelect({
  value,
  onChange,
  className = "",
  variant = "full",
}: {
  value: Language;
  onChange: (language: Language) => void;
  className?: string;
  /** `full` fills its container (forms); `compact` is a small trigger for
   *  tight spots like a header. */
  variant?: "full" | "compact";
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const reduceMotion = useReducedMotion();

  const selected = OPTIONS.find((o) => o.value === value) ?? OPTIONS[0];

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function openList() {
    setActive(OPTIONS.findIndex((o) => o.value === value));
    setOpen(true);
  }

  function pick(lang: Language) {
    onChange(lang);
    setOpen(false);
    triggerRef.current?.focus();
  }

  function onTriggerKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openList();
    }
  }

  function onListKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % OPTIONS.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i - 1 + OPTIONS.length) % OPTIONS.length);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      pick(OPTIONS[active].value);
    }
  }

  return (
    <div ref={rootRef} className={`relative ${variant === "full" ? "w-full" : "w-auto"} ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={onTriggerKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`flex items-center justify-between gap-2 rounded-2xl border border-border bg-surface text-sm font-semibold text-foreground transition-colors hover:bg-surface-muted ${
          variant === "full" ? "w-full px-4 py-3" : "px-3 py-1.5"
        }`}
      >
        <span className="flex items-center gap-2 truncate">
          <span aria-hidden className="text-[11px] font-bold tracking-wide text-foreground-muted">
            {selected.short}
          </span>
          {variant === "full" ? <span className="truncate">{selected.label}</span> : null}
        </span>
        <motion.span
          aria-hidden
          animate={{ rotate: open ? 180 : 0 }}
          transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 400, damping: 30 }}
          className="text-foreground-muted"
        >
          ▾
        </motion.span>
      </button>

      <AnimatePresence>
        {open ? (
          <motion.ul
            role="listbox"
            tabIndex={-1}
            onKeyDown={onListKeyDown}
            initial={reduceMotion ? false : { opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
            transition={{ duration: 0.14 }}
            className={`absolute z-30 mt-1.5 min-w-[11rem] overflow-hidden rounded-2xl border border-border bg-surface p-1 shadow-[0_18px_40px_-20px_rgba(38,43,33,0.45)] ${
              // `compact` triggers live at a right edge (sidebar header,
              // mobile header), and the list is wider than the trigger —
              // anchored left it would run off the edge.
              variant === "full" ? "w-full" : "right-0"
            }`}
          >
            {OPTIONS.map((opt, i) => {
              const isSelected = opt.value === value;
              return (
                <li key={opt.value} role="option" aria-selected={isSelected}>
                  <button
                    type="button"
                    onClick={() => pick(opt.value)}
                    onMouseEnter={() => setActive(i)}
                    className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
                      isSelected ? "bg-primary text-primary-foreground font-semibold" : i === active ? "bg-surface-muted text-foreground" : "text-foreground"
                    }`}
                  >
                    <span className="truncate">{opt.label}</span>
                    <span aria-hidden className={`text-[11px] font-bold ${isSelected ? "opacity-80" : "text-foreground-muted"}`}>
                      {isSelected ? "✓" : opt.short}
                    </span>
                  </button>
                </li>
              );
            })}
          </motion.ul>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
