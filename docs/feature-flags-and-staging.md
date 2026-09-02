# Flags, Settings & Staging — Project Reference

> Working notes for implementing environment variables, feature flags, and preview
> deployments safely. Based on Ch. 8 concepts. Keep this in `/docs` and update it
> as your project's actual flags/envs grow.

---

## 1. The Core Risk

Your local dev environment may be pointed at the **same live database** as
production. "Localhost" is not automatically safe — it depends entirely on
which `DATABASE_URL` (or equivalent) is in your local `.env`.

**Rule:** Never write test data locally without immediately cleaning it up,
unless you've confirmed you're pointed at an isolated dev/test database.

```
Your laptop  → "local"     → still points at real DB unless configured otherwise
Preview      → "staging"   → real infra, real DB, rehearsal only
Production   → "live"      → real users see this
```

---

## 2. Environment Variables

- Live **outside** the codebase — configured on the hosting platform, not
  committed to git.
- Scoped per environment: `Production`, `Preview`, `Development`.
- **Baked in at build time.** Changing a variable's value does nothing until
  you trigger a **new build**. Re-deploying an old build will not pick up
  the change.

### This project's current variables
| Name | Purpose | Environments set | Default |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL (client) | Prod / Preview / Dev | — |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key (client) | Prod / Preview / Dev | — |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only Supabase key (never `NEXT_PUBLIC_`) | Prod / Preview / Dev | — |
| `NEXT_PUBLIC_MIXPANEL_TOKEN` | Mixpanel project token | Prod / Preview / Dev | — |

**Planned feature flags** (one dedicated flag per feature — see §3):
| Name | Gates | Default while dark |
|---|---|---|
| `FEATURE_SAVE_CHECKLIST` | Phone-OTP + save checklist (ticket 10) | `false` |
| `FEATURE_ADMIN` | Admin CRUD panel (ticket 09) | `false` |
| `FEATURE_FIELD_NOTES` | Community field-notes display (ticket 08) | `false` |
| `FEATURE_REMINDERS` | Reminder email + field-note capture (14, 15) | `false` |

*(Update these tables as real flags/envs land. Add the flag to the table in the same PR that adds the code it gates.)*

---

## 3. Feature Flags

A feature flag = an environment variable used as an on/off switch, checked
in code.

```js
// Ship dark: code exists, but is invisible until the flag is flipped
if (process.env.MY_FEATURE_ENABLED !== "true") {
  return new Response("Not Found", { status: 404 });
}
```

**Key facts:**
- Flags live on the **host**, not in code, and usually not on your laptop.
- To test a flag locally for one run only (no file changes, nothing to undo):
  ```bash
  MY_FEATURE_ENABLED=true npm run dev
  ```
- Shipping "dark" (merged + deployed, flag off) separates the *risky* moment
  (deploying code) from the *public* moment (users seeing it).

**Watch out for shared secrets/flags:** if one variable gates multiple
features, flipping it can wake up more than intended. Before touching a
shared setting, list everything that reads it. Prefer one dedicated flag per
feature.

---

## 4. Staging / Preview Deployments

A preview is a temporary deployment tied to a branch/PR, running on **real
infrastructure** with the **real database** — which is exactly why it can
surface bugs local dev can't.

- Every write on a preview is a real write. Treat it like production data.
- Previews are often behind login — test in a real signed-in browser.

---

## 5. Implementation Checklist (Vercel example — adapt commands to your host)

- [ ] **Wrap the feature** in a flag check in code.
- [ ] **Deploy with the flag off.** Confirm it 404s (or is otherwise hidden) in prod.
- [ ] **Connect repo to host** (e.g., import from GitHub into Vercel) so every
      PR auto-gets a preview URL.
- [ ] **Set the flag for just that branch's preview:**
  ```bash
  vercel env add MY_FEATURE_ENABLED preview feature/my-feature --value true
  ```
- [ ] **Rehearse on the preview URL** posted on the PR.
- [ ] **Flip the flag in production** once verified:
  ```bash
  vercel env add MY_FEATURE_ENABLED production
  ```
- [ ] **Trigger a fresh build** — setting the variable alone isn't enough.
- [ ] **Prove it** with a status-code check:
  ```bash
  curl -sS -i https://your-app-url/feature-path | grep ^HTTP
  # expect 404 → 200 (or 401 if behind auth) after the flip
  ```

---

## 6. Quick Reference — The Loop

**Flip → Build → Prove.**

1. Flip the variable (on the right environment).
2. Trigger a fresh build.
3. Prove the change with a real request (curl / browser), not assumption.

---

## Notes for this project

- **Host in use:** Vercel (Next.js). Repo `kunalagarwal0210/License-Saathi` connects to Vercel so every PR gets an auto-preview URL (set up in ticket 01).
- **Database:** Supabase (Postgres). **RISK — must be resolved in ticket 02:** local dev and preview must NOT point at the production Supabase project. Use a **separate Supabase project for dev/preview** (or Supabase branching) so local/preview writes never touch real verified-spine or user data. Until that's confirmed, treat every write as production per §1.
- **Env scoping:** all secrets live in Vercel (Production / Preview / Development), never committed. A committed `.env.example` documents the required names only (no values).
- **Flags currently in use:** none yet — see the "Planned feature flags" table in §2.

### How flags fit our design-gate + branch workflow
- Work happens on feature branches; we do **not** push to `main` directly. Each PR gets a Vercel preview.
- A user-facing feature is built behind its own `FEATURE_*` flag (default off) and **ships dark**: merged and deployed with the flag off, so deploying the code (risky moment) is separated from users seeing it (public moment).
- The flag is flipped **on only for that branch's preview** to rehearse — including a real design review of the surface on the preview URL, which is the final checkpoint of the ticket's design gate.
- Flip in production only after the design is approved and the preview is verified, then trigger a fresh build and prove with a real request (§6).
