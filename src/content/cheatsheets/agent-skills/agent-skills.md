---
slug: agent-skills
title: Agent Skills — Reusable Workflow Cheatsheet
category: concept
subcategory: agent-capabilities
summary: "Practical guide to agent skills: structure reusable instructions, install and invoke skills, package resources safely, and maintain them as workflows evolve."
last_updated: 2026-09-25
stale_after_days: 90
tags: [agent-skills, skills, workflows, instructions, safety, reuse]
status: published
authors:
  - name: luongnv89
links:
  homepage: https://docs.anthropic.com/en/docs/claude-code/skills
  claude-api-skills: https://docs.claude.com/en/docs/agents-and-tools/agent-skills/overview
  anthropic-announcement: https://www.anthropic.com/index/skills
  sdk-skills: https://docs.anthropic.com/en/docs/agent-sdk/skills
---

# Agent Skills — Reusable Workflow Cheatsheet

**One-line:** Agent skills package reusable instructions, metadata, scripts, and resources so an AI agent can load specialized workflows on demand instead of rediscovering them in every conversation.

## Installation

Agent skills are usually filesystem packages rather than standalone apps. In Claude Code, create a skill directory with a `SKILL.md` file, then invoke it by name or let the agent select it when relevant.

```bash
mkdir -p .claude/skills/release-notes
cat > .claude/skills/release-notes/SKILL.md <<'EOF'
---
name: release-notes
description: Draft release notes from merged PRs and changelog entries.
---

Use this skill when the user asks for release notes.
1. Gather merged PRs.
2. Group changes by user impact.
3. Flag breaking changes and migration steps.
EOF
```

First-run checklist:

1. Keep the skill name short, kebab-case, and task-oriented.
2. Describe when the agent should use it.
3. Include only the files, scripts, and templates the skill needs.
4. Test with a realistic task before sharing across projects.

## Step-by-Step Setup & Optimization

### Step 1 — Decide whether a skill is warranted

**Goal:** A clear yes/no on whether a workflow deserves a skill · **Time:** ~5 min · **Level:** beginner

Use a skill when a workflow repeats and has stable steps.

| Use a skill for | Keep as a prompt for |
|---|---|
| Release notes, PR review, triage, report generation. | One-off brainstorming or exploratory debugging. |
| Procedures with templates, examples, or scripts. | Tasks where requirements change every time. |
| Domain rules that should travel between sessions. | Temporary issue-specific context. |

**Verify:** Your workflow sits in the "Use a skill for" column — it repeats and has stable steps.

### Step 2 — Write the trigger and scope

**Goal:** A description that routes the skill without over-triggering · **Time:** ~10 min · **Level:** beginner

The description is the routing contract. Make it specific enough that the agent knows when to load the skill.

```yaml
---
name: api-review
description: Review API changes for compatibility, auth, error shape, and docs updates.
---
```

Avoid vague descriptions such as "helps with coding" because they cause over-triggering.

**Verify:** Your description says what the skill does and when to load it — no vague "helps with coding" phrasing.

### Step 3 — Package resources safely

**Goal:** A packaged skill directory whose scripts are documented and safe · **Time:** ~15 min · **Level:** intermediate

Skills can include instructions, templates, scripts, sample outputs, and checklists. Keep executable scripts small and reviewable.

```text
skill-name/
  SKILL.md
  templates/
    report.md
  scripts/
    collect-inputs.sh
```

Document every script input and side effect. Prefer read-only scripts unless the skill's purpose is explicitly to write files.

**Verify:** Every script in the package lists its inputs and side effects, and scripts are read-only unless writing is the point.

### Step 4 — Test invocation paths

**Goal:** Proof the skill triggers only when it should · **Time:** ~15 min · **Level:** intermediate

Run three checks:

1. Direct invocation: ask for `/skill-name` or the platform equivalent.
2. Natural trigger: ask for the task without naming the skill.
3. Negative trigger: ask for a nearby task that should not load the skill.

**Verify:** All three checks pass — `/skill-name` loads it, an unnamed request loads it, and a nearby task does not.

### Step 5 — Maintain a skill library

**Goal:** A skill library that stays current as processes change · **Time:** ~10 min · **Level:** intermediate

Review skills periodically. Archive unused skills, merge duplicates, and update examples after process changes. Treat skills like docs plus code: version them, review them, and test them.

**Verify:** Unused skills are archived, duplicates merged, and each skill is versioned and reviewed like docs plus code.

## Best Practices

### Do

- ✅ Use clear `name` and `description` metadata.
- ✅ Keep `SKILL.md` concise; link or include resources only when needed.
- ✅ Add examples of good output and common edge cases.
- ✅ Document script side effects and required tools.
- ✅ Prefer project-local skills for project-specific workflows.
- ✅ Review skills after failures and turn lessons into better checks.

### Don't

- ❌ Put secrets, tokens, or private data in skill packages.
- ❌ Create a skill for every prompt; wait for repeatability.
- ❌ Use broad triggers that load on unrelated tasks.
- ❌ Hide destructive commands inside helper scripts.
- ❌ Let stale skills override current project conventions.

## Quick Command Reference

| Command or file | Use |
|---|---|
| `.claude/skills/<name>/SKILL.md` | Project-local Claude Code skill package. |
| `~/.claude/skills/<name>/SKILL.md` | User-level skill package when supported. |
| `/skill-name` | Directly invoke a skill by name in supporting agents. |
| `name` | Stable metadata identifier for the skill. |
| `description` | Routing hint that tells the agent when to load the skill. |
| `templates/` | Optional reusable output or input templates. |
| `scripts/` | Optional helper scripts; keep side effects explicit. |

## Expected Outcomes

After setup, you should have:

- A reusable skill with a clear trigger, scope, and owner.
- A small package layout containing only necessary instructions and resources.
- Tested direct, natural, and negative invocation behavior.
- Documented safety boundaries for scripts and generated outputs.
- A maintenance rhythm for pruning and improving skills over time.

## Reference

<details>
<summary>Sources & deeper reading</summary>

- [Claude Code skills documentation](https://docs.anthropic.com/en/docs/claude-code/skills)
- [Agent Skills overview](https://docs.claude.com/en/docs/agents-and-tools/agent-skills/overview)
- [Agent Skills announcement](https://www.anthropic.com/index/skills)
- [Agent SDK skills](https://docs.anthropic.com/en/docs/agent-sdk/skills)
- [Contributor tutorial](https://github.com/luongnv89/awesome-cheatsheets/blob/main/docs/contributing.md)
- [Related: Claude Code cheatsheet](https://github.com/luongnv89/awesome-cheatsheets/blob/main/src/content/cheatsheets/claude-code/claude-code.md)
- [Related: Harness Engineering cheatsheet](https://github.com/luongnv89/awesome-cheatsheets/blob/main/src/content/cheatsheets/harness-engineering/harness-engineering.md)
- [Related: Hermes Agent cheatsheet](https://github.com/luongnv89/awesome-cheatsheets/blob/main/src/content/cheatsheets/hermes-agent/hermes-agent.md)

</details>
