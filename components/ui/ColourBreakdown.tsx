import { useState } from "react";
import { COLOUR_LIBRARY, COLOUR_ORDER } from "@/lib/blueprints";
import type { ColourKey } from "@/lib/types";
import Card from "@/components/ui/Card";
import Chip from "@/components/ui/Chip";
import { TraitRow } from "@/components/ui/NumerologySection";

const SIZE = 220;
const CENTRE = SIZE / 2;
const MAX_RADIUS = 84;
const GUIDE_RINGS = [0.33, 0.66, 1];

function pointAt(index: number, radius: number) {
  const angle = (-90 + index * (360 / COLOUR_ORDER.length)) * (Math.PI / 180);
  return { x: CENTRE + radius * Math.cos(angle), y: CENTRE + radius * Math.sin(angle) };
}

function ringPoints(radius: number) {
  return COLOUR_ORDER.map((_, i) => pointAt(i, radius))
    .map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`)
    .join(" ");
}

/**
 * "Colour Breakdown" — a five-axis chart showing how in tune the member is
 * with each of Gio's five supportive colours, driven by the real per-user
 * scores generated on CorePersonality (gio-backend's
 * calculate_colour_weights — see docs/behaviour_log_0004.md), not a client-
 * side computation. The highest-scoring colour is the dominant point.
 * Tapping a colour shows its Positive/Negative traits below.
 */
export default function ColourBreakdown({
  scores,
  maxScore = 30,
}: {
  scores: Record<ColourKey, number>;
  maxScore?: number;
}) {
  const dominant = COLOUR_ORDER.reduce((best, key) => (scores[key] > scores[best] ? key : best), COLOUR_ORDER[0]);
  const [selected, setSelected] = useState<ColourKey>(dominant);
  const selectedColour = COLOUR_LIBRARY[selected];

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h3 className="font-display text-lg font-semibold text-foreground">Your Colour Breakdown</h3>
        <p className="mt-1 text-sm text-foreground-muted">
          How in tune you are with each supportive colour right now. Tap a colour to read more.
        </p>
      </div>

      <Card className="flex flex-col items-center gap-2 py-6">
        {/* Side labels (e.g. "Ocean · 71") extend ~65px past their anchor
            point, further than the chart's own radius — the viewBox needs
            that much margin on both sides or the outermost labels clip. */}
        <svg viewBox={`-65 -10 ${SIZE + 130} ${SIZE + 20}`} className="w-full max-w-[300px]" role="img" aria-label={COLOUR_ORDER.map((key) => `${COLOUR_LIBRARY[key].name} ${scores[key]}`).join(", ")}>
          {GUIDE_RINGS.map((fraction) => (
            <polygon key={fraction} points={ringPoints(MAX_RADIUS * fraction)} fill="none" stroke="var(--color-border)" strokeWidth={1} />
          ))}
          {COLOUR_ORDER.map((key, i) => {
            const outer = pointAt(i, MAX_RADIUS);
            return <line key={key} x1={CENTRE} y1={CENTRE} x2={outer.x} y2={outer.y} stroke="var(--color-border)" strokeWidth={1} />;
          })}

          <polygon
            points={COLOUR_ORDER.map((key, i) => {
              const p = pointAt(i, (scores[key] / maxScore) * MAX_RADIUS);
              return `${p.x.toFixed(2)},${p.y.toFixed(2)}`;
            }).join(" ")}
            fill="var(--color-primary)"
            fillOpacity={0.16}
            stroke="var(--color-primary)"
            strokeWidth={1.5}
          />

          {COLOUR_ORDER.map((key, i) => {
            const colour = COLOUR_LIBRARY[key];
            const p = pointAt(i, (scores[key] / maxScore) * MAX_RADIUS);
            const isDominant = key === dominant;
            const labelPoint = pointAt(i, MAX_RADIUS + 22);
            const anchor = Math.abs(labelPoint.x - CENTRE) < 4 ? "middle" : labelPoint.x > CENTRE ? "start" : "end";
            return (
              <g key={key}>
                {isDominant ? <circle cx={p.x} cy={p.y} r={13} fill={colour.swatch} fillOpacity={0.25} /> : null}
                <circle cx={p.x} cy={p.y} r={isDominant ? 6.5 : 5} fill={colour.swatch} stroke="#ffffff" strokeWidth={2} />
                <text
                  x={labelPoint.x}
                  y={labelPoint.y}
                  textAnchor={anchor}
                  dominantBaseline="middle"
                  fontSize={isDominant ? 12 : 10.5}
                  fontWeight={isDominant ? 700 : 400}
                  fill={isDominant ? "var(--color-foreground)" : "var(--color-foreground-muted)"}
                >
                  {colour.name} · {scores[key]}
                </text>
              </g>
            );
          })}
        </svg>
        <Chip tone="gold">
          {selectedColour.key === dominant ? "🌟" : "✨"} Your dominant colour — {COLOUR_LIBRARY[dominant].name}
        </Chip>
      </Card>

      <div className="flex justify-between gap-2 px-1">
        {COLOUR_ORDER.map((key) => {
          const colour = COLOUR_LIBRARY[key];
          const isSelected = key === selected;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setSelected(key)}
              className="flex flex-1 flex-col items-center gap-1.5"
            >
              <span
                className={`h-8 w-8 rounded-full border-2 transition-shadow ${isSelected ? "border-foreground shadow-[0_0_0_3px_var(--color-background),0_0_0_4px_var(--color-border)]" : "border-transparent"}`}
                style={{ background: colour.swatch }}
                aria-hidden
              />
              <span className={`text-[11px] font-semibold ${isSelected ? "text-foreground" : "text-foreground-muted"}`}>
                {colour.name}
              </span>
            </button>
          );
        })}
      </div>

      <Card className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <span className="h-10 w-10 flex-none rounded-full" style={{ background: selectedColour.swatch }} aria-hidden />
          <div>
            <p className="text-sm font-semibold text-foreground">{selectedColour.name}</p>
            <p className="text-xs text-foreground-muted">{selectedColour.traits.join(" • ")}</p>
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-primary">✦ Positive</p>
          <ul className="flex flex-col gap-2">
            {selectedColour.positiveTraits.map((trait) => (
              <TraitRow key={trait} trait={trait} />
            ))}
          </ul>
        </div>
        <div className="rounded-2xl p-3" style={{ background: "color-mix(in srgb, var(--color-danger) 8%, white)" }}>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-danger">▽ Negative</p>
          <ul className="flex flex-col gap-2">
            {selectedColour.negativeTraits.map((trait) => (
              <TraitRow key={trait} trait={trait} />
            ))}
          </ul>
        </div>
      </Card>
    </div>
  );
}
