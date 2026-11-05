import type { Language } from "@/lib/types";
import type { SpecificationOut } from "@/lib/api/types";

/**
 * A vendor product spec, in the closest language available.
 *
 * Only English and Chinese exist here, and that is not an oversight: the
 * spec text comes straight out of the vendor feed, which publishes one
 * bilingual string that gio-backend's product_api.py splits in two. There
 * is no Malay in the feed to split, and writing our own would mean
 * inventing material and dimension claims about a real product. So a Malay
 * reader sees English for this block — the facts, not a guess at them.
 *
 * Centralised rather than inlined in three components so that if the vendor
 * ever does ship Malay, it's one edit.
 */
export function localizedSpec(
  spec: SpecificationOut,
  field: "label" | "value",
  language: Language
): string {
  if (language === "zh") return spec[`${field}_zh`] || spec[`${field}_en`];
  return spec[`${field}_en`] || spec[`${field}_zh`];
}
