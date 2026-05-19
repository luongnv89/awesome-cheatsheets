/**
 * Freshness helpers shared between the catalog (`src/pages/index.astro` via
 * `CatalogCard.astro`) and the cheatsheet layout (`CheatsheetLayout.astro`).
 *
 * The staleness predicate must stay in sync across both surfaces so a chip on
 * the catalog and the banner on the detail page agree. To avoid CSS selector
 * collisions with the existing `.stale-banner` / `.freshness-chip` selectors
 * used by `e2e/freshness.test.ts`, the catalog renders the result with a
 * different class name (`catalog-stale-badge`) — but the rule itself lives
 * here so there is exactly one source of truth.
 */

const MS_PER_DAY = 1000 * 60 * 60 * 24;

/**
 * Compute the number of whole calendar days between two dates (today − updated).
 * Returns `null` if either argument cannot be parsed as a valid date.
 *
 * Both arguments accept a `Date` object or an ISO-8601 calendar string
 * (`YYYY-MM-DD`). When `now` is omitted it defaults to the current wall-clock
 * time, which is what the build sees at SSG render.
 */
export function daysSinceUpdate(
  lastUpdated: Date | string,
  now: Date = new Date(),
): number | null {
  const last =
    lastUpdated instanceof Date ? lastUpdated : new Date(lastUpdated);
  if (Number.isNaN(last.getTime()) || Number.isNaN(now.getTime())) {
    return null;
  }
  return Math.floor((now.getTime() - last.getTime()) / MS_PER_DAY);
}

/**
 * Returns `true` when a cheatsheet's `last_updated` is older than its
 * `stale_after_days` threshold. Returns `false` when:
 * - the date is invalid (we fail open — better than false positives)
 * - the threshold is missing / non-positive
 * - `daysSinceUpdate <= staleAfterDays`
 *
 * This matches the rule already encoded in `CheatsheetLayout.astro` so the
 * catalog and the detail page never disagree.
 */
export function isStale(
  lastUpdated: Date | string,
  staleAfterDays: number,
  now: Date = new Date(),
): boolean {
  if (!Number.isFinite(staleAfterDays) || staleAfterDays <= 0) {
    return false;
  }
  const days = daysSinceUpdate(lastUpdated, now);
  if (days === null) return false;
  return days > staleAfterDays;
}
