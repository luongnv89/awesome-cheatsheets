/**
 * Mermaid block tests — verify the Mermaid rules (AC #4):
 *  - mermaid-fence-broken  — opening fence with no closing fence
 *  - mermaid-parse-failed  — fence is well-formed but the diagram does not
 *    parse with the real Mermaid engine (i.e. would not render)
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

// The published example carries a complex, known-good diagram (subgraphs,
// <br/> labels, [(cylinder)] shapes, dotted edges, edge labels). It is the
// guard against the parse rule false-positiving on legitimate diagrams and
// blocking every PR.
const COMPLEX_VALID_DIAGRAM = resolve(
  import.meta.dirname,
  "..",
  "..",
  "..",
  ".claude",
  "skills",
  "cheatsheet-scribe",
  "examples",
  "hermes-expected.md",
);

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

  it("emits mermaid-parse-failed when a closed fence holds an unparseable diagram", async () => {
    const result = await validate(fixture("unparseable-mermaid.md"), {
      skipLinks: true,
    });
    expect(result.ok).toBe(false);
    const parseErrors = result.errors.filter(
      (e) => e.rule === "mermaid-parse-failed",
    );
    expect(parseErrors.length).toBe(1);
    // The error must point at the offending node IN THE FILE, not at the
    // parser's diagram-relative line. In the fixture the ```mermaid fence opens
    // at line 56 and the bad `Links[[[...` node is two lines below it (line 58).
    // Pinning the exact line guards the offset math in fileLineForParseError.
    expect(parseErrors[0]?.line).toBe(58);
  });

  it("does not false-positive on a complex, valid diagram", async () => {
    const result = await validate(COMPLEX_VALID_DIAGRAM, { skipLinks: true });
    const parseErrors = result.errors.filter(
      (e) => e.rule === "mermaid-parse-failed",
    );
    expect(parseErrors).toEqual([]);
  });
});
