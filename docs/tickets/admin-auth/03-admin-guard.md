# 03: Admin guard — server-enforced identity + role gate

**What to build:** The actual security fix. `/admin` and every admin data-changing
action refuse anyone who is not a signed-in admin. This is enforced on the server, in two
places, so a direct call to an action cannot bypass the page gate. Ships on the existing
email-OTP sign-in — it does not wait on Google.

**Blocked by:** 02 (needs `is_admin` + a reliably-present profile row).

**Frontier:** F2
**UI:** no (reuses the already-approved email-OTP sign-in component for the anonymous state)

- [ ] Pure `evaluateAdminAccess(authUser, profileRow)` returns
      `anonymous | forbidden | ok`; unit-tested (Vitest) covering: no auth → anonymous;
      signed-in with null row or `is_admin=false` → forbidden; `is_admin=true` → ok.
- [ ] `requireAdmin()` wrapper does the IO (session via the session-aware server client,
      look up the caller's `users` row) and calls the pure function.
- [ ] `/admin` layout: `FEATURE_ADMIN` off → 404 (unchanged); then `anonymous` → render
      sign-in; `forbidden` → 404; `ok` → render panel.
- [ ] Every admin server action (createLicense, updateLicense, deleteLicense, createRule,
      updateRule, deleteRule) calls `requireAdmin()` first and aborts on anything but `ok`.
- [ ] Gate is provider-agnostic: it checks `is_admin` only, not the login method.
- [ ] Verified on the running app: anonymous, non-admin, and admin all behave as above;
      a direct action call by a non-admin is rejected.
