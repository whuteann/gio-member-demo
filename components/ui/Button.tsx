import type { ButtonHTMLAttributes, ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

type Variant = "primary" | "secondary" | "accent" | "outline" | "outline-solid" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  icon?: ReactNode;
  /** Shows a spinner in place of `icon` and disables the button — for an
   * in-flight save/submit, so the button itself signals progress instead
   * of just going inert. Swap `children` too (e.g. "Saving…") if you want
   * the label to change as well. */
  loading?: boolean;
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
  loading = false,
  className = "",
  children,
  disabled,
  ...rest
}: ButtonProps) {
  const reduce = useReducedMotion();

  return (
    <button
      className={`inline-flex items-center justify-center rounded-full font-semibold transition-colors disabled:pointer-events-none disabled:border-disabled disabled:bg-disabled disabled:text-disabled-foreground ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${fullWidth ? "w-full" : ""} ${className}`}
      disabled={disabled || loading}
      {...rest}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={loading ? "loading" : "idle"}
          initial={reduce ? undefined : { opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? undefined : { opacity: 0, y: -4 }}
          transition={{ duration: 0.18 }}
          className="inline-flex items-center justify-center gap-2"
        >
          {loading ? (
            <motion.span
              className="h-3.5 w-3.5 flex-none rounded-full border-2 border-current border-t-transparent opacity-80"
              animate={reduce ? undefined : { rotate: 360 }}
              transition={{ repeat: Infinity, duration: 0.7, ease: "linear" }}
              aria-hidden
            />
          ) : (
            icon
          )}
          {children}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
