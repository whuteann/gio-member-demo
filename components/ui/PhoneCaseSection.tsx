import Link from "next/link";
import { useTranslation } from "react-i18next";
import type { RecommendationItemOut } from "@/lib/api/types";
import type { Language } from "@/lib/types";
import { DEMO_PHONE_CASE } from "@/lib/recommendationDemo";

function formatPrice(price: number, currency: string): string {
  if (currency === "MYR") return `RM ${price}`;
  return `${currency} ${price}`;
}

/**
 * The phone case pick(s) — shown as its own section wherever a
 * recommendation is rendered. Falls back to one frontend-only demo item
 * when `items` is empty (no real phone case candidates this run — e.g.
 * the LumenArt cache hasn't populated yet) — clearly labelled so it's
 * never mistaken for a real pick. Styled to match ProductCard.tsx: a
 * clickable card out to the vendor, the AI-written reason set off like a
 * line lifted from a letter rather than plain descriptive copy.
 */
export default function PhoneCaseSection({ items, language }: { items: RecommendationItemOut[]; language: Language }) {
  const { t } = useTranslation("colourPsychology");
  const isZh = language === "zh";
  const isDemo = items.length === 0;
  const displayItems = isDemo ? [DEMO_PHONE_CASE] : items;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-foreground-muted">
          {t("recommendationLetter.phoneCaseTitle")}
        </p>
        {isDemo ? (
          <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-semibold text-gold">
            {t("recommendationLetter.demoBadge")}
          </span>
        ) : null}
      </div>
      {displayItems.map((item, i) => {
        const title = (isZh ? item.title_zh : item.title) ?? item.title;
        const reason = (isZh ? item.reason_zh : item.reason) ?? item.reason;
        const specs = item.specifications ?? [];
        return (
          <Link
            key={item.reference_id ?? `${item.rank}-${i}`}
            href={item.destination_url ?? "#"}
            className="group flex gap-4 overflow-hidden rounded-2xl border border-border bg-surface p-3 transition-shadow hover:shadow-[0_10px_30px_-18px_rgba(38,43,33,0.4)]"
          >
            {item.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.image_url}
                alt={title}
                className="h-20 w-20 flex-none rounded-xl object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-20 w-20 flex-none items-center justify-center rounded-xl bg-surface-muted text-2xl" aria-hidden>
                📱
              </div>
            )}
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <div className="flex items-start justify-between gap-2">
                <p className="font-display text-sm font-semibold leading-snug text-foreground">{title}</p>
                {typeof item.price === "number" ? (
                  <p className="flex-none text-sm font-semibold text-accent">{formatPrice(item.price, item.currency ?? "MYR")}</p>
                ) : null}
              </div>

              {/* Styled as a line lifted from a letter, same treatment as
                  ProductCard.tsx — this is the same AI letter-writer voice
                  (app/services/ai_recommendation.py), not marketing copy. */}
              <p className="border-l-2 border-gold/40 pl-2.5 font-display text-xs italic leading-relaxed text-foreground-muted">
                <span aria-hidden>&ldquo;</span>
                {reason}
                <span aria-hidden>&rdquo;</span>
              </p>

              {specs.length > 0 ? (
                <dl className="flex flex-col gap-0.5 border-t border-border pt-1.5">
                  {specs.map((spec, specIndex) => (
                    <div key={specIndex} className="flex justify-between gap-3 text-[11px]">
                      <dt className="text-foreground-muted">{isZh ? spec.label_zh : spec.label_en}</dt>
                      <dd className="text-right font-medium text-foreground">{isZh ? spec.value_zh : spec.value_en}</dd>
                    </div>
                  ))}
                </dl>
              ) : null}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
