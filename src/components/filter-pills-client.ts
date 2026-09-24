/**
 * Client-side logic for the catalog filter pills (issue #22; extracted from
 * `FilterPills.astro` for issue #134 / F-CLEAN-002).
 *
 * Pure client-side — no SSR, no network. Reads the URL's `?category=` and
 * `?tag=` params on load, applies them, then registers click handlers that
 * toggle pills, update the URL via `history.replaceState`, and re-filter
 * the `.catalog-list` cards.
 *
 * Multi-select semantics:
 *  - Within an axis (e.g., two tag pills): OR — a card matches if it has
 *    ANY of the selected tags.
 *  - Across axes (category AND tag): AND — a card must match in both axes.
 *
 * Coexistence with Pagefind search:
 *  - When a search query is non-empty, `.catalog-search` hides the static
 *    grid via the `hidden` attribute. We mirror that by hiding the filter
 *    bar itself so it can't be operated against a non-existent grid.
 *  - When the search clears, the grid (and the filter bar) come back, and
 *    the active filters from the URL still apply to the restored grid.
 *
 * Selector names (`catalog-filter-*`, `catalog-list*`, `catalog-search-*`)
 * are the contract with `FilterPills.astro`'s markup and the e2e suite —
 * do not rename without updating both.
 *
 * Empty state (issue #142): when the active filter combination matches zero
 * cards, the `.catalog-filter-empty` block — rendered next to `.catalog-list`
 * in `src/pages/index.astro` — is revealed so the grid area shows a visible
 * message instead of blank space. It carries a second `Clear filters` button
 * (same `data-filter-clear` hook as the in-bar one) and hides again when
 * filters clear, cards match, or a search query takes over the grid.
 */
export function initCatalogFilter(): void {
  const root = document.querySelector<HTMLDivElement>(".catalog-filter");
  const list = document.querySelector<HTMLElement>(".catalog-list");
  const searchInput = document.querySelector<HTMLInputElement>(
    ".catalog-search-input",
  );

  if (root && list) {
    const pills = Array.from(
      root.querySelectorAll<HTMLButtonElement>(".catalog-filter-pill"),
    );
    // Every `data-filter-clear` button in the document shares the reset:
    // the in-bar one rendered by FilterPills.astro and the one inside the
    // `.catalog-filter-empty` block that index.astro renders next to the grid.
    const clearBtns = Array.from(
      document.querySelectorAll<HTMLButtonElement>("[data-filter-clear]"),
    );
    const statusEl = root.querySelector<HTMLParagraphElement>(
      ".catalog-filter-status",
    );
    const emptyEl = document.querySelector<HTMLElement>(
      ".catalog-filter-empty",
    );
    // "+N more" expander for the long tag tail. The hidden pills stay in
    // the DOM (selectors and counts still resolve); only visibility is
    // gated. An active pill outside the visible set is force-shown by
    // `syncPillStates` below.
    const moreBtn = root.querySelector<HTMLButtonElement>(
      ".catalog-filter-more",
    );
    const optionalItems = Array.from(
      root.querySelectorAll<HTMLElement>("li.catalog-filter-optional"),
    );
    function setTagsExpanded(expanded: boolean): void {
      for (const li of optionalItems) li.hidden = !expanded;
      if (moreBtn) {
        moreBtn.setAttribute("aria-expanded", String(expanded));
        const count = moreBtn.dataset.moreCount ?? String(optionalItems.length);
        moreBtn.textContent = expanded ? "Fewer" : `+${count} more`;
      }
    }
    moreBtn?.addEventListener("click", () =>
      setTagsExpanded(moreBtn.getAttribute("aria-expanded") !== "true"),
    );
    const items = Array.from(
      list.querySelectorAll<HTMLElement>(".catalog-list-item"),
    );

    /**
     * Parse a URLSearchParams value into a Set: empty string → empty set;
     * "a,b,c" → {"a","b","c"}. Used for both reading and writing the URL.
     */
    function paramToSet(value: string | null): Set<string> {
      if (!value) return new Set();
      return new Set(
        value
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s.length > 0),
      );
    }

    function setToParam(set: Set<string>): string {
      return Array.from(set).join(",");
    }

    /** Read the URL state at any moment. */
    function readUrl(): {
      categories: Set<string>;
      tags: Set<string>;
    } {
      const params = new URLSearchParams(window.location.search);
      return {
        categories: paramToSet(params.get("category")),
        tags: paramToSet(params.get("tag")),
      };
    }

    /** Push the active filters back into the URL via `replaceState`. */
    function writeUrl(active: {
      categories: Set<string>;
      tags: Set<string>;
    }): void {
      const params = new URLSearchParams(window.location.search);
      if (active.categories.size > 0) {
        params.set("category", setToParam(active.categories));
      } else {
        params.delete("category");
      }
      if (active.tags.size > 0) {
        params.set("tag", setToParam(active.tags));
      } else {
        params.delete("tag");
      }
      const qs = params.toString();
      const url =
        window.location.pathname + (qs ? `?${qs}` : "") + window.location.hash;
      window.history.replaceState(null, "", url);
    }

    /** Update each pill's `aria-pressed` to reflect the active set. */
    function syncPillStates(active: {
      categories: Set<string>;
      tags: Set<string>;
    }): void {
      for (const pill of pills) {
        const axis = pill.dataset.filterAxis;
        const value = pill.dataset.filterValue ?? "";
        const isActive =
          axis === "category"
            ? active.categories.has(value)
            : axis === "tag"
              ? active.tags.has(value)
              : false;
        pill.setAttribute("aria-pressed", isActive ? "true" : "false");
        if (isActive) {
          pill.classList.add("is-active");
          // An active tag outside the top-N set must stay visible — the
          // "+N more" collapse is presentation-only.
          pill.closest("li")?.removeAttribute("hidden");
        } else {
          pill.classList.remove("is-active");
        }
      }
      const anyActive =
        active.categories.size > 0 || active.tags.size > 0;
      for (const btn of clearBtns) btn.hidden = !anyActive;
    }

    /**
     * Show/hide `.catalog-list-item` rows based on active filters.
     * Returns the number of visible items.
     */
    function applyFilter(active: {
      categories: Set<string>;
      tags: Set<string>;
    }): number {
      const filterCategories = active.categories.size > 0;
      const filterTags = active.tags.size > 0;
      let visible = 0;
      for (const item of items) {
        const itemCategory = item.dataset.category ?? "";
        const itemTags = (item.dataset.tags ?? "")
          .split(" ")
          .filter((s) => s.length > 0);
        const categoryMatch =
          !filterCategories || active.categories.has(itemCategory);
        const tagMatch =
          !filterTags || itemTags.some((t) => active.tags.has(t));
        const show = categoryMatch && tagMatch;
        item.hidden = !show;
        if (show) visible += 1;
      }
      if (statusEl) {
        if (!filterCategories && !filterTags) {
          statusEl.textContent = "";
        } else {
          statusEl.textContent = `${visible} cheatsheet${visible === 1 ? "" : "s"} match.`;
        }
      }
      emptyEligible = (filterCategories || filterTags) && visible === 0;
      renderEmptyEl();
      return visible;
    }

    /**
     * Whether the empty-state block should be visible on filter state alone —
     * recomputed by every `applyFilter` call so `syncWithSearch` can re-evaluate
     * visibility when a query appears or clears without re-filtering cards.
     */
    let emptyEligible = false;

    /** True while the search input holds a non-empty query. */
    function isSearchActive(): boolean {
      return searchInput ? searchInput.value.trim().length > 0 : false;
    }

    /**
     * Toggle the `.catalog-filter-empty` block next to the grid (issue #142):
     * visible only when active filters hide every card AND no search query is
     * driving the grid. No-op when the page renders no such element.
     */
    function renderEmptyEl(): void {
      if (!emptyEl) return;
      emptyEl.hidden = !emptyEligible || isSearchActive();
    }

    function refresh(): void {
      const active = readUrl();
      syncPillStates(active);
      applyFilter(active);
    }

    function togglePill(pill: HTMLButtonElement): void {
      const axis = pill.dataset.filterAxis;
      const value = pill.dataset.filterValue ?? "";
      if (!value) return;
      const active = readUrl();
      const target =
        axis === "category"
          ? active.categories
          : axis === "tag"
            ? active.tags
            : null;
      if (!target) return;
      if (target.has(value)) {
        target.delete(value);
      } else {
        target.add(value);
      }
      writeUrl(active);
      syncPillStates(active);
      applyFilter(active);
      root.dispatchEvent(
        new CustomEvent("catalog-filter:changed", {
          detail: {
            categories: Array.from(active.categories),
            tags: Array.from(active.tags),
          },
        }),
      );
    }

    function clearAll(): void {
      const empty = { categories: new Set<string>(), tags: new Set<string>() };
      writeUrl(empty);
      syncPillStates(empty);
      applyFilter(empty);
      root.dispatchEvent(
        new CustomEvent("catalog-filter:changed", {
          detail: { categories: [], tags: [] },
        }),
      );
    }

    for (const pill of pills) {
      pill.addEventListener("click", () => togglePill(pill));
    }
    for (const btn of clearBtns) {
      btn.addEventListener("click", () => clearAll());
    }

    /**
     * Coexistence with Pagefind: when the search input has a non-empty
     * query, hide the filter bar entirely so users don't try to operate it
     * against a hidden grid. When the query clears, restore the bar and
     * re-apply the current filter state.
     */
    function syncWithSearch(): void {
      if (!searchInput) return;
      const hasQuery = searchInput.value.trim().length > 0;
      // The section title is already toggled by the search component.
      root.hidden = hasQuery;
      // The empty-state block lives outside `root`, so hiding the bar does
      // not reach it — it needs its own toggle while a query is active.
      renderEmptyEl();
    }
    if (searchInput) {
      searchInput.addEventListener("input", syncWithSearch);
      syncWithSearch();
    }

    // Reflect URL on initial load (and on history navigation).
    refresh();
    window.addEventListener("popstate", refresh);
  }
}
