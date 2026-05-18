/**
 * Frontmatter rule tests — exercise the schema-backed rule against passing
 * and failing fixtures.
 *
 * The validator's frontmatter rule emits three named rule ids:
 *  - `frontmatter-missing`       — no YAML block at all
 *  - `frontmatter-yaml-invalid`  — malformed YAML body
 *  - `frontmatter-schema`        — YAML parses but fails the Zod schema
 *
 * AC #6: each rule has both a passing and failing fixture covered.
 */
import { describe, expect, it } from "vitest";
import { resolve } from "node:path";

import { validate } from "../index.js";

const fixture = (name: string): string =>
  resolve(import.meta.dirname, "fixtures", name);

describe("frontmatter rule", () => {
  it("passes on a fully-valid cheatsheet (valid.md)", async () => {
    const result = await validate(fixture("valid.md"), { skipLinks: true });
    const fmErrors = result.errors.filter((e) => e.rule.startsWith("frontmatter"));
    expect(fmErrors).toEqual([]);
  });

  it("passes on the Hermes PoC cheatsheet", async () => {
    const result = await validate(
      resolve(import.meta.dirname, "../../../cheatsheets/hermes-agent/hermes-agent.md"),
      { skipLinks: true },
    );
    const fmErrors = result.errors.filter((e) => e.rule.startsWith("frontmatter"));
    expect(fmErrors).toEqual([]);
  });

  it("emits frontmatter-missing when the YAML block is absent", async () => {
    const result = await validate(fixture("missing-frontmatter.md"), {
      skipLinks: true,
    });
    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => e.rule === "frontmatter-missing")).toBe(true);
  });

  it("emits frontmatter-schema errors for invalid field values", async () => {
    const result = await validate(fixture("bad-frontmatter.md"), {
      skipLinks: true,
    });
    expect(result.ok).toBe(false);
    const schemaErrors = result.errors.filter((e) => e.rule === "frontmatter-schema");
    expect(schemaErrors.length).toBeGreaterThan(0);
    // Path mentions show the schema saw each invalid field.
    const joined = schemaErrors.map((e) => e.message).join("\n");
    expect(joined).toMatch(/slug/);
    expect(joined).toMatch(/title/);
    expect(joined).toMatch(/category/);
    expect(joined).toMatch(/summary/);
    expect(joined).toMatch(/last_updated/);
    expect(joined).toMatch(/stale_after_days/);
    expect(joined).toMatch(/tags/);
    expect(joined).toMatch(/links\.homepage/);
  });
});
