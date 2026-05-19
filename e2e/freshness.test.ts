import { test, expect } from "@playwright/test";

test.describe("Freshness UX", () => {
  test("freshness chip shows absolute and relative date", async ({ page }) => {
    await page.goto("cheatsheets/hermes-agent/");
    await expect(page.locator(".freshness-chip")).toBeVisible();
    await expect(page.locator(".absolute-date")).toContainText(/\d{4}-\d{2}-\d{2}/);
    await expect(page.locator(".relative-date")).toContainText(/\(.+\)/);
  });

  test("stale banner renders when last_updated is past threshold", async ({
    page,
  }) => {
    await page.goto("e2e/stale/");
    const banner = page.locator(".stale-banner");
    await expect(banner).toBeVisible();
    await expect(banner).toHaveAttribute("role", "alert");
    await expect(banner).toContainText("may be stale");
    await expect(banner).toContainText("2020-01-01");
  });

  test("no stale banner when last_updated is recent", async ({ page }) => {
    await page.goto("cheatsheets/hermes-agent/");
    await expect(page.locator(".stale-banner")).not.toBeVisible();
  });

  test("stale banner has WCAG AA compliant color contrast", async ({
    page,
  }) => {
    await page.goto("e2e/stale/");
    const banner = page.locator(".stale-banner");
    await expect(banner).toBeVisible();
    const bgColor = await banner.evaluate((el) =>
      getComputedStyle(el).backgroundColor,
    );
    const textColor = await banner.evaluate((el) =>
      getComputedStyle(el).color,
    );
    expect(bgColor).toMatch(/(245|254),\s*(243|252),\s*(199|223)/);
    expect(textColor).toMatch(/(146|137),\s*(64|68),\s*(14)/);
  });
});