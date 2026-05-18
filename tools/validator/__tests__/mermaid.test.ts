/**
 * Mermaid block tests — verify the syntactic rules (AC #4):
 *  - mermaid-missing-in-mental-model  (Mental Model section without a block)
 *  - mermaid-fence-broken             (opening fence with no closing fence)
 *
 * AC #6 calls for passing AND failing fixtures per rule.
 */
import { describe, expect, it } from "vitest";
import { resolve } from "node:path";

import { validate } from "../index.js";

const fixture = (name: string): string =>
  resolve(import.meta.dirname, "fixtures", name);

describe("mermaid rule", () => {
  it("passes on the valid fixture (mermaid block in Mental Model)", async () => {
    const result = await validate(fixture("valid.md"), { skipLinks: true });
    const mermaidErrors = result.errors.filter((e) => e.rule.startsWith("mermaid-"));
    expect(mermaidErrors).toEqual([]);
  });

  it("emits mermaid-missing-in-mental-model when no fence in Mental Model", async () => {
    const result = await validate(fixture("no-mermaid.md"), { skipLinks: true });
    expect(result.ok).toBe(false);
    expect(
      result.errors.some((e) => e.rule === "mermaid-missing-in-mental-model"),
    ).toBe(true);
  });

  it("emits mermaid-fence-broken when a ```mermaid fence is unclosed", async () => {
    const result = await validate(fixture("broken-mermaid.md"), {
      skipLinks: true,
    });
    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => e.rule === "mermaid-fence-broken")).toBe(true);
  });
});
