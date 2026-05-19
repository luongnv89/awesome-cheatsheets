import { test, expect } from "@playwright/test";

/**
 * Chrome pages — `/404` and `/about` (issue #27).
 *
 * Both pages live outside the cheatsheets content collection and use the base
 * `Layout.astro` rather than `CheatsheetLayout.astro`. The tests verify:
 *  - The 404 page renders on an unknown route (Astro emits `dist/404.html`,
 *    which the Astro preview server serves for any unmatched URL).
 *  - The about page cites the wedge ("format + freshness + comparability").
 *  - Both pages have exactly one `<h1>` (accessibility baseline).
 *  - Both pages link back to the catalog using the configured base path.
 *  - Both pages use semantic landmarks (`<main>`) for screen-reader users.
 *
 * Playwright's `baseURL` is set to `http://localhost:4321/awesome-cheatsheets/`
 * (see `playwright.config.ts`), so relative `page.goto("about/")` resolves to
 * `/awesome-cheatsheets/about/`, exercising the production base path.
 */

const EXPECTED_CATALOG_HREF = "/awesome-cheatsheets/";

test.describe("About page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("about/");
  });

  test("renders with a single h1 and the page title", async ({ page }) => {
    await expect(page).toHaveTitle(/About.*Awesome AI Cheatsheets/);
    const h1 = page.locator("h1");
    await expect(h1).toHaveCount(1);
    await expect(h1).toContainText(/About this project/);
  });

  test("cites the wedge: format + freshness + comparability", async ({
    page,
  }) => {
    await expect(page.locator(".catalog-hero-lede")).toContainText(
      "format + freshness + comparability",
    );
  });

  test("explains each pillar in the wedge section", async ({ page }) => {
    const wedgeSection = page.locator("section").filter({
      has: page.locator("#about-wedge"),
    });
    await expect(wedgeSection).toContainText(/Format\./);
    await expect(wedgeSection).toContainText(/Freshness\./);
    await expect(wedgeSection).toContainText(/Comparability\./);
  });

  test("links to the contributor tutorial", async ({ page }) => {
    const link = page.getByRole("link", {
      name: /contributor tutorial/i,
    }).first();
    await expect(link).toBeVisible();
    const href = await link.getAttribute("href");
    expect(href).toMatch(/docs\/contributing\.md/);
  });

  test("links to the GitHub source repository", async ({ page }) => {
    const link = page.getByRole("link", {
      name: /source repository on GitHub/i,
    });
    const href = await link.getAttribute("href");
    expect(href).toBe("https://github.com/luongnv89/awesome-cheatsheets");
  });

  test("links back to the catalog with the base path", async ({ page }) => {
    const link = page.getByRole("link", { name: /back to the catalog/i });
    await expect(link).toBeVisible();
    const href = await link.getAttribute("href");
    expect(href).toBe(EXPECTED_CATALOG_HREF);
  });

  test("uses a main landmark for screen-reader navigation", async ({
    page,
  }) => {
    await expect(page.locator("main")).toHaveCount(1);
  });
});

test.describe("404 page", () => {
  test.beforeEach(async ({ page }) => {
    // Astro's preview server serves `dist/404.html` for unmatched routes; in
    // production GitHub Pages does the same. The status code is 404, so we
    // explicitly accept it instead of failing on the default goto contract.
    const response = await page.goto(
      "cheatsheets/this-slug-does-not-exist/",
      { waitUntil: "domcontentloaded" },
    );
    // Some preview servers return 200 with the 404 page body; we tolerate
    // both as long as the page renders the not-found chrome.
    expect([200, 404]).toContain(response?.status() ?? 0);
  });

  test("renders the not-found heading", async ({ page }) => {
    const h1 = page.locator("h1");
    await expect(h1).toHaveCount(1);
    await expect(h1).toContainText(/Page not found/);
  });

  test("page title signals the not-found state", async ({ page }) => {
    await expect(page).toHaveTitle(/Page not found/);
  });

  test("links back to the catalog with the base path", async ({ page }) => {
    const link = page.getByRole("link", { name: /Browse all cheatsheets/i });
    await expect(link).toBeVisible();
    const href = await link.getAttribute("href");
    expect(href).toBe(EXPECTED_CATALOG_HREF);
  });

  test("links to the about page with the base path", async ({ page }) => {
    const link = page.getByRole("link", { name: /About this project/i });
    await expect(link).toBeVisible();
    const href = await link.getAttribute("href");
    expect(href).toBe("/awesome-cheatsheets/about/");
  });

  test("uses a main landmark for screen-reader navigation", async ({
    page,
  }) => {
    await expect(page.locator("main")).toHaveCount(1);
  });
});
