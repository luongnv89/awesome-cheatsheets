/**
 * Mermaid block tests — verify the syntactic rules (AC #4):
 *  - mermaid-fence-broken — opening fence with no closing fence
 *
 * No section currently mandates a Mermaid block, so the required-section
 * check (`mermaid-missing-in-required-section`) has no failing fixture; it
 * is exercised the day `MERMAID_RULES.requiredIn` is repopulated.
 */
import { describe, expect, it } from "vitest";
import { resolve } from "node:path";

import { validate } from "../index.js";

const fixture = (name: string): string =>
  resolve(import.meta.dirname, "fixtures", name);

describe("mermaid rule", () => {
  it("passes on the valid fixture with no Mermaid blocks", async () => {
    const result = await validate(fixture("valid.md"), { skipLinks: true });
    const mermaidErrors = result.errors.filter((e) => e.rule.startsWith("mermaid-"));
    expect(mermaidErrors).toEqual([]);
  });

  it("emits mermaid-fence-broken when a ```mermaid fence is unclosed", async () => {
    const result = await validate(fixture("broken-mermaid.md"), {
      skipLinks: true,
    });
    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => e.rule === "mermaid-fence-broken")).toBe(true);
  });
});
