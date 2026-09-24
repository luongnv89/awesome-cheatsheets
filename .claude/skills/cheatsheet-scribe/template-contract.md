# Cheatsheet Template Contract

**Canonical source:** `tools/template-contract.ts`

This document defines the structural rules every cheatsheet in this repository must obey.

---

## Frontmatter Schema

Every cheatsheet MUST have a YAML frontmatter block with these fields:

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `slug` | string | kebab-case, 2-64 chars, `^[a-z0-9]+(?:-[a-z0-9]+)*$` |
| `title` | string | Human-readable display title |
| `category` | enum | One of: `tool`, `mcp`, `concept`, `comparison` |
| `subcategory` | string | Optional free-form subcategory |
| `summary` | string | 20-400 chars, sentence summary |
| `last_updated` | string | ISO-8601 date (YYYY-MM-DD) |
| `stale_after_days` | number | 1-730 |
| `tags` | array | 1-12 kebab-case tags |
| `status` | enum | `poc` (default), `published`, `deprecated` |
| `links` | object | Required `homepage: <url>`, optional `repo`, etc. |

### Optional Fields

| Field | Type | Description |
|-------|------|-------------|
| `authors` | array | `[{ name, handle?, url? }]` |
| `upstream_version` | string | Version string for tools |

### Example

```yaml
---
slug: hermes-agent
title: Hermes Agent — Optimization Cheatsheet
category: tool
subcategory: autonomous-ai-agent
summary: Step-by-step path to a high-leverage Hermes Agent install...
last_updated: 2026-05-18
stale_after_days: 90
tags: [hermes-agent, nousresearch, autonomous-agent, cli]
status: poc
authors:
  - name: luongnv89
links:
  homepage: https://hermes-agent.nousresearch.com/docs/
  repo: https://github.com/NousResearch/hermes-agent
---
```

---

## Required Sections

Sections MUST appear in this exact order:

1. **One-liner** (bold paragraph, not an H2): `**One-line:** <summary>`
2. `## Installation` — copy-paste one-line installer(s) + first-run flow
3. `## Step-by-Step Setup & Optimization`
4. `## Best Practices`
5. `## Quick Command Reference`
6. `## Expected Outcomes`
7. `## Reference` — MUST be wrapped in `<details>` block

### Section Matching Rule

An H2 heading conforms if it equals the canonical name OR starts with the canonical name followed by whitespace + an optional `(qualifier)`.

**Valid:** `## Expected Outcomes (after Steps 1–5)`  
**Invalid:** `## Results` (renamed) or `## Best Practices` moved to position 5

---

## Optional Structured Blocks (extended template)

The detail page renders a step timeline, meta chips, and alert callouts
from optional structure inside the locked sections. Everything below is
OPTIONAL — a cheatsheet with none of it still passes lint — but when a
block is present it must parse (`STEP_RULES` in `tools/contract/steps.ts`).

### Steps

`### Step N — Title` H3s under `## Step-by-Step Setup & Optimization`,
numbered `1..N` contiguously (em/en/hyphen dash all match). Recommended:
3–7 steps, one action per numbered item, each command in its own fenced
block with a language tag (no `$ ` prompts, `<UPPER_SNAKE>` placeholders).

### Step meta line

The FIRST paragraph directly after a step heading may be a meta line —
segments joined by ` · `:

```md
**Goal:** A working `tool` binary on PATH · **Time:** ~5 min · **Level:** beginner
```

- `**Time:**` must match `^~?\d+\s*(min|mins|minutes|h|hr|hours)$`
- `**Level:**` must be one of `beginner` | `intermediate` | `advanced`

### Verify line

`**Verify:** <content>` — at least 10 characters after the marker. Names
the command/output proving the step worked; renders as a check callout.

### Prerequisites

An optional `## Prerequisites` H2 containing a `- [ ]` task list. Only
legal BEFORE `## Installation` in the H2 sequence (`prerequisites-out-of-order`).

### GitHub alerts

Blockquotes whose first line is `[!NOTE]`, `[!TIP]`, `[!IMPORTANT]`,
`[!WARNING]`, or `[!CAUTION]` render as styled callouts (and natively on
GitHub). Use them for tips/warnings instead of bold prose.

### Validator rule ids

`step-sequence`, `step-meta-invalid`, `prerequisites-out-of-order`,
`verify-empty` — registered alongside the v1 rules in
`tools/validator/rules.ts`.

---

## One-Liner Rule

- **Marker:** `**One-line:**`
- **Position:** After H1, before first H2
- **Min length:** 20 characters

```markdown
# Hermes Agent — Optimization Cheatsheet

**One-line:** Hermes Agent is NousResearch's self-improving CLI/TUI AI agent...
```

---

## Mermaid Rules

| Section | Requirement |
|---------|-------------|
| Any section | Allowed but optional |

No section currently mandates a Mermaid block. Any Mermaid block that does appear must parse successfully (valid syntax).

---

## Reference Rule

The Reference section MUST be wrapped in a collapsed `<details>` block:

```markdown
## Reference

<details>
<summary>Sources & deeper reading</summary>

- [Homepage](https://...)
- [Documentation](https://...)
</details>
```

---

## Categories

```
tool    — CLI/TUI applications, AI agents
mcp     — MCP servers, protocols
concept — Methods, techniques, workflows
comparison — Tool/approach comparisons
```

## Statuses

```
poc        — proof-of-concept, may not pass validation
published — passes lint, eligible for catalog
deprecated — kept for history, flagged in catalog
```

---

## Synchronization

Changes to `tools/template-contract.ts` MUST be reflected here. Add a CI check or generation script to keep them in sync.

**See also:**
- PRD §3 M1 (Standardized template + validator)
- PRD §3 M3 (Catalog)
- PRD §3 M4 (References section)
- PRD §6.3 (Authoring layer)
- PRD §6.6 (Repo layout: `src/content/cheatsheets/<slug>/<slug>.md`)