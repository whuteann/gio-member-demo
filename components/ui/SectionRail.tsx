import { useEffect, useState } from "react";

export interface RailSection {
  id: string;
  label: string;
}

/**
 * A slim line-and-dot navigator pinned to the right edge of the screen —
 * the current section's dot enlarges and reveals a label pill as the page
 * scrolls past each section's id, both animated. Tapping a dot smooth-
 * scrolls straight to that section. Fixed to the viewport (not a scroll
 * container), so it works on an ordinary long page like these reveal/
 * overview screens rather than needing an isolated scroll area.
 */
export default function SectionRail({ sections }: { sections: RailSection[] }) {
  const [active, setActive] = useState(sections[0]?.id ?? "");

  useEffect(() => {
    // IntersectionObserver callbacks only report the targets whose state
    // *changed* since the last check, not every observed target — so the
    // active section has to be recomputed from a running record of all of
    // them, not just whichever happened to be in the latest batch.
    const state = new Map<string, { intersecting: boolean; top: number }>();
    const observed = new Set<string>();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          state.set(entry.target.id, { intersecting: entry.isIntersecting, top: entry.boundingClientRect.top });
        });
        // Among sections currently crossing the activation band, the one
        // that entered it most recently (largest top) is "current" — using
        // the smallest top instead would favour whichever section has been
        // on screen longest, which stays stuck on an earlier section for
        // as long as it and the next one overlap the band together.
        const visible = [...state.entries()]
          .filter(([, v]) => v.intersecting)
          .sort((a, b) => b[1].top - a[1].top);
        if (visible.length > 0) setActive(visible[0][0]);
      },
      // Treats the top 30% of the viewport as the activation line: a
      // section is "current" once it reaches that line and until it
      // scrolls back past the very top. A two-sided band here instead
      // (e.g. only the viewport's middle third) can leave the very first
      // section unreachable if it's shorter than the band's own offset
      // from the top, since its bottom edge never reaches down into it.
      { rootMargin: "0px 0px -70% 0px", threshold: 0 }
    );

    // The sections this rail links to mount as part of the page's own
    // entrance animation, which can commit one or more renders after this
    // rail does — a one-shot getElementById lookup here can run before any
    // of them exist, silently attaching to nothing forever. Instead, watch
    // the DOM and attach each section as soon as it actually appears
    // (covers both the initial race and any section that mounts later).
    const tryAttach = () => {
      sections.forEach((s) => {
        if (observed.has(s.id)) return;
        const el = document.getElementById(s.id);
        if (el) {
          observed.add(s.id);
          state.set(s.id, { intersecting: false, top: 0 });
          observer.observe(el);
        }
      });
    };
    tryAttach();
    const mutation = new MutationObserver(tryAttach);
    mutation.observe(document.body, { childList: true, subtree: true });

    return () => {
      mutation.disconnect();
      observer.disconnect();
    };
    // sections is a small, page-defined constant array — id membership is
    // what matters, not reference identity, so this only needs to re-run if
    // the page passes a genuinely different section list.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sections.map((s) => s.id).join(",")]);

  return (
    <nav
      aria-label="Jump to section"
      className="fixed right-1 top-1/2 z-20 flex -translate-y-1/2 flex-col items-center gap-5 sm:right-3"
    >
      <div className="pointer-events-none absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-border" />
      {sections.map((section) => {
        const isActive = section.id === active;
        return (
          <button
            key={section.id}
            type="button"
            onClick={() => document.getElementById(section.id)?.scrollIntoView({ behavior: "smooth", block: "start" })}
            aria-current={isActive}
            className="relative flex h-4 w-4 items-center justify-center"
          >
            <span
              className={`rounded-full transition-all duration-300 ${isActive ? "h-4 w-4 bg-primary" : "h-2 w-2 bg-border"}`}
            />
            {isActive ? (
              <span className="pointer-events-none absolute right-full mr-2.5 whitespace-nowrap rounded-full bg-primary px-2.5 py-1 text-[10px] font-bold text-primary-foreground">
                {section.label}
              </span>
            ) : null}
          </button>
        );
      })}
    </nav>
  );
}
