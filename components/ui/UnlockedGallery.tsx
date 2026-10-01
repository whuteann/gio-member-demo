import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { UnlockedItemOut } from "@/lib/api/types";
import type { Language } from "@/lib/types";

interface Section {
  key: string;
  label: string;
  emoji: string;
  items: UnlockedItemOut[];
}

const PAGE_SIZE = 8;

/**
 * The full, always-100%-present catalogue of affirmations/insights/
 * reflections — see docs/behaviour_log_0011.md. Unlike `UnlockedCollection`
 * (a cycling highlight reel of what's already earned), this is the
 * browsable "unlockables gallery" a visual novel would show: one category
 * at a time via a small pill switcher (mirrors the page's own
 * Overview/Colour Breakdown tabs), searchable by unlocked text, and
 * paginated within a category so a full 20-item list never turns into one
 * long scroll. Locked slots render as a solid black row with no content
 * (withheld server-side, not just hidden) and drop out of search results
 * since there's nothing in them to match against.
 */
export default function UnlockedGallery({ sections, language }: { sections: Section[]; language: Language }) {
  const [activeKey, setActiveKey] = useState(sections[0]?.key);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const active = sections.find((s) => s.key === activeKey) ?? sections[0];
  const normalizedQuery = query.trim().toLowerCase();

  // Unlocked items first (most recently earned first) so they're easy to
  // spot at a glance, rather than scattered wherever their library id
  // happens to fall among the still-locked slots.
  const sortedItems = useMemo(() => {
    if (!active) return [];
    const unlockedItems = [...active.items]
      .filter((item) => item.unlocked)
      .sort((a, b) => (b.unlocked_at ?? "").localeCompare(a.unlocked_at ?? ""));
    const lockedItems = active.items.filter((item) => !item.unlocked);
    return [...unlockedItems, ...lockedItems];
  }, [active]);

  const filtered = useMemo(() => {
    if (!normalizedQuery) return sortedItems;
    return sortedItems.filter((item) => {
      if (!item.unlocked) return false;
      const text = (language === "zh" ? item.text_zh : item.text_en) ?? item.text_en ?? "";
      return text.toLowerCase().includes(normalizedQuery);
    });
  }, [sortedItems, normalizedQuery, language]);

  if (!active) return null;

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const clampedPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((clampedPage - 1) * PAGE_SIZE, clampedPage * PAGE_SIZE);
  const unlockedCount = active.items.filter((item) => item.unlocked).length;

  function selectCategory(key: string) {
    setActiveKey(key);
    setQuery("");
    setPage(1);
  }

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <div className="flex w-full max-w-xs gap-1 rounded-full border border-border bg-surface-muted p-1">
        {sections.map((section) => (
          <button
            key={section.key}
            type="button"
            onClick={() => selectCategory(section.key)}
            className={`flex-1 rounded-full py-1.5 text-xs font-semibold transition-colors ${
              section.key === active.key ? "bg-surface text-foreground shadow-sm" : "text-foreground-muted"
            }`}
          >
            <span aria-hidden>{section.emoji}</span> {section.label}
          </button>
        ))}
      </div>

      <div className="flex w-full items-center gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
          placeholder={`Search unlocked ${active.label.toLowerCase()}…`}
          className="w-full min-w-0 flex-1 rounded-full border border-border bg-surface px-4 py-2 text-sm text-foreground placeholder:text-foreground-muted focus:border-primary focus:outline-none"
        />
        <span className="flex-none text-xs text-foreground-muted">
          {unlockedCount}/{active.items.length}
        </span>
      </div>

      <AnimatePresence mode="wait">
        <motion.ul
          key={`${active.key}-${clampedPage}-${normalizedQuery}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.22 }}
          className="flex w-full flex-col divide-y divide-border overflow-hidden rounded-2xl border border-border"
        >
          {pageItems.length === 0 ? (
            <li className="px-3.5 py-6 text-center text-sm text-foreground-muted">No matches — try a different search.</li>
          ) : (
            pageItems.map((item) => {
              const text = item.unlocked ? ((language === "zh" ? item.text_zh : item.text_en) ?? item.text_en) : null;
              return (
                <li
                  key={item.item_id}
                  className={`flex items-center gap-3 px-3.5 py-3 ${item.unlocked ? "bg-surface" : "bg-foreground"}`}
                >
                  <span
                    className={`flex h-8 w-8 flex-none items-center justify-center rounded-full text-sm ${
                      item.unlocked ? "bg-primary/10 text-primary" : "bg-white/10 text-white/70"
                    }`}
                    aria-hidden
                  >
                    {item.unlocked ? "✓" : "🔒"}
                  </span>
                  <p className={`min-w-0 flex-1 text-sm leading-snug ${item.unlocked ? "line-clamp-2 text-foreground" : "text-white/35"}`}>
                    {item.unlocked ? text : "???"}
                  </p>
                  {item.unlocked && item.unlocked_at ? (
                    <span className="flex-none text-[11px] text-foreground-muted">
                      {new Date(item.unlocked_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    </span>
                  ) : null}
                </li>
              );
            })
          )}
        </motion.ul>
      </AnimatePresence>

      {totalPages > 1 ? (
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={clampedPage === 1}
            aria-label="Previous page"
            className="flex h-8 w-8 items-center justify-center rounded-full text-foreground-muted hover:bg-surface-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
          >
            ‹
          </button>
          <span className="text-xs text-foreground-muted">
            Page {clampedPage} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={clampedPage === totalPages}
            aria-label="Next page"
            className="flex h-8 w-8 items-center justify-center rounded-full text-foreground-muted hover:bg-surface-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
          >
            ›
          </button>
        </div>
      ) : null}
    </div>
  );
}
