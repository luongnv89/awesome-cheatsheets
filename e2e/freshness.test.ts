import { test, expect } from "@playwright/test";

test.describe("Freshness UX", () => {
  test("freshness chip shows absolute and relative date", async ({ page }) => {
    await page.goto("e2e/fresh/");
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
    await page.goto("e2e/fresh/");
    await expect(page.locator(".stale-banner")).not.toBeVisible();
  });

  test("stale banner has WCAG AA compliant color contrast", async ({
    page,
  }) => {
    await page.goto("e2e/stale/");
    const banner = page.locator(".stale-banner");
    await expect(banner).toBeVisible();
    const contrast = await banner.evaluate((el) => {
      const style = getComputedStyle(el);
      const parse = (s: string) => {
        const m = s.match(/\d+(\.\d+)?/g);
        return m ? m.slice(0, 3).map(Number) : [0, 0, 0];
      };
      const toLinear = (c: number) => {
        const v = c / 255;
        return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
      };
      const luminance = ([r, g, b]: number[]) =>
        0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
      const bg = parse(style.backgroundColor);
      const fg = parse(style.color);
      const l1 = luminance(bg);
      const l2 = luminance(fg);
      const [light, dark] = l1 > l2 ? [l1, l2] : [l2, l1];
      return (light + 0.05) / (dark + 0.05);
    });
    expect(contrast).toBeGreaterThanOrEqual(4.5);
  });
});