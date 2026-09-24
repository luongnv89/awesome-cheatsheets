/**
 * Drift test: ensures cheatsheet-scribe skill's section list matches template-contract.
 *
 * This test fails if SKILL.md's documented sections diverge from template-contract.md.
 * @see issue #10
 */

import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, it, expect } from "vitest";

import { REQUIRED_SECTIONS } from "../../template-contract.js";

const REPO_ROOT = join(import.meta.dirname, "..", "..", "..");
// skills/ is the canonical tree; .claude/skills/ and .agents/skills/ are
// generated mirrors (pnpm skills:sync — see issue #136).
const SKILL_PATH = join(REPO_ROOT, "skills/cheatsheet-scribe", "SKILL.md");

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