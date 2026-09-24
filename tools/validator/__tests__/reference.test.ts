/**
 * Reference section rule tests — verify the `<details>` requirement
 * (`REFERENCE_RULE.requiresDetailsBlock`).
 */
import { describe, expect, it } from "vitest";
import { resolve } from "node:path";

import { validate } from "../index.js";

const fixture = (name: string): string =>
  resolve(import.meta.dirname, "fixtures", name);

describe("reference rule", () => {
  it("passes on the valid fixture (has <details>)", async () => {
    const result = await validate(fixture("valid.md"), { links: "skip" });
    const refErrors = result.errors.filter((e) => e.rule.startsWith("reference-"));
    expect(refErrors).toEqual([]);
  });

  it("emits reference-details-missing when <details> is absent", async () => {
    const result = await validate(fixture("no-reference-details.md"), {
      links: "skip",
    });
    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => e.rule === "reference-details-missing")).toBe(true);
  });
});
