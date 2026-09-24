import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

/**
 * Vitest config for the cheatsheet toolchain.
 *
 * - Node environment — the validator targets Node ≥ 20.
 * - `env.CHEATSHEET_LINT_SKIP_LINKS = "1"` — defense in depth so an
 *   accidentally un-mocked link probe in a test can never hit the real
 *   network. Tests that exercise the link rule still pass `skipLinks: false`
 *   AND stub `fetch` themselves.
 * - `resolve.alias["astro:content"]` — `astro:content` is a virtual module
 *   Astro only provides inside its own Vite pipeline, so unit tests resolve
 *   it to a minimal stub (`src/__tests__/stubs/astro-content.ts`) that
 *   re-exports the project's zod and returns `defineCollection` input
 *   unchanged, exposing `collections.<name>.schema` for characterization
 *   tests.
 * - `resolve.alias["astro/zod"]` — `src/content.config.ts` imports `z` from
 *   `astro/zod` (Zod 4, the version Astro 6+ uses internally); the project's
 *   pinned `zod` v4 dependency is the same API, so tests alias straight to it.
 * - `resolve.alias["astro/loaders"]` — same virtual-module problem; the stub
 *   (`src/__tests__/stubs/astro-loaders.ts`) returns a marker from `glob()`
 *   because the tests only exercise the collection's `schema`.
 */
export default defineConfig({
  resolve: {
    alias: {
      "astro:content": fileURLToPath(
        new URL("./src/__tests__/stubs/astro-content.ts", import.meta.url),
      ),
      "astro/loaders": fileURLToPath(
        new URL("./src/__tests__/stubs/astro-loaders.ts", import.meta.url),
      ),
      "astro/zod": "zod",
    },
  },
  test: {
    environment: "node",
    include: ["tools/**/*.test.ts", "src/**/*.test.ts"],
    // Tests that lint a mermaid-bearing cheatsheet pay a one-time jsdom +
    // mermaid engine init (~5s cold, worse under parallel-file contention);
    // the 5s default sits inside that cost, so give the suite headroom.
    testTimeout: 15000,
    env: {
      CHEATSHEET_LINT_SKIP_LINKS: "1",
    },
    coverage: {
      // pnpm forwards `pnpm test -- --coverage` as `vitest run -- --coverage`,
      // so the flag never reaches Vitest. Keep collection on so that command
      // still prints a tools/ line percentage.
      enabled: true,
      provider: "v8",
      include: ["tools/**/*.ts"],
      reporter: ["text"],
    },
  },
});
