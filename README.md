<p align="center">
  <a href="https://luongnv89.github.io/awesome-cheatsheets/">
    <img src="public/brand/full.svg" alt="Awesome AI Cheatsheets" width="420" />
  </a>
</p>

<h1 align="center">Reference, refreshed.</h1>

<p align="center">
  Rich-format, visibly-dated, mutually-comparable cheatsheets for terminal-native AI coding agents and the concepts behind them.
</p>

<p align="center">
  <a href="https://luongnv89.github.io/awesome-cheatsheets/"><strong>Browse the catalog →</strong></a>
  &nbsp;·&nbsp;
  <a href="https://luongnv89.github.io/awesome-cheatsheets/about/">Why it exists</a>
  &nbsp;·&nbsp;
  <a href="./docs/contributing.md">Contribute</a>
</p>

<p align="center">
  <a href="#license"><img alt="License: MIT + CC-BY-4.0" src="https://img.shields.io/badge/license-MIT%20%2B%20CC--BY--4.0-1B1F3A"></a>
  <a href="https://github.com/luongnv89/awesome-cheatsheets/actions/workflows/ci.yml"><img alt="CI" src="https://github.com/luongnv89/awesome-cheatsheets/actions/workflows/ci.yml/badge.svg"></a>
  <a href="https://luongnv89.github.io/awesome-cheatsheets/"><img alt="Site: GitHub Pages" src="https://img.shields.io/badge/site-GitHub%20Pages-F2B705?labelColor=1B1F3A"></a>
</p>

---

## The problem

AI tooling moves faster than its documentation. Every week brings a new agent, a new MCP, a new way to wire memory or skills — and the docs that come with them tend to fail in two directions:

- **Shallow READMEs** that skip the nuance, hand-wave the gotchas, and date silently.
- **Exhaustive reference docs** that bury the lede under hundreds of pages of API surface.

Either way, you spend the first hour figuring out the shape of the thing instead of using it.

## What this is

A curated catalog of cheatsheets that hit the middle ground. Every entry follows the same locked structure, carries a visible last-updated date, and gets flagged when it goes stale — so you can skim it the same way every time and trust the freshness signal at a glance.

Our wedge: **format + freshness + comparability**.

| Pillar | What it means |
|---|---|
| **Format** | One locked 7-section template — one-liner, mental model, quickstart, recipes, gotchas, reference, links. Skim the same way, every time. |
| **Freshness** | Every cheatsheet ships with `last_updated` and a `stale_after_days` budget. Past budget, it's flagged inline as *may be stale*. |
| **Comparability** | Because structure is fixed, two cheatsheets in the same category diff cleanly section-by-section. No re-learning a new layout per tool. |

## How it works

1. **Browse the catalog** at [luongnv89.github.io/awesome-cheatsheets](https://luongnv89.github.io/awesome-cheatsheets/) — filter by category (tool, mcp, concept, comparison) or tag, search the full corpus, and open any entry.
2. **Read a cheatsheet** like you read a man page: one-liner up top, mental-model diagram, quickstart commands, recipes for common jobs, gotchas pulled out plainly.
3. **Check the date.** Each entry surfaces its last-updated chip and flags itself as stale once the freshness budget elapses.

## What's inside

The catalog covers four kinds of references:

- **Tools** — terminal-native AI coding agents and adjacent CLIs (e.g. [Hermes Agent](./src/content/cheatsheets/hermes-agent/hermes-agent.md)).
- **MCPs** — Model Context Protocol servers and how to wire them.
- **Concepts** — patterns, primitives, and mental models behind the tooling.
- **Comparisons** — head-to-head diffs between mutually-relevant entries.

See the live site for the up-to-date list. The catalog is built statically and search-indexed at build time via [Pagefind](https://pagefind.app) — no third-party JavaScript, no runtime API.

## Quick start

Clone, install, dev-serve.

```bash
git clone https://github.com/luongnv89/awesome-cheatsheets.git
cd awesome-cheatsheets
pnpm install
pnpm dev
```

Build the static site and check the freshness/CDN gates the way CI does.

```bash
pnpm build               # astro build + pagefind index
pnpm type-check          # tsc --noEmit
pnpm test                # vitest unit tests
pnpm check:no-cdn        # CI gate: zero third-party hosts in dist/
pnpm freshness:scan      # surface entries past their stale budget
```

Lint a single cheatsheet against the template contract.

```bash
pnpm cheatsheet:lint src/content/cheatsheets/<slug>/<slug>.md
```

## Contribute

Cheatsheets are authored with [Claude Code](https://www.anthropic.com/claude-code) and the `/cheatsheet-scribe` skill. The contributor flow is the same one we run ourselves:

1. Install Claude Code.
2. Run `/cheatsheet-scribe`.
3. Answer the review questions; let it draft the 7-section file.
4. Open a PR — CI runs type-check, build, the no-CDN gate, and Lighthouse.

The full walkthrough is the **[30-minute contributor tutorial](./docs/contributing.md)**. All cheatsheets follow the [template contract](./.claude/skills/cheatsheet-scribe/template-contract.md) — required frontmatter, locked section order, copy-paste *Installation*, collapsed *Reference*.

## Brand and visual identity

The mark is a stack of cards with a folded corner — layered, ready-to-grab knowledge. Warm amber on deep ink reads like highlighter on a notebook page. Variants and color tokens live in [`public/brand/`](./public/brand/README.md); open [`public/brand/showcase.html`](./public/brand/showcase.html) for a side-by-side view.

| Token | Hex | Role |
|---|---|---|
| Ink | `#1B1F3A` | Text on light, content lines |
| Amber | `#F2B705` | Primary brand color |
| Coral | `#FF6B5C` | Accent — the folded corner |

## Repository layout

```
awesome-cheatsheets/
├── src/content/cheatsheets/  Published entries (one folder per slug)
├── src/                  Astro site (catalog, detail pages, layouts)
├── public/brand/         Logo set, favicons, color tokens
├── docs/                 Contributor tutorial, PRD
├── tools/                Validator, CI gates, freshness scanner
└── .claude/skills/       /cheatsheet-scribe authoring skill
```

## License

- Code: MIT
- Content: CC-BY 4.0

---

<p align="center">
  <a href="https://luongnv89.github.io/awesome-cheatsheets/"><strong>Browse the catalog →</strong></a>
</p>
