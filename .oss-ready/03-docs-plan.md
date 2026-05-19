# Documentation Plan — awesome-cheatsheets

Date: 2026-05-19
Project type: static Astro documentation/catalog site + TypeScript authoring/validation toolchain + local agent skill
Stack detected: Astro 4, MDX, Tailwind, TypeScript, Vitest, Playwright, Pagefind, Lighthouse CI, pnpm, GitHub Pages

## Existing documentation inventory

| File | Current state | Plan |
|---|---|---|
| `README.md` | Strong public landing README with tagline, badges, problem framing, quick start, roadmap, contribution link, layout, and license. | Leave for Step 4 README polish. |
| `CONTRIBUTING.md` | Short root contributor guide with install/validate commands and license terms. | Update lightly to link new docs and PR template expectations. |
| `docs/contributing.md` | Detailed 30-minute cheatsheet authoring tutorial, frontmatter, no-CDN policy, deployment notes. | Keep; optionally cross-link from new user/development docs. |
| `docs/launch.md` | Launch checklist and channel tracker. | Keep. |
| `docs/scribe-pi-run.md` | Smoke-run log for Pi cheatsheet. | Keep. |
| `docs/scribe-retro-1.md` | Retrospective for scribe process. | Keep. |
| `tools/validator/README.md` | Low-level validator notes. | Keep and reference from `docs/API.md`. |
| `LICENSE` | MIT code license detected by GitHub. | Keep. |
| `LICENSE-CONTENT` | CC BY 4.0 content license. | Keep. |

## Proposed writes

| File | Action | Rationale | Content basis / notes |
|---|---|---|---|
| `docs/USER_GUIDE.md` | create | Needed for end users browsing the catalog and contributors consuming cheatsheets, separate from development setup. | Explain catalog browsing, categories (`tool`, `mcp`, `concept`, `comparison`), search/filtering, freshness badges, reading the 7-section template, and how to request/add a cheatsheet. Base on `README.md`, `src/content/config.ts`, `src/pages/index.astro`, and `docs/contributing.md`. |
| `docs/DEVELOPMENT.md` | create | Needed for local development of the Astro site and TypeScript tools. | Include prerequisites Node >=20 + pnpm 10.28.0, install, scripts from `package.json`, content paths, validator CLI workflow, testing commands, CI parity commands, and troubleshooting generated artifacts. |
| `docs/DEPLOYMENT.md` | create | Needed because deploy is handled by GitHub Pages workflow and has repo settings prerequisites. | Document `astro.config.mjs` `site`/`base`, `pnpm build`, Pagefind generation, `.github/workflows/deploy.yml`, required Pages source `GitHub Actions`, and verification URLs. |
| `docs/ARCHITECTURE.md` | create | Needed to explain the static site + content collection + validator + freshness automation architecture. | Include Mermaid diagrams for content flow and CI/deploy flow. Base on `src/content/config.ts`, layouts/pages, `tools/validator`, `tools/ci/freshness-scan.ts`, and workflows. |
| `docs/API.md` | create | Applicable: the repo exposes a reusable validator API (`validate`) and CLI (`pnpm cheatsheet:lint`). | Document `tools/validator/index.ts` exports, validation result shape, CLI options/exit codes, content frontmatter schema, freshness scanner env vars, and no-CDN checker. Cross-link `tools/validator/README.md`. |
| `docs/CHANGELOG.md` | create | Audit found no changelog/releases; useful before broader OSS launch. | Seed with `0.1.0` / initial public launch dated 2026-05-19 and sections for site, validator, CI, content. Avoid inventing unreleased versions. |
| `CONTRIBUTING.md` | update | Root guide is correct but too brief for OSS: should point to new docs, branch/commit conventions, PR checks, issue labels, and security reporting. | Preserve existing quick path and license language; add links to `docs/DEVELOPMENT.md`, `docs/USER_GUIDE.md`, `docs/API.md`, `docs/DEPLOYMENT.md`, and mention conventional commit style used in PR titles. |
| `CODE_OF_CONDUCT.md` | create | Required OSS community standard missing. | Copy from oss-ready asset template via `cp`; do not read/rewrite asset content. |
| `SECURITY.md` | create | Required vulnerability reporting instructions missing. | Copy from oss-ready asset template via `cp`; substitute contact placeholder with `luongnv89@gmail.com` using `sed`. |
| `.github/ISSUE_TEMPLATE/bug_report.md` | create | Missing issue template for bugs. | Copy from oss-ready assets if available. |
| `.github/ISSUE_TEMPLATE/feature_request.md` | create | Missing issue template for feature/content requests. | Copy from oss-ready assets if available; keep compatible with existing labels such as `enhancement`, `good first issue`, `content`. |
| `.github/PULL_REQUEST_TEMPLATE.md` | create | Missing PR checklist. | Copy from oss-ready asset then adjust only if needed with targeted additions for `pnpm type-check`, `pnpm test`, `pnpm build`, `pnpm check:no-cdn`, `pnpm cheatsheet:lint`. |
| `docs/OSS_READINESS_CHECKLIST.md` | create | Useful tracker for remaining audit gaps between sessions. | Copy from oss-ready asset template via `cp`; no need to customize. |

## Explicitly skipped for Step 3

| File / area | Reason |
|---|---|
| `README.md` | Covered in Step 4. |
| `package.json` metadata | Not documentation; handle manually or in a later polish step. |
| `.github/dependabot.yml` | Automation config, not standard docs; should be handled after docs if user wants. |
| Branch protection / topics / Discussions | GitHub settings; report as manual follow-ups. |
| Coverage tooling / formatter / pre-commit | Quality tooling; not part of documentation write pass. |
| Existing `docs/launch.md`, `docs/scribe-pi-run.md`, `docs/scribe-retro-1.md` | Preserve as historical/project notes. |

## Acceptance checks for Docs Writer

1. Do not overwrite `LICENSE` or `LICENSE-CONTENT`.
2. Copy `CODE_OF_CONDUCT.md`, `SECURITY.md`, and GitHub templates from oss-ready assets using shell `cp`; do not read asset contents into context.
3. Substitute `SECURITY.md` contact with `luongnv89@gmail.com` using `sed` only.
4. Base all prose on actual files listed above; do not claim unsupported features.
5. Capture per-file diffs in `.oss-ready/03-docs-diffs.md`.
6. Do not commit.
