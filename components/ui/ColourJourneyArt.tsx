import { useId, useMemo } from "react";

export interface ColourJourneyEntry {
  id: string;
  colour_swatch: string;
  generated_at: string;
}

const MAX_ENTRIES = 10;
// Portrait, 3:4 — the card column is narrow, so the art reads as a panel
// rather than a banner.
const W = 300;
const H = 400;

/** Deterministic 0..1 from a string. The same history always produces the
 *  same artwork, so a user's panel is stable between visits and only
 *  changes when they actually add a reflection — the alternative, Math.random,
 *  would reshuffle the composition on every render. */
function seeded(seed: string): () => number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h ^= h << 13;
    h ^= h >>> 17;
    h ^= h << 5;
    return ((h >>> 0) % 100000) / 100000;
  };
}

/**
 * Abstract art generated from a user's recent supportive colours — the
 * Premium "colour journey" panel.
 *
 * Drawn, not fetched: the composition is pure SVG derived from the colour
 * sequence itself, so it costs nothing, needs no storage, never fails and
 * updates the instant a new reflection lands. Every colour in it is one the
 * user was actually given; nothing here is decorative filler.
 *
 * Reads bottom-to-top, oldest to newest, so the most recent colour is the
 * one at the top of the panel.
 */
export default function ColourJourneyArt({ entries }: { entries: ColourJourneyEntry[] }) {
  const uid = useId().replace(/:/g, "");

  const art = useMemo(() => {
    // Newest-first in, oldest-first out: the gradient should climb.
    const recent = entries.slice(0, MAX_ENTRIES).reverse();
    const rand = seeded(recent.map((e) => e.id).join("") || "empty");

    const stops = recent.map((entry, i) => ({
      colour: entry.colour_swatch,
      offset: recent.length === 1 ? 50 : (i / (recent.length - 1)) * 100,
    }));

    // One soft bloom per entry, drifting left and right as it climbs, so the
    // column reads as a path through the colours rather than a stacked bar.
    const blooms = recent.map((entry, i) => {
      const t = recent.length === 1 ? 0.5 : i / (recent.length - 1);
      return {
        key: `${entry.id}-${i}`,
        colour: entry.colour_swatch,
        cx: W * (0.5 + Math.sin(t * Math.PI * 1.6 + rand() * 0.7) * 0.26),
        cy: H - t * H * 0.92 - H * 0.04,
        r: W * (0.3 + rand() * 0.22),
        opacity: 0.4 + t * 0.4,
      };
    });

    return { stops, blooms, newest: recent[recent.length - 1]?.colour_swatch ?? "#999" };
  }, [entries]);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-auto w-full rounded-2xl"
      role="img"
      aria-label="An abstract composition generated from your recent supportive colours"
    >
      <defs>
        <linearGradient id={`${uid}-base`} x1="0" y1="1" x2="0.15" y2="0">
          {art.stops.map((s, i) => (
            <stop key={i} offset={`${s.offset}%`} stopColor={s.colour} />
          ))}
        </linearGradient>

        {/* Blur radius scales with the canvas, not with pixels, so the panel
            looks identical at any rendered size. */}
        <filter id={`${uid}-soft`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={W * 0.11} />
        </filter>

        <radialGradient id={`${uid}-sheen`} cx="0.5" cy="0.1" r="0.9">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.3" />
          <stop offset="60%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>

        <linearGradient id={`${uid}-depth`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.22" />
        </linearGradient>

        <clipPath id={`${uid}-clip`}>
          <rect width={W} height={H} rx="18" />
        </clipPath>
      </defs>

      <g clipPath={`url(#${uid}-clip)`}>
        <rect width={W} height={H} fill={`url(#${uid}-base)`} />
        <g filter={`url(#${uid}-soft)`}>
          {art.blooms.map((b) => (
            <circle key={b.key} cx={b.cx} cy={b.cy} r={b.r} fill={b.colour} opacity={b.opacity} />
          ))}
        </g>
        <rect width={W} height={H} fill={`url(#${uid}-sheen)`} />
        <rect width={W} height={H} fill={`url(#${uid}-depth)`} />
      </g>

      {/* Inset hairline rather than a border on the element, so the frame sits
          inside the rounded corners and never clips. */}
      <rect
        x="0.75"
        y="0.75"
        width={W - 1.5}
        height={H - 1.5}
        rx="17.5"
        fill="none"
        stroke="rgba(38,43,33,0.14)"
        strokeWidth="1.5"
      />
    </svg>
  );
}
