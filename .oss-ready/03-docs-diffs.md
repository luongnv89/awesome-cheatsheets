diff --git a/.github/ISSUE_TEMPLATE/bug_report.md b/.github/ISSUE_TEMPLATE/bug_report.md
new file mode 100644
index 0000000..2bb16f8
--- /dev/null
+++ b/.github/ISSUE_TEMPLATE/bug_report.md
@@ -0,0 +1,40 @@
+---
+name: Bug Report
+about: Report a bug to help us improve
+title: '[BUG] '
+labels: bug
+assignees: ''
+---
+
+## Bug Description
+
+A clear and concise description of what the bug is.
+
+## Steps to Reproduce
+
+1. Go to '...'
+2. Click on '...'
+3. Scroll down to '...'
+4. See error
+
+## Expected Behavior
+
+A clear and concise description of what you expected to happen.
+
+## Actual Behavior
+
+What actually happened instead.
+
+## Screenshots
+
+If applicable, add screenshots to help explain your problem.
+
+## Environment
+
+- OS: [e.g., macOS 14.0, Ubuntu 22.04, Windows 11]
+- Version: [e.g., 1.0.0]
+- Node/Python/etc version: [if applicable]
+
+## Additional Context
+
+Add any other context about the problem here.
diff --git a/.github/ISSUE_TEMPLATE/feature_request.md b/.github/ISSUE_TEMPLATE/feature_request.md
new file mode 100644
index 0000000..45c82b5
--- /dev/null
+++ b/.github/ISSUE_TEMPLATE/feature_request.md
@@ -0,0 +1,31 @@
+---
+name: Feature Request
+about: Suggest an idea for this project
+title: '[FEATURE] '
+labels: enhancement
+assignees: ''
+---
+
+## Problem Statement
+
+A clear and concise description of what the problem is.
+Ex. I'm always frustrated when [...]
+
+## Proposed Solution
+
+A clear and concise description of what you want to happen.
+
+## Alternatives Considered
+
+A clear and concise description of any alternative solutions or features you've considered.
+
+## Use Cases
+
+Describe specific use cases where this feature would be beneficial:
+
+1. Use case 1
+2. Use case 2
+
+## Additional Context
+
+Add any other context, mockups, or screenshots about the feature request here.
diff --git a/.github/PULL_REQUEST_TEMPLATE.md b/.github/PULL_REQUEST_TEMPLATE.md
new file mode 100644
index 0000000..39699da
--- /dev/null
+++ b/.github/PULL_REQUEST_TEMPLATE.md
@@ -0,0 +1,43 @@
+## Description
+
+Brief description of the changes in this PR.
+
+## Related Issue
+
+Fixes #(issue number)
+
+## Type of Change
+
+- [ ] Bug fix (non-breaking change which fixes an issue)
+- [ ] New feature (non-breaking change which adds functionality)
+- [ ] Breaking change (fix or feature that would cause existing functionality to change)
+- [ ] Documentation update
+- [ ] Refactoring (no functional changes)
+
+## Checklist
+
+- [ ] My code follows the project's style guidelines
+- [ ] I have performed a self-review of my code
+- [ ] I have commented my code, particularly in hard-to-understand areas
+- [ ] I have made corresponding changes to the documentation
+- [ ] My changes generate no new warnings
+- [ ] I have added tests that prove my fix is effective or that my feature works
+- [ ] New and existing unit tests pass locally with my changes
+
+## Screenshots (if applicable)
+
+Add screenshots to help explain your changes.
+
+## Additional Notes
+
+Any additional information that reviewers should know.
+
+## Awesome AI Cheatsheets validation
+
+- [ ] Linked issue or explained why none is needed
+- [ ] Ran `pnpm cheatsheet:lint 'src/content/cheatsheets/**/*.md' --no-links` when content changed
+- [ ] Ran `pnpm type-check`
+- [ ] Ran `pnpm test`
+- [ ] Ran `pnpm build`
+- [ ] Ran `pnpm check:no-cdn`
+- [ ] Included screenshots or preview links for visible UI changes
diff --git a/CODE_OF_CONDUCT.md b/CODE_OF_CONDUCT.md
new file mode 100644
index 0000000..940ab12
--- /dev/null
+++ b/CODE_OF_CONDUCT.md
@@ -0,0 +1,59 @@
+# Contributor Covenant Code of Conduct
+
+## Our Pledge
+
+We as members, contributors, and leaders pledge to make participation in our
+community a harassment-free experience for everyone, regardless of age, body
+size, visible or invisible disability, ethnicity, sex characteristics, gender
+identity and expression, level of experience, education, socio-economic status,
+nationality, personal appearance, race, religion, or sexual identity
+and orientation.
+
+We pledge to act and interact in ways that contribute to an open, welcoming,
+diverse, inclusive, and healthy community.
+
+## Our Standards
+
+Examples of behavior that contributes to a positive environment:
+
+* Demonstrating empathy and kindness toward other people
+* Being respectful of differing opinions, viewpoints, and experiences
+* Giving and gracefully accepting constructive feedback
+* Accepting responsibility and apologizing to those affected by our mistakes
+* Focusing on what is best for the overall community
+
+Examples of unacceptable behavior:
+
+* The use of sexualized language or imagery, and sexual attention or advances
+* Trolling, insulting or derogatory comments, and personal or political attacks
+* Public or private harassment
+* Publishing others' private information without explicit permission
+* Other conduct which could reasonably be considered inappropriate
+
+## Enforcement Responsibilities
+
+Community leaders are responsible for clarifying and enforcing our standards of
+acceptable behavior and will take appropriate and fair corrective action in
+response to any behavior that they deem inappropriate, threatening, offensive,
+or harmful.
+
+## Scope
+
+This Code of Conduct applies within all community spaces, and also applies when
+an individual is officially representing the community in public spaces.
+
+## Enforcement
+
+Instances of abusive, harassing, or otherwise unacceptable behavior may be
+reported to the community leaders responsible for enforcement at
+[INSERT CONTACT METHOD].
+
+All complaints will be reviewed and investigated promptly and fairly.
+
+## Attribution
+
+This Code of Conduct is adapted from the [Contributor Covenant][homepage],
+version 2.0, available at
+https://www.contributor-covenant.org/version/2/0/code_of_conduct.html.
+
+[homepage]: https://www.contributor-covenant.org
diff --git a/CONTRIBUTING.md b/CONTRIBUTING.md
index 78a9518..62b518e 100644
--- a/CONTRIBUTING.md
+++ b/CONTRIBUTING.md
@@ -2,15 +2,16 @@

 Thanks for helping improve Awesome AI Cheatsheets.

-The full 30-minute contributor walkthrough lives in
-[`docs/contributing.md`](./docs/contributing.md). Start there if you are adding
-or updating a cheatsheet.
+Start with the full 30-minute contributor walkthrough in
+[`docs/contributing.md`](./docs/contributing.md) if you are adding or updating a
+cheatsheet. For code and tooling changes, use the development guide in
+[`docs/DEVELOPMENT.md`](./docs/DEVELOPMENT.md).

 ## Quick path

 1. Install dependencies with `pnpm install`.
 2. Create or update a cheatsheet under `src/content/cheatsheets/<slug>/<slug>.md`.
-3. Validate the content:
+3. Validate the content and app:

    ```bash
    pnpm cheatsheet:lint 'src/content/cheatsheets/**/*.md' --no-links
@@ -20,7 +21,47 @@ or updating a cheatsheet.
    pnpm check:no-cdn
    ```

-4. Open a pull request with a short summary, linked issue, and validation notes.
+4. Open a pull request with a short summary, linked issue, screenshots or links
+   for visible UI changes, and validation notes.
+
+## Project guides
+
+- [User Guide](./docs/USER_GUIDE.md) — browsing and using the catalog.
+- [Development Guide](./docs/DEVELOPMENT.md) — local setup, scripts, tests, and
+  repository map.
+- [API and CLI Reference](./docs/API.md) — validator API, CLI flags, freshness
+  scanner, and no-CDN checker.
+- [Architecture](./docs/ARCHITECTURE.md) — static site, validator, CI, deploy,
+  and freshness flows.
+- [Deployment](./docs/DEPLOYMENT.md) — GitHub Pages build and release process.
+- [Changelog](./docs/CHANGELOG.md) — public-facing release notes.
+
+## Branches and commits
+
+- Branch from `main`.
+- Prefer short branch names that include the issue number when available, for
+  example `feat/63-claude-code-cheatsheet`.
+- Use conventional-style commit and PR titles already used by this repository,
+  such as `docs(cheatsheet): add claude-code cheatsheet` or
+  `fix(validator): handle missing references`.
+
+## Pull request checklist
+
+Before requesting review, confirm that relevant checks pass locally:
+
+- `pnpm cheatsheet:lint 'src/content/cheatsheets/**/*.md' --no-links`
+- `pnpm type-check`
+- `pnpm test`
+- `pnpm build`
+- `pnpm check:no-cdn`
+
+For browser-facing changes, run `pnpm test:e2e` when practical.
+
+## Security
+
+Do not commit secrets, real API keys, private tokens, or local environment
+files. Use placeholders in documentation and report security concerns through
+`SECURITY.md` rather than public issues.

 ## Licenses

diff --git a/SECURITY.md b/SECURITY.md
new file mode 100644
index 0000000..c5f9543
--- /dev/null
+++ b/SECURITY.md
@@ -0,0 +1,43 @@
+# Security Policy
+
+## Supported Versions
+
+| Version | Supported          |
+| ------- | ------------------ |
+| latest  | :white_check_mark: |
+
+## Reporting a Vulnerability
+
+We take security vulnerabilities seriously. If you discover a security issue, please report it responsibly.
+
+### How to Report
+
+1. **Do NOT** open a public GitHub issue for security vulnerabilities
+2. Email your findings to [INSERT SECURITY EMAIL]
+3. Include detailed steps to reproduce the vulnerability
+4. Allow up to 48 hours for an initial response
+
+### What to Include
+
+- Type of vulnerability
+- Full paths of affected source files
+- Location of the affected source code (tag/branch/commit or direct URL)
+- Step-by-step instructions to reproduce
+- Proof-of-concept or exploit code (if possible)
+- Impact of the issue
+
+### What to Expect
+
+- Acknowledgment of your report within 48 hours
+- Regular updates on our progress
+- Credit in the security advisory (if desired)
+- Notification when the issue is fixed
+
+## Security Best Practices
+
+When contributing to this project:
+
+- Never commit secrets, API keys, or credentials
+- Use environment variables for sensitive configuration
+- Follow secure coding practices
+- Report any security concerns immediately
diff --git a/docs/API.md b/docs/API.md
new file mode 100644
index 0000000..62be866
--- /dev/null
+++ b/docs/API.md
@@ -0,0 +1,115 @@
+# API and CLI Reference
+
+This repository is primarily a static site, but it includes reusable TypeScript tooling for validating cheatsheets and scanning freshness.
+
+## Validator API
+
+Entry point:
+
+```ts
+import { validate } from "./tools/validator/index.js";
+
+const result = await validate("src/content/cheatsheets/hermes-agent/hermes-agent.md", {
+  skipLinks: true,
+});
+```
+
+Result shape:
+
+```ts
+interface ValidationResult {
+  ok: boolean;
+  errors: {
+    rule: string;
+    message: string;
+    line?: number;
+  }[];
+}
+```
+
+Options:
+
+| Option | Type | Description |
+|---|---|---|
+| `skipLinks` | `boolean` | Skip external link checks. Also available with `CHEATSHEET_LINT_SKIP_LINKS=1`. |
+| `linkTimeoutMs` | `number` | Override the default external link timeout. |
+
+Rules are implemented under `tools/validator/rules/` and exported rule IDs live in `tools/validator/rules.ts`.
+
+## CLI: `pnpm cheatsheet:lint`
+
+Usage:
+
+```bash
+pnpm cheatsheet:lint <path-or-glob>... [options]
+```
+
+Options:
+
+| Option | Description |
+|---|---|
+| `--format=human` | Human-readable output, the default. |
+| `--format=json` | Single JSON document suitable for automation. |
+| `--no-links` | Skip external link checks. |
+| `--link-timeout-ms=<n>` | Set external link timeout in milliseconds. |
+| `-h`, `--help` | Show help. |
+
+Exit codes:
+
+| Code | Meaning |
+|---:|---|
+| `0` | All files passed. |
+| `1` | At least one file failed validation. |
+| `2` | Usage error, such as no inputs or an unknown flag. |
+
+Examples:
+
+```bash
+pnpm cheatsheet:lint src/content/cheatsheets/hermes-agent/hermes-agent.md
+pnpm cheatsheet:lint 'src/content/cheatsheets/**/*.md' --no-links
+pnpm --silent cheatsheet:lint src/content/cheatsheets/pi-dev/pi-dev.md --format=json
+```
+
+## Content schema
+
+Astro validates cheatsheet frontmatter in `src/content/config.ts`.
+
+Important fields:
+
+| Field | Description |
+|---|---|
+| `title` | Display title. |
+| `category` | One of `tool`, `mcp`, `concept`, `comparison`. |
+| `summary` | Catalog-card summary. |
+| `last_updated` | ISO date used for freshness. |
+| `stale_after_days` | Freshness budget. |
+| `tags` | Kebab-case tags. |
+| `status` | `poc`, `published`, or `deprecated`. |
+| `links.homepage` | Required homepage URL. |
+
+## Freshness scanner
+
+Script:
+
+```bash
+pnpm freshness:scan -- --dry-run
+```
+
+The non-dry-run mode expects GitHub Actions environment variables:
+
+| Variable | Purpose |
+|---|---|
+| `GITHUB_TOKEN` | Opens or searches issues. |
+| `GITHUB_REPOSITORY` | Target repo in `owner/repo` format. |
+| `CONTENT_DIR` | Optional override for tests/fixtures. |
+| `FRESHNESS_DRY_RUN=1` | Dry-run mode without writes. |
+
+## No-CDN checker
+
+Script:
+
+```bash
+pnpm check:no-cdn
+```
+
+It scans `dist/` for third-party CDN URLs after build. The policy and host list are documented in `docs/contributing.md`.
diff --git a/docs/ARCHITECTURE.md b/docs/ARCHITECTURE.md
new file mode 100644
index 0000000..5ab6e1e
--- /dev/null
+++ b/docs/ARCHITECTURE.md
@@ -0,0 +1,105 @@
+# Architecture
+
+Awesome AI Cheatsheets has three connected parts:
+
+1. a static Astro catalog site;
+2. a TypeScript validator/toolchain for the cheatsheet contract;
+3. GitHub Actions automation for CI, deployment, and freshness tracking.
+
+## System overview
+
+```mermaid
+flowchart LR
+  Author[Contributor or maintainer] --> Draft[Markdown cheatsheet]
+  Draft --> Content[src/content/cheatsheets]
+  Content --> Schema[Astro content schema]
+  Content --> Validator[tools/validator]
+  Schema --> Build[Astro build]
+  Validator --> CI[GitHub Actions CI]
+  Build --> Pagefind[Pagefind index]
+  Pagefind --> Dist[dist]
+  Dist --> Pages[GitHub Pages]
+  Content --> Freshness[Freshness scanner]
+  Freshness --> Issues[needs-update issues]
+```
+
+## Static site
+
+Astro renders the public site from `src/pages/`, `src/layouts/`, and `src/components/`.
+
+Key files:
+
+| File | Role |
+|---|---|
+| `astro.config.mjs` | Astro integrations, GitHub Pages `site` and `base`, static output. |
+| `src/pages/index.astro` | Catalog landing page. |
+| `src/pages/cheatsheets/[slug]/index.astro` | Detail page for each cheatsheet. |
+| `src/layouts/CheatsheetLayout.astro` | Shared cheatsheet page presentation. |
+| `src/content/config.ts` | Content collection schema for frontmatter. |
+| `src/plugins/remark-mermaid.ts` | Mermaid rendering support for diagrams. |
+
+## Content model
+
+Cheatsheets live at:
+
+```text
+src/content/cheatsheets/<slug>/<slug>.md
+```
+
+Frontmatter is validated by the Astro collection schema in `src/content/config.ts`. Required concepts include title, category, summary, freshness metadata, tags, status, and links.
+
+The validator adds template-specific checks that go beyond frontmatter:
+
+- required sections in locked order;
+- one-liner presence;
+- collapsed reference section;
+- Mermaid syntax;
+- optional external link probing.
+
+## Validator and CLI
+
+The validator entry point is `tools/validator/index.ts`.
+
+The CLI wrapper is `tools/cli/lint.ts`, exposed as:
+
+```bash
+pnpm cheatsheet:lint <path-or-glob> [--no-links] [--format=human|json]
+```
+
+It returns:
+
+- `0` when all files pass;
+- `1` when at least one file fails validation;
+- `2` for usage errors.
+
+## Automation flow
+
+```mermaid
+flowchart TB
+  PR[Pull request] --> Lint[lint.yml]
+  PR --> CI[ci.yml]
+  Lint --> Contract[cheatsheet contract lint + Vitest]
+  CI --> Typecheck[TypeScript]
+  CI --> Unit[Vitest]
+  CI --> Build[Astro + Pagefind]
+  CI --> NoCDN[No-CDN gate]
+  CI --> Lighthouse[Lighthouse CI]
+  Main[Push to main] --> Deploy[deploy.yml]
+  Deploy --> Pages[GitHub Pages]
+  Schedule[Weekly cron] --> Freshness[freshness.yml]
+  Freshness --> NeedsUpdate[needs-update issues]
+```
+
+## Freshness automation
+
+`tools/ci/freshness-scan.ts` scans cheatsheets, computes staleness with `tools/utils/freshness.ts`, and opens deduplicated `needs-update` issues when entries pass their freshness budget.
+
+The workflow runs every Monday at 09:00 UTC and can be triggered manually in dry-run mode.
+
+## Security and privacy posture
+
+- The built site is static.
+- The no-CDN gate blocks baseline third-party CDN dependencies in `dist/`.
+- Google Analytics is documented as consent-gated, not loaded by default.
+- GitHub Actions use narrow permissions per workflow.
+- Secrets are not required for local development.
diff --git a/docs/CHANGELOG.md b/docs/CHANGELOG.md
new file mode 100644
index 0000000..e5eaa6e
--- /dev/null
+++ b/docs/CHANGELOG.md
@@ -0,0 +1,38 @@
+# Changelog
+
+This project follows a lightweight changelog for public-facing changes. Dates use `YYYY-MM-DD`.
+
+## 0.1.0 — 2026-05-19
+
+Initial public launch readiness baseline.
+
+### Added
+
+- Astro-powered static catalog for structured AI tool and concept cheatsheets.
+- Published launch cheatsheets for Hermes Agent and Pi.
+- Locked cheatsheet template contract with a seven-section structure.
+- `pnpm cheatsheet:lint` CLI for validating cheatsheet markdown.
+- TypeScript validator rules for frontmatter, required sections, one-liner, references, Mermaid, and links.
+- Freshness metadata and weekly freshness scanner for opening `needs-update` issues.
+- Pagefind search index generated during build.
+- GitHub Actions workflows for CI, cheatsheet linting, freshness scanning, and GitHub Pages deployment.
+- No-CDN gate for generated `dist/` output.
+- Brand assets and public catalog README.
+
+### Documentation
+
+- Root README with problem statement, quick start, roadmap, contribution flow, and license notes.
+- Contributor tutorial for the `/cheatsheet-scribe` authoring workflow.
+- Launch checklist and soft-launch tracker.
+
+### Licenses
+
+- Code: MIT.
+- Cheatsheet/content prose, diagrams, and examples: CC BY 4.0.
+
+## Unreleased
+
+### Planned
+
+- Additional cheatsheets from the v1.1 roadmap.
+- More contributor-facing examples and validation fixtures as the catalog grows.
diff --git a/docs/DEPLOYMENT.md b/docs/DEPLOYMENT.md
new file mode 100644
index 0000000..3c625a3
--- /dev/null
+++ b/docs/DEPLOYMENT.md
@@ -0,0 +1,89 @@
+# Deployment Guide
+
+Awesome AI Cheatsheets deploys as a static Astro site to GitHub Pages.
+
+## Build configuration
+
+`astro.config.mjs` defines:
+
+```js
+site: 'https://luongnv89.github.io',
+base: '/awesome-cheatsheets',
+output: 'static'
+```
+
+The build command is:
+
+```bash
+pnpm build
+```
+
+This runs:
+
+1. `astro build` — generates the static site in `dist/`;
+2. `pagefind --site dist` — creates the search index under `dist/pagefind/`.
+
+## Local verification
+
+Before publishing, run:
+
+```bash
+pnpm type-check
+pnpm test
+pnpm build
+pnpm check:no-cdn
+pnpm exec lhci autorun
+```
+
+For full browser coverage:
+
+```bash
+pnpm test:e2e
+```
+
+## GitHub Pages workflow
+
+Deployment is handled by `.github/workflows/deploy.yml`.
+
+Trigger:
+
+- every push to `main`;
+- manual `workflow_dispatch`.
+
+Workflow shape:
+
+1. check out the repository;
+2. install pnpm and Node.js 20;
+3. run `pnpm install --frozen-lockfile`;
+4. run `pnpm build`;
+5. upload `dist/` with `actions/upload-pages-artifact`;
+6. publish with `actions/deploy-pages`.
+
+The workflow declares the required permissions:
+
+```yaml
+contents: read
+pages: write
+id-token: write
+```
+
+## One-time repository setting
+
+In GitHub, set:
+
+```text
+Settings → Pages → Build and deployment → Source → GitHub Actions
+```
+
+The workflow does not push to a `gh-pages` branch.
+
+## Production URLs
+
+- Catalog: <https://luongnv89.github.io/awesome-cheatsheets/>
+- About: <https://luongnv89.github.io/awesome-cheatsheets/about/>
+- Hermes Agent: <https://luongnv89.github.io/awesome-cheatsheets/cheatsheets/hermes-agent/>
+- Pi: <https://luongnv89.github.io/awesome-cheatsheets/cheatsheets/pi-dev/>
+
+## Rollback
+
+GitHub Pages serves the artifact from the latest successful deploy workflow. To roll back, revert the offending commit on `main` and let the deploy workflow publish the previous good site state.
diff --git a/docs/DEVELOPMENT.md b/docs/DEVELOPMENT.md
new file mode 100644
index 0000000..7bad95d
--- /dev/null
+++ b/docs/DEVELOPMENT.md
@@ -0,0 +1,86 @@
+# Development Guide
+
+This guide covers local development for the Astro site and TypeScript authoring tools.
+
+## Prerequisites
+
+- Node.js `>=20`
+- pnpm `10.28.0` via the `packageManager` field in `package.json`
+- Git
+
+Install dependencies:
+
+```bash
+pnpm install
+```
+
+## Common commands
+
+| Task | Command |
+|---|---|
+| Start local site | `pnpm dev` |
+| Build static site and Pagefind index | `pnpm build` |
+| Preview production build | `pnpm preview` |
+| Type-check | `pnpm type-check` |
+| Run unit tests | `pnpm test` |
+| Run unit tests in watch mode | `pnpm test:watch` |
+| Run Playwright e2e tests | `pnpm test:e2e` |
+| Lint a cheatsheet | `pnpm cheatsheet:lint <file>` |
+| Check generated output for third-party CDN URLs | `pnpm check:no-cdn` |
+| Run freshness scan | `pnpm freshness:scan -- --dry-run` |
+
+## Repository map
+
+| Path | Purpose |
+|---|---|
+| `src/pages/` | Astro routes for catalog, details, about, and error pages. |
+| `src/components/` | UI components used by the catalog and detail pages. |
+| `src/layouts/` | Shared page layouts. |
+| `src/content/cheatsheets/` | Published cheatsheet markdown entries. |
+| `src/content/config.ts` | Astro content collection schema and frontmatter validation. |
+| `src/plugins/remark-mermaid.ts` | Mermaid remark integration. |
+| `tools/validator/` | Template-contract validator implementation and tests. |
+| `tools/cli/lint.ts` | `pnpm cheatsheet:lint` CLI wrapper. |
+| `tools/ci/` | CI helpers for freshness scanning and no-CDN enforcement. |
+| `skills/cheatsheet-scribe/` | Local authoring skill and examples for generating cheatsheets. |
+| `e2e/` | Playwright coverage for catalog/search/filter/page behavior. |
+
+## Authoring cheatsheets
+
+Create entries under:
+
+```text
+src/content/cheatsheets/<slug>/<slug>.md
+```
+
+Validate locally:
+
+```bash
+pnpm cheatsheet:lint src/content/cheatsheets/<slug>/<slug>.md --no-links
+pnpm type-check
+pnpm test
+pnpm build
+pnpm check:no-cdn
+```
+
+Use the contributor tutorial at `docs/contributing.md` for the full authoring workflow.
+
+## Testing strategy
+
+- Vitest covers the validator, CLI, freshness logic, and CI helpers.
+- Playwright covers catalog browsing, filters, search, freshness display, and core pages.
+- Lighthouse CI runs in the main CI workflow against representative generated pages.
+- The no-CDN gate scans `dist/` after build.
+
+## Generated files
+
+The following are generated or local-only and should remain untracked:
+
+- `node_modules/`
+- `dist/`
+- `.astro/`
+- `.lighthouseci/`
+- `test-results/`
+- `playwright-report/`
+
+If a check behaves strangely, remove the generated directory and rebuild.
diff --git a/docs/OSS_READINESS_CHECKLIST.md b/docs/OSS_READINESS_CHECKLIST.md
new file mode 100644
index 0000000..f5f8d61
--- /dev/null
+++ b/docs/OSS_READINESS_CHECKLIST.md
@@ -0,0 +1,88 @@
+# Open Source Project Checklist
+
+> Concise but comprehensive — everything needed for a clean, professional, contributor-friendly repo.
+
+Track progress here. Mark each item with `[x]` once verified, and add a one-line note pointing to the file, command, or PR that proves it.
+
+## 1. License
+
+- [ ] Choose a standard license (MIT, Apache 2.0, or GPLv3 recommended)
+- [ ] Add `LICENSE` file in root (exact license text, no modifications)
+- [ ] License is detected by GitHub (shows in repo header) — verify with `gh repo view --json licenseInfo`
+
+## 2. Codebase Cleanup
+
+- [ ] Remove all secrets, keys, passwords, `.env` examples (use `.env.example`)
+- [ ] Proper `.gitignore` (language-specific, ignore build artifacts)
+- [ ] Consistent code style (linter + formatter run)
+- [ ] No unnecessary files (build folders, caches, IDE files)
+- [ ] Sensitive history cleaned if needed (`git filter-repo`)
+
+## 3. Repository Setup
+
+- [ ] Clear, descriptive repo name
+- [ ] One-sentence description
+- [ ] Relevant topics/tags added
+- [ ] Repository is **Public**
+- [ ] Issues, Discussions, and Projects enabled
+
+## 4. Essential Documentation
+
+- [ ] `README.md` — well-structured with:
+  - Project title + tagline
+  - Badges (build, version, license, etc.)
+  - Features
+  - Quick install & usage examples
+  - Screenshot/GIF (if applicable)
+  - Contribution section
+  - License & acknowledgments
+- [ ] `CONTRIBUTING.md` — setup instructions, coding standards, PR process
+- [ ] `CODE_OF_CONDUCT.md` (Contributor Covenant recommended)
+- [ ] `SECURITY.md` — vulnerability reporting instructions
+- [ ] Issue & PR templates (`.github/ISSUE_TEMPLATE/` and `PULL_REQUEST_TEMPLATE.md`)
+
+## 5. Testing & Automation
+
+- [ ] Unit/integration tests exist and pass
+- [ ] CI/CD pipeline (GitHub Actions recommended):
+  - Lint + test on push/PR
+  - Build verification
+- [ ] Dependabot enabled for dependency updates
+- [ ] Code coverage (optional but strong signal)
+
+## 6. GitHub Settings & Policies
+
+- [ ] Default branch = `main`
+- [ ] Branch protection on `main` (require PR review + status checks)
+- [ ] Community profile is "Healthy" (license + CoC + templates)
+- [ ] Clear issue labels (`good first issue`, `bug`, `enhancement`, etc.)
+- [ ] Repository topics and description optimized for discovery
+
+## 7. Packaging & Installation
+
+- [ ] Easy install command in README (e.g. `pip install .`, `npm install`, etc.)
+- [ ] Proper package metadata (`pyproject.toml`, `package.json`, `Cargo.toml`, etc.)
+- [ ] Published to package registry (PyPI, npm, crates.io, etc.) — if applicable
+
+## 8. Final Polish & Release
+
+- [ ] `CHANGELOG.md` or GitHub Releases with clear versioning
+- [ ] Roadmap or future plans visible
+- [ ] No broken links or outdated info
+- [ ] At least one other maintainer (optional but recommended)
+- [ ] First issues welcoming to new contributors
+
+## Bonus "Great" Items (Highly Recommended)
+
+- [ ] Conventional commits
+- [ ] Architecture diagram or demo GIF in README
+- [ ] Pre-commit hooks
+- [ ] Funding file (`FUNDING.yml`) if you want sponsorships
+
+---
+
+## Quick Validation
+
+Visit your repo → **Insights → Community** tab. Aim for all green checks.
+
+Mark everything as done, and your project will give an excellent first impression to users and contributors.
diff --git a/docs/USER_GUIDE.md b/docs/USER_GUIDE.md
new file mode 100644
index 0000000..f40c5c7
--- /dev/null
+++ b/docs/USER_GUIDE.md
@@ -0,0 +1,64 @@
+# User Guide
+
+Awesome AI Cheatsheets is a static catalog of structured, freshness-aware references for AI coding agents, MCPs, and related concepts.
+
+## Browse the catalog
+
+Open the live site:
+
+- Catalog: <https://luongnv89.github.io/awesome-cheatsheets/>
+- About: <https://luongnv89.github.io/awesome-cheatsheets/about/>
+
+From the catalog page you can:
+
+- search across cheatsheet titles, summaries, tags, and content;
+- filter by category;
+- open each cheatsheet as a stable, shareable page;
+- use visible freshness metadata to decide whether an entry may need review.
+
+## Categories
+
+Cheatsheets use the categories defined in `src/content/config.ts`:
+
+| Category | Use |
+|---|---|
+| `tool` | A concrete tool or application, such as a coding agent CLI. |
+| `mcp` | Model Context Protocol servers, clients, or workflows. |
+| `concept` | Reusable ideas, patterns, or workflows. |
+| `comparison` | Side-by-side decision aids across tools or approaches. |
+
+## How to read a cheatsheet
+
+Each published cheatsheet follows the locked structure enforced by the validator and documented in `skills/cheatsheet-scribe/template-contract.md`:
+
+1. one-liner;
+2. mental model, usually with a Mermaid diagram;
+3. step-by-step setup and optimization;
+4. best practices;
+5. quick command reference;
+6. expected outcomes;
+7. collapsed references.
+
+This consistency is the point: once you learn the structure, every entry is skimmable the same way.
+
+## Freshness signals
+
+Each cheatsheet carries:
+
+- `last_updated` — the last verified date;
+- `stale_after_days` — the freshness budget for that topic.
+
+The site and weekly freshness workflow use the same freshness logic from `tools/utils/freshness.ts`. When an entry goes stale, the workflow can open a `needs-update` issue.
+
+## Request or contribute a cheatsheet
+
+To request a new entry, open an issue with the tool/concept name, why it matters, and any useful source links.
+
+To contribute one yourself:
+
+1. read the [30-minute contributor tutorial](./contributing.md);
+2. draft the cheatsheet under `src/content/cheatsheets/<slug>/<slug>.md`;
+3. run the validator and checks from [Development](./DEVELOPMENT.md);
+4. open a pull request.
+
+Good first issues are tracked with the `good first issue`, `help wanted`, and `content` labels.
