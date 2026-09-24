import { visit } from 'unist-util-visit';
import { toString as mdastToString } from 'mdast-util-to-string';
import type {
  Blockquote,
  Heading,
  ListItem,
  Paragraph,
  PhrasingContent,
  Root,
  RootContent,
} from 'mdast';
import { STEP_RULES } from '../../tools/contract/steps.js';

const { headingRegex, setupSection } = STEP_RULES;

const ALERTS: Record<string, string> = {
  note: 'Note',
  tip: 'Tip',
  important: 'Important',
  warning: 'Warning',
  caution: 'Caution',
};

/**
 * Extended-template remark plugin — turns the optional structured blocks in
 * a cheatsheet into styled markup at build time (no client JS):
 *
 *  - Step meta: the FIRST paragraph directly after a `### Step N —` heading,
 *    when it is a `**Goal:** … · **Time:** … · **Level:** …` line, becomes
 *    `<p class="step-meta">` with each segment wrapped in
 *    `<span class="step-meta-item" data-key="goal|time|level">`; a parseable
 *    Time also carries `data-minutes`.
 *  - Verify: a paragraph starting with `**Verify:**` becomes
 *    `<div class="callout callout-verify" data-callout="Verify">` with the
 *    marker stripped.
 *  - GitHub alerts: blockquotes whose first line is `[!NOTE]`, `[!TIP]`,
 *    `[!IMPORTANT]`, `[!WARNING]`, or `[!CAUTION]` become
 *    `<div class="callout callout-<type>" data-callout="<Type>">` with the
 *    marker removed — the same syntax GitHub renders natively.
 *  - Prerequisites: task-list items under an optional `## Prerequisites` H2
 *    get a `<input class="prereq-checkbox" data-prereq="prereq-N">` so the
 *    client script can persist them under the slug's progress object.
 *
 * Every transform is a no-op on content that doesn't match — existing
 * cheatsheets render exactly as before.
 */
export function remarkCheatsheetBlocks() {
  return function (tree: Root) {
    transformStepMeta(tree);
    transformVerify(tree);
    transformAlerts(tree);
    transformPrerequisites(tree);
  };
}

/** `**Goal:**`/`**Time:**`/`**Level:**` strong run → its key, else null. */
function metaLabelOf(node: PhrasingContent | undefined): string | null {
  if (node?.type !== 'strong') return null;
  const match = mdastToString(node).trim().match(/^(goal|time|level)\s*:$/i);
  return match && match[1] ? match[1].toLowerCase() : null;
}

/** Parse a Time segment's text into whole minutes (hours × 60). */
function parseMinutes(text: string): number | null {
  const hours = text.match(/(\d+)\s*(?:h|hr|hours)\b/i);
  if (hours && hours[1]) return Number(hours[1]) * 60;
  const mins = text.match(/(\d+)\s*(?:min|mins|minutes)\b/i);
  if (mins && mins[1]) return Number(mins[1]);
  return null;
}

/**
 * Step-meta paragraphs: scan each parent's children; when a step H3 is
 * followed directly by a paragraph whose first child is a meta-label
 * strong run, split its children on ` · ` separators and wrap each
 * segment in a `<span class="step-meta-item">` via html nodes.
 */
function transformStepMeta(tree: Root): void {
  visit(
    tree,
    'heading',
    (node: Heading, index: number | undefined, parent) => {
      if (node.depth !== 3 || parent == null || index == null) return;
      if (!headingRegex.test(mdastToString(node).trim())) return;
      const next = parent.children[index + 1];
      if (next?.type !== 'paragraph') return;
      const paragraph = next as Paragraph;
      if (metaLabelOf(paragraph.children[0]) === null) return;

      // Split children into labelled segments; ` · ` separators drop out.
      const segments: { key: string; children: PhrasingContent[] }[] = [];
      let current: { key: string; children: PhrasingContent[] } | null = null;
      for (const child of paragraph.children) {
        const key = metaLabelOf(child);
        if (key !== null) {
          current = { key, children: [child] };
          segments.push(current);
          continue;
        }
        if (current === null) continue;
        if (child.type === 'text' && child.value.trim() === '·') continue;
        current.children.push(child);
      }

      // The separator is usually glued to the preceding text node
      // (" 2 hours · ") — strip a trailing "·" from each segment's last
      // text child so the rendered span doesn't carry a stray middot.
      for (const seg of segments) {
        const last = seg.children[seg.children.length - 1];
        if (last?.type === 'text') {
          last.value = last.value.replace(/\s*·\s*$/, '');
          if (last.value === '') seg.children.pop();
        }
      }

      const rebuilt: PhrasingContent[] = [];
      for (const seg of segments) {
        const attrs = [`class="step-meta-item"`, `data-key="${seg.key}"`];
        if (seg.key === 'time') {
          const minutes = parseMinutes(
            mdastToString({ type: 'paragraph', children: seg.children }),
          );
          if (minutes !== null) attrs.push(`data-minutes="${minutes}"`);
        }
        rebuilt.push({
          type: 'html',
          value: `<span ${attrs.join(' ')}>`,
        } as PhrasingContent);
        rebuilt.push(...seg.children);
        rebuilt.push({ type: 'html', value: '</span>' } as PhrasingContent);
      }
      paragraph.children = rebuilt;
      paragraph.data = {
        ...paragraph.data,
        hProperties: { ...paragraph.data?.hProperties, className: ['step-meta'] },
      };
    },
  );
}

/** `**Verify:**` paragraphs → `<div class="callout callout-verify">`. */
function transformVerify(tree: Root): void {
  visit(tree, 'paragraph', (node: Paragraph) => {
    const first = node.children[0];
    if (first?.type !== 'strong') return;
    if (!/^verify\s*:$/i.test(mdastToString(first).trim())) return;
    // Strip the marker and any whitespace it left on the next text node.
    node.children.shift();
    const next = node.children[0];
    if (next?.type === 'text') next.value = next.value.replace(/^\s+/, '');
    node.data = {
      ...node.data,
      hName: 'div',
      hProperties: {
        ...node.data?.hProperties,
        className: ['callout', 'callout-verify'],
        'data-callout': 'Verify',
      },
    };
  });
}

/** GitHub `[!TYPE]` alert blockquotes → `<div class="callout callout-*">`. */
function transformAlerts(tree: Root): void {
  visit(tree, 'blockquote', (node: Blockquote) => {
    const paragraph = node.children[0];
    if (paragraph?.type !== 'paragraph') return;
    const firstText = (paragraph as Paragraph).children[0];
    if (firstText?.type !== 'text') return;
    const match = firstText.value.match(
      /^\[!(note|tip|important|warning|caution)\]\s*/i,
    );
    if (!match || !match[1]) return;
    const type = match[1].toLowerCase();
    firstText.value = firstText.value.slice(match[0].length);
    if (firstText.value === '') {
      (paragraph as Paragraph).children.shift();
    }
    node.data = {
      ...node.data,
      hName: 'div',
      hProperties: {
        ...node.data?.hProperties,
        className: ['callout', `callout-${type}`],
        'data-callout': ALERTS[type] ?? type,
      },
    };
  });
}

/**
 * `## Prerequisites` task items → persistent `prereq-N` checkboxes.
 * Handles both parse modes: remark-gfm sets `listItem.checked`; without it
 * the literal `[ ]`/`[x]` marker is still in the first text node.
 */
function transformPrerequisites(tree: Root): void {
  const children = tree.children;
  const start = children.findIndex(
    (node) =>
      node.type === 'heading' &&
      node.depth === 2 &&
      /^prerequisites\b/i.test(mdastToString(node).trim()),
  );
  if (start === -1) return;

  let counter = 0;
  for (let i = start + 1; i < children.length; i++) {
    const node: RootContent | undefined = children[i];
    if (!node) break;
    if (node.type === 'heading' && node.depth === 2) break;
    if (node.type !== 'list') continue;
    for (const item of node.children) {
      const listItem = item as ListItem;
      const paragraph = listItem.children.find((c) => c.type === 'paragraph');
      if (!paragraph) continue;

      let checked: boolean | null = null;
      if (typeof listItem.checked === 'boolean') {
        checked = listItem.checked;
      } else {
        const firstText = paragraph.children[0];
        if (firstText?.type === 'text') {
          const marker = firstText.value.match(/^\[([ xX])\]\s*/);
          if (marker) {
            checked = (marker[1] ?? ' ').toLowerCase() === 'x';
            firstText.value = firstText.value.slice(marker[0].length);
          }
        }
      }
      if (checked === null) continue;

      // Suppress the renderer's own task-checkbox output, then inject the
      // persistent one carrying the `data-prereq` storage key.
      listItem.checked = null;
      listItem.data = {
        ...listItem.data,
        hProperties: {
          ...listItem.data?.hProperties,
          className: ['prereq-item'],
        },
      };
      paragraph.children.unshift({
        type: 'html',
        value: `<input type="checkbox" class="prereq-checkbox" data-prereq="prereq-${counter}"${checked ? ' checked' : ''}>`,
      } as PhrasingContent);
      counter += 1;
    }
  }
}
