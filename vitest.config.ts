import { defineConfig } from "vitest/config";

/**
 * Vitest config for the cheatsheet toolchain.
 *
 * - Node environment — the validator targets Node ≥ 20.
 * - `env.CHEATSHEET_LINT_SKIP_LINKS = "1"` — defense in depth so an
 *   accidentally un-mocked link probe in a test can never hit the real
 *   network. Tests that exercise the link rule still pass `skipLinks: false`
 *   AND stub `fetch` themselves.
 */
export default defineConfig({
  test: {
    environment: "node",
    include: ["tools/**/*.test.ts"],
    env: {
      CHEATSHEET_LINT_SKIP_LINKS: "1",
    },
  },
});
