/**
 * Cheatsheet Template Contract
 * =============================
 *
 * Single source of truth for the structural rules every cheatsheet in this
 * repository must obey. The contract is lifted from the hand-authored Hermes
 * Agent PoC at `src/content/cheatsheets/hermes-agent/hermes-agent.md`, which
 * is the canonical reference implementation.
 *
 * Three exports compose the contract:
 *
 *  - {@link frontmatterSchema} — Zod schema for the YAML frontmatter block.
 *  - {@link REQUIRED_SECTIONS} — locked ordered list of top-level H2 sections.
 *  - {@link MERMAID_RULES}    — where Mermaid blocks are required vs optional.
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

import { z } from "zod";

// ---------------------------------------------------------------------------
// Frontmatter
// ---------------------------------------------------------------------------

/**
 * ISO-8601 calendar date (`YYYY-MM-DD`). Used for `last_updated`.
 *
 * The PoC frontmatter writes `last_updated: 2026-05-18` (unquoted). YAML
 * parses that as a JavaScript `Date`; we accept either a `Date` or a string
 * matching the calendar-date shape and normalize to the `YYYY-MM-DD` string
 * the rest of the toolchain expects.
 *
 * Required so the catalog (PRD §3 M3) and freshness CI (PRD §3 M6) have an
 * authoritative "when was this last reviewed" timestamp.
 *
 * @see ../2026_05_18_awesome_ai_cheatsheets/prd.md §3 M3, §3 M6
 */
const isoDate = z
  .union([
    z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "must be an ISO-8601 calendar date (YYYY-MM-DD)"),
    z.date(),
  ])
  .transform((value) => {
    if (value instanceof Date) {
      const yyyy = value.getUTCFullYear().toString().padStart(4, "0");
      const mm = (value.getUTCMonth() + 1).toString().padStart(2, "0");
      const dd = value.getUTCDate().toString().padStart(2, "0");
      return `${yyyy}-${mm}-${dd}`;
    }
    return value;
  });

/**
 * Allowed top-level categories for a cheatsheet.
 *
 * The PoC uses `category: tool`. We seed the enum with the categories the
 * launch list calls out — terminal-native AI agents, MCP servers, and
 * concepts/methods — plus a free-form `concept` bucket for cross-cutting
 * material (e.g., "harness engineering"). Subcategories (PoC:
 * `subcategory: autonomous-ai-agent`) remain free-form to avoid prematurely
 * over-constraining the taxonomy.
 *
 * @see ../2026_05_18_awesome_ai_cheatsheets/prd.md §3 M3 (catalog filters by category)
 * @see ../2026_05_18_awesome_ai_cheatsheets/prd.md §10.2 ("Cheatsheet" glossary entry)
 */
export const CATEGORIES = ["tool", "mcp", "concept", "comparison"] as const;
export type Category = (typeof CATEGORIES)[number];

/**
 * Author block. The PoC ships `authors: [{ name: luongnv89 }]`. Name is the
 * only required field — handle/url are optional so we don't force every
 * contributor to publish a contact channel.
 */
const authorSchema = z.object({
  name: z.string().min(1, "author.name must not be empty"),
  handle: z.string().min(1).optional(),
  url: z.string().url().optional(),
});

/**
 * Links block. The PoC enumerates `homepage`, `repo`, `community-guide`,
 * `awesome-list`, `self-evolution`. We require `homepage` (every tool/concept
 * has a primary URL) and leave the rest open via passthrough so a cheatsheet
 * can add arbitrary named references without schema churn.
 *
 * @see ../2026_05_18_awesome_ai_cheatsheets/prd.md §3 M4 (References section pulls from this block)
 */
const linksSchema = z
  .object({
    homepage: z.string().url("links.homepage must be a valid URL"),
    repo: z.string().url().optional(),
  })
  .catchall(z.string().url("every links.<key> must be a valid URL"));

/**
 * Lifecycle status of a cheatsheet entry.
 *
 * - `poc`        — proof-of-concept; may exercise template rules under construction.
 * - `published`  — passes lint cleanly, eligible for the catalog (PRD §3 M3).
 * - `deprecated` — kept for history; surfaced as such in the catalog.
 *
 * The PoC declares `status: poc`. Required so the catalog (PRD §3 M3) can
 * hide or badge entries appropriately.
 */
export const STATUSES = ["poc", "published", "deprecated"] as const;
export type Status = (typeof STATUSES)[number];

/**
 * Frontmatter schema — every required field below is justified by a PRD
 * section. Optional fields mirror PoC frontmatter that is useful but not
 * universally applicable (e.g., upstream version pinning).
 *
 * Required fields satisfy Task 1.1 AC #2: `stale_after_days`, `last_updated`,
 * `category`, `tags`, `title`, `slug`.
 *
 * @see ../2026_05_18_awesome_ai_cheatsheets/prd.md §3 M1 (Acceptance: linter validates frontmatter via Zod)
 * @see ../2026_05_18_awesome_ai_cheatsheets/prd.md §3 M3 (catalog renders title, category, tags, last_updated)
 * @see ../2026_05_18_awesome_ai_cheatsheets/prd.md §3 M6 (freshness CI consumes last_updated + stale_after_days)
 * @see ../2026_05_18_awesome_ai_cheatsheets/prd.md §10.2 (Cheatsheet glossary defines the slug-as-path rule)
 */
export const frontmatterSchema = z.object({
  /**
   * URL-safe identifier; also the directory and filename under
   * `src/content/cheatsheets/<slug>/<slug>.md`. PoC: `slug: hermes-agent`.
   *
   * Lowercase letters, digits, and single hyphens only — no leading/trailing
   * hyphen, no consecutive hyphens. This matches the PRD §10.2 glossary
   * definition ("a single template-compliant `.md` file in
   * `src/content/cheatsheets/<slug>/`") and lets us reuse the slug as a
   * stable web path.
   *
   * @see ../2026_05_18_awesome_ai_cheatsheets/prd.md §10.2
   * @see ../2026_05_18_awesome_ai_cheatsheets/prd.md §6.6 (repo layout)
   */
  slug: z
    .string()
    .min(2, "slug must be at least 2 characters")
    .max(64, "slug must be 64 characters or fewer")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "slug must be kebab-case (lowercase a-z, 0-9, single hyphens, no leading/trailing hyphen)",
    ),

  /**
   * Human-readable display title. Rendered in the catalog row, the page
   * `<h1>`, and `<title>`. PoC: `Hermes Agent — Optimization Cheatsheet`.
   *
   * Required by Task 1.1 AC #2 and surfaced on every catalog entry per
   * PRD §3 M3.
   *
   * @see ../2026_05_18_awesome_ai_cheatsheets/prd.md §3 M3
   */
  title: z.string().min(1, "title must not be empty"),

  /**
   * Top-level category — drives the catalog filter chips. PoC: `tool`.
   *
   * Required by Task 1.1 AC #2 and used by the catalog and search index
   * (PRD §3 M3, §3 M5).
   *
   * @see ../2026_05_18_awesome_ai_cheatsheets/prd.md §3 M3
   * @see ../2026_05_18_awesome_ai_cheatsheets/prd.md §3 M5 (filter by category)
   */
  category: z.enum(CATEGORIES),

  /**
   * Optional free-form subcategory for narrower bucketing. PoC:
   * `autonomous-ai-agent`. Kept open (not an enum) until the catalog has
   * enough entries to justify a taxonomy.
   */
  subcategory: z.string().min(1).optional(),

  /**
   * One- or two-sentence summary rendered on the catalog row.
   *
   * Surfaces the cheatsheet's value before the reader clicks through
   * (PRD §3 M3) and seeds the meta description for the page.
   *
   * @see ../2026_05_18_awesome_ai_cheatsheets/prd.md §3 M3
   */
  summary: z
    .string()
    .min(20, "summary should be a sentence (≥ 20 characters)")
    .max(400, "summary should fit on a catalog card (≤ 400 characters)"),

  /**
   * Date the cheatsheet was last reviewed. PoC: `2026-05-18`.
   *
   * Required by Task 1.1 AC #2. Consumed by:
   *  - Catalog rendering (PRD §3 M3) — shown next to each entry.
   *  - Freshness CI (PRD §3 M6) — combined with `stale_after_days`.
   *
   * @see ../2026_05_18_awesome_ai_cheatsheets/prd.md §3 M3
   * @see ../2026_05_18_awesome_ai_cheatsheets/prd.md §3 M6
   */
  last_updated: isoDate,

  /**
   * Threshold in days after which `last_updated` is considered stale. PoC: 90.
   *
   * Required by Task 1.1 AC #2. Freshness CI compares `last_updated +
   * stale_after_days` to `today`; the catalog flags the entry with a
   * "may be stale" badge once exceeded.
   *
   * Bounded 1..730: at least one day, at most two years — anything beyond
   * two years defeats the point of a "freshness" signal in a fast-moving
   * AI tooling space.
   *
   * @see ../2026_05_18_awesome_ai_cheatsheets/prd.md §3 M6 (Freshness CI)
   * @see ../2026_05_18_awesome_ai_cheatsheets/prd.md §3 M3 (catalog stale flag)
   */
  stale_after_days: z
    .number()
    .int("stale_after_days must be an integer")
    .min(1, "stale_after_days must be ≥ 1")
    .max(730, "stale_after_days must be ≤ 730 (two years)"),

  /**
   * Optional pinned upstream version string for tools that ship versioned
   * binaries. PoC: `"v0.12 / v0.13 era"`. Free-form on purpose — we don't
   * want to force semver on tools that don't use it.
   */
  upstream_version: z.string().min(1).optional(),

  /**
   * Tags drive the catalog filter pills and the client-side search index.
   * PoC: 8 tags including `hermes-agent`, `cli`, `memory`, `skills`, `mcp`.
   *
   * Required by Task 1.1 AC #2 and PRD §3 M3 / §3 M5. Each tag must be
   * kebab-case so it can render as a URL fragment. Minimum 1 tag so every
   * entry shows up under at least one filter; cap at 12 to keep the
   * pill row readable on mobile.
   *
   * @see ../2026_05_18_awesome_ai_cheatsheets/prd.md §3 M3 (tag filter)
   * @see ../2026_05_18_awesome_ai_cheatsheets/prd.md §3 M5 (search filter)
   */
  tags: z
    .array(
      z
        .string()
        .regex(
          /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
          "each tag must be kebab-case (lowercase a-z, 0-9, single hyphens)",
        ),
    )
    .min(1, "at least one tag is required")
    .max(12, "no more than 12 tags per cheatsheet"),

  /**
   * Lifecycle status — defaults to `published` if omitted. PoC: `poc`.
   *
   * Lets the catalog hide or badge non-published entries (PRD §3 M3).
   *
   * @see ../2026_05_18_awesome_ai_cheatsheets/prd.md §3 M3
   */
  status: z.enum(STATUSES).default("published"),

  /**
   * Author block. Optional because attribution defaults to git history;
   * include it to credit non-committer authors or set a preferred display
   * name. PoC: `[{ name: luongnv89 }]`.
   */
  authors: z.array(authorSchema).min(1).optional(),

  /**
   * External links rendered in the References section (PRD §3 M4). PoC
   * declares 5 links (homepage, repo, community-guide, awesome-list,
   * self-evolution); `homepage` is required, the rest are open via
   * `catchall`.
   *
   * @see ../2026_05_18_awesome_ai_cheatsheets/prd.md §3 M4 (References section consumes this block)
   */
  links: linksSchema,
});

/**
 * TypeScript view of a parsed (post-transform) frontmatter object. Use
 * `z.input<typeof frontmatterSchema>` if you need the pre-parse shape
 * (e.g., to accept a `Date` for `last_updated`).
 */
export type Frontmatter = z.infer<typeof frontmatterSchema>;
export type FrontmatterInput = z.input<typeof frontmatterSchema>;

// ---------------------------------------------------------------------------
// Section structure
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Mermaid
// ---------------------------------------------------------------------------

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
   * fences). The validator (Task 1.2) will parse with `mermaid` or an
   * equivalent — out of scope for this contract, but flagged here so the
   * validator implementation has a single named rule to bind to.
   */
  mustParse: true,
} as const;

// ---------------------------------------------------------------------------
// Aggregate
// ---------------------------------------------------------------------------

/**
 * Convenience aggregate so consumers can `import { CONTRACT }` and get the
 * whole rule set as a single namespaced object. Treat the export as
 * read-only.
 */
export const CONTRACT = {
  frontmatterSchema,
  REQUIRED_SECTIONS,
  SECTION_MATCH_RULE,
  ONE_LINER_RULE,
  REFERENCE_RULE,
  MERMAID_RULES,
  CATEGORIES,
  STATUSES,
} as const;
