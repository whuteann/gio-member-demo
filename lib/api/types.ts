// Response/request shapes mirroring gio-backend's Pydantic schemas
// (app/schemas/*.py) field-for-field. Kept separate from lib/types.ts,
// which models the OLD localStorage mock's domain — the two are allowed to
// diverge as pages migrate one at a time (see docs/dev_log_0001.md).

export interface ApiUser {
  id: string;
  email: string;
  display_name: string;
  gid: string;
  status: string;
  preferred_language: string;
  timezone: string;
  birthdate: string | null;
  onboarding_completed_at: string | null;
  core_personality_last_recalibrated_at: string | null;
  last_login_at: string | null;
  created_at: string;
}

export interface ApiSubscription {
  plan: "FREE" | "PREMIUM";
  status: string;
  starts_at: string | null;
  renews_at: string | null;
  expires_at: string | null;
  cancelled_at: string | null;
  trial_ends_at: string | null;
}

export interface MeResponse {
  user: ApiUser;
  subscription: ApiSubscription;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

// --- Personality -------------------------------------------------------

export interface CorePersonalityOut {
  id: string;
  version: number;
  archetype: string;
  icon: string;
  thinking: number;
  emotional_sensitivity: number;
  adaptability: number;
  willpower: number;
  overall_explanation: string;
  pillar_explanations: Record<string, string>;
  assessment_version: string;
  is_current: boolean;
  generated_at: string;
  recalibrated_at: string | null;
}

export interface BaselineQuestionOut {
  index: number;
  pillar: string;
  prompt: string;
  option_a: { label: string };
  option_b: { label: string };
}

export interface RecalibrateResponse {
  ok: boolean;
  personality?: CorePersonalityOut;
  next_eligible_at?: string;
}

export interface NumerologyOut {
  life_path_number: number;
  birthday_number: number;
  talent_number: number;
}

export interface ColourBreakdownOut {
  dominant_colour_key: string;
  scores: { colour_key: string; score: number }[];
}

// The new numerology-driven Core Personality shape (see gio-backend's
// docs/behaviour_log_0002.md through 0004.md) — deliberately a separate
// type from CorePersonalityOut above, which still matches the old
// archetype-quiz shape /personality/current etc. return (those endpoints
// are broken post-rebuild, but that's not this type's concern).
export interface CorePersonalityResultOut {
  id: string;
  primary_language: string | null;
  generation_status: "PARTIAL" | "READY";

  birthday_number: number | null;
  birthday_number_content_en: string | null;
  birthday_number_content_zh: string | null;

  life_path_number: number | null;
  life_path_number_content_en: string | null;
  life_path_number_content_zh: string | null;

  talent_number: string | null;
  talent_number_content_en: string | null;
  talent_number_content_zh: string | null;

  title_en: string | null;
  title_zh: string | null;
  subtitle_en: string | null;
  subtitle_zh: string | null;
  overview_en: string | null;
  overview_zh: string | null;
  summary_en: string | null;
  summary_zh: string | null;

  scarlet_score: number | null;
  russet_score: number | null;
  gold_score: number | null;
  forest_score: number | null;
  ocean_score: number | null;

  generated_at: string;
}

// --- Check-ins / Inner Readings -----------------------------------------

export type DimensionKey = "emotional_energy" | "mental_clarity" | "inner_pressure" | "grounding";

export interface QuestionOut {
  dimension: DimensionKey;
  text: string;
}

export interface QuestionSetOut {
  blueprint_version: string;
  questions: QuestionOut[];
}

export interface AnswerIn {
  dimension: DimensionKey;
  question_text: string;
  value: number;
}

export interface OutcomeOut {
  xp_awarded: number;
  bonus_awarded: boolean;
  milestone: number | null;
  new_badges: string[];
}

export interface CheckInSubmitResponse {
  session_id: string;
  outcome: OutcomeOut;
}

export interface InnerReadingSubmitResponse {
  reading_id: string;
  outcome: OutcomeOut;
}

export interface CheckInAnswerOut {
  dimension: string;
  question_text: string;
  answer_value: number;
  normalized_value: number;
  order_index: number;
}

export interface CheckInSessionOut {
  id: string;
  status: string;
  blueprint_version: string;
  private_note: string | null;
  summary: string | null;
  started_at: string;
  completed_at: string | null;
  answers: CheckInAnswerOut[];
}

export interface InnerReadingOut {
  id: string;
  ordinal: number;
  status: string;
  blueprint_version: string;
  emotional_energy: number | null;
  mental_clarity: number | null;
  inner_pressure: number | null;
  grounding: number | null;
  result_summary: string | null;
  narrative: string | null;
  insight: string | null;
  reflection_question: string | null;
  title: string | null;
  subtitle: string | null;
  life_area_insights: { work: string; relationships: string; personal_growth: string; conflict_management: string } | null;
  is_premium_content: boolean;
  category: string;
  emoji: string;
  started_at: string;
  completed_at: string | null;
  created_at: string;
}

export interface InnerStateSnapshotOut {
  id: string;
  source_type: string;
  check_in_session_id: string | null;
  inner_reading_id: string | null;
  emotional_energy: number;
  mental_clarity: number;
  inner_pressure: number;
  grounding: number;
  colour_key: string | null;
  insight_en: string | null;
  insight_zh: string | null;
  reflection_question_en: string | null;
  reflection_question_zh: string | null;
  reminder_en: string | null;
  reminder_zh: string | null;
  current_focus_en: string | null;
  current_focus_zh: string | null;
  friendly_advice_en: string | null;
  friendly_advice_zh: string | null;
  affirmation_en: string | null;
  affirmation_zh: string | null;
  created_at: string;
}

export interface CheckInResultsOut {
  session: CheckInSessionOut;
  snapshot: InnerStateSnapshotOut | null;
}

export interface TrendPointOut {
  date: string;
  label: string;
  emotional_energy: number | null;
  mental_clarity: number | null;
  inner_pressure: number | null;
  grounding: number | null;
}

export interface TrendOut {
  period: "weekly" | "monthly";
  points: TrendPointOut[];
}

// --- Recommendations / colours -------------------------------------------

export interface RecommendationItemOut {
  type: string;
  reference_id: string | null;
  title: string;
  reason: string;
  rank: number;
  image_url: string | null;
  price: number | null;
  destination_url: string | null;
}

export interface RecommendationOut {
  id: string;
  current_focus: string;
  summary: string;
  colour_key: string;
  colour_name: string;
  colour_swatch: string;
  status: string;
  generated_at: string;
  items: RecommendationItemOut[];
}

export interface ColourOut {
  key: string;
  name: string;
  swatch: string;
  traits: string[];
  description: string;
  article: string;
  benefit: string;
  affirmations: string[];
  positive_traits: string[];
  negative_traits: string[];
}

// --- Progress / rewards / journal -----------------------------------------

export interface StreakOut {
  current: number;
  best: number;
  last_reflection_date: string | null;
  milestones_awarded: number[];
}

export interface GardenOut {
  week_start: string;
  stage: number;
  actions_this_week: number;
}

export interface BadgeOut {
  key: string;
  group: "consistency" | "depth" | "growth";
  title: string;
  description: string;
  icon: string;
  earned: boolean;
  earned_at: string | null;
}

export interface ProgressOut {
  xp_total: number;
  streak: StreakOut;
  garden: GardenOut;
  quests_today: string[];
  badges: BadgeOut[];
}

export interface RewardOut {
  key: string;
  title: string;
  description: string;
  icon: string;
  requirement: string;
  state: "LOCKED" | "UNLOCKED" | "REDEEMED";
  unlocked_at: string | null;
  redeemed_at: string | null;
}

export interface JournalEntryOut {
  id: string;
  content: string;
  mood: string;
  theme: string;
  created_at: string;
}

export interface JournalInsightsOut {
  entries_this_week: number;
  entries_delta: number;
  top_mood: string | null;
  top_theme: string | null;
}
