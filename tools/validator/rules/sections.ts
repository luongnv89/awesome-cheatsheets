/**
 * Section structure rule — walk H2 headings, compare against
 * {@link REQUIRED_SECTIONS} in locked order via {@link SECTION_MATCH_RULE}.
 *
 * Two failure modes (each gets a distinct rule id for downstream grouping):
 *  - `section-missing`     — a required section never appears in the doc.
 *  - `section-out-of-order` — the section appears, but in the wrong slot in
 *    the H2 sequence.
 *
 * Only H2 headings participate. H3+ (`### Step 1 — ...` etc.) are subsections
 * within the locked top-level structure and are ignored here.
 *
 * Heading text extraction uses `mdast-util-to-string`, which flattens inline
 * children (emphasis, code, etc.) into a single string — safer than walking
 * `children[0].value` manually.
 *
 * @see ../../template-contract.ts (`REQUIRED_SECTIONS`, `SECTION_MATCH_RULE`)
 * @see ../../../2026_05_18_awesome_ai_cheatsheets/prd.md §3 M1
 */

import { toString as mdastToString } from "mdast-util-to-string";
import type { Heading, Root } from "mdast";

import {
  REQUIRED_SECTIONS,
  SECTION_MATCH_RULE,
} from "../../template-contract.js";
import { makeError, type ValidationError } from "../types.js";

/**
 * H2 sequence as `{ text, line }` — order matters and is preserved.
 */
interface H2 {
  text: string;
  line?: number;
}

function collectH2s(tree: Root): H2[] {
  const headings: H2[] = [];
  for (const child of tree.children) {
    if (child.type !== "heading") continue;
    const heading = child as Heading;
    if (heading.depth !== 2) continue;
    const text = mdastToString(heading).trim();
    const line = heading.position?.start.line;
    headings.push(line !== undefined ? { text, line } : { text });
  }
  return headings;
}

/**
 * Match an H2 string against a canonical section name. Allows the
 * `(qualifier)` suffix per `SECTION_MATCH_RULE`.
 */
function headingMatches(actual: string, canonical: string): boolean {
  return SECTION_MATCH_RULE.toRegExp(canonical).test(actual);
}

/**
 * Run section-structure checks.
 *
 * Algorithm — single pass through the locked list, advancing a cursor through
 * the H2 sequence:
 *  1. For each required section in order, search forward from the cursor for
 *     a matching H2.
 *  2. If found, emit no error and advance the cursor to one past the match.
 *  3. If not found beyond the cursor, search the *entire* H2 list:
 *     - found earlier than the cursor → `section-out-of-order`
 *     - not found at all              → `section-missing`
 *
 * This emits at most one error per required section and surfaces both
 * failure modes deterministically.
 */
export function checkSections(tree: Root): ValidationError[] {
  const errors: ValidationError[] = [];
  const h2s = collectH2s(tree);

  let cursor = 0;
  for (const canonical of REQUIRED_SECTIONS) {
    let foundAt = -1;
    for (let i = cursor; i < h2s.length; i++) {
      const h2 = h2s[i];
      if (h2 !== undefined && headingMatches(h2.text, canonical)) {
        foundAt = i;
        break;
      }
    }

    if (foundAt !== -1) {
      cursor = foundAt + 1;
      continue;
    }

    // Not found at or after the cursor — look backwards in the full list to
    // distinguish "missing" from "out of order".
    let earlierIdx = -1;
    for (let i = 0; i < cursor; i++) {
      const h2 = h2s[i];
      if (h2 !== undefined && headingMatches(h2.text, canonical)) {
        earlierIdx = i;
        break;
      }
    }

    if (earlierIdx !== -1) {
      const h2 = h2s[earlierIdx];
      const line = h2?.line;
      errors.push(
        makeError(
          "section-out-of-order",
          `section "${canonical}" appears out of order; required order is: ${REQUIRED_SECTIONS.join(", ")}`,
          line,
        ),
      );
    } else {
      errors.push(
        makeError(
          "section-missing",
          `required section "${canonical}" is missing`,
        ),
      );
    }
  }

  return errors;
}
