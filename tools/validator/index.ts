/**
 * Cheatsheet validator entry point.
 *
 * Public API:
 *
 *  ```ts
 *  import { validate } from "tools/validator";
 *  const result = await validate("src/content/cheatsheets/hermes-agent/hermes-agent.md");
 *  if (!result.ok) {
 *    for (const e of result.errors) console.error(`${e.rule}: ${e.message}`);
 *  }
 *  ```
 *
 * Implementation contract (matches issue #2 acceptance criteria):
 *  - AC #1: returns `{ ok, errors: { rule, message, line? }[] }`.
 *  - AC #2: frontmatter rules come from `frontmatterSchema` in
 *    `template-contract.ts` — no inline rules anywhere in this package.
 *  - AC #3: AST walk verifies required sections in locked order.
 *  - AC #4: Mermaid fences are syntactically checked (raw + AST).
 *  - AC #5: external link probe with configurable timeout (default 5_000 ms).
 *  - AC #6: unit tests in `__tests__/` cover each rule with passing and
 *    failing fixtures.
 *
 * The orchestrator deliberately does NOT short-circuit on the first failing
 * rule. Authors get a complete report on every run.
 *
 * @see ../template-contract.ts (single source of truth for every rule)
 * @see ./rules/* (per-rule implementations)
 */

import { readFile } from "node:fs/promises";

import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkFrontmatter from "remark-frontmatter";
import type { Root } from "mdast";

import { checkFrontmatter } from "./rules/frontmatter.js";
import { checkSections } from "./rules/sections.js";
import { checkOneLiner } from "./rules/oneLiner.js";
import { checkReference } from "./rules/reference.js";
import { checkMermaid } from "./rules/mermaid.js";
import { checkLinks } from "./rules/links.js";
import {
  makeError,
  type ValidateOptions,
  type ValidationError,
  type ValidationResult,
} from "./types.js";

export type {
  ValidateOptions,
  ValidationError,
  ValidationResult,
} from "./types.js";
export { RULE_IDS, type RuleId } from "./rules.js";

/**
 * Build the unified processor once and reuse it across calls. Keeping a
 * single processor instance is the documented unified pattern (the parse is
 * stateless per-run).
 */
const processor = unified().use(remarkParse).use(remarkFrontmatter, ["yaml"]);

function parseMarkdown(source: string): Root {
  // `parse` returns a Node; remark-parse always emits a Root for top-level
  // input. The cast is safe in this code path.
  return processor.parse(source) as Root;
}

/**
 * Validate a single cheatsheet file.
 *
 * @param file    Path to the cheatsheet `.md` file (absolute or
 *                cwd-relative).
 * @param options Optional behaviour overrides:
 *                - `linkTimeoutMs`: external link timeout in ms (default 5_000).
 *                - `skipLinks`:     skip the network check entirely
 *                                   (also disabled via env
 *                                   `CHEATSHEET_LINT_SKIP_LINKS=1`).
 */
export async function validate(
  file: string,
  options: ValidateOptions = {},
): Promise<ValidationResult> {
  const errors: ValidationError[] = [];

  let source: string;
  try {
    source = await readFile(file, "utf8");
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      ok: false,
      errors: [makeError("file-read", `failed to read ${file}: ${message}`)],
    };
  }

  let tree: Root;
  try {
    tree = parseMarkdown(source);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      ok: false,
      errors: [
        makeError("markdown-parse", `failed to parse Markdown: ${message}`),
      ],
    };
  }

  // Synchronous rules first — order is alphabetical-ish but irrelevant to
  // correctness; we never short-circuit.
  errors.push(...checkFrontmatter(tree));
  errors.push(...checkOneLiner(tree));
  errors.push(...checkSections(tree));
  errors.push(...checkReference(tree));
  errors.push(...checkMermaid(tree, source));

  // I/O-bound rule last.
  errors.push(...(await checkLinks(tree, options)));

  return { ok: errors.length === 0, errors };
}
