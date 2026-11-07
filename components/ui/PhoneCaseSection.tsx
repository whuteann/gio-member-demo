import Link from "next/link";
import { useTranslation } from "react-i18next";
import type { RecommendationItemOut } from "@/lib/api/types";
import type { Language } from "@/lib/types";
import { pickUnsuffixed } from "@/lib/languageFallback";
import { localizedSpec } from "@/lib/specDisplay";

function formatPrice(price: number, currency: string): string {
  if (currency === "MYR") return `RM ${price}`;
  return `${currency} ${price}`;
}

function PrimaryCaseCard({ item, language }: { item: RecommendationItemOut; language: Language }) {
  const { t } = useTranslation("colourPsychology");
  const row = item as unknown as Record<string, unknown>;
  const title = pickUnsuffixed<string>(row, "title", language) ?? item.title;
  const reason = pickUnsuffixed<string>(row, "reason", language) ?? item.reason;
  const specs = item.specifications ?? [];

  return (
    <Link
      href={item.destination_url ?? "#"}
      className="group relative flex gap-4 overflow-hidden rounded-2xl border-2 border-gold/50 bg-surface p-3.5 shadow-[0_12px_30px_-16px_rgba(38,43,33,0.35)] transition-shadow hover:shadow-[0_16px_36px_-14px_rgba(38,43,33,0.45)]"
    >
      {item.image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.image_url}
          alt={title}
          className="h-28 w-28 flex-none rounded-xl object-cover transition-transform duration-300 group-hover:scale-105"
        />
      ) : (
        <div className="flex h-28 w-28 flex-none items-center justify-center rounded-xl bg-surface-muted text-3xl" aria-hidden>
          📱
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <span className="inline-flex w-fit items-center rounded-full bg-gold px-2 py-0.5 text-[10px] font-semibold text-white">
          {t("recommendationLetter.primaryCaseBadge")}
        </span>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <p className="min-w-0 basis-full break-words font-display text-base font-semibold leading-snug text-foreground">{title}</p>
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
                <dt className="text-foreground-muted">{localizedSpec(spec, "label", language)}</dt>
                <dd className="text-right font-medium text-foreground">{localizedSpec(spec, "value", language)}</dd>
              </div>
            ))}
          </dl>
        ) : null}
      </div>
    </Link>
  );
}

function SecondaryCaseRow({ item, language }: { item: RecommendationItemOut; language: Language }) {
  const row = item as unknown as Record<string, unknown>;
  const title = pickUnsuffixed<string>(row, "title", language) ?? item.title;
  const reason = pickUnsuffixed<string>(row, "reason", language) ?? item.reason;

  return (
    <Link
      href={item.destination_url ?? "#"}
      className="group flex gap-3 overflow-hidden rounded-xl border border-border bg-surface p-2.5 transition-shadow hover:shadow-[0_8px_20px_-14px_rgba(38,43,33,0.35)]"
    >
      {item.image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.image_url}
          alt={title}
          className="h-14 w-14 flex-none rounded-lg object-cover transition-transform duration-300 group-hover:scale-105"
        />
      ) : (
        <div className="flex h-14 w-14 flex-none items-center justify-center rounded-lg bg-surface-muted text-lg" aria-hidden>
          📱
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex items-start justify-between gap-2">
          <p className="text-xs font-semibold leading-snug text-foreground">{title}</p>
          {typeof item.price === "number" ? (
            <p className="flex-none text-xs font-semibold text-accent">{formatPrice(item.price, item.currency ?? "MYR")}</p>
          ) : null}
        </div>
        <p className="line-clamp-2 text-[11px] italic leading-relaxed text-foreground-muted">{reason}</p>
      </div>
    </Link>
  );
}

/**
 * The phone case pick(s) — shown as its own section wherever a
 * recommendation is rendered. The primary pick (`items[0]`) is rendered
 * prominently (bigger card, badge); a secondary pick (`items[1]`, when
 * present) renders as a smaller, compact row beneath it — never the same
 * visual weight, so "primary" reads as primary at a glance.
 *
 * Empty matches are explained explicitly; only real API items are shown.
 */
export default function PhoneCaseSection({ items, language, status, colourName }: {
  items: RecommendationItemOut[];
  language: Language;
  status?: "READY" | "NO_MATCH" | "UNAVAILABLE" | null;
  colourName?: string;
}) {
  const { t } = useTranslation("colourPsychology");
  if (items.length === 0) {
    if (!status) return null;
    return (
      <p className="rounded-xl bg-surface-muted p-3 text-sm leading-relaxed text-foreground-muted">
        {status === "NO_MATCH"
          ? t("recommendationLetter.noColourMatch", { colour: colourName ?? "" })
          : t("recommendationLetter.caseUnavailable")}
      </p>
    );
  }
  const [primary, secondary] = items;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-foreground-muted">
          {t("recommendationLetter.phoneCaseTitle")}
        </p>
      </div>
      <p className="text-xs leading-relaxed text-foreground-muted">
        {t("recommendationLetter.colourMatchFirst", { colour: colourName ?? "" })}
      </p>
      {primary ? <PrimaryCaseCard item={primary} language={language} /> : null}
      {secondary ? (
        <div className="flex flex-col gap-1.5">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-foreground-muted">
            {t("recommendationLetter.secondaryCaseTitle")}
          </p>
          <SecondaryCaseRow item={secondary} language={language} />
        </div>
      ) : null}
    </div>
  );
}
