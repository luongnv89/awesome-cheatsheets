/**
 * Named rule ids emitted by the validator.
 *
 * Each id is kebab-case and corresponds to a concrete check inside one of the
 * `rules/*.ts` modules. The CLI (Task 1.3 / iteration 3) groups errors by
 * rule id when reporting, so the union here is the published surface.
 *
 * @see ./rules/frontmatter.ts
 * @see ./rules/sections.ts
 * @see ./rules/oneLiner.ts
 * @see ./rules/reference.ts
 * @see ./rules/mermaid.ts
 * @see ./rules/links.ts
 */
export const RULE_IDS = [
  // Parse / structural failures detected before any individual rule runs.
  "file-read",
  "markdown-parse",

  // Frontmatter rules — backed by `frontmatterSchema` from template-contract.ts.
  "frontmatter-missing",
  "frontmatter-yaml-invalid",
  "frontmatter-schema",

  // Section structure rules — REQUIRED_SECTIONS + SECTION_MATCH_RULE.
  "section-missing",
  "section-out-of-order",

  // One-liner rule — ONE_LINER_RULE.
  "one-liner-missing",
  "one-liner-too-short",

  // Reference section rule — REFERENCE_RULE.
  "reference-details-missing",

  // Mermaid block rules — MERMAID_RULES.
  "mermaid-missing-in-required-section",
  "mermaid-fence-broken",
  "mermaid-empty",

  // External link rule (AC #5).
  "link-broken",
] as const;

export type RuleId = (typeof RULE_IDS)[number];
