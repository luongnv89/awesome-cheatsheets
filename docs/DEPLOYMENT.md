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
2. install pnpm and Node.js 24;
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

## Security headers

GitHub Pages cannot emit custom HTTP response headers, so the site carries
its policy in two layers (issue #144):

- **`src/components/SecurityHeaders.astro`** — rendered into the `<head>` of
  every page by both layouts. It delivers the subset browsers honor without
  HTTP headers: a meta `Content-Security-Policy` and a meta `referrer`
  policy (`strict-origin-when-cross-origin`). The CSP is scoped to what the
  build emits — `'unsafe-inline'` on `script-src`/`style-src` is required by
  the inlined consent gate, inlined module scripts, `onclick` handlers, and
  `<style is:global>` blocks — plus the path-scoped
  `https://www.googletagmanager.com/gtag/` origin the consent-gated
  analytics loader uses, and `https://*.google-analytics.com` on
  `connect-src` for its collect endpoints.
- **`public/_headers`** — the `_headers` convention honored by Netlify and
  Cloudflare Pages. On GitHub Pages it is deployed but inert; it activates
  automatically if the site ever moves to a host that reads it. It carries
  the headers meta tags cannot express: `X-Frame-Options: DENY`,
  `frame-ancestors 'none'` inside the CSP, `X-Content-Type-Options`,
  `Referrer-Policy`, and `Permissions-Policy`.

Known limitation: on GitHub Pages there is no way to set `frame-ancestors`
or `X-Frame-Options` (the CSP spec ignores `frame-ancestors` in meta
delivery, and Pages offers no header hook), so clickjacking protection is
declared-only until the site is hosted somewhere that honors `_headers`.

Keep the two CSP directive lists in sync — the only intentional difference
is `frame-ancestors` (headers-only). The `no-cdn-check` gate allowlists the
`/gtag/` prefix used by both layers; any other `googletagmanager.com` URL is
still flagged.

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
