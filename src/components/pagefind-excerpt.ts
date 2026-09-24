/**
 * Whitelist sanitizer for Pagefind `result.excerpt` (issue #144, F-SEC-002).
 *
 * Pagefind excerpts are HTML: the matched terms arrive wrapped in `<mark>`
 * elements and the surrounding text is entity-escaped by the indexer. The
 * excerpt is still markup built from user-contributed cheatsheet content,
 * so assigning it straight to `innerHTML` is a stored-XSS sink: any tag the
 * indexer lets through — `<img onerror>`, `<svg>`, `<a href="javascript:">` —
 * would be created live in the DOM.
 *
 * `sanitizeExcerpt` keeps the highlight (`<mark>` / `</mark>` — the only tag
 * Pagefind emits and the only tag the stylesheet styles) and neutralizes
 * everything else: other tag-shaped tokens are entity-escaped so they render
 * as literal text, and a stray `<` that opens no tag becomes `&lt;`. Plain
 * text — including the entities Pagefind already emitted — passes through
 * untouched, so escaping is never double-applied.
 *
 * Deliberately dependency-free: the allowlist is a single tag, so a DOM or
 * regex-parsing sanitizer would add weight without adding safety.
 */

/** A `<…>`-shaped token: `<`, anything that is not `>`, then `>`. */
const TAG_TOKEN = /^<[^>]*>/;

/** The only allowed element: exactly `<mark>` or `</mark>` (case-insensitive). */
const MARK_TAG = /^<\/?mark>$/i;

/**
 * Escape the three characters that matter inside element content. Applied
 * only to tag-shaped tokens, so the rendered text stays byte-identical to
 * the raw markup the token carried.
 */
function escapeTag(token: string): string {
  return token.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/**
 * Return `excerpt` safe for `innerHTML`: `<mark>`/`</mark>` preserved, every
 * other tag neutralized to visible text, stray `<` escaped.
 */
export function sanitizeExcerpt(excerpt: string): string {
  let out = "";
  let i = 0;
  while (i < excerpt.length) {
    const lt = excerpt.indexOf("<", i);
    if (lt === -1) {
      out += excerpt.slice(i);
      break;
    }
    // Text before the `<` (words, entities like `&lt;`) passes through as-is.
    out += excerpt.slice(i, lt);
    const token = TAG_TOKEN.exec(excerpt.slice(lt));
    if (token && MARK_TAG.test(token[0])) {
      out += token[0];
      i = lt + token[0].length;
    } else if (token) {
      out += escapeTag(token[0]);
      i = lt + token[0].length;
    } else {
      // Stray `<` that opens no tag (e.g. `a < b`, `<3`, truncated input).
      out += "&lt;";
      i = lt + 1;
    }
  }
  return out;
}
