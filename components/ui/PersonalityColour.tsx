import { useTranslation } from "react-i18next";
import type { ColourKey } from "@/lib/types";

// Same uploaded tree artwork as ColourOfTheDay (public/icons) — reused
// deliberately, but as its own component with its own label, since this
// colour is a different concept entirely: a permanent, numerology-derived
// trait (core_personalities.*_score, set once at onboarding and never
// recomputed), not "today's" colour. The two were conflated before —
// Core Personality's overview card used to render <ColourOfTheDay>
// captioned "Color of the Day" over what is actually a static trait. See
// gio-backend/docs/behaviour_log_0012.md for the two-colour-systems audit
// that caught this.
const TREE_ICON: Record<ColourKey, string> = {
  scarlet: "/icons/scarletttree.png",
  russet: "/icons/russettree.png",
  gold: "/icons/goldtree.png",
  forest: "/icons/foresttree.png",
  ocean: "/icons/oceantree.png",
};

export default function PersonalityColour({
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
  const { t } = useTranslation("corePersonality");
  const backdrop = `color-mix(in srgb, ${swatch} 22%, white)`;

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      {label ? (
        <p className="text-xs font-semibold uppercase tracking-wide text-foreground-muted">
          {t("colourAffinity.label")}
        </p>
      ) : null}
      <div
        className="flex shrink-0 items-center justify-center rounded-full shadow-[0_14px_30px_-16px_rgba(38,43,33,0.35)]"
        style={{ width: size, height: size, background: backdrop }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- matches ColourOfTheDay's plain <img> pattern */}
        <img src={TREE_ICON[colourKey]} alt="" className="object-contain" style={{ width: size * 0.66, height: size * 0.66 }} />
      </div>
    </div>
  );
}
