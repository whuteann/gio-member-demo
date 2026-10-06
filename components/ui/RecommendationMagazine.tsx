import { useTranslation } from "react-i18next";
import type { RecommendationItemOut, RecommendationOut } from "@/lib/api/types";
import type { Language } from "@/lib/types";
import PhoneCaseSection from "./PhoneCaseSection";

function formatPrice(price: number, currency: string): string {
  if (currency === "MYR") return `RM ${price}`;
  return `${currency} ${price}`;
}

function SidebarRow({ item, language }: { item: RecommendationItemOut; language: Language }) {
  const isZh = language === "zh";
  const title = (isZh ? item.title_zh : item.title) ?? item.title;
  const reason = (isZh ? item.reason_zh : item.reason) ?? item.reason;
  return (
    <div className="flex gap-3 border-b border-border py-4 first:pt-0 last:border-b-0 last:pb-0">
      {item.image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.image_url} alt={title} className="h-16 w-16 flex-none rounded-xl object-cover" />
      ) : (
        <div className="flex h-16 w-16 flex-none items-center justify-center rounded-xl bg-surface-muted text-xl" aria-hidden>
          💎
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <p className="font-display text-sm font-semibold leading-snug text-foreground">{title}</p>
          {typeof item.price === "number" ? (
            <p className="flex-none text-xs font-semibold text-accent">{formatPrice(item.price, item.currency ?? "MYR")}</p>
          ) : null}
        </div>
        <p className="line-clamp-2 text-xs text-foreground-muted">{reason}</p>
      </div>
    </div>
  );
}

/**
 * The full brochure — a magazine-style layout (big feature image + pull-
 * quote letter on the left, a sidebar of smaller picks on the right),
 * replacing the compact letter-form card's stacked layout for the detail
 * page. See gio-backend/docs/recommendation_engine.md.
 */
export default function RecommendationMagazine({
  recommendation,
  language,
}: {
  recommendation: RecommendationOut;
  language: Language;
}) {
  const { t } = useTranslation("colourPsychology");
  const isZh = language === "zh";

  const productItems = recommendation.items.filter((i) => i.type === "PRODUCT");
  const [feature, ...otherProducts] = productItems;
  const phoneCaseItems = recommendation.items.filter((i) => i.type === "PHONE_CASE");

  const focusLabel = isZh ? recommendation.current_focus_zh : recommendation.current_focus;
  const letter = (isZh ? recommendation.letter_zh : recommendation.letter_en) ?? recommendation.summary;
  const featureTitle = feature ? ((isZh ? feature.title_zh : feature.title) ?? feature.title) : null;
  const featureReason = feature ? ((isZh ? feature.reason_zh : feature.reason) ?? feature.reason) : null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-1.5">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-muted px-3 py-1 text-xs font-semibold text-foreground-muted">
          <span aria-hidden>{t("recommendationLetter.colourPill")}</span>
          <span className="h-2 w-2 rounded-full" style={{ background: recommendation.colour_swatch }} aria-hidden />
          {isZh ? recommendation.colour_name_zh : recommendation.colour_name}
        </span>
        {focusLabel ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            {t("recommendationLetter.focusPill")}: {focusLabel}
          </span>
        ) : null}
        {recommendation.material_affinity ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/15 px-3 py-1 text-xs font-semibold text-gold">
            {t("recommendationLetter.materialPill")}: {recommendation.material_affinity}
          </span>
        ) : null}
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr]">
        {/* Hero column */}
        <div className="flex flex-col gap-5">
          {feature ? (
            <div className="relative">
              {feature.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={feature.image_url}
                  alt={featureTitle ?? ""}
                  className="aspect-[4/5] w-full rounded-[2rem] object-cover sm:aspect-[5/4]"
                />
              ) : (
                <div className="flex aspect-[4/5] w-full items-center justify-center rounded-[2rem] bg-surface-muted text-5xl sm:aspect-[5/4]" aria-hidden>
                  💎
                </div>
              )}
              <span className="absolute left-4 top-4 flex h-14 w-14 items-center justify-center rounded-full border-2 border-gold bg-surface/95 text-center font-display text-[10px] font-semibold leading-tight text-gold shadow-[0_10px_20px_-10px_rgba(38,43,33,0.5)]">
                {t("recommendationLetter.featureBadge")}
              </span>
            </div>
          ) : null}

          {feature ? (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-foreground-muted">
                {t("recommendationLetter.featureTitle")}
              </p>
              <div className="mt-1 flex items-start justify-between gap-3">
                <h2 className="font-display text-2xl font-semibold text-foreground">{featureTitle}</h2>
                {typeof feature.price === "number" ? (
                  <p className="flex-none font-display text-lg font-semibold text-accent">
                    {formatPrice(feature.price, feature.currency ?? "MYR")}
                  </p>
                ) : null}
              </div>
              {feature.material_tag ? (
                <span className="mt-2 inline-flex items-center rounded-full bg-surface-muted px-2.5 py-1 text-[11px] font-semibold text-foreground-muted">
                  {feature.material_tag}
                </span>
              ) : null}
            </div>
          ) : null}

          {letter ? (
            <p className="border-l-2 border-gold/40 pl-4 font-display text-base italic leading-relaxed text-foreground">
              <span aria-hidden>&ldquo;</span>
              {letter}
              <span aria-hidden>&rdquo;</span>
            </p>
          ) : null}

          {featureReason ? (
            <p className="text-sm leading-relaxed text-foreground-muted">{featureReason}</p>
          ) : null}

          {feature?.specifications && feature.specifications.length > 0 ? (
            <dl className="flex flex-col gap-2 rounded-2xl border border-border bg-surface-muted/60 p-4">
              {feature.specifications.map((spec, i) => (
                <div key={i} className="flex justify-between gap-3 text-sm">
                  <dt className="text-foreground-muted">{isZh ? spec.label_zh : spec.label_en}</dt>
                  <dd className="text-right font-semibold text-foreground">{isZh ? spec.value_zh : spec.value_en}</dd>
                </div>
              ))}
            </dl>
          ) : null}
        </div>

        {/* Sidebar column */}
        <div className="flex flex-col gap-6">
          {otherProducts.length > 0 ? (
            <div>
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-foreground-muted">
                {t("recommendationLetter.moreProducts")}
              </p>
              <div className="flex flex-col">
                {otherProducts.map((item) => (
                  <SidebarRow key={item.rank} item={item} language={language} />
                ))}
              </div>
            </div>
          ) : null}

          <PhoneCaseSection items={phoneCaseItems} language={language} />
        </div>
      </div>
    </div>
  );
}
