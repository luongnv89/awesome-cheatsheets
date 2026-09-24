/**
 * @vitest-environment jsdom
 *
 * Unit tests for `filter-pills-client.ts` — the zero-match empty-state
 * contract added for issue #142 (F-UX-001 / F-UX-002). The module is pure
 * client-side, so jsdom supplies `document`, `window`, and `history`
 * (`?category=` / `?tag=` URL state via `history.replaceState`). The wider
 * markup contract is covered end-to-end in `e2e/filters.test.ts`.
 */
import { describe, expect, it } from "vitest";

import { initCatalogFilter } from "../filter-pills-client";

const FIXTURE = `
  <input class="catalog-search-input" type="search" />
  <div class="catalog-filter">
    <button type="button" class="catalog-filter-pill"
      data-filter-axis="category" data-filter-value="tool"
      aria-pressed="false">tool</button>
    <button type="button" class="catalog-filter-pill"
      data-filter-axis="tag" data-filter-value="mcp"
      aria-pressed="false">mcp</button>
    <div class="catalog-filter-controls">
      <button type="button" class="catalog-filter-clear" data-filter-clear hidden>
        Clear filters
      </button>
      <p class="catalog-filter-status"></p>
    </div>
  </div>
  <ul class="catalog-list">
    <li class="catalog-list-item" data-category="tool" data-tags="mcp cli"></li>
    <li class="catalog-list-item" data-category="tool" data-tags="cli"></li>
  </ul>
  <div class="catalog-filter-empty" hidden>
    <p class="catalog-filter-empty-text">
      No cheatsheets match the selected filters.
    </p>
    <button type="button" class="catalog-filter-empty-clear" data-filter-clear hidden>
      Clear filters
    </button>
  </div>
`;

/** Mount the fixture under a given query string and wire the client. */
function mount(search = ""): void {
  window.history.replaceState(null, "", `/${search}`);
  document.body.innerHTML = FIXTURE;
  initCatalogFilter();
}

function emptyEl(): HTMLElement {
  return document.querySelector<HTMLElement>(".catalog-filter-empty")!;
}

function searchInput(): HTMLInputElement {
  return document.querySelector<HTMLInputElement>(".catalog-search-input")!;
}

function visibleItems(): HTMLElement[] {
  return Array.from(
    document.querySelectorAll<HTMLElement>(".catalog-list-item"),
  ).filter((item) => !item.hidden);
}

describe("initCatalogFilter — zero-match empty state (issue #142)", () => {
  it("reveals .catalog-filter-empty when active filters match zero cards", () => {
    mount("?tag=zzz-not-real");

    expect(emptyEl().hidden).toBe(false);
    expect(visibleItems()).toHaveLength(0);
    const status = document.querySelector(".catalog-filter-status")!;
    expect(status.textContent).toBe("0 cheatsheets match.");
    // Every Clear filters affordance is usable while a filter is active.
    for (const btn of document.querySelectorAll<HTMLButtonElement>(
      "[data-filter-clear]",
    )) {
      expect(btn.hidden).toBe(false);
    }
  });

  it("keeps the empty state hidden when filters match at least one card", () => {
    mount("?tag=mcp");

    expect(emptyEl().hidden).toBe(true);
    expect(visibleItems().length).toBeGreaterThan(0);
  });

  it("keeps the empty state hidden when no filters are active", () => {
    mount();

    expect(emptyEl().hidden).toBe(true);
    expect(visibleItems()).toHaveLength(2);
  });

  it("empty-state Clear filters button resets pills, URL, and grid", () => {
    mount("?tag=zzz-not-real");

    const btn = emptyEl().querySelector<HTMLButtonElement>(
      ".catalog-filter-empty-clear",
    )!;
    btn.click();

    expect(emptyEl().hidden).toBe(true);
    expect(visibleItems()).toHaveLength(2);
    expect(window.location.search).toBe("");
    for (const pill of document.querySelectorAll(".catalog-filter-pill")) {
      expect(pill.getAttribute("aria-pressed")).toBe("false");
    }
  });

  it("hides the empty state while a search query is active, restores on clear", () => {
    mount("?tag=zzz-not-real");
    const input = searchInput();
    expect(emptyEl().hidden).toBe(false);

    input.value = "hermes";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    expect(emptyEl().hidden).toBe(true);

    input.value = "";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    // Zero-match filter state is still in the URL, so the empty state returns.
    expect(emptyEl().hidden).toBe(false);
  });
});
