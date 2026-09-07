export default function ProgressBar({
  value,
  max = 100,
  colorClassName = "bg-primary",
  trackClassName = "bg-surface-muted",
  heightClassName = "h-2.5",
}: {
  value: number;
  max?: number;
  colorClassName?: string;
  trackClassName?: string;
  heightClassName?: string;
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className={`w-full overflow-hidden rounded-full ${heightClassName} ${trackClassName}`}>
      <div
        className={`h-full rounded-full transition-all duration-500 ${colorClassName}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
