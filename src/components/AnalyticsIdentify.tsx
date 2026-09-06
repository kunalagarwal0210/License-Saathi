"use client";

import { useEffect } from "react";
import { identifyUser } from "@/lib/analytics";

type AnalyticsIdentifyProps = {
  userId: string;
};

// Mounted on authed pages (dashboard, checklist detail) so events fired
// there — e.g. `license_marked_done` — are tied to the signed-in user's
// Mixpanel distinct_id, matching the identity set at save-checklist time.
// Renders nothing.
export function AnalyticsIdentify({ userId }: AnalyticsIdentifyProps) {
  useEffect(() => {
    identifyUser(userId);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- identify once per mount for this user id
  }, []);

  return null;
}
