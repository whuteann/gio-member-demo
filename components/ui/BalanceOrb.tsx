import type { ReactNode } from "react";

/**
 * A glossy gradient sphere whose hue is the colour currently recommended
 * after the user's latest check-in or Inner Reading (see
 * lib/recommendation.ts#colourKeyForFocus). Used on the dashboard with the
 * overall balance score in its center, and on the Core Personality page with
 * the archetype icon instead — pass `children` to override the default
 * number.
 *
 * The sphere shading stays entirely within that one hue — a lighter tint near
 * the "light source" fading through the true colour to a deeper shade at the
 * rim — rather than fading to plain white or black, which would wash the
 * recommended colour out.
 */
export default function BalanceOrb({
  value,
  color,
  size = 88,
  children,
}: {
  value?: number;
  color: string;
  size?: number;
  children?: ReactNode;
}) {
  const tint = `color-mix(in srgb, ${color} 55%, white)`;
  const shade = `color-mix(in srgb, ${color} 78%, black)`;

  return (
    <div className="relative shrink-0 rounded-full shadow-[0_16px_30px_-14px_rgba(38,43,33,0.4)]" style={{ width: size, height: size }}>
      <div
        className="absolute inset-0 rounded-full"
        style={{ background: `radial-gradient(circle at 32% 26%, ${tint} 0%, ${color} 55%, ${shade} 100%)` }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        {/* {children ?? (
          <span className="font-display text-xl font-semibold text-white drop-shadow-[0_1px_3px_rgba(38,43,33,0.45)]">
            {Math.round(value ?? 0)}
          </span>
        )} */}
      </div>
    </div>
  );
}
