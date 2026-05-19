--- README.md	2026-05-19 16:08:14
+++ .oss-ready/04-readme-draft.md	2026-05-19 16:30:51
@@ -16,6 +16,8 @@
   <a href="https://luongnv89.github.io/awesome-cheatsheets/about/">Why it exists</a>
   &nbsp;·&nbsp;
   <a href="./docs/contributing.md">Contribute</a>
+  &nbsp;·&nbsp;
+  <a href="./docs/USER_GUIDE.md">Docs</a>
 </p>

 <p align="center">
@@ -103,6 +105,28 @@
 pnpm cheatsheet:lint src/content/cheatsheets/<slug>/<slug>.md
 ```

+## Configuration
+
+The production site is configured in [`astro.config.mjs`](./astro.config.mjs):
+
+- `site`: `https://luongnv89.github.io`
+- `base`: `/awesome-cheatsheets`
+- `output`: static HTML
+
+Cheatsheet metadata is validated by [`src/content/config.ts`](./src/content/config.ts). The most important frontmatter fields are `category`, `summary`, `last_updated`, `stale_after_days`, `tags`, `status`, and `links.homepage`.
+
+## Documentation
+
+| Guide | What it covers |
+|---|---|
+| [User Guide](./docs/USER_GUIDE.md) | Browsing the catalog, categories, freshness signals, and requesting entries. |
+| [Development](./docs/DEVELOPMENT.md) | Local setup, scripts, tests, repository map, and generated files. |
+| [Architecture](./docs/ARCHITECTURE.md) | Static site, content flow, validator, CI, deploy, and freshness automation. |
+| [API and CLI](./docs/API.md) | `validate()`, `pnpm cheatsheet:lint`, freshness scanner, and no-CDN checker. |
+| [Deployment](./docs/DEPLOYMENT.md) | GitHub Pages workflow, build settings, verification, and rollback. |
+| [Changelog](./docs/CHANGELOG.md) | Public-facing release notes. |
+| [Contributor tutorial](./docs/contributing.md) | 30-minute cheatsheet authoring walkthrough with `/cheatsheet-scribe`. |
+
 ## Contribute

 Cheatsheets are authored with [Claude Code](https://www.anthropic.com/claude-code) and the `/cheatsheet-scribe` skill. The contributor flow is the same one we run ourselves:
@@ -112,7 +136,7 @@
 3. Answer the review questions; let it draft the 7-section file.
 4. Open a PR — CI runs type-check, build, the no-CDN gate, and Lighthouse.

-The full walkthrough is the **[30-minute contributor tutorial](./docs/contributing.md)**. All cheatsheets follow the [template contract](./skills/cheatsheet-scribe/template-contract.md) — required frontmatter, locked section order, copy-paste *Installation*, collapsed *Reference*.
+The full walkthrough is the **[30-minute contributor tutorial](./docs/contributing.md)**. The root [contributing guide](./CONTRIBUTING.md) covers PR expectations and validation commands. All cheatsheets follow the [template contract](./skills/cheatsheet-scribe/template-contract.md) — required frontmatter, locked section order, copy-paste *Installation*, collapsed *Reference*.

 ## Brand and visual identity

@@ -131,15 +155,19 @@
 ├── src/content/cheatsheets/  Published entries (one folder per slug)
 ├── src/                  Astro site (catalog, detail pages, layouts)
 ├── public/brand/         Logo set, favicons, color tokens
-├── docs/                 Contributor tutorial, PRD
+├── docs/                 User, development, architecture, API, deployment docs
 ├── tools/                Validator, CI gates, freshness scanner
 └── .claude/skills/       /cheatsheet-scribe authoring skill
 ```

+## Related Publications
+
+No related publications have been confirmed yet. If you cite or discuss Awesome AI Cheatsheets in a paper, article, benchmark, or talk, please open an issue or PR so it can be listed here.
+
 ## License

-- Code: MIT
-- Content: CC-BY 4.0
+- Code: [MIT](./LICENSE)
+- Content: [CC-BY 4.0](./LICENSE-CONTENT)

 ---

Step 5 confirmation: repo-local publication scan found no confirmed entries, and the user confirmed "No known publications. No web search." The placeholder Related Publications section in the README is therefore the approved final section for this run.
