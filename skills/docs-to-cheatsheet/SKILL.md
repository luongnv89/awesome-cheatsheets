---
name: "docs-to-cheatsheet"
description: "Create concise checklist cheatsheets from official tool docs. Use for docs URLs, setup guides, or updating existing cheatsheets. Don't use for long tutorials or API references."
license: MIT
effort: high
metadata:
  version: "1.1.1"
  author: "montimage"
---

# Docs to Cheatsheet

Turn a tool docs URL into a short checklist that moves from installation to advanced usage. Use official docs for facts and community sources for practical tips.

## Repo Sync Before Edits (mandatory)

Before changing files in a git repository, sync the current branch so the cheatsheet is based on the latest content:

```bash
branch="$(git rev-parse --abbrev-ref HEAD)"
git fetch origin
git pull --rebase origin "$branch"
```

If the working tree is dirty, stash first, sync, then pop:

```bash
git stash push -u -m "docs-to-cheatsheet pre-sync"
branch="$(git rev-parse --abbrev-ref HEAD)"
git fetch origin
git pull --rebase origin "$branch"
git stash pop
```

If `origin` is missing, the pull fails, or conflicts occur, stop and ask the user before continuing.

## Environment check

If the Agent tool is available, use subagents for heavy browsing and independent review. If not, execute the same phases inline with `web_search`, `fetch_content`, file reads, and validation commands.

Subagent prompts:

- Read `agents/docs-mapper.md` before delegating official documentation navigation mapping.
- Read `agents/community-researcher.md` before delegating best-practice blog/article research.
- Read `agents/cheatsheet-reviewer.md` before delegating independent quality review.

## Prerequisites

Before execution, check for: an official docs URL, network access or user-provided excerpts, write access for repo edits, and a local validator such as `pnpm cheatsheet:lint`. If a prerequisite fails, report the error and ask for the missing input.

## Inputs

Expected input: one official documentation URL for a tool, such as a Pi, Claude Code, Codex, Ollama, MCP server, or CLI docs page.

Optional user preferences:

- Target audience: beginner, intermediate, advanced, or mixed.
- Output location or slug.
- Whether to update an existing cheatsheet or create a new one when both are plausible.
- Source freshness preference, if the default recent/community search is not enough.

## Output contract

Produce or update one concise Markdown cheatsheet. In this repository, default to:

```text
src/content/cheatsheets/<slug>/<slug>.md
```

When this repository's template contract exists, obey it. Use these sections in order unless the repo contract says otherwise:

1. `**One-line:** <short value proposition>` before the first H2
2. `## Installation`
3. `## Step-by-Step Setup & Optimization`
4. `## Best Practices`
5. `## Quick Command Reference`
6. `## Expected Outcomes`
7. `## Reference` with a collapsed `<details>` block

Use checkable todo items for actionable content:

```markdown
- [ ] Install the CLI with the verified command from the official docs.
- [ ] Run the first successful login or health-check command.
- [ ] Configure the minimum recommended settings.
- [ ] Enable advanced/optimized settings only after the baseline works.
```

Keep the cheatsheet short and scannable. Prefer verified commands, defaults, and decision points over prose. Do not mirror every docs page.

## Example

Example input:

```text
Create a cheatsheet from https://docs.example.com/tool/quickstart
```

Expected output: a proposed plan first, then—after approval—a validated Markdown file at `src/content/cheatsheets/<slug>/<slug>.md` with checklist tasks, command blocks, and source links.

## Workflow

### Phase 1: Identify the tool

From the input URL and page content, determine:

- Tool name and canonical capitalization.
- Homepage, docs root, repository URL, package/installer URL when available.
- Tool category: `tool`, `mcp`, `concept`, or `comparison` if the repo uses this taxonomy.
- Slug in kebab-case.
- Current version or release channel if clearly available.

If the URL does not identify a concrete tool, ask one focused clarification question before researching.

### Phase 2: Check for an existing cheatsheet

Before browsing deeply, search for an existing cheatsheet:

- Exact path: `src/content/cheatsheets/<slug>/<slug>.md`
- Nearby slugs in `src/content/cheatsheets/`
- Frontmatter `title`, `slug`, `links.homepage`, and `links.repo`
- Existing skill/examples folders only as authoring references, not as cheatsheet output

If an existing cheatsheet is found, switch to update mode. Preserve valid current content, replace stale or unsupported claims, and keep useful references.

If no cheatsheet is found, switch to create mode.

### Phase 3: Map official documentation navigation

Get a navigation overview before drafting. Use official docs pages first:

- Fetch the supplied page and identify docs root/navigation/sidebar/sitemap links.
- Count candidate pages and group them as `must-read`, `skim`, or `skip`.
- Prioritize installation, setup, auth/login, configuration, CLI/API commands, workflows, advanced configuration, security, troubleshooting, and best practices.
- Capture source URLs for every command or recommendation used in the final cheatsheet.

When Agent is available, spawn the docs mapper subagent. Otherwise do this inline.

### Phase 4: Research recent community best practices

Search for the top 5 recent and/or popular practical sources using queries like `<tool> best practices`, `<tool> setup guide`, `<tool> advanced configuration`, `<tool> tips workflow`, and `<tool> performance security troubleshooting`. Prefer recent, authoritative, widely referenced, maintainer, or power-user sources. If popularity is unclear, rank by recency plus authority. Official docs decide command correctness.

When Agent is available, spawn the community researcher subagent in parallel with docs mapping.

### Phase 5: Propose an implementation plan and wait

Before creating or editing the cheatsheet, present a short plan and stop for user approval.

Plan format:

```markdown
## Proposed Cheatsheet Plan

- Tool: <name>
- Mode: create | update
- Output path: `src/content/cheatsheets/<slug>/<slug>.md`
- Official docs coverage: <N> candidate pages; <M> must-read; <S> skim; <K> skip
- Community sources: top 5 sources to inspect
- Cheatsheet scope:
  - Installation: <what will be covered>
  - Setup/config: <what will be covered>
  - Advanced/optimized: <what will be covered>
  - Best practices: <what will be covered>
- Known uncertainties: <short bullets or "none yet">

Reply `approve` to generate/update the cheatsheet, or tell me what to change.
```

Do not write the cheatsheet until the user approves the plan.

### Phase 6: Draft or update the cheatsheet

After approval:

- Read the selected official docs pages and chosen community sources.
- Extract only important information: installation, first run, configuration, common workflows, advanced options, security/privacy, performance, troubleshooting, and best practices.
- Convert the path from basic to advanced into checkable tasks.
- Keep each task actionable and self-contained.
- Mark uncertain or version-sensitive items as notes instead of pretending certainty.
- Include only commands that were verified from official docs or explicitly provided by the user.

Recommended structure inside the main setup section:

```markdown
## Step-by-Step Setup & Optimization

### 1. Basic working setup
- [ ] ...

### 2. Daily workflow
- [ ] ...

### 3. Configuration baseline
- [ ] ...

### 4. Advanced optimization
- [ ] ...

### 5. Maintenance and troubleshooting
- [ ] ...
```

### Phase 7: Validate and review

Run the repository's validator when available. For this repo, use:

```bash
pnpm cheatsheet:lint src/content/cheatsheets/<slug>/<slug>.md --no-links
```

If the package scripts differ, inspect `package.json` and use the closest local validator. Fix validation errors before final response.

Use an independent reviewer subagent when Agent is available. Check that the output is a concise cheatsheet, flows from installation to advanced use, sources commands from official docs, preserves useful existing content, and passes repo validation.

### Phase 8: Final response

Return a concise completion summary with:

- Created or updated file path.
- Validation command and result.
- Source coverage summary: official pages used and community sources used.
- 2–4 content-specific review questions for ambiguous decisions.
- Suggested conventional commit message.

## Quality rules

- No fabrication: never invent commands, flags, config keys, URLs, versions, or references.
- Prefer official docs over blogs for factual commands and install steps.
- Prefer checklists over paragraphs.
- Keep basic setup before advanced optimization.
- If the docs are huge, cover the high-value path and list omitted areas in the Reference section.
- If sources disagree, note the conflict and choose the official docs unless the user says otherwise.

## Acceptance Criteria

Verify these expected results before reporting success:

- [ ] The tool, slug, mode, and output path are identified.
- [ ] Existing cheatsheets are checked before writing.
- [ ] The user approves the plan before any cheatsheet file is created or updated.
- [ ] The final cheatsheet is checklist-first and flows from installation to advanced use.
- [ ] Every command, flag, config key, and version-sensitive claim has an official source or is marked uncertain.
- [ ] The repo validator runs successfully, or the blocker is reported with the exact command and error.

## Edge Cases

Handle these carefully:

- Invalid or inaccessible docs URL: ask for a valid official URL; do not fabricate install commands.
- Huge docs site: cover must-read pages first and list omitted areas in `## Reference`.
- Existing stale cheatsheet: update supported claims and preserve useful current content.
- Conflicting sources: prefer official docs, then note the community disagreement.

## Step completion report format

After each major phase, report status in this format:

```text
◆ <Phase Name> ([step N of M] — docs-to-cheatsheet)
··································································
  Tool identified:      √ pass
  Existing sheet check: √ pass
  Sources tracked:      √ pass
  User approval:        × fail — waiting for approval
  Criteria:             √ 3/4 met
  ____________________________
  Result:               PARTIAL
```
