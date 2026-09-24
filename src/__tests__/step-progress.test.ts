/**
 * Tests for `src/components/cheatsheet/step-progress.ts` — the guarded
 * localStorage progress read behind `StepChecklist.astro` (issue #139 /
 * F-BUG-005).
 *
 * The stored payload is user-writable, so `JSON.parse` output can't be
 * trusted to be the `Record<string, boolean>` the script persists. A
 * non-object payload (`42`, `"x"`, `null`, `[1]`) used to flow through the
 * `?? {}` fallback and then crash the strict-mode `state[stepKey] = …`
 * write on checkbox change.
 */
import { describe, expect, it } from "vitest";

import { loadProgress, parseProgress } from "../components/cheatsheet/step-progress.js";

describe("parseProgress", () => {
  it("returns {} for missing input", () => {
    expect(parseProgress(null)).toEqual({});
    expect(parseProgress("")).toEqual({});
  });

  it("returns {} for malformed JSON", () => {
    expect(parseProgress("{not json")).toEqual({});
    expect(parseProgress("undefined")).toEqual({});
  });

  it.each(["null", "42", '"a string"', "true", "[1, 2]", "[]"])(
    "rejects non-object payload %s",
    (raw) => {
      expect(parseProgress(raw)).toEqual({});
    },
  );

  it("returns the parsed object for a valid payload", () => {
    expect(parseProgress('{"step-1": true, "step-2": false}')).toEqual({
      "step-1": true,
      "step-2": false,
    });
  });

  it("returns a usable object even with non-boolean values inside", () => {
    // Reads are `state[key] === true`, so stray values are simply "not done"
    // — the guard only needs to guarantee an object shape.
    const state = parseProgress('{"step-1": "yes"}');
    expect(state["step-1"]).toBe("yes");
  });
});

describe("loadProgress", () => {
  it("reads and parses the stored payload", () => {
    const storage = { getItem: (_key: string) => '{"step-2": true}' };
    expect(loadProgress(storage, "k")).toEqual({ "step-2": true });
  });

  it("returns {} when storage.getItem throws (disabled storage)", () => {
    const storage = {
      getItem: (_key: string): string | null => {
        throw new Error("SecurityError: access denied");
      },
    };
    expect(loadProgress(storage, "k")).toEqual({});
  });

  it("returns {} when the stored payload is a non-object", () => {
    const storage = { getItem: (_key: string) => "42" };
    expect(loadProgress(storage, "k")).toEqual({});
  });
});
