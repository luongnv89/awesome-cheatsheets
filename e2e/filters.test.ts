import { test, expect } from "@playwright/test";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { parse } from "yaml";

/**
 * Catalog filter pills (issue #22).
 *
 * Verifies:
 *  - Pill bar renders one button per unique category and tag in the corpus.
 *  - Clicking a pill filters the visible `.catalog-list-item` cards.
 *  - URL `?tag=mcp` and `?category=tool` round-trip — loading the page with
 *    those params marks the matching pills as `aria-pressed="true"` and
 *    pre-filters the grid; toggling the pill restores the URL.
 *  - `aria-pressed` toggles on click between "true" and "false".
 *  - Keyboard activation: Space and Enter both toggle a focused pill.
 *  - Clearing the active filter via the "Clear filters" button restores the
 *    full grid and removes the URL params.
 *  - The pill bar hides itself while a Pagefind query is active so users
 *    can't operate filters against the hidden static grid.
 *
 * Selectors live under `.catalog-filter-*` — disjoint from `.catalog-card`,
 * `.catalog-search-*`, `.freshness-chip`, and `.stale-banner`.
 */

// Corpus-derived facet sets: every cheatsheet currently visible in the
// catalog (status === "published"; see issue #90). Derived from the corpus
// at test time — a previous hardcoded snapshot silently went stale every
// time a published cheatsheet landed, which is the drift these count
// assertions exist to catch (issue #115). Mirrors the facet pipelines in
// `src/pages/index.astro`: status-published entries only (schema defaults
// `status` to "published" when absent), then unique facets.
const CHEATSHEETS_DIR = join(process.cwd(), "src/content/cheatsheets");

type PublishedEntry = { category?: string; tags?: string[] };

const PUBLISHED_ENTRIES: PublishedEntry[] = readdirSync(CHEATSHEETS_DIR, {
  withFileTypes: true,
})
  .filter((entry) => entry.isDirectory())
  .flatMap((entry) => {
    const file = join(CHEATSHEETS_DIR, entry.name, `${entry.name}.md`);
    // A dir without `<slug>.md` contributes no collection entry — same
    // as Astro's getCollection, so it contributes no facets either.
    if (!existsSync(file)) return [];
    const frontmatter = readFileSync(file, "utf8").match(
      /^---\r?\n([\s\S]*?)\r?\n---/,
    );
    if (!frontmatter) return [];
    const data = parse(frontmatter[1]) as PublishedEntry & {
      status?: string;
    };
    if ((data.status ?? "published") !== "published") return [];
    return [data];
  });

// Tags are unique + alphabetical (matches `filterTags`, once normalized).
const PUBLISHED_TAGS = Array.from(
  new Set(PUBLISHED_ENTRIES.flatMap((entry) => entry.tags ?? [])),
).sort();

// Categories are emitted in the schema enum order declared by
// `CATEGORY_ORDER` in `src/pages/index.astro`, intersected with the set of
// categories actually present in the published corpus. Keep both lists in
// sync with the source of truth.
const CATEGORY_ORDER = ["tool", "mcp", "concept", "comparison"] as const;
const PUBLISHED_CATEGORIES = CATEGORY_ORDER.filter((category) =>
  PUBLISHED_ENTRIES.some((entry) => entry.category === category),
);
// Surface categories that exist in the corpus but are missing from
// CATEGORY_ORDER — the site would silently drop those pills.
const UNKNOWN_CATEGORIES = Array.from(
  new Set(
    PUBLISHED_ENTRIES.map((entry) => entry.category).filter(
      (category): category is string =>
        typeof category === "string" &&
        !(CATEGORY_ORDER as readonly string[]).includes(category),
    ),
  ),
).sort();

test.describe("Catalog filter pills", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("./");
    await expect(page.locator(".catalog-filter")).toBeVisible();
  });

  test("renders one pill per unique category in the corpus", async ({
    page,
  }) => {
    // One pill per unique category among published entries, in
    // CATEGORY_ORDER (tool first). Derived at test time so publishing a
    // new category can't silently break this assertion.
    expect(UNKNOWN_CATEGORIES).toEqual([]);
    expect(PUBLISHED_CATEGORIES.length).toBeGreaterThan(0);
    const categoryPills = page.locator(
      '.catalog-filter-pill[data-filter-axis="category"]',
    );
    await expect(categoryPills).toHaveCount(PUBLISHED_CATEGORIES.length);
    await expect(categoryPills).toHaveText(PUBLISHED_CATEGORIES);
    // CATEGORY_ORDER puts `tool` first and the corpus always has it, so the
    // first pill is the tool filter.
    await expect(categoryPills.first()).toHaveAttribute(
      "data-filter-value",
      PUBLISHED_CATEGORIES[0],
    );
    for (const category of PUBLISHED_CATEGORIES) {
      await expect(
        page.locator(
          `.catalog-filter-pill[data-filter-axis="category"][data-filter-value="${category}"]`,
        ),
      ).toBeVisible();
    }
  });

  test("renders one pill per unique tag in the corpus", async ({ page }) => {
    const tagPills = page.locator(
      '.catalog-filter-pill[data-filter-axis="tag"]',
    );
    await expect(tagPills).toHaveCount(PUBLISHED_TAGS.length);
    // Tags beyond the top-10 most-frequent set sit behind the "+N more"
    // expander — reveal the full list before sampling visibility.
    await page.locator(".catalog-filter-more").click();
    // Sample a few values to confirm rendering — we don't need to match
    // exact order since the source iterates a Set sorted alphabetically.
    // Samples come from the derived set so the corpus can't drift them.
    for (const tag of PUBLISHED_TAGS.slice(0, 3)) {
      await expect(
        page.locator(
          `.catalog-filter-pill[data-filter-axis="tag"][data-filter-value="${tag}"]`,
        ),
      ).toBeVisible();
    }
  });

  test("each pill is a button with aria-pressed=false on initial load", async ({
    page,
  }) => {
    const pills = page.locator(".catalog-filter-pill");
    const count = await pills.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      const pill = pills.nth(i);
      // <button> elements have implicit role=button; we assert the tag is
      // BUTTON so screen readers and tab order treat them consistently.
      await expect(pill).toHaveAttribute("type", "button");
      await expect(pill).toHaveAttribute("aria-pressed", "false");
    }
  });

  test("clicking a tag pill filters the visible cards", async ({ page }) => {
    // `mcp` sits outside the top-10 tag facet in the fixture corpus —
    // expand the "+N more" tail before clicking it.
    await page.locator(".catalog-filter-more").click();
    const pill = page.locator(
      '.catalog-filter-pill[data-filter-axis="tag"][data-filter-value="mcp"]',
    );
    await pill.click();

    await expect(pill).toHaveAttribute("aria-pressed", "true");
    // Hermes has the `mcp` tag, so its card stays visible.
    await expect(
      page.locator(".catalog-card").filter({ hasText: "Hermes Agent" }),
    ).toBeVisible();
    // The clear button appears once any filter is active.
    await expect(page.locator(".catalog-filter-clear")).toBeVisible();
  });

  test("a tag with no matching cards hides everything", async ({ page }) => {
    // Build a synthetic pill click that toggles a tag that the corpus
    // never has. We don't pre-render pills for absent tags, so we drive
    // this via the URL round-trip path instead.
    await page.goto("./?tag=zzz-not-real");
    await expect(page.locator(".catalog-filter")).toBeVisible();
    // No `.catalog-list-item` rows should be visible.
    const visibleCards = page.locator(".catalog-list-item:not([hidden])");
    await expect(visibleCards).toHaveCount(0);
    // Status text reflects the empty state.
    await expect(page.locator(".catalog-filter-status")).toContainText(
      /0 cheatsheets match/i,
    );
  });

  test("zero-match filters show an empty state with a clear action (issue #142)", async ({
    page,
  }) => {
    await page.goto("./?tag=zzz-not-real");
    await expect(page.locator(".catalog-filter")).toBeVisible();
    await expect(
      page.locator(".catalog-list-item:not([hidden])"),
    ).toHaveCount(0);

    // A visible empty-state block replaces the blank grid — message plus its
    // own Clear filters action.
    const empty = page.locator(".catalog-filter-empty");
    await expect(empty).toBeVisible();
    await expect(empty).toContainText(/no cheatsheets match/i);

    const clearBtn = empty.locator(".catalog-filter-empty-clear");
    await expect(clearBtn).toBeVisible();
    await clearBtn.click();

    // Filters reset: empty state hides, URL params drop, the full grid returns.
    await expect(empty).toBeHidden();
    const params = new URL(page.url()).searchParams;
    expect(params.get("tag")).toBeNull();
    await expect(
      page.locator(".catalog-card").filter({ hasText: "Hermes Agent" }),
    ).toBeVisible();
  });

  test("filter empty state hides while a search query is active", async ({
    page,
  }) => {
    await page.goto("./?tag=zzz-not-real");
    const empty = page.locator(".catalog-filter-empty");
    await expect(empty).toBeVisible();

    // The block lives outside `.catalog-filter`, so it needs its own hide
    // while Pagefind owns the grid.
    await expect(page.locator(".catalog-search-input")).toBeVisible({
      timeout: 10_000,
    });
    await page.locator(".catalog-search-input").fill("hermes");
    await expect(page.locator(".catalog-filter")).toBeHidden();
    await expect(empty).toBeHidden();

    // Clearing the query restores the still-active zero-match state.
    await page.locator(".catalog-search-input").fill("");
    await expect(page.locator(".catalog-filter")).toBeVisible();
    await expect(empty).toBeVisible();
  });

  test("URL ?tag=mcp round-trips on initial load", async ({ page }) => {
    await page.goto("./?tag=mcp");
    await expect(page.locator(".catalog-filter")).toBeVisible();
    const pill = page.locator(
      '.catalog-filter-pill[data-filter-axis="tag"][data-filter-value="mcp"]',
    );
    await expect(pill).toHaveAttribute("aria-pressed", "true");
    await expect(
      page.locator(".catalog-card").filter({ hasText: "Hermes Agent" }),
    ).toBeVisible();
  });

  test("URL ?category=tool round-trips on initial load", async ({ page }) => {
    await page.goto("./?category=tool");
    await expect(page.locator(".catalog-filter")).toBeVisible();
    const pill = page.locator(
      '.catalog-filter-pill[data-filter-axis="category"][data-filter-value="tool"]',
    );
    await expect(pill).toHaveAttribute("aria-pressed", "true");
  });

  test("toggling a pill removes it from the URL", async ({ page }) => {
    await page.goto("./?tag=mcp");
    await expect(page.locator(".catalog-filter")).toBeVisible();
    const pill = page.locator(
      '.catalog-filter-pill[data-filter-axis="tag"][data-filter-value="mcp"]',
    );
    await expect(pill).toHaveAttribute("aria-pressed", "true");
    await pill.click();
    await expect(pill).toHaveAttribute("aria-pressed", "false");
    await expect(page).toHaveURL(/\/awesome-cheatsheets\/?(?:\?.*)?$/);
    const params = new URL(page.url()).searchParams;
    expect(params.get("tag")).toBeNull();
  });

  test("aria-pressed flips on click", async ({ page }) => {
    const pill = page.locator(
      '.catalog-filter-pill[data-filter-axis="tag"][data-filter-value="cli"]',
    );
    await expect(pill).toHaveAttribute("aria-pressed", "false");
    await pill.click();
    await expect(pill).toHaveAttribute("aria-pressed", "true");
    await pill.click();
    await expect(pill).toHaveAttribute("aria-pressed", "false");
  });

  test("keyboard: Space toggles a focused pill", async ({ page }) => {
    const pill = page.locator(
      '.catalog-filter-pill[data-filter-axis="tag"][data-filter-value="cli"]',
    );
    await pill.focus();
    await page.keyboard.press("Space");
    await expect(pill).toHaveAttribute("aria-pressed", "true");
    await page.keyboard.press("Space");
    await expect(pill).toHaveAttribute("aria-pressed", "false");
  });

  test("keyboard: Enter toggles a focused pill", async ({ page }) => {
    // "memory" sits outside the top-10 frequent tags — expand "+N more"
    // so the pill is visible and focusable.
    await page.locator(".catalog-filter-more").click();
    const pill = page.locator(
      '.catalog-filter-pill[data-filter-axis="tag"][data-filter-value="memory"]',
    );
    await pill.focus();
    await page.keyboard.press("Enter");
    await expect(pill).toHaveAttribute("aria-pressed", "true");
    await page.keyboard.press("Enter");
    await expect(pill).toHaveAttribute("aria-pressed", "false");
  });

  test("Clear filters button restores all cards and clears URL", async ({
    page,
  }) => {
    await page.goto("./?tag=mcp&category=tool");
    await expect(page.locator(".catalog-filter")).toBeVisible();
    const clearBtn = page.locator(".catalog-filter-clear");
    await expect(clearBtn).toBeVisible();
    await clearBtn.click();

    // Pills go back to aria-pressed=false.
    await expect(
      page.locator(
        '.catalog-filter-pill[data-filter-axis="tag"][data-filter-value="mcp"]',
      ),
    ).toHaveAttribute("aria-pressed", "false");
    await expect(
      page.locator(
        '.catalog-filter-pill[data-filter-axis="category"][data-filter-value="tool"]',
      ),
    ).toHaveAttribute("aria-pressed", "false");
    // URL has no tag/category params.
    const params = new URL(page.url()).searchParams;
    expect(params.get("tag")).toBeNull();
    expect(params.get("category")).toBeNull();
    // Clear button hides itself once nothing is selected.
    await expect(clearBtn).toBeHidden();
    // All cards visible again.
    await expect(
      page.locator(".catalog-card").filter({ hasText: "Hermes Agent" }),
    ).toBeVisible();
  });

  test("filter bar hides while Pagefind search has a query", async ({
    page,
  }) => {
    await expect(page.locator(".catalog-search-input")).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.locator(".catalog-filter")).toBeVisible();
    await page.locator(".catalog-search-input").fill("hermes");
    await expect(page.locator(".catalog-filter")).toBeHidden();
    await page.locator(".catalog-search-input").fill("");
    await expect(page.locator(".catalog-filter")).toBeVisible();
  });

  test("li.catalog-list-item carries data-category and data-tags", async ({
    page,
  }) => {
    const li = page.locator(".catalog-list-item").first();
    await expect(li).toHaveAttribute("data-category", /(tool|mcp|concept|comparison)/);
    const tagsAttr = await li.getAttribute("data-tags");
    expect(tagsAttr).toBeTruthy();
    // Should be space-delimited tokens.
    expect(tagsAttr!.split(" ").length).toBeGreaterThan(0);
  });
});
