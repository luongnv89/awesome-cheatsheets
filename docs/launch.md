# Launch Checklist and Soft-Launch Tracker

**Date:** 2026-05-19  
**Scope:** early launch with 2 cheatsheets (Hermes Agent + Pi), plus roadmap to 11.

## Launch checklist sweep

| Gate | Status | Evidence |
|---|---:|---|
| Hermes and Pi cheatsheets lint clean | ✅ | `pnpm cheatsheet:lint 'src/content/cheatsheets/**/*.md' --no-links` |
| Catalog, detail pages, About, and 404 render | ✅ | `pnpm build` and Lighthouse CI URL set in `.lighthouserc.json` |
| No external CDN URLs in `dist/` | ✅ | `pnpm check:no-cdn` |
| Repository licenses present | ✅ | `LICENSE` (MIT) and `LICENSE-CONTENT` (CC BY 4.0) |
| Contributor guide present | ✅ | `CONTRIBUTING.md` and `docs/contributing.md` |
| `cheatsheet-scribe` smoke path recorded | ✅ | `docs/scribe-pi-run.md` and `docs/scribe-retro-1.md` |
| Freshness CI green locally | ✅ | `pnpm freshness:scan -- --dry-run` |
| README reflects early launch scope | ✅ | README now states "2 cheatsheets at launch, 9 more coming" |

## Soft-launch message

Awesome AI Cheatsheets is launching small on purpose: 2 deeply structured cheatsheets today, 9 more coming next.

The wedge is format + freshness + comparability:

- same locked structure for every agent/tool,
- visible `last_updated` freshness metadata,
- CI-backed linting so the shape stays comparable,
- a `/cheatsheet-scribe` authoring skill so contributors can add entries without relearning the format.

Start here:

- Catalog: https://luongnv89.github.io/awesome-cheatsheets/
- Hermes Agent: https://luongnv89.github.io/awesome-cheatsheets/cheatsheets/hermes-agent/
- Pi: https://luongnv89.github.io/awesome-cheatsheets/cheatsheets/pi-dev/
- Contributor tutorial: https://github.com/luongnv89/awesome-cheatsheets/blob/main/docs/contributing.md

Roadmap: Claude Code, Codex, OpenCode, OpenClaw, Harness Engineering, Agent Skills, Sub-agents, MCP, and Prompt Engineering / comparison.

## Channel URL log

External posting requires account access outside this repository. Record posted URLs here as soon as they are live.

| Channel | URL | Notes |
|---|---|---|
| Hacker News | _pending_ | Use the soft-launch message above; title: `Awesome AI Cheatsheets: formatted, fresh references for coding agents` |
| Reddit r/ClaudeAI | _pending_ | Emphasize Claude Code contributor flow and `/cheatsheet-scribe` |
| Reddit r/LocalLLaMA | _pending_ | Emphasize local-agent/tool comparison roadmap |
| X / Twitter | _pending_ | Thread outline below |

## X thread outline

1. Launching Awesome AI Cheatsheets: small v1, deliberate format, freshness, comparability.
2. Today: Hermes Agent + Pi. Both follow the same structure so you can diff the mental model, commands, gotchas, and references.
3. The key constraint: visible freshness dates and CI-backed template linting.
4. Contributors can use `/cheatsheet-scribe` plus the 30-minute tutorial.
5. Roadmap: 9 more cheatsheets — Claude Code, Codex, OpenCode, OpenClaw, Harness Engineering, Agent Skills, Sub-agents, MCP, Prompt Engineering / comparison.
6. Link: https://luongnv89.github.io/awesome-cheatsheets/

## First-72-hour feedback triage

When launch replies arrive, convert them into GitHub issues using this mapping:

| Feedback type | Label | Target |
|---|---|---|
| Broken command/link | `bug` | Existing cheatsheet |
| Missing tool request | `good first issue`, `help wanted` | New cheatsheet seed |
| Format/schema complaint | `improvement`, `scribe` | `cheatsheet-scribe` or validator |
| Site/search issue | `bug` | Astro catalog |
