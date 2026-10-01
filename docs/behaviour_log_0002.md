# behaviour_log_0002 — Completing dual-language coverage: Check-In/Inner Reading, the remaining pages, and AI-generated content

**Status:** Implemented and verified live — Phases A, B, C, D, and F.
Phase E (Inner Reading's own record content) intentionally deferred; see
"Implementation notes" at the bottom for exactly what shipped, what was
verified, and what's left. This continues
[[behaviour_log_0001]] (the i18n infrastructure decision, and its Phase
4/5 page list) and adds a second, separate investigation that document
never covered: whether the AI-generated *content* itself — question text,
result narratives — is bilingual, not just the static UI chrome around
it. The screenshots you sent (Inner Reading hub, Colour Psychology, both
with `中文` selected) show exactly the Phase 4/5 gap: the sidebar nav is
in Chinese (`behaviour_log_0001` Phase 3, done) but every page's own
heading/copy stayed English, because none of these pages have i18n wired
in at all yet.

## Part 1 — Static UI text: confirmed untranslated, page by page

I checked all 10 pages you listed (plus the 3 sub-pages they lead to) for
`useTranslation` usage — the mechanism every already-converted page
(`dashboard.tsx`, `AppShell.tsx`, the 4 auth pages, landing, onboarding)
uses. **Zero hits on all of them** — these pages have no i18n wiring
whatsoever, not a partial conversion:

| Page | Lines | Status |
| --- | --- | --- |
| `pages/check-in/index.tsx` | 122 | Not converted |
| `pages/check-in/session.tsx` | 301 | Not converted |
| `pages/check-in/history.tsx` | 82 | Not converted |
| `pages/check-in/[id]/result.tsx` | 209 | Not converted |
| `pages/inner-reading/index.tsx` | 319 | Not converted |
| `pages/inner-reading/session.tsx` | 299 | Not converted |
| `pages/inner-reading/history.tsx` | 72 | Not converted |
| `pages/inner-reading/[id]/result.tsx` | 202 | Not converted |
| `pages/colour-psychology/index.tsx` | 280 | Not converted |
| `pages/colour-psychology/[key].tsx` | 76 | Not converted |
| `pages/progress.tsx` | 137 | Not converted |
| `pages/profile.tsx` | 160 | Not converted |
| `pages/membership.tsx` | 214 | Not converted |
| `pages/membership/payment-success.tsx` | 67 | Not converted |
| `pages/membership/payment-failed.tsx` | 29 | Not converted |
| `pages/core-personality.tsx` | 218 | Not converted |
| `pages/journal.tsx` | 109 | Not converted |

~2,900 lines across 17 files. This exactly matches what `behaviour_log_0001`
already flagged as remaining: its "Phase 4 (reflection features) —
partially done" named Check-In/Inner Reading's "4 pages each" as next in
line and never got there; its "Phase 5 — not started" named Core
Personality, Journal, Progress, Colour Psychology, Membership (+ its two
payment pages), and Profile verbatim. Nothing has regressed — this is the
plan's own acknowledged remainder, not a new problem.

No new locale namespace files exist yet for any of this
(`public/locales/{en,zh}/` currently only has `auth`, `common`,
`dashboard`, `landing`, `onboarding.json` — five namespaces, matching the
five converted areas exactly).

## Part 2 — Does the content itself support dual language? Three different answers

This is the part `behaviour_log_0001` didn't scope, because it's a
backend-content question, not a frontend-chrome one. I checked the actual
generation pipelines. The honest answer is **no, not fully — and not
uniformly** — three genuinely different states exist today:

### 2a. Question generation — English-only, by explicit prior decision

`gio-backend/app/services/ai_questions.py`'s own docstring says so
directly: *"English-only for now — the spec for this feature (unlike
Core Personality) doesn't ask for bilingual questions, and the whole
point of this caching scheme is one shared set reused by every user
regardless of language."* Confirmed in `questions.py`: both check-in and
Inner Reading question sets are cached by `(date, increment)` only — one
generation, reused by *every* user that day regardless of their language.
Making this bilingual isn't a translation pass — it changes the cache
key shape (`(date, increment, language)`, doubling the daily OpenAI calls
for question generation) and the storage shape (the `questions` JSONB
column would need per-language text, or two rows).

### 2b. Check-In results — genuinely bilingual for 3 of 6 fields, English-only for the other 3

`InnerStateSnapshot`'s six narrative fields are all JSONB `{en, zh}`
columns at the schema level (`gio-backend/docs/behaviour_log_0006.md`),
but only three are actually populated in both languages today:
`insight`/`reflection_question`/`affirmation` resolve from the curated
bilingual library (`gio-backend/docs/behaviour_log_0011.md`) — real
Chinese text. `current_focus`/`friendly_advice`/`reminder`/
`narrative_summary`/(check-in's own `title`/`subtitle`) are still
freely AI-generated **English-only**, stored as `{"en": "...", "zh": None}`
— that's `cascade.py`'s own docstring, unchanged since I wrote it two
behaviour logs ago.

The frontend's `check-in/[id]/result.tsx` *does* correctly call
`localizedSnapshot(snapshot, field, language)` for all six fields — the
display logic is right. But `localizedSnapshot` falls back to the
English value when `_zh` is null (`lib/snapshotDisplay.ts:22`:
`snapshot[key] ?? snapshot[field_en] ?? null`). So once this page's
*static* text is translated, a Chinese-language user will see a **mixed**
result: real Chinese for insight/reflection/affirmation, silently-English
for current focus, friendly advice, and the reminder — no error, no
visual break, just half the card quietly switching language back. That's
a worse experience than "the whole page is English," because it looks
like a bug rather than a known limitation.

### 2c. Inner Reading results — no bilingual support at all, a deeper gap than check-in's

`InnerReading`'s own model (`gio-backend/app/models/reflection.py:107-134`)
stores `narrative`, `insight`, `reflection_question`, `title`, `subtitle`
as **plain `String` columns** — not JSONB, no `_zh` counterpart at all —
and `life_area_insights` is a single JSONB holding four English-only
strings (work/relationships/personal_growth/conflict_management), not
`{en, zh}` pairs. This isn't an oversight in the current AI call; it's
what I deliberately chose in `behaviour_log_0011.md` when I wired
Inner Reading's insight/reflection_question to the curated library —
I extracted `["en"]` only, "matching existing column shape," because the
column shape itself was never upgraded to match `InnerStateSnapshot`'s.
`inner-reading/[id]/result.tsx` reads `reading.narrative`/`.insight`/
`.reflection_question`/`.life_area_insights` directly, with no
`_en`/`_zh` split and no `localizedSnapshot`-equivalent — there's nothing
for such a helper to read yet. Bringing Inner Reading to parity with
check-in means a model migration (columns → JSONB), not just a
display-logic fix.

### 2d. One more content gap, found along the way: Journal mood/theme tags

`gio-backend/app/services/content.py:339-340`: `JOURNAL_MOODS`/
`JOURNAL_THEMES` are flat English word lists ("Calm", "Hopeful",
"Growth", "Gratitude", ...), deterministically hashed onto each journal
entry (`journal.py::tag_journal_entry`) with no Chinese variant. These
show up as chips on the Journal page itself and feed the mood/theme
rollup I built into the product-recommendation narrative prompt
(`gio-backend/docs/behaviour_log_0012.md`) — that second use is
backend-internal (the AI reads it, the user never sees it directly), so
it doesn't need a language fix; the Journal page's own display of a
user's mood/theme tags does.

## Objectives

1. **Static UI text**: bring all 17 files in Part 1's table to the same
   `useTranslation`/`t()` standard already proven on 5 other areas —
   headings, labels, buttons, empty-states, placeholder copy.
2. **Question generation**: make both check-in and Inner Reading
   questions genuinely bilingual, consistent with how Core Personality
   already handles dual-language generation, without breaking the
   shared-cache-reduces-cost design that made this fast/cheap in the
   first place.
3. **Check-In results**: close the 3-field gap — `current_focus`/
   `friendly_advice`/`reminder`/`narrative_summary`/`title`/`subtitle`
   genuinely bilingual, not English-with-a-silent-fallback.
4. **Inner Reading results**: bring the underlying model up to the same
   bilingual shape `InnerStateSnapshot` already has, then wire the result
   page to a `localizedSnapshot`-equivalent instead of reading flat
   fields.
5. **Journal mood/theme tags**: bilingual, same deterministic-catalog
   pattern as `FOCUS_COPY`/`COLOURS` already use.

## Proposed phases

### Phase A — Check-In & Inner Reading static text (8 pages)
Finishes `behaviour_log_0001`'s own Phase 4, exactly where it stopped.
New `check-in`/`inner-reading` locale namespaces (or one shared
`reflections` namespace — open question 1). Straightforward `t()`
conversion, no backend dependency — can start immediately and ship
independently of Phases C/D below.

### Phase B — The six Phase-5 pages' static text
Colour Psychology (+ its `[key]` detail page), Progress, Profile,
Membership (+ its 2 payment pages), Core Personality, Journal. Same
mechanical conversion as Phase A, also no backend dependency. Finishes
`behaviour_log_0001`'s Phase 5 list in full.

### Phase C — Question generation, bilingual
`ai_questions.py`: prompt changes so a single generation call returns
both languages per question (matching the `CheckInOutcomeGeneration`-style
single-call-both-fields pattern already used elsewhere, rather than two
separate calls) — one row in `CheckInQuestionSet`/`InnerReadingQuestionSet`
with `{en, zh}` per question text, cache key unchanged (`(date, increment)`
still shared across all users/languages, since both languages are now in
the one cached row — no extra generation cost, just a slightly larger
prompt/response). Frontend `check-in/session.tsx`/`inner-reading/session.tsx`
read the field matching `useLanguage()`.

### Phase D — Check-In results, close the 3-field gap
`ai_outcome.py`'s check-in prompt: `current_focus`/`friendly_advice`/
`reminder`/`narrative_summary`/`title`/`subtitle` become genuine `{en,
zh}` pairs from one generation call (same "ask the model for both
languages in one structured response" shape as Phase C), replacing the
current `{"en": ..., "zh": None}` cascade.py wrapping. No schema/model
migration needed — the JSONB columns already exist for exactly this.

### Phase E — Inner Reading results, model migration + bilingual generation
Bigger lift: migrate `InnerReading.narrative`/`.insight`/
`.reflection_question`/`.title`/`.subtitle` from plain `String` to JSONB
`{en, zh}` (mirroring `InnerStateSnapshot`'s existing shape exactly, for
consistency), and `life_area_insights`'s four values from plain strings
to `{en, zh}` pairs each. Update `ai_outcome.py`'s reading prompt to
return both languages. Add a `localizedSnapshot`-equivalent (or extend
the existing one to accept `InnerReadingOut` too) and rewire
`inner-reading/[id]/result.tsx` to use it instead of reading flat fields.

### Phase F — Journal mood/theme tags, bilingual
`content.py`: `JOURNAL_MOODS`/`JOURNAL_THEMES` become `{en, zh}` catalogs
(8 + 8 entries, small). `journal.py::tag_journal_entry` unaffected (still
a deterministic hash pick, just resolving to a bilingual pair now).
Journal page displays the field matching the active language.

## Suggested ordering

A and B have no dependencies and no risk of touching AI-generation
code — safe to do first, and deliver visible progress fastest (the exact
gap in your screenshots). C, D, E, F touch the backend generation
pipelines and are independent of each other, but D should land before A's
Check-In result page work is considered "fully done" — otherwise Phase A
would translate the check-in result page's chrome onto content that's
still silently English for half its fields, reproducing the same
mixed-language experience described in 2b, just one layer further in.
Same relationship between B and E for Inner Reading's result page. E is
the largest single piece of work here (a model migration) and could
reasonably be split out as its own follow-up rather than blocking
everything else.

## Open questions

1. **Namespace granularity**: one `t()` namespace per page (17 files →
   up to ~15 namespaces, since result/index/session naturally cluster) or
   fewer, broader namespaces (e.g. one `reflections` namespace shared by
   all 8 check-in/Inner Reading pages, one `account` namespace shared by
   Profile/Membership)? The existing convention (`dashboard`, `auth`,
   `onboarding`) is one per feature area, not one per page — leaning
   toward following that, but confirming before generating ~15 JSON
   files.
2. **Question-generation cost**: Phase C's "both languages in one call"
   approach keeps cost flat (no extra generation), but roughly doubles
   that one call's output token count. Confirming that trade-off is fine
   rather than, say, only generating the second language lazily/on first
   request in that language.
3. **Scope boundary**: `behaviour_log_0001`'s Phase 5 also named Rewards
   and "the legacy-status check on `recommendation.tsx`/`shop/[id].tsx`"
   — neither is in your list of 10. Leaving both out of this plan unless
   you want them folded in (Rewards in particular may be dead/legacy —
   worth a quick check before spending effort on it either way).

## Implementation notes

**Status: Phases A, B, C, D, and F (journal moods/themes) shipped and
verified live. Phase E (Inner Reading's own record content — narrative/
insight/reflection_question/title/subtitle/life_area_*) is deliberately
not done — see "Deferred" below.**

### Phases A + B — all 17 static-text files converted
Every page in Part 1's table now uses `useTranslation()`/`t()`, with a
new locale namespace per feature area (`checkIn`, `innerReading`,
`colourPsychology`, `progress`, `profile`, `membership`,
`corePersonality`, `journal` — 8 new namespaces, resolving open question
1 in favour of "one per feature area," matching the existing convention).
`common.json` gained a shared `dimensions` block (used by 3+ pages that
all show the same 4 pillar labels) so that one concept isn't translated
inconsistently in multiple places.

Two real bugs found and fixed along the way, both pre-existing and
unrelated to translation itself:
- `check-in/[id]/result.tsx` and `inner-reading/index.tsx` derived their
  display language from `user.preferred_language` directly instead of
  the shared `useLanguage()` hook — meaning the header's live language
  toggle had no effect on those pages' bilingual *content* (only static
  text). Switched both to `useLanguage()`.
- `profile.tsx`'s language `<SelectField>` saved to the backend via its
  own manual `updateMe()` call on form submit, bypassing
  `useLanguage().setLanguage()` entirely — so changing your language in
  Profile never called `i18n.changeLanguage()`, and the UI wouldn't
  actually switch language until next login. Now uses the shared
  `setLanguage()`, switching immediately like the header toggle does.
- `lib/corePersonalityDisplay.ts::localized()` returned an empty string
  when the requested language's content was `null` (e.g. zh backfill not
  done yet) — changed to fall back to English, matching
  `lib/snapshotDisplay.ts::localizedSnapshot()`'s existing convention, so
  switching languages never blanks a card.

`COLOUR_LIBRARY` (`lib/blueprints.ts`) — the 5-colour content dataset
used by `colour-psychology/index.tsx`, `[key].tsx`, and
`ColourBreakdown.tsx` (rendered on Core Personality) — gained full
Chinese translations (name/traits/description/article/benefit/
affirmations/positiveTraits/negativeTraits, all 5 colours) rather than
being left English, since two of its three consumers are pages this pass
converted; translating the chrome but not this content would have
reproduced the exact "half-Chinese, half-English" problem described in
Part 2b. `FOCUS_COLOUR_REASON` got the same treatment.

### Phase C — question generation, bilingual
`ai_questions.py`'s prompts now ask for `{en, zh}` per question (a new
shared `BilingualText` schema in `app/schemas/common.py`, reused by
Phase D below); `questions.py` stores both in the same cached
`(date, increment)` row via a new `text_zh` field. `QuestionOut.text_zh`
is optional (`| None = None`) specifically so question sets cached
*before* this change (English-only) keep working — confirmed live: an
already-cached set correctly returns `text_zh: null` and the frontend
falls back to English, no crash. A fresh `(date, increment)` combination
was verified end-to-end returning genuine, natural (not translated)
Chinese for both check-in and Inner Reading questions.
`check-in/session.tsx` and `inner-reading/session.tsx` display
`text_zh`/`text` by active language (falling back to `text`), and submit
the language the user actually saw back as `question_text`.

### Phase D — Check-In results, the 3-field gap closed
`current_focus`/`friendly_advice`/`reminder` are now genuinely bilingual
(no schema/model change needed — `InnerStateSnapshot`'s JSONB columns
already supported it, per Part 2b). `CheckInSession.title`/`.subtitle`
needed a small additive migration (`title_zh`/`subtitle_zh` columns,
`8a82d868a7c5`) since — discovered while doing this — they were plain
`String` columns, the same limitation Part 2c described for Inner
Reading, just smaller in scope (2 fields, not 7). Verified live end to
end: a fresh check-in returned genuine `title`/`title_zh`,
`subtitle`/`subtitle_zh`, `current_focus_en`/`_zh`, `reminder_en`/`_zh`,
`friendly_advice_en`/`_zh` — all natural phrasing, not literal
translations of each other. Inner Reading's *shared* fields
(reminder/current_focus/friendly_advice, which feed the same
`InnerStateSnapshot` columns) were made bilingual too, same mechanism,
since that target column doesn't care which reflection type triggered
it — only Inner Reading's *own* record fields
(narrative/title/subtitle/life_area_*) stay English, per Phase E below.
`narrative_summary` deliberately stays English-only in both — it's
system memory (`NarrativeEntry.summary`), never shown to a user.

### Phase F — journal moods/themes
Handled as a frontend-only lookup (`journal.json`'s `moods`/`themes`
blocks, keyed by the exact English catalog values the backend already
returns) rather than a backend catalog change — gets the Journal page
fully bilingual immediately without a migration. `content.py`'s
`JOURNAL_MOODS`/`JOURNAL_THEMES` catalog itself is still English-only on
the backend; this frontend mapping is a translation layer in front of it,
not a replacement. If the backend catalog ever changes its English
values, this mapping needs updating alongside it — noted as a coupling
to be aware of, not fixed at the source.

### Deferred — Phase E (Inner Reading's own record content)
Not done in this pass, exactly as flagged as the largest/riskiest single
piece when this plan was written: migrating `InnerReading.narrative`/
`.insight`/`.reflection_question`/`.title`/`.subtitle` from plain
`String` to bilingual JSONB, and `.life_area_insights`'s four values from
plain strings to `{en, zh}` pairs, then rewiring
`inner-reading/[id]/result.tsx` off flat-field reads onto a
`localizedSnapshot`-equivalent. `insight`/`reflection_question` on
`InnerReading` are also worth reconsidering as part of that migration —
they currently store only the English half of an already-bilingual
curated-library entry (`INSIGHTS[insight_id]["en"]`), discarding the
Chinese text that's sitting right there in `content.py`, purely because
the column predates this pass. Also not done: `BADGE_DEFINITIONS`
(`content.py`) stays English-only — `BadgeIcon.tsx` shows raw English
title/description regardless of language; same class of gap as journal
moods/themes but not addressed here.

**Also not touched**, per the confirmed scope boundary: Rewards and the
legacy-status pages (`recommendation.tsx`, `shop/[id].tsx`) — not in your
original list of 10, left alone.

Verified throughout: `tsc --noEmit`, `eslint .`, and
`npm run check:i18n` all clean after every phase; all 16 touched pages
(the 15 converted plus dashboard, to check nothing regressed) smoke-tested
at 200 against a live `next dev` server with no console/log errors; the
backend changes verified with real registered users and real
`docker compose exec` calls against the live OpenAI-backed generation
pipeline, not mocked.
