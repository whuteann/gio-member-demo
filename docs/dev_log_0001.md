# dev_log_0001 — Wiring the frontend to gio-backend

**Status:** Implemented and verified end-to-end against a live
`gio-backend` (Docker) + `gio-member-app` (`next dev`) pair. Companion to
`gio-backend/docs/dev_log_0001.md`, which documents what the backend
actually implements — this is the mirror doc for what the frontend now
*calls*, page by page, and what's deliberately still on the old mock.

## Architecture added

- **Redux + `redux-persist`** (`store/`): a new `auth` slice
  (`token`, `user`, `subscription`) is the **real session**, persisted to
  `localStorage` under its own key so a page reload stays logged in — this
  is the "redux persist user session auth" piece, and it's confirmed
  working (see "What was tested").
- **API client** (`lib/api/client.ts`): a thin `fetch` wrapper, not axios —
  no new HTTP dependency. Field names match the backend's snake_case JSON
  verbatim; `lib/api/types.ts` mirrors every Pydantic schema.
- **`lib/useAuthGuard.ts`**: the real-session route guard (redirects to
  `/auth/login` with no token, to `/onboarding` if onboarding isn't done) —
  the backend-wired equivalent of the existing `lib/useAppGuard.ts`, which
  still exists unchanged for pages that haven't moved.
- **`lib/useApiResource.ts`**: a small fetch-on-mount hook (loading/error/
  data/refetch) reused across every wired page instead of a query library.
- **`lib/api/entitlement.ts`**: `isPremiumActive`/`innerReadingGate` re-
  implemented for the backend's snake_case `ApiSubscription` — same rules as
  `lib/entitlement.ts`, which still exists for the mock.

**Two sessions now genuinely coexist.** `components/layout/AppShell.tsx`
was made dual-aware: it prefers the Redux session when one exists, falling
back to the old localStorage mock otherwise. This is what makes it possible
to migrate pages one at a time — a page on the old mock and a page on the
real backend can render through the same sidebar/nav without either knowing
about the other.

## One bug the migration surfaced: no CORS on the backend

First end-to-end run failed at the very first `fetch` — the browser blocked
it (`No 'Access-Control-Allow-Origin' header`). `gio-backend` had never been
called from a browser before (only `curl`/Swagger), so this was never hit.
Fixed by adding `CORSMiddleware` in `gio-backend/app/main.py`, origin list
driven by a new `CORS_ORIGINS` setting (defaults to
`http://localhost:3000`). Verified with a real preflight request before
re-running the frontend test.

## Page-by-page status

| Page | Backend-wired? | Notes |
|---|---|---|
| `/auth/login`, `/auth/register` | ✅ | Real JWT session → Redux. "Continue as Demo Member" relabelled **"Preview Mock Demo Data"** — it still boots the old mock (see below), now clearly a separate thing from a real account. |
| `/auth/forgot-password`, `/auth/reset-password` | ❌ | Backend has no reset-token flow (deliberately — see `gio-backend`'s dev log). Left on the old mock's insecure email-only reset; **do not treat this as production-ready either way.** |
| `/onboarding` | ✅ | `POST /personality/onboarding` + `POST /onboarding/complete`. Numerology/Colour Breakdown reveal panels stay **client-computed** from `birthdate` (see below), not fetched from `/personality/numerology` or `/personality/colour-breakdown`. |
| `/dashboard` | ✅ | Fully rewired: latest snapshot, latest recommendation, personality, `/progress` (XP/streak/garden/quests), Inner Reading list (for "Recent Readings" + "latest"), check-in list (for "checked in today"), and the real `/state-snapshots/trend` for the Progress Trend chart. **One feature dropped**: the energy/clarity/pressure/grounding delta arrows (vs. the previous entry) — there's no snapshot-*history* endpoint, only `/latest` and `/trend`, so "previous value" isn't available. Flagged, not faked. |
| `/check-in/session` | ✅ | `GET /check-ins/questions` (the demo/cached set) + `POST /check-ins`. |
| `/check-in/history` | ✅ | `GET /check-ins`. Free-plan "hidden count" messaging is now generic ("Premium unlocks full history") instead of an exact number — the backend returns an already-limited list, not a total count. List items now link to `/check-in/[id]/result` (see below). |
| `/check-in` (hub) | ✅ | **Migrated off the mock.** `GET /check-ins` backs both the weekly grid and "Recent Check-Ins"; items link to the new `/check-in/[id]/result`. Closes the gap flagged below — no longer a dead-end click from a mock-only session. |
| `/check-in/[id]/result` | ✅ (new) | New page + new backend endpoint (`GET /check-ins/{id}/results`, `gio-backend/docs/behaviour_log_0006.md` Phase 5 follow-up) returning `{session, snapshot}` — the session's answers plus its linked `InnerStateSnapshot` (the six AI narrative fields, colour, pillar values). Mirrors `/inner-reading/[id]/result`'s layout. |
| `/inner-reading/session` | ✅ | `GET /inner-readings/questions` (real AI, 8 questions — `gio-backend/docs/behaviour_log_0007.md`) + `POST /inner-readings`, including the 403 Premium-gate redirect to `/membership`. |
| `/inner-reading/history` | ✅ | `GET /inner-readings`. List cards now show real `emoji`/`title`/`category`/`subtitle` straight from the API (`InnerReadingOut`, `behaviour_log_0007.md`'s follow-up) instead of a date + narrative snippet. |
| `/inner-reading/[id]/result` | ✅ | `GET /inner-readings/{id}`. The result page's "current focus" chip is still derived client-side from the reading's own dimension scores via the existing local `buildInnerState()` — not updated in this pass; the reading now also carries a real AI `title`/`category`/`emoji` that this page doesn't yet surface (only the hub/history list cards do). |
| `/inner-reading` (hub) | ✅ | **Migrated off the mock.** `GET /inner-readings` backs "Recent Readings" (now the same emoji/title/category/subtitle card as history), `GET /progress` backs the streak count + weekly grid (derived from readings' own timestamps, same technique as the check-in hub, since `/progress` has no per-day quest history), `GET /state-snapshots/latest` backs "Suggested Reading Focus". Closes the last hub-page gap — see "Known gap" below, now empty. |
| `/core-personality` | ✅ | `GET /personality/current` + `POST /personality/recalibrate`, latest recommendation for the colour-affinity card. Numerology/Colour Breakdown tabs stay client-computed (see below). |
| `/journal` | ✅ | List, create, insights — all three endpoints. |
| `/rewards` | ✅ | List + redeem. |
| `/progress` | ✅ | `GET /progress`. Badges now come straight from the API response (already merged with earned/earned_at) instead of a local `BADGE_DEFINITIONS` + `Set` merge. |
| `/colour-psychology` | ✅ | Latest recommendation + current personality for the "why this colour" card; `/colours` isn't actually called here since the 5-colour catalog is still a frontend constant (see below) — only the *current* colour and reasoning are real. **"Your colour history" section removed** — no `GET /recommendations` list endpoint exists yet, only `/latest`. |
| `/colour-psychology/[key]` | (n/a) | Pure static content either way — just swapped the guard import for consistency. |
| `/membership` | ✅ | Get/subscribe/cancel/reactivate, all real. |
| `/profile` | ✅ | `GET`/`PATCH /me`, real logout (clears Redux), plus a **Change password** card (`PATCH /me/password`) added after this pass — see dev_log_0002. |
| `/recommendation` (the older "For You" page) | ❌ | Left on the old mock — superseded by `/colour-psychology`, not in scope for this pass. |
| `/shop/[id]` | n/a | Already an intentional stub pointing at an external, not-yet-built Gio store — not "demo," out of scope by design (see the file's own comment). |
| `/` (landing) | ✅ (routing only) | Auto-redirect now checks the **real** Redux session, not the mock — it had to change, since it used to redirect straight to `/dashboard`, which is real-only now. |

## Content kept client-side on purpose (not calling the backend)

Two categories, both flagged in `gio-backend`'s own dev log as reasons to be
cautious:

1. **Numerology + Colour Breakdown** (`NumerologySection`,
   `ColourBreakdown`, used on `/onboarding` and `/core-personality`): the
   backend's `/personality/numerology` and `/personality/colour-breakdown`
   exist, but the backend's own dev log admits they're a "best-effort"
   reimplementation, not verified to match the frontend's numbers for the
   same birthdate. Calling them would risk showing a **different life-path
   number than what the frontend just showed two screens earlier in the same
   onboarding flow.** Kept as the existing local computation instead, fed by
   `birthdate` from the real `user` object. Worth revisiting once/if the two
   implementations are reconciled.
2. **The 5-colour catalog itself** (`COLOUR_LIBRARY`, `ARCHETYPES`, product
   tag-matching copy): `GET /colours` exists and is correct, but nothing
   currently calls it — the frontend's own copy of the same 5 colours is
   already used for local derivations (`colourKeyForFocus`,
   `buildColourPersonalityInsight`) that have no backend equivalent, so
   fetching the catalog separately would mean keeping two copies in sync
   for no benefit yet.

## Known gap: the two sessions don't talk to each other — now closed

"Preview Mock Demo Data" (login page and landing page) boots the **old**
`AppStateContext` mock — a real, independent login of its own, with its own
seeded data. It was genuinely useful for previewing `/check-in` and
`/inner-reading` back when those hub pages were still on the mock, but both
hub pages' primary CTA buttons always linked to the now-real-backend-only
`/check-in/session`/`/inner-reading/session`, so a mock-only session
clicking through hit `useAuthGuard`'s "no token" check and got bounced to
`/auth/login` — a dead-end click.

**Update**: both hub pages are now migrated (`/check-in`, then
`/inner-reading` — see the table above). A mock-only ("Preview Mock Demo
Data") session visiting either hub now also bounces to `/auth/login`, same
as their session pages already did; only a real registered account sees
either hub's own data now. "Preview Mock Demo Data" still boots the old
`AppStateContext` mock (unchanged, still there for whatever still reads
it), but no page in the app reads from it anymore as far as this log
tracks — worth confirming before removing it outright, not done here.

## Bug found and fixed while building `/check-in/[id]/result`: broken snapshot schema

`InnerStateSnapshotOut` (`gio-backend/app/schemas/reflection.py`) still had
`balance: int`, `current_focus: str`, and `summary: str` — fields that
`behaviour_log_0006.md` Phase 1 (JSONB rework of the six narrative fields)
had already removed or reshaped on the model. This meant `GET
/state-snapshots/latest` — used by `/dashboard` — had been silently 500ing
since that migration; nothing had exercised that endpoint since. Fixed on
the backend (flattened `_en`/`_zh` pairs, matching this app's existing
bilingual convention, plus a `from_model()` builder since the JSONB → flat-
field mapping isn't automatic); fixed on the frontend
(`lib/snapshotDisplay.ts`, a `localized()`-style helper, wired into the two
broken `/dashboard` reads). Confirmed live: `GET /state-snapshots/latest`
now returns 200 with real content instead of 500.

## What was tested

Ran the actual app (both servers, `docker compose` backend + `next dev`
frontend) through Playwright, not just typechecked:

1. Register → real JWT issued → redirected to `/onboarding`.
2. Onboarding: consent → birthdate `1995-06-15` → "reading" transition →
   reveal screen (archetype, pillars, numerology, colour breakdown all
   rendered) → "Start my first Inner Reading" → `POST /onboarding/complete`
   fired, redirected into the real Inner Reading session flow.
3. `/dashboard` on a **brand-new** account — confirmed it doesn't crash on
   all the 404s (no snapshot/recommendation/personality-with-data yet) and
   shows the correct empty states.
4. Completed a real check-in through the full animated flow → confirmed
   `/dashboard` afterward shows real dimension values (all 50, matching the
   answers given), a real "Colour of the Day" (Gold, matching "Sustaining
   balance"), a real personality card ("The Quiet Strategist", correct icon),
   a real recommended product, and a real Progress Trend chart point.
5. `/journal`, `/rewards`, `/colour-psychology`, `/membership`,
   `/core-personality` — all loaded with real, request-backed data, screenshot-
   verified (not just "no red error box").
6. **Reloaded the page** after all of this — still logged in, still on
   `/core-personality` with real data. This is the redux-persist
   requirement specifically, confirmed working, not just wired.
7. Checked the browser console throughout: zero unexpected errors. The only
   `Failed to load resource: 404` entries are the *expected* ones (latest-
   snapshot/recommendation/personality calls on a fresh account, all caught
   in code and rendered as proper empty states).

Type-check (`tsc --noEmit`) and `eslint .` both pass clean across the whole
frontend, including the two lib files this pass depended on the hooks-lint
plugin to keep honest (`useApiResource`'s dependency-array and
setState-in-effect patterns).
