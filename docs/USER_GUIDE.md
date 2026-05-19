# User Guide

Awesome AI Cheatsheets is a static catalog of structured, freshness-aware references for AI coding agents, MCPs, and related concepts.

## Browse the catalog

Open the live site:

- Catalog: <https://luongnv89.github.io/awesome-cheatsheets/>
- About: <https://luongnv89.github.io/awesome-cheatsheets/about/>

From the catalog page you can:

- search across cheatsheet titles, summaries, tags, and content;
- filter by category;
- open each cheatsheet as a stable, shareable page;
- use visible freshness metadata to decide whether an entry may need review.

## Categories

Cheatsheets use the categories defined in `src/content/config.ts`:

| Category | Use |
|---|---|
| `tool` | A concrete tool or application, such as a coding agent CLI. |
| `mcp` | Model Context Protocol servers, clients, or workflows. |
| `concept` | Reusable ideas, patterns, or workflows. |
| `comparison` | Side-by-side decision aids across tools or approaches. |

## How to read a cheatsheet

Each published cheatsheet follows the locked structure enforced by the validator and documented in `skills/cheatsheet-scribe/template-contract.md`:

1. one-liner;
2. mental model, usually with a Mermaid diagram;
3. step-by-step setup and optimization;
4. best practices;
5. quick command reference;
6. expected outcomes;
7. collapsed references.

This consistency is the point: once you learn the structure, every entry is skimmable the same way.

## Freshness signals

Each cheatsheet carries:

- `last_updated` — the last verified date;
- `stale_after_days` — the freshness budget for that topic.

The site and weekly freshness workflow use the same freshness logic from `tools/utils/freshness.ts`. When an entry goes stale, the workflow can open a `needs-update` issue.

## Request or contribute a cheatsheet

To request a new entry, open an issue with the tool/concept name, why it matters, and any useful source links.

To contribute one yourself:

1. read the [30-minute contributor tutorial](./contributing.md);
2. draft the cheatsheet under `src/content/cheatsheets/<slug>/<slug>.md`;
3. run the validator and checks from [Development](./DEVELOPMENT.md);
4. open a pull request.

Good first issues are tracked with the `good first issue`, `help wanted`, and `content` labels.
