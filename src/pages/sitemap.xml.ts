/**
 * /sitemap.xml — generated at build time from the content collection.
 *
 * Lists the catalog, the about page, and every published cheatsheet with an
 * accurate `<lastmod>` taken from `last_updated` (drafts and deprecated
 * entries are excluded, matching what the catalog links). A single urlset is
 * enough — the site stays far below the 50,000-URL / 50MB sitemap limit.
 *
 * Served at https://luongnv.com/awesome-cheatsheets/sitemap.xml and
 * referenced from `public/robots.txt`.
 */
import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

import { absoluteUrl } from "../lib/seo.js";

/** Escape the five XML predefined entities; URLs and dates are already safe. */
function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export const GET: APIRoute = async () => {
  const entries = await getCollection(
    "cheatsheets",
    ({ data }) => data.status === "published",
  );

  const pages: { loc: string; lastmod?: string }[] = [
    { loc: absoluteUrl("/") },
    { loc: absoluteUrl("/about/") },
    ...entries.map((entry) => ({
      loc: absoluteUrl(`/cheatsheets/${entry.id}/`),
      lastmod: entry.data.last_updated,
    })),
  ];

  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...pages.map(({ loc, lastmod }) =>
      [
        "  <url>",
        `    <loc>${escapeXml(loc)}</loc>`,
        ...(lastmod ? [`    <lastmod>${escapeXml(lastmod)}</lastmod>`] : []),
        "  </url>",
      ].join("\n"),
    ),
    "</urlset>",
    "",
  ].join("\n");

  return new Response(body, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
};
