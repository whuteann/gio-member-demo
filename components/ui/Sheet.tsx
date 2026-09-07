import type { ReactNode } from "react";
import { useEffect } from "react";

export default function Sheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 backdrop-blur-sm sm:items-center">
      <button
        aria-label="Close"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
      />
      <div className="relative z-10 max-h-[85vh] w-full overflow-y-auto rounded-t-[1.75rem] bg-surface p-6 shadow-2xl sm:max-w-md sm:rounded-[1.75rem]">
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-border sm:hidden" />
        {title ? <h2 className="mb-4 font-display text-xl font-semibold text-foreground">{title}</h2> : null}
        {children}
      </div>
    </div>
  );
}
