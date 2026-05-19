# Changelog

This project follows a lightweight changelog for public-facing changes. Dates use `YYYY-MM-DD`.

## 0.1.0 — 2026-05-19

Initial public launch readiness baseline.

### Added

- Astro-powered static catalog for structured AI tool and concept cheatsheets.
- Published launch cheatsheets for Hermes Agent and Pi.
- Locked cheatsheet template contract with a seven-section structure.
- `pnpm cheatsheet:lint` CLI for validating cheatsheet markdown.
- TypeScript validator rules for frontmatter, required sections, one-liner, references, Mermaid, and links.
- Freshness metadata and weekly freshness scanner for opening `needs-update` issues.
- Pagefind search index generated during build.
- GitHub Actions workflows for CI, cheatsheet linting, freshness scanning, and GitHub Pages deployment.
- No-CDN gate for generated `dist/` output.
- Brand assets and public catalog README.

### Documentation

- Root README with problem statement, quick start, roadmap, contribution flow, and license notes.
- Contributor tutorial for the `/cheatsheet-scribe` authoring workflow.
- Launch checklist and soft-launch tracker.

### Licenses

- Code: MIT.
- Cheatsheet/content prose, diagrams, and examples: CC BY 4.0.

## Unreleased

### Planned

- Additional cheatsheets from the v1.1 roadmap.
- More contributor-facing examples and validation fixtures as the catalog grows.
