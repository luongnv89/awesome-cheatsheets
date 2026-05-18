/**
 * Frontmatter rule — parse the YAML block and validate via Zod.
 *
 * Pulls `frontmatterSchema` from {@link ../../template-contract.ts}; no rule
 * is redefined locally (AC #2: "no inline rules").
 *
 * The Markdown AST emitted by `remark-frontmatter` produces a single `yaml`
 * node holding the unparsed YAML body (the surrounding `---` fences are
 * stripped). We parse it with the `yaml` package and feed the result to
 * `frontmatterSchema.safeParse`.
 *
 * @see ../../template-contract.ts (`frontmatterSchema`)
 * @see ../../../2026_05_18_awesome_ai_cheatsheets/prd.md §3 M1
 */

import { parse as parseYaml } from "yaml";
import type { Root, Yaml } from "mdast";

import { frontmatterSchema } from "../../template-contract.js";
import { makeError, type ValidationError } from "../types.js";

/**
 * Find the YAML frontmatter block in the AST.
 *
 * `remark-frontmatter` emits a single `yaml` node when configured for the
 * `yaml` preset. We accept either zero (caller emits `frontmatter-missing`)
 * or exactly one.
 */
function findYamlNode(tree: Root): Yaml | undefined {
  for (const child of tree.children) {
    if (child.type === "yaml") {
      return child;
    }
  }
  return undefined;
}

/**
 * Run the frontmatter checks against a parsed Markdown root.
 *
 * Three failure modes:
 *  - The file has no `---` frontmatter at all → `frontmatter-missing`.
 *  - The block exists but the YAML body fails to parse → `frontmatter-yaml-invalid`.
 *  - The parsed object fails `frontmatterSchema.safeParse` → one
 *    `frontmatter-schema` error per Zod issue.
 *
 * All errors carry a 1-based `line` when the AST exposes a `position` field.
 */
export function checkFrontmatter(tree: Root): ValidationError[] {
  const errors: ValidationError[] = [];

  const yamlNode = findYamlNode(tree);
  if (!yamlNode) {
    errors.push(
      makeError(
        "frontmatter-missing",
        "no YAML frontmatter block found; cheatsheets must start with a `---` fenced YAML block",
      ),
    );
    return errors;
  }

  const startLine = yamlNode.position?.start.line;

  let parsed: unknown;
  try {
    parsed = parseYaml(yamlNode.value);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    errors.push(
      makeError(
        "frontmatter-yaml-invalid",
        `frontmatter YAML failed to parse: ${message}`,
        startLine,
      ),
    );
    return errors;
  }

  const result = frontmatterSchema.safeParse(parsed);
  if (!result.success) {
    for (const issue of result.error.issues) {
      const pathStr = issue.path.length > 0 ? issue.path.join(".") : "<root>";
      errors.push(
        makeError(
          "frontmatter-schema",
          `frontmatter.${pathStr}: ${issue.message}`,
          startLine,
        ),
      );
    }
  }

  return errors;
}
