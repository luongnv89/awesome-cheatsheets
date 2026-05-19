# Deployment Guide

Awesome AI Cheatsheets deploys as a static Astro site to GitHub Pages.

## Build configuration

`astro.config.mjs` defines:

```js
site: 'https://luongnv89.github.io',
base: '/awesome-cheatsheets',
output: 'static'
```

The build command is:

```bash
pnpm build
```

This runs:

1. `astro build` — generates the static site in `dist/`;
2. `pagefind --site dist` — creates the search index under `dist/pagefind/`.

## Local verification

Before publishing, run:

```bash
pnpm type-check
pnpm test
pnpm build
pnpm check:no-cdn
pnpm exec lhci autorun
```

For full browser coverage:

```bash
pnpm test:e2e
```

## GitHub Pages workflow

Deployment is handled by `.github/workflows/deploy.yml`.

Trigger:

- every push to `main`;
- manual `workflow_dispatch`.

Workflow shape:

1. check out the repository;
2. install pnpm and Node.js 20;
3. run `pnpm install --frozen-lockfile`;
4. run `pnpm build`;
5. upload `dist/` with `actions/upload-pages-artifact`;
6. publish with `actions/deploy-pages`.

The workflow declares the required permissions:

```yaml
contents: read
pages: write
id-token: write
```

## One-time repository setting

In GitHub, set:

```text
Settings → Pages → Build and deployment → Source → GitHub Actions
```

The workflow does not push to a `gh-pages` branch.

## Production URLs

- Catalog: <https://luongnv89.github.io/awesome-cheatsheets/>
- About: <https://luongnv89.github.io/awesome-cheatsheets/about/>
- Hermes Agent: <https://luongnv89.github.io/awesome-cheatsheets/cheatsheets/hermes-agent/>
- Pi: <https://luongnv89.github.io/awesome-cheatsheets/cheatsheets/pi-dev/>

## Rollback

GitHub Pages serves the artifact from the latest successful deploy workflow. To roll back, revert the offending commit on `main` and let the deploy workflow publish the previous good site state.
