import mixpanel from "mixpanel-browser";

/**
 * Analytics — Mixpanel event spine (ticket 13).
 *
 * Token-gated + no-op safe: reads `NEXT_PUBLIC_MIXPANEL_TOKEN`. When it's
 * unset (e.g. before the token exists, or in a test/CI environment) every
 * function here becomes a no-op instead of throwing, so this is safe to ship
 * to production ahead of the token being provisioned. In development we
 * still `console.debug` every tracked event even with no token, so the event
 * wiring itself (call sites + payload shape) is verifiable in the browser
 * console without needing a live Mixpanel project.
 *
 * Client-only: the Mixpanel browser SDK touches `window`/`localStorage`, so
 * every export here guards `typeof window !== "undefined"` and this module
 * must only be imported from client components, never server code.
 *
 * `identifyUser` matters for the North Star: pre-auth funnel events
 * (`flow_started` … `list_viewed`) fire under an anonymous Mixpanel
 * distinct_id, and `checklist_saved` / `license_marked_done` happen after
 * sign-in. Calling `mixpanel.identify(userId)` right after auth ties those
 * anonymous and authed events to the same person, which is what makes
 * "saved a checklist AND marked >=1 licence done" computable as one user's
 * journey rather than two disconnected sessions.
 */

export const ANALYTICS_EVENTS = {
  flowStarted: "flow_started",
  questionnaireCompleted: "questionnaire_completed",
  listViewed: "list_viewed",
  portalLinkClicked: "portal_link_clicked",
  checklistSaved: "checklist_saved",
  licenseMarkedDone: "license_marked_done",
  fieldNoteSubmitted: "field_note_submitted",
} as const;

export type AnalyticsEvent = (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS];

let initialized = false;
let enabled = false;

// Idempotent by design — React effects (StrictMode double-invoke in dev,
// or multiple mounts of AnalyticsInit) must not double-init the SDK.
export function initAnalytics(): void {
  if (typeof window === "undefined" || initialized) return;
  initialized = true;

  const token = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN;
  if (!token) {
    enabled = false;
    return;
  }

  try {
    mixpanel.init(token, { track_pageview: false, persistence: "localStorage" });
    enabled = true;
  } catch {
    // Never let analytics setup break the app.
    enabled = false;
  }
}

export function track(event: AnalyticsEvent, props?: Record<string, unknown>): void {
  if (typeof window === "undefined") return;

  if (process.env.NODE_ENV !== "production") {
    // Dev verifiability — logs even with no token so wiring can be checked
    // without a live Mixpanel project.
    console.debug("[analytics]", event, props);
  }

  if (!enabled) return;

  try {
    mixpanel.track(event, props);
  } catch {
    // Never let a tracking call break the surface that triggered it.
  }
}

export function identifyUser(userId: string): void {
  if (typeof window === "undefined" || !enabled) return;

  try {
    mixpanel.identify(userId);
  } catch {
    // Never let identify() break the auth/save flow it's attached to.
  }
}
