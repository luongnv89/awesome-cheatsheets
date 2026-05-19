import { defineCollection, z } from 'astro:content';

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

const authorSchema = z.object({
  name: z.string().min(1, "author.name must not be empty"),
  handle: z.string().min(1).optional(),
  url: z.string().url().optional(),
});

const linksSchema = z
  .object({
    homepage: z.string().url("links.homepage must be a valid URL"),
    repo: z.string().url().optional(),
  })
  .catchall(z.string().url("every links.<key> must be a valid URL"));

const cheatsheetsSchema = z.object({
  title: z.string().min(1, "title must not be empty"),
  category: z.enum(["tool", "mcp", "concept", "comparison"]),
  subcategory: z.string().min(1).optional(),
  summary: z
    .string()
    .min(20, "summary should be a sentence (≥ 20 characters)")
    .max(400, "summary should fit on a catalog card (≤ 400 characters)"),
  last_updated: isoDate,
  stale_after_days: z
    .number()
    .int("stale_after_days must be an integer")
    .min(1, "stale_after_days must be ≥ 1")
    .max(730, "stale_after_days must be ≤ 730 (two years)"),
  upstream_version: z.string().min(1).optional(),
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
  status: z.enum(["poc", "published", "deprecated"]).default("published"),
  authors: z.array(authorSchema).min(1).optional(),
  links: linksSchema,
});

const cheatsheets = defineCollection({
  type: 'content',
  schema: cheatsheetsSchema,
});

export const collections = {
  cheatsheets,
};