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
    const result = await validate(fixture("valid.md"), { links: "skip" });
    const mermaidErrors = result.errors.filter((e) => e.rule.startsWith("mermaid-"));
    expect(mermaidErrors).toEqual([]);
  });

  it("emits mermaid-fence-broken when a ```mermaid fence is unclosed", async () => {
    const result = await validate(fixture("broken-mermaid.md"), {
      links: "skip",
    });
    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => e.rule === "mermaid-fence-broken")).toBe(true);
  });

  it("emits mermaid-parse-failed when a closed fence holds an unparseable diagram", async () => {
    const result = await validate(fixture("unparseable-mermaid.md"), {
      links: "skip",
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
    const result = await validate(COMPLEX_VALID_DIAGRAM, { links: "skip" });
    const parseErrors = result.errors.filter(
      (e) => e.rule === "mermaid-parse-failed",
    );
    expect(parseErrors).toEqual([]);
  });

  it("reports every unclosed opener when several mermaid fences stay open", async () => {
    // Single-pass regression (issue #141, F-PERF-003): two openers, no closer
    // — the scan must emit one error per opener, in source order.
    const result = await validate(fixture("multi-broken-mermaid.md"), {
      links: "skip",
    });
    const broken = result.errors.filter(
      (e) => e.rule === "mermaid-fence-broken",
    );
    expect(broken).toHaveLength(2);
    expect(broken[0]?.line).toBe(56);
    expect(broken[1]?.line).toBe(60);
  });

  it("emits mermaid-engine-not-bundled for a diagram type the build trims", async () => {
    // sequenceDiagram parses fine with the full engine, but its detector id
    // (`sequence`) is outside MERMAID_RULES.bundledDiagrams — the client
    // bundle drops that engine chunk (issue #141, F-PERF-001), so the lint
    // gate must reject the diagram before it reaches a page that cannot
    // render it.
    const result = await validate(fixture("nonbundled-mermaid.md"), {
      links: "skip",
    });
    const notBundled = result.errors.filter(
      (e) => e.rule === "mermaid-engine-not-bundled",
    );
    expect(notBundled).toHaveLength(2);
    // The sequenceDiagram fence is rejected by its detector id…
    expect(notBundled[0]?.message).toContain('"sequence"');
    expect(notBundled[0]?.message).toContain("bundledDiagrams");
    // …and the flowchart that requests layout: elk via frontmatter is
    // rejected because the ELK layout loader is trimmed too.
    expect(notBundled[1]?.message).toContain('layout "elk"');
    expect(notBundled[1]?.message).toContain("bundledLayouts");
    // Both diagrams parse — no mermaid-parse-failed for these blocks.
    expect(
      result.errors.filter((e) => e.rule === "mermaid-parse-failed"),
    ).toHaveLength(0);
  });
});
