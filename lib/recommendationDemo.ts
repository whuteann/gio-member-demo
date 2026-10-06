import type { RecommendationItemOut } from "@/lib/api/types";

// Phone case candidates have no real source yet — confirmed against the
// live vendor API, it has none (see gio-backend/app/services/phonecase_api.py's
// own placeholder note). This is a frontend-only demo item so the "phone
// case" section has something to actually show today; swap/remove the
// moment real PHONE_CASE items start coming back from the API — this
// demo is never sent anywhere, never persisted, purely a visual stand-in.
export const DEMO_PHONE_CASE: RecommendationItemOut = {
  type: "PHONE_CASE",
  reference_id: null,
  title: "Forest Grain Phone Case",
  title_zh: "森林纹理手机壳",
  reason: "A quiet, matte-green case that keeps the same grounded colour close at hand, every time you reach for your phone.",
  reason_zh: "一款低调的哑光绿色手机壳，让同样令人安定的色彩，每次拿起手机时都陪伴在你身边。",
  rank: 999,
  image_url: null,
  price: 79,
  currency: "MYR",
  destination_url: null,
  material_tag: null,
  specifications: null,
};
