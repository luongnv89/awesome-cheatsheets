import { test, expect } from "@playwright/test";

/**
 * Mermaid render check (issue #205).
 *
 * `MermaidLoader.astro` lazy-imports mermaid on the client and replaces each
 * `<div class="mermaid">` source block with an SVG. The dependency upgrade
 * (astro 7.4, mermaid 12.2, dompurify 3.4.17) touches every layer of that
 * path, and the build alone can't prove the diagram still draws, so this spec
 * waits for the SVG in a real browser.
 *
 * Relative `page.goto()` resolves against the `/awesome-cheatsheets/` base
 * URL in `playwright.config.ts`. The route is a real published entry whose
 * Step 1 holds a funnel flowchart.
 */
const ROUTE = "cheatsheets/app-store-marketing/";

test.describe("Mermaid diagrams", () => {
  test("funnel flowchart renders as an SVG", async ({ page }) => {
    await page.goto(ROUTE);

    // The library is ~3 MB and loads after the page, so allow time for it.
    const svg = page.locator(".mermaid svg").first();
    await expect(svg).toBeVisible({ timeout: 20_000 });

    // A drawn diagram carries the node labels; a failed render shows
    // mermaid's error graphic instead.
    await expect(svg).toContainText("Impressions");
    await expect(svg).toContainText("Recommends");
    await expect(svg).not.toContainText("Syntax error");

    const box = await svg.boundingBox();
    expect(box?.width ?? 0).toBeGreaterThan(0);
    expect(box?.height ?? 0).toBeGreaterThan(0);
  });
});
