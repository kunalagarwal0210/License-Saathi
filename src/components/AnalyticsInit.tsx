"use client";

import { useEffect } from "react";
import { initAnalytics } from "@/lib/analytics";

// Mounted once in the root layout so Mixpanel is initialised (or marked
// disabled, when no token is set) before any page fires a `track()` call.
// Renders nothing — this is wiring, not UI.
export function AnalyticsInit() {
  useEffect(() => {
    initAnalytics();
  }, []);

  return null;
}
