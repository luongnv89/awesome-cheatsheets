/**
 * /llms.txt — AI-agent index of the catalog (https://llmstxt.org format).
 *
 * Generated at build time from the content collection so it never drifts from
 * the published entries. Groups published cheatsheets by category with title,
 * absolute URL, summary, and last-updated date. Drafts and deprecated entries
 * are excluded, matching the catalog and the sitemap.
 *
 * Served at https://luongnv89.github.io/awesome-cheatsheets/llms.txt.
 */
import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

import { absoluteUrl } from "../lib/seo.js";

/** Category sections in schema-enum order; labels mirror the catalog filters. */
const CATEGORY_SECTIONS: { category: string; label: string }[] = [
  { category: "tool", label: "Tools" },
  { category: "mcp", label: "MCP" },
  { category: "concept", label: "Concepts" },
  { category: "comparison", label: "Comparisons" },
];

export const GET: APIRoute = async () => {
  const entries = await getCollection(
    "cheatsheets",
    ({ data }) => data.status === "published",
  );
  const sorted = [...entries].sort((a, b) =>
    b.data.last_updated.localeCompare(a.data.last_updated),
  );

  const sections = CATEGORY_SECTIONS.map(({ category, label }) => {
    const items = sorted.filter((entry) => entry.data.category === category);
    if (items.length === 0) return null;
    return [
      `## ${label}`,
      "",
      ...items.map(
        (entry) =>
          `- [${entry.data.title}](${absoluteUrl(`/cheatsheets/${entry.id}/`)}): ${entry.data.summary} (updated ${entry.data.last_updated})`,
      ),
      "",
    ].join("\n");
  }).filter((section): section is string => section !== null);

  const body = [
    "# Awesome AI Cheatsheets",
    "",
    "> Step-by-step, visibly-dated setup cheatsheets for terminal-native AI coding agents and the concepts behind them. Every entry follows the same 7-section structure and carries a last-updated date.",
    "",
    `- [Catalog](${absoluteUrl("/")}): All published cheatsheets with search and filters`,
    `- [About](${absoluteUrl("/about/")}): What the project is and why it exists`,
    "",
    ...sections,
  ].join("\n");

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
