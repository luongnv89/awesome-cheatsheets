/**
 * Mermaid block rule — verify each ` ```mermaid ` fence is well-formed and
 * that at least one such block appears inside every section listed in
 * {@link MERMAID_RULES.requiredIn}.
 *
 * V1 strategy is syntactic only (no full Mermaid parse). The reasoning,
 * captured in the PR Decision Record:
 *
 *  - The `mermaid` npm package is a browser bundle (Cytoscape, D3, etc.) —
 *    pulling it into a Node-only validator is wasteful.
 *  - `@mermaid-js/parser` is Node-friendly but still adds ~2 MB to the dep
 *    graph for a check that catches at most a handful of broken-diagram
 *    issues. We can always upgrade later — `MERMAID_RULES.mustParse` already
 *    flags the rule name for a future, full-parse pass.
 *
 * What V1 catches:
 *  - `mermaid-fence-broken`               — opening ` ```mermaid ` with no
 *    closing ` ``` `, detected by raw-source regex (remark "heals" some
 *    broken fences in the AST, so a raw-source pass is the durable check).
 *  - `mermaid-empty`                       — fence opens and closes but the
 *    body is empty/whitespace-only.
 *  - `mermaid-missing-in-required-section` — section listed in
 *    `MERMAID_RULES.requiredIn` is present but has no Mermaid block.
 *    Currently no section requires one (`requiredIn: []`), so this is only
 *    exercised if the contract repopulates the list.
 *
 * V2 adds, gated on `MERMAID_RULES.mustParse`:
 *  - `mermaid-parse-failed`                — fence + body are well-formed but
 *    the diagram does not parse with the real Mermaid engine, i.e. it would
 *    fail to render. We parse with `mermaid` itself (already a dependency for
 *    site rendering) so "lint-clean" means "renders". See `../mermaid-engine.ts`.
 *  - `mermaid-engine-not-bundled`           — parses fine, but the detected
 *    diagram type is outside `MERMAID_RULES.bundledDiagrams`, so the trimmed
 *    client bundle (issue #141) cannot render it either.
 *
 * @see ../../template-contract.ts (`MERMAID_RULES`)
 * @see ../mermaid-engine.ts (headless parse harness)
 * @see ../../../2026_05_18_awesome_ai_cheatsheets/prd.md §3 M1, §3 M4
 */

import { toString as mdastToString } from "mdast-util-to-string";
import type { Code, Heading, Root } from "mdast";

import {
  MERMAID_RULES,
  SECTION_MATCH_RULE,
} from "../../template-contract.js";
import { makeError, type ValidationError } from "../types.js";
import { detectMermaidType, parseMermaid } from "../mermaid-engine.js";

/**
 * Collect all `code` nodes with `lang === "mermaid"` from the AST.
 */
function collectMermaidBlocks(tree: Root): Code[] {
  const blocks: Code[] = [];
  walk(tree, (node) => {
    if (node.type === "code" && (node as Code).lang === "mermaid") {
      blocks.push(node as Code);
    }
  });
  return blocks;
}

// Tiny depth-first walk — avoids pulling unist-util-visit just for one pass.
type AnyNode = { type: string; children?: AnyNode[] };
function walk(node: AnyNode, visitor: (n: AnyNode) => void): void {
  visitor(node);
  if (Array.isArray(node.children)) {
    for (const child of node.children) walk(child, visitor);
  }
}

/**
 * Raw-source pass: detect mermaid fence openers that lack a matching closing
 * fence. `remark-parse` is permissive — it will sometimes treat an unclosed
 * fence as text rather than as an unterminated code block — so we don't fully
 * rely on the AST for this signal.
 *
 * Single pass (issue #141, F-PERF-003): each line is visited exactly once.
 * A ` ```mermaid` opener pushes its line onto `pending`; the next bare
 * ` ``` ` line clears every pending opener — it terminates the enclosing
 * fence, which also rescues any earlier unclosed openers (they end up
 * inside that fence's body, exactly what the old forward scan concluded).
 * Every opener still pending at EOF never saw a closer, so each gets a
 * `mermaid-fence-broken` error in source order — the same errors the
 * previous per-opener forward scan produced, including multiple errors
 * when several openers stay unclosed.
 */
function checkRawFences(rawSource: string): ValidationError[] {
  const lines = rawSource.split(/\r?\n/);
  let pending: number[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line === undefined) continue;
    // Match an opener — must start the line (no indentation), language is
    // exactly `mermaid` optionally followed by whitespace + an info string.
    if (/^```mermaid(\s.*)?$/.test(line)) {
      pending.push(i + 1); // 1-based
    } else if (pending.length > 0 && /^```\s*$/.test(line)) {
      pending = [];
    }
  }
  return pending.map((openLine) =>
    makeError(
      "mermaid-fence-broken",
      `\`\`\`mermaid fence opened at line ${openLine} but never closed (expected a matching \`\`\`)`,
      openLine,
    ),
  );
}

/**
 * Locate the AST window of the H2 section matching `regex`: the index of the
 * section's heading and the index where the section ends (the next H2, or
 * `tree.children.length` at EOF). `null` when the section is absent.
 */
function findSectionWindow(
  tree: Root,
  regex: RegExp,
): { start: number; end: number } | null {
  let start = -1;
  for (let i = 0; i < tree.children.length; i++) {
    const node = tree.children[i];
    if (node === undefined) continue;
    if (node.type !== "heading") continue;
    const heading = node as Heading;
    if (heading.depth !== 2) continue;
    if (regex.test(mdastToString(heading).trim())) {
      start = i;
      break;
    }
  }

  if (start === -1) return null;

  let end = tree.children.length;
  for (let i = start + 1; i < tree.children.length; i++) {
    const node = tree.children[i];
    if (node === undefined) continue;
    if (node.type === "heading" && (node as Heading).depth === 2) {
      end = i;
      break;
    }
  }

  return { start, end };
}

/**
 * Check that every section in {@link MERMAID_RULES.requiredIn} contains at
 * least one Mermaid block. Sections are matched by walking H2 headings and
 * slicing the AST window until the next H2 (or EOF).
 *
 * If the required section itself is missing, `checkSections` emits the
 * `section-missing` error — we stay silent here to avoid double-reporting.
 */
function checkRequiredSectionMermaids(tree: Root): ValidationError[] {
  const errors: ValidationError[] = [];

  for (const requiredName of MERMAID_RULES.requiredIn) {
    const regex = SECTION_MATCH_RULE.toRegExp(requiredName);
    const range = findSectionWindow(tree, regex);
    if (range === null) continue; // covered by `section-missing`

    let hasMermaid = false;
    for (let i = range.start + 1; i < range.end; i++) {
      const node = tree.children[i];
      if (node === undefined) continue;
      // Only look at top-level code blocks; Mermaid fences nested in lists
      // are uncommon and would still be at top-level here. If we later need
      // nested support, swap to a recursive walk slice.
      if (node.type === "code" && (node as Code).lang === "mermaid") {
        hasMermaid = true;
        break;
      }
    }

    if (!hasMermaid) {
      const heading = tree.children[range.start];
      const line = heading?.position?.start.line;
      errors.push(
        makeError(
          "mermaid-missing-in-required-section",
          `section "${requiredName}" must contain at least one \`\`\`mermaid block`,
          line,
        ),
      );
    }
  }

  return errors;
}

/**
 * Mermaid reports parse errors as `Parse error on line N:` where N is 1-based
 * within the diagram body. Translate that to a file line by anchoring on the
 * block's opening line: the body's line 1 is the line *after* the ```mermaid
 * fence. Best-effort — falls back to the fence line if we can't extract N.
 */
function fileLineForParseError(
  block: Code,
  message: string,
): number | undefined {
  const fenceLine = block.position?.start.line;
  if (fenceLine === undefined) return undefined;
  const match = /line (\d+)/i.exec(message);
  if (match?.[1] === undefined) return fenceLine;
  const bodyLine = Number(match[1]);
  if (!Number.isFinite(bodyLine) || bodyLine < 1) return fenceLine;
  // fenceLine is the ```mermaid line; body line 1 sits one line below it.
  return fenceLine + bodyLine;
}

/**
 * Extract a `layout:` request from a diagram's config directives. Mermaid
 * accepts two forms — a `%%{init: {"layout": "elk"}}%%` directive and a
 * leading `---\nconfig:\n  layout: elk\n---` frontmatter block — and both
 * override the loader's pinned `layout: 'dagre'`. Only directive regions are
 * scanned, so a node label like `A["layout: grid"]` cannot false-positive.
 *
 * @returns the requested layout name, or `null` when no directive asks for
 *          one outside `MERMAID_RULES.bundledLayouts`.
 */
function nonBundledLayoutRequest(source: string): string | null {
  const regions: string[] = [];
  for (const m of source.matchAll(/%%\{init:([\s\S]*?)\}%%/g)) {
    if (m[1] !== undefined) regions.push(m[1]);
  }
  const frontmatter = /^---\s*\n([\s\S]*?)\n---\s*(?:\n|$)/.exec(source);
  if (frontmatter?.[1] !== undefined) regions.push(frontmatter[1]);
  for (const region of regions) {
    const m = /\blayout\s*:\s*["']?([a-zA-Z0-9_-]+)/.exec(region);
    if (
      m?.[1] !== undefined &&
      !(MERMAID_RULES.bundledLayouts as readonly string[]).includes(m[1])
    ) {
      return m[1];
    }
  }
  return null;
}

/**
 * Parse pass — gated on `MERMAID_RULES.mustParse`. Each non-empty Mermaid block
 * is parsed with the real Mermaid engine; a failure means the diagram would not
 * render. Skipped entirely when no Mermaid blocks exist (no engine spin-up).
 *
 * The same pass emits `mermaid-engine-not-bundled` when the detected diagram
 * type is outside `MERMAID_RULES.bundledDiagrams`, or when a config directive
 * requests a layout outside `MERMAID_RULES.bundledLayouts` (issue #141): the
 * client build trims every engine not in those lists, so a diagram that
 * parses fine here would still fail to render on the published site. The
 * lint error names the contract list so the fix — bundling the engine — is
 * one edit away.
 */
async function checkMermaidParses(blocks: Code[]): Promise<ValidationError[]> {
  if (!MERMAID_RULES.mustParse) return [];

  const errors: ValidationError[] = [];
  for (const block of blocks) {
    if (block.value.trim().length === 0) continue; // mermaid-empty covers this.
    const parseError = await parseMermaid(block.value);
    if (parseError !== null) {
      errors.push(
        makeError(
          "mermaid-parse-failed",
          `\`\`\`mermaid block does not parse (will not render): ${
            parseError.split("\n")[0]
          }`,
          fileLineForParseError(block, parseError),
        ),
      );
      continue;
    }

    const diagramType = await detectMermaidType(block.value);
    if (
      diagramType !== null &&
      !(MERMAID_RULES.bundledDiagrams as readonly string[]).includes(
        diagramType,
      )
    ) {
      errors.push(
        makeError(
          "mermaid-engine-not-bundled",
          `\`\`\`mermaid diagram type "${diagramType}" is not bundled by the site build (bundled: ${MERMAID_RULES.bundledDiagrams.join(", ")}) — add it to MERMAID_RULES.bundledDiagrams in tools/contract/mermaid.ts`,
          block.position?.start.line,
        ),
      );
      continue;
    }

    const layout = nonBundledLayoutRequest(block.value);
    if (layout !== null) {
      errors.push(
        makeError(
          "mermaid-engine-not-bundled",
          `\`\`\`mermaid block requests layout "${layout}", which is not bundled by the site build (bundled: ${MERMAID_RULES.bundledLayouts.join(", ")}) — add it to MERMAID_RULES.bundledLayouts in tools/contract/mermaid.ts`,
          block.position?.start.line,
        ),
      );
    }
  }
  return errors;
}

/**
 * Top-level entry point. Combines:
 *  1. Raw-source fence check (catches unclosed fences remark heals).
 *  2. AST sweep — every Mermaid `code` node with empty `value` is an error.
 *  3. Required-section check.
 *  4. Parse pass — every Mermaid block must parse with the real engine
 *     (gated on `MERMAID_RULES.mustParse`).
 */
export async function checkMermaid(
  tree: Root,
  rawSource: string,
): Promise<ValidationError[]> {
  const errors: ValidationError[] = [];

  errors.push(...checkRawFences(rawSource));

  const blocks = collectMermaidBlocks(tree);
  for (const block of blocks) {
    if (block.value.trim().length === 0) {
      const line = block.position?.start.line;
      errors.push(
        makeError(
          "mermaid-empty",
          "\`\`\`mermaid block is empty",
          line,
        ),
      );
    }
  }

  errors.push(...checkRequiredSectionMermaids(tree));
  errors.push(...(await checkMermaidParses(blocks)));

  return errors;
}
