import type { InputHTMLAttributes } from "react";

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export default function TextField({ label, error, id, className = "", ...rest }: TextFieldProps) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-");
  return (
    <label htmlFor={inputId} className="flex flex-col gap-1.5">
      <span className="text-sm font-semibold text-foreground">{label}</span>
      <input
        id={inputId}
        className={`rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-primary ${error ? "border-danger" : ""} ${className}`}
        {...rest}
      />
      {error ? <span className="text-xs font-medium text-danger">{error}</span> : null}
    </label>
  );
}
