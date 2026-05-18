/**
 * Aggregate `validate()` test — the canonical happy-path assertion: the
 * Hermes PoC cheatsheet returns `{ ok: true, errors: [] }` with `skipLinks`.
 *
 * This is the contractual "do not regress me" guarantee — Task 1.4 (the next
 * iteration's issue) will pin this assertion to CI.
 */
import { describe, expect, it } from "vitest";
import { resolve } from "node:path";

import { validate } from "../index.js";

describe("validate() aggregate", () => {
  it("returns ok=true for the Hermes PoC with skipLinks", async () => {
    const result = await validate(
      resolve(import.meta.dirname, "../../../cheatsheets/hermes-agent/hermes-agent.md"),
      { skipLinks: true },
    );
    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it("returns ok=true for the minimal valid fixture with skipLinks", async () => {
    const result = await validate(
      resolve(import.meta.dirname, "fixtures", "valid.md"),
      { skipLinks: true },
    );
    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it("returns file-read error for a missing file", async () => {
    const result = await validate(
      resolve(import.meta.dirname, "fixtures", "does-not-exist.md"),
      { skipLinks: true },
    );
    expect(result.ok).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]?.rule).toBe("file-read");
  });
});
