---
slug: herdr-app
title: Herdr App — Desktop Agent Workspace Cheatsheet
category: tool
subcategory: agent-multiplexer
summary: Checklist-first path to install the Herdr desktop app and herdr-core, organize agents in spaces and tabs, add SSH machines, customize settings, keys and layouts, and automate terminals with the herdr-app and hc CLIs.
last_updated: 2026-11-03
stale_after_days: 60
upstream_version: "app v0.1.12 / core v0.1.17"
tags: [herdr, herdr-app, herdr-core, agent-multiplexer, desktop, terminal, agents, ssh, cli]
status: published
authors:
  - name: luongnv89
links:
  homepage: https://herdr.dev/
  repo: https://github.com/herdrdev/herdr-app
  core-repo: https://github.com/herdrdev/herdr-core
  core: https://herdr.dev/core/
  download: https://herdr.dev/download/
  app-guide: https://github.com/herdrdev/herdr-app/blob/master/defaults/AGENTS.md
  app-commands: https://github.com/herdrdev/herdr-app/blob/master/docs/commands.md
  core-commands: https://github.com/herdrdev/herdr-core/blob/master/docs/commands.md
  core-machines: https://github.com/herdrdev/herdr-core/blob/master/docs/machines.md
---

# Herdr App — Desktop Agent Workspace Cheatsheet

**One-line:** The Herdr app is an open-source (Apache-2.0) native desktop app for terminals and coding agents: work lives in spaces and tabs, an agents sidebar shows who is `working` / `blocked` / `done` / `idle`, and every terminal runs in **herdr-core** (`hc`) so it survives closing or updating the window.

> [!NOTE]
> This is **not** Herdr TUI. The app is a separate program built on herdr-core; per the herdr.dev FAQ they don't share agents, and agents started in the TUI don't appear in the app. For the terminal multiplexer (`herdr` CLI) see the [Herdr TUI cheatsheet](/cheatsheets/herdr/).

**Two programs, two CLIs:**

| Program | CLI | Config | Job |
| ------- | --- | ------ | --- |
| Herdr app (the window) | `herdr-app` | `~/.config/herdr-app/` | Spaces, tabs, layouts, panels, keys |
| herdr-core | `hc` | `~/.config/herdr-core/config.toml` | Runs every terminal and agent, locally and on other machines |

## Installation

**Linux / macOS (also installs herdr-core if missing):**
```bash
curl -fsSL https://releases.herdr.dev/app/install.sh | sh
```

**macOS Apple Silicon via Homebrew:**
```bash
brew install --cask herdr-app
```

**Windows x64 (PowerShell, Windows 10 1803+, needs curl and tar):**
```powershell
irm https://releases.herdr.dev/app/install.ps1 | iex
```

**Drag-and-drop (Apple Silicon):** download `https://releases.herdr.dev/app/Herdr.dmg` and drag Herdr to Applications.

**herdr-core only (headless boxes you'll connect to):**
```bash
curl -fsSL https://releases.herdr.dev/core/install.sh | sh
```

Platform limits: macOS builds are **Apple Silicon only** (Intel Macs build from source); Linux is x86-64/ARM64 and needs a desktop session plus a working **Vulkan** driver. The installer puts the command in `~/.local/bin` (add it to `PATH` if asked); on macOS the app lives in `~/Applications/Herdr.app`, on Windows `%LOCALAPPDATA%\Programs\herdr-app` is added to your user PATH.

**Check the install:**
```bash
herdr-app commands
hc --version
```

> [!TIP]
> The installers download and run code — read them first if you prefer. Herdr TUI uses a different binary (`herdr`) and config folder, and the FAQ says it keeps working — but side-by-side installs aren't explicitly documented.

## Step-by-Step Setup & Optimization

### Step 1 — First run

**Goal:** An agent running in a space with its status in the sidebar · **Time:** ~5 min · **Level:** beginner

1. Open Herdr and start a terminal or any installed agent from the **+** menu in the tab bar.
2. Let the agent configure Herdr for you — the app's whole interface is files, documented in its bundled guide. Ask your agent:
   ```text
   Read ~/.config/herdr-app/AGENTS.md, then move the agents list to the right and make the theme warmer.
   ```
3. Watch the agents sidebar. A space's and tab's status is its most urgent agent: **blocked > done > working > idle** (`done` = finished while you weren't looking; it turns `idle` once you look).
4. Check what's on screen from a shell:
   ```bash
   herdr-app status
   ```

**Verify:** `herdr-app ls` lists your space, its tab, and the agent's terminal.

### Step 2 — Daily workflow: spaces, tabs, panes

**Goal:** One space per repo with named tabs and a fast keyboard path · **Time:** ~10 min · **Level:** beginner

1. Keep **one space per repo/machine**. An unnamed space follows its first terminal's folder; name it when you want a label that sticks.
2. Use a **tab per piece of work** ("fix login"), split into panes for terminals or mod panels (Files, Changes).
3. Open the command palette — every command and its key: **Ctrl+Shift+P** (**Cmd+Shift+P** on macOS).
4. Cycle layouts with `ctrl-shift-l`. Shipped layouts: **Herdr** (`main`), **Terminals**, **Herdr 98**.
5. Click an agent in the sidebar to jump to it; a worker without a pane opens in **peek** over your tab. Ctrl-click (Cmd-click on macOS) a live terminal address like `t7` or `vps/t7` in terminal text to peek at it.
6. Close the window freely — terminals keep running in the core. Closing a **pane or tab** ends its terminals.

> [!WARNING]
> After a reboot or core crash, kept panes come back as **fresh shells in their last folders** — the original command is never re-run. Restart agents yourself (their native resume, if any).

**Verify:** `herdr-app ls` shows each space with its named tabs and terminals.

### Step 3 — Configuration baseline

**Goal:** Personal settings, keys, and a cloned layout that survive updates · **Time:** ~15 min · **Level:** intermediate

All files live in `~/.config/herdr-app/` and apply **live**. An invalid edit keeps the last good version and writes the reason to `settings.error`, `keys.error`, `layout.error`, or `programs.error`.

1. Set personal preferences in `settings.json`:
   ```json
   {
     "zoom": 1,
     "sounds": { "enabled": true },
     "font_ligatures": true
   }
   ```
   Other keys: `font`, `font_size`, `ui_font`, `theme`, `colors`, `minimum_contrast`, `clipboard_write`, `core` (path to `hc`), and macOS `option_as_alt` (`auto` / `on` / `off` / `left` / `right`).
2. Rebind keys in `keys.json` — sections `global`, `terminal`, `layout:<NAME>`, `mod:<NAME>`:
   ```json
   {
     "global": { "ctrl-shift-t": "tab.new", "ctrl-shift-o": "pane.split:right" },
     "terminal": { "ctrl-shift-c": "terminal.copy" }
   }
   ```
3. Clone a shipped layout or mod **before** changing its structure — Herdr rewrites shipped ones on start:
   ```bash
   herdr-app do layout.clone '{"name":"main","as":"my-layout"}'
   herdr-app do mod.clone '{"name":"files","as":"my-files"}'
   ```

> [!TIP]
> Locked yourself out with a bad layout or key file? Press `ctrl-alt-shift-escape` — it sets the shown layout and `keys.json` aside and returns to the default `main` layout. Nothing can rebind it.

**Verify:** `herdr-app status` reports no errors from files or mods.

### Step 4 — Remote machines

**Goal:** Spaces whose agents run on a server and keep going while your laptop sleeps · **Time:** ~15 min · **Level:** intermediate

1. Add an SSH machine from **Settings → Machines** (or the sidebar's Add machine action; a port works like `user@server:2222`), or from the CLI:
   ```bash
   hc machine add <USER>@<HOST> --name box
   ```
2. Non-standard SSH or a sandbox CLI? Use a custom connection command:
   ```bash
   hc machine add --name box --via 'ssh -p 2222 -i ~/.ssh/<KEY> <USER>@<HOST>'
   ```
3. For scripts, allow hc to copy itself to the remote without prompting:
   ```bash
   hc machine add <USER>@<HOST> --name box --install
   ```
4. Create a space on that machine in the app; its terminals run there. Address remote terminals as `box/t7`.
5. Run and read a remote job from any shell:
   ```bash
   hc run --bg --on box --cwd /srv/app --name build cargo build
   hc read box/build --lines 100
   ```

> [!NOTE]
> Remote work keeps running when your window closes or laptop sleeps, as long as the remote machine and its core stay up. SSH passwords, codes, and host-key prompts need a person at a terminal; on Windows use SSH keys or an agent.

**Verify:** `hc machine ls` lists `box`, and the app sidebar shows its spaces.

### Step 5 — Automate with `hc` and `herdr-app`

**Goal:** Scripts and agents that start, steer, and wait on other agents · **Time:** ~20 min · **Level:** advanced

Use **herdr-core** to run and coordinate programs; use **herdr-app** to change what you see.

1. Start an agent in a new terminal and steer it:
   ```bash
   hc run --bg --name reviewer claude
   hc send reviewer "review src/auth.rs" --wait
   hc read reviewer --lines 50
   ```
2. Wait instead of sleeping — on one terminal, or on all helper agents you started:
   ```bash
   hc wait reviewer
   hc wait --children all
   ```
3. Wait for plain program output (tests, servers) — only output printed after the wait starts counts; an exit also ends it:
   ```bash
   hc run --bg --name tests npm test
   hc wait tests --output "passed"
   ```
4. Open a tab running an agent with a task, from a script:
   ```bash
   herdr-app do tab.new --name "fix login" --argv '["claude"]' --task "look at the login bug"
   ```
5. Reuse prompts as templates — after saving one as `~/.config/herdr-core/templates/reviewer.md` (Linux/macOS; Windows: `%APPDATA%\herdr-core\templates`), run it by name with a task:
   ```bash
   hc templates
   hc run --bg --name review reviewer "review src/x.rs"
   ```
6. Teach an agent both CLIs:
   ```bash
   hc --skill
   herdr-app --skill
   ```

> [!TIP]
> A terminal you start yourself shows up in a Herdr tab when it carries Herdr's labels: `hc run --keep --label herdr.space=<SPACE_ID> --label herdr.tab=<TAB_ID> -- claude`. Agents report status through the **OSC 7501** escape sequence; terminals without it show as plain programs.

**Verify:** `hc ls --all` lists `reviewer` and `tests` (finished ones too), and `hc wait reviewer` returns when the agent stops working.

### Step 6 — Maintenance and troubleshooting

**Goal:** Safe updates, privacy settings, and a debug loop · **Time:** ~10 min · **Level:** intermediate

1. Updates: installed releases download a new app in the background; it takes over on quit/reopen or via the update action (**Settings → Updates**). Terminals keep running in the core. Update core directly:
   ```bash
   hc update
   ```
2. Check core health:
   ```bash
   hc server status
   ```
3. After any config edit, look for `*.error` files in `~/.config/herdr-app/` and run `herdr-app status`.
4. Agent missing from the sidebar? Update the agent, don't run it inside tmux within Herdr, and remember TUI agents never show in the app.
5. Telemetry is **on by default** in releases (daily counts, never terminal content or file names). Turn it off in **Settings → Privacy** or with `"telemetry": false` in `settings.json`; `DO_NOT_TRACK=1` or `HERDR_TELEMETRY=0` in the environment disables it for one run.

**Verify:** `hc server status` reports a running core and `herdr-app status` shows no file or mod errors.

## Best Practices

### Do

- ✅ Point your coding agent at `~/.config/herdr-app/AGENTS.md` and let it edit layouts, keys, and mods.
- ✅ Clone shipped layouts/mods (`layout.clone`, `mod.clone`) before editing structure or code.
- ✅ Run long agents on a remote machine so they keep working while your laptop sleeps.
- ✅ Use `hc wait` / `hc send --wait` in scripts instead of `sleep`.
- ✅ Keep one space per repo and name tabs after the task.
- ✅ Check for `*.error` files after hand-editing config.

### Don't

- ❌ Install someone else's mod without reading it — mods are trusted JavaScript, not sandboxed extensions.
- ❌ Expect agents started in Herdr TUI to appear in the app (or vice versa).
- ❌ Close a pane or tab you want to keep running — that ends its terminals; close the window instead.
- ❌ Rely on processes surviving a reboot — panes return as fresh shells.
- ❌ Nest tmux inside Herdr terminals if you want agent status.
- ❌ Edit files under `frame/` or shipped layouts in place — Herdr rewrites them on start.

### When to use the app vs Herdr TUI

- **Use the Herdr app when:** you want a native GPU window, a visual agents sidebar, Files/Changes panels, mods, and remote machines managed by herdr-core.
- **Use Herdr TUI when:** you live in a terminal or over SSH from a phone, want tmux-style prefix keys, or rely on its CLI/plugins — see the [Herdr TUI cheatsheet](/cheatsheets/herdr/).

## Quick Command Reference

```bash
# App (the window)
herdr-app ls                       # spaces, tabs, terminals
herdr-app status                   # layout, focus, errors from files and mods
herdr-app commands                 # every app command and its arguments
herdr-app do pane.split:right
herdr-app do tab.new --name "fix login" --argv '["claude"]' --task "look at the login bug"
herdr-app do layout.clone '{"name":"main","as":"my-layout"}'
herdr-app shot window.png          # screenshot of the window
herdr-app --skill                  # agent guide for driving the window

# Core terminals
hc                                 # pick a terminal and attach
hc run --bg --name reviewer claude
hc ls
hc attach reviewer                 # ctrl+\ detaches
hc read reviewer --lines 50
hc send reviewer "next task" --wait
hc keys reviewer ctrl+c
hc interrupt reviewer
hc wait reviewer
hc wait --children all
hc kill reviewer
hc rm reviewer

# No terminal
hc exec --on box --cwd /srv/app git diff
hc file read --on box /srv/app/README.md

# Machines
hc machine add <USER>@<HOST> --name box
hc machine ls
hc run --on box --cwd /srv/app cargo test

# Core server
hc server status
hc server restart
hc update
hc templates
hc --skill
```

**Keys:** `Ctrl/Cmd+Shift+P` palette · `ctrl-shift-l` switch layout · `ctrl-alt-shift-escape` reset to default layout · Ctrl/Cmd-click a terminal address to peek

## Expected Outcomes

After Steps 1–3 you should have:

1. Herdr app and herdr-core installed, with agents visible in the sidebar by status.
2. One space per repo with named tabs, and a keyboard path through the palette.
3. Personal `settings.json` / `keys.json` and a cloned layout that survive updates.

After Steps 4–6 you should also be able to:

1. Run agents on remote machines that keep working while your laptop sleeps.
2. Start, steer, and wait on agents from scripts with `hc`, and open tabs with `herdr-app do`.
3. Update safely without losing running terminals, and debug config errors and missing agents.

## Reference

<details>
<summary>Official docs, community sources, and omitted areas</summary>

### Official

| Topic | URL |
| ----- | --- |
| Homepage + FAQ | https://herdr.dev/ |
| Download | https://herdr.dev/download/ |
| herdr-core | https://herdr.dev/core/ |
| App repo + README | https://github.com/herdrdev/herdr-app |
| App guide (files, model, settings, keys) | https://github.com/herdrdev/herdr-app/blob/master/defaults/AGENTS.md |
| App command reference | https://github.com/herdrdev/herdr-app/blob/master/docs/commands.md |
| App changelog | https://github.com/herdrdev/herdr-app/blob/master/CHANGELOG.md |
| Core repo + README | https://github.com/herdrdev/herdr-core |
| Core command reference | https://github.com/herdrdev/herdr-core/blob/master/docs/commands.md |
| Core machines | https://github.com/herdrdev/herdr-core/blob/master/docs/machines.md |
| Core templates | https://github.com/herdrdev/herdr-core/blob/master/docs/templates.md |
| Herdr TUI (separate product) | https://herdr.dev/tui/ |

### Community (tips only; commands from official docs)

| Source | URL |
| ------ | --- |
| eesel AI: Herdr explained (app vs TUI vs core, 2026-11) | https://www.eesel.ai/blog/herdr |
| Hacker News: Herdr native app launch thread | https://news.ycombinator.com/item?id=50298436 |

### Omitted from this cheatsheet (see docs)

- Writing mods (gpui-kit JavaScript, `herdr.d.ts`, `herdr-app check`) and the full layout JSON schema
- `programs.json` icon/tile overrides and the full app command list (`herdr-app commands`)
- `hc` API (`hc connect`, `hc schema`, `hc events`) for app builders
- Sandbox machines via `--via` / `--temp` (Fly, Vercel Sandbox helper)
- Building from source (Rust + Zig + `just`)
- The phone app mentioned in the changelog (not yet verified as an official, documented client)

### Version notes

- GitHub Releases are empty for both repos; versions come from the changelogs (app 0.1.12 and core 0.1.17, both 2026-11-02). The app is young — expect fast changes.
- Side-by-side installation with Herdr TUI is not documented explicitly; the binaries and config folders differ and the FAQ says the TUI keeps working.

</details>
