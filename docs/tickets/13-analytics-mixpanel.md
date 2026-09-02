# 13: Mixpanel event spine + North Star

**What to build:** Instrumentation across the funnel so real usage can be measured and the personas ranked — the thing secondary research could not do. Events are wired to the surfaces they belong to as those land.

**Blocked by:** 07 (Result list page), 12 (Checklist detail — mark-done + printable pack)

**Status:** ready-for-agent

- [ ] Mixpanel initialised
- [ ] Event spine wired: `flow_started`, `questionnaire_completed`, `list_viewed`, `portal_link_clicked`, `checklist_saved`, `license_marked_done`, `field_note_submitted`
- [ ] North Star computable: users who saved a checklist AND marked ≥1 license done
- [ ] Basic funnel/report viewable in Mixpanel
