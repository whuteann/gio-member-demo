const SCALE = [1, 2, 3, 4, 5];

export default function QuestionCard({
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
  return (
    <div className="flex flex-col gap-6">
      <h2 className="font-display text-2xl font-medium leading-snug text-foreground sm:text-3xl">{questionText}</h2>
      <div className="flex items-center justify-between gap-2">
        {SCALE.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`flex h-14 w-14 flex-1 items-center justify-center rounded-2xl border text-lg font-semibold transition-all ${
              value === n
                ? "border-primary bg-primary text-primary-foreground scale-105"
                : "border-border bg-surface text-foreground hover:border-secondary"
            }`}
            aria-pressed={value === n}
          >
            {n}
          </button>
        ))}
      </div>
      <div className="flex justify-between text-xs font-medium text-foreground-muted">
        <span>{lowLabel}</span>
        <span>{highLabel}</span>
      </div>
    </div>
  );
}
