# Contributing

Thanks for helping improve Awesome AI Cheatsheets.

The full 30-minute contributor walkthrough lives in
[`docs/contributing.md`](./docs/contributing.md). Start there if you are adding
or updating a cheatsheet.

## Quick path

1. Install dependencies with `pnpm install`.
2. Create or update a cheatsheet under `src/content/cheatsheets/<slug>/<slug>.md`.
3. Validate the content:

   ```bash
   pnpm cheatsheet:lint 'src/content/cheatsheets/**/*.md' --no-links
   pnpm type-check
   pnpm test
   pnpm build
   pnpm check:no-cdn
   ```

4. Open a pull request with a short summary, linked issue, and validation notes.

## Licenses

- Code contributions are accepted under the MIT License (`LICENSE`).
- Cheatsheet/content contributions are accepted under CC BY 4.0
  (`LICENSE-CONTENT`).

By contributing, you agree that your contribution may be distributed under the
relevant license above.
