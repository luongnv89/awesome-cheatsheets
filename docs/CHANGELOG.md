# Changelog

This project follows a lightweight changelog for public-facing changes. Dates use `YYYY-MM-DD`.

## Unreleased

### Added

- Thirteen post-launch cheatsheets — ASM, Claude Code, Codex, Herdr, Obsidian,
  Oh My Pi (omp), OpenClaw, OpenCode, Agent Skills, Harness Engineering,
  Sub-agents, MCP, and the Prompt Engineering comparison — bringing the
  catalog to 15 entries (6 published, 9 in draft).

### Fixed

- Link check probes now cancel the response body before returning and run
  through a bounded pool (`MAX_IN_FLIGHT = 8`) instead of an unbounded
  `Promise.all` fan-out — no more leaked keep-alive sockets or descriptor
  storms on link-heavy sheets (#139).
- Step checkboxes no longer crash when `cheatsheet-progress:*` localStorage
  holds a non-object JSON payload; malformed values reset to empty progress
  (#139).

### Changed

- Validator `ValidateOptions`: replaced the `skipLinks` boolean with a
  `links: "check" | "skip"` mode string (`LinkCheckMode`). The
  `pnpm cheatsheet:lint --no-links` flag and the
  `CHEATSHEET_LINT_SKIP_LINKS=1` environment variable are unchanged.

### Planned

- More contributor-facing examples and validation fixtures as the catalog grows.

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
