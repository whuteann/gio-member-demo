import type { HTMLAttributes } from "react";

export default function Card({ className = "", children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-[1.75rem] border border-border bg-surface p-5 shadow-[0_10px_30px_-18px_rgba(38,43,33,0.35)] ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
