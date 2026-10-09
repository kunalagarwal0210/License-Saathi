# Spec — Admin authentication hardening

Status: draft (awaiting owner OK) · Author: orchestrator · Date: 2026-10-08
Derived from: grilling session (this build), Holocron open-question #1 (admin access).

## Problem Statement

As the site owner, I need the `/admin` panel to be reachable only by people I have
authorised. Today the panel is protected by one thing: the `FEATURE_ADMIN` feature
flag. When that flag is on, anyone who can reach the routes can read and change the
verified licence data. Worse, the admin write actions run through the service-role
database client, which bypasses all row-level security, and none of those actions
checks who is calling. The feature flag gates the *pages*, but the server actions are
independently callable endpoints, so the flag does not actually protect the data.

## Solution

Add a real identity-and-authorisation gate to `/admin`, enforced on the server.

- A visitor must sign in. Signing in is possible with the existing email one-time-code
  flow **or** with Google (new, added across the whole app).
- After sign-in, access is granted only if the signed-in user is marked as an admin in
  the database (`users.is_admin = true`).
- The check runs in two places that both matter: the `/admin` layout (so the pages are
  protected) **and** at the top of every admin server action (so the data-changing
  endpoints are protected directly, not only via the pages).
- The `FEATURE_ADMIN` flag stays as a second, independent gate: admin is invisible
  until the flag is on **and** the caller is an admin.

## User Stories

1. As the owner, I want `/admin` to refuse anyone who is not signed in, so that the
   licence data is never editable anonymously.
2. As the owner, I want a signed-in user who is not an admin to get a 404 at `/admin`,
   so that the existence of the admin area is not advertised.
3. As an anonymous visitor to `/admin`, I want to see a sign-in prompt, so that a real
   admin has a way in.
4. As an admin, I want to sign in with Google, so that I use a strong existing identity
   rather than managing another password.
5. As an existing email-OTP user, I want to keep signing in with my email code, so that
   nothing I already rely on breaks.
6. As a public user, I want a "Continue with Google" option on the save and dashboard
   sign-in surfaces, so that I can use Google if I prefer it.
7. As a user who first signed in by email and later with Google using the same verified
   email, I want to land in one account, so that I still see my saved checklists.
8. As the owner, I want every admin write action (create/update/delete licence,
   create/update/delete rule) to independently verify I am an admin, so that a direct
   call to an action cannot bypass the page gate.
9. As the owner, I want admin status stored in the database, so that it survives
   redeploys and does not depend on an environment variable.
10. As the owner, I want to grant the first admin with a single SQL statement after they
    sign in, so that bootstrapping does not require building an admin-management screen.
11. As any signed-in user, I want a profile row to exist automatically, so that the
    admin check and future features have a reliable row to read.
12. As the owner, I want admin access to depend only on the `is_admin` flag, not on which
    login method was used, so that a legitimately-flagged admin is never locked out.
13. As the owner, I want admin to stay completely hidden (404) whenever `FEATURE_ADMIN`
    is off, exactly as today, so that the flag remains a kill switch.

## Implementation Decisions

**Identity store**
- Add `users.is_admin boolean not null default false` (migration `0004`). No role enum
  for now; a `role` model is the clean upgrade if a second privileged role (field-note
  moderator) is ever built — out of scope here.
- `public.users.id` already equals the Supabase auth uid (existing owner RLS uses
  `id = auth.uid()`), so the admin check is a lookup of the caller's own row.

**Profile-row creation (trigger)**
- Add a `handle_new_user` trigger (migration `0004`) that inserts a `public.users` row
  for every new `auth.users` row on sign-up (standard Supabase pattern, runs as definer).
  This replaces the current lazy "create on first save" behaviour as the primary path.
- The trigger must be idempotent / upsert-safe so it reconciles with the existing
  owner-insert on the save path (an already-existing row must not cause an error).
- Account linking: enable Supabase "link identities by verified email" so the same
  verified email across email-OTP and Google resolves to one auth user (one profile
  row). Only ever link on a *verified* provider email.

**Authorisation (app-layer, two enforcement points)**
- New module `src/lib/auth/` with a pure `evaluateAdminAccess(authUser, profileRow)`
  returning `{ status: "anonymous" | "forbidden" | "ok" }`, and a thin `requireAdmin()`
  wrapper that performs the IO (read session via the session-aware server client, look
  up the caller's `users` row) and calls the pure function.
- `src/app/admin/layout.tsx`: keep the `FEATURE_ADMIN` → `notFound()` gate, then call
  `requireAdmin()`. `anonymous` → render an embedded sign-in; `forbidden` → `notFound()`;
  `ok` → render the panel.
- `src/app/admin/actions.ts`: every action (`createLicense`, `updateLicense`,
  `deleteLicense`, `createRule`, `updateRule`, `deleteRule`) calls `requireAdmin()` first
  and aborts (`notFound()` / throw) on anything but `ok`. Writes still use the
  service-role client *after* the guard passes (enforcement is app-layer by decision; the
  DB client is unchanged).

**Google OAuth (app-wide)**
- Enable the Google provider in Supabase; add a Google OAuth client in Google Cloud.
  Config/secrets live in env + the Supabase dashboard, never in the repo or Holocron.
- Add an OAuth callback route handler (`/auth/callback`) to exchange the PKCE code for a
  session (email-OTP needs none; Google does).
- Add a "Continue with Google" control to the sign-in surfaces: `SaveChecklist`,
  `DashboardSignIn`, and the new `/admin` sign-in. Email-OTP remains on all of them.

**Admin granting**
- First admin granted by SQL: `update users set is_admin = true where email = '<owner>'`
  after their first sign-in. No admin-management UI (out of scope).

## Testing Decisions

- A good test here checks external behaviour, not implementation detail: given a
  caller's auth state and profile row, does the gate decide anonymous / forbidden / ok?
- **Unit-test `evaluateAdminAccess`** (Vitest), the single pure seam: null authUser →
  `anonymous`; signed-in but `profileRow` null or `is_admin=false` → `forbidden`;
  signed-in with `is_admin=true` → `ok`. This is the whole authorisation decision.
- Prior art: the repo's existing pure-logic unit tests — `engine/resolveLicenses`,
  `admin/licenseForm`, `admin/ruleForm`, `reminders/selectReminders`. Same shape: pure
  module + table of cases.
- `requireAdmin()` (the IO wrapper), the layout, the actions, the Google button, and the
  callback route are **not** unit-tested — consistent with the repo (no React Testing
  Library; server/DB paths verified by running the app). They will be checked by the
  orchestrator running the app and by code review.

## Out of Scope

- An admin-management UI (list users, promote/demote, audit log).
- A `role` enum / any second privileged role (field-note moderator stays schema-ready).
- Retiring email-OTP. It stays; Google is additive.
- Adding Google to the public flow as the *only* method, or any redesign of the existing
  save/dashboard sign-in beyond adding the Google button.
- Rate-limiting, audit logging of admin actions, and session-timeout policy (note for a
  future hardening ticket).

## Further Notes

- Blast radius: the Google-provider + trigger + account-linking work touches the shared
  auth path used by tickets 10–12 (save, dashboard). The admin guard itself is isolated.
  Recommend the design/ticket split keep the auth-infra change separable from the
  admin-guard change so each can be reviewed and shipped on its own.
- Env/setup that is *not code* (do before go-live): run migration `0004`; create the
  Google Cloud OAuth client; enable Google + account-linking in Supabase; set the
  OAuth redirect URL per environment; SQL-bootstrap the first admin.
- Keep `FEATURE_ADMIN` default OFF in production until the admin and its auth are
  verified end to end.
