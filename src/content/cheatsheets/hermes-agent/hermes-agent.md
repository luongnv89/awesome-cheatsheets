---
slug: hermes-agent
title: Hermes Agent — Optimization Cheatsheet
category: tool
subcategory: autonomous-ai-agent
summary: Step-by-step path to a high-leverage Hermes Agent install — update channels, diagnose, tune models and compression, memory, skills, gateways and cron, Bot Mode specialist Bots, Kanban orchestration, and ongoing hygiene.
last_updated: 2026-11-03
stale_after_days: 90
upstream_version: "v0.22.6"
tags: [hermes-agent, nousresearch, autonomous-agent, cli, memory, skills, mcp, kanban, bot-mode]
status: published
authors:
  - name: luongnv89
links:
  homepage: https://hermes-agent.nousresearch.com/docs/
  repo: https://github.com/NousResearch/hermes-agent
  install: https://hermes-agent.nousresearch.com/docs/getting-started/installation
  updating: https://hermes-agent.nousresearch.com/docs/getting-started/updating
  bot-mode: https://hermes-agent.nousresearch.com/docs/user-guide/bot-mode
  cli-reference: https://hermes-agent.nousresearch.com/docs/reference/cli-commands
  community-guide: https://github.com/OnlyTerp/hermes-optimization-guide
  awesome-list: https://github.com/0xNyk/awesome-hermes-agent
  self-evolution: https://github.com/NousResearch/hermes-agent-self-evolution
---

# Hermes Agent — Optimization Cheatsheet

**One-line:** Hermes Agent is NousResearch's self-improving AI agent (CLI, TUI, and Desktop) with persistent memory, skills, multi-channel gateways, scheduled routines, Bot Mode, and a Kanban for multi-agent orchestration.

**Who this is for:** You run Hermes Agent on Linux, macOS, WSL2, or Windows — local or VPS — and want maximum leverage: lower cost, persistent intelligence, proactive workflows, and a team of specialist Bots.

**Read time:** ~7 min · **Apply Steps 1–3:** under 30 min

## Installation

**Desktop (macOS Apple Silicon / Windows):** download the package from the Hermes website — signed DMG on macOS, `.appinstaller` / MSIX (or Microsoft Store) on Windows. It bundles the agent, Python, and dependencies.

**CLI only — Linux / macOS / WSL2:**
```bash
curl -fsSL https://hermes-agent.nousresearch.com/install.sh | bash
```

**CLI only — Windows (native PowerShell, Tier 1 support):**
```powershell
iex (irm https://hermes-agent.nousresearch.com/install.ps1)
```

**Android (Termux, aarch64):** configure the signed Hermes APT repository ([install docs](https://hermes-agent.nousresearch.com/docs/getting-started/installation)), then run:
```bash
pkg install hermes-agent
```

**First run — configure providers, memory, and tools:**
```bash
hermes setup           # guided wizard: providers, terminal backend, memory, gateways
hermes doctor          # verify install, providers, OAuth, tools, memory
hermes status          # quick health check
```

> [!TIP]
> Have a Nous Portal subscription? `hermes setup --portal` signs you in, sets Nous as the provider, and turns on the Tool Gateway (web search, image generation, TTS, cloud browser) in one command. Add the Desktop app later with `hermes desktop`.

New installs land on the **stable** release channel. Built-in terminal backends: `local`, Docker, SSH, Daytona, Modal, Vercel Sandbox (Singularity is now a plugin). Docker is the sensible sandbox before exposing gateways.

## Step-by-Step Setup & Optimization

### Step 1 — Baseline: Update, Diagnose, Verify

**Goal:** Hermes on the right update channel and healthy · **Time:** ~10 min · **Level:** beginner

1. Check for and apply updates:
   ```bash
   hermes update --check
   hermes update
   ```
2. Diagnose config, providers, tools, and memory:
   ```bash
   hermes doctor
   hermes status
   hermes memory status
   ```
3. Production stability — stay on tagged releases (the default) and silence passive update notices:
   ```bash
   hermes update --set-channel stable
   hermes config set updates.check false
   ```
4. On a machine running several profiles or services, preview the update first:
   ```bash
   hermes update --plan
   ```

If anything fails, re-run `hermes setup` and follow the prompts.

> [!NOTE]
> v0.22 moved several components into the Plugin Catalog (Honcho, Supermemory, Hindsight, Mem0, OpenViking, Holographic, Langfuse, Singularity, `mcp serve` → `mcp-serve`). `hermes update` installs the plugin for a memory provider already named in `memory.provider`; others need `hermes plugins install <PLUGIN_NAME>`.

**Verify:** `hermes status` reports a healthy install and `hermes doctor` finds no provider or memory issues.

### Step 2 — Models, Providers & Compression (Cost + Speed)

**Goal:** The right model per task and context compression tuned in `config.yaml` · **Time:** ~15 min · **Level:** intermediate

1. Pick models (includes one-click **Local models**):
   ```bash
   hermes model
   ```
   - Frontier models → complex reasoning, architecture, long context.
   - Fast/cheap models (OpenRouter, Nous Portal, local) → lookups, classification, formatting.
2. Tune context compression in `~/.hermes/config.yaml` (defaults shown; point the summarizer at a cheaper model):
   ```yaml
   compression:
     enabled: true
     threshold: 0.50        # compress at 50% of context
     prepare_ahead: false   # opt-in: prepare the next summary in the background
   auxiliary:
     compression:
       model: ""            # empty = main chat model
       provider: "auto"
   ```
3. Track spend in chat:
   ```text
   /usage
   /insights
   ```

> [!TIP]
> Prompt caching is automatic — no config. Keep it effective by not editing `SOUL.md`, `AGENTS.md`, or memory files mid-session. `/model reset` returns a chat to the profile's model.

**Verify:** `hermes model` opens the selector and `hermes config get compression` shows your compression block.

### Step 3 — Persistent Memory (Compounding Intelligence)

**Goal:** Curated memory files plus a path to semantic recall · **Time:** ~15 min · **Level:** intermediate

Built-in memory files are injected into the system prompt as a frozen snapshot at session start:

| File | Path | Limit | Purpose |
|---|---|---|---|
| `MEMORY.md` | `~/.hermes/memories/MEMORY.md` | ~2,200 chars | Agent-level facts |
| `USER.md` | `~/.hermes/memories/USER.md` | ~1,375 chars | Your preferences |
| `AGENTS.md` | `<PROJECT_ROOT>/AGENTS.md` | — | Per-project: stack, conventions, do/don't |
| `SOUL.md` | `~/.hermes/SOUL.md` | — | Voice / personality |

1. After a good session, say *"remember this for next time"* or *"save to memory that our CI uses GitHub Actions"*.
2. When a file nears its limit, consolidate. The `memory` tool actions are `add`, `patch` (replace one span, keep the rest), and `remove` — there is **no** `replace` action.
3. Find and resume past conversations:
   ```bash
   hermes sessions browse   # interactive picker with search
   hermes -c                # resume the last session
   ```
4. Add semantic / graph memory with an external provider (one active at a time):
   ```bash
   hermes plugins install honcho
   hermes memory setup
   ```

> [!WARNING]
> Don't point two agent processes at the same Hermes home directory — memory writes collide.

**Verify:** `hermes memory status` shows your active provider, and `MEMORY.md`/`USER.md` hold curated facts under their limits.

### Step 4 — Skills & Self-Evolution

**Goal:** Reusable skills installed, created, and pruned · **Time:** ~20 min · **Level:** intermediate

1. Browse and install skills (hub IDs, `skills-sh/…`, or a direct `SKILL.md` URL):
   ```bash
   hermes skills install official/mcp/fastmcp
   ```
2. Create your own: after a complex task say *"save what you just did as a skill called `deploy-staging`"*, or author `~/.hermes/skills/<SKILL_NAME>/SKILL.md` by hand.
3. Run it later as a slash command:
   ```text
   /deploy-staging
   ```
4. Let the **Curator** maintain agent-created skills (prunes stale ones, consolidates overlaps, archives unused skills after 30 days):
   ```bash
   hermes curator status
   ```
5. Advanced: the [self-evolution](https://github.com/NousResearch/hermes-agent-self-evolution) module (GEPA/DSPy) optimizes skills from execution traces.

> [!TIP]
> Skills for *how* (procedures). Memory for *what* (facts). Don't mix.

**Verify:** `/skills` lists your installed skills and a saved skill runs as a slash command.

### Step 5 — Gateways & Scheduled Routines (24/7 teammate)

**Goal:** Hermes reachable from Telegram with scheduled tasks running · **Time:** ~30 min · **Level:** intermediate

1. Telegram (most popular path): create a bot with **BotFather** and save the token; disable privacy mode if you'll use it in groups; get your numeric user ID (e.g., via `@userinfobot`); add both to `~/.hermes/.env`.
2. Configure and start the gateway (one gateway per machine serves all profiles since v0.22):
   ```bash
   hermes gateway setup
   hermes gateway
   ```
3. Schedule a task — schedule first, then prompt:
   ```bash
   hermes cron create "every 1d at 08:00" "Send me a morning briefing" --name "Daily briefing"
   ```
   Or from chat:
   ```text
   /cron add "every 2h" "Check server status"
   ```
4. Set the home channel for cron output (run in your preferred chat):
   ```text
   /sethome
   ```
5. Manage jobs:
   ```bash
   hermes cron list
   hermes cron pause "Daily briefing"
   hermes cron cancel "Daily briefing"
   ```

> [!NOTE]
> v0.22 renamed agent tools: `cronjob` → `cronjob_manage`, `todo` → `todo_list`, `process` → `process_manage`. Update custom prompts and skills that name them.

**Verify:** `hermes cron list` shows your job and the gateway delivers its output to your home channel.

### Step 6 — Bot Mode: Your Team of Specialist "Hermes Bots"

**Goal:** A roster of named Bots, each with its own role, model, memory, and routines · **Time:** ~30 min · **Level:** intermediate

**Bot Mode** is the official "Hermes Bot" feature: built into Hermes Desktop and on by default — no install (the standalone `Hermes-Bot-Mode` repo is archived). There is no new primitive: **a Bot is a Hermes profile** under `~/.hermes/profiles/<BOT_NAME>/` with isolated config, `SOUL.md`, skills, memory, credentials, chat history, and an avatar.

1. Create a Bot in Desktop: **Bots** tab → **New Agent** → Name, Title, Description. Open **Advanced** to clone from a profile, pin a model/provider, write a custom `SOUL.md`, and tick only the skills, toolsets, and MCP servers it needs. CLI equivalent:
   ```bash
   hermes profile create researcher --clone
   ```
2. Sign each Bot in to OAuth providers — static API keys are copied from the main profile, OAuth logins (Anthropic, OpenAI Codex, xAI) are not:
   ```bash
   hermes -p researcher auth add <PROVIDER>
   ```
3. Talk to a Bot from the CLI — same agent, memory, and skills as in Desktop:
   ```bash
   hermes -p researcher chat
   ```
4. Work through its **Bot Chat**: one permanent, pinned conversation per Bot. `/new` (or `/reset`) is rerouted to `/compact` there, so context refreshes without forking the relationship; ordinary sessions on the same profile keep full `/new`.
5. Give Bots **Routines** from the Routines tile — plain cron jobs named `[bot:<BOT_NAME>] <routine>` whose runs land in that Bot's chat:
   ```bash
   hermes cron list
   ```
6. Coordinate Bots:
   - **Group chats** of 2–6 Bots share one room for deliberation.
   - `@mention` a teammate in any chat; the Bot sends its own message with the `message_agent` tool.
   - Bots on another machine's gateway can be reached without Desktop via peers:
     ```bash
     hermes peer add spark --url http://spark.lan:8377 --key <API_SERVER_KEY>
     hermes peer list
     ```
7. Optional **Bot Screen**: on a headless Linux gateway each Bot gets its own Xfce desktop streamed into Desktop, so you can take over for logins, 2FA, or CAPTCHAs. Check and install its host packages:
   ```bash
   hermes computer-use screen status
   hermes computer-use screen install
   ```
8. No Desktop? Mark the install for Bot Mode and create the canonical chat by hand:
   ```bash
   hermes -p researcher chat -c "Bot Chat" --create-if-missing
   ```
   ```yaml
   # ~/.hermes/profiles/researcher/profile.yaml
   ui_meta:
     hermes-bots: {}
   ```

> [!TIP]
> Keep each Bot narrow: one role, one model pin sized to the job, and the minimum skills/MCP servers. Hide Bots you rarely use (right-click → Hide Bot) — routines and @mentions keep working.

**Verify:** `hermes profile list` shows your Bots, and `hermes cron list` shows their `[bot:<BOT_NAME>]` routines.

### Step 7 — Multi-Agent Orchestration with Kanban

**Goal:** A Kanban board dispatching dependent tasks across profiles · **Time:** ~20 min · **Level:** advanced

Use Kanban when work has parallel subtasks, dependencies, or role pipelines (e.g. `researcher` → `coder` → `reviewer` Bots).

1. Initialize a board:
   ```bash
   hermes kanban init
   ```
2. Open the dashboard to create, assign, and watch tasks:
   ```bash
   hermes dashboard            # http://127.0.0.1:9119
   ```
3. Link tasks to a project (`--project <PROJECT_SLUG>` on `hermes kanban create`, or bind the board to a project in the dashboard) so each task gets a deterministic worktree + branch.

> [!WARNING]
> Don't orchestrate before you have one well-tuned Bot and a skills library. Multi-agent multiplies *current quality*, including the bad parts.

**Verify:** `hermes dashboard` serves the board at `http://127.0.0.1:9119` and tasks move across columns as agents claim them.

### Step 8 — Harden, Observe, Maintain

**Goal:** A hardened deployment plus a weekly hygiene loop · **Time:** ~1 h · **Level:** advanced

1. Security checklist:
   - Enable command approvals for shell/tool calls.
   - Sandbox tool execution (Docker, Modal, Daytona, Vercel Sandbox).
   - Configure secret redaction in logs.
   - Never run as `root`.
2. VPS bootstrap (community script; sets up a non-root user, firewall, Caddy, systemd units) — download, read, then run:
   ```bash
   curl -fsSLo vps-bootstrap.sh https://raw.githubusercontent.com/OnlyTerp/hermes-optimization-guide/main/scripts/vps-bootstrap.sh
   less vps-bootstrap.sh
   sudo bash vps-bootstrap.sh
   ```
3. Observability: Langfuse tracing moved to the Plugin Catalog in v0.22 — install it from there for traces and cost analytics.
4. Weekly hygiene: run `/insights` and `/usage`, review `~/.hermes/memories/MEMORY.md` and `USER.md`, and check skill health:
   ```bash
   hermes curator status
   hermes doctor
   ```
5. In long sessions: `/compress` reclaims context; `/verbose` shows tool calls live.
6. Moving from another agent? Import its setup:
   ```bash
   hermes migrate
   ```

**Verify:** Hermes runs as a non-root user with command approvals on, and `hermes doctor` stays clean week to week.

## Best Practices

### Do
- ✅ Run `hermes doctor` weekly and before any production change.
- ✅ Stay on the stable channel in production; use `hermes update --plan` before updating multi-profile machines.
- ✅ Route frontier models *only* for hard reasoning; default to fast/cheap or local.
- ✅ Treat `MEMORY.md`, `USER.md`, `AGENTS.md`, `SOUL.md` as **immutable mid-session** (cache preservation).
- ✅ Convert any recurring multi-step task into a skill on first repeat.
- ✅ Give each Bot a narrow role, its own model pin, and only the skills/MCP servers it needs.
- ✅ Sandbox tool execution before exposing the agent over Telegram/Slack.

### Don't
- ❌ Edit memory or `SOUL.md` while a session is live — it busts prompt cache.
- ❌ Use frontier models for trivial tasks — the most common cost leak.
- ❌ Call a memory `replace` action — it no longer exists; use `patch`.
- ❌ Point two agent processes at the same Hermes home directory.
- ❌ Open a gateway without sandboxing tools and disabling root.
- ❌ Spin up Bots or Kanban before you have a working skills library — you'll parallelise a broken loop.

### When to use Hermes (vs alternatives)
- **Use Hermes when:** You want a *persistent, learning* agent that compounds over weeks/months; multi-channel access (Telegram, Slack, etc.); a roster of specialist Bots; freedom to BYO model.
- **Use a coding-first CLI agent** (Claude Code / Codex / OpenCode / Pi) **when:** Your job is mostly in-repo dev work and you don't need cross-channel reach or long-horizon memory.
- **Use OpenClaw when:** You want a desktop-style personal assistant with broader "eyes and hands" rather than Hermes' memory/skills loop — and `hermes import-agent openclaw` (via the `agent-importers` plugin) moves you over later.

## Quick Command Reference

| Goal | Command |
|---|---|
| Update / check / preview | `hermes update` · `hermes update --check` · `hermes update --plan` |
| Pin update channel | `hermes update --set-channel stable` |
| Diagnose / health | `hermes doctor` · `hermes status` |
| Memory health / provider | `hermes memory status` · `hermes memory setup` |
| Install a catalog plugin | `hermes plugins install <PLUGIN_NAME>` |
| Model selector | `hermes model` |
| Browse / resume sessions | `hermes sessions browse` · `hermes -c` |
| Install a skill | `hermes skills install <SKILL_ID>` |
| Curator status | `hermes curator status` |
| Gateway setup / run | `hermes gateway setup` · `hermes gateway` |
| Scheduled task | `hermes cron create "<SCHEDULE>" "<PROMPT>" --name "<JOB_NAME>"` |
| List / cancel jobs | `hermes cron list` · `hermes cron cancel <JOB_ID_OR_NAME>` |
| Create a Bot (profile) | `hermes profile create <PROFILE_NAME> --clone` |
| Chat with a Bot | `hermes -p <BOT_NAME> chat` |
| Message a Bot on another machine | `hermes peer add <PEER> --url <URL> --key <API_SERVER_KEY>` |
| Bot Screen host check | `hermes computer-use screen status` |
| Kanban / dashboard | `hermes kanban init` · `hermes dashboard` (http://127.0.0.1:9119) |
| Desktop in a browser | `hermes webapp` |
| Import another agent | `hermes migrate` |
| In-chat: usage / insights | `/usage` · `/insights` |
| In-chat: compress / verbose | `/compress` · `/verbose` |
| In-chat: schedule / home channel | `/cron add "<SCHEDULE>" "<PROMPT>"` · `/sethome` |

## Expected Outcomes (after Steps 1–7)

- **Cost:** lower token spend from model routing, cheaper compression summaries, and intact prompt caching.
- **Speed on repeat tasks:** procedures run as one slash command instead of being re-derived.
- **Recall:** facts persist across sessions; semantic / graph memory optional via a provider plugin.
- **Proactivity:** scheduled routines report to your home channel while you're away.
- **Team:** specialist Bots with their own models and memory, coordinating in group chats or through Kanban.

## Reference

<details>
<summary>Sources & deeper reading</summary>

### Official

- **Docs home:** [hermes-agent.nousresearch.com/docs](https://hermes-agent.nousresearch.com/docs/) · full index: [llms.txt](https://hermes-agent.nousresearch.com/docs/llms.txt)
- **Installation:** [getting-started/installation](https://hermes-agent.nousresearch.com/docs/getting-started/installation)
- **Updating & channels:** [getting-started/updating](https://hermes-agent.nousresearch.com/docs/getting-started/updating)
- **CLI reference:** [reference/cli-commands](https://hermes-agent.nousresearch.com/docs/reference/cli-commands)
- **Configuration (compression, auxiliary models):** [user-guide/configuration](https://hermes-agent.nousresearch.com/docs/user-guide/configuration)
- **Memory:** [user-guide/features/memory](https://hermes-agent.nousresearch.com/docs/user-guide/features/memory)
- **Cron:** [user-guide/features/cron](https://hermes-agent.nousresearch.com/docs/user-guide/features/cron)
- **Bot Mode:** [user-guide/bot-mode](https://hermes-agent.nousresearch.com/docs/user-guide/bot-mode)
- **Bot Screen:** [user-guide/features/bot-screen](https://hermes-agent.nousresearch.com/docs/user-guide/features/bot-screen)
- **Import from other agents:** [user-guide/import-from-other-agents](https://hermes-agent.nousresearch.com/docs/user-guide/import-from-other-agents)
- **Source repo & releases:** [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) · [releases](https://github.com/NousResearch/hermes-agent/releases)
- **Archived Bot Mode repo (now built in):** [NousResearch/Hermes-Bot-Mode](https://github.com/NousResearch/Hermes-Bot-Mode)
- **Self-evolution (GEPA/DSPy):** [NousResearch/hermes-agent-self-evolution](https://github.com/NousResearch/hermes-agent-self-evolution)

### Community (tips only; commands from official docs)

- **Optimization guide (OnlyTerp):** [hermes-optimization-guide](https://github.com/OnlyTerp/hermes-optimization-guide) — VPS bootstrap, production configs, LightRAG.
- **Awesome list:** [0xNyk/awesome-hermes-agent](https://github.com/0xNyk/awesome-hermes-agent)
- **v0.22 memory-provider audit (2026-10):** [wallabytoken.com](https://wallabytoken.com/blog/p/hermes-v022-memory-providers)
- **Bot Mode launch coverage (2026-08):** [MarkTechPost](https://www.marktechpost.com/2026/08/17/nous-research-hermes-bot-mode/)
- **See also:** [Pi minimal coding-agent cheatsheet](/cheatsheets/pi-dev/) — a smaller, repo-focused CLI agent when you do not need Hermes' persistent cross-channel scope.

### Version notes

- Release tags switched from dated (`v2026.9.24`) to SemVer at v0.21.6; the v0.22.3–v0.22.6 release notes are abbreviated and point to v0.23.0 for full curated notes.
- `sessions.auto_prune` defaulted to on in v0.22.0 and returned to opt-in in v0.22.3 — check your version.
- Not covered: Hermes Cloud, Connectors (`hermes connectors`), Hermes Relay, multi-gateway setups, package management (`hermes pm`).
- "Hermes Bot" names elsewhere: Grok Bot / OpenBot are *other* agents you can import from (`hermes migrate grok-bot`); FlyHermes (hermes-agent.ai) is a third-party paid host, not Nous.

</details>
