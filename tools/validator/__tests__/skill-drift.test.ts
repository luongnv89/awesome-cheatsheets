/**
 * Drift test: ensures cheatsheet-scribe skill's section list matches template-contract.
 *
 * This test fails if SKILL.md's documented sections diverge from template-contract.md.
 * @see issue #10
 */

import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, it, expect } from "vitest";

const REPO_ROOT = join(import.meta.dirname, "..", "..", "..");
const SKILL_PATH = join(REPO_ROOT, ".claude/skills/cheatsheet-scribe", "SKILL.md");

const REQUIRED_SECTIONS = [
  "Mental Model",
  "Step-by-Step Setup & Optimization",
  "Best Practices",
  "Quick Command Reference",
  "Expected Outcomes",
  "Reference",
];

describe("skill-drift", () => {
  it("SKILL.md section list matches template-contract.md", async () => {
    const skillContent = await readFile(SKILL_PATH, "utf8");

    const sectionListMatch = skillContent.match(
      /Section structure \(locked order\):[\s\S]*?(?=###|$)/,
    );
    expect(sectionListMatch).not.toBeNull();

    const sectionList = sectionListMatch![0];

    for (const required of REQUIRED_SECTIONS) {
      const found = sectionList.includes(required);
      expect(found, `Section "${required}" not found in SKILL.md`).toBe(true);
    }
  });
});