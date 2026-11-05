import Link from "next/link";
import { useTranslation } from "react-i18next";
import type { RecommendationOut } from "@/lib/api/types";
import type { Language } from "@/lib/types";
import ProductCard from "./ProductCard";
import { pickSuffixed, pickUnsuffixed } from "@/lib/languageFallback";

/**
 * The compact "letter form" card for /colour-psychology: pills connecting
 * it to the user's actual state (colour / focus pillar / material
 * affinity), the AI's one unifying letter, the feature product
 * highlighted, the rest of the product list, then a link to the full
 * magazine-layout brochure (RecommendationMagazine, on /recommendation/[id]).
 * See gio-backend/docs/recommendation_engine.md for the pipeline this
 * renders.
 */
export default function RecommendationLetter({
  recommendation,
  language,
}: {
  recommendation: RecommendationOut;
  language: Language;
}) {
  const { t } = useTranslation("colourPsychology");
  // `letter_*` is suffixed in every language (letter_en/_zh/_ms); the
  // other fields keep English in the unsuffixed column — two storage
  // conventions, two pickers, both walking the same fallback chain.
  const row = recommendation as unknown as Record<string, unknown>;
  const colourName =
    pickUnsuffixed<string>(row, "colour_name", language) ?? recommendation.colour_name;

  const productItems = recommendation.items.filter((i) => i.type === "PRODUCT");
  const [feature, ...otherProducts] = productItems;

  const focusLabel = pickUnsuffixed<string>(row, "current_focus", language);
  const letter = pickSuffixed<string>(row, "letter", language) ?? recommendation.summary;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-1.5">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-muted px-2.5 py-1 text-[11px] font-semibold text-foreground-muted">
          <span aria-hidden>{t("recommendationLetter.colourPill")}</span>
          <span className="h-2 w-2 rounded-full" style={{ background: recommendation.colour_swatch }} aria-hidden />
          {colourName}
        </span>
        {focusLabel ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
            {t("recommendationLetter.focusPill")}: {focusLabel}
          </span>
        ) : null}
        {recommendation.material_affinity ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/15 px-2.5 py-1 text-[11px] font-semibold text-gold">
            {t("recommendationLetter.materialPill")}: {recommendation.material_affinity}
          </span>
        ) : null}
      </div>

      {letter ? (
        <p className="border-l-2 border-gold/40 pl-3 font-display text-sm italic leading-relaxed text-foreground-muted">
          <span aria-hidden>&ldquo;</span>
          {letter}
          <span aria-hidden>&rdquo;</span>
        </p>
      ) : null}

      {feature ? (
        <div>
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-foreground-muted">
            {t("recommendationLetter.featureTitle")}
          </p>
          <ProductCard
            language={language}
            colourName={colourName}
            colourSwatch={recommendation.colour_swatch}
            item={{
              id: String(feature.rank),
              type: "PRODUCT",
              referenceId: feature.reference_id,
              title: feature.title,
              titleZh: feature.title_zh,
              titleMs: feature.title_ms,
              reason: feature.reason,
              reasonZh: feature.reason_zh,
              reasonMs: feature.reason_ms,
              rank: feature.rank,
              imageUrl: feature.image_url ?? undefined,
              price: feature.price ?? undefined,
              currency: feature.currency,
              destinationUrl: feature.destination_url ?? undefined,
              materialTag: feature.material_tag,
              category: feature.category,
              specifications: feature.specifications,
            }}
          />
        </div>
      ) : (
        <p className="text-sm text-foreground-muted">{t("recommended.empty")}</p>
      )}

      {otherProducts.length > 0 ? (
        <div className="flex flex-col gap-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-foreground-muted">
            {t("recommendationLetter.moreProducts")}
          </p>
          {otherProducts.map((item) => (
            <ProductCard
              key={item.rank}
              language={language}
              colourName={colourName}
              colourSwatch={recommendation.colour_swatch}
              item={{
                id: String(item.rank),
                type: "PRODUCT",
                referenceId: item.reference_id,
                title: item.title,
                titleZh: item.title_zh,
                titleMs: item.title_ms,
                reason: item.reason,
                reasonZh: item.reason_zh,
                reasonMs: item.reason_ms,
                rank: item.rank,
                imageUrl: item.image_url ?? undefined,
                price: item.price ?? undefined,
                currency: item.currency,
                destinationUrl: item.destination_url ?? undefined,
                materialTag: item.material_tag,
                category: item.category,
                specifications: item.specifications,
              }}
            />
          ))}
        </div>
      ) : null}

      <Link href={`/recommendation/${recommendation.id}`} className="self-start text-sm font-semibold text-primary">
        {t("recommendationLetter.more")}
      </Link>
    </div>
  );
}
