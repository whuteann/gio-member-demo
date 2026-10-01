import { useState } from "react";
import type { UnlockedItemOut } from "@/lib/api/types";
import type { ColourKey, Language } from "@/lib/types";

// Same uploaded tree illustrations as ColourOfTheDay (public/icons) — reused
// here rather than duplicated, keyed by the member's Core Personality colour
// affinity rather than the daily recommended colour.
const TREE_ICON: Record<ColourKey, string> = {
  scarlet: "/icons/scarletttree.png",
  russet: "/icons/russettree.png",
  gold: "/icons/goldtree.png",
  forest: "/icons/foresttree.png",
  ocean: "/icons/oceantree.png",
};

// Hand-placed to land on this tree illustration's actual canopy lobes (a
// black trunk/branches under a scalloped ring of rounded leaf clumps — see
// public/icons/*tree.png) so unlock badges read as growing on the tree
// rather than confetti scattered over it. Percentages are of the square
// image box.
const LOBE_POSITIONS = [
  { left: "50%", top: "9%" },
  { left: "31%", top: "15%" },
  { left: "69%", top: "15%" },
  { left: "17%", top: "27%" },
  { left: "83%", top: "27%" },
  { left: "38%", top: "33%" },
  { left: "62%", top: "33%" },
  { left: "13%", top: "43%" },
  { left: "87%", top: "43%" },
  { left: "25%", top: "56%" },
  { left: "75%", top: "56%" },
  { left: "50%", top: "47%" },
] as const;

type Item = UnlockedItemOut & { sectionLabel: string; sectionEmoji: string };

/**
 * The member's colour-affinity tree, decorated with their most recently
 * unlocked affirmations/insights/reflections as small badges sitting on
 * the canopy — see docs/behaviour_log_0011.md ("Tree widget"). Purely a
 * growth visual, capped at the tree's `LOBE_POSITIONS` slots; the full
 * browsable catalogue (locked and unlocked) lives in `UnlockedGallery`
 * below it on the page.
 */
export default function GrowthTree({
  colourKey,
  items,
  language,
  size = 220,
}: {
  colourKey: ColourKey;
  items: Item[];
  language: Language;
  size?: number;
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const unlocked = items
    .filter((item) => item.unlocked)
    .sort((a, b) => (b.unlocked_at ?? "").localeCompare(a.unlocked_at ?? ""));
  const shown = unlocked.slice(0, LOBE_POSITIONS.length);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- matches ColourOfTheDay's plain <img> pattern */}
        <img src={TREE_ICON[colourKey]} alt="" className="h-full w-full object-contain" />
        {shown.map((item, i) => {
          const pos = LOBE_POSITIONS[i];
          const text = (language === "zh" ? item.text_zh : item.text_en) ?? item.text_en;
          const isOpen = openId === item.item_id;
          return (
            <div
              key={item.item_id}
              className="absolute z-0 -translate-x-1/2 -translate-y-1/2 focus-within:z-10"
              style={{ left: pos.left, top: pos.top }}
            >
              <button
                type="button"
                onClick={() => setOpenId(isOpen ? null : item.item_id)}
                aria-label={`${item.sectionLabel}: ${text}`}
                aria-expanded={isOpen}
                className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-[11px] leading-none shadow-[0_2px_6px_rgba(38,43,33,0.4)] ring-2 ring-white/80 transition-transform hover:scale-110"
              >
                <span aria-hidden>{item.sectionEmoji}</span>
              </button>
              {isOpen ? (
                <div className="absolute left-1/2 top-full z-10 mt-1.5 w-40 -translate-x-1/2 rounded-xl bg-foreground px-2.5 py-2 text-center text-[11px] leading-snug text-white shadow-lg">
                  {text}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
      <p className="text-xs text-foreground-muted">
        {shown.length === 0
          ? "Complete a check-in or reading to grow your first blossom."
          : `${unlocked.length} blossom${unlocked.length === 1 ? "" : "s"} grown${unlocked.length > shown.length ? " · newest shown" : ""}`}
      </p>
    </div>
  );
}
