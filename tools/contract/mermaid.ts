/**
 * Cheatsheet Template Contract — Mermaid rules
 * =============================================
 *
 * `MERMAID_RULES` — where Mermaid blocks are required vs allowed, and
 * whether they must parse with the real engine. Extracted from
 * `tools/template-contract.ts` (issue #134, F-CLEAN-002) — that module stays
 * the single public entry point and re-exports the rule below.
 *
 * @see ../template-contract.ts (single source of truth, public facade)
 */

import type { RequiredSection } from "./sections.js";

/**
 * Where Mermaid diagrams are required vs allowed.
 *
 * PRD §3 M1 calls out "Mermaid block syntax" validation. The Mental Model
 * section was retired from the locked template, so no section currently
 * mandates a Mermaid block — but any Mermaid block that appears must parse.
 * The linter (Task 1.2) must:
 *
 *  1. Allow Mermaid blocks anywhere (e.g., flow diagrams inside a setup
 *     step) and parse them all to catch broken fences.
 *  2. Enforce required-section Mermaid blocks for any section listed in
 *     `requiredIn` (currently empty).
 *
 * @see ../2026_05_18_awesome_ai_cheatsheets/prd.md §3 M1 (Mermaid block syntax check)
 */
export const MERMAID_RULES = {
  /** Sections that MUST contain at least one Mermaid block. */
  requiredIn: [] as const satisfies readonly RequiredSection[],
  /** Fence marker for a Mermaid block (the opening line). */
  fenceOpen: "```mermaid",
  /** Fence marker for the closing line of any fenced block. */
  fenceClose: "```",
  /**
   * Whether Mermaid blocks must parse successfully (not just have valid
   * fences). When `true`, the validator parses every Mermaid block with the
   * real `mermaid` engine (headless, via jsdom) and emits `mermaid-parse-failed`
   * for any diagram that would not render. See `validator/rules/mermaid.ts`
   * and `validator/mermaid-engine.ts`.
   */
  mustParse: true,
} as const;
