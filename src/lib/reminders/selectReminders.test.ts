import { describe, expect, it } from "vitest";
import { selectReminders, type ReminderCandidate } from "./selectReminders";

const NOW = new Date("2026-09-06T00:00:00.000Z");
const DAY_MS = 24 * 60 * 60 * 1000;

function daysAgo(days: number): string {
  return new Date(NOW.getTime() - days * DAY_MS).toISOString();
}

function baseCandidate(overrides: Partial<ReminderCandidate> = {}): ReminderCandidate {
  return {
    checklistId: "checklist-1",
    category: "eatery",
    userId: "user-1",
    email: "owner@example.com",
    remindersOptOut: false,
    unsubscribeToken: "token-1",
    createdAt: daysAgo(4),
    lastRemindedAt: null,
    pendingCount: 2,
    ...overrides,
  };
}

describe("selectReminders", () => {
  it("selects a candidate that meets every condition (never reminded, 4 days old, pending items)", () => {
    const planned = selectReminders([baseCandidate()], NOW);
    expect(planned).toEqual([
      {
        checklistId: "checklist-1",
        userId: "user-1",
        email: "owner@example.com",
        category: "eatery",
        pendingCount: 2,
        unsubscribeToken: "token-1",
      },
    ]);
  });

  it("excludes a candidate with zero pending items", () => {
    const planned = selectReminders([baseCandidate({ pendingCount: 0 })], NOW);
    expect(planned).toEqual([]);
  });

  it("excludes a candidate with a null email", () => {
    const planned = selectReminders([baseCandidate({ email: null })], NOW);
    expect(planned).toEqual([]);
  });

  it("excludes a candidate with an empty-string email", () => {
    const planned = selectReminders([baseCandidate({ email: "" })], NOW);
    expect(planned).toEqual([]);
  });

  it("excludes a candidate who opted out of reminders", () => {
    const planned = selectReminders([baseCandidate({ remindersOptOut: true })], NOW);
    expect(planned).toEqual([]);
  });

  it("excludes a checklist younger than 3 days", () => {
    const planned = selectReminders([baseCandidate({ createdAt: daysAgo(2) })], NOW);
    expect(planned).toEqual([]);
  });

  it("includes a checklist exactly 3 days old (boundary)", () => {
    const planned = selectReminders([baseCandidate({ createdAt: daysAgo(3) })], NOW);
    expect(planned).toHaveLength(1);
  });

  it("excludes a checklist reminded less than 7 days ago", () => {
    const planned = selectReminders(
      [baseCandidate({ createdAt: daysAgo(10), lastRemindedAt: daysAgo(5) })],
      NOW
    );
    expect(planned).toEqual([]);
  });

  it("includes a checklist reminded exactly 7 days ago (boundary)", () => {
    const planned = selectReminders(
      [baseCandidate({ createdAt: daysAgo(10), lastRemindedAt: daysAgo(7) })],
      NOW
    );
    expect(planned).toHaveLength(1);
  });

  it("includes a checklist reminded more than 7 days ago", () => {
    const planned = selectReminders(
      [baseCandidate({ createdAt: daysAgo(10), lastRemindedAt: daysAgo(8) })],
      NOW
    );
    expect(planned).toHaveLength(1);
  });

  it("includes a checklist that was never reminded, regardless of age beyond 3 days", () => {
    const planned = selectReminders([baseCandidate({ createdAt: daysAgo(30), lastRemindedAt: null })], NOW);
    expect(planned).toHaveLength(1);
  });

  it("processes multiple candidates independently, keeping only the eligible ones", () => {
    const eligible = baseCandidate({ checklistId: "eligible" });
    const optedOut = baseCandidate({ checklistId: "opted-out", remindersOptOut: true });
    const tooYoung = baseCandidate({ checklistId: "too-young", createdAt: daysAgo(1) });

    const planned = selectReminders([eligible, optedOut, tooYoung], NOW);
    expect(planned.map((p) => p.checklistId)).toEqual(["eligible"]);
  });
});
