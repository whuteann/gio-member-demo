import Link from "next/link";
import { useTranslation } from "react-i18next";
import Button from "./Button";

/** `title` and `ctaLabel` are optional, and almost no caller passes
 * `ctaLabel` — so their defaults are resolved here through i18n rather than
 * being English string literals in the signature. A default literal looks
 * harmless but leaks untranslated text into every gate in the app, which is
 * exactly what happened with "View Premium plans". */
export default function EntitlementGate({
  title,
  description,
  ctaLabel,
  ctaHref = "/membership",
}: {
  title?: string;
  description: string;
  ctaLabel?: string;
  ctaHref?: string;
}) {
  const { t } = useTranslation("common");
  const resolvedTitle = title ?? t("entitlementGate.title");
  const resolvedCtaLabel = ctaLabel ?? t("entitlementGate.cta");

  return (
    <div className="flex flex-col items-center gap-4 rounded-[1.75rem] border border-dashed border-secondary/50 bg-secondary/5 p-8 text-center">
      <span className="text-3xl" aria-hidden>
        🔒
      </span>
      <div>
        <h3 className="font-display text-xl font-semibold text-foreground">{resolvedTitle}</h3>
        <p className="mt-1 text-sm text-foreground-muted">{description}</p>
      </div>
      <Link href={ctaHref}>
        <Button variant="accent">{resolvedCtaLabel}</Button>
      </Link>
    </div>
  );
}
