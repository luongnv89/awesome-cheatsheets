import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';

import { frontmatterSchema } from '../tools/template-contract.js';

// The frontmatter field set is defined exactly once, in the template
// contract (`tools/contract/frontmatter.ts`), and consumed here — never
// re-declared (issue #135, F-DEAD-004 / F-CLEAN-006 / F-CLEAN-007). The
// collection schema is that schema minus `slug`: Astro derives the entry id
// from the file path (`generateId` below), so `slug` is intentionally not a
// collection field — the lint side still validates it via the full
// `frontmatterSchema`.
const cheatsheetsSchema = frontmatterSchema.omit({ slug: true });

const cheatsheets = defineCollection({
  // Content Layer API (required since Astro 6 removed legacy `type: 'content'`
  // collections). Entries live at `src/content/cheatsheets/<slug>/<slug>.md`;
  // the frontmatter `slug` field is the template contract's canonical id and
  // keeps URLs at /cheatsheets/<slug>/ exactly as the legacy API produced.
  loader: glob({
    pattern: "**/*.md",
    base: "./src/content/cheatsheets",
    generateId: ({ entry, data }) => {
      if (typeof data?.slug === "string" && data.slug.length > 0) {
        return data.slug;
      }
      const stem = entry.replace(/\.md$/, "").split("/").pop();
      return stem ?? entry.replace(/\.md$/, "");
    },
  }),
  schema: cheatsheetsSchema,
});

export const collections = {
  cheatsheets,
};
