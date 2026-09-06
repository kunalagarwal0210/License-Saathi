"use client";

import { useEffect } from "react";
import { track, type AnalyticsEvent } from "@/lib/analytics";

type TrackOnMountProps = {
  event: AnalyticsEvent;
  props?: Record<string, unknown>;
};

// Fires one `track()` call on mount, then renders nothing. Lets a
// server-rendered page (e.g. the results/route screen) emit a client-side
// analytics event without becoming a client component itself.
export function TrackOnMount({ event, props }: TrackOnMountProps) {
  useEffect(() => {
    track(event, props);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fire once on mount only, not on every prop identity change
  }, []);

  return null;
}
