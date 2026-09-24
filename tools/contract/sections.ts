/**
 * Cheatsheet Template Contract — section structure
 * =================================================
 *
 * The locked ordered list of required H2 sections and the matching rules
 * the validator applies to them: `REQUIRED_SECTIONS`, `SECTION_MATCH_RULE`,
 * `ONE_LINER_RULE`, and `REFERENCE_RULE`. Extracted from
 * `tools/template-contract.ts` (issue #134, F-CLEAN-002) — that module stays
 * the single public entry point and re-exports everything below.
 *
 * @see ../template-contract.ts (single source of truth, public facade)
 * @see ../src/content/cheatsheets/hermes-agent/hermes-agent.md (PoC source)
 */

/**
 * Canonical names of the required top-level (`##`, H2) sections, in the
 * order they must appear. Lifted from the Hermes PoC headings; the Mental
 * Model section was retired and replaced with `Installation` (copy-paste
 * one-line installer + first-run flow).
 *
 * The PoC expands "setup" to "Step-by-Step Setup & Optimization" and adds
 * "Quick Command Reference" and "Expected Outcomes" — those names are part
 * of the locked contract.
 *
 * Note: the "one-liner" is a bolded paragraph (`**One-line:** ...`) above
 * the first H2 — it is not an H2 heading. See {@link ONE_LINER_RULE}.
 *
 * @see ../2026_05_18_awesome_ai_cheatsheets/prd.md §3 M1 (Acceptance: required sections in locked order)
 * @see ../2026_05_18_awesome_ai_cheatsheets/prd.md §3 M4 (locked 8-section structure per page)
 * @see ../src/content/cheatsheets/hermes-agent/hermes-agent.md (PoC source)
 */
export const REQUIRED_SECTIONS = [
  "Installation",
  "Step-by-Step Setup & Optimization",
  "Best Practices",
  "Quick Command Reference",
  "Expected Outcomes",
  "Reference",
] as const;
export type RequiredSection = (typeof REQUIRED_SECTIONS)[number];

/**
 * How the validator should match an H2 heading against a required-section
 * name. A heading conforms if it equals the canonical name OR starts with
 * the canonical name followed by whitespace + an optional `(qualifier)`.
 *
 * Rationale: the Hermes PoC writes `## Expected Outcomes (after Steps 1–5)`
 * — the parenthetical scopes the outcomes to the first five steps. Allowing
 * a free-form parenthetical suffix lets every cheatsheet add lightweight
 * context without breaking the locked section name. The cheatsheet still
 * fails the contract if it renames the section (e.g., `## Results`) or
 * reorders it.
 *
 * @see ../src/content/cheatsheets/hermes-agent/hermes-agent.md (`## Expected Outcomes (after Steps 1–5)`)
 * @see ../2026_05_18_awesome_ai_cheatsheets/prd.md §3 M1 (linter validates required section names)
 */
export const SECTION_MATCH_RULE = {
  /**
   * Build a RegExp that matches the canonical section name optionally
   * followed by a single space and a parenthetical qualifier.
   *
   * Anchored to the whole H2 line (the validator strips the leading `## `
   * before testing).
   */
  toRegExp(canonicalName: string): RegExp {
    const escaped = canonicalName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`^${escaped}(?:\\s+\\([^)]+\\))?$`);
  },
} as const;

/**
 * Rule for the lead "one-liner" paragraph that appears above the first H2.
 *
 * The PoC writes:
 *
 * ```md
 * # Hermes Agent — Optimization Cheatsheet
 *
 * **One-line:** Hermes Agent is NousResearch's self-improving CLI/TUI AI agent ...
 * ```
 *
 * The linter (Task 1.2) must verify a bolded `**One-line:**` prefix exists
 * between the top-level `#` heading and the first `##` heading.
 *
 * @see ../2026_05_18_awesome_ai_cheatsheets/prd.md §3 M1 (required sections include "one-liner")
 * @see ../2026_05_18_awesome_ai_cheatsheets/prd.md §3 M4 (one-liner is part of the locked structure)
 */
export const ONE_LINER_RULE = {
  /** Required bold prefix for the one-liner paragraph. */
  marker: "**One-line:**",
  /** Where the one-liner must appear, relative to other structural elements. */
  position: "after-h1-before-first-h2",
  /**
   * Minimum length of the value following `**One-line:**`. Short enough that
   * a contributor must actually summarize, long enough that "yes" doesn't pass.
   */
  minLength: 20,
} as const;

/**
 * Rule for the collapsed Reference section.
 *
 * The PoC wraps the References body in `<details><summary>Sources & deeper
 * reading</summary> ... </details>`. PRD §3 M4 explicitly requires the
 * References section to be "collapsed by default" — that is implemented as
 * a `<details>` element inside the H2.
 *
 * @see ../2026_05_18_awesome_ai_cheatsheets/prd.md §3 M4 (References collapsed by default)
 */
export const REFERENCE_RULE = {
  /** The H2 name (must match {@link REQUIRED_SECTIONS}). */
  section: "Reference",
  /** Body must contain at least one `<details>` block. */
  requiresDetailsBlock: true,
} as const;
