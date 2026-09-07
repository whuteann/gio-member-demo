import Link from "next/link";
import type { RecommendationItem } from "@/lib/types";

export default function ProductCard({ item }: { item: RecommendationItem }) {
  return (
    <Link
      href={item.destinationUrl ?? "#"}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface transition-shadow hover:shadow-[0_10px_30px_-18px_rgba(38,43,33,0.4)]"
    >
      {item.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.imageUrl}
          alt={item.title}
          className="h-32 w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      ) : null}
      <div className="flex flex-1 flex-col gap-1.5 p-3.5">
        <p className="font-display text-sm font-semibold leading-snug text-foreground">{item.title}</p>
        <p className="text-xs text-foreground-muted">{item.reason}</p>
        {typeof item.price === "number" ? (
          <p className="mt-auto pt-1.5 text-sm font-semibold text-accent">${item.price}</p>
        ) : null}
      </div>
    </Link>
  );
}
