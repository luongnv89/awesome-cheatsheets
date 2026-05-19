# Development Guide

This guide covers local development for the Astro site and TypeScript authoring tools.

## Prerequisites

- Node.js `>=20`
- pnpm `10.28.0` via the `packageManager` field in `package.json`
- Git

Install dependencies:

```bash
pnpm install
```

## Common commands

| Task | Command |
|---|---|
| Start local site | `pnpm dev` |
| Build static site and Pagefind index | `pnpm build` |
| Preview production build | `pnpm preview` |
| Type-check | `pnpm type-check` |
| Run unit tests | `pnpm test` |
| Run unit tests in watch mode | `pnpm test:watch` |
| Run Playwright e2e tests | `pnpm test:e2e` |
| Lint a cheatsheet | `pnpm cheatsheet:lint <file>` |
| Check generated output for third-party CDN URLs | `pnpm check:no-cdn` |
| Run freshness scan | `pnpm freshness:scan -- --dry-run` |

## Repository map

| Path | Purpose |
|---|---|
| `src/pages/` | Astro routes for catalog, details, about, and error pages. |
| `src/components/` | UI components used by the catalog and detail pages. |
| `src/layouts/` | Shared page layouts. |
| `src/content/cheatsheets/` | Published cheatsheet markdown entries. |
| `src/content/config.ts` | Astro content collection schema and frontmatter validation. |
| `src/plugins/remark-mermaid.ts` | Mermaid remark integration. |
| `tools/validator/` | Template-contract validator implementation and tests. |
| `tools/cli/lint.ts` | `pnpm cheatsheet:lint` CLI wrapper. |
| `tools/ci/` | CI helpers for freshness scanning and no-CDN enforcement. |
| `skills/cheatsheet-scribe/` | Local authoring skill and examples for generating cheatsheets. |
| `e2e/` | Playwright coverage for catalog/search/filter/page behavior. |

## Authoring cheatsheets

Create entries under:

```text
src/content/cheatsheets/<slug>/<slug>.md
```

Validate locally:

```bash
pnpm cheatsheet:lint src/content/cheatsheets/<slug>/<slug>.md --no-links
pnpm type-check
pnpm test
pnpm build
pnpm check:no-cdn
```

Use the contributor tutorial at `docs/contributing.md` for the full authoring workflow.

## Testing strategy

- Vitest covers the validator, CLI, freshness logic, and CI helpers.
- Playwright covers catalog browsing, filters, search, freshness display, and core pages.
- Lighthouse CI runs in the main CI workflow against representative generated pages.
- The no-CDN gate scans `dist/` after build.

## Generated files

The following are generated or local-only and should remain untracked:

- `node_modules/`
- `dist/`
- `.astro/`
- `.lighthouseci/`
- `test-results/`
- `playwright-report/`

If a check behaves strangely, remove the generated directory and rebuild.
