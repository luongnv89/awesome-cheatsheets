/**
 * Cheatsheet Template Contract — frontmatter primitives
 * ======================================================
 *
 * Small Zod building blocks shared by {@link ./frontmatter.ts}'s
 * `frontmatterSchema`: the ISO-8601 date coercion, the category and status
 * enums, and the nested `authors` / `links` sub-schemas. Extracted from
 * `tools/template-contract.ts` (issue #134, F-CLEAN-002) — that module stays
 * the single public entry point and re-exports the public surface; import
 * these primitives only inside `tools/contract/`.
 *
 * @see ../template-contract.ts (single source of truth, public facade)
 */

import { z } from "zod";

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
export const isoDate = z
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
export const authorSchema = z.object({
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
export const linksSchema = z
  .object({
    homepage: z.string().url("links.homepage must be a valid URL"),
    repo: z.string().url().optional(),
  })
  .catchall(z.string().url("every links.<key> must be a valid URL"));

/**
 * Lifecycle status of a cheatsheet entry.
 *
 * - `poc`        — proof-of-concept; may exercise template rules under construction.
 * - `draft`      — work-in-progress; hidden from the catalog grid and search
 *                  index, but the detail page still renders at the canonical
 *                  URL so reviewers can read it (issue #90).
 * - `published`  — passes lint cleanly, eligible for the catalog (PRD §3 M3).
 * - `deprecated` — kept for history; surfaced as such in the catalog.
 *
 * The PoC declares `status: poc`. Required so the catalog (PRD §3 M3) can
 * hide or badge entries appropriately.
 */
export const STATUSES = ["poc", "draft", "published", "deprecated"] as const;
export type Status = (typeof STATUSES)[number];
