# 01: Scaffold + Vercel deploy skeleton

**What to build:** A running Next.js application deployed live on Vercel, showing a blank/placeholder page. This is the foundation "make the change easy" prefactor — nothing user-facing yet, but every later ticket builds on a real, deployed app.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] Next.js app created and runs locally
- [ ] Project deploys to Vercel and the placeholder page is reachable at a public URL
- [ ] Repo connected to Vercel so every PR/branch auto-gets a **preview URL** (staging on real infra)
- [ ] Environment variables scoped per environment (Production / Preview / Development) on Vercel — nothing committed; a `.env.example` documents required names (Supabase/Mixpanel keys) with no values
- [ ] Feature-flag convention in place: a tiny `isEnabled('FEATURE_X')` helper reading `process.env`, plus the "ship dark" default-off pattern (see `docs/feature-flags-and-staging.md`)
- [ ] Repo committed with a clear baseline

See `docs/feature-flags-and-staging.md` for the env/flags/staging discipline every later ticket follows (flip → build → prove).
