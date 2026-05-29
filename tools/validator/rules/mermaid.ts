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
import { parseMermaid } from "../mermaid-engine.js";

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
 * Heuristic:
 *  - For each line starting with ` ```mermaid` (allowing trailing info string),
 *    scan forward for a line that is exactly ` ``` ` (with optional trailing
 *    whitespace). Stop at EOF.
 *  - If no closing fence is found, emit `mermaid-fence-broken`.
 */
function checkRawFences(rawSource: string): ValidationError[] {
  const errors: ValidationError[] = [];
  const lines = rawSource.split(/\r?\n/);
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line === undefined) {
      i++;
      continue;
    }
    // Match an opener — must start the line (no indentation), language is
    // exactly `mermaid` optionally followed by whitespace + an info string.
    if (/^```mermaid(\s.*)?$/.test(line)) {
      const openLine = i + 1; // 1-based
      let closed = false;
      for (let j = i + 1; j < lines.length; j++) {
        const inner = lines[j];
        if (inner === undefined) continue;
        if (/^```\s*$/.test(inner)) {
          closed = true;
          i = j + 1;
          break;
        }
      }
      if (!closed) {
        errors.push(
          makeError(
            "mermaid-fence-broken",
            `\`\`\`mermaid fence opened at line ${openLine} but never closed (expected a matching \`\`\`)`,
            openLine,
          ),
        );
        // Advance past the offending opener so we don't loop forever.
        i++;
      }
    } else {
      i++;
    }
  }
  return errors;
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

    let startIdx = -1;
    for (let i = 0; i < tree.children.length; i++) {
      const node = tree.children[i];
      if (node === undefined) continue;
      if (node.type !== "heading") continue;
      const heading = node as Heading;
      if (heading.depth !== 2) continue;
      if (regex.test(mdastToString(heading).trim())) {
        startIdx = i;
        break;
      }
    }

    if (startIdx === -1) continue; // covered by `section-missing`

    let endIdx = tree.children.length;
    for (let i = startIdx + 1; i < tree.children.length; i++) {
      const node = tree.children[i];
      if (node === undefined) continue;
      if (node.type === "heading" && (node as Heading).depth === 2) {
        endIdx = i;
        break;
      }
    }

    let hasMermaid = false;
    for (let i = startIdx + 1; i < endIdx; i++) {
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
      const heading = tree.children[startIdx];
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
 * Parse pass — gated on `MERMAID_RULES.mustParse`. Each non-empty Mermaid block
 * is parsed with the real Mermaid engine; a failure means the diagram would not
 * render. Skipped entirely when no Mermaid blocks exist (no engine spin-up).
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
