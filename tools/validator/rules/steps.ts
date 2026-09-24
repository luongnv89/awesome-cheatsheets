/**
 * Step-structure rules — the OPTIONAL structured layer inside
 * `## Step-by-Step Setup & Optimization` (see `tools/contract/steps.ts`).
 *
 * Four rule ids, all emitting at most one error per offending node so the
 * report stays actionable:
 *
 *  - `step-sequence`             — `### Step N —` H3s inside the setup
 *    section must be numbered 1..N contiguously. Only runs when at least
 *    one step heading exists; a section with zero steps is legal.
 *  - `step-meta-invalid`         — the meta paragraph directly after a step
 *    heading (`**Goal:** … · **Time:** … · **Level:** …`) may only use a
 *    Level from `STEP_RULES.allowedLevels` and a Time matching
 *    `STEP_RULES.timeRegex`. Missing meta or missing segments pass — the
 *    blocks are optional, only malformed values fail.
 *  - `prerequisites-out-of-order` — a `## Prerequisites` H2, when present,
 *    must precede `## Installation` in the H2 sequence.
 *  - `verify-empty`              — a `**Verify:**` paragraph with fewer
 *    than `STEP_RULES.verifyMinLength` characters after the marker.
 *
 * @see ../../contract/steps.ts (`STEP_RULES`)
 * @see ./sections.ts (H2 collection + SECTION_MATCH_RULE conventions)
 */

import { toString as mdastToString } from "mdast-util-to-string";
import type { Heading, Paragraph, PhrasingContent, Root } from "mdast";

import {
  SECTION_MATCH_RULE,
  STEP_RULES,
} from "../../template-contract.js";
import { makeError, type ValidationError } from "../types.js";

const { headingRegex, setupSection, allowedLevels, timeRegex } = STEP_RULES;

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

/** True when the node is a `**Goal:**`/`**Time:**`/`**Level:**` strong run. */
function metaLabelOf(node: PhrasingContent | undefined): string | null {
  if (node?.type !== "strong") return null;
  const label = mdastToString(node).trim();
  const match = label.match(/^(goal|time|level)\s*:$/i);
  return match ? match[1]!.toLowerCase() : null;
}

/**
 * Split a meta paragraph's inline children into labelled segments on the
 * ` · ` separators. Returns `null` when the paragraph isn't a meta line
 * (its first child must be a labelled strong run).
 */
function splitMetaSegments(
  paragraph: Paragraph,
): { key: string; text: string; children: PhrasingContent[] }[] | null {
  if (metaLabelOf(paragraph.children[0]) === null) return null;
  const segments: { key: string; text: string; children: PhrasingContent[] }[] = [];
  let current: PhrasingContent[] | null = null;
  for (const child of paragraph.children) {
    const label = metaLabelOf(child);
    if (label !== null) {
      current = [child];
      segments.push({ key: label, text: "", children: current });
      continue;
    }
    // Separator text nodes between segments (" · ") are dropped entirely.
    if (current === null) continue;
    if (child.type === "text" && child.value.trim() === "·") continue;
    current.push(child);
  }
  for (const seg of segments) {
    // The separator is usually glued to the preceding text node
    // (" 2 hours · "), so strip a trailing "·" before measuring.
    seg.text = mdastToString({ type: "paragraph", children: seg.children })
      .replace(/^\s*(goal|time|level)\s*:\s*/i, "")
      .replace(/·\s*$/, "")
      .trim();
  }
  return segments;
}

export function checkSteps(tree: Root): ValidationError[] {
  const errors: ValidationError[] = [];

  // ----- prerequisites-out-of-order --------------------------------------
  const h2s = collectH2s(tree);
  const prereq = h2s.findIndex((h) =>
    /^prerequisites\b/i.test(h.text),
  );
  if (prereq !== -1) {
    const install = h2s.findIndex((h) =>
      SECTION_MATCH_RULE.toRegExp(STEP_RULES.prerequisitesBeforeSection).test(
        h.text,
      ),
    );
    if (install === -1 || prereq > install) {
      errors.push(
        makeError(
          "prerequisites-out-of-order",
          `"## ${STEP_RULES.prerequisitesSection}" must appear before "## ${STEP_RULES.prerequisitesBeforeSection}"`,
          h2s[prereq]?.line,
        ),
      );
    }
  }

  // ----- step headings inside the setup section --------------------------
  const children = tree.children;
  let inSetup = false;
  const steps: { num: number; line?: number; nodeIndex: number }[] = [];

  children.forEach((child, index) => {
    if (child.type === "heading") {
      const heading = child as Heading;
      const text = mdastToString(heading).trim();
      if (heading.depth === 2) {
        inSetup = SECTION_MATCH_RULE.toRegExp(setupSection).test(text);
        return;
      }
      if (inSetup && heading.depth === 3) {
        const match = text.match(headingRegex);
        if (match) {
          const entry: { num: number; line?: number; nodeIndex: number } = {
            num: Number(match[1]),
            nodeIndex: index,
          };
          const line = heading.position?.start.line;
          if (line !== undefined) entry.line = line;
          steps.push(entry);
        }
      }
    }
  });

  // step-sequence — only when at least one step heading exists.
  if (steps.length > 0) {
    steps.forEach((step, i) => {
      const expected = i + 1;
      if (step.num !== expected) {
        errors.push(
          makeError(
            "step-sequence",
            `step headings under "${setupSection}" must be numbered 1..N contiguously; expected "Step ${expected}" but found "Step ${step.num}"`,
            step.line,
          ),
        );
      }
    });
  }

  // step-meta-invalid — the FIRST paragraph directly after each step
  // heading is the meta slot; when it is a meta line its values must parse.
  for (const step of steps) {
    const next = children[step.nodeIndex + 1];
    if (next?.type !== "paragraph") continue;
    const paragraph = next as Paragraph;
    const segments = splitMetaSegments(paragraph);
    if (segments === null) continue;
    for (const seg of segments) {
      if (seg.key === "level" && seg.text.length > 0) {
        if (!(allowedLevels as readonly string[]).includes(seg.text.toLowerCase())) {
          errors.push(
            makeError(
              "step-meta-invalid",
              `step Level "${seg.text}" is not one of: ${allowedLevels.join(", ")}`,
              paragraph.position?.start.line,
            ),
          );
        }
      }
      if (seg.key === "time" && seg.text.length > 0) {
        if (!timeRegex.test(seg.text)) {
          errors.push(
            makeError(
              "step-meta-invalid",
              `step Time "${seg.text}" does not match ${timeRegex}`,
              paragraph.position?.start.line,
            ),
          );
        }
      }
    }
  }

  // ----- verify-empty ----------------------------------------------------
  // `**Verify:**` with fewer than verifyMinLength characters after the
  // marker — catches the degenerate "**Verify:**" line and near-empty
  // stubs. The marker itself is stripped before measuring.
  for (const child of children) {
    if (child.type !== "paragraph") continue;
    const paragraph = child as Paragraph;
    const first = paragraph.children[0];
    if (first?.type !== "strong") continue;
    if (!/^verify\s*:$/i.test(mdastToString(first).trim())) continue;
    const content = mdastToString(paragraph)
      .replace(/^\s*verify\s*:\s*/i, "")
      .trim();
    if (content.length < STEP_RULES.verifyMinLength) {
      errors.push(
        makeError(
          "verify-empty",
          `"${STEP_RULES.verifyMarker}" needs at least ${STEP_RULES.verifyMinLength} characters of content`,
          paragraph.position?.start.line,
        ),
      );
    }
  }

  return errors;
}
