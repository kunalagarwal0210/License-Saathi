# 10: Phone-OTP auth + save checklist

**What to build:** Value-first authentication. Anyone sees their full result without logging in; a phone-OTP is requested only at the moment they choose to save their list — a fair trade for a real benefit. Saving persists the list as a trackable checklist.

**Blocked by:** 07 (Result list page)

**Status:** ready-for-agent

- [ ] "Save my checklist / remind me" action on the result page triggers phone-OTP (Supabase)
- [ ] Discovery remains fully usable with no login
- [ ] On save, persist a `saved_checklist` (with answers snapshot) and its `checklist_items` (pending)
- [ ] Returning users can authenticate with the same OTP flow
