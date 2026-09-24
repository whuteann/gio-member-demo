# dev_log_0003 — Subscription & entitlement overhaul

**Status:** Implemented and verified end-to-end against the live
`gio-backend` (Docker) + `gio-member-app` (`next dev`) pair, 13/13 Playwright
checks passing. Companion to `gio-backend/docs/dev_log_0003.md`.

## What changed, page by page

- **`lib/api/entitlement.ts`**: `isPremiumActive` now checks
  `trial_ends_at` first. `innerReadingGate`/`InnerReadingGate` removed
  (the backend moved from a one-free-reading gate to a weekly count cap) —
  replaced with `readingsUsedThisWeek()`, a purely advisory client-side
  count for UI messaging ("2 of 3 used this week"). The server is still the
  only authoritative check (still a 403 at the real limit); the three pages
  that used the old gate (`inner-reading/session.tsx`, `dashboard.tsx`,
  `inner-reading/history.tsx`) were all updated to use the new helper.
- **`pages/membership.tsx`**: rewritten for a single RM19.90/month plan (no
  more Monthly/Annual toggle). Adds a "Start 7-day free trial" button
  (`trialAvailable = !paidPremium && !sub.trial_ends_at`) and a trial
  countdown banner. Deliberately distinguishes `paidPremium` (`sub.plan ===
  "PREMIUM"`) from the trial-inclusive `premium` (`isPremiumActive`) — a
  trial-only user sees the trial banner + upgrade option, not a "Cancel
  subscription" button for a plan they never actually subscribed to.
- **`pages/check-in/history.tsx`**: copy updated to name the 7-day window
  explicitly. No fetch change — the backend does the date filtering now.
- **`pages/inner-reading/session.tsx`**: the "first reading free" gate
  screen replaced with a weekly-limit gate ("You've used your free Inner
  Readings this week"), driven by `readingsUsedThisWeek(recentReadings) >=
  3`. The in-session chip now reads "N of 3 this week" (free) or "Premium —
  unlimited".
- **`pages/inner-reading/[id]/result.tsx`**: new "In-Depth Reading" card
  (Work / Relationships / Personal Growth / Conflict Management) rendered
  when `reading.is_premium_content`; otherwise an `EntitlementGate` teaser.
  Since the backend gates this at read time, revisiting the *same* past
  reading after upgrading shows the full breakdown — confirmed live in
  testing, not just assumed from the backend's design.
- **`pages/colour-psychology/index.tsx`**: the "Why this colour" bullets
  now show only the brief `benefit` line for free users; premium sees the
  original 3-bullet set. New **"Your colour history"** section — the
  feature flagged as deferred in `dev_log_0001.md` pending a
  `GET /recommendations` list endpoint, now built. Free users see an
  `EntitlementGate` teaser instead (the backend's list endpoint already
  returns only 1 item for free, so there's nothing to show anyway).
- **`pages/dashboard.tsx`**, **`pages/inner-reading/history.tsx`**: updated
  to the same weekly-count model for their "repeat readings" messaging.

## What was deliberately kept simple

- The "brief vs in-depth" colour reasoning split is a **pure frontend**
  change — the reasoning bullets were already computed client-side from
  local content libraries (`FOCUS_COLOUR_REASON`, `ARCHETYPES`), not from
  the backend response. No backend content-serialization work was needed
  for that half of item 3.
- Inner Reading history is no longer capped at all (previously the same
  1-vs-3 row-count pattern as check-ins). Since free users can only ever
  create 3 readings per week, their history stays naturally small — a
  separate history cap on top of the creation cap would've been redundant.

## What was tested

Full live Playwright pass (temporary dev dependency, removed after):
registered a fresh account, onboarded, submitted readings through the
weekly cap (3 succeed, 4th shows the limit gate), confirmed membership page
shows RM19.90/mo pricing and the trial button, started the trial, confirmed
the reading gate lifted immediately with no re-login required, confirmed
the in-session chip switched to "Premium — unlimited", submitted another
reading and confirmed the result page showed the full in-depth breakdown
(not the teaser) with all 4 life areas present, and confirmed the colour
psychology page's new "Your colour history" section appeared. 13/13 checks
passed. `tsc --noEmit` and `eslint` both clean.
