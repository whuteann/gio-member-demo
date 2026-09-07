import type { ReactNode } from "react";
import Link from "next/link";

export default function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-5 py-10">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2">
          <span className="text-2xl" aria-hidden>
            🌿
          </span>
          <span className="font-display text-xl font-semibold text-primary">Gio</span>
        </Link>
        <div className="rounded-[1.75rem] border border-border bg-surface p-7 shadow-[0_20px_50px_-30px_rgba(38,43,33,0.5)]">
          <h1 className="font-display text-2xl font-semibold text-foreground">{title}</h1>
          {subtitle ? <p className="mt-1.5 text-sm text-foreground-muted">{subtitle}</p> : null}
          <div className="mt-6">{children}</div>
        </div>
        {footer ? <div className="mt-6 text-center text-sm text-foreground-muted">{footer}</div> : null}
      </div>
    </div>
  );
}
