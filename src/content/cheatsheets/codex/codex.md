---
slug: codex
title: Codex — Coding Agent Cheatsheet
category: tool
subcategory: coding-agent
summary: "Practical operating guide for OpenAI Codex: install the local CLI, choose models, tune sandbox and approval policies, and run repository tasks safely."
last_updated: 2026-05-19
stale_after_days: 90
upstream_version: "Codex CLI current"
tags: [codex, openai, coding-agent, cli, sandbox, approvals]
status: poc
authors:
  - name: luongnv89
links:
  homepage: https://developers.openai.com/codex/
  repo: https://github.com/openai/codex
  cli-reference: https://developers.openai.com/codex/cli/reference
  config: https://developers.openai.com/codex/config-basic
  security: https://developers.openai.com/codex/agent-approvals-security
---

# Codex — Coding Agent Cheatsheet

**One-line:** Codex is OpenAI's local coding-agent CLI and app workflow for repository tasks, with model selection, trusted-project configuration, sandbox modes, and approval policies designed for safe automation.

## Installation

Install Codex from the official OpenAI repository or package channels.

```bash
# npm install path from the official repository
npm i -g @openai/codex

# macOS cask path documented by OpenAI
brew install --cask codex

# Start in a repository
cd path/to/project
codex
```

First-run checklist:

1. Sign in or provide the API credentials your organization requires.
2. Trust only repositories you own or have reviewed before allowing writes.
3. Keep default sandboxing until the task proves it needs broader access.
4. Put durable defaults in `~/.codex/config.toml`; use project overrides only for trusted repos.

## Step-by-Step Setup & Optimization

### Step 1 — Pick the right interface

| Interface | Best for |
|---|---|
| `codex` CLI | Terminal-native repo edits, tests, and PR prep. |
| Codex IDE extension | Editor-integrated review and implementation loops. |
| `codex app` | Desktop workflow when you want a local app surface. |
| Codex Web | Cloud task delegation from ChatGPT/Codex surfaces. |

### Step 2 — Configure model and project defaults

Codex reads personal defaults from `~/.codex/config.toml` and can read project overrides from `.codex/config.toml` after trust is established.

```toml
model = "gpt-5.4"
approval_policy = "on-request"
sandbox = "workspace-write"
```

Use CLI flags for one-off overrides:

```bash
codex --model gpt-5.4 --sandbox workspace-write
codex --oss
```

### Step 3 — Set sandbox and approval policy intentionally

| Mode | When to use |
|---|---|
| `read-only` | Exploration, review, threat modeling, unknown repos. |
| `workspace-write` | Normal coding tasks; writes stay in the active workspace. |
| `danger-full-access` | Rare local-only experiments after backups and human review. |

Network access is intentionally constrained by default in workspace mode. Enable it only for tasks that require package installs, API calls, or remote docs.

### Step 4 — Run task loops with evidence

Ask Codex to produce a plan, then execute a single slice:

```text
Summarize the failing test, propose a 3-step fix, then implement only step 1.
```

After edits, run the smallest relevant check first, then the broader suite:

```bash
pnpm test path/to/file.test.ts
pnpm type-check
pnpm test
```

### Step 5 — Review before merge

Use the generated diff as a proposal, not a final answer. Check for over-broad rewrites, hidden config changes, generated files, and unapproved network or filesystem assumptions.

## Best Practices

### Do

- ✅ Keep Codex in `workspace-write` for day-to-day development.
- ✅ Use `read-only` for unfamiliar repositories and security review.
- ✅ Store stable preferences in `~/.codex/config.toml`.
- ✅ Use project `.codex/config.toml` only after trusting the repo.
- ✅ Ask for small plans and evidence-backed test runs.
- ✅ Commit after each known-good milestone.

### Don't

- ❌ Use `danger-full-access` as a default.
- ❌ Enable network access just because a package install failed once.
- ❌ Let Codex edit secrets, credentials, or production deployment config without review.
- ❌ Mix unrelated issues in one agent task.
- ❌ Assume model choice fixes missing tests or unclear acceptance criteria.

## Quick Command Reference

| Command | Use |
|---|---|
| `npm i -g @openai/codex` | Install the CLI from the official npm package. |
| `brew install --cask codex` | Install the documented macOS cask. |
| `codex` | Start Codex in the current repository. |
| `codex --model <model>` | Override the configured model for one run. |
| `codex --sandbox read-only` | Explore without allowing writes. |
| `codex --sandbox workspace-write` | Allow normal workspace edits. |
| `codex --oss` | Use the local open-source model provider when configured. |

## Expected Outcomes

After setup, you should have:

- A verified Codex install and a known authentication path.
- Personal configuration for model, approval, and sandbox defaults.
- A clear rule for when project-level `.codex/` configuration is trusted.
- A repeatable task loop that produces diffs, tests, and reviewable evidence.
- A safer escalation path for network access or broader filesystem privileges.

## Reference

<details>
<summary>Sources & deeper reading</summary>

- [OpenAI Codex documentation](https://developers.openai.com/codex/)
- [OpenAI Codex GitHub repository](https://github.com/openai/codex)
- [Codex CLI reference](https://developers.openai.com/codex/cli/reference)
- [Codex configuration basics](https://developers.openai.com/codex/config-basic)
- [Codex approvals and security](https://developers.openai.com/codex/agent-approvals-security)
- [Contributor tutorial](https://github.com/luongnv89/awesome-cheatsheets/blob/main/docs/contributing.md)
- [Related: Claude Code cheatsheet](https://github.com/luongnv89/awesome-cheatsheets/blob/main/src/content/cheatsheets/claude-code/claude-code.md)
- [Related: Pi cheatsheet](https://github.com/luongnv89/awesome-cheatsheets/blob/main/src/content/cheatsheets/pi-dev/pi-dev.md)

</details>
