import { describe, expect, it } from "vitest";
import { parseFieldNoteForm, type FieldNoteFormInput } from "./captureForm";

function baseInput(overrides: Partial<FieldNoteFormInput> = {}): FieldNoteFormInput {
  return {
    whatHappened: "They asked for an extra photocopy of the PAN card.",
    extraDoc: "",
    extraFee: "",
    ...overrides,
  };
}

describe("parseFieldNoteForm", () => {
  it("parses a minimal valid form (only whatHappened) into a payload", () => {
    const result = parseFieldNoteForm(baseInput());
    expect(result).toEqual({
      ok: true,
      value: {
        what_happened: "They asked for an extra photocopy of the PAN card.",
        extra_doc: null,
        extra_fee: null,
      },
    });
  });

  it("parses a fully populated valid form", () => {
    const result = parseFieldNoteForm(
      baseInput({ extraDoc: "Notarized rent agreement", extraFee: "500" })
    );
    expect(result).toEqual({
      ok: true,
      value: {
        what_happened: "They asked for an extra photocopy of the PAN card.",
        extra_doc: "Notarized rent agreement",
        extra_fee: 500,
      },
    });
  });

  // -- whatHappened --
  it("requires whatHappened", () => {
    const result = parseFieldNoteForm(baseInput({ whatHappened: "" }));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.whatHappened).toBeDefined();
    }
  });

  it("rejects whitespace-only whatHappened", () => {
    const result = parseFieldNoteForm(baseInput({ whatHappened: "   " }));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.whatHappened).toBeDefined();
    }
  });

  it("trims whatHappened", () => {
    const result = parseFieldNoteForm(baseInput({ whatHappened: "  hello there  " }));
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.what_happened).toBe("hello there");
    }
  });

  it("rejects whatHappened over 2000 chars", () => {
    const result = parseFieldNoteForm(baseInput({ whatHappened: "a".repeat(2001) }));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.whatHappened).toBeDefined();
    }
  });

  it("allows whatHappened at exactly 2000 chars", () => {
    const result = parseFieldNoteForm(baseInput({ whatHappened: "a".repeat(2000) }));
    expect(result.ok).toBe(true);
  });

  // -- extraDoc --
  it("treats an empty extraDoc as null", () => {
    const result = parseFieldNoteForm(baseInput({ extraDoc: "" }));
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.extra_doc).toBeNull();
    }
  });

  it("treats a whitespace-only extraDoc as null", () => {
    const result = parseFieldNoteForm(baseInput({ extraDoc: "   " }));
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.extra_doc).toBeNull();
    }
  });

  it("treats a missing (undefined/null) extraDoc as null", () => {
    const result = parseFieldNoteForm(baseInput({ extraDoc: undefined }));
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.extra_doc).toBeNull();
    }

    const result2 = parseFieldNoteForm(baseInput({ extraDoc: null }));
    expect(result2.ok).toBe(true);
    if (result2.ok) {
      expect(result2.value.extra_doc).toBeNull();
    }
  });

  it("trims extraDoc", () => {
    const result = parseFieldNoteForm(baseInput({ extraDoc: "  a doc  " }));
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.extra_doc).toBe("a doc");
    }
  });

  it("clamps extraDoc over 300 chars to the max length", () => {
    const result = parseFieldNoteForm(baseInput({ extraDoc: "a".repeat(301) }));
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.extra_doc).toHaveLength(300);
    }
  });

  it("allows extraDoc at exactly 300 chars", () => {
    const result = parseFieldNoteForm(baseInput({ extraDoc: "a".repeat(300) }));
    expect(result.ok).toBe(true);
  });

  // -- extraFee --
  it("treats an empty extraFee as null", () => {
    const result = parseFieldNoteForm(baseInput({ extraFee: "" }));
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.extra_fee).toBeNull();
    }
  });

  it("treats a missing (undefined/null) extraFee as null", () => {
    const result = parseFieldNoteForm(baseInput({ extraFee: undefined }));
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.extra_fee).toBeNull();
    }

    const result2 = parseFieldNoteForm(baseInput({ extraFee: null }));
    expect(result2.ok).toBe(true);
    if (result2.ok) {
      expect(result2.value.extra_fee).toBeNull();
    }
  });

  it("parses a valid non-negative integer fee", () => {
    const result = parseFieldNoteForm(baseInput({ extraFee: "500" }));
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.extra_fee).toBe(500);
    }
  });

  it("parses zero as a valid fee", () => {
    const result = parseFieldNoteForm(baseInput({ extraFee: "0" }));
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.extra_fee).toBe(0);
    }
  });

  it("rejects a negative fee", () => {
    const result = parseFieldNoteForm(baseInput({ extraFee: "-50" }));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.extraFee).toBeDefined();
    }
  });

  it("rejects a decimal fee", () => {
    const result = parseFieldNoteForm(baseInput({ extraFee: "50.5" }));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.extraFee).toBeDefined();
    }
  });

  it("rejects a non-numeric fee", () => {
    const result = parseFieldNoteForm(baseInput({ extraFee: "abc" }));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.extraFee).toBeDefined();
    }
  });

  it("trims fee input before parsing", () => {
    const result = parseFieldNoteForm(baseInput({ extraFee: "  200  " }));
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.extra_fee).toBe(200);
    }
  });

  // -- multiple errors at once --
  it("returns errors for both fields when both are invalid", () => {
    const result = parseFieldNoteForm(
      baseInput({ whatHappened: "  ", extraFee: "abc" })
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.whatHappened).toBeDefined();
      expect(result.errors.extraFee).toBeDefined();
    }
  });
});
