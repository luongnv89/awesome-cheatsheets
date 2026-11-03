---
slug: herdr
title: Herdr — Agent Multiplexer Cheatsheet
category: tool
subcategory: agent-multiplexer
summary: Checklist-first path to install Herdr TUI, run multiple coding agents with sidebar state, detach/reattach, connect SSH machines, configure integrations, and automate agents via CLI and plugins.
last_updated: 2026-11-03
stale_after_days: 90
upstream_version: "v0.9.5"
tags: [herdr, agent-multiplexer, terminal, tmux, cli, agents, plugins, remote, ssh]
status: published
authors:
  - name: luongnv89
links:
  homepage: https://herdr.dev/tui/
  docs: https://herdr.dev/tui/docs/
  repo: https://github.com/herdrdev/herdr
  install: https://herdr.dev/tui/docs/install/
  quick-start: https://herdr.dev/tui/docs/quick-start/
  agents: https://herdr.dev/tui/docs/agents/
  agent-automation: https://herdr.dev/tui/docs/agent-automation/
  connecting-machines: https://herdr.dev/tui/docs/connecting-machines/
  configuration: https://herdr.dev/tui/docs/configuration/
  session-state: https://herdr.dev/tui/docs/session-state/
  socket-api: https://herdr.dev/tui/docs/socket-api/
  plugins: https://herdr.dev/tui/docs/plugins/
  troubleshooting: https://herdr.dev/tui/docs/troubleshooting/
  agent-guide: https://herdr.dev/agent-guide.md
---

# Herdr — Agent Multiplexer Cheatsheet

**One-line:** Herdr is a terminal-native agent multiplexer (Rust binary) that keeps real panes running, shows agent state (`working` / `blocked` / `done` / `idle`) in a sidebar, and detaches/reattaches like tmux — with CLI, remote attach, saved SSH machines, and plugins for multi-agent workflows.

> [!NOTE]
> This sheet covers **Herdr TUI** (`herdr` CLI, `~/.config/herdr`). [herdr.dev](https://herdr.dev/) now also leads with the separate **Herdr app** (desktop, `herdr-app` + herdr-core `hc` CLIs, `~/.config/herdr-app`); per its FAQ the two do not share agents. See the [Herdr App cheatsheet](/cheatsheets/herdr-app/).

## Installation

Stable-channel binaries ship for **Linux, macOS, and Windows** (Windows is generally available since v0.8.2, with documented platform limits).

**Linux / macOS (official installer):**
```bash
curl -fsSL https://herdr.dev/install.sh | sh
```

**Homebrew:**
```bash
brew install herdr
```

**mise:**
```bash
mise use -g herdr
# fallback if registry is old: mise use -g github:herdrdev/herdr
```

**Nix (pin a release tag when possible):**
```bash
nix run github:herdrdev/herdr/v0.x.y   # replace with latest tag
```

**Windows:**
```powershell
powershell -ExecutionPolicy Bypass -c "irm https://herdr.dev/install.ps1 | iex"
```

**Windows fallback (Command Prompt, when endpoint security blocks the PowerShell one-liner):**
```bat
curl.exe -fsSLo install.cmd https://herdr.dev/install.cmd && install.cmd && del install.cmd
```

**Verify and first attach:**
```bash
herdr --version
herdr
```

> [!TIP]
> If `herdr` is not found, restart the terminal or fix `PATH`. Detach with `ctrl+b q`; reattach with `herdr`.

**Update (depends on install method):**
```bash
herdr update                 # direct installer only; old compatible server keeps running
herdr update --handoff       # experimental live server handoff (direct installs)
herdr channel set preview    # direct installs (Linux, macOS, Windows)
herdr channel set stable
# Homebrew / mise / Nix: update through that package manager; preview channel not available there
```

> [!NOTE]
> After an update, `herdr` reconnects with the new client while the compatible old server keeps your panes alive. Restart it (`herdr server stop`, then `herdr`) only when you want server-side changes. `herdr update` also lists saved SSH machines — update each one there.

## Step-by-Step Setup & Optimization

### Step 1 — Basic working setup

**Goal:** A running session with agents visible in the sidebar · **Time:** ~10 min · **Level:** beginner

- Run `herdr` from a project directory after install.
- Create **one workspace per active project** (sidebar state rolls up per workspace).
- Prefer the **mouse first**: click panes/tabs/workspaces/agents, drag borders, right-click to split/create tabs, drag-select to copy.
- Start an agent **inside a pane** (not inside nested tmux):

  ```bash
  claude    # or: codex, pi, opencode, hermes, …
  ```

- Confirm the sidebar shows agent state (`working`, `blocked`, `done`, `idle`).
- Learn five prefix keys (default prefix `ctrl+b`):

  | Action | Key |
  | ------- | --- |
  | New tab | `prefix+c` |
  | Split right / down | `prefix+v` / `prefix+minus` |
  | Move panes | `prefix+h/j/k/l` |
  | Workspace navigation | `prefix+w` |
  | Detach (leave agents running) | `prefix+q` |

- Press `prefix+?` for the full live keymap.

**Verify:** `herdr status` shows your running session and panes.

### Step 2 — Daily workflow

**Goal:** A daily detach/reattach and remote routine · **Time:** ~10 min · **Level:** beginner

- Detach with `prefix+q` or close the terminal; reattach later with `herdr` — processes keep running on the server.
- Stop the whole default session only when you mean to kill panes:

  ```bash
  herdr server stop
  ```

- Pick a remote path intentionally:

  | Path | When |
  | ---- | ---- |
  | `ssh you@server` then `herdr` | Simple remote / phone SSH client |
  | `herdr --remote workbox` | Local thin client + local clipboard image paste bridge |
  | Local `herdr` | Day-to-day on the machine that has the code |

  ```bash
  herdr --remote workbox
  herdr --remote ssh://you@server:2222
  herdr --remote workbox --session agents
  ```

- **Saved SSH machines (v0.9+)** show remote sessions in the same sidebar; `--machine` routes CLI/API commands to one:

  ```bash
  herdr machine add workbox --label "Build machine"
  herdr machine list
  herdr machine status
  herdr --machine "Build machine" agent list
  ```

- Use **named sessions** only when you need separate servers/sockets (workspaces usually come first):

  ```bash
  herdr session list
  herdr session attach work
  herdr session stop work
  ```

- Spawn or attach agents from scripts when useful. `agent start` activates an **existing idle shell pane** — create the pane first:

  ```bash
  herdr pane split w1:p1 --direction right    # prints the new pane ID (here w1:p2)
  herdr agent start reviewer --kind pi --pane w1:p2
  herdr agent prompt reviewer "review the last commit" --wait
  herdr agent list
  herdr agent wait reviewer --until blocked
  herdr agent attach reviewer
  ```

**Verify:** `herdr agent list` shows the agents you spawned.

### Step 3 — Configuration baseline

**Goal:** A config baseline with integrations and notifications · **Time:** ~15 min · **Level:** intermediate

- Config is optional. Path: `~/.config/herdr/config.toml` (Windows: `%APPDATA%\herdr\config.toml`).
- Dump defaults when you want a full starter file:

  ```bash
  herdr --default-config > ~/.config/herdr/config.toml
  herdr server reload-config
  ```

- Install integrations for the agents you actually use (better restore / lifecycle where supported):

  ```bash
  herdr integration install claude
  herdr integration install codex
  herdr integration install pi
  herdr integration install hermes
  herdr integration install opencode
  # also: omp, copilot, devin, droid, kimi, kilo, qodercli, qwen, letta, cursor, mastracode, grok
  herdr integration status
  ```

- Enable toast notifications so blocked/done agents surface when you are elsewhere:

  ```toml
  [ui.toast]
  delivery = "herdr"   # or: terminal | system | off
  delay_seconds = 1
  ```

- Optional theme and prefix (`prefix` accepts one key or an array):

  ```toml
  [theme]
  name = "catppuccin"

  [keys]
  prefix = ["ctrl+b", "ctrl+s"]
  ```

- Optional prefix-free chords (safe family is often `ctrl+alt`; verify against your OS/terminal):

  ```toml
  [keys]
  focus_pane_left = ["prefix+h", "ctrl+alt+h"]
  focus_pane_down = ["prefix+j", "ctrl+alt+j"]
  focus_pane_up = ["prefix+k", "ctrl+alt+k"]
  focus_pane_right = ["prefix+l", "ctrl+alt+l"]
  next_tab = ["prefix+n", "ctrl+alt+]"]
  previous_tab = ["prefix+p", "ctrl+alt+["]
  ```

**Verify:** `herdr integration status` lists your installed integrations.

### Step 4 — Advanced optimization

**Goal:** Worktrees, CLI orchestration, and plugins on top of the baseline · **Time:** ~20 min · **Level:** advanced

- **Git worktrees as workspaces** (sidebar or CLI):

  ```bash
  herdr worktree create --branch worktree/api
  herdr worktree list
  herdr worktree open --branch worktree/api
  # herdr worktree remove --workspace <WORKSPACE_ID>   # explicit checkout delete; does not delete branch
  ```

  ```toml
  [worktrees]
  directory = "~/.herdr/worktrees"
  ```

- **CLI orchestration** for multi-agent pipelines:

  ```bash
  herdr workspace create --cwd ~/project --label api --no-focus
  herdr tab create --label logs
  herdr pane split w1:p1 --direction right
  herdr pane run w1:p2 "npm test"
  herdr pane wait-output w1:p2 --match "PASS" --timeout 600000
  herdr agent wait w1:p1 --until done
  herdr pane read w1:p2 --source recent --lines 50
  ```

  Use `pane wait-output` for commands and servers, `agent wait` for coding agents. Both wait forever without `--timeout`.

- **Agent detection debug** when status looks wrong:

  ```bash
  herdr agent explain <TARGET>
  herdr agent explain --file screen.txt --agent codex --json
  herdr server update-agent-manifests
  # local override: ~/.config/herdr/agent-detection/<AGENT>.toml
  herdr server reload-agent-manifests
  ```

- **Sandbox wrappers (Linux/macOS):** if Bubblewrap/VM/`fence`/`nono` hides the process, set a scoped hint:

  ```bash
  HERDR_AGENT=claude fence -- claude
  ```

- **Plugins** for reusable workflows (vet manifests; full CLI access):

  ```bash
  herdr plugin install ogulcancelik/herdr-plugin-examples/worktree-bootstrap
  herdr plugin list
  herdr plugin update
  herdr plugin action list
  herdr plugin link /path/to/local-plugin
  ```

  Plugins are global per user; bind actions to keys with `[[keys.command]]` (see Configuration → Custom command keybindings).

- **Session restore trade-offs** (read before enabling history):

  | Path | Processes keep running | Agent conversation |
  | ---- | ---------------------- | ------------------ |
  | Detach / reattach | Yes | Yes (process never stopped) |
  | Server restart + native restore | No (new process) | With official integrations, or agents that report their own resume command |
  | `herdr update --handoff` | Best-effort if handoff succeeds | Yes if process survives |

  ```toml
  [session]
  resume_agents_on_restore = true   # default

  [experimental]
  pane_history = false              # off by default; can store secrets in session-history.json
  ```

- Teach an AI agent Herdr with the official agent guide:

  ```text
  Help me understand and set up Herdr. Read https://herdr.dev/agent-guide.md first, then walk me through it step by step.
  ```

**Verify:** `herdr worktree list` shows your worktree workspaces.

### Step 5 — Maintenance and troubleshooting

**Goal:** Safe upgrades and a working debug loop · **Time:** ~10 min · **Level:** intermediate

- Prefer detach over `server stop` when agents should keep working.
- After upgrades the compatible old server keeps running; restart it only for server-side changes (`herdr server stop` then `herdr`, or `herdr session stop <SESSION_NAME>` then reattach).
- On Linux/macOS (v0.9.4+), closing the shell that started Herdr no longer stops the server; scripts that relied on SIGHUP should use `herdr server stop` or SIGTERM.
- Codex users on v0.9.5+: re-run `herdr integration install codex` (Herdr no longer installs Codex turn hooks).

> [!WARNING]
> Do **not** nest `tmux` inside a Herdr pane — detection sees `tmux`, not the agent. Herdr *as* outer terminal is fine.

- Check status and logs:

  ```bash
  herdr status
  herdr integration status --outdated-only
  # logs (typical):
  # ~/.config/herdr/herdr.log
  # ~/.config/herdr/herdr-client.log
  # ~/.config/herdr/herdr-server.log
  HERDR_LOG=herdr=debug herdr
  herdr machine reconnect "Build machine"   # re-auth a saved SSH machine
  ```

- Shell completions (optional):

  ```bash
  mkdir -p ~/.zfunc
  herdr completion zsh > ~/.zfunc/_herdr
  # fpath=(~/.zfunc $fpath) + compinit in ~/.zshrc
  ```

**Verify:** `herdr integration status --outdated-only` lists integrations that need updates.

## Best Practices

### Do

- ✅ Run agents **directly in Herdr panes** so sidebar state and waits work.
- ✅ One **workspace per project**; use tabs for agents / logs / server / review views.
- ✅ Install **integrations** for agents you resume after restarts; check `herdr integration status`.
- ✅ Detach with `prefix+q` instead of killing the session when work should continue.
- ✅ Use `ssh … && herdr` on phone/tablet; use `herdr --remote` when you want a local thin client.
- ✅ Prefer CLI wrappers (`herdr workspace|pane|agent …`) over raw sockets until you need events.
- ✅ Save remote boxes with `herdr machine add` when you watch agents on several machines.
- ✅ Vet plugins: skim `herdr-plugin.toml` and commands; pin `--ref`; avoid `--yes` for unknown sources.
- ✅ Treat `~/.config/herdr` like terminal history — especially if `pane_history` is enabled.

### Don't

- ❌ Nest tmux (or auto-tmux shell frameworks) inside Herdr panes if you need agent detection.
- ❌ Export `HERDR_AGENT=…` globally unless every inherited foreground process is that agent.
- ❌ Expect arbitrary processes (servers/tests) to resume after `server stop` — only layout + optional agent native resume.
- ❌ Enable `pane_history` casually on machines that show tokens/secrets in terminal output.
- ❌ Rely on `herdr update` for Homebrew/mise/Nix installs (use the package manager).
- ❌ Expect direct `herdr terminal attach` or live `--handoff` on Windows — both are unsupported there (Windows `--remote` and saved machines work).

## Quick Command Reference

```bash
# Launch / attach
herdr
herdr --session work
herdr --remote workbox
herdr --remote workbox --handoff
herdr --machine "Build machine" agent list

# Status / update / config
herdr status
herdr --version
herdr --default-config
herdr update
herdr channel show
herdr server stop
herdr server reload-config

# Saved SSH machines
herdr machine add workbox --label "Build machine"
herdr machine list
herdr machine status
herdr machine reconnect "Build machine"

# Sessions
herdr session list
herdr session attach work
herdr session stop work
herdr session delete side-project

# Workspaces / tabs / worktrees
herdr workspace create --cwd ~/project --label api
herdr workspace list
herdr tab create --label logs
herdr worktree create --branch feature/x
herdr worktree list
herdr workspace close w1 --group

# Panes
herdr pane split w1:p1 --direction right
herdr pane run w1:p2 "npm test"
herdr pane read w1:p2 --source recent --lines 50
herdr pane send-keys w1:p1 enter
herdr pane wait-output w1:p2 --match "PASS"

# Agents
herdr agent start reviewer --kind pi --pane w1:p2
herdr agent prompt reviewer "summarize the diff" --wait
herdr agent list
herdr agent wait reviewer --until blocked
herdr agent send-keys reviewer enter
herdr agent attach reviewer
herdr agent explain w1:p1
herdr agent rename w1:p1 reviewer

# Integrations / plugins
herdr integration install claude
herdr integration status
herdr plugin install owner/repo/subdir
herdr plugin list
herdr plugin update
herdr plugin action invoke example.layout.apply

# Direct terminal
herdr terminal attach term_abc123
herdr terminal attach term_abc123 --takeover
```

**Default prefix (`ctrl+b`) quick map:** `c` new tab · `v`/`-` split · `h/j/k/l` focus · `n`/`p` tabs · `w` workspaces · `z` zoom · `x` close pane · `[` copy mode · `b` sidebar · `g` go to · `r` resize · `q` detach · `?` help (`/` filters)

## Expected Outcomes

After Steps 1–3 you should have:

1. A running Herdr session that survives detach and reattach.
2. Multiple agents visible with correct sidebar states without polling every pane.
3. Integrations installed for your primary agents and config reloaded cleanly.
4. A clear remote strategy (SSH-in vs `herdr --remote`) matching how you work.

After Steps 4–5 you should also be able to:

1. Orchestrate workspaces/panes/agents from scripts or another agent via the CLI.
2. Create worktree workspaces and optional plugins without breaking core Herdr.
3. Debug wrong agent state with `agent explain` and keep detection manifests current.
4. Update safely for your install method without surprising process kills (or opt into `--handoff` when appropriate).

## Reference

<details>
<summary>Official docs, community sources, and omitted areas</summary>

### Official

| Topic | URL |
| ----- | --- |
| TUI home | https://herdr.dev/tui/ |
| Docs home | https://herdr.dev/tui/docs/ |
| Install | https://herdr.dev/tui/docs/install/ |
| Quick start | https://herdr.dev/tui/docs/quick-start/ |
| Concepts | https://herdr.dev/tui/docs/concepts/ |
| Keyboard | https://herdr.dev/tui/docs/keyboard/ |
| How to work (local/SSH/remote) | https://herdr.dev/tui/docs/how-to-work/ |
| Connecting machines | https://herdr.dev/tui/docs/connecting-machines/ |
| Agents & detection | https://herdr.dev/tui/docs/agents/ |
| Agent automation | https://herdr.dev/tui/docs/agent-automation/ |
| Agent skill | https://herdr.dev/tui/docs/agent-skill/ |
| Integrations | https://herdr.dev/tui/docs/integrations/ |
| Configuration | https://herdr.dev/tui/docs/configuration/ |
| Config reference | https://herdr.dev/tui/docs/config-reference/ |
| Session state | https://herdr.dev/tui/docs/session-state/ |
| Persistence & remote | https://herdr.dev/tui/docs/persistence-remote/ |
| CLI reference | https://herdr.dev/tui/docs/cli-reference/ |
| Socket API | https://herdr.dev/tui/docs/socket-api/ |
| Plugins | https://herdr.dev/tui/docs/plugins/ |
| Marketplace | https://herdr.dev/tui/docs/marketplace/ |
| Windows support & limits | https://herdr.dev/tui/docs/windows-beta/ |
| Troubleshooting | https://herdr.dev/tui/docs/troubleshooting/ |
| Agent onboarding guide | https://herdr.dev/agent-guide.md |
| Herdr app (separate product) | https://herdr.dev/ |
| Repository | https://github.com/herdrdev/herdr |
| Releases | https://github.com/herdrdev/herdr/releases |

### Community / walkthroughs (tips only; commands from official docs)

| Source | URL |
| ------ | --- |
| Official blog: Connecting the machines (v0.9, 2026-09) | https://herdr.dev/blog/connecting-the-machines/ |
| Official blog: Live updates / handoff | https://herdr.dev/blog/live-updates-without-killing-your-terminal-processes/ |
| Flavio Copes: Herdr vs cmux | https://flaviocopes.com/herdr-vs-cmux/ |
| dev.to: throughput case for parallel agents (`agent start --kind`) | https://dev.to/pvgomes/herdr-and-the-throughput-case-for-parallel-coding-agents-4dk0 |
| Better Stack: agent state awareness | https://betterstack.com/community/guides/ai/herdr-ai-agent/ |
| DevelopersIO: tmux → herdr | https://dev.classmethod.jp/en/articles/herdr-tmux-replacement/ |

### Omitted from this cheatsheet (see docs)

- Full `config-reference` key inventory and every keybinding field
- Complete raw socket protocol, event subscription shapes, and graphics streaming
- Per-agent integration install paths and hook file locations (see Integrations)
- Full plugin manifest authoring cookbook and marketplace publishing
- Windows platform limitations detail (`/tui/docs/windows-beta/`) and preview-channel docs
- The separate Herdr app and `herdr-core` (`hc` CLI) — see the [Herdr App cheatsheet](/cheatsheets/herdr-app/)
- Experimental IME / Kitty graphics settings beyond a mention of trade-offs

### Environment variables (selected)

| Variable | Purpose |
| -------- | ------- |
| `HERDR_CONFIG_PATH` | Override config file path |
| `HERDR_SESSION` | Named session for CLI |
| `HERDR_SOCKET_PATH` | Low-level socket override |
| `HERDR_LOG` | e.g. `herdr=debug` |
| `HERDR_DISABLE_SOUND` | Mute sound notifications |
| `HERDR_AGENT` | Scoped agent-manifest hint for sandboxed processes |
| `HERDR_PROCESS_DETECTION` | Linux detection strategy: `native` (default) or opt-in `child-groups` |
| `HERDR_REMOTE_BINARY` | Local binary path for remote attach bootstrap |
| `HERDR_ENV` / `HERDR_PANE_ID` / `HERDR_TAB_ID` / `HERDR_WORKSPACE_ID` | Injected into managed panes |

</details>
