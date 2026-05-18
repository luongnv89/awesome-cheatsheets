/**
 * One-liner rule tests — verify the bolded `**One-line:**` paragraph rule
 * (`ONE_LINER_RULE`).
 */
import { describe, expect, it } from "vitest";
import { resolve } from "node:path";

import { validate } from "../index.js";

const fixture = (name: string): string =>
  resolve(import.meta.dirname, "fixtures", name);

describe("one-liner rule", () => {
  it("passes on the valid fixture", async () => {
    const result = await validate(fixture("valid.md"), { skipLinks: true });
    const oneLinerErrors = result.errors.filter((e) =>
      e.rule.startsWith("one-liner-"),
    );
    expect(oneLinerErrors).toEqual([]);
  });

  it("emits one-liner-missing when the bolded marker is absent", async () => {
    const result = await validate(fixture("no-one-liner.md"), {
      skipLinks: true,
    });
    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => e.rule === "one-liner-missing")).toBe(true);
  });
});
