/**
 * Minimal `astro:content` stub for unit tests.
 *
 * The real `astro:content` module is a virtual module Astro injects inside its
 * own Vite pipeline, so it does not resolve under a bare `vitest run`. Tests
 * alias the specifier here (see `resolve.alias` in `vitest.config.ts`).
 *
 * `z` is re-exported from the project's pinned `zod` dependency, and
 * `defineCollection` returns its config object unchanged — which is close
 * enough to Astro's own behavior (the collection config object keeps `type`
 * and `schema`) for tests to reach `collections.<name>.schema` and exercise
 * the frontmatter contract directly.
 */
import { z } from "zod";

export { z };

export function defineCollection<TConfig>(config: TConfig): TConfig {
  return config;
}
