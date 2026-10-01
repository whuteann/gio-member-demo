/**
 * i18next resource registration — see docs/behaviour_log_0001.md.
 *
 * Static import + register pattern ported from
 * GioMembershipPlatform/dual-language-handover/'s lib/i18n.ts, minus the
 * URL-locale-routing this app doesn't use (see that log's "How this
 * adapts" section for why): initial language here comes from
 * lib/useLanguage.ts, not router.locale.
 *
 * One namespace pair per feature area, added as each area is converted —
 * not every namespace exists yet. Adding a new namespace: create both
 * JSON files under public/locales/{en,zh}/, import both here, and add
 * them to both `resources.en`/`resources.zh` blocks below.
 */

import i18n from "i18next";
import { initReactI18next } from "react-i18next";

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

i18n.use(initReactI18next).init({
  resources: {
    en: {
      common: common_en,
      dashboard: dashboard_en,
      auth: auth_en,
      landing: landing_en,
      onboarding: onboarding_en,
      checkIn: checkIn_en,
      innerReading: innerReading_en,
      colourPsychology: colourPsychology_en,
      progress: progress_en,
      profile: profile_en,
      membership: membership_en,
      corePersonality: corePersonality_en,
      journal: journal_en,
    },
    zh: {
      common: common_zh,
      dashboard: dashboard_zh,
      auth: auth_zh,
      landing: landing_zh,
      onboarding: onboarding_zh,
      checkIn: checkIn_zh,
      innerReading: innerReading_zh,
      colourPsychology: colourPsychology_zh,
      progress: progress_zh,
      profile: profile_zh,
      membership: membership_zh,
      corePersonality: corePersonality_zh,
      journal: journal_zh,
    },
  },
  lng: "en",
  fallbackLng: "en",
  ns: ["common"],
  defaultNS: "common",
  interpolation: { escapeValue: false },
});

export default i18n;
