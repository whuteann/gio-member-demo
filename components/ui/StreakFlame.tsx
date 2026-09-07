export default function StreakFlame({ current }: { current: number }) {
  const lit = current > 0;
  return (
    <div className="flex items-center gap-2">
      <span className={`text-2xl ${lit ? "" : "grayscale opacity-40"}`} aria-hidden>
        🔥
      </span>
      <div>
        <p className="font-display text-lg font-semibold leading-tight text-foreground">{current} day{current === 1 ? "" : "s"}</p>
        <p className="text-xs text-foreground-muted">current streak</p>
      </div>
    </div>
  );
}
