import { visit } from 'unist-util-visit';
import type { Code, Html, Parent, Root } from 'mdast';

/**
 * Replace ```mermaid code fences with <div class="mermaid">…escaped source…</div>
 * so the client-side mermaid loader (CheatsheetLayout.astro) can render them
 * into SVG. Sync — no build-time CLI dependency.
 *
 * The mermaid source is HTML-escaped on emit so syntax like `<br/>` in node
 * labels survives the round-trip: the browser stores it as literal text in the
 * div, and mermaid reads it back via textContent.
 */
export function remarkMermaid() {
  return function (tree: Root) {
    visit(
      tree,
      'code',
      (node: Code, index: number | undefined, parent: Parent | undefined) => {
        if (node.lang !== 'mermaid' || parent == null || index == null) return;
        const replacement: Html = {
          type: 'html',
          value: `<div class="mermaid">${escapeHtml(node.value)}</div>`,
        };
        parent.children[index] = replacement;
      },
    );
  };
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
