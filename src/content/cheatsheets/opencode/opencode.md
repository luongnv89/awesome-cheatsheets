---
slug: opencode
title: OpenCode — Terminal Agent Cheatsheet
category: tool
subcategory: terminal-agent
summary: "Practical setup guide for OpenCode: install the terminal agent, connect providers, configure project behavior, and run safe coding workflows from the CLI."
last_updated: 2026-05-19
stale_after_days: 90
upstream_version: "OpenCode current"
tags: [opencode, coding-agent, terminal, providers, cli, models]
status: poc
authors:
  - name: luongnv89
links:
  homepage: https://opencode.ai/docs/
  docs: https://opencode.ai/docs/
  cli: https://opencode.ai/docs/cli/
  providers: https://opencode.ai/docs/providers/
  repo: https://github.com/sst/opencode
---

# OpenCode — Terminal Agent Cheatsheet

**One-line:** OpenCode is a terminal-native AI coding agent with provider-agnostic model support, project configuration, command-line automation, and a lightweight workflow for editing, testing, and reviewing repositories.

## Installation

Install from the official OpenCode install script or documented package channels.

```bash
# Official install script
curl -fsSL https://opencode.ai/install | bash

# Node package alternative
npm install -g opencode-ai

# Homebrew tap documented by OpenCode
brew install anomalyco/tap/opencode
```

First run from a project root and connect at least one model provider:

```bash
cd path/to/project
opencode
opencode auth login
```

Provider credentials are configured through OpenCode auth and provider settings. Keep credentials outside the repository.

## Step-by-Step Setup & Optimization

### Step 1 — Start with one provider

OpenCode is powered by provider definitions and supports many hosted and local models. Begin with one reliable provider before adding fallbacks.

```bash
opencode auth login
opencode
```

Use `/connect` or the documented auth flow to add keys. Confirm the chosen model can read, edit, and run checks in your repo before adding more providers.

### Step 2 — Add project instructions

Create project guidance that explains the stack, checks, and file boundaries. Keep it concise and versioned.

```md
# Agent instructions
- Package manager: pnpm
- Run lint before committing markdown changes
- Do not edit dist/ or generated search indexes
- Mention the GitHub issue in commits and PRs
```

### Step 3 — Use CLI commands for automation

OpenCode can be driven interactively or through documented CLI subcommands.

```bash
opencode --help
opencode auth --help
opencode agent --help
```

Use command-line invocation for repeatable jobs such as summarizing a repo, applying a focused patch, or running a review prompt in CI-like scripts.

### Step 4 — Route models by task

| Task | Model posture |
|---|---|
| Repo exploration | Fast inexpensive model with read-only posture. |
| Architecture changes | Strong reasoning model and explicit plan approval. |
| Formatting or docs | Fast model plus deterministic lint/format tools. |
| Sensitive code | Local or approved provider only, with strict review. |

### Step 5 — Close every loop with checks

Ask OpenCode to name the exact command it will run before executing it.

```bash
pnpm cheatsheet:lint src/content/cheatsheets/example/example.md --no-links
pnpm test
```

Treat the diff, command output, and acceptance criteria as the review artifact.

## Best Practices

### Do

- ✅ Install from `opencode.ai` or the official package channels.
- ✅ Connect one provider first, then add fallbacks after a known-good session.
- ✅ Keep provider keys in OpenCode auth/config storage, not in repository files.
- ✅ Put durable project instructions in versioned docs.
- ✅ Ask for a short plan before edits and run checks after each slice.
- ✅ Use local models for low-risk summarization or privacy-sensitive exploration when appropriate.

### Don't

- ❌ Add every provider on day one; model sprawl makes debugging harder.
- ❌ Store API keys in prompts, markdown, or committed config.
- ❌ Let agent output replace tests or manual review.
- ❌ Run broad shell commands from copied issue text.
- ❌ Mix docs generation, refactors, and dependency upgrades in one task.

## Quick Command Reference

| Command | Use |
|---|---|
| `curl -fsSL https://opencode.ai/install | bash` | Install with the official script. |
| `npm install -g opencode-ai` | Install with npm. |
| `brew install anomalyco/tap/opencode` | Install with the documented Homebrew tap. |
| `opencode` | Start the terminal agent in the current project. |
| `opencode auth login` | Connect provider credentials. |
| `opencode auth --help` | Inspect provider/auth commands. |
| `opencode agent --help` | Inspect agent-management commands. |

## Expected Outcomes

After setup, you should have:

- A verified OpenCode install available on your `PATH`.
- At least one authenticated provider and a known model default.
- Project instructions that steer edits, tests, and file boundaries.
- A safe issue loop that produces a plan, patch, checks, and reviewable diff.
- A provider strategy for cheap tasks, hard reasoning, and sensitive code.

## Reference

<details>
<summary>Sources & deeper reading</summary>

- [OpenCode documentation](https://opencode.ai/docs/)
- [OpenCode CLI docs](https://opencode.ai/docs/cli/)
- [OpenCode providers docs](https://opencode.ai/docs/providers/)
- [OpenCode GitHub repository](https://github.com/sst/opencode)
- [Contributor tutorial](https://github.com/luongnv89/awesome-cheatsheets/blob/main/docs/contributing.md)
- [Related: Claude Code cheatsheet](https://github.com/luongnv89/awesome-cheatsheets/blob/main/src/content/cheatsheets/claude-code/claude-code.md)
- [Related: Codex cheatsheet](https://github.com/luongnv89/awesome-cheatsheets/blob/main/src/content/cheatsheets/codex/codex.md)
- [Related: Pi cheatsheet](https://github.com/luongnv89/awesome-cheatsheets/blob/main/src/content/cheatsheets/pi-dev/pi-dev.md)

</details>
