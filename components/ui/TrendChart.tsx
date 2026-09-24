import { useState, type PointerEvent as ReactPointerEvent } from "react";
import type { DimensionKey } from "@/lib/types";
import type { TrendPoint } from "@/lib/trend";

export interface TrendSeriesMeta {
  key: DimensionKey;
  label: string;
  color: string;
}

const WIDTH = 640;
const HEIGHT = 200;
const PAD_LEFT = 30;
const PAD_RIGHT = 12;
const PAD_TOP = 12;
const PAD_BOTTOM = 22;
const Y_TICKS = [0, 50, 100];

export default function TrendChart({
  points,
  series,
  dimensions,
}: {
  points: TrendPoint[];
  series: Record<DimensionKey, (number | null)[]>;
  dimensions: TrendSeriesMeta[];
}) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [showTable, setShowTable] = useState(false);

  const plotW = WIDTH - PAD_LEFT - PAD_RIGHT;
  const plotH = HEIGHT - PAD_TOP - PAD_BOTTOM;
  const n = points.length;
  const xAt = (i: number) => PAD_LEFT + (n <= 1 ? 0 : (i / (n - 1)) * plotW);
  const yAt = (v: number) => PAD_TOP + (1 - v / 100) * plotH;

  // Show at most ~7 x-axis labels regardless of period length, so weekly
  // (7 points) and monthly (28-31 points) read at a similar density.
  const labelEvery = Math.max(1, Math.ceil(n / 7));

  function pathFor(values: (number | null)[]): string {
    let d = "";
    let drawing = false;
    values.forEach((v, i) => {
      if (v === null) {
        drawing = false;
        return;
      }
      const cmd = drawing ? "L" : "M";
      d += `${cmd}${xAt(i)},${yAt(v)} `;
      drawing = true;
    });
    return d.trim();
  }

  function handlePointer(e: ReactPointerEvent<SVGRectElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const ratio = Math.min(1, Math.max(0, (x - PAD_LEFT) / plotW));
    const idx = Math.round(ratio * (n - 1));
    setHoverIndex(Math.min(n - 1, Math.max(0, idx)));
  }

  const hovered = hoverIndex !== null ? points[hoverIndex] : null;

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="w-full"
          role="img"
          aria-label={`Trend of ${dimensions.map((d) => d.label).join(", ")} over ${n} days`}
        >
          {Y_TICKS.map((t) => (
            <g key={t}>
              <line
                x1={PAD_LEFT}
                x2={WIDTH - PAD_RIGHT}
                y1={yAt(t)}
                y2={yAt(t)}
                stroke="var(--color-border)"
                strokeWidth={1}
              />
              <text x={PAD_LEFT - 6} y={yAt(t)} textAnchor="end" dominantBaseline="middle" className="fill-foreground-muted" fontSize={9}>
                {t}
              </text>
            </g>
          ))}

          {points.map((p, i) =>
            i % labelEvery === 0 || i === n - 1 ? (
              <text
                key={p.date}
                x={xAt(i)}
                y={HEIGHT - 6}
                textAnchor="middle"
                className="fill-foreground-muted"
                fontSize={9}
              >
                {p.label}
              </text>
            ) : null
          )}

          {dimensions.map((dim) => (
            <path
              key={dim.key}
              d={pathFor(series[dim.key])}
              fill="none"
              stroke={dim.color}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}

          {dimensions.map((dim) => {
            let lastIdx = -1;
            series[dim.key].forEach((v, i) => {
              if (v !== null) lastIdx = i;
            });
            if (lastIdx === -1) return null;
            const v = series[dim.key][lastIdx]!;
            return (
              <circle
                key={`${dim.key}-end`}
                cx={xAt(lastIdx)}
                cy={yAt(v)}
                r={4}
                fill={dim.color}
                stroke="var(--color-surface)"
                strokeWidth={2}
              />
            );
          })}

          {hoverIndex !== null ? (
            <g>
              <line
                x1={xAt(hoverIndex)}
                x2={xAt(hoverIndex)}
                y1={PAD_TOP}
                y2={HEIGHT - PAD_BOTTOM}
                stroke="var(--color-border)"
                strokeWidth={1}
              />
              {dimensions.map((dim) => {
                const v = series[dim.key][hoverIndex];
                if (v === null) return null;
                return (
                  <circle
                    key={`${dim.key}-hover`}
                    cx={xAt(hoverIndex)}
                    cy={yAt(v)}
                    r={4}
                    fill={dim.color}
                    stroke="var(--color-surface)"
                    strokeWidth={2}
                  />
                );
              })}
            </g>
          ) : null}

          <rect
            x={PAD_LEFT}
            y={PAD_TOP}
            width={plotW}
            height={plotH}
            fill="transparent"
            onPointerMove={handlePointer}
            onPointerLeave={() => setHoverIndex(null)}
          />
        </svg>

        {hovered ? (
          <div
            className="pointer-events-none absolute top-0 z-10 flex -translate-x-1/2 flex-col gap-1 rounded-xl border border-border bg-surface px-3 py-2 text-xs shadow-[0_10px_30px_-12px_rgba(38,43,33,0.35)]"
            style={{
              left: `${(xAt(hoverIndex!) / WIDTH) * 100}%`,
              transform: `translateX(${hoverIndex! < n / 2 ? "0%" : "-100%"})`,
            }}
          >
            <p className="font-semibold text-foreground">{hovered.label}</p>
            {dimensions.map((dim) => {
              const v = series[dim.key][hoverIndex!];
              return (
                <div key={dim.key} className="flex items-center gap-1.5 text-foreground-muted">
                  <span className="inline-block h-0.5 w-3 rounded-full" style={{ background: dim.color }} />
                  <span className="flex-1">{dim.label}</span>
                  <span className="font-semibold text-foreground">{v ?? "—"}</span>
                </div>
              );
            })}
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-x-4 gap-y-1.5">
          {dimensions.map((dim) => (
            <div key={dim.key} className="flex items-center gap-1.5 text-xs text-foreground-muted">
              <span className="inline-block h-0.5 w-3.5 rounded-full" style={{ background: dim.color }} />
              {dim.label}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setShowTable((v) => !v)}
          className="text-xs font-semibold text-primary"
        >
          {showTable ? "Hide table" : "View as table"}
        </button>
      </div>

      {showTable ? (
        <div className="max-h-56 overflow-y-auto rounded-xl border border-border">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-surface-muted text-foreground-muted">
              <tr>
                <th className="px-2.5 py-1.5 font-semibold">Date</th>
                {dimensions.map((dim) => (
                  <th key={dim.key} className="px-2.5 py-1.5 font-semibold">{dim.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {points.map((p, i) => (
                <tr key={p.date} className="border-t border-border">
                  <td className="px-2.5 py-1.5 text-foreground-muted">{p.date}</td>
                  {dimensions.map((dim) => (
                    <td key={dim.key} className="px-2.5 py-1.5 font-medium text-foreground">
                      {series[dim.key][i] ?? "—"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
