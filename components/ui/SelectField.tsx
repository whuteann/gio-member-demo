import type { ReactNode, SelectHTMLAttributes } from "react";

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  children: ReactNode;
}

export default function SelectField({ label, id, children, className = "", ...rest }: SelectFieldProps) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-");
  return (
    <label htmlFor={inputId} className="flex flex-col gap-1.5">
      <span className="text-sm font-semibold text-foreground">{label}</span>
      <select
        id={inputId}
        className={`rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-primary ${className}`}
        {...rest}
      >
        {children}
      </select>
    </label>
  );
}
