import Link from "next/link";
import type { Language, RecommendationItem } from "@/lib/types";

// MYR is the only currency this catalog is actually priced in today (see
// gio-backend/docs/behaviour_log_0012.md) — "RM" reads correctly for that;
// anything else falls back to the plain currency code rather than assuming
// a symbol we haven't verified.
function formatPrice(price: number, currency: string): string {
  if (currency === "MYR") return `RM ${price}`;
  return `${currency} ${price}`;
}

export default function ProductCard({
  item,
  language = "en",
  colourName,
  colourSwatch,
}: {
  item: RecommendationItem;
  language?: Language;
  /** The recommendation's matched colour — a profile-level fact, not a
   * per-item one (every PRODUCT item in a batch shares one colour match
   * today), so it's passed down rather than carried on `item`. */
  colourName?: string;
  colourSwatch?: string;
}) {
  const title = (language === "zh" ? item.titleZh : item.title) ?? item.title;
  const reason = (language === "zh" ? item.reasonZh : item.reason) ?? item.reason;

  return (
    <Link
      href={item.destinationUrl ?? "#"}
      className="group flex gap-4 overflow-hidden rounded-2xl border border-border bg-surface p-3 transition-shadow hover:shadow-[0_10px_30px_-18px_rgba(38,43,33,0.4)]"
    >
      {item.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.imageUrl}
          alt={title}
          className="h-24 w-24 flex-none rounded-xl object-cover transition-transform duration-300 group-hover:scale-105"
        />
      ) : null}
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <p className="font-display text-sm font-semibold leading-snug text-foreground">{title}</p>
          {typeof item.price === "number" ? (
            <p className="flex-none text-sm font-semibold text-accent">{formatPrice(item.price, item.currency ?? "MYR")}</p>
          ) : null}
        </div>

        {colourName || item.materialTag ? (
          <div className="flex flex-wrap gap-1.5">
            {colourName ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-surface-muted px-2 py-0.5 text-[10px] font-semibold text-foreground-muted">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: colourSwatch }} aria-hidden />
                {colourName}
              </span>
            ) : null}
            {item.materialTag ? (
              <span className="inline-flex items-center rounded-full bg-surface-muted px-2 py-0.5 text-[10px] font-semibold text-foreground-muted">
                {item.materialTag}
              </span>
            ) : null}
          </div>
        ) : null}

        {/* Styled as a line lifted from a letter — a quote mark + serif
            italic, not plain descriptive copy (see
            gio-backend/app/services/ai_recommendation.py). */}
        <p className="border-l-2 border-gold/40 pl-2.5 font-display text-xs italic leading-relaxed text-foreground-muted">
          <span aria-hidden>&ldquo;</span>
          {reason}
          <span aria-hidden>&rdquo;</span>
        </p>
      </div>
    </Link>
  );
}
