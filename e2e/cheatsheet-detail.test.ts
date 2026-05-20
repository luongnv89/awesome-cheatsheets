import { test, expect } from "@playwright/test";

/**
 * Cheatsheet detail page — full-viewport width.
 *
 * `.cheatsheet-main` previously capped the article at 960px; the redesign
 * drops that cap so dense reference content (tables, code, callouts) can
 * breathe on wide screens. Header/footer keep their own centered 1180px
 * container in `CheatsheetLayout.astro`, so only the article body stretches.
 */
test.describe("Cheatsheet detail page — full-width article", () => {
  test("article expands beyond the legacy 960px cap at wide viewports", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1600, height: 900 });
    await page.goto("e2e/fresh/");
    const main = page.locator(".cheatsheet-main");
    await expect(main).toBeVisible();
    const width = await main.evaluate(
      (el) => (el as HTMLElement).getBoundingClientRect().width,
    );
    expect(width).toBeGreaterThan(1300);
  });

  test("header keeps its centered 1180px container", async ({ page }) => {
    await page.setViewportSize({ width: 1600, height: 900 });
    await page.goto("e2e/fresh/");
    const headerInner = page.locator(".site-header-inner");
    await expect(headerInner).toBeVisible();
    const width = await headerInner.evaluate(
      (el) => (el as HTMLElement).getBoundingClientRect().width,
    );
    expect(width).toBeLessThanOrEqual(1180);
  });

  test("footer keeps its centered 1180px container", async ({ page }) => {
    await page.setViewportSize({ width: 1600, height: 900 });
    await page.goto("e2e/fresh/");
    const footerInner = page.locator(".site-footer-inner");
    await expect(footerInner).toBeVisible();
    const width = await footerInner.evaluate(
      (el) => (el as HTMLElement).getBoundingClientRect().width,
    );
    expect(width).toBeLessThanOrEqual(1180);
  });

  test("article keeps inner padding on small viewports", async ({ page }) => {
    await page.setViewportSize({ width: 480, height: 900 });
    await page.goto("e2e/fresh/");
    const main = page.locator(".cheatsheet-main");
    await expect(main).toBeVisible();
    const padding = await main.evaluate((el) => {
      const cs = getComputedStyle(el as HTMLElement);
      return {
        left: parseFloat(cs.paddingLeft),
        right: parseFloat(cs.paddingRight),
      };
    });
    expect(padding.left).toBeGreaterThan(0);
    expect(padding.right).toBeGreaterThan(0);
  });

  /**
   * Newspaper-column layout — content flows top-to-bottom and wraps into
   * the next column. Column count scales with viewport: 1 / 2 / 3.
   *
   * The multi-column CSS lives in `src/pages/cheatsheets/[slug]/index.astro`
   * (scoped per-route via `is:global`), not the layout. Test against a real
   * cheatsheet route to exercise that stylesheet.
   */
  const CHEATSHEET_ROUTE = "cheatsheets/hermes-agent/";

  test("body uses 1 column at small viewport (<1024px)", async ({ page }) => {
    await page.setViewportSize({ width: 800, height: 900 });
    await page.goto(CHEATSHEET_ROUTE);
    const body = page.locator(".cheatsheet-body");
    await expect(body).toBeVisible();
    const columnCount = await body.evaluate(
      (el) => getComputedStyle(el as HTMLElement).columnCount,
    );
    expect(columnCount).toBe("auto");
  });

  test("body uses 2 columns at desktop viewport (1024–1599px)", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(CHEATSHEET_ROUTE);
    const body = page.locator(".cheatsheet-body");
    await expect(body).toBeVisible();
    const columnCount = await body.evaluate(
      (el) => getComputedStyle(el as HTMLElement).columnCount,
    );
    expect(columnCount).toBe("2");
  });

  test("body uses 3 columns at ultrawide viewport (≥1600px)", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1600, height: 900 });
    await page.goto(CHEATSHEET_ROUTE);
    const body = page.locator(".cheatsheet-body");
    await expect(body).toBeVisible();
    const columnCount = await body.evaluate(
      (el) => getComputedStyle(el as HTMLElement).columnCount,
    );
    expect(columnCount).toBe("3");
  });
});
