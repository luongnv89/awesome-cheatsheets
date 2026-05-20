import { test, expect } from "@playwright/test";

/**
 * Catalog / landing page (`/awesome-cheatsheets/`) — issue #20.
 *
 * Verifies the catalog is rendered from the `cheatsheets` content collection
 * (not hard-coded), shows the wedge framing, and links to the detail page
 * honoring the configured `base: '/awesome-cheatsheets'`.
 *
 * Catalog tests intentionally use `.catalog-*` selectors so they remain
 * disjoint from `.freshness-chip` / `.stale-banner` (which the detail-page
 * tests in `freshness.test.ts` own).
 */
test.describe("Catalog landing page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("./");
  });

  test("renders the hero with the wedge framing", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "Awesome AI Cheatsheets", level: 1 }),
    ).toBeVisible();
    await expect(page.locator(".catalog-hero-lede")).toContainText(
      "format + freshness + comparability",
    );
  });

  test("lists at least one cheatsheet card", async ({ page }) => {
    const cards = page.locator(".catalog-card");
    await expect(cards.first()).toBeVisible();
    expect(await cards.count()).toBeGreaterThanOrEqual(1);
  });

  test("renders the Hermes Agent row with title + category + tags + date", async ({
    page,
  }) => {
    const card = page
      .locator(".catalog-card")
      .filter({ hasText: "Hermes Agent" });
    await expect(card).toBeVisible();

    await expect(card.locator(".catalog-card-title")).toContainText("Hermes Agent");
    await expect(card.locator(".catalog-category")).toContainText(/tool/i);
    await expect(card.locator(".catalog-tags")).toBeVisible();
    await expect(card.locator(".catalog-tag").first()).toBeVisible();
    await expect(card.locator(".catalog-last-updated")).toContainText(
      /\d{4}-\d{2}-\d{2}/,
    );
  });

  test("Hermes card links to the detail page honoring the base path", async ({
    page,
  }) => {
    const link = page
      .locator(".catalog-card")
      .filter({ hasText: "Hermes Agent" })
      .locator("a.catalog-card-link");
    const href = await link.getAttribute("href");
    expect(href).toBe("/awesome-cheatsheets/cheatsheets/hermes-agent/");
  });

  test("does not leak detail-page selectors onto the catalog", async ({
    page,
  }) => {
    // `.freshness-chip` and `.stale-banner` are owned by the detail page
    // (asserted in `freshness.test.ts`). The catalog uses `.catalog-*` only.
    await expect(page.locator(".freshness-chip")).toHaveCount(0);
    await expect(page.locator(".stale-banner")).toHaveCount(0);
  });
});

/**
 * Catalog is a centered 1180px container with a 1→2→3 responsive grid.
 * Header and footer share the same 1180px cap from Layout.astro.
 */
test.describe("Centered responsive grid", () => {
  const cardSelector = ".catalog-card";

  async function visibleColumns(page: import("@playwright/test").Page) {
    // Group cards by their bounding-box `y` coordinate (rounded) — every card
    // in the same row shares a `y`. The largest row size is the column count.
    const ys = await page.locator(cardSelector).evaluateAll((els) =>
      els.map((el) => Math.round((el as HTMLElement).getBoundingClientRect().top)),
    );
    const counts = new Map<number, number>();
    for (const y of ys) counts.set(y, (counts.get(y) ?? 0) + 1);
    return Math.max(...counts.values());
  }

  test("renders 3 columns at large viewport (≥1024px)", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("./");
    await expect(page.locator(cardSelector).first()).toBeVisible();
    expect(await visibleColumns(page)).toBe(3);
  });

  test("renders 2 columns at medium viewport (640px–1023px)", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 800, height: 900 });
    await page.goto("./");
    await expect(page.locator(cardSelector).first()).toBeVisible();
    expect(await visibleColumns(page)).toBe(2);
  });

  test("renders 1 column at small viewport (<640px)", async ({ page }) => {
    await page.setViewportSize({ width: 480, height: 900 });
    await page.goto("./");
    await expect(page.locator(cardSelector).first()).toBeVisible();
    expect(await visibleColumns(page)).toBe(1);
  });

  test("catalog main stays within its centered 1180px container at wide viewports", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1600, height: 900 });
    await page.goto("./");
    const main = page.locator(".catalog-main");
    await expect(main).toBeVisible();
    const width = await main.evaluate(
      (el) => (el as HTMLElement).getBoundingClientRect().width,
    );
    expect(width).toBeLessThanOrEqual(1180);
  });

  test("header keeps its centered 1180px container", async ({ page }) => {
    await page.setViewportSize({ width: 1600, height: 900 });
    await page.goto("./");
    const headerInner = page.locator(".site-header-inner");
    await expect(headerInner).toBeVisible();
    const width = await headerInner.evaluate(
      (el) => (el as HTMLElement).getBoundingClientRect().width,
    );
    // Header inner stays within its declared max-width (1180px).
    expect(width).toBeLessThanOrEqual(1180);
  });
});
