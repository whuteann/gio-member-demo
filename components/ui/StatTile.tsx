import type { ReactNode } from "react";
import Card from "./Card";

export default function StatTile({
  label,
  value,
  icon,
  hint,
}: {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  hint?: string;
}) {
  return (
    <Card className="flex flex-col gap-1 p-4">
      <div className="flex items-center gap-2 text-foreground-muted">
        {icon}
        <span className="text-xs font-semibold uppercase tracking-wide">{label}</span>
      </div>
      <p className="font-display text-2xl font-semibold text-foreground">{value}</p>
      {hint ? <p className="text-xs text-foreground-muted">{hint}</p> : null}
    </Card>
  );
}
