---
slug: pi-dev
title: Pi — Minimal Coding Agent Cheatsheet
category: tool
subcategory: coding-agent
summary: Checklist-first path to install, authenticate, configure, and extend Pi, the minimal terminal coding harness built around core tools, context files, tree sessions, providers, skills, extensions, and packages.
last_updated: 2026-05-30
stale_after_days: 90
upstream_version: "latest docs"
tags: [pi, pi-dev, coding-agent, cli, extensions, skills, packages, terminal, settings]
status: published
authors:
  - name: luongnv89
links:
  homepage: https://pi.dev/
  docs: https://pi.dev/docs/latest
  packages: https://pi.dev/packages
---

# Pi — Minimal Coding Agent Cheatsheet

**One-line:** Pi is a minimal terminal coding harness: start with read/write/edit/bash, then add only the providers, context, sessions, skills, extensions, prompts, themes, and packages your workflow actually needs.

## Installation

- **Install with npm** — preferred when you want the explicit package and safer dependency lifecycle behavior:

  ```bash
  npm install -g --ignore-scripts @earendil-works/pi-coding-agent
  ```

- **Or install with the official Linux/macOS installer:**

  ```bash
  curl -fsSL https://pi.dev/install.sh | sh
  ```

- **Launch from the repository Pi should work on:**

  ```bash
  cd /path/to/project
  pi
  ```

- **Authenticate with a subscription provider** inside Pi:

  ```text
  /login
  ```

  Built-in subscription logins include Claude Pro/Max, ChatGPT Plus/Pro (Codex), and GitHub Copilot.

- **Or authenticate with an API key** before launch:

  ```bash
  export ANTHROPIC_API_KEY=sk-ant-...
  pi
  ```

- **Uninstall with the same package manager that installed Pi:**

  ```bash
  # curl installer or npm install -g
  npm uninstall -g @earendil-works/pi-coding-agent

  # pnpm
  pnpm remove -g @earendil-works/pi-coding-agent

  # Yarn
  yarn global remove @earendil-works/pi-coding-agent

  # Bun
  bun uninstall -g @earendil-works/pi-coding-agent
  ```

  Uninstalling Pi leaves settings, credentials, sessions, and installed packages in `~/.pi/agent/`.

## Step-by-Step Setup & Optimization

### Step 1 — Basic working setup

- Start with the default core: Pi gives the model `read`, `write`, `edit`, and `bash`; read-only `grep`, `find`, and `ls` are also available through tool options.
- Send a first prompt that asks Pi to learn the project before editing:

  ```text
  Summarize this repository and tell me how to run its checks.
  ```

- Use git, filesystem snapshots, or another checkpoint workflow before high-risk edits; Pi runs in the current working directory and can modify files there.
- Use read-only mode when you only want review or analysis:

  ```bash
  pi --tools read,grep,find,ls -p "Review the code for risky changes"
  ```

### Step 2 — Project context and repeatable instructions

- Add project rules to `AGENTS.md` in the repo root:

  ```markdown
  # Project Instructions

  - Run `npm run check` after code changes.
  - Do not run production migrations locally.
  - Keep responses concise.
  ```

- Put global defaults in `~/.pi/agent/AGENTS.md` when they apply to every project.
- Use `CLAUDE.md` too if your repo already has one; Pi loads `AGENTS.md` or `CLAUDE.md` from parent directories and the current directory.
- Apply context changes without restarting:

  ```text
  /reload
  ```

- Disable context-file loading for a clean run when needed:

  ```bash
  pi --no-context-files -p "Summarize this repository without project instructions"
  ```

### Step 3 — Daily editor workflow

- Reference files from the editor with `@`, or pass files on the command line:

  ```bash
  pi @README.md "Summarize this"
  pi @src/app.ts @src/app.test.ts "Review these together"
  ```

- Run shell commands whose output should enter model context with `!`:

  ```text
  !npm run lint
  ```

- Run shell commands without adding output to model context with `!!`:

  ```text
  !!git status --short
  ```

- Paste images with `Ctrl+V` (`Alt+V` on Windows) or drag them into supported terminals.
- Use `Ctrl+G` to open `$VISUAL` or `$EDITOR` for longer prompts.
- Queue guidance while the agent works: `Enter` steers after current tool calls, `Alt+Enter` queues a follow-up, `Escape` aborts.

### Step 4 — Providers, models, and thinking level

- Use `/model` or `Ctrl+L` to switch models interactively.
- Use `Ctrl+P` / `Shift+Ctrl+P` to cycle scoped models configured through `/scoped-models`, `--models`, or `enabledModels`.
- Use `Shift+Tab` to cycle thinking level.
- List available models when configuring a new provider:

  ```bash
  pi --list-models
  pi --provider openai --model gpt-4o "Help me refactor"
  pi --model sonnet:high "Solve this complex bug"
  ```

- Prefer subscription login for Claude Pro/Max, ChatGPT Plus/Pro, or GitHub Copilot; prefer env vars or `~/.pi/agent/auth.json` for API-key providers.
- Remember credential resolution order: CLI `--api-key`, then `auth.json`, then environment variable, then custom provider keys from `models.json`.

### Step 5 — Settings baseline

- Put global settings in `~/.pi/agent/settings.json` and project overrides in `.pi/settings.json`; project settings override global settings and nested objects merge.
- Start with a small, documented baseline:

  ```json
  {
    "defaultProvider": "anthropic",
    "defaultModel": "claude-sonnet-4-20250514",
    "defaultThinkingLevel": "medium",
    "theme": "dark",
    "compaction": {
      "enabled": true,
      "reserveTokens": 16384,
      "keepRecentTokens": 20000
    },
    "retry": {
      "enabled": true,
      "maxRetries": 3
    },
    "enabledModels": ["claude-*", "gpt-4o"]
  }
  ```

- Use `/settings` for common interactive changes, then inspect the JSON if you need reproducible project config.
- Set `PI_OFFLINE=1` or use `--offline` to disable startup network operations, including update checks, package update checks, and install/update telemetry.
- Set `PI_SKIP_VERSION_CHECK=1` when you only want to disable the Pi latest-version request.
- Set `enableInstallTelemetry: false` only for the anonymous install/update ping; it does not disable update checks.

### Step 6 — Sessions, branching, and context management

- Continue or browse previous sessions from the CLI:

  ```bash
  pi -c                  # continue most recent session
  pi -r                  # browse and select a session
  pi --session <path|id> # open a specific session
  pi --no-session        # ephemeral mode; do not save
  ```

- Use session commands while inside Pi:

  ```text
  /session   # show session file, ID, tokens, and cost
  /tree      # jump to any point in the session tree
  /fork      # create a new session from a previous user message
  /clone     # duplicate the current active branch
  /compact   # summarize older messages to free context
  /export    # export session to HTML
  /share     # upload a private GitHub gist
  ```

- Fork before risky refactors; tree sessions are cheaper than re-prompting from scratch.
- Tune compaction only when defaults get in the way: `compaction.reserveTokens`, `compaction.keepRecentTokens`, and branch-summary settings are available in `settings.json`.

### Step 7 — Packages, skills, prompts, themes, and extensions

- Prefer the Pi-native path first: ask Pi to write the extension, skill, prompt template, or theme for your exact workflow, then review it and reload it.
- Install shared Pi packages only after you know the workflow repeats and you have reviewed the source:

  ```bash
  pi install npm:<package>@<version>
  pi install git:github.com/<user>/<repo>@<tag-or-commit>
  pi install ./relative/path/to/package
  pi list
  pi update --extensions
  ```

- Use `-l` for project-local package settings that should live in `.pi/settings.json`.
- Test a local extension for one run before making it auto-discovered:

  ```bash
  pi -e ./my-extension.ts
  ```

- Review third-party package source before installing: extensions run arbitrary code with your permissions, and skills can tell the model to run executables.
- Put local resources where `/reload` can discover them:

  | Resource | Global | Project |
  |---|---|---|
  | Extensions | `~/.pi/agent/extensions/*.ts` | `.pi/extensions/*.ts` |
  | Skills | `~/.pi/agent/skills/`, `~/.agents/skills/` | `.pi/skills/`, `.agents/skills/` |
  | Prompt templates | via settings/packages | `.pi/prompts/` |
  | Themes | via settings/packages | `.pi/themes/` |

- Invoke skills with `/skill:name`; use `/skill:name args` to append arguments as user input.
- Keep skill descriptions specific because Pi loads full skill instructions only when the task matches the name/description.

### Step 8 — Advanced extension and automation path

- Use extensions when you need custom tools, commands, lifecycle hooks, UI, provider registration, path protection, or permission gates.
- Start with one TypeScript file and test with `pi -e`:

  ```ts
  import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

  export default function (pi: ExtensionAPI) {
    pi.on("tool_call", async (event, ctx) => {
      if (event.toolName === "bash" && event.input.command?.includes("rm -rf")) {
        const ok = await ctx.ui.confirm("Dangerous command", "Allow rm -rf?");
        if (!ok) return { block: true, reason: "Blocked by user" };
      }
    });
  }
  ```

- Move stable extensions to `~/.pi/agent/extensions/` or `.pi/extensions/`, then run `/reload`.
- Use `models.json` for custom model endpoints such as Ollama, LM Studio, vLLM, OpenAI-compatible APIs, Anthropic Messages-compatible APIs, or Google Generative AI-compatible APIs.
- Use JSON mode, RPC mode, or the SDK only when you need programmatic integration rather than interactive TUI work:

  ```bash
  pi -p "Summarize this codebase"
  pi --mode json -p "Run a read-only repo audit"
  pi --mode rpc
  ```

## Best Practices

- **Start minimal.** Use the four core tools first; when the workflow repeats, prefer asking Pi to build your own focused extension/skill/prompt before installing a broad third-party package.
- **Treat official docs as command truth.** Use community posts for workflows and gotchas, not for unverified install commands, flags, or config keys.
- **Keep project context small.** Put stable conventions in `AGENTS.md`; avoid dumping huge docs into always-loaded context.
- **Use sessions as checkpoints.** `/fork`, `/clone`, `/tree`, and `/compact` are Pi's native way to explore alternatives without losing prior work.
- **Prefer read-only flags for audits.** `--tools read,grep,find,ls` prevents accidental edits during analysis.
- **Protect sensitive runs.** Use containers, tmux, git checkpoints, or safety extensions for untrusted repos, network-heavy tasks, or destructive commands.
- **Audit third-party packages.** Pi packages and extensions execute with full system access; skills may instruct the model to execute bundled scripts.
- **Pin package sources when stability matters.** Use npm versions or git refs; `pi update` reconciles pinned git refs but does not move them to newer refs.
- **Route models by task cost.** Use fast/cheap models for summarization and frontier/thinking models for complex code changes.
- **Reload intentionally.** Use `/reload` after changing context files, extensions, skills, prompt templates, themes, or settings-backed resources.

## Quick Command Reference

| Goal | Command |
|---|---|
| Install with npm | `npm install -g --ignore-scripts @earendil-works/pi-coding-agent` |
| Install with official installer | `curl -fsSL https://pi.dev/install.sh \| sh` |
| Uninstall npm/curl install | `npm uninstall -g @earendil-works/pi-coding-agent` |
| Launch in project | `cd <project> && pi` |
| Login | `/login` |
| Logout | `/logout` |
| Reference files | `pi @README.md "Summarize this"` |
| Run one-shot prompt | `pi -p "Summarize this codebase"` |
| JSON event mode | `pi --mode json -p "Task"` |
| RPC mode | `pi --mode rpc` |
| Continue session | `pi -c` |
| Browse sessions | `pi -r` |
| Use specific session | `pi --session <path\|id>` |
| Ephemeral run | `pi --no-session` |
| Read-only run | `pi --tools read,grep,find,ls -p "Review this repo"` |
| Disable context files | `pi --no-context-files -p "Task"` |
| Model picker | `/model` or `Ctrl+L` |
| Cycle scoped models | `Ctrl+P` / `Shift+Ctrl+P` |
| Cycle thinking level | `Shift+Tab` |
| Reload resources | `/reload` |
| Open settings | `/settings` |
| Session tree | `/tree` |
| Fork session | `/fork` |
| Compact context | `/compact [prompt]` |
| Export session | `/export [file]` |
| Share session | `/share` |
| Run shell to context | `!command` |
| Run shell silently | `!!command` |
| Install package globally | `pi install npm:<pkg>` |
| Install package project-local | `pi install npm:<pkg> -l` |
| Test local extension once | `pi -e ./extension.ts` |
| List packages | `pi list` |
| Update Pi only | `pi update --self` |
| Update packages only | `pi update --extensions` |
| Invoke skill | `/skill:name` |
| List models | `pi --list-models` |

## Expected Outcomes

- `pi` launches from the target project and can authenticate through `/login` or provider API keys.
- The first session can summarize the repo, identify checks, and run read-only commands safely.
- `AGENTS.md` or `CLAUDE.md` context is loaded and can be refreshed with `/reload`.
- Model switching works through `/model`, `Ctrl+L`, scoped model cycling, or CLI `--provider` / `--model` flags.
- Sessions are recoverable with `pi -c`, `pi -r`, `/resume`, `/tree`, `/fork`, and `/clone`.
- Settings are split cleanly between global `~/.pi/agent/settings.json` and project `.pi/settings.json`.
- Packages, skills, prompts, themes, and extensions are added only when they solve a repeated workflow, with custom Pi-written extensions preferred before third-party installs.
- Third-party resources are reviewed before install because they can run code or instruct the model to run code.

## Reference

<details>
<summary>Sources & deeper reading</summary>

### Official Pi docs

- [Pi documentation](https://pi.dev/docs/latest)
- [Quickstart](https://pi.dev/docs/latest/quickstart)
- [Using Pi](https://pi.dev/docs/latest/usage)
- [Providers](https://pi.dev/docs/latest/providers)
- [Settings](https://pi.dev/docs/latest/settings)
- [Sessions](https://pi.dev/docs/latest/sessions)
- [Compaction](https://pi.dev/docs/latest/compaction)
- [Packages](https://pi.dev/docs/latest/packages)
- [Skills](https://pi.dev/docs/latest/skills)
- [Extensions](https://pi.dev/docs/latest/extensions)
- [Custom models](https://pi.dev/docs/latest/models)
- [RPC mode](https://pi.dev/docs/latest/rpc)
- [JSON mode](https://pi.dev/docs/latest/json)
- [SDK](https://pi.dev/docs/latest/sdk)

### Community workflow sources

- [Pi Coding Agent Setup Guide — Bitdoze](https://www.bitdoze.com/pi-coding-agent-setup-guide/)
- [Pi Coding Agent — From Barebones to Better Than OpenCode — Patshead](https://blog.patshead.com/2026/05/pi-coding-agent-from-barebones-to-better-than-opencode.html)
- [Pi coding agent: The minimal terminal harness you extend yourself — AllThingsHow](https://allthings.how/pi-coding-agent-the-minimal-terminal-harness-you-extend-yourself/)
- [How I run pi.dev safely — Kris Constable](https://krisconstable.com/start-with-pidev/)
- [Alternative Coding Agents: Pi — Scott Logic](https://blog.scottlogic.com/2026/05/13/alternative-coding-agents-pi.html)

</details>
