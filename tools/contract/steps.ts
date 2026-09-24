/**
 * Cheatsheet Template Contract — step structure (optional structured blocks)
 * ==========================================================================
 *
 * The extended template keeps every v1 requirement but adds an OPTIONAL
 * structured layer inside `## Step-by-Step Setup & Optimization`:
 *
 *  - `### Step N — Title` headings, numbered 1..N contiguously.
 *  - A step-meta paragraph directly after each step heading:
 *    `**Goal:** … · **Time:** ~5 min · **Level:** beginner`.
 *  - A `**Verify:**` line per step — the command/output that proves the step
 *    worked.
 *  - An optional `## Prerequisites` H2 that may only appear *before*
 *    `## Installation`.
 *
 * All blocks are optional: a cheatsheet with zero step headings stays fully
 * valid (the section itself is still required). When steps ARE present the
 * numbering must be contiguous and any meta values that are given must
 * parse — the validator surfaces malformed structure instead of silently
 * rendering a broken timeline.
 *
 * The same constants drive three consumers:
 *  - `tools/validator/rules/steps.ts` — lint rules
 *    (`step-sequence`, `step-meta-invalid`, `prerequisites-out-of-order`,
 *    `verify-empty`).
 *  - `src/plugins/remark-cheatsheet-blocks.ts` — the build-time remark
 *    transform that turns these blocks into styled markup.
 *  - `src/lib/steps.ts` — the header/card step counters.
 *
 * @see ../template-contract.ts (single source of truth, public facade)
 * @see ../validator/rules/steps.ts
 * @see ../../src/plugins/remark-cheatsheet-blocks.ts
 */
export const STEP_RULES = {
  /**
   * Matches a step H3 heading's text (`Step N — Title`). Accepts em dash,
   * en dash, or hyphen as the separator — the authored convention is the
   * em dash but the parser stays liberal so the rule reports sequence
   * errors rather than silently skipping a mis-punctuated heading.
   * Capture groups: 1 = step number, 2 = title.
   */
  headingRegex: /^Step\s+(\d+)\s*[—–-]\s*(.+)$/,

  /** Canonical H2 the step headings must live under. */
  setupSection: "Step-by-Step Setup & Optimization",

  /**
   * Bold markers that open a step-meta segment. The full meta line is one
   * paragraph whose segments are separated by " · ":
   * `**Goal:** … · **Time:** … · **Level:** …`.
   */
  metaMarkers: {
    goal: "**Goal:**",
    time: "**Time:**",
    level: "**Level:**",
  },

  /**
   * Bold marker that opens the per-step verification line.
   * `**Verify:** <command or expectation>` — rendered as a check callout.
   */
  verifyMarker: "**Verify:**",

  /** Minimum content after `**Verify:**` — guards against empty callouts. */
  verifyMinLength: 10,

  /** Allowed `**Level:**` values in the step-meta line. */
  allowedLevels: ["beginner", "intermediate", "advanced"] as const,

  /**
   * Allowed `**Time:**` values: an optional `~` prefix, a number, then a
   * minute-or-hour unit (`~5 min`, `10 min`, `1 h`, `2 hours`).
   */
  timeRegex: /^~?\d+\s*(min|mins|minutes|h|hr|hours)$/i,

  /**
   * The optional `## Prerequisites` H2 is only legal BEFORE `## Installation`
   * in the document's H2 sequence — prerequisites that arrive after the
   * install section can't be prerequisites.
   */
  prerequisitesSection: "Prerequisites",
  prerequisitesBeforeSection: "Installation",
} as const;

export type StepLevel = (typeof STEP_RULES.allowedLevels)[number];
