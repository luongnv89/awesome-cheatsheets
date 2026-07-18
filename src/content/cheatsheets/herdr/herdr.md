---
slug: herdr
title: Herdr — Agent Multiplexer Cheatsheet
category: tool
subcategory: agent-multiplexer
summary: Checklist-first path to install Herdr, run multiple coding agents with sidebar state, detach/reattach, configure integrations, and automate workspaces via CLI and plugins.
last_updated: 2026-07-18
stale_after_days: 90
upstream_version: "docs as of 2026-07"
tags: [herdr, agent-multiplexer, terminal, tmux, cli, agents, plugins, remote]
status: published
authors:
  - name: luongnv89
links:
  homepage: https://herdr.dev/
  docs: https://herdr.dev/docs/
  repo: https://github.com/ogulcancelik/herdr
  install: https://herdr.dev/docs/install/
  quick-start: https://herdr.dev/docs/quick-start/
  agents: https://herdr.dev/docs/agents/
  configuration: https://herdr.dev/docs/configuration/
  session-state: https://herdr.dev/docs/session-state/
  socket-api: https://herdr.dev/docs/socket-api/
  plugins: https://herdr.dev/docs/plugins/
  agent-guide: https://herdr.dev/agent-guide.md
---

# Herdr — Agent Multiplexer Cheatsheet

**One-line:** Herdr is a terminal-native agent multiplexer (Rust binary) that keeps real panes running, shows agent state (`working` / `blocked` / `done` / `idle`) in a sidebar, and detaches/reattaches like tmux — with CLI, remote attach, and plugins for multi-agent workflows.

## Installation

Stable on **Linux and macOS**. Native **Windows is preview beta** only.

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
# fallback if registry is old: mise use -g github:ogulcancelik/herdr
```

**Nix (pin a release tag when possible):**
```bash
nix run github:ogulcancelik/herdr/v0.x.y   # replace with latest tag
```

**Windows preview beta:**
```powershell
powershell -ExecutionPolicy Bypass -c "irm https://herdr.dev/install.ps1 | iex"
```

**Verify and first attach:**
```bash
herdr --version
herdr
```

If `herdr` is not found, restart the terminal or fix `PATH`. Detach with `ctrl+b q`; reattach with `herdr`.

**Update (depends on install method):**
```bash
herdr update                 # direct installer only
herdr update --handoff       # experimental live server handoff (direct installs)
herdr channel set preview    # Linux/macOS direct installs only
herdr channel set stable
# Homebrew / mise / Nix: update through that package manager, then restart the session when ready
```

## Step-by-Step Setup & Optimization

### Step 1 — Basic working setup

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

### Step 2 — Daily workflow

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

- Use **named sessions** only when you need separate servers/sockets (workspaces usually come first):

  ```bash
  herdr session list
  herdr session attach work
  herdr session stop work
  ```

- Spawn or attach agents from scripts when useful:

  ```bash
  herdr agent start reviewer --cwd ~/project --split right -- pi
  herdr agent list
  herdr agent wait reviewer --status blocked
  herdr agent attach reviewer
  ```

### Step 3 — Configuration baseline

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
  # also: omp, copilot, devin, droid, kimi, kilo, qodercli, cursor, mastracode
  herdr integration status
  ```

- Enable toast notifications so blocked/done agents surface when you are elsewhere:

  ```toml
  [ui.toast]
  delivery = "herdr"   # or: terminal | system | off
  delay_seconds = 1
  ```

- Optional theme and prefix:

  ```toml
  [theme]
  name = "catppuccin"

  [keys]
  prefix = "ctrl+b"
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

### Step 4 — Advanced optimization

- **Git worktrees as workspaces** (sidebar or CLI):

  ```bash
  herdr worktree create --branch worktree/api
  herdr worktree list
  herdr worktree open --branch worktree/api
  # herdr worktree remove --workspace <id>   # explicit checkout delete; does not delete branch
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
  herdr wait agent-status w1:p1 --status done
  herdr pane read w1:p2 --source recent --lines 50
  ```

- **Agent detection debug** when status looks wrong:

  ```bash
  herdr agent explain <target>
  herdr agent explain --file screen.txt --agent codex --json
  herdr server update-agent-manifests
  # local override: ~/.config/herdr/agent-detection/<agent>.toml
  herdr server reload-agent-manifests
  ```

- **Sandbox wrappers (Linux):** if Bubblewrap/VM/`fence` hides the process, set a scoped hint:

  ```bash
  HERDR_AGENT=claude fence -- claude
  ```

- **Plugins** for reusable workflows (vet manifests; full CLI access):

  ```bash
  herdr plugin install ogulcancelik/herdr-plugin-examples/agent-telegram-notify
  herdr plugin list
  herdr plugin action list
  herdr plugin link /path/to/local-plugin
  ```

  ```toml
  [[keys.command]]
  key = "prefix+l"
  type = "plugin_action"
  command = "example.layout.apply"
  description = "apply layout"
  ```

- **Session restore trade-offs** (read before enabling history):

  | Path | Processes keep running | Agent conversation |
  | ---- | ---------------------- | ------------------ |
  | Detach / reattach | Yes | Yes (process never stopped) |
  | Server restart + native restore | No (new process) | Only with current official integrations |
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

### Step 5 — Maintenance and troubleshooting

- Prefer detach over `server stop` when agents should keep working.
- After package-manager upgrades, restart the Herdr server when you need the new binary (`herdr server stop` then `herdr`, or named `herdr session stop <name>` then reattach).
- Do **not** nest `tmux` inside a Herdr pane — detection sees `tmux`, not the agent. Herdr *as* outer terminal is fine.
- Check status and logs:

  ```bash
  herdr status
  herdr integration status --outdated-only
  # logs (typical):
  # ~/.config/herdr/herdr.log
  # ~/.config/herdr/herdr-client.log
  # ~/.config/herdr/herdr-server.log
  HERDR_LOG=herdr=debug herdr
  ```

- Shell completions (optional):

  ```bash
  mkdir -p ~/.zfunc
  herdr completion zsh > ~/.zfunc/_herdr
  # fpath=(~/.zfunc $fpath) + compinit in ~/.zshrc
  ```

## Best Practices

### Do

- ✅ Run agents **directly in Herdr panes** so sidebar state and waits work.
- ✅ One **workspace per project**; use tabs for agents / logs / server / review views.
- ✅ Install **integrations** for agents you resume after restarts; check `herdr integration status`.
- ✅ Detach with `prefix+q` instead of killing the session when work should continue.
- ✅ Use `ssh … && herdr` on phone/tablet; use `herdr --remote` when you want a local thin client.
- ✅ Prefer CLI wrappers (`herdr workspace|pane|agent|wait …`) over raw sockets until you need events.
- ✅ Vet plugins: skim `herdr-plugin.toml` and commands; pin `--ref`; avoid `--yes` for unknown sources.
- ✅ Treat `~/.config/herdr` like terminal history — especially if `pane_history` is enabled.

### Don't

- ❌ Nest tmux (or auto-tmux shell frameworks) inside Herdr panes if you need agent detection.
- ❌ Export `HERDR_AGENT=…` globally unless every inherited foreground process is that agent.
- ❌ Expect arbitrary processes (servers/tests) to resume after `server stop` — only layout + optional agent native resume.
- ❌ Enable `pane_history` casually on machines that show tokens/secrets in terminal output.
- ❌ Rely on `herdr update` for Homebrew/mise/Nix installs (use the package manager).
- ❌ Assume Windows is production-stable (preview beta; `herdr --remote` not part of Windows beta).

## Quick Command Reference

```bash
# Launch / attach
herdr
herdr --session work
herdr --remote workbox
herdr --remote workbox --handoff
herdr --no-session

# Status / update / config
herdr status
herdr --version
herdr --default-config
herdr update
herdr channel show
herdr server stop
herdr server reload-config

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

# Panes
herdr pane split w1:p1 --direction right
herdr pane run w1:p2 "npm test"
herdr pane read w1:p2 --source recent --lines 50
herdr pane send-keys w1:p1 enter

# Agents
herdr agent start reviewer --cwd ~/project --split right -- pi
herdr agent list
herdr agent wait reviewer --status blocked
herdr agent attach reviewer
herdr agent explain w1:p1
herdr agent rename w1:p1 reviewer

# Waits
herdr wait agent-status w1:p1 --status done
herdr wait output w1:p2 --match "PASS"

# Integrations / plugins
herdr integration install claude
herdr integration status
herdr plugin install owner/repo/subdir
herdr plugin list
herdr plugin action invoke example.layout.apply

# Direct terminal
herdr terminal attach term_abc123
herdr terminal attach term_abc123 --takeover
```

**Default prefix (`ctrl+b`) quick map:** `c` new tab · `v`/`-` split · `h/j/k/l` focus · `n`/`p` tabs · `w` workspaces · `z` zoom · `x` close pane · `[` copy mode · `b` sidebar · `q` detach · `?` help

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
| Docs home | https://herdr.dev/docs/ |
| Install | https://herdr.dev/docs/install/ |
| Quick start | https://herdr.dev/docs/quick-start/ |
| Concepts | https://herdr.dev/docs/concepts/ |
| Keyboard | https://herdr.dev/docs/keyboard/ |
| How to work (local/SSH/remote) | https://herdr.dev/docs/how-to-work/ |
| Agents & detection | https://herdr.dev/docs/agents/ |
| Integrations | https://herdr.dev/docs/integrations/ |
| Configuration | https://herdr.dev/docs/configuration/ |
| Config reference | https://herdr.dev/docs/config-reference/ |
| Session state | https://herdr.dev/docs/session-state/ |
| Persistence & remote | https://herdr.dev/docs/persistence-remote/ |
| CLI reference | https://herdr.dev/docs/cli-reference/ |
| Socket API | https://herdr.dev/docs/socket-api/ |
| Plugins | https://herdr.dev/docs/plugins/ |
| Marketplace | https://herdr.dev/docs/marketplace/ |
| Agent onboarding guide | https://herdr.dev/agent-guide.md |
| Repository | https://github.com/ogulcancelik/herdr |
| Releases | https://github.com/ogulcancelik/herdr/releases |

### Community / walkthroughs (tips only; commands from official docs)

| Source | URL |
| ------ | --- |
| Better Stack: agent state awareness | https://betterstack.com/community/guides/ai/herdr-ai-agent/ |
| shareuhack herdr guide (2026) | https://www.shareuhack.com/en/posts/herdr-terminal-agent-multiplexer-guide-2026 |
| DevelopersIO: tmux → herdr | https://dev.classmethod.jp/en/articles/herdr-tmux-replacement/ |
| Live updates / handoff blog | https://herdr.dev/blog/live-updates-without-killing-your-terminal-processes/ |

### Omitted from this cheatsheet (see docs)

- Full `config-reference` key inventory and every keybinding field
- Complete raw socket protocol, event subscription shapes, and graphics streaming
- Per-agent integration install paths and hook file locations (see Integrations)
- Full plugin manifest authoring cookbook and marketplace publishing
- Windows beta limitations detail (`/docs/windows-beta/` / preview docs)
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
| `HERDR_REMOTE_BINARY` | Local binary path for remote attach bootstrap |
| `HERDR_ENV` / `HERDR_PANE_ID` / `HERDR_TAB_ID` / `HERDR_WORKSPACE_ID` | Injected into managed panes |

</details>
