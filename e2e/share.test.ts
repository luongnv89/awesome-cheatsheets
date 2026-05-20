import { test, expect } from "@playwright/test";

/**
 * Share buttons — rendered on every cheatsheet detail page.
 *
 * Tests verify:
 *  - The share button row appears on a cheatsheet page
 *  - All three platforms (X, LinkedIn, Facebook) have buttons with
 *    correct aria-labels and href patterns
 *  - The Facebook button carries the `data-share-target` attribute
 *    used by the opt-out interceptor script (issue #83)
 *  - The fallback container exists, is initially hidden, and contains
 *    links to X and LinkedIn as alternatives
 */

const CHEATSHEET_SLUG = "hermes-agent/";
const CHEATSHEET_URL = `cheatsheets/${CHEATSHEET_SLUG}`;

test.describe("Share buttons", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(CHEATSHEET_URL);
  });

  test("renders a share button group on the cheatsheet page", async ({
    page,
  }) => {
    const group = page.locator('[role="group"][aria-label="Share this cheatsheet"]');
    await expect(group).toBeVisible();
  });

  test("renders X (Twitter) share button with correct href pattern", async ({
    page,
  }) => {
    const xBtn = page.getByRole("link", { name: "Share on X (Twitter)" });
    await expect(xBtn).toBeVisible();
    const href = await xBtn.getAttribute("href");
    expect(href).toContain("x.com/intent/tweet");
  });

  test("renders LinkedIn share button with correct href pattern", async ({
    page,
  }) => {
    const liBtn = page.getByRole("link", { name: "Share on LinkedIn" });
    await expect(liBtn).toBeVisible();
    const href = await liBtn.getAttribute("href");
    expect(href).toContain("linkedin.com/sharing/share-offsite");
  });

  test("renders Facebook share button with data-share-target attribute", async ({
    page,
  }) => {
    const fbBtn = page.getByRole("link", { name: "Share on Facebook" });
    await expect(fbBtn).toBeVisible();
    const href = await fbBtn.getAttribute("href");
    expect(href).toContain("facebook.com/sharer/sharer.php");
    const target = await fbBtn.getAttribute("data-share-target");
    expect(target).toBe("facebook");
  });

  test("Facebook button opens in a new tab", async ({ page }) => {
    const fbBtn = page.getByRole("link", { name: "Share on Facebook" });
    const target = await fbBtn.getAttribute("target");
    expect(target).toBe("_blank");
    const rel = await fbBtn.getAttribute("rel");
    expect(rel).toContain("noopener");
    expect(rel).toContain("noreferrer");
  });

  test("fallback container exists and is initially hidden", async ({
    page,
  }) => {
    const fallback = page.locator(".share-fallback");
    await expect(fallback).toHaveCount(1);
    await expect(fallback).toBeHidden();
  });

  test("fallback contains links to X and LinkedIn alternatives", async ({
    page,
  }) => {
    const fallback = page.locator(".share-fallback");
    // The fallback text should mention both alternatives
    await expect(fallback).toContainText("X");
    await expect(fallback).toContainText("LinkedIn");
  });

  test("fallback has aria-live for screen-reader announcements", async ({
    page,
  }) => {
    const fallback = page.locator(".share-fallback");
    const role = await fallback.getAttribute("role");
    expect(role).toBe("status");
    const live = await fallback.getAttribute("aria-live");
    expect(live).toBe("polite");
  });
});
