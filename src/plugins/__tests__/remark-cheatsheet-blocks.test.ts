/**
 * Tests for `src/plugins/remark-cheatsheet-blocks.ts` — the build-time
 * transform behind the extended (optional) cheatsheet template.
 *
 * Assertions run at the mdast level: hName/hProperties data is what
 * mdast-util-to-hast consumes downstream, so pinning it pins the emitted
 * HTML. Every transform must be a strict no-op on unmatched content —
 * existing cheatsheets render exactly as before.
 */
import { describe, expect, it } from "vitest";
import { unified } from "unified";
import remarkParse from "remark-parse";

import { remarkCheatsheetBlocks } from "../remark-cheatsheet-blocks.js";

interface MdastNode {
  type: string;
  depth?: number;
  value?: string;
  checked?: boolean | null;
  children?: MdastNode[];
  data?: {
    hName?: string;
    hProperties?: Record<string, unknown>;
  };
}

/** Parse `markdown` and run the plugin's transformer over the resulting mdast. */
function run(markdown: string): MdastNode {
  const processor = unified().use(remarkParse).use(remarkCheatsheetBlocks);
  return processor.runSync(processor.parse(markdown)) as unknown as MdastNode;
}

const STEP_DOC = `## Step-by-Step Setup & Optimization

### Step 1 — Install and verify

**Goal:** A working \`tool\` binary on PATH · **Time:** ~5 min · **Level:** beginner

1. Install:
   \`\`\`bash
   tool --install
   \`\`\`

**Verify:** \`tool --version\` prints a version number.
`;

describe("step-meta paragraphs", () => {
  it("marks the meta paragraph and wraps each segment in a step-meta-item span", () => {
    const tree = run(STEP_DOC);
    const paragraph = tree.children?.[2];
    expect(paragraph?.type).toBe("paragraph");
    expect(paragraph?.data?.hProperties?.className).toEqual(["step-meta"]);

    const htmlNodes = (paragraph?.children ?? []).filter(
      (n) => n.type === "html",
    );
    const openers = htmlNodes
      .map((n) => n.value ?? "")
      .filter((v) => v.startsWith("<span"));
    expect(openers[0]).toBe(
      '<span class="step-meta-item" data-key="goal">',
    );
    expect(openers[1]).toBe(
      '<span class="step-meta-item" data-key="time" data-minutes="5">',
    );
    expect(openers[2]).toBe(
      '<span class="step-meta-item" data-key="level">',
    );
    // Separator text nodes are dropped — 3 open + 3 close spans.
    expect(htmlNodes).toHaveLength(6);
  });

  it("emits hours as minutes in data-minutes", () => {
    const tree = run(
      `### Step 2 — Configure\n\n**Time:** 1 h · **Level:** advanced\n`,
    );
    const paragraph = tree.children?.[1];
    const opener = (paragraph?.children ?? []).find(
      (n) => n.type === "html" && n.value?.includes('data-key="time"'),
    );
    expect(opener?.value).toContain('data-minutes="60"');
  });

  it("leaves a non-meta paragraph after a step heading untouched", () => {
    const tree = run(
      `### Step 1 — Install\n\nJust a normal paragraph about installing.\n`,
    );
    const paragraph = tree.children?.[1];
    expect(paragraph?.data).toBeUndefined();
    expect(
      (paragraph?.children ?? []).every((n) => n.type !== "html"),
    ).toBe(true);
  });
});

describe("verify callouts", () => {
  it("rewrites a **Verify:** paragraph into a callout-verify div", () => {
    const tree = run(STEP_DOC);
    const verify = tree.children?.[4];
    expect(verify?.type).toBe("paragraph");
    expect(verify?.data?.hName).toBe("div");
    expect(verify?.data?.hProperties?.className).toEqual([
      "callout",
      "callout-verify",
    ]);
    expect(verify?.data?.hProperties?.["data-callout"]).toBe("Verify");
    // The **Verify:** strong run is stripped from the children.
    expect(verify?.children?.[0]?.type).not.toBe("strong");
  });

  it("leaves paragraphs that merely contain the word verify alone", () => {
    const tree = run(`Please verify the install worked.\n`);
    expect(tree.children?.[0]?.data).toBeUndefined();
  });
});

describe("GitHub alert blockquotes", () => {
  it("rewrites a [!WARNING] blockquote into a warning callout div", () => {
    const tree = run(`> [!WARNING]\n> Restart the daemon before retrying.\n`);
    const node = tree.children?.[0];
    expect(node?.type).toBe("blockquote");
    expect(node?.data?.hName).toBe("div");
    expect(node?.data?.hProperties?.className).toEqual([
      "callout",
      "callout-warning",
    ]);
    expect(node?.data?.hProperties?.["data-callout"]).toBe("Warning");
    // Marker removed from the first paragraph text.
    const para = node?.children?.[0];
    expect(para?.children?.[0]?.value).not.toMatch(/\[!/);
  });

  it("rewrites a [!TIP] blockquote into a tip callout div", () => {
    const tree = run(`> [!TIP]\n> One-line tip.\n`);
    expect(tree.children?.[0]?.data?.hProperties?.className).toEqual([
      "callout",
      "callout-tip",
    ]);
  });

  it("leaves plain blockquotes untouched", () => {
    const tree = run(`> Just a quote.\n`);
    expect(tree.children?.[0]?.data).toBeUndefined();
  });
});

describe("prerequisites task list", () => {
  const PREREQ_DOC = `## Prerequisites

- [ ] Node.js 20+ installed
- [x] Git configured

## Installation

Do the thing.
`;

  it("injects prereq-N checkboxes into task items under ## Prerequisites", () => {
    const tree = run(PREREQ_DOC);
    const list = tree.children?.[1];
    expect(list?.type).toBe("list");
    const firstPara = list?.children?.[0]?.children?.[0];
    const secondPara = list?.children?.[1]?.children?.[0];
    expect(firstPara?.children?.[0]?.value).toBe(
      '<input type="checkbox" class="prereq-checkbox" data-prereq="prereq-0">',
    );
    expect(secondPara?.children?.[0]?.value).toBe(
      '<input type="checkbox" class="prereq-checkbox" data-prereq="prereq-1" checked>',
    );
    // The [ ]/[x] markers are stripped from the remaining text.
    expect(firstPara?.children?.[1]?.value).not.toMatch(/^\[/);
    expect(list?.children?.[0]?.data?.hProperties?.className).toEqual([
      "prereq-item",
    ]);
  });

  it("does not number task lists outside the Prerequisites section", () => {
    const tree = run(`## Installation\n\n- [ ] plain list item\n`);
    const list = tree.children?.[1];
    const para = list?.children?.[0]?.children?.[0];
    expect(para?.children?.[0]?.type).toBe("text");
  });
});

describe("no-op on unmatched content", () => {
  it("returns an unchanged tree for plain markdown", () => {
    const md = `## Installation\n\nSome text.\n\n\`\`\`bash\ncmd\n\`\`\`\n`;
    const before = unified().use(remarkParse).parse(md);
    const after = run(md);
    expect(after).toEqual(before);
  });
});
