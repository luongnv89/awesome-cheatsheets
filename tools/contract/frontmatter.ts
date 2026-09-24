/**
 * Cheatsheet Template Contract — frontmatter schema
 * ==================================================
 *
 * `frontmatterSchema` — the Zod schema for the YAML frontmatter block every
 * cheatsheet must satisfy — plus its inferred TypeScript views. Field-level
 * primitives live in {@link ./primitives.ts}; this module composes them.
 * Extracted from `tools/template-contract.ts` (issue #134, F-CLEAN-002) —
 * that module stays the single public entry point and re-exports everything
 * below.
 *
 * @see ../template-contract.ts (single source of truth, public facade)
 * @see ../src/content/cheatsheets/hermes-agent/hermes-agent.md (PoC reference)
 */

import { z } from "zod";

import {
  CATEGORIES,
  STATUSES,
  authorSchema,
  isoDate,
  linksSchema,
} from "./primitives.js";

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
