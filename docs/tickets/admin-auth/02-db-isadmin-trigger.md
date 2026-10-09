# 02: DB foundation — is_admin flag + auto-profile trigger

**What to build:** The database foundation the admin gate needs. After this, an admin
flag exists on users, and every newly signed-in person automatically gets a profile row
(so the gate always has a row to read).

**Blocked by:** None (can start immediately).

**Frontier:** F1
**UI:** no

- [ ] Migration `0004` adds `users.is_admin boolean not null default false`.
- [ ] Migration `0004` adds a `handle_new_user` trigger that inserts a `public.users`
      row for each new `auth.users` row, running as definer.
- [ ] The trigger is idempotent / upsert-safe: it reconciles with the existing
      owner-insert on the save path (an already-existing row must not error).
- [ ] Re-running the migration is a no-op (matches the 0001/0002 guard style).
- [ ] Bootstrap documented: the exact SQL to grant the first admin
      (`update users set is_admin = true where email = '<owner>'`).
- [ ] Verified: a fresh sign-in creates a `users` row; setting `is_admin` by SQL works;
      `supabase/types.ts` extended for the new column.
