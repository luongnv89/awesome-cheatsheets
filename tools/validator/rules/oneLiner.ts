/**
 * One-liner rule — verify the bolded `**One-line:**` paragraph appears
 * between the top-level `#` heading and the first `##` heading.
 *
 * The contract's {@link ONE_LINER_RULE} defines:
 *  - `marker`:    `**One-line:**`
 *  - `position`:  `after-h1-before-first-h2`
 *  - `minLength`: 20 characters after the marker, so contributors can't
 *                 ship `**One-line:** yes`.
 *
 * Detection: in the parsed AST, `**One-line:**` becomes a `strong` node
 * containing the text `One-line:`. We therefore look for the FIRST paragraph
 * in the window whose first inline child is a `strong` node whose flattened
 * text equals the inner part of the marker (`One-line:`). The trailing body
 * is everything after that bold prefix.
 *
 * Two failure modes:
 *  - `one-liner-missing`   — no paragraph in the window matches.
 *  - `one-liner-too-short` — body length is below `ONE_LINER_RULE.minLength`.
 *
 * @see ../../template-contract.ts (`ONE_LINER_RULE`)
 * @see ../../../2026_05_18_awesome_ai_cheatsheets/prd.md §3 M1
 */

import { toString as mdastToString } from "mdast-util-to-string";
import type { Heading, Paragraph, Root, RootContent } from "mdast";

import { ONE_LINER_RULE } from "../../template-contract.js";
import { makeError, type ValidationError } from "../types.js";

/**
 * Slice the AST window between the first H1 and the first H2. The one-liner
 * paragraph must live inside this range.
 *
 * Returns `[]` if there is no H1.
 */
function windowAfterH1BeforeFirstH2(tree: Root): RootContent[] {
  let h1Idx = -1;
  let firstH2Idx = -1;
  for (let i = 0; i < tree.children.length; i++) {
    const node = tree.children[i];
    if (node === undefined) continue;
    if (node.type !== "heading") continue;
    const heading = node as Heading;
    if (heading.depth === 1 && h1Idx === -1) h1Idx = i;
    if (heading.depth === 2 && firstH2Idx === -1) {
      firstH2Idx = i;
      break;
    }
  }
  if (h1Idx === -1) return [];
  const start = h1Idx + 1;
  const end = firstH2Idx === -1 ? tree.children.length : firstH2Idx;
  return tree.children.slice(start, end);
}

/**
 * Strip surrounding `**` from the configured marker — what we expect to find
 * inside the leading `<strong>` node.
 */
function innerMarkerText(): string {
  const m = ONE_LINER_RULE.marker;
  return m.startsWith("**") && m.endsWith("**") ? m.slice(2, -2) : m;
}

/**
 * Run the one-liner checks.
 */
export function checkOneLiner(tree: Root): ValidationError[] {
  const errors: ValidationError[] = [];
  const slice = windowAfterH1BeforeFirstH2(tree);
  const inner = innerMarkerText();

  let found: { paragraph: Paragraph; body: string } | undefined;

  for (const node of slice) {
    if (node.type !== "paragraph") continue;
    const paragraph = node as Paragraph;
    const firstChild = paragraph.children[0];
    if (!firstChild || firstChild.type !== "strong") continue;
    const strongText = mdastToString(firstChild).trim();
    if (strongText !== inner) continue;

    // Body = the flattened text of the paragraph with the leading marker
    // stripped. We use `mdastToString` so inline code/emphasis after the
    // marker still contribute to length.
    const fullText = mdastToString(paragraph);
    const idx = fullText.indexOf(inner);
    const body =
      idx === -1 ? fullText : fullText.slice(idx + inner.length).trim();
    found = { paragraph, body };
    break;
  }

  if (!found) {
    errors.push(
      makeError(
        "one-liner-missing",
        `one-liner paragraph "${ONE_LINER_RULE.marker} ..." not found between the H1 and the first H2`,
      ),
    );
    return errors;
  }

  if (found.body.length < ONE_LINER_RULE.minLength) {
    const line = found.paragraph.position?.start.line;
    errors.push(
      makeError(
        "one-liner-too-short",
        `one-liner body must be at least ${ONE_LINER_RULE.minLength} characters; got ${found.body.length}`,
        line,
      ),
    );
  }

  return errors;
}
