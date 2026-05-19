---
slug: claude-code
title: Claude Code — Coding Agent Cheatsheet
category: tool
subcategory: coding-agent
summary: "Practical setup and operating guide for Claude Code: install the CLI, ground it in a repository, wire memory, hooks, MCP tools, and safe review loops."
last_updated: 2026-05-19
stale_after_days: 90
upstream_version: "Claude Code current"
tags: [claude-code, anthropic, coding-agent, cli, hooks, memory, mcp]
status: poc
authors:
  - name: luongnv89
links:
  homepage: https://code.claude.com/docs/
  docs: https://docs.anthropic.com/en/docs/claude-code/overview
  cli-reference: https://code.claude.com/docs/en/cli-reference
  memory: https://code.claude.com/docs/en/memory
  hooks: https://code.claude.com/docs/en/hooks-guide
---

# Claude Code — Coding Agent Cheatsheet

**One-line:** Claude Code is Anthropic's repo-grounded coding-agent CLI for reading, editing, testing, and reviewing software with persistent project context, hooks, MCP tools, and explicit permissions.

## Installation

Use the official Claude Code documentation for the latest install path, then verify the CLI before letting it modify a repository.

```bash
# Install or update from the official Claude Code distribution.
claude install stable

# Start Claude Code in the repository you want it to understand.
cd path/to/project
claude
```

First-run checklist:

1. Authenticate with an Anthropic account or configured provider.
2. Open the project root, not a random subdirectory.
3. Run `/doctor` if login, shell, hooks, MCP, or settings do not load.
4. Run `/context` to inspect loaded files, memory, skills, and MCP tools.

If `claude install` is not available in your environment, follow the current install page linked in Reference and keep this cheatsheet as the operating workflow.

## Step-by-Step Setup & Optimization

### Step 1 — Ground Claude in the repository

Create or update `CLAUDE.md` at the repo root with only durable facts:

```md
# Project guide
- Package manager: pnpm
- Checks before PR: pnpm test && pnpm type-check
- Do not edit generated files under dist/
- Prefer small commits and include the issue number in commit messages
```

Use `/memory` and `/context` to confirm what loaded. Keep memory short; project rules belong in `CLAUDE.md`, while personal preferences belong in user memory.

### Step 2 — Choose a permission posture

Start strict, then relax only for trusted repos.

| Situation | Recommended posture |
|---|---|
| Unknown repo | Read-only exploration, approve every shell command |
| Normal feature work | Workspace writes plus explicit command approvals |
| CI-style automation | Allowlisted commands and hooks that fail unsafe actions |
| Secrets or production | Separate sandbox, no broad filesystem or network access |

### Step 3 — Add deterministic hooks

Hooks make repeated guardrails deterministic instead of prompt-dependent. Common hooks run formatters after edits, reject dangerous commands, or notify when a task finishes.

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [{ "type": "command", "command": "pnpm prettier --write ${file}" }]
      }
    ]
  }
}
```

Keep hook commands fast and idempotent. If a hook can delete files, publish packages, deploy, or rewrite history, require human review.

### Step 4 — Connect external context with MCP

Use MCP servers for tools Claude should discover and call through a typed interface: issue trackers, docs search, databases, observability, or local project utilities.

```text
/mcp          # inspect connected servers and tools
/doctor       # debug MCP, settings, hooks, and memory loading
```

Prefer narrow MCP servers over broad shell access. Name tools by user intent, document inputs, and log side effects.

### Step 5 — Work in small issue loops

1. Ask Claude to restate the issue and acceptance criteria.
2. Request a short plan before edits.
3. Let it edit one coherent slice.
4. Run the project checks.
5. Review the diff yourself before commit or PR.

## Best Practices

### Do

- ✅ Keep `CLAUDE.md` concise, versioned, and specific to the repository.
- ✅ Ask for a plan, then make Claude execute one small step at a time.
- ✅ Run `/context` when behavior looks surprising; loaded context often explains it.
- ✅ Use hooks for formatting, policy checks, and notifications.
- ✅ Use MCP for scoped integrations instead of giving blanket shell/network freedom.
- ✅ Commit after known-good milestones so agent mistakes are easy to revert.

### Don't

- ❌ Paste secrets into chat or memory files.
- ❌ Put temporary issue details into durable project memory.
- ❌ Let hooks run destructive commands without review.
- ❌ Start huge refactors without tests, a rollback point, and a review plan.
- ❌ Assume Claude saw every file; explicitly attach or reference critical files.

## Quick Command Reference

| Command | Use |
|---|---|
| `claude` | Start Claude Code in the current project. |
| `claude install stable` | Install or reinstall the stable CLI when supported. |
| `/context` | Inspect loaded system, memory, skills, MCP, and conversation context. |
| `/doctor` | Diagnose settings, hooks, MCP, login, and project configuration. |
| `/memory` | View or update memory deliberately. |
| `/mcp` | Inspect configured MCP servers and exposed tools. |
| `/hooks` | Inspect or debug configured lifecycle hooks. |

## Expected Outcomes

After setup, you should have:

- A repository-level `CLAUDE.md` that captures durable project rules.
- A safe default permission model for reads, edits, shell commands, and network use.
- Hooks that handle repeatable quality gates without relying on the model to remember.
- MCP integrations that expose useful external context through narrow interfaces.
- A repeatable issue workflow: plan, edit, test, review, commit, and PR.

## Reference

<details>
<summary>Sources & deeper reading</summary>

- [Claude Code docs](https://code.claude.com/docs/)
- [Claude Code CLI reference](https://code.claude.com/docs/en/cli-reference)
- [Claude Code memory](https://code.claude.com/docs/en/memory)
- [Claude Code hooks guide](https://code.claude.com/docs/en/hooks-guide)
- [Claude Code hooks reference](https://code.claude.com/docs/en/hooks)
- [Contributor tutorial](https://github.com/luongnv89/awesome-cheatsheets/blob/main/docs/contributing.md)
- [Related: Hermes Agent cheatsheet](https://github.com/luongnv89/awesome-cheatsheets/blob/main/src/content/cheatsheets/hermes-agent/hermes-agent.md)
- [Related: Pi cheatsheet](https://github.com/luongnv89/awesome-cheatsheets/blob/main/src/content/cheatsheets/pi-dev/pi-dev.md)

</details>
