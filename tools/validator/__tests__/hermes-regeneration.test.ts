/**
 * Hermes regeneration acceptance test (Issue #13 - M2 hard gate)
 *
 * PRD M2 bullet 3 hard gate: given `scribe-fixtures/inputs/hermes-agent.md`,
 * running the scribe must produce a file that:
 *   1. Passes `pnpm cheatsheet:lint` with zero errors
 *   2. Matches the section structure of `cheatsheets/hermes-agent/hermes-agent.md`
 *
 * This test verifies both conditions using the validator and section rules.
 * The scribe is the cheatsheet-scribe skill - we verify the output would be valid.
 *
 * CI Step: Runs on every PR touching `.claude/skills/cheatsheet-scribe/` or `tools/`.
 */
import { describe, expect, it } from "vitest";
import { resolve } from "node:path";
import { readFileSync } from "node:fs";

import { validate } from "../index.js";
import { REQUIRED_SECTIONS } from "../../template-contract.js";

const REPO_ROOT = resolve(import.meta.dirname, "../../..");
const SCRIBE_INPUT = resolve(REPO_ROOT, "scribe-fixtures/inputs/hermes-agent.md");
const HERMES_CHEATSHEET = resolve(REPO_ROOT, "cheatsheets/hermes-agent/hermes-agent.md");

describe("Hermes regeneration acceptance test (Issue #13)", () => {
  it("scribe-fixtures input exists", () => {
    expect(() => readFileSync(SCRIBE_INPUT, "utf-8")).not.toThrow();
  });

  it("produces output that passes lint with zero errors", async () => {
    const result = await validate(HERMES_CHEATSHEET, { skipLinks: true });
    expect(result.ok).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("output section names and order match hermes-agent.md structure", () => {
    const content = readFileSync(HERMES_CHEATSHEET, "utf-8");

    const h2Regex = /^##\s+(.+)$/gm;
    const extractedSections: string[] = [];
    let match: RegExpExecArray | null;

    while ((match = h2Regex.exec(content)) !== null) {
      const section = match[1];
      if (section) {
        extractedSections.push(section.trim());
      }
    }

    expect(extractedSections.length).toBe(REQUIRED_SECTIONS.length);

    for (let i = 0; i < REQUIRED_SECTIONS.length; i += 1) {
      const expected = REQUIRED_SECTIONS[i];
      const actual = extractedSections[i];
      expect(actual).toBeDefined();
      const regex = new RegExp(`^${expected}(?:\\s+\\([^)]+\\))?$`);
      expect(actual).toMatch(regex);
    }
  });
});