/**
 * Unit tests for the Mermaid engine trimmer (issue #141, F-PERF-001).
 *
 * `trimMermaidEngines` is the pure transform; the Vite wrapper (`mermaidTrim`)
 * only adds the `node_modules/mermaid/dist/**` filename gate, exercised by a
 * single boundary test here.
 */

import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { MERMAID_RULES } from "../../../tools/contract/mermaid.js";
import {
  keptEngineSpecifiers,
  mermaidTrim,
  trimMermaidEngines,
} from "../vite-mermaid-trim.js";

const OPTIONS = {
  keepDiagrams: MERMAID_RULES.bundledDiagrams,
  keepLayouts: MERMAID_RULES.bundledLayouts,
};

/** Minimal stand-in mirroring mermaid.core.mjs's id/loader declaration shape. */
const CORE_FIXTURE = `var id = "c4";
var loader = async () => {
  const { diagram } = await import("./chunks/mermaid.core/c4Diagram-AAAA1111.mjs");
  return { id, diagram };
};
var id2 = "flowchart-v2";
var loader2 = async () => {
  const { diagram } = await import("./chunks/mermaid.core/flowDiagram-BBBB2222.mjs");
  return { id: id2, diagram };
};
var id3 = "flowchart-elk";
var loader3 = async () => {
  const { diagram } = await import("./chunks/mermaid.core/flowDiagram-BBBB2222.mjs");
  return { id: id3, diagram };
};
var id4 = "wardley";
var loader4 = async () => {
  const { diagram } = await import("./chunks/mermaid.core/wardleyDiagram-CCCC3333.mjs");
  return { id: id4, diagram };
};
var addDiagrams = () => {};
export { addDiagrams };
`;

/** Stand-in for the layout-loader chunk (chunk-*.mjs inside mermaid.core). */
const LAYOUT_FIXTURE = `const layouts = {
  dagre: async () => (await import("./dagre-DDDD4444.mjs")).layout,
  elk: async () => (await import("./elk-EEEE5555.mjs")).layout,
  "cose-bilkent": async () => (await import("./cose-bilkent-FFFF6666.mjs")).layout,
  swimlane: async () => (await import("./swimlanes-GGGG7777.mjs")).layout,
};
export { layouts };
`;

describe("keptEngineSpecifiers", () => {
  it("resolves kept detector ids to their import specifiers", () => {
    const kept = keptEngineSpecifiers(CORE_FIXTURE, OPTIONS.keepDiagrams);
    expect(kept).toEqual(
      new Set(["./chunks/mermaid.core/flowDiagram-BBBB2222.mjs"]),
    );
  });

  it("ignores unknown detector ids", () => {
    const kept = keptEngineSpecifiers(CORE_FIXTURE, ["no-such-diagram"]);
    expect(kept.size).toBe(0);
  });
});

describe("trimMermaidEngines", () => {
  it("keeps bundled engine imports and strips unbundled detector imports", () => {
    const next = trimMermaidEngines(CORE_FIXTURE, OPTIONS);
    expect(next).not.toBeNull();
    expect(next).toContain('import("./chunks/mermaid.core/flowDiagram-BBBB2222.mjs")');
    expect(next).not.toContain('import("./chunks/mermaid.core/wardleyDiagram-CCCC3333.mjs")');
    expect(next).not.toContain('import("./chunks/mermaid.core/c4Diagram-AAAA1111.mjs")');
    // The stripped specifier is replaced by a deterministic rejection that
    // names the contract to extend.
    expect(next).toContain("bundledDiagrams");
  });

  it("keeps the pinned dagre layout and strips elk/cose-bilkent/swimlane", () => {
    const next = trimMermaidEngines(LAYOUT_FIXTURE, OPTIONS);
    expect(next).not.toBeNull();
    expect(next).toContain('import("./dagre-DDDD4444.mjs")');
    expect(next).not.toContain('import("./elk-EEEE5555.mjs")');
    expect(next).not.toContain('import("./cose-bilkent-FFFF6666.mjs")');
    expect(next).not.toContain('import("./swimlanes-GGGG7777.mjs")');
  });

  it("strips helper dynamic imports (katex, size capture) by default", () => {
    const code = `const katex = async () => (await import("katex")).default;
const capture = async () => (await import("./mermaidCaptureSizes.mjs")).run;`;
    const next = trimMermaidEngines(code, OPTIONS);
    expect(next).not.toBeNull();
    expect(next).not.toContain('import("katex")');
    expect(next).not.toContain('import("./mermaidCaptureSizes.mjs")');
  });

  it("fails safe: returns null when kept detectors resolve to nothing", () => {
    // The file lazy-loads mermaid.core diagram chunks but none of the kept
    // detector ids resolve — a future mermaid whose declaration shape no
    // longer matches must ship engines untouched rather than emit a mermaid
    // with no renderable diagram.
    const code = `const wardley = async () =>
  (await import("./chunks/mermaid.core/wardleyDiagram-AAAA.mjs")).diagram;`;
    expect(trimMermaidEngines(code, OPTIONS)).toBeNull();
  });

  it("fails safe: returns null for modules without dynamic imports", () => {
    expect(trimMermaidEngines("export const x = 1;", OPTIONS)).toBeNull();
  });

  it("trims the real mermaid.core.mjs shipped in node_modules", () => {
    // Reads the installed package directly — if a mermaid upgrade changes
    // the detector declaration shape so kept ids stop resolving, the
    // fail-safe engages and this test fails loudly instead of silently
    // shipping a broken build.
    const core = readFileSync(
      new URL("../../../node_modules/mermaid/dist/mermaid.core.mjs", import.meta.url),
      "utf8",
    );
    const kept = keptEngineSpecifiers(core, OPTIONS.keepDiagrams);
    expect(kept.size).toBeGreaterThan(0);
    const next = trimMermaidEngines(core, OPTIONS);
    expect(next).not.toBeNull();
    for (const specifier of kept) {
      expect(next).toContain(`import("${specifier}")`);
    }
    // Wardley's detector import is gone — the chunk is never traced.
    expect(next).not.toMatch(/import\("[^"]*wardleyDiagram-[^"]*"\)/);
  });
});

describe("mermaidTrim (plugin wrapper)", () => {
  it("only transforms modules inside node_modules/mermaid/dist", () => {
    const plugin = mermaidTrim(OPTIONS);
    const code = `const k = async () => (await import("katex")).default;`;
    expect(
      plugin.transform(code, "/repo/node_modules/mermaid/dist/x.mjs"),
    ).not.toBeNull();
    expect(plugin.transform(code, "/repo/src/plugins/foo.ts")).toBeNull();
    expect(
      plugin.transform(code, "/repo/node_modules/other-pkg/dist/x.mjs"),
    ).toBeNull();
    expect(
      plugin.transform(code, "/repo/node_modules/mermaid/dist/x.js"),
    ).toBeNull();
  });
});
