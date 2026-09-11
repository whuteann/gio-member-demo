const SCALE = [1, 2, 3, 4, 5];

export default function SliderQuestionCard({
  questionText,
  lowLabel,
  highLabel,
  value,
  onChange,
}: {
  questionText: string;
  lowLabel: string;
  highLabel: string;
  value: number | null;
  onChange: (value: number) => void;
}) {
  const display = value ?? 3;
  const pct = ((display - 1) / 4) * 100;

  return (
    <div className="flex flex-col gap-8 rounded-[1.75rem] border border-gold/25 bg-gradient-to-b from-gold/10 to-transparent p-6 sm:p-8">
      <h2 className="font-display text-2xl font-medium leading-snug text-foreground sm:text-3xl">{questionText}</h2>
      <div className="flex flex-col gap-4">
        <div className="relative pt-3">
          <div
            className={`pointer-events-none absolute -top-1 flex h-9 w-9 -translate-x-1/2 items-center justify-center rounded-full text-sm font-bold shadow-md transition-all ${
              value === null ? "bg-surface text-foreground-muted border border-border" : "bg-gold text-gold-foreground"
            }`}
            style={{ left: `${pct}%` }}
          >
            {display}
          </div>
          <input
            type="range"
            min={1}
            max={5}
            step={1}
            value={display}
            onChange={(e) => onChange(Number(e.target.value))}
            aria-label={questionText}
            className="h-2 w-full cursor-pointer appearance-none rounded-full [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-surface [&::-moz-range-thumb]:bg-gold [&::-moz-range-thumb]:shadow [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-surface [&::-webkit-slider-thumb]:bg-gold [&::-webkit-slider-thumb]:shadow"
            style={{
              background: `linear-gradient(to right, var(--color-gold) ${pct}%, var(--color-surface-muted) ${pct}%)`,
            }}
          />
          <div className="mt-2 flex justify-between px-0.5">
            {SCALE.map((n) => (
              <span key={n} className={`h-1 w-1 rounded-full ${n <= display ? "bg-gold" : "bg-border"}`} />
            ))}
          </div>
        </div>
        <div className="flex justify-between text-xs font-medium text-foreground-muted">
          <span>{lowLabel}</span>
          <span>{highLabel}</span>
        </div>
      </div>
    </div>
  );
}
