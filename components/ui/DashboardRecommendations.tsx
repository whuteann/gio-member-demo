import { useTranslation } from "react-i18next";
import type { RecommendationOut } from "@/lib/api/types";
import type { Language } from "@/lib/types";
import ProductCard from "./ProductCard";

export default function DashboardRecommendations({
  recommendation,
  language,
}: {
  recommendation: RecommendationOut | null;
  language: Language;
}) {
  const { t } = useTranslation("dashboard");
  const products = recommendation?.items.filter((item) => item.type === "PRODUCT").slice(0, 3) ?? [];

  if (products.length === 0) {
    return (
      <p className="text-sm text-foreground-muted">
        {t(recommendation ? "forYou.noProducts" : "forYou.empty")}
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 items-start gap-3 md:grid-cols-2">
      {products.map((item) => (
        <ProductCard
          key={`${item.type}-${item.rank}`}
          language={language}
          compact
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
          }}
        />
      ))}
    </div>
  );
}
