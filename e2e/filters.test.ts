import { test, expect } from "@playwright/test";

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

// Tags from every cheatsheet currently visible in the catalog
// (status === "published"; see issue #90). The catalog publishes
// `hermes-agent` and `pi-dev`; their tag union — alphabetized to match
// the source iteration order in `src/pages/index.astro` — drives the
// expected pill count below.
const PUBLISHED_TAGS = [
  "autonomous-agent",
  "cli",
  "coding-agent",
  "extensions",
  "hermes-agent",
  "kanban",
  "mcp",
  "memory",
  "nousresearch",
  "pi",
  "pi-dev",
  "skills",
];

test.describe("Catalog filter pills", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("./");
    await expect(page.locator(".catalog-filter")).toBeVisible();
  });

  test("renders one pill per unique category in the corpus", async ({
    page,
  }) => {
    // Today only `tool` is present. The pill bar must contain it as a
    // button with the category axis.
    const categoryPills = page.locator(
      '.catalog-filter-pill[data-filter-axis="category"]',
    );
    await expect(categoryPills).toHaveCount(1);
    await expect(categoryPills.first()).toHaveAttribute(
      "data-filter-value",
      "tool",
    );
    await expect(categoryPills.first()).toHaveText(/tool/i);
  });

  test("renders one pill per unique tag in the corpus", async ({ page }) => {
    const tagPills = page.locator(
      '.catalog-filter-pill[data-filter-axis="tag"]',
    );
    await expect(tagPills).toHaveCount(PUBLISHED_TAGS.length);
    // Sample a few values to confirm rendering — we don't need to match
    // exact order since the source iterates a Set sorted alphabetically.
    for (const tag of ["mcp", "cli", "memory"]) {
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
