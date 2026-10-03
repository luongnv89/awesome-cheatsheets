# AGENTS.md

## Project
Static catalog of AI cheatsheets: an Astro site plus a TypeScript validator and lint CLI (`tools/`) that enforce the entry template contract. Published entries live in `src/content/cheatsheets/` and must keep the contract (`skills/cheatsheet-scribe/template-contract.md`). Unit tests (Vitest) cover `tools/**` and `src/**`; Playwright covers the built site.

## Layout
- `src/content/cheatsheets/<slug>/<slug>.md` — published entries; schema in `src/content.config.ts`.
- `tools/` — validator, `cheatsheet:lint` CLI, and CI helpers; tests are `*.test.ts` beside sources under `tools/` and `src/`.
- `e2e/` — Playwright specs for the built site.
- `skills/` — canonical authoring skills; `.claude/skills/` and `.agents/skills/` are generated mirrors.

## Commands
- Install: `pnpm install --frozen-lockfile` (pnpm 10.28.0, Node ≥24; not npm or yarn)
- Dev: `pnpm dev`
- Build: `pnpm build` (Astro, then Pagefind into `dist/`)
- Preview: `pnpm preview`
- Test all: `pnpm test` (Vitest)
- Test one file: `pnpm test tools/validator/__tests__/frontmatter.test.ts`
- E2E on site changes: `pnpm test:e2e` (fixture build + Playwright; CI runs it on every PR)
- Types: `pnpm type-check` (also runs in the pre-commit hook)
- Lint one cheatsheet: `pnpm cheatsheet:lint src/content/cheatsheets/<slug>/<slug>.md --no-links`
- Lint all cheatsheets: `pnpm cheatsheet:lint 'src/content/cheatsheets/**/*.md' --no-links`
- No-CDN gate: `pnpm check:no-cdn` (run after `pnpm build`)
- Skill mirrors: `pnpm skills:sync` (after editing `skills/`; add `-- --check` to verify only)

## Constraints
- Never hand-edit generated output: `dist/`, `.astro/`, `.lighthouseci/`, `test-results/`, `playwright-report/`; rebuild instead.
- Never edit `.claude/skills/` or `.agents/skills/` directly; they are generated mirrors — edit `skills/`, then run `pnpm skills:sync`.
- Never commit `.env` or secrets; build and `pnpm test` need no `.env`.
- Never push or commit unless asked.
- Ask first before adding or upgrading a dependency, then use `pnpm add <pkg>`.

## Done when
- `pnpm type-check` exits 0.
- `pnpm test` passes; keep at or above the current 240-test baseline.
- Cheatsheet edits also pass `pnpm cheatsheet:lint <file> --no-links`.
- UI edits also pass `pnpm build` and `pnpm check:no-cdn`.
- New validator behavior has a test under `tools/**/*.test.ts`.

## Conventions
- ESM package (`"type": "module"`).
- Cheatsheet link checks stay offline in unit tests (`CHEATSHEET_LINT_SKIP_LINKS=1` in `vitest.config.ts`).

## Read when needed
- Setup and script table → `docs/DEVELOPMENT.md`
- Contributor authoring → `docs/contributing.md`
- Architecture → `docs/ARCHITECTURE.md`
- Cheatsheet authoring and docs-to-cheatsheet workflow, including subagent prompts (`agents/`) → `skills/cheatsheet-scribe/SKILL.md`, `skills/docs-to-cheatsheet/SKILL.md`

## Token Efficiency
- Never re-read files you just wrote or edited. You know the contents.
- Never re-run commands to "verify" unless the outcome was uncertain.
- Don't echo back large blocks of code or file contents unless asked.
- Batch related edits into single operations. Don't make 5 edits when 1 handles it.
- Report results and blockers plainly; skip filler like "I'll continue...".
- If a task needs 1 tool call, don't use 3.
