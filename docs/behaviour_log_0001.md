# behaviour_log_0001 — Dual-language (EN/ZH) UI support

**Status:** In progress. Phases 1-3 complete and verified; Phase 4 started
(onboarding done, check-in/Inner Reading not yet). See "Implementation
progress" at the bottom for exactly what landed, what's verified, and
what's left. First `behaviour_log` in
`gio-member-app` (mirrors `gio-backend/docs/behaviour_log_*.md`'s
phase-plan convention; this app's own `dev_log_*.md` series covers
backend-wiring history, a different concern). Outlines how to bring
English/Chinese UI-text switching into this app, using
`GioMembershipPlatform/dual-language-handover/` — a working
`react-i18next` implementation from a sibling Gio-family project
(`bracelet-website`) — as the reference for file structure and
conventions, adapted to this app's actual architecture rather than
copied wholesale.

## What the reference actually does

`dual-language-handover/README.md` + `FILE_MAP.md`, read in full:

1. Next.js's built-in Pages Router `i18n` config (`next.config.js`)
   gives locale-prefixed routes (`/zh/...`) and `router.locale`.
2. `lib/i18n.ts` statically imports one JSON file per (namespace,
   language) pair from `public/locales/{en,zh}/*.json` — 24 namespace
   pairs, one per page/feature area — and registers them with
   `i18next` + `react-i18next`. No lazy-loading, no HTTP backend
   (`i18next-http-backend`/`i18next-browser-languagedetector` are
   installed but the README explicitly notes they're unused).
3. `pages/_app.tsx` watches `router.locale`, calls
   `i18n.changeLanguage()` when it changes, and wraps the app in
   `I18nextProvider`.
4. Every component calls `useTranslation('namespace')` +
   `t('key')`. To add a namespace: two new JSON files + import/register
   both in `lib/i18n.ts`.
5. The header's language switcher calls `router.push(..., {locale})`
   (changes the URL) and, if logged in, `PATCH`es `preferred_language`
   to the backend profile — **two separate pieces of state**, which the
   README's own "Known edges" section flags as a real, live source of
   bugs in that codebase ("Some language state comes from
   `router.locale`, some from `i18n.language`, some from a saved
   profile preference. Keep those paths in sync when changing the
   switcher").
6. Backend-supplied bilingual content (product names/descriptions) is
   handled separately, by string-parsing helpers in `lib/utils.ts` — not
   `i18next` at all.

## How this adapts to gio-member-app — and why, explicitly

**Reused as-is** (this is the "same file structure language system"
part): `i18next` + `react-i18next`, one JSON file per (namespace,
language) under `public/locales/{en,zh}/`, all statically imported and
registered in one `lib/i18n.ts`, components calling
`useTranslation('namespace')` + `t('key')`. Same mechanism, same file
layout, same authoring workflow — just Gio's own namespaces instead of
the bracelet site's.

**Not reused, deliberately — Next's built-in URL-locale-routing.** The
reference's `router.locale`-driven approach makes sense for
`bracelet-website`: a public, SEO-facing storefront where
`/zh/products/...` being a real, shareable, indexable URL has value.
gio-member-app is different in a way that matters here: **every page
already sits behind `useAuthGuard`/`useAppGuard`** — there is no
public, unauthenticated content to localize URLs for. Adopting
URL-locale-routing here would mean:
- Doubling every route under a `/zh/` prefix for zero SEO benefit.
- Auditing and fixing every existing internal `<Link>`/`router.push()`
  call across ~30 pages so locale-switching doesn't silently reset to
  default on navigation (Next's own docs are explicit that this needs
  care — `router.push({pathname, query}, asPath, {locale})`, not a bare
  path).
- Reintroducing exactly the "two sources of truth" bug class the
  reference's own README names as a known problem in its codebase —
  `router.locale` **and** `user.preferred_language` **and** `i18n.language`,
  three things that can disagree.
- A `proxy.ts` (Next 16 renamed `middleware.ts` → `proxy.ts` — confirmed
  from this app's own bundled Next docs,
  `node_modules/next/dist/docs/02-pages/.../internationalization.md`)
  would be needed for the reference's locale-prefix-default-redirect
  trick, adding infrastructure with no payoff here.

**Instead**: `i18n.language` is driven by **one already-existing source
of truth** — `User.preferred_language`
(`gio-backend`'s own field, already wired end-to-end: `PATCH /me`,
`store/authSlice.ts::setUser`, and already read by
`lib/corePersonalityDisplay.ts::localized()`/`lib/snapshotDisplay.ts::localizedSnapshot()`
for backend-generated bilingual *content* — Core Personality text, Inner
State narrative fields). Before login (landing page, `/auth/*`,
onboarding-before-completion), fall back to a `localStorage`-persisted
anonymous choice, defaulting to `navigator.language`-sniffed `en`/`zh`
if unset — same spirit as the reference's own initial-language
detection, just without a URL to read it from.

**A new `useLanguage()` hook becomes the single accessor** for "what
language is the UI in right now," backing both `t()`'s namespace lookups
*and* the existing `localized()`/`localizedSnapshot()` calls — so there
is exactly one current-language concept in this app, not the reference's
three. This directly forecloses the bug class its README flags, rather
than "keeping paths in sync" by discipline.

**`<html lang>`**: this app has no `pages/_document.tsx` today (unlike
the reference, which has one with a hardcoded `lang="en"` — itself
flagged as a known bug there). Since there's no URL-based locale to read
server-side, set `document.documentElement.lang` client-side in the same
effect that calls `i18n.changeLanguage()` — good enough for an
authenticated app, avoids adding a `_document.tsx` + the SSR complexity
that would come with making it locale-aware without route-based locales.

## Objectives (mapped to what was asked)

1. **Same file-structure language system, uniquely implemented for
   this app** — `i18next`/`react-i18next`, `public/locales/{en,zh}/*.json`
   per namespace, `lib/i18n.ts`, `useTranslation()`/`t()` — Gio's own
   namespaces, Gio's own single-source-of-truth language state (above),
   not a copy of the bracelet site's routing or content.
2. **Wire the frontend to handle switching** — `useLanguage()` hook +
   provider, synced with `preferred_language` when authenticated,
   `localStorage` otherwise.
3. **One widget on the dashboard, mobile-responsive, switches the
   system language** — a small EN/中文 toggle placed on `/dashboard`
   (in addition to — not instead of — anywhere else a switcher makes
   sense later, e.g. `AppShell`'s profile menu, which is not required
   by this ask and is left for a later pass, see open questions).
4. **Convert all hardcoded UI text to translation keys, app-wide** —
   ~30 pages + ~31 components (`find pages -name '*.tsx' | wc -l`,
   `find components -name '*.tsx' | wc -l`, counted directly). Phased
   below by feature area, not attempted as one pass.

## Proposed namespaces

One per page/feature area, mirroring the reference's own granularity
(not one giant file, not one per component):

`common` (shared buttons/labels/errors + `AppShell` nav), `auth`
(login/register/forgot/reset password), `onboarding`, `dashboard`,
`checkIn`, `innerReading`, `corePersonality`, `journal`, `progress`,
`colourPsychology`, `membership`, `profile`, `rewards`, `landing`
(`pages/index.tsx`). `pages/recommendation.tsx`/`pages/shop/[id].tsx`
are checked for current relevance before translating —
`gio-member-app/docs/dev_log_0001.md` finding F6 already flags
`/recommendation` as legacy/superseded by `/colour-psychology`, still on
the old mock; translating a page that may be on its way out is wasted
work, confirmed before Phase 4 touches it.

## Phase 1 — Core infrastructure

- `npm install i18next react-i18next` (no `i18next-http-backend`/
  `i18next-browser-languagedetector` — the reference's own README notes
  these are installed but never initialized there; not carrying over
  unused dependencies).
- `lib/i18n.ts` — static-import + register pattern, exactly the
  reference's shape, `common`/`dashboard` as the first two real
  namespaces (everything else starts as an empty/placeholder namespace
  file until its phase lands, so `t()` calls added later don't need a
  second wave of registration).
- `lib/useLanguage.ts` — the single accessor described above:
  `{ language, setLanguage }`, backed by `i18n.language`, reading
  `user.preferred_language` (via Redux) when authenticated or
  `localStorage` otherwise, and exposing `setLanguage(next)` that calls
  `i18n.changeLanguage`, persists to `localStorage`, and — if
  authenticated — calls `updateMe(token, {preferred_language: next})` +
  `dispatch(setUser(...))` (the exact existing pattern from
  `pages/profile.tsx`, generalized into one hook instead of duplicated
  per call site).
- `pages/_app.tsx` — mount `I18nextProvider`, initialize language once
  on load via `useLanguage()`.
- Migrate `lib/corePersonalityDisplay.ts::localized()` and
  `lib/snapshotDisplay.ts::localizedSnapshot()`'s callers to source
  `lang` from `useLanguage()` instead of each page deriving its own
  `(x?.preferred_language as Language) ?? "en"` line — several pages
  currently do this inline (`dashboard.tsx`, `core-personality.tsx`,
  `check-in/[id]/result.tsx`, the new `inner-reading` result page);
  consolidating removes duplicated logic as a side effect, not just
  adds new logic on top of it.

## Phase 2 — Dashboard widget (the explicit ask)

- A compact language toggle component (`components/ui/LanguageSwitcher.tsx`
  or similar) — two buttons/segments, `EN` / `中文`, using
  `useLanguage()`. Responsive: verified at mobile width (~375-400px,
  this app's established responsive baseline per its existing
  mobile-tested pages) as well as desktop.
- Placed on `/dashboard` per the explicit instruction. Exact position
  (header row vs. a dedicated small card) is a layout detail decided
  during implementation, not an open architectural question.
- Switching immediately re-renders all mounted `t()` calls (React
  context re-render, standard `react-i18next` behavior) — no page
  reload, no navigation.

## Phase 3 — Shared chrome + auth

- `AppShell.tsx` (sidebar nav labels, menu items, logout) — the
  `common` namespace's biggest single consumer, touches every page
  indirectly.
- `pages/auth/login.tsx`, `register.tsx`, `forgot-password.tsx`,
  `reset-password.tsx` — the `auth` namespace. Pre-login, so exercises
  the `localStorage` fallback path from Phase 1, not the
  `preferred_language` path.
- `pages/index.tsx` (landing) — `landing` namespace, same pre-login path.

## Phase 4 — Reflection features

- `pages/onboarding.tsx` + `onboarding/results.tsx` — `onboarding`.
- Check-In: `check-in/index.tsx`, `session.tsx`, `history.tsx`,
  `[id]/result.tsx` — `checkIn`.
- Inner Reading: `inner-reading/index.tsx`, `session.tsx`,
  `history.tsx`, `[id]/result.tsx` — `innerReading`.
- These are this app's highest-traffic pages (per every prior
  `behaviour_log`/`dev_log` in this session) — prioritized right after
  the explicitly-required widget and shared chrome, ahead of
  lower-traffic pages below.

## Phase 5 — Identity, growth, and remaining pages

- `pages/core-personality.tsx` — `corePersonality`.
- `pages/journal.tsx` — `journal`.
- `pages/progress.tsx` — `progress`.
- `pages/colour-psychology/index.tsx` + `[key].tsx` — `colourPsychology`.
- `pages/membership.tsx` + `membership/payment-success.tsx` +
  `payment-failed.tsx` — `membership` (this app's newest pages,
  `gio-backend/docs/behaviour_log_0009.md` — built without translation
  in mind, straightforward first-time `t()` conversion, not a rewrite).
- `pages/profile.tsx`, `pages/rewards.tsx` — `profile`, `rewards`.
- `pages/recommendation.tsx`/`pages/shop/[id].tsx` — translated only if
  confirmed still in active use (see "Proposed namespaces" above);
  otherwise flagged as out of scope here and left to whatever resolves
  their legacy-mock status.

## Content and quality caveat

Chinese copy for every namespace will be AI-generated (by me) unless
the product supplies reviewed translations — consistent with how this
entire session has flagged AI-generated content boundaries elsewhere
(e.g. Inner Reading's AI outcome text, `gio-backend/docs/behaviour_log_0007.md`).
Static UI-chrome translation (button labels, headings, short
instructions) is lower-risk than the free-form narrative content
already shipping, but should still get a native-speaker pass before
this is presented to real Chinese-speaking users — flagged now, not
silently assumed away.

## Open questions

1. **Scope of the dashboard widget vs. a persistent switcher elsewhere**
   — the ask is specifically "one widget... on the dashboard." Should
   `AppShell` (visible on every page) *also* get a switcher eventually,
   or does reaching `/dashboard` count as "the" place to change
   language for now? Doesn't block Phase 1-2; affects whether Phase 3's
   `AppShell` work includes a switcher control or just translates
   existing nav text.
2. **`pages/recommendation.tsx`/`pages/shop/[id].tsx`'s legacy status**
   — confirm whether either is still reachable/linked from anywhere
   real before Phase 5 spends effort translating them.
3. **Validation tooling** — the reference ships a key-parity check
   script (`README.md`'s Python snippet, comparing every `en`/`zh` JSON
   pair's key sets). Worth porting as a `package.json` script run before
   each phase's namespaces are considered done, so a missing Chinese key
   fails loudly instead of silently falling back to English mid-sentence.
   Recommended, not yet confirmed as a hard requirement.
4. **`next-intl`-shaped dead code** — the reference's own `config.ts`/
   `lib/getMessages.ts` are unused next-intl scaffolding nobody removed.
   Not carrying either over; noted only so nobody mistakes their absence
   here for an oversight.

## Implementation progress

**Phase 1 (infrastructure) — done.** `i18next`/`react-i18next` installed
(no unused `-http-backend`/`-browser-languagedetector`, per plan).
`lib/i18n.ts` (static-import/register pattern), `lib/useLanguage.ts` (the
single accessor — `{language, setLanguage}`, backed by `i18n.language`,
`setLanguage` persists to `localStorage` and, when authenticated, calls
`updateMe`/`dispatch(setUser)` — the exact pattern `profile.tsx` already
used, now centralized). `pages/_app.tsx` mounts `I18nextProvider` and a
`LanguageSync` component that keeps `i18n.language` following
`user.preferred_language` whenever it's known (e.g. right after login),
falling back to `detectInitialLanguage()` (saved local choice, else
browser language) before that. `dashboard.tsx`'s own language derivation
switched to `useLanguage()` instead of its own inline
`(user?.preferred_language as Language) ?? "en"` — the planned
consolidation, not just new code added alongside the old.

**Phase 2 (dashboard widget) — done.** Reused the existing
`components/ui/LanguageSlider.tsx` (a sliding pill toggle that already
existed for onboarding/login, previously wired to nothing —
its own docstring said so) rather than building a new component — wired
to `useLanguage()`, placed as its own full-width card at the top of
`/dashboard`'s grid. Responsive by construction (the existing grid
already collapses to one column on mobile; the card itself stacks label
above slider under `sm:`).

**Phase 3 (shared chrome + auth) — done.** `AppShell.tsx` (nav tab/menu
labels, Premium/Free chip, log out, open-menu aria-label) — `common`
namespace's `nav` section. All four auth pages
(`login`/`register`/`forgot-password`/`reset-password.tsx`) — `auth`
namespace; `login.tsx`/`register.tsx`'s previously-inert `LanguageSlider`
(see its own docstring: "no live translations wired up yet") now drives
the real `useLanguage()`, so picking a language pre-login actually
changes visible UI text live, not just a value later sent to the
register API. `pages/index.tsx` (landing) — `landing` namespace.

**Phase 4 (reflection features) — partially done.** `onboarding.tsx` +
`onboarding/results.tsx` converted (`onboarding` namespace); onboarding's
own language picker also now drives `useLanguage()` live, in addition to
being sent to `calculateCorePersonality`. **Check-In and Inner Reading's
4 pages each are not yet converted** — next in line, unchanged from the
plan's ordering.

**Phase 5 — not started.** Core Personality, Journal, Progress, Colour
Psychology, Membership (+ its two new payment pages), Profile, Rewards,
and the legacy-status check on `recommendation.tsx`/`shop/[id].tsx` all
remain.

**Verified at every step, not just written**: `tsc --noEmit` and
`eslint` clean on every touched file; every touched page smoke-tested
(200, no compile/runtime errors) against the live `next dev` server;
`npm run check:i18n` (new script, `scripts/check-i18n-keys.py` — the
key-parity check from open question 3, now built rather than left
optional) passes after every namespace addition.
