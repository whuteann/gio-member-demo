import type { ReactNode } from "react";

export interface RingDatum {
  value: number;
  color: string;
  trackColor?: string;
}

export default function MultiRingGauge({
  rings,
  size = 140,
  strokeWidth = 9,
  gap = 4,
  children,
}: {
  rings: RingDatum[];
  size?: number;
  strokeWidth?: number;
  gap?: number;
  children?: ReactNode;
}) {
  const center = size / 2;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {rings.map((ring, i) => {
          const radius = center - strokeWidth / 2 - i * (strokeWidth + gap);
          const circumference = 2 * Math.PI * radius;
          const clamped = Math.max(0, Math.min(100, ring.value));
          const offset = circumference * (1 - clamped / 100);
          return (
            <g key={i}>
              <circle
                cx={center}
                cy={center}
                r={radius}
                stroke={ring.trackColor ?? "var(--color-surface-muted)"}
                strokeWidth={strokeWidth}
                fill="none"
              />
              <circle
                cx={center}
                cy={center}
                r={radius}
                stroke={ring.color}
                strokeWidth={strokeWidth}
                fill="none"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                style={{ transition: "stroke-dashoffset 600ms ease" }}
              />
            </g>
          );
        })}
      </svg>
      {children ? <div className="absolute flex flex-col items-center justify-center text-center">{children}</div> : null}
    </div>
  );
}
