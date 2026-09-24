# dev_log_0004 — Access/refresh token flow

**Status:** Implemented and verified end-to-end against the live
`gio-backend` (Docker) + `gio-member-app` (`next dev`) pair, both the
success and failure paths, via a real expired-token repro. Companion to
`gio-backend/docs/dev_log_0004.md`.

## What changed

- `store/authSlice.ts`: `AuthState` gained `refreshToken`. New `setTokens`
  reducer for silent-refresh updates that don't touch `user`/`subscription`.
  `setCredentials` payload extended; both call sites (`pages/auth/login.tsx`,
  `pages/auth/register.tsx`) updated to pass `refresh_token` through.
- `lib/api/auth.ts`: `refreshAccessToken` — unused in practice, since
  `client.ts` calls `/auth/refresh` directly via a raw `fetch` rather than
  through this helper (see below), but kept for parity/discoverability with
  the rest of this file.
- `lib/api/client.ts` — where the actual fix lives. On any `401` from a
  call that isn't itself `/auth/login`, `/auth/register`, or
  `/auth/refresh`: reads `refreshToken` straight from the `store` singleton
  (`store/store.ts` already exports it as a plain `configureStore()`
  object, usable outside the React tree), attempts exactly one silent
  refresh (de-duped across concurrent 401s with a module-level in-flight
  promise), and on success retries the *original* request with the new
  token and returns its result — the caller never sees the interruption. On
  failure, clears credentials and redirects to `/auth/login` via
  `next/router`'s imperative `Router.push` (works outside components; chosen
  over `window.location.href` specifically because ESLint's
  `@next/next/no-location-assign-relative-destination` flags the latter for
  internal navigation).

No `pages/*.tsx` call sites needed to change beyond passing the new
`refresh_token` through at login/register — that was the point of
centralizing this in `client.ts`.

## One real bug this surfaced, caught by testing not inspection

The first version of this fix logged out and redirected correctly on an
unrecoverable auth failure, but then still `throw`-ed the original
`ApiError` afterward. Since **no page handler in this app has ever caught a
401 specially** (that was the original crash), that throw surfaced as the
exact same kind of uncaught-error overlay a moment *after* the redirect had
already fixed the session — confirmed live: registering, corrupting both
tokens client-side, and clicking "Start free trial" reproduced a
`PAGE ERROR: Invalid or expired token` even though the URL had already
changed to `/auth/login`.

Fix: `client.ts` now returns a promise that deliberately never resolves
after triggering the logout redirect, instead of rejecting. The component
that made the call is about to unmount (the page is navigating away), so
there's nothing useful left for its `.catch`/`finally` to do — and this
keeps every existing page handler exactly as-is rather than adding
auth-specific try/catch to each one.

## What was tested

Full live Playwright passes (temporary dev dependency, removed after),
`ACCESS_TOKEN_EXPIRE_MINUTES` temporarily set to `1` in `gio-backend/.env`:

1. **Success path**: registered → completed onboarding → waited ~70s past
   expiry → clicked "Start free trial" (the original repro) → no runtime
   error overlay, no uncaught page errors, the access token in
   `localStorage` (via redux-persist) visibly changed, still on
   `/membership` (not bounced), and the trial banner appeared — proving the
   *retried* request actually succeeded, not just the refresh call. 8/8
   checks passed.
2. **Failure path**: corrupted both the access and refresh tokens in
   `localStorage`, clicked "Start free trial" → no runtime error overlay,
   no uncaught page errors, cleanly redirected to `/auth/login`. 3/3 checks
   passed (this is the case that caught the bug above, on the first run).

`tsc --noEmit` and `eslint` both clean. `ACCESS_TOKEN_EXPIRE_MINUTES`
reverted to 30 afterward; `docker compose up -d app` used (not `restart`)
whenever `docker-compose.yaml`'s env mapping itself changed, matching the
lesson from `dev_log_0001.md` about `restart` not picking up new env vars.
