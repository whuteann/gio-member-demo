import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "accent" | "outline" | "outline-solid" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  icon?: ReactNode;
}

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: "bg-primary text-primary-foreground hover:opacity-90",
  secondary: "bg-secondary text-secondary-foreground hover:opacity-90",
  accent: "bg-accent text-accent-foreground hover:opacity-90",
  outline: "border border-border bg-transparent text-foreground hover:bg-surface-muted",
  "outline-solid": "border border-border bg-surface text-foreground hover:bg-surface-muted",
  ghost: "bg-transparent text-foreground hover:bg-surface-muted",
  danger: "bg-danger text-white hover:opacity-90",
};

const SIZE_CLASSES: Record<Size, string> = {
  sm: "text-sm px-3.5 py-2 gap-1.5",
  md: "text-sm px-5 py-3 gap-2",
  lg: "text-base px-6 py-3.5 gap-2",
};

export default function Button({
  variant = "primary",
  size = "md",
  fullWidth,
  icon,
  className = "",
  children,
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-full font-semibold transition-colors disabled:pointer-events-none disabled:border-disabled disabled:bg-disabled disabled:text-disabled-foreground ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${fullWidth ? "w-full" : ""} ${className}`}
      disabled={disabled}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
}
