/**
 * Cheatsheet Template Contract
 * =============================
 *
 * Single source of truth for the structural rules every cheatsheet in this
 * repository must obey. The contract is lifted from the hand-authored Hermes
 * Agent PoC at `src/content/cheatsheets/hermes-agent/hermes-agent.md`, which
 * is the canonical reference implementation.
 *
 * Module layout (split for issue #134 / F-CLEAN-002 — this file is the
 * public facade; every consumer's `import … from "…/template-contract.js"`
 * keeps working unchanged):
 *
 *  - `./contract/primitives.ts` — Zod building blocks (date coercion,
 *    `CATEGORIES`, `STATUSES`, authors/links sub-schemas).
 *  - `./contract/frontmatter.ts` — {@link frontmatterSchema} and its
 *    inferred `Frontmatter` / `FrontmatterInput` types.
 *  - `./contract/sections.ts`   — {@link REQUIRED_SECTIONS},
 *    {@link SECTION_MATCH_RULE}, {@link ONE_LINER_RULE}, {@link REFERENCE_RULE}.
 *  - `./contract/mermaid.ts`    — {@link MERMAID_RULES}.
 *
 * Both the lint CLI (Task 1.2 / Task 1.3) and the `cheatsheet-scribe` skill
 * (PRD §3 M2, §6.3) must consume this module — no rule may be duplicated
 * elsewhere. Changing a rule here is the single act that re-locks the v1
 * template (PRD §3 M1, §6.3, §10.2).
 *
 * @see ../2026_05_18_awesome_ai_cheatsheets/prd.md §3 M1 ("Standardized cheatsheet template + validator")
 * @see ../2026_05_18_awesome_ai_cheatsheets/prd.md §6.3 ("Authoring layer")
 * @see ../2026_05_18_awesome_ai_cheatsheets/prd.md §10.2 ("Cheatsheet" glossary entry)
 * @see ../src/content/cheatsheets/hermes-agent/hermes-agent.md (PoC reference)
 */

// ---------------------------------------------------------------------------
// Public re-exports — the #134 surface minus the unused CONTRACT aggregate
// (issue #138, F-DEAD-001)
// ---------------------------------------------------------------------------

export {
  CATEGORIES,
  STATUSES,
  type Category,
  type Status,
} from "./contract/primitives.js";
export {
  frontmatterSchema,
  type Frontmatter,
  type FrontmatterInput,
} from "./contract/frontmatter.js";
export {
  ONE_LINER_RULE,
  REFERENCE_RULE,
  REQUIRED_SECTIONS,
  SECTION_MATCH_RULE,
  type RequiredSection,
} from "./contract/sections.js";
export { MERMAID_RULES } from "./contract/mermaid.js";
export { STEP_RULES, type StepLevel } from "./contract/steps.js";
