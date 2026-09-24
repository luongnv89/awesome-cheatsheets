/**
 * Build-time helpers for step metadata in cheatsheet markdown bodies.
 *
 * A step is an H3 line of the form `### Step N — Title` (em/en/hyphen
 * dash). The catalog card footer and the detail-page meta row both read
 * these counts from the raw markdown body at build time — the client-side
 * progress UI (`StepChecklist.astro`) re-derives them from the DOM.
 */

/** Matches one step heading line: `### Step 1 — Install and verify`. */
const STEP_HEADING_LINE = /^###\s+Step\s+\d+\s*[—–-]/gm;

/** Matches a `**Time:**` marker inside a step-meta paragraph. */
const STEP_TIME_MARKER = /\*\*Time:\*\*\s*~?(\d+)\s*(min|mins|minutes|h|hr|hours)\b/gi;

/** Count `### Step N — …` headings in a markdown body. */
export function countSteps(body: string): number {
  const matches = body.match(STEP_HEADING_LINE);
  return matches ? matches.length : 0;
}

/**
 * Sum `**Time:**` step-meta values into total minutes. `~5 min` and
 * `10 min` count directly; `1 h` / `2 hours` count as 60 / 120.
 */
export function sumStepMinutes(body: string): number {
  let total = 0;
  for (const match of body.matchAll(STEP_TIME_MARKER)) {
    const value = Number.parseInt(match[1] ?? "0", 10);
    if (!Number.isFinite(value)) continue;
    const unit = (match[2] ?? "").toLowerCase();
    total += unit.startsWith("h") ? value * 60 : value;
  }
  return total;
}
