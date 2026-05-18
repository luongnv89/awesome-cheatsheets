/**
 * Section structure tests — verify locked-order enforcement (AC #3) and
 * the `SECTION_MATCH_RULE` `(qualifier)` allowance (e.g., the Hermes file
 * writes `## Expected Outcomes (after Steps 1–5)`).
 */
import { describe, expect, it } from "vitest";
import { resolve } from "node:path";

import { validate } from "../index.js";
import { SECTION_MATCH_RULE } from "../../template-contract.js";

const fixture = (name: string): string =>
  resolve(import.meta.dirname, "fixtures", name);

describe("section structure rule", () => {
  it("passes on the valid fixture", async () => {
    const result = await validate(fixture("valid.md"), { skipLinks: true });
    const sectionErrors = result.errors.filter((e) =>
      e.rule.startsWith("section-"),
    );
    expect(sectionErrors).toEqual([]);
  });

  it("passes on the Hermes PoC (including the en-dash qualifier)", async () => {
    const result = await validate(
      resolve(import.meta.dirname, "../../../cheatsheets/hermes-agent/hermes-agent.md"),
      { skipLinks: true },
    );
    const sectionErrors = result.errors.filter((e) =>
      e.rule.startsWith("section-"),
    );
    expect(sectionErrors).toEqual([]);
  });

  it("emits section-missing when a required H2 is absent", async () => {
    const result = await validate(fixture("missing-section.md"), {
      skipLinks: true,
    });
    expect(result.ok).toBe(false);
    const missing = result.errors.find((e) => e.rule === "section-missing");
    expect(missing).toBeDefined();
    expect(missing?.message).toMatch(/Best Practices/);
  });

  it("emits section-out-of-order when H2s are swapped", async () => {
    const result = await validate(fixture("out-of-order.md"), {
      skipLinks: true,
    });
    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => e.rule === "section-out-of-order")).toBe(true);
  });

  it("SECTION_MATCH_RULE accepts an en-dash parenthetical qualifier", () => {
    const re = SECTION_MATCH_RULE.toRegExp("Expected Outcomes");
    expect(re.test("Expected Outcomes")).toBe(true);
    expect(re.test("Expected Outcomes (after Steps 1–5)")).toBe(true);
    // Renaming the section still fails.
    expect(re.test("Results")).toBe(false);
  });
});
