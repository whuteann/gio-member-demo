/**
 * i18next resource registration — see docs/behaviour_log_0001.md.
 *
 * Static import + register pattern ported from
 * GioMembershipPlatform/dual-language-handover/'s lib/i18n.ts, minus the
 * URL-locale-routing this app doesn't use (see that log's "How this
 * adapts" section for why): initial language here comes from
 * lib/useLanguage.ts, not router.locale.
 *
 * This used to list every namespace by hand, once per language — 26
 * imports and two resource blocks. Bahasa Melayu would have made it 39 and
 * three. Imports stay static (the bundler needs them literal), but the
 * namespace list and the resource table are now derived, so adding a
 * namespace is one line per locale instead of three scattered edits.
 *
 * All three locale files must exist for every namespace — a missing one is
 * a build error, deliberately: silent partial translation is worse.
 */

import i18n, { type Resource } from "i18next";
import { initReactI18next } from "react-i18next";
import type { Language } from "@/lib/types";

import { SUPPORTED_LANGUAGES } from "@/lib/languageFallback";
import common_en from "../public/locales/en/common.json";
import dashboard_en from "../public/locales/en/dashboard.json";
import auth_en from "../public/locales/en/auth.json";
import landing_en from "../public/locales/en/landing.json";
import onboarding_en from "../public/locales/en/onboarding.json";
import checkIn_en from "../public/locales/en/checkIn.json";
import innerReading_en from "../public/locales/en/innerReading.json";
import colourPsychology_en from "../public/locales/en/colourPsychology.json";
import progress_en from "../public/locales/en/progress.json";
import profile_en from "../public/locales/en/profile.json";
import membership_en from "../public/locales/en/membership.json";
import corePersonality_en from "../public/locales/en/corePersonality.json";
import journal_en from "../public/locales/en/journal.json";

import common_zh from "../public/locales/zh/common.json";
import dashboard_zh from "../public/locales/zh/dashboard.json";
import auth_zh from "../public/locales/zh/auth.json";
import landing_zh from "../public/locales/zh/landing.json";
import onboarding_zh from "../public/locales/zh/onboarding.json";
import checkIn_zh from "../public/locales/zh/checkIn.json";
import innerReading_zh from "../public/locales/zh/innerReading.json";
import colourPsychology_zh from "../public/locales/zh/colourPsychology.json";
import progress_zh from "../public/locales/zh/progress.json";
import profile_zh from "../public/locales/zh/profile.json";
import membership_zh from "../public/locales/zh/membership.json";
import corePersonality_zh from "../public/locales/zh/corePersonality.json";
import journal_zh from "../public/locales/zh/journal.json";

import common_ms from "../public/locales/ms/common.json";
import dashboard_ms from "../public/locales/ms/dashboard.json";
import auth_ms from "../public/locales/ms/auth.json";
import landing_ms from "../public/locales/ms/landing.json";
import onboarding_ms from "../public/locales/ms/onboarding.json";
import checkIn_ms from "../public/locales/ms/checkIn.json";
import innerReading_ms from "../public/locales/ms/innerReading.json";
import colourPsychology_ms from "../public/locales/ms/colourPsychology.json";
import progress_ms from "../public/locales/ms/progress.json";
import profile_ms from "../public/locales/ms/profile.json";
import membership_ms from "../public/locales/ms/membership.json";
import corePersonality_ms from "../public/locales/ms/corePersonality.json";
import journal_ms from "../public/locales/ms/journal.json";

// Imported, not re-listed: lib/languageFallback.ts holds the one frontend
// list of supported languages (mirroring the backend's
// app/services/languages.py). A second copy here is a copy that can drift.
const LOCALES: readonly Language[] = SUPPORTED_LANGUAGES;

const BUNDLES: Record<Language, Record<string, unknown>> = {
  en: { common: common_en, dashboard: dashboard_en, auth: auth_en, landing: landing_en, onboarding: onboarding_en, checkIn: checkIn_en, innerReading: innerReading_en, colourPsychology: colourPsychology_en, progress: progress_en, profile: profile_en, membership: membership_en, corePersonality: corePersonality_en, journal: journal_en },
  zh: { common: common_zh, dashboard: dashboard_zh, auth: auth_zh, landing: landing_zh, onboarding: onboarding_zh, checkIn: checkIn_zh, innerReading: innerReading_zh, colourPsychology: colourPsychology_zh, progress: progress_zh, profile: profile_zh, membership: membership_zh, corePersonality: corePersonality_zh, journal: journal_zh },
  ms: { common: common_ms, dashboard: dashboard_ms, auth: auth_ms, landing: landing_ms, onboarding: onboarding_ms, checkIn: checkIn_ms, innerReading: innerReading_ms, colourPsychology: colourPsychology_ms, progress: progress_ms, profile: profile_ms, membership: membership_ms, corePersonality: corePersonality_ms, journal: journal_ms },
};

const resources: Resource = Object.fromEntries(
  LOCALES.map((lng) => [lng, BUNDLES[lng]])
) as Resource;

i18n.use(initReactI18next).init({
  resources,
  lng: "en",
  fallbackLng: "en",
  ns: ["common"],
  defaultNS: "common",
  interpolation: { escapeValue: false },
});

export default i18n;
