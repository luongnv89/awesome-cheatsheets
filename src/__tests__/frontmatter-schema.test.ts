/**
 * Characterization tests for the shared cheatsheet frontmatter schema in
 * `src/content/config.ts` — the Zod schema every entry under
 * `src/content/cheatsheets/` is validated against at build time.
 *
 * `astro:content` is a virtual module, so `vitest.config.ts` aliases it to
 * `src/__tests__/stubs/astro-content.ts`, which re-exports the project's zod
 * and returns the `defineCollection` config unchanged — making
 * `collections.cheatsheets.schema` reachable here.
 *
 * Fixtures live in `src/__tests__/fixtures/`; the last block also sweeps every
 * real published cheatsheet's YAML frontmatter through the schema so a schema
 * change that would break existing content fails here first.
 */
import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";
import { parse as parseYaml } from "yaml";

import { collections } from "../content/config.js";

const schema = collections.cheatsheets.schema;

const testsDir = import.meta.dirname;
const fixture = (name: string): unknown =>
  JSON.parse(readFileSync(resolve(testsDir, "fixtures", name), "utf8"));

const validFixture = () => fixture("valid-frontmatter.json") as Record<string, unknown>;

describe("cheatsheets collection schema — valid fixtures", () => {
  it("accepts a fully-populated frontmatter fixture", () => {
    const result = schema.safeParse(validFixture());
    expect(result.success).toBe(true);
  });

  it("defaults status to 'published' when omitted", () => {
    const result = schema.safeParse(validFixture());
    expect(result.success).toBe(true);
    expect(result.data.status).toBe("published");
  });

  it("accepts a Date for last_updated and normalizes it to YYYY-MM-DD", () => {
    // YAML resolves unquoted dates (`last_updated: 2026-05-19`) to Date
    // objects — the schema must accept that and emit the string form.
    const result = schema.safeParse({
      ...validFixture(),
      last_updated: new Date(Date.UTC(2026, 0, 5)),
    });
    expect(result.success).toBe(true);
    expect(result.data.last_updated).toBe("2026-01-05");
  });

  it("strips unknown keys such as slug instead of failing", () => {
    // Published cheatsheets carry `slug` in frontmatter, but the collection
    // schema intentionally omits it (Astro derives the entry id from the
    // file path). Zod's default object mode strips unknown keys.
    const result = schema.safeParse({ ...validFixture(), slug: "example-tool" });
    expect(result.success).toBe(true);
    expect("slug" in result.data).toBe(false);
  });
});

describe("cheatsheets collection schema — invalid fixtures", () => {
  it("rejects the invalid fixture with an issue per broken field", () => {
    const result = schema.safeParse(fixture("invalid-frontmatter.json"));
    expect(result.success).toBe(false);
    const paths = result.error.issues.map((issue) => issue.path[0]);
    for (const field of [
      "title",
      "category",
      "summary",
      "last_updated",
      "stale_after_days",
      "tags",
      "status",
      "authors",
      "links",
    ]) {
      expect(paths).toContain(field);
    }
  });

  it.each([
    ["empty title", { title: "" }],
    ["unknown category", { category: "framework" }],
    ["summary under 20 chars", { summary: "too short" }],
    ["summary over 400 chars", { summary: "x".repeat(401) }],
    ["non-ISO last_updated", { last_updated: "09/01/2026" }],
    ["stale_after_days of 0", { stale_after_days: 0 }],
    ["stale_after_days over 730", { stale_after_days: 731 }],
    ["non-integer stale_after_days", { stale_after_days: 90.5 }],
    ["empty tags array", { tags: [] }],
    ["non-kebab-case tag", { tags: ["Has_Caps"] }],
    ["more than 12 tags", { tags: Array.from({ length: 13 }, (_, i) => `tag-${i}`) }],
    ["unknown status", { status: "archived" }],
    ["empty author name", { authors: [{ name: "" }] }],
    ["non-URL homepage", { links: { homepage: "not-a-url" } }],
    [
      "non-URL catchall link",
      { links: { homepage: "https://example.com", docs: "example.com/docs" } },
    ],
  ])("rejects %s", (_label, patch) => {
    const result = schema.safeParse({ ...validFixture(), ...patch });
    expect(result.success).toBe(false);
  });
});

describe("cheatsheets collection schema — published content sweep", () => {
  const cheatsheetsDir = resolve(testsDir, "../content/cheatsheets");
  const slugs = readdirSync(cheatsheetsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  const frontmatterOf = (slug: string): unknown =>
    parseYaml(
      readFileSync(resolve(cheatsheetsDir, slug, `${slug}.md`), "utf8").split(
        /^---$/m,
      )[1] ?? "",
    );

  it("finds at least one published cheatsheet to sweep", () => {
    expect(slugs.length).toBeGreaterThan(0);
  });

  it.each(slugs)("'%s' frontmatter satisfies the schema", (slug) => {
    const result = schema.safeParse(frontmatterOf(slug));
    expect(
      result.success,
      result.success ? "" : JSON.stringify(result.error.issues, null, 2),
    ).toBe(true);
    if (result.success) {
      // The isoDate transform must always land on the string form.
      expect(result.data.last_updated).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
});
