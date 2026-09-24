/**
 * Characterization tests for `src/plugins/remark-mermaid.ts`.
 *
 * The plugin rewrites ```mermaid code fences into
 * `<div class="mermaid">…escaped source…</div>` html nodes so the client-side
 * loader in `CheatsheetLayout.astro` can render them. These tests pin the two
 * behaviors that matter before refactors and the Vitest major bump:
 *
 *  1. Only `lang === "mermaid"` fences are rewritten — everything else passes
 *     through untouched.
 *  2. The emitted source is HTML-escaped in `& → < → > → " → '` order so
 *     diagram syntax like `<br/>` survives the round-trip through the DOM and
 *     mermaid reads it back via `textContent`.
 *
 * Most cases run the plugin through the same `unified().use(remarkParse)`
 * pipeline `astro.config.mjs` wires it into; the guard-clause cases drive the
 * returned transformer directly.
 */
import { describe, expect, it } from "vitest";
import { unified } from "unified";
import remarkParse from "remark-parse";

import { remarkMermaid } from "../remark-mermaid.js";

interface MdastNode {
  type: string;
  value?: string;
  lang?: string | null;
  children?: MdastNode[];
}

/** Parse `markdown` and run the plugin's transformer over the resulting mdast. */
function run(markdown: string): MdastNode {
  const processor = unified().use(remarkParse).use(remarkMermaid);
  return processor.runSync(processor.parse(markdown)) as unknown as MdastNode;
}

describe("remarkMermaid fence rewriting", () => {
  it("replaces a ```mermaid fence with a <div class=\"mermaid\"> html node", () => {
    const tree = run("```mermaid\ngraph TD\n  A --> B\n```\n");
    const [node] = tree.children ?? [];
    expect(node?.type).toBe("html");
    expect(node?.value).toBe(
      '<div class="mermaid">graph TD\n  A --&gt; B</div>',
    );
  });

  it("escapes all five HTML-significant characters inside the fence", () => {
    const tree = run('```mermaid\nA["a & <b> \'c\'"]\n```\n');
    const [node] = tree.children ?? [];
    expect(node?.type).toBe("html");
    expect(node?.value).toBe(
      '<div class="mermaid">A[&quot;a &amp; &lt;b&gt; &#039;c&#039;&quot;]</div>',
    );
  });

  it("escapes & first, so pre-existing entities are double-escaped", () => {
    // `&lt;` in the source must become `&amp;lt;` — proving `&` is replaced
    // before `<`, otherwise the browser would read back a literal `<`.
    const tree = run("```mermaid\nA[&lt;br/&gt;]\n```\n");
    const [node] = tree.children ?? [];
    expect(node?.value).toBe(
      '<div class="mermaid">A[&amp;lt;br/&amp;gt;]</div>',
    );
  });

  it("emits an empty div for an empty mermaid fence", () => {
    const tree = run("```mermaid\n```\n");
    const [node] = tree.children ?? [];
    expect(node?.type).toBe("html");
    expect(node?.value).toBe('<div class="mermaid"></div>');
  });

  it("leaves non-mermaid code fences untouched", () => {
    const tree = run("```js\nconst a = 1 < 2 && 3 > 0;\n```\n");
    const [node] = tree.children ?? [];
    expect(node?.type).toBe("code");
    expect(node?.lang).toBe("js");
    expect(node?.value).toBe("const a = 1 < 2 && 3 > 0;");
  });

  it("is case-sensitive: ```Mermaid is not rewritten", () => {
    const tree = run("```Mermaid\nA --> B\n```\n");
    const [node] = tree.children ?? [];
    expect(node?.type).toBe("code");
    expect(node?.lang).toBe("Mermaid");
    expect(node?.value).toBe("A --> B");
  });

  it("rewrites every mermaid block and preserves sibling order", () => {
    const tree = run(
      "Intro text.\n\n```mermaid\nA-->B\n```\n\n```python\nx = 1\n```\n\n```mermaid\nC-->D\n```\n",
    );
    const children = tree.children ?? [];
    expect(children.map((node) => node.type)).toEqual([
      "paragraph",
      "html",
      "code",
      "html",
    ]);
    expect(children[1]?.value).toBe('<div class="mermaid">A--&gt;B</div>');
    expect(children[3]?.value).toBe('<div class="mermaid">C--&gt;D</div>');
  });

  it("still rewrites when the fence carries meta text (```mermaid title)", () => {
    // remark-parse puts the first info-string word in `lang` and the rest in
    // `meta`; the plugin keys off `lang` only, so meta must not block the
    // rewrite.
    const tree = run("```mermaid my-diagram\nA-->B\n```\n");
    const [node] = tree.children ?? [];
    expect(node?.type).toBe("html");
    expect(node?.value).toBe('<div class="mermaid">A--&gt;B</div>');
  });

  it("rewrites mermaid fences nested inside other nodes (e.g. list items)", () => {
    const tree = run("- setup step\n\n  ```mermaid\n  A-->B\n  ```\n");
    const listItem = tree.children?.[0]?.children?.[0];
    const nested = listItem?.children ?? [];
    // paragraph + the rewritten html node, in place inside the list item.
    expect(nested[nested.length - 1]?.type).toBe("html");
    expect(nested[nested.length - 1]?.value).toBe(
      '<div class="mermaid">A--&gt;B</div>',
    );
  });
});

describe("remarkMermaid guard clauses", () => {
  it("ignores a code node that has no parent (e.g. visited as root)", () => {
    const transformer = remarkMermaid();
    const node: MdastNode = {
      type: "code",
      lang: "mermaid",
      value: "A --> B",
    };
    // `visit` invokes the callback on a matching root with index/parent null;
    // the plugin must bail rather than write into a missing parent.
    transformer(node as never);
    expect(node.type).toBe("code");
    expect(node.value).toBe("A --> B");
  });
});
