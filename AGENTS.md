# AGENTS.md

## Project
Static catalog of AI cheatsheets (Astro) plus a TypeScript validator and lint CLI. Published entries live in `src/content/cheatsheets/` and must keep the template contract. Unit tests cover `tools/` and `src/` helpers.

## Commands
Build and test commands stay in `CLAUDE.md` and the Pre.1 notes in `docs/DEVELOPMENT.md` (`## Agent-runnable environment`). Do not copy that command list here.

## Layout
- `src/pages/`, `src/components/`, `src/layouts/` — site UI
- `src/content/cheatsheets/` — markdown entries; `src/content.config.ts` — collection schema
- `tools/validator/`, `tools/cli/`, `tools/ci/` — lint, tests, CI helpers
- `e2e/` — Playwright
- `skills/cheatsheet-scribe/` — authoring skill
- `skills/docs-to-cheatsheet/agents/` — subagent prompts for the docs-to-cheatsheet workflow
- Do not hand-edit `dist/`, `.astro/`, `node_modules/`, `.lighthouseci/`, `test-results/`, or `playwright-report/`

## Conventions
- Package manager is pnpm. ESM (`"type": "module"`).
- New validator behavior gets a test under `tools/**/*.test.ts`.

## Constraints
- Do not commit `.env` or secrets.
- Do not push or commit unless asked.
- Do not edit generated output under `dist/`.

## Done when
Use the completion commands in `CLAUDE.md` and `docs/DEVELOPMENT.md`. `pnpm test` must stay at or above the 82-test baseline.

## Subagents
These roles belong to `skills/docs-to-cheatsheet/`. The prompt file is the definition; this list is the index.

### docs-mapper
Maps official documentation navigation from one starting URL. Prompt: `skills/docs-to-cheatsheet/agents/docs-mapper.md`.

### community-researcher
Finds recent community best-practice sources for a tool. Prompt: `skills/docs-to-cheatsheet/agents/community-researcher.md`.

### cheatsheet-reviewer
Reviews a cheatsheet for concision, source support, and template compliance. Prompt: `skills/docs-to-cheatsheet/agents/cheatsheet-reviewer.md`.

## Read when needed
- Setup and script table → `docs/DEVELOPMENT.md`
- Contributor authoring → `docs/contributing.md`
- Architecture → `docs/ARCHITECTURE.md`
- Docs-to-cheatsheet workflow → `skills/docs-to-cheatsheet/SKILL.md`

## Token Efficiency
- Never re-read files you just wrote or edited. You know the contents.
- Never re-run commands to "verify" unless the outcome was uncertain.
- Don't echo back large blocks of code or file contents unless asked.
- Batch related edits into single operations. Don't make 5 edits when 1 handles it.
- Skip confirmations like "I'll continue..." Just do it.
- If a task needs 1 tool call, don't use 3. Plan before acting.
- Do not summarize what you just did unless the result is ambiguous or you need additional input.
