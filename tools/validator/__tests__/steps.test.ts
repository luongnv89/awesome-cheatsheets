/**
 * Step-structure rule tests — the four rule ids in `rules/steps.ts`:
 * `step-sequence`, `step-meta-invalid`, `prerequisites-out-of-order`, and
 * `verify-empty`. Each rule is exercised through `checkSteps` directly on
 * an inline-parsed tree (same pattern the section tests use via
 * `validate()` on fixtures, minus the file I/O).
 */
import { describe, expect, it } from "vitest";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkFrontmatter from "remark-frontmatter";
import type { Root } from "mdast";

import { checkSteps } from "../rules/steps.js";

const processor = unified().use(remarkParse).use(remarkFrontmatter, ["yaml"]);

function parse(source: string): Root {
  return processor.parse(source) as Root;
}

const SETUP = "## Step-by-Step Setup & Optimization";

describe("step-sequence", () => {
  it("passes with no step headings (steps are optional)", () => {
    const errors = checkSteps(parse(`${SETUP}\n\nSome prose, no steps.\n`));
    expect(errors.filter((e) => e.rule === "step-sequence")).toEqual([]);
  });

  it("passes on contiguous 1..N numbering", () => {
    const errors = checkSteps(
      parse(`${SETUP}\n\n### Step 1 — Install\n\n### Step 2 — Configure\n`),
    );
    expect(errors.filter((e) => e.rule === "step-sequence")).toEqual([]);
  });

  it("fails when numbering skips a step", () => {
    const errors = checkSteps(
      parse(`${SETUP}\n\n### Step 1 — Install\n\n### Step 3 — Configure\n`),
    );
    const seq = errors.filter((e) => e.rule === "step-sequence");
    expect(seq).toHaveLength(1);
    expect(seq[0]?.message).toMatch(/expected "Step 2"/);
  });

  it("fails when numbering does not start at 1", () => {
    const errors = checkSteps(
      parse(`${SETUP}\n\n### Step 2 — Configure\n`),
    );
    expect(errors.some((e) => e.rule === "step-sequence")).toBe(true);
  });

  it("ignores Step-looking H3s outside the setup section", () => {
    const errors = checkSteps(
      parse(`## Reference\n\n### Step 9 — Not a setup step\n`),
    );
    expect(errors.filter((e) => e.rule === "step-sequence")).toEqual([]);
  });
});

describe("step-meta-invalid", () => {
  it("passes when a step has no meta paragraph", () => {
    const errors = checkSteps(
      parse(`${SETUP}\n\n### Step 1 — Install\n\nJust prose here.\n`),
    );
    expect(errors.filter((e) => e.rule === "step-meta-invalid")).toEqual([]);
  });

  it("passes on valid Goal/Time/Level values", () => {
    const errors = checkSteps(
      parse(
        `${SETUP}\n\n### Step 1 — Install\n\n**Goal:** Binary on PATH · **Time:** ~5 min · **Level:** beginner\n`,
      ),
    );
    expect(errors.filter((e) => e.rule === "step-meta-invalid")).toEqual([]);
  });

  it("fails on an unknown Level", () => {
    const errors = checkSteps(
      parse(
        `${SETUP}\n\n### Step 1 — Install\n\n**Goal:** X · **Level:** wizard\n`,
      ),
    );
    const meta = errors.filter((e) => e.rule === "step-meta-invalid");
    expect(meta).toHaveLength(1);
    expect(meta[0]?.message).toMatch(/wizard/);
  });

  it("fails on a malformed Time", () => {
    const errors = checkSteps(
      parse(
        `${SETUP}\n\n### Step 1 — Install\n\n**Time:** a while · **Level:** intermediate\n`,
      ),
    );
    expect(errors.some((e) => e.rule === "step-meta-invalid")).toBe(true);
  });

  it("accepts every allowed level and hour units", () => {
    const errors = checkSteps(
      parse(
        `${SETUP}\n\n### Step 1 — A\n\n**Time:** 2 hours · **Level:** advanced\n\n### Step 2 — B\n\n**Time:** 10 min · **Level:** intermediate\n`,
      ),
    );
    expect(errors.filter((e) => e.rule === "step-meta-invalid")).toEqual([]);
  });
});

describe("prerequisites-out-of-order", () => {
  it("passes when Prerequisites precedes Installation", () => {
    const errors = checkSteps(
      parse(`## Prerequisites\n\n- [ ] Node\n\n## Installation\n\nDo it.\n`),
    );
    expect(
      errors.filter((e) => e.rule === "prerequisites-out-of-order"),
    ).toEqual([]);
  });

  it("fails when Prerequisites follows Installation", () => {
    const errors = checkSteps(
      parse(`## Installation\n\nDo it.\n\n## Prerequisites\n\n- [ ] Node\n`),
    );
    expect(
      errors.some((e) => e.rule === "prerequisites-out-of-order"),
    ).toBe(true);
  });

  it("passes when no Prerequisites section exists", () => {
    const errors = checkSteps(parse(`## Installation\n\nDo it.\n`));
    expect(
      errors.filter((e) => e.rule === "prerequisites-out-of-order"),
    ).toEqual([]);
  });
});

describe("verify-empty", () => {
  it("passes on a substantive Verify line", () => {
    const errors = checkSteps(
      parse(`**Verify:** \`tool --version\` prints a version number.\n`),
    );
    expect(errors.filter((e) => e.rule === "verify-empty")).toEqual([]);
  });

  it("fails on a bare **Verify:** marker", () => {
    const errors = checkSteps(parse(`**Verify:**\n`));
    expect(errors.some((e) => e.rule === "verify-empty")).toBe(true);
  });

  it("fails on a Verify line under the minimum content length", () => {
    const errors = checkSteps(parse(`**Verify:** ok\n`));
    expect(errors.some((e) => e.rule === "verify-empty")).toBe(true);
  });
});
