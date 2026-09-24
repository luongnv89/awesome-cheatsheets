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
  &nbsp;·&nbsp;
  <a href="./docs/USER_GUIDE.md">Docs</a>
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

**Where it stands:** the catalog holds 15 cheatsheets — 6 published and 9 in draft (10 tools, 3 concepts, 1 MCP, and 1 comparison) — all built on the same authoring and validation tooling.

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

The catalog currently ships 6 published cheatsheets, with 9 more in draft:

- **Tools (published)** — [ASM](./src/content/cheatsheets/asm/asm.md), [Herdr](./src/content/cheatsheets/herdr/herdr.md), [Hermes Agent](./src/content/cheatsheets/hermes-agent/hermes-agent.md), [Obsidian](./src/content/cheatsheets/obsidian/obsidian.md), [Oh My Pi (omp)](./src/content/cheatsheets/omp/omp.md), and [Pi](./src/content/cheatsheets/pi-dev/pi-dev.md).
- **Tools (draft)** — [Claude Code](./src/content/cheatsheets/claude-code/claude-code.md), [Codex](./src/content/cheatsheets/codex/codex.md), [OpenClaw](./src/content/cheatsheets/openclaw/openclaw.md), and [OpenCode](./src/content/cheatsheets/opencode/opencode.md).
- **Concepts (draft)** — [Agent Skills](./src/content/cheatsheets/agent-skills/agent-skills.md), [Harness Engineering](./src/content/cheatsheets/harness-engineering/harness-engineering.md), and [Sub-agents](./src/content/cheatsheets/sub-agents/sub-agents.md).
- **MCP (draft)** — [Model Context Protocol](./src/content/cheatsheets/mcp/mcp.md).
- **Comparisons (draft)** — [Prompt Engineering](./src/content/cheatsheets/prompt-engineering-comparison/prompt-engineering-comparison.md).
- **`cheatsheet-scribe`** — the authoring skill and template contract used to keep entries comparable.

Draft entries render at their `/cheatsheets/<slug>/` URLs for review but stay off the catalog grid and search index until their frontmatter `status` flips to `published`.

The broader catalog covers four kinds of references:

- **Tools** — terminal-native AI coding agents and adjacent CLIs.
- **MCPs** — Model Context Protocol servers and how to wire them.
- **Concepts** — patterns, primitives, and mental models behind the tooling.
- **Comparisons** — head-to-head diffs between mutually-relevant entries.

See the live site for the up-to-date list. The catalog is built statically and search-indexed at build time via [Pagefind](https://pagefind.app) — no runtime API. The only third-party script is Google Analytics, and it is gated behind explicit cookie-consent (default-deny, no tracking until you click Accept).

## Roadmap

The v1.1 contribution wave is in draft — Claude Code, Codex, OpenCode, OpenClaw, Harness Engineering, Agent Skills, Sub-agents, MCP, and the Prompt Engineering comparison are committed and rendering at their URLs, awaiting `status: published`. Community additions ASM, Herdr, Obsidian, and Oh My Pi are already live. New seeds land as `good first issue`s on the [issue tracker](https://github.com/luongnv89/awesome-cheatsheets/issues) — each links back to the contributor tutorial and the scribe-friendly draft format.

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
pnpm test:e2e            # playwright e2e tests (builds the site first)
pnpm check:no-cdn        # CI gate: zero third-party hosts in dist/
pnpm freshness:scan      # surface entries past their stale budget
```

The full script table — coverage, watch mode, and the e2e fixture build — lives in [docs/DEVELOPMENT.md](./docs/DEVELOPMENT.md).

Lint a single cheatsheet against the template contract.

```bash
pnpm cheatsheet:lint src/content/cheatsheets/<slug>/<slug>.md
```

## Configuration

The production site is configured in [`astro.config.mjs`](./astro.config.mjs):

- `site`: `https://luongnv89.github.io`
- `base`: `/awesome-cheatsheets`
- `output`: static HTML

Cheatsheet metadata is validated by [`src/content.config.ts`](./src/content.config.ts). The most important frontmatter fields are `category`, `summary`, `last_updated`, `stale_after_days`, `tags`, `status`, and `links.homepage`.

## Documentation

| Guide | What it covers |
|---|---|
| [User Guide](./docs/USER_GUIDE.md) | Browsing the catalog, categories, freshness signals, and requesting entries. |
| [Development](./docs/DEVELOPMENT.md) | Local setup, scripts, tests, repository map, and generated files. |
| [Architecture](./docs/ARCHITECTURE.md) | Static site, content flow, validator, CI, deploy, and freshness automation. |
| [API and CLI](./docs/API.md) | `validate()`, `pnpm cheatsheet:lint`, freshness scanner, and no-CDN checker. |
| [Deployment](./docs/DEPLOYMENT.md) | GitHub Pages workflow, build settings, verification, and rollback. |
| [Changelog](./docs/CHANGELOG.md) | Public-facing release notes. |
| [Contributor tutorial](./docs/contributing.md) | 30-minute cheatsheet authoring walkthrough with `/cheatsheet-scribe`. |

## Contribute

Cheatsheets are authored with [Claude Code](https://www.anthropic.com/claude-code) and the `/cheatsheet-scribe` skill. The contributor flow is the same one we run ourselves:

1. Install Claude Code.
2. Run `/cheatsheet-scribe`.
3. Answer the review questions; let it draft the 7-section file.
4. Open a PR — CI runs type-check, unit tests, Playwright e2e, build, the no-CDN gate, and Lighthouse.

The full walkthrough is the **[30-minute contributor tutorial](./docs/contributing.md)**. The root [contributing guide](./CONTRIBUTING.md) covers PR expectations and validation commands. All cheatsheets follow the [template contract](./skills/cheatsheet-scribe/template-contract.md) — required frontmatter, locked section order, copy-paste *Installation*, collapsed *Reference*.

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
├── docs/                 User, development, architecture, API, deployment docs
├── tools/                Validator, CI gates, freshness scanner
└── skills/               Canonical authoring skills (`.claude/skills/` and
                          `.agents/skills/` are `pnpm skills:sync` mirrors)
```

## Related Publications

No related publications have been confirmed yet. If you cite or discuss Awesome AI Cheatsheets in a paper, article, benchmark, or talk, please open an issue or PR so it can be listed here.

## License

- Code: [MIT](./LICENSE)
- Content: [CC-BY 4.0](./LICENSE-CONTENT)

---

<p align="center">
  <a href="https://luongnv89.github.io/awesome-cheatsheets/"><strong>Browse the catalog →</strong></a>
</p>
