import Link from "next/link";
import Button from "./Button";

export default function EntitlementGate({
  title = "This is a Premium feature",
  description,
  ctaLabel = "View Premium plans",
  ctaHref = "/membership",
}: {
  title?: string;
  description: string;
  ctaLabel?: string;
  ctaHref?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-[1.75rem] border border-dashed border-secondary/50 bg-secondary/5 p-8 text-center">
      <span className="text-3xl" aria-hidden>
        🔒
      </span>
      <div>
        <h3 className="font-display text-xl font-semibold text-foreground">{title}</h3>
        <p className="mt-1 text-sm text-foreground-muted">{description}</p>
      </div>
      <Link href={ctaHref}>
        <Button variant="accent">{ctaLabel}</Button>
      </Link>
    </div>
  );
}
