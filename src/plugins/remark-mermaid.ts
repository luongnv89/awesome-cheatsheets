import { visit } from 'unist-util-visit';

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
  return function (tree: any) {
    visit(tree, 'code', (node: any, index: number | null, parent: any) => {
      if (node.lang !== 'mermaid' || parent == null || index == null) return;
      parent.children[index] = {
        type: 'html',
        value: `<div class="mermaid">${escapeHtml(node.value)}</div>`,
      };
    });
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
