# dev_log_0002 — Change password, on `/profile`

**Status:** Implemented and verified end-to-end against the live backend +
browser. Companion to `gio-backend/docs/dev_log_0002.md`.

## What was added

- `lib/api/auth.ts`: `changePassword(token, newPassword)` →
  `PATCH /me/password`.
- `pages/profile.tsx`: a new **Change password** card between "Details" and
  "Privacy" — `New password` / `Confirm new password` fields, same
  validation pattern already used on `/auth/register` (min 6 characters,
  live "Passwords don't match" inline error on the confirm field), a
  disabled-while-submitting button, and a 1.8s "Updated ✓" confirmation.

This is the authenticated "I'm logged in, let me change my password" case
— not the unauthenticated "forgot password" flow, which is still the
deliberate gap noted in `dev_log_0001.md` (that one needs real email
delivery and a reset token, which is a bigger piece of work on its own).

## What was tested

Full Playwright run against the live app: registered a fresh account,
completed onboarding, went to `/profile`, typed a mismatched confirmation
(inline error), fixed it, submitted, got "Updated ✓". Then logged out,
confirmed the **old** password is rejected (`401`, "Invalid email or
password"), and confirmed the **new** password logs in successfully and
reaches `/dashboard`. `tsc` and `eslint` both clean.
