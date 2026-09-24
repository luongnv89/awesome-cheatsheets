# CLAUDE.md

## Project
Static catalog of AI cheatsheets (Astro) plus a TypeScript validator and lint CLI. Published entries live in `src/content/cheatsheets/` and must keep the template contract. Unit tests cover `tools/` only. Playwright covers the site and is a separate command.

## Commands
- Install: `pnpm install --frozen-lockfile` (pnpm 10.28.0; do not use npm or yarn)
- Dev: `pnpm dev`
- Build: `pnpm build` (Astro, then Pagefind into `dist/`)
- Preview: `pnpm preview`
- Test (unit): `pnpm test` (Vitest, `tools/**/*.test.ts` only; audit baseline 82/82)
- Test (one file): `pnpm test tools/validator/__tests__/frontmatter.test.ts`
- Test (e2e): `pnpm test:e2e` (builds the site, then Playwright)
- Types: `pnpm type-check`
- Lint one cheatsheet: `pnpm cheatsheet:lint src/content/cheatsheets/<slug>/<slug>.md --no-links`
- No-CDN gate (after build): `pnpm check:no-cdn`
- Freshness dry run: `pnpm freshness:scan -- --dry-run`
- Add a dependency: ask first, then `pnpm add <pkg>`

## Layout
- `src/pages/`, `src/components/`, `src/layouts/` — site UI
- `src/content/cheatsheets/` — markdown entries; `src/content/config.ts` — collection schema
- `tools/validator/`, `tools/cli/`, `tools/ci/` — lint, tests, CI helpers
- `e2e/` — Playwright
- `skills/cheatsheet-scribe/` — authoring skill (copies also exist under `.claude/skills/` and `.agents/skills/`)
- Do not hand-edit `dist/`, `.astro/`, `node_modules/`, `.lighthouseci/`, `test-results/`, or `playwright-report/`

## Conventions
- Package manager is pnpm. ESM (`"type": "module"`).
- Cheatsheet link checks stay offline in tests (`CHEATSHEET_LINT_SKIP_LINKS=1` in `vitest.config.ts`).
- New validator behavior gets a test under `tools/**/*.test.ts`.

## Constraints
- Do not commit `.env` or secrets. Build and `pnpm test` need none.
- Do not push or commit unless asked.
- Do not edit generated output under `dist/`.

## Done when
- `pnpm type-check` exits 0
- `pnpm test` passes (do not drop below 82 passing)
- Cheatsheet edits also pass `pnpm cheatsheet:lint <file> --no-links`
- UI edits also pass `pnpm build`

## Read when needed
- Setup and script table → `docs/DEVELOPMENT.md`
- Contributor authoring → `docs/contributing.md`
- Architecture → `docs/ARCHITECTURE.md`

## Token Efficiency
- Never re-read files you just wrote or edited. You know the contents.
- Never re-run commands to "verify" unless the outcome was uncertain.
- Don't echo back large blocks of code or file contents unless asked.
- Batch related edits into single operations. Don't make 5 edits when 1 handles it.
- Skip confirmations like "I'll continue..." Just do it.
- If a task needs 1 tool call, don't use 3. Plan before acting.
- Do not summarize what you just did unless the result is ambiguous or you need additional input.
