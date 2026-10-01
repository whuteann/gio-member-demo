/**
 * A numerology number, shown as a tinted circular token rather than bare
 * text — same circular-backdrop language as ColourOfTheDay/PersonalityColour
 * elsewhere on this page, so the Birthday/Life Path/Talent cards read as
 * part of the same visual system instead of a plain number in the corner.
 */
export default function NumeralBadge({
  value,
  accent,
  size = 64,
  className = "",
}: {
  value: number | string;
  accent: string;
  size?: number;
  className?: string;
}) {
  const backdrop = `color-mix(in srgb, ${accent} 16%, white)`;
  // Talent Number can read "21/3" — a touch smaller so it still fits on one line.
  const fontSize = String(value).length > 2 ? size * 0.28 : size * 0.36;

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full ${className}`}
      style={{
        width: size,
        height: size,
        background: backdrop,
        border: `1.5px solid ${accent}55`,
        boxShadow: `0 6px 16px -10px ${accent}aa`,
      }}
    >
      <span className="font-display font-semibold" style={{ color: accent, fontSize }}>
        {value}
      </span>
    </div>
  );
}
