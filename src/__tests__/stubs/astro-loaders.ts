/**
 * Minimal `astro/loaders` stub for unit tests.
 *
 * `astro/loaders` is only real inside Astro's own Vite pipeline, so
 * `vitest.config.ts` aliases the specifier here. `src/content.config.ts` calls
 * `glob()` while constructing the collection; the schema tests only read
 * `collections.cheatsheets.schema`, so a pass-through marker object is enough.
 */
export function glob(options: unknown): { __loader: "glob"; options: unknown } {
  return { __loader: "glob", options };
}
