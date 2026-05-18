/**
 * Reference section rule — verify the locked "Reference" section contains
 * at least one `<details>` block (collapsed-by-default per PRD §3 M4).
 *
 * `remark-parse` emits raw HTML as `html` nodes with `value` containing the
 * literal tag text. We scan all `html` nodes that appear between the
 * `## Reference` heading and the next H2 (or EOF) and look for an opening
 * `<details>` tag.
 *
 * @see ../../template-contract.ts (`REFERENCE_RULE`)
 * @see ../../../2026_05_18_awesome_ai_cheatsheets/prd.md §3 M4
 */

import { toString as mdastToString } from "mdast-util-to-string";
import type { Heading, Html, Root } from "mdast";

import {
  REFERENCE_RULE,
  SECTION_MATCH_RULE,
} from "../../template-contract.js";
import { makeError, type ValidationError } from "../types.js";

/**
 * Find the index of the `## Reference` H2 in the root children list. Allows
 * a `(qualifier)` suffix via `SECTION_MATCH_RULE` for consistency with
 * `sections.ts`. Returns `-1` when no such heading exists.
 */
function findReferenceHeadingIdx(tree: Root): number {
  const regex = SECTION_MATCH_RULE.toRegExp(REFERENCE_RULE.section);
  for (let i = 0; i < tree.children.length; i++) {
    const node = tree.children[i];
    if (node === undefined) continue;
    if (node.type !== "heading") continue;
    const heading = node as Heading;
    if (heading.depth !== 2) continue;
    if (regex.test(mdastToString(heading).trim())) return i;
  }
  return -1;
}

/**
 * Run the Reference-section check. If the section itself is missing,
 * `checkSections` will already have emitted a `section-missing` error — we
 * stay silent here to avoid double-reporting.
 */
export function checkReference(tree: Root): ValidationError[] {
  if (!REFERENCE_RULE.requiresDetailsBlock) return [];

  const startIdx = findReferenceHeadingIdx(tree);
  if (startIdx === -1) return []; // covered by `section-missing`

  // Slice from after the heading to the next H2 (or EOF).
  let endIdx = tree.children.length;
  for (let i = startIdx + 1; i < tree.children.length; i++) {
    const node = tree.children[i];
    if (node === undefined) continue;
    if (node.type === "heading" && (node as Heading).depth === 2) {
      endIdx = i;
      break;
    }
  }

  for (let i = startIdx + 1; i < endIdx; i++) {
    const node = tree.children[i];
    if (node === undefined) continue;
    if (node.type !== "html") continue;
    const html = node as Html;
    if (/<details[\s>]/i.test(html.value)) return [];
  }

  const heading = tree.children[startIdx];
  const line = heading?.position?.start.line;
  return [
    makeError(
      "reference-details-missing",
      `Reference section must contain a <details>...</details> block (collapsed by default)`,
      line,
    ),
  ];
}
