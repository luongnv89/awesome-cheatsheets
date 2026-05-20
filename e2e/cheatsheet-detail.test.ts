import { test, expect } from "@playwright/test";

/**
 * Cheatsheet detail page — centered article container.
 *
 * `.cheatsheet-main` is capped at 1180px to match the site header, footer,
 * and catalog containers, keeping a comfortable reading width on wide
 * screens instead of stretching edge-to-edge.
 */
test.describe("Cheatsheet detail page — centered article", () => {
  test("article is capped at 1180px on wide viewports", async ({ page }) => {
    await page.setViewportSize({ width: 1600, height: 900 });
    await page.goto("e2e/fresh/");
    const main = page.locator(".cheatsheet-main");
    await expect(main).toBeVisible();
    const width = await main.evaluate(
      (el) => (el as HTMLElement).getBoundingClientRect().width,
    );
    expect(width).toBeLessThanOrEqual(1180);
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
   * Single-flow reading layout — issue #92.
   *
   * The body is a single top-to-bottom column at every viewport so
   * sequential content (Step 1 / Step 2 / Step 3) stays visually adjacent.
   * On wide viewports the horizontal space is used by a sticky table of
   * contents in `.cheatsheet-toc`, not a second body column.
   *
   * These tests assert the *absence* of newspaper columns at every breakpoint
   * (computed style `column-count: auto`) and the *presence* of the TOC aside
   * on wide viewports.
   */
  const CHEATSHEET_ROUTE = "cheatsheets/hermes-agent/";

  test("body uses a single column at mobile viewport (<1024px)", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 800, height: 900 });
    await page.goto(CHEATSHEET_ROUTE);
    const body = page.locator(".cheatsheet-body");
    await expect(body).toBeVisible();
    const columnCount = await body.evaluate(
      (el) => getComputedStyle(el as HTMLElement).columnCount,
    );
    expect(columnCount).toBe("auto");
  });

  test("body uses a single column at desktop viewport (1280px)", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(CHEATSHEET_ROUTE);
    const body = page.locator(".cheatsheet-body");
    await expect(body).toBeVisible();
    const columnCount = await body.evaluate(
      (el) => getComputedStyle(el as HTMLElement).columnCount,
    );
    expect(columnCount).toBe("auto");
  });

  test("body uses a single column at ultrawide viewport (≥1600px)", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1600, height: 900 });
    await page.goto(CHEATSHEET_ROUTE);
    const body = page.locator(".cheatsheet-body");
    await expect(body).toBeVisible();
    const columnCount = await body.evaluate(
      (el) => getComputedStyle(el as HTMLElement).columnCount,
    );
    expect(columnCount).toBe("auto");
  });

  /**
   * TOC aside — issue #92.
   *
   * Built client-side from the article's h2 headings. Hidden on viewports
   * below 1024px (single-column body uses the full width on tablet/mobile),
   * visible alongside the body at ≥1024px.
   */
  test("TOC aside is visible at desktop viewport (≥1024px)", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(CHEATSHEET_ROUTE);
    const toc = page.locator(".cheatsheet-toc");
    await expect(toc).toBeVisible();
    const links = page.locator(".cheatsheet-toc-link");
    // Hermes Agent has many h2 sections — the TOC should reflect at least
    // a couple of them.
    expect(await links.count()).toBeGreaterThanOrEqual(2);
  });

  test("TOC aside is hidden at mobile viewport (<1024px)", async ({ page }) => {
    await page.setViewportSize({ width: 800, height: 900 });
    await page.goto(CHEATSHEET_ROUTE);
    const toc = page.locator(".cheatsheet-toc");
    await expect(toc).toBeHidden();
  });
});

/**
 * Sticky title — issue #91.
 *
 * The cheatsheet's title stays visible at the top of the viewport once the
 * user has scrolled past the full in-flow header. The compact band must be
 * invisible at the top of the page (no double-up with the hero title) and
 * become visible after scrolling.
 */
test.describe("Cheatsheet detail page — sticky title", () => {
  const CHEATSHEET_ROUTE = "cheatsheets/hermes-agent/";

  test("sticky title is hidden at top of page", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(CHEATSHEET_ROUTE);
    const sticky = page.locator(".cheatsheet-sticky-header");
    // Element is in the DOM but visually hidden (opacity 0).
    const opacity = await sticky.evaluate(
      (el) => getComputedStyle(el as HTMLElement).opacity,
    );
    expect(parseFloat(opacity)).toBeLessThan(0.5);
    await expect(sticky).toHaveAttribute("aria-hidden", "true");
  });

  test("sticky title becomes visible after scrolling past in-flow header", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(CHEATSHEET_ROUTE);
    // Scroll far enough that the in-flow header is well above the fold.
    await page.evaluate(() => window.scrollTo({ top: 1200, behavior: "instant" as ScrollBehavior }));
    // IntersectionObserver fires on the next animation frame — give it a beat.
    await page.waitForFunction(
      () =>
        document
          .querySelector(".cheatsheet-sticky-header")
          ?.classList.contains("is-active") === true,
      undefined,
      { timeout: 2000 },
    );
    const sticky = page.locator(".cheatsheet-sticky-header");
    await expect(sticky).toHaveClass(/is-active/);
    await expect(sticky).toHaveAttribute("aria-hidden", "false");
    await expect(sticky.locator(".cheatsheet-sticky-title")).toContainText(
      "Hermes Agent",
    );
  });

  test("sticky title shows cheatsheet name in compact band", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(CHEATSHEET_ROUTE);
    const compactTitle = page.locator(".cheatsheet-sticky-title");
    await expect(compactTitle).toContainText("Hermes Agent");
  });

  test("sticky title is compact on mobile viewport (375px)", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto(CHEATSHEET_ROUTE);
    await page.evaluate(() => window.scrollTo({ top: 800, behavior: "instant" as ScrollBehavior }));
    await page.waitForFunction(
      () =>
        document
          .querySelector(".cheatsheet-sticky-header")
          ?.classList.contains("is-active") === true,
      undefined,
      { timeout: 2000 },
    );
    const sticky = page.locator(".cheatsheet-sticky-header");
    // Band should be visually slim (under 60px) so it doesn't dominate the
    // mobile viewport — AC #91.3.
    const height = await sticky.evaluate(
      (el) => (el as HTMLElement).getBoundingClientRect().height,
    );
    expect(height).toBeLessThan(60);
    // Section indicator is hidden below 640px to keep the band slim.
    const sectionIndicator = sticky.locator(".cheatsheet-sticky-section");
    await expect(sectionIndicator).toBeHidden();
  });
});
