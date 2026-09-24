/**
 * Security regression tests for mermaid rendering (issue #131, F-BUG-001).
 *
 * ```mermaid fences are emitted by `src/plugins/remark-mermaid.ts` as escaped
 * text inside `<div class="mermaid">`, then rendered client-side by the lazy
 * loader in `src/components/cheatsheet/MermaidLoader.astro` (included by
 * `CheatsheetLayout.astro`). The loader's `securityLevel`
 * is the XSS gate: mermaid 12's 'loose' skips DOMPurify on labels and on the
 * serialized SVG, enables `click … call` callbacks, and skips URL sanitizing —
 * so a hostile fence could land a live event handler in the DOM. 'strict'
 * sanitizes both label text and rendered SVG and disables click callbacks,
 * while still allowing `<br/>` (DOMPurify's default allowlist keeps `<br>`),
 * so diagrams like obsidian.md's keep their line breaks.
 *
 * `mermaid.render` cannot run under jsdom (no CSSStyleSheet / getBBox), so
 * these tests pin the two layers that make the built HTML inert:
 *  1. the emitted fragment carries the fence only as escaped text — no tag or
 *     attribute can form, so no handler can be live in the built HTML, and
 *  2. the only renderer config in the tree pins 'strict', never 'loose'.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";
import { unified } from "unified";
import remarkParse from "remark-parse";

import { remarkMermaid } from "../plugins/remark-mermaid.js";
import { parseMermaid } from "../../tools/validator/mermaid-engine.js";

const LOADER_PATH = fileURLToPath(
  new URL("../components/cheatsheet/MermaidLoader.astro", import.meta.url),
);
const ENGINE_PATH = fileURLToPath(
  new URL("../../tools/validator/mermaid-engine.ts", import.meta.url),
);

const WRAPPER_OPEN = '<div class="mermaid">';
const WRAPPER_CLOSE = "</div>";

interface MdastNode {
  type: string;
  value?: string;
  lang?: string | null;
  children?: MdastNode[];
}

/** Parse `markdown` and run the plugin's transformer over the resulting mdast. */
function run(markdown: string): MdastNode {
  const processor = unified().use(remarkParse).use(remarkMermaid);
  return processor.runSync(processor.parse(markdown)) as unknown as MdastNode;
}

/** Emit the html node for a mermaid fence and return the div's inner text. */
function emittedSource(diagram: string): string {
  const tree = run(`\`\`\`mermaid\n${diagram}\n\`\`\`\n`);
  const [node] = tree.children ?? [];
  expect(node?.type).toBe("html");
  const value = node?.value ?? "";
  expect(value.startsWith(WRAPPER_OPEN)).toBe(true);
  expect(value.endsWith(WRAPPER_CLOSE)).toBe(true);
  return value.slice(WRAPPER_OPEN.length, -WRAPPER_CLOSE.length);
}

describe("hostile mermaid fence → emitted HTML", () => {
  it("emits an event-handler label as inert escaped text — no live markup", () => {
    const inner = emittedSource(
      'flowchart LR\n  A["<img src=x onerror=alert(1)>"] --> B["<b onclick=alert(2)>x</b>"]',
    );
    // Every HTML-significant character is escaped, so the emitted fragment
    // contains no tag or attribute — nothing for the browser to execute.
    expect(inner).not.toMatch(/[<>"']/);
    expect(inner).not.toContain("<img");
    expect(inner).not.toContain("<script");
    // The diagram source still survives as text so mermaid reads it back via
    // textContent; 'strict' then sanitizes it at render time.
    expect(inner).toContain("onerror=alert(1)");
    expect(inner).toContain("&lt;img src=x");
  });

  it("emits a `click … call` line as inert escaped text", () => {
    const inner = emittedSource(
      'flowchart LR\n  A --> B\n  click B call alert("x")',
    );
    expect(inner).not.toMatch(/[<>"']/);
    // 'strict' additionally disables click callbacks entirely at render time.
    expect(inner).toContain("click B call alert(&quot;x&quot;)");
  });
});

describe("renderer configuration", () => {
  it("the client-side mermaid loader pins securityLevel 'strict' and never 'loose'", () => {
    const loader = readFileSync(LOADER_PATH, "utf8");
    expect(loader).not.toMatch(/securityLevel:\s*['"]loose['"]/);
    expect(loader).toMatch(/securityLevel:\s*['"]strict['"]/);
  });

  it("the headless validator engine pins the same 'strict' level as the site", () => {
    const engine = readFileSync(ENGINE_PATH, "utf8");
    expect(engine).toMatch(/securityLevel:\s*['"]strict['"]/);
    expect(engine).not.toMatch(/securityLevel:\s*['"]loose['"]/);
  });
});

describe("strict mode keeps legitimate diagrams working", () => {
  // First engine call pays the jsdom + mermaid import cost (~6s cold).
  it("still parses a flowchart with <br/> line-break labels", { timeout: 30000 }, async () => {
    const error = await parseMermaid(
      'flowchart LR\n  A["line one<br/>line two"] --> B["tags<br/>aliases"]',
    );
    expect(error).toBeNull();
  });
});
