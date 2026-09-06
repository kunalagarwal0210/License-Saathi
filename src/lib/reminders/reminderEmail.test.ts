import { describe, expect, it } from "vitest";
import { buildReminderEmail } from "./reminderEmail";

const checklistUrl = "https://licensesaathi.example.com/checklist/abc-123";
const unsubscribeUrl = "https://licensesaathi.example.com/unsubscribe/tok-456";

describe("buildReminderEmail", () => {
  it("includes the pending count, checklist URL, and unsubscribe URL in subject, html, and text", () => {
    const email = buildReminderEmail({
      category: "eatery",
      pendingCount: 3,
      checklistUrl,
      unsubscribeUrl,
    });

    expect(email.subject).toContain("3");
    expect(email.html).toContain(checklistUrl);
    expect(email.html).toContain(unsubscribeUrl);
    expect(email.text).toContain(checklistUrl);
    expect(email.text).toContain(unsubscribeUrl);
    expect(email.text).toContain("3");
  });

  it("uses singular phrasing for exactly one pending step", () => {
    const email = buildReminderEmail({
      category: "salon",
      pendingCount: 1,
      checklistUrl,
      unsubscribeUrl,
    });

    expect(email.subject).toMatch(/1 step/i);
    expect(email.subject).not.toMatch(/1 steps/i);
    expect(email.text).toMatch(/1 step\b/i);
    expect(email.text).not.toMatch(/1 steps/i);
    expect(email.html).toMatch(/1 step\b/i);
    expect(email.html).not.toMatch(/1 steps/i);
  });

  it("uses plural phrasing for more than one pending step", () => {
    const email = buildReminderEmail({
      category: "retail",
      pendingCount: 4,
      checklistUrl,
      unsubscribeUrl,
    });

    expect(email.subject).toMatch(/4 steps/i);
    expect(email.text).toMatch(/4 steps/i);
    expect(email.html).toMatch(/4 steps/i);
  });

  it("includes an unsubscribe footer with 'Stop these reminders' wording", () => {
    const email = buildReminderEmail({
      category: "eatery",
      pendingCount: 2,
      checklistUrl,
      unsubscribeUrl,
    });

    expect(email.html).toMatch(/Stop these reminders/i);
    expect(email.text).toMatch(/Stop these reminders/i);
  });

  it("never mentions government-status-API language (progress is self-declared)", () => {
    const email = buildReminderEmail({
      category: "eatery",
      pendingCount: 2,
      checklistUrl,
      unsubscribeUrl,
    });

    const combined = `${email.subject} ${email.html} ${email.text}`.toLowerCase();
    expect(combined).not.toMatch(/status update from the government/);
    expect(combined).not.toMatch(/official status/);
  });
});
