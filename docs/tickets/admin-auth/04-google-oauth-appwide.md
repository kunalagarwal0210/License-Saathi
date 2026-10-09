# 04: Google OAuth — app-wide, beside email-OTP

**What to build:** A "Continue with Google" option on every sign-in surface, added
alongside the existing email-OTP (which stays). Signing in with Google works end to end,
and the same verified email across both methods resolves to one account.

**Blocked by:** 01 (button design), 02 (trigger + account-linking reconciliation),
03 (admin sign-in surface the button is added to).

**Frontier:** F3
**UI:** yes

- [ ] Google provider enabled in Supabase; Google Cloud OAuth client created. All
      secrets in env + the Supabase dashboard — never in the repo.
- [ ] `/auth/callback` route handler exchanges the PKCE code for a session.
- [ ] "Continue with Google" added to `SaveChecklist`, `DashboardSignIn`, and the `/admin`
      sign-in, per the T01 design; email-OTP still present on all three.
- [ ] Account linking by verified email enabled; the `handle_new_user` trigger handles an
      already-existing row (no duplicate profile).
- [ ] Redirect URL configured per environment; documented in the go-live notes.
- [ ] Verified on the running app: Google sign-in completes; an email-OTP user who then
      uses Google with the same verified email lands in one account with their saved data.
