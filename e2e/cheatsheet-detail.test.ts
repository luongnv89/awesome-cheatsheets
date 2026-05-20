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
});
