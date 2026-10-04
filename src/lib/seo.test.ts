/**
 * Unit tests for the SEO URL helpers — the join logic between the deployed
 * origin and Astro's base path, plus JSON-LD script serialization.
 */
import { describe, expect, it } from "vitest";

import { SITE_ORIGIN, absoluteUrl, jsonLdScript, siteBase } from "./seo.js";

describe("siteBase", () => {
  it("strips the trailing slash from an Astro base", () => {
    expect(siteBase("/awesome-cheatsheets/")).toBe("/awesome-cheatsheets");
  });

  it("returns an empty string at the domain root", () => {
    expect(siteBase("/")).toBe("");
  });
});

describe("absoluteUrl", () => {
  it("joins origin, base, and path for a project-path deployment", () => {
    expect(absoluteUrl("/", "/awesome-cheatsheets/")).toBe(
      `${SITE_ORIGIN}/awesome-cheatsheets/`,
    );
    expect(absoluteUrl("/about/", "/awesome-cheatsheets/")).toBe(
      `${SITE_ORIGIN}/awesome-cheatsheets/about/`,
    );
    expect(absoluteUrl("brand/og-card.png", "/awesome-cheatsheets/")).toBe(
      `${SITE_ORIGIN}/awesome-cheatsheets/brand/og-card.png`,
    );
  });

  it("keeps the root URL clean at the domain root", () => {
    expect(absoluteUrl("/", "/")).toBe(`${SITE_ORIGIN}/`);
  });
});

describe("jsonLdScript", () => {
  it("serializes JSON-LD objects", () => {
    expect(jsonLdScript({ "@type": "Thing", name: "x" })).toBe(
      '{"@type":"Thing","name":"x"}',
    );
  });

  it("escapes '<' so content cannot close the script tag early", () => {
    const payload = jsonLdScript({
      name: "</script><script>alert(1)</script>",
    });
    expect(payload).not.toContain("</script>");
    expect(payload).toContain("\\u003c/script");
  });
});
