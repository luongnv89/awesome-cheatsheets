---
slug: omp
title: Oh My Pi (omp) — Coding Agent Cheatsheet
category: tool
subcategory: coding-agent
summary: Install omp, sign in, replace the default yolo approval mode, then run bounded sessions with plan mode, model roles, project instructions, skills, and subagents.
last_updated: 2026-09-24
stale_after_days: 90
upstream_version: "docs as of 2026-09-24"
tags: [omp, oh-my-pi, coding-agent, cli, terminal, providers, sessions, skills]
status: published
authors:
  - name: luongnv89
links:
  homepage: https://omp.sh/
  docs: https://omp.sh/docs
  repo: https://github.com/can1357/oh-my-pi
  quickstart: https://omp.sh/docs/quickstart
  cli: https://omp.sh/docs/cli
---

# Oh My Pi (omp) — Coding Agent Cheatsheet

**One-line:** omp is a terminal coding agent that edits the repo on your machine, runs your tools, and keeps the work in a resumable session you can plan, review, and resume.

## Installation

- [ ] Install on macOS or Linux:

  ```bash
  curl -fsSL https://omp.sh/install | sh
  ```

- [ ] Or install on Windows in PowerShell:

  ```powershell
  irm https://omp.sh/install.ps1 | iex
  ```

- [ ] Confirm the binary is on `PATH`, then open a new terminal if the shell cannot find it:

  ```bash
  omp --version
  ```

- [ ] Launch inside the repository omp should work on. That directory is the project root.

  ```bash
  cd path/to/your-project
  omp
  ```

## Step-by-Step Setup & Optimization

### 1. Basic working setup

- [ ] On first launch, stay on the Sign in tab, pick a provider, and finish the browser login. Sign in to more than one provider if you need them. Press Esc when you are done.
- [ ] If you already exported an API key, press Esc to leave the provider step. Example for one terminal:

  ```bash
  export ANTHROPIC_API_KEY=sk-ant-...
  omp
  ```

- [ ] On Choose your default model, search, pick a model from a provider you just configured, and press Enter. Finish the terminal appearance prompts.
- [ ] Send one bounded task with a check, then press Enter. Expand a card with Ctrl+O. Press Esc to interrupt a bad turn.

  ```text
  Inspect this project for one small bug that can be verified locally. Explain it, make the smallest safe fix, and run the most relevant check.
  ```

- [ ] Leave with Ctrl+D or `/exit`. Resume this project's latest session from the same directory:

  ```bash
  omp --continue
  # same flag: omp -c
  # picker:    omp --resume
  ```

- [ ] Later, reopen sign-in with `/login` and change the session model with `/model`. Subscription and API routes are different IDs: ChatGPT uses `openai-codex`; the OpenAI API uses `openai` and `OPENAI_API_KEY`.

### 2. Daily workflow

- [ ] State the outcome, the paths that must not change, and the check that should pass. A successful tool card means that action finished, not that the task is correct.
- [ ] Review the diff in the transcript or with `git diff`. File edits land in the working tree immediately and are not committed unless you ask.
- [ ] Steer the active turn with Enter. Queue a follow-up with Ctrl+Q or Ctrl+Enter. Continue an interrupted good turn by sending `.` or `c`. Retry a failed turn with Alt+R.
- [ ] Run a local command yourself. These use your user permissions and are not a sandbox. `!!` and `$$` hide output from the model only.

  ```text
  ! git status
  !! git diff --stat
  $ print(2 + 2)
  ```

- [ ] For a cross-file or risky change, start Plan mode. Planning is read-only until you approve. Skip it for a tiny edit you already understand.

  ```text
  /plan Replace the in-memory job queue with Postgres. Preserve the public API and list every migration step.
  ```

- [ ] In Plan Review, approve into a fresh session, compact the current session and continue there, or keep the full planning context. Refine or Save and quit when you are not ready to implement. `/plan` again leaves plan mode without approving.
- [ ] Delegate only independent work. Name a bundled specialist (`scout`, `reviewer`, `security-reviewer`, `librarian`, `sonic`, `designer`, `task`) or ask for file-disjoint workers. Watch them with Alt+A. Keep overlapping edits in the main session.
- [ ] Before parallel writers start, set Tasks → Isolation to Auto in `/settings`, and ask for isolated workspaces. Isolation needs a Git repo. It separates checkouts. It is not a sandbox, and subagents cannot answer approval prompts.
- [ ] Check the status line for model, directory, Git state, context, and mode before assuming omp is stuck. If it will inspect but not edit, look for Plan mode or an approval prompt first.

### 3. Configuration baseline

- [ ] A config file is optional. Inspect the effective values from the project directory. `omp config path` prints the agent directory; the file is `config.yml` inside it.

  ```bash
  omp config list
  omp config path
  omp config get tools.approvalMode
  ```

- [ ] The built-in approval default is `yolo` (read, write, and exec run without a tier prompt). For interactive work, the docs' safer start is `write`. Set it in the global file `~/.omp/agent/config.yml`. `omp config set` writes that global file, not the project file.

  ```bash
  omp config set tools.approvalMode write
  ```

  ```yaml
  # ~/.omp/agent/config.yml
  tools:
    approvalMode: write
  ```

- [ ] Use `always-ask` when every write and command should stop for you. Ordinary reads still run without a tier prompt. Use a flag when the change is for one launch only:

  ```bash
  omp --approval-mode always-ask
  omp --approval-mode write
  ```

- [ ] Put repo-only overrides in `.omp/config.yml` in the directory where you launch omp. omp does not walk parent directories for that file. Do not commit API keys there. Prefer `/login`, an environment variable, or an untracked `--config` overlay.
- [ ] Precedence, lowest to highest: built-in defaults, global or named profile, project config, `PI_CONFIG_FILES`, repeated `--config`, then runtime flags. Arrays replace; mappings deep-merge.
- [ ] List models you can actually use, then pin roles only when you care about cost or quality. Empty roles are chosen automatically and can change when the catalog changes.

  ```bash
  omp models
  omp models find sonnet
  ```

  ```yaml
  # ~/.omp/agent/config.yml — copy selectors from `omp models`
  modelRoles:
    default: provider/model-id
    smol: provider/model-id
    slow: provider/model-id:high
    plan: provider/model-id:high
  ```

- [ ] Add a short root `AGENTS.md` for build commands and boundaries. Start a new session with `/new` after editing it, then confirm the loaded file under `/extensions`.

### 4. Advanced optimization

- [ ] Watch context with `/context`. Automatic compaction is on by default. When the window is tight, compact with a focus, or shake bulky output without a summary:

  ```text
  /compact Preserve the API decisions, the failing test, and the next step.
  /shake
  /handoff Focus on the accepted design, files already changed, and remaining checks.
  ```

- [ ] Cycle the quick roles with Ctrl+P. The default order is `smol`, `default`, `slow`. `/switch` changes the model for this session only and does not rewrite saved roles.
- [ ] Install the language server your project already uses, and launch omp in the directory that contains the marker (`package.json`, `Cargo.toml`, `go.mod`, and so on). LSP is on by default and starts lazily. Check detected servers with `/session`. Disable it for one launch with `omp --no-lsp`.
- [ ] Ask for a semantic rename and a preview before applying it. After a broad rename, run the compiler or the focused tests. A language server will not catch every dynamic lookup.
- [ ] Add a skill only for a repeated playbook. Copy `SKILL.md` to `~/.omp/agent/skills/<name>/SKILL.md` or `.omp/skills/<name>/SKILL.md`, then `/reload-plugins` or start a new session. Project skills are discovered from parent directories up to the repository boundary. `.omp/config.yml` is not. Invoke a skill with `/skill:<name>` or let the description match. Read a repo skill before trusting it. Skills do not add permissions.
- [ ] Add an MCP server with `/mcp add`, then `/mcp test <name>`. Prefer `${ENV_VAR}` over a committed token. A project `stdio` server runs a command as your user, so read `.omp/mcp.json` before opening an unfamiliar repo. Disable a discovered server with `/mcp disable <name>`.

### 5. Maintenance and troubleshooting

- [ ] After a disconnect, return to the project and run `omp -c`. If that is the wrong session, run `omp -r` and search. Completed entries survive. An in-flight tail may not.
- [ ] If keystrokes move a list, a picker has focus. Press Esc. If the display is garbled, press Alt+L. If you forgot a chord, run `/hotkeys`.
- [ ] If a provider is missing, check credentials and `omp config get disabledProviders`, then `omp models refresh`. A project `disabledProviders` array replaces the global one.
- [ ] If a setting seems ignored, run `omp config get <key>` from the launch directory. A later `--config`, flag, or environment override can win. `omp config set` never writes `.omp/config.yml`. Restart after editing YAML outside `/settings`.
- [ ] Treat `~/.omp/agent/sessions/` as sensitive. It can hold prompts, source, tool output, and secrets. Use `omp --no-session` only when you accept that the run cannot be resumed. HTML export and `/share` links are readable by anyone who has the file or the full link.
- [ ] Use `omp --profile <name>` when auth, sessions, and settings must stay separate. Resume only sees the active profile.

## Best Practices

- [ ] Bound the task and name the check. Review the diff and the verification result before the next prompt.
- [ ] Keep `write` or `always-ask` for repos you do not fully trust. `yolo`, `--yolo`, and `--auto-approve` skip ordinary tier prompts. They do not beat a `deny` rule, a provider safety check, or the operating system.
- [ ] Plan before migrations and multi-file design. Stay in ordinary mode for a one-file change.
- [ ] Pin `smol` to a cheap model and `slow` or `plan` to a stronger one only after `omp models` shows those selectors. A fallback chain recovers from provider failure. It does not judge answer quality.
- [ ] Keep secrets out of committed `.omp/config.yml` and `mcp.json`. Stored logins normally live in `~/.omp/agent/agent.db`.
- [ ] Give subagents file-disjoint ownership. Turn on isolation before parallel edits. Stop a worker in Agent Hub with `x` when it leaves its assignment.
- [ ] Prefer a language-server rename over a text replace when a symbol has many references. Install the server first, or omp will not invent a semantic edit.
- [ ] Load standing rules from a short `AGENTS.md`. Use a skill when the playbook should load only for a matching task.

## Quick Command Reference

```bash
# Install and first run
curl -fsSL https://omp.sh/install | sh
omp --version
cd path/to/your-project
omp

# Sessions
omp -c                  # continue latest session for this directory
omp -r                  # session picker
omp --fork <id-or-path>
omp --no-session
omp --profile work

# One-shot and safety
omp -p "Summarize this project"
omp --approval-mode write
omp --approval-mode always-ask
omp --model provider/model-id
omp --no-lsp

# Config and models
omp config list
omp config path
omp config get tools.approvalMode
omp config set tools.approvalMode write
omp models
omp models find sonnet
omp models refresh
```

**In session:** `/login` · `/model` · `/switch` · `/plan` · `/plan-review` · `/context` · `/compact` · `/shake` · `/handoff` · `/resume` · `/new` · `/fork` · `/tree` · `/extensions` · `/mcp list` · `/settings` · `/hotkeys` · `/exit`

**Keys:** Enter send or steer · Ctrl+O expand a card · Esc interrupt · Ctrl+D exit · Ctrl+P cycle roles · Alt+M model hub · Alt+A Agent Hub · Alt+R retry · Alt+L repaint

## Expected Outcomes

After Steps 1–3 you should have:

1. `omp --version` succeeding and an interactive session opened inside a real repository.
2. At least one provider signed in, or an API key resolved, and a default model chosen.
3. Approval mode set to `write` or `always-ask` when you do not want the built-in `yolo` default.
4. A resumed session via `omp -c` from the same project directory.
5. A large change planned and handed off only after review.
6. File-disjoint work split across subagents, with isolation turned on before those workers write.

After Steps 4–5 you should also be able to:

1. Compact or shake a long session when the context window is tight.
2. Point `default`, `smol`, `slow`, and `plan` at models listed by `omp models`.
3. Load project instructions and an on-demand skill, then confirm them in `/extensions`.
4. Connect one tested MCP server.

## Reference

<details>
<summary>Sources and omitted areas</summary>

### Official pages used

- [Overview](https://omp.sh/docs)
- [Quickstart](https://omp.sh/docs/quickstart)
- [Using omp](https://omp.sh/docs/using)
- [CLI reference](https://omp.sh/docs/cli)
- [Providers](https://omp.sh/docs/providers)
- [Tool approvals](https://omp.sh/docs/approvals)
- [Settings](https://omp.sh/docs/settings)
- [Sessions](https://omp.sh/docs/sessions)
- [Plan mode](https://omp.sh/docs/plan)
- [Model roles](https://omp.sh/docs/roles)
- [Context files](https://omp.sh/docs/context-files)
- [Skills](https://omp.sh/docs/skills)
- [Compaction](https://omp.sh/docs/compaction)
- [Code intelligence](https://omp.sh/docs/code-intelligence)
- [Subagents](https://omp.sh/docs/subagents)
- [MCP](https://omp.sh/docs/mcp)
- [Repository](https://github.com/can1357/oh-my-pi)

### Community sources

These are third-party opinions. Commands in this cheatsheet come from the official pages above.

- [Getting the Most Out of Oh My Pi](https://noahlaratta.com/lab/oh-my-pi) (Noah Laratta, June 2026) — approval posture, role split, and treating the session directory as sensitive.
- [omp architecture deep dive](https://kondasamy.com/blog/2026/omp-coding-agent-architecture-deep-dive/) (Kondasamy Jayaraman, 2026-09-13) — LSP or DAP for structural and runtime bugs, and isolated worktrees for parallel writers.

### Omitted on purpose

Computer control, GitHub, debugging adapters, structural edits, security scans, advisor, prewalk, vibe mode, goal mode, hooks, TTSR, themes, custom tools, plugin marketplaces, extension authoring, ACP, RPC, SDK, and the full environment-variable catalog. Start from the [docs overview](https://omp.sh/docs) learning path.

### Notes

- `https://omp.sh/install` redirects to the GitHub installer. It is not a docs page.
- Model IDs in older blog posts go stale. Copy selectors from `omp models`.
- This sheet is upstream [can1357/oh-my-pi](https://github.com/can1357/oh-my-pi). It is not the separate Pi cheatsheet for [pi.dev](https://pi.dev/).

</details>
