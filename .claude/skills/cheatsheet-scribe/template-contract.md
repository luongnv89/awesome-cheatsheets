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
2. `## Mental Model` — MUST contain at least one Mermaid block
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
| `Mental Model` | **REQUIRED** — must have at least one ` ```mermaid ` block |
| Other sections | Allowed but optional |

Mermaid blocks must parse successfully (valid syntax).

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
- PRD §6.6 (Repo layout: `cheatsheets/<slug>/<slug>.md`)