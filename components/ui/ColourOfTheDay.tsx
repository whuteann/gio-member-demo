import type { ColourKey } from "@/lib/types";

// Uploaded vector icons, one per supportive colour (public/icons). Filenames
// as provided — "scarletttree" keeps the extra "t" it was uploaded with.
const TREE_ICON: Record<ColourKey, string> = {
  scarlet: "/icons/scarletttree.png",
  russet: "/icons/russettree.png",
  gold: "/icons/goldtree.png",
  forest: "/icons/foresttree.png",
  ocean: "/icons/oceantree.png",
};

/**
 * The member's current supportive colour, shown as its matching tree icon on
 * a circular backdrop tinted to a lighter shade of that same colour. Used on
 * the dashboard, Colour Psychology, and Core Personality pages wherever the
 * "current colour" used to be a plain swatch or gradient sphere.
 */
export default function ColourOfTheDay({
  colourKey,
  swatch,
  size = 112,
  label = true,
  className = "",
}: {
  colourKey: ColourKey;
  swatch: string;
  size?: number;
  label?: boolean;
  className?: string;
}) {
  const backdrop = `color-mix(in srgb, ${swatch} 22%, white)`;

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      {label ? (
        <p className="text-xs font-semibold uppercase tracking-wide text-foreground-muted">
          Color of the Day
        </p>
      ) : null}
      <div
        className="flex shrink-0 items-center justify-center rounded-full shadow-[0_14px_30px_-16px_rgba(38,43,33,0.35)]"
        style={{ width: size, height: size, background: backdrop }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- matches the plain <img> pattern used elsewhere in this app (ProductCard, shop) rather than introducing next/image */}
        <img src={TREE_ICON[colourKey]} alt="" className="object-contain" style={{ width: size * 0.66, height: size * 0.66 }} />
      </div>
    </div>
  );
}
