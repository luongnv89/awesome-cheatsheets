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
