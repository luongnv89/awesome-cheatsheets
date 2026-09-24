/**
 * @vitest-environment jsdom
 *
 * Security regression tests for the Pagefind excerpt sink (issue #144,
 * F-SEC-002). `CatalogSearch.astro` renders `hit.excerpt` into a `<p>` via
 * `innerHTML` because Pagefind wraps matched terms in `<mark>` — without a
 * sanitize step any other tag the index carries through would be created
 * live in the DOM (stored XSS from user-contributed cheatsheet content).
 *
 * These tests pin the contract on both layers:
 *  1. `sanitizeExcerpt` keeps `<mark>`/`</mark>` and neutralizes every other
 *     tag-shaped token to visible text — verified against the returned
 *     string AND against the DOM it produces through `innerHTML`.
 *  2. `CatalogSearch.astro` routes `hit.excerpt` through the sanitizer — the
 *     source-level contract that closes the sink (the red assertion before
 *     the fix landed).
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { sanitizeExcerpt } from "../pagefind-excerpt";

const COMPONENT_PATH = resolve(
  process.cwd(),
  "src/components/CatalogSearch.astro",
);

describe("sanitizeExcerpt — mark whitelist (issue #144)", () => {
  it("keeps <mark> and </mark> so highlighting survives", () => {
    expect(sanitizeExcerpt("the <mark>hermes</mark> agent")).toBe(
      "the <mark>hermes</mark> agent",
    );
  });

  it("passes plain text and existing entities through untouched", () => {
    expect(sanitizeExcerpt("a &lt;b&gt; &amp; c")).toBe("a &lt;b&gt; &amp; c");
  });

  it("returns an empty string unchanged", () => {
    expect(sanitizeExcerpt("")).toBe("");
  });

  it("neutralizes script, img/onerror, and anchor tags to literal text", () => {
    expect(
      sanitizeExcerpt(
        '<script>alert(1)</script><img src=x onerror="alert(2)"><a href="javascript:alert(3)">x</a>',
      ),
    ).toBe(
      '&lt;script&gt;alert(1)&lt;/script&gt;&lt;img src=x onerror="alert(2)"&gt;&lt;a href="javascript:alert(3)"&gt;x&lt;/a&gt;',
    );
  });

  it("escapes mark tags carrying attributes but keeps the exact </mark>", () => {
    expect(sanitizeExcerpt('<mark class="evil">hi</mark>')).toBe(
      '&lt;mark class="evil"&gt;hi</mark>',
    );
  });

  it("escapes svg/mathml and self-closing variants", () => {
    expect(sanitizeExcerpt("<svg><animate onbegin=alert(1)/><br/>")).toBe(
      "&lt;svg&gt;&lt;animate onbegin=alert(1)/&gt;&lt;br/&gt;",
    );
  });

  it("escapes a stray < that opens no tag", () => {
    expect(sanitizeExcerpt("a < b and <3")).toBe("a &lt; b and &lt;3");
  });

  it("handles a truncated tag at end of input", () => {
    expect(sanitizeExcerpt("tail <mar")).toBe("tail &lt;mar");
  });

  it("consumes a doubled-up tag opener as one neutralized token", () => {
    expect(sanitizeExcerpt("<<mark>x")).toBe("&lt;&lt;mark&gt;x");
  });
});

describe("sanitizeExcerpt — rendered DOM is inert", () => {
  function render(payload: string): HTMLElement {
    const el = document.createElement("p");
    el.innerHTML = sanitizeExcerpt(payload);
    return el;
  }

  it("creates no script/img/svg/a/iframe elements from a hostile excerpt", () => {
    const el = render(
      'x <script>alert(1)</script><img src=x onerror=alert(2)><svg onload=alert(3)><a href="javascript:alert(4)">y</a><iframe src="//evil"></iframe><mark>hit</mark>',
    );
    expect(
      el.querySelector("script,img,svg,a,iframe,object,embed,video,form"),
    ).toBeNull();
    // The highlight survives as a real <mark> element.
    expect(el.querySelectorAll("mark")).toHaveLength(1);
    expect(el.querySelector("mark")!.textContent).toBe("hit");
  });

  it("neutralized markup renders as visible text, not elements", () => {
    const el = render("<img src=x onerror=alert(1)>");
    expect(el.textContent).toBe("<img src=x onerror=alert(1)>");
    expect(el.querySelector("img")).toBeNull();
  });
});

describe("CatalogSearch.astro — excerpt sink contract (issue #144)", () => {
  const source = readFileSync(COMPONENT_PATH, "utf8");

  it("routes hit.excerpt through sanitizeExcerpt before innerHTML", () => {
    expect(source).toMatch(/innerHTML\s*=\s*sanitizeExcerpt\(hit\.excerpt\)/);
  });

  it("has no raw innerHTML = hit.excerpt assignment left", () => {
    expect(source).not.toMatch(/innerHTML\s*=\s*hit\.excerpt/);
  });
});
