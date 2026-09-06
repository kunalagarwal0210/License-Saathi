import { describe, expect, it } from "vitest";
import { ANALYTICS_EVENTS } from "./analytics";

// Guards the event spine against typos/rename drift — these strings are the
// funnel + North Star contract with the Mixpanel UI, so a silent rename here
// would silently break a report built against the old name.
describe("ANALYTICS_EVENTS", () => {
  it("contains exactly the 7 expected event-name strings", () => {
    expect(Object.values(ANALYTICS_EVENTS).sort()).toEqual(
      [
        "flow_started",
        "questionnaire_completed",
        "list_viewed",
        "portal_link_clicked",
        "checklist_saved",
        "license_marked_done",
        "field_note_submitted",
      ].sort()
    );
  });
});
