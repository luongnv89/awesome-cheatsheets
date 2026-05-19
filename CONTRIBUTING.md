# Contributing

Thanks for helping improve Awesome AI Cheatsheets.

Start with the full 30-minute contributor walkthrough in
[`docs/contributing.md`](./docs/contributing.md) if you are adding or updating a
cheatsheet. For code and tooling changes, use the development guide in
[`docs/DEVELOPMENT.md`](./docs/DEVELOPMENT.md).

## Quick path

1. Install dependencies with `pnpm install`.
2. Create or update a cheatsheet under `src/content/cheatsheets/<slug>/<slug>.md`.
3. Validate the content and app:

   ```bash
   pnpm cheatsheet:lint 'src/content/cheatsheets/**/*.md' --no-links
   pnpm type-check
   pnpm test
   pnpm build
   pnpm check:no-cdn
   ```

4. Open a pull request with a short summary, linked issue, screenshots or links
   for visible UI changes, and validation notes.

## Project guides

- [User Guide](./docs/USER_GUIDE.md) — browsing and using the catalog.
- [Development Guide](./docs/DEVELOPMENT.md) — local setup, scripts, tests, and
  repository map.
- [API and CLI Reference](./docs/API.md) — validator API, CLI flags, freshness
  scanner, and no-CDN checker.
- [Architecture](./docs/ARCHITECTURE.md) — static site, validator, CI, deploy,
  and freshness flows.
- [Deployment](./docs/DEPLOYMENT.md) — GitHub Pages build and release process.
- [Changelog](./docs/CHANGELOG.md) — public-facing release notes.

## Branches and commits

- Branch from `main`.
- Prefer short branch names that include the issue number when available, for
  example `feat/63-claude-code-cheatsheet`.
- Use conventional-style commit and PR titles already used by this repository,
  such as `docs(cheatsheet): add claude-code cheatsheet` or
  `fix(validator): handle missing references`.

## Pull request checklist

Before requesting review, confirm that relevant checks pass locally:

- `pnpm cheatsheet:lint 'src/content/cheatsheets/**/*.md' --no-links`
- `pnpm type-check`
- `pnpm test`
- `pnpm build`
- `pnpm check:no-cdn`

For browser-facing changes, run `pnpm test:e2e` when practical.

## Security

Do not commit secrets, real API keys, private tokens, or local environment
files. Use placeholders in documentation and report security concerns through
`SECURITY.md` rather than public issues.

## Licenses

- Code contributions are accepted under the MIT License (`LICENSE`).
- Cheatsheet/content contributions are accepted under CC BY 4.0
  (`LICENSE-CONTENT`).

By contributing, you agree that your contribution may be distributed under the
relevant license above.
