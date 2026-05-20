---
slug: hermes-agent
title: Hermes Agent — Optimization Cheatsheet
category: tool
subcategory: autonomous-ai-agent
summary: Step-by-step path to a high-leverage Hermes Agent install — diagnose, optimize cost + memory, unlock skills/self-evolution, gateways, multi-agent Kanban, and ongoing hygiene.
last_updated: 2026-05-19
stale_after_days: 90
upstream_version: "v0.12 / v0.13 era"
tags: [hermes-agent, nousresearch, autonomous-agent, cli, memory, skills, mcp, kanban]
status: published
authors:
  - name: luongnv89
links:
  homepage: https://hermes-agent.nousresearch.com/docs/
  repo: https://github.com/NousResearch/hermes-agent
  community-guide: https://github.com/OnlyTerp/hermes-optimization-guide
  awesome-list: https://github.com/0xNyk/awesome-hermes-agent
  self-evolution: https://github.com/NousResearch/hermes-agent-self-evolution
---

# Hermes Agent — Optimization Cheatsheet

**One-line:** Hermes Agent is NousResearch's self-improving CLI/TUI AI agent with persistent memory, skills, multi-channel gateways, and a Kanban for multi-agent orchestration.

**Who this is for:** You already installed Hermes Agent (one-line `curl` installer) on Linux/macOS/WSL — local or VPS — and want maximum leverage: lower cost, persistent intelligence, proactive workflows, and self-improvement.

**Read time:** ~6 min · **Apply Steps 1–3:** under 30 min

## Installation

One-line installers from the official repo. The script auto-detects your platform.

**Linux / macOS / WSL2 / Android (Termux):**
```bash
curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash
```

**Windows (native PowerShell — early beta):**
```powershell
iex (irm https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.ps1)
```

**First run — configure providers, memory, and tools:**
```bash
hermes setup           # interactive: pick model providers, memory backend, defaults
hermes doctor          # verify install, providers, OAuth, tools, memory
hermes status          # quick health check
```

**Optional terminal backends:** the agent can shell out via `local`, `Docker`, `SSH`, `Daytona`, `Singularity`, or `Modal` — install only what you need (Docker is the recommended sandbox before exposing gateways).

> **Why a one-liner?** The installer pins the latest stable release, places `hermes` on your `PATH`, and creates `~/.hermes/` (config, memory, skills, sessions). Re-run anytime — it's idempotent.

## Step-by-Step Setup & Optimization

### Step 1 — Baseline: Update, Diagnose, Verify (5–10 min)

```bash
hermes update          # Pull latest version
hermes doctor          # Diagnose config, providers, tools, memory
hermes status          # Quick health check
hermes memory status   # Check memory providers
```

If anything fails, re-run `hermes setup` and follow the prompts.

> **Why:** Outdated installs miss self-evolving skills, Kanban, context compression, and cost optimizations. `doctor` catches OAuth issues, missing tools, and memory bloat.

**Pro tip (prod stability):**
```bash
hermes config set version_pin true
```

### Step 2 — Optimize Config, Models & Providers (Cost + Speed)

Edit `~/.hermes/config.yaml` or use `hermes config` commands.

**Model routing — use the right model per task:**
```bash
hermes model           # Interactive model selector
```
- Frontier (Claude Sonnet/Opus, GPT-4o, etc.) → complex reasoning, architecture, long-context
- Fast/cheap (via OpenRouter, Nous Portal) → simple lookups, classification, formatting

**Cost controls:**
- Enable `/usage` and `/insights` tracking in chat
- Set per-provider budgets in `config.yaml`
- **Preserve prompt cache:** never edit `SOUL.md`, `AGENTS.md`, or memory mid-session

**Drop-in config tweak:**
```yaml
# ~/.hermes/config.yaml
performance:
  context_compression: true
  cache_preserve: true
```

> **Why:** Smart routing + cache hits routinely cut token spend by **~90%** (community reports: ~$130/few-days → ~$10/few-days). Cache preservation is the single highest-ROI knob.

### Step 3 — Persistent Memory (Compounding Intelligence)

Hermes' superpower: facts that survive across sessions.

**Core files (auto-managed, but curate them):**

| File | Path | Limit | Purpose |
|---|---|---|---|
| `MEMORY.md` | `~/.hermes/memories/MEMORY.md` | ~2,200 chars | Agent-level facts |
| `USER.md` | `~/.hermes/memories/USER.md` | ~1,375 chars | Your preferences |
| `AGENTS.md` | `<project-root>/AGENTS.md` | — | Per-project: stack, conventions, do/don't |
| `SOUL.md` | `~/.hermes/SOUL.md` | — | Voice / personality |

**Curation flow:**
- After a good session, say: *"remember this for next time"* or *"save to memory that our CI uses GitHub Actions"*
- When a file hits ~80% capacity, consolidate with the `memory` tool: `add` / `replace` / `remove` (exact substring matching)
- Use **`hermes sessions list`** to search past convos (free FTS5 index)
- Resume the last session: `hermes -c`

**Upgrade to semantic / graph memory:**
```bash
hermes memory setup    # pick Honcho (or similar) for semantic search
```
For graph-based recall, follow the **OnlyTerp LightRAG** path: clone the repo, set `.env`, run the server, ingest docs/vaults via `curl`.

> **Why:** Memory + skills compound. The agent stops re-discovering things it already learned.

### Step 4 — Skills & Self-Evolution (the real magic)

Skills turn one-off work into reusable procedures (slash-callable next time).

**Install / browse:**
```bash
hermes skills install <name>
# or in chat:
/skills
```

**Create your own (3 ways):**
1. Do a complex 5+ step task, then say: *"save what you just did as a skill called `deploy-staging`"*.
2. Ask directly: *"Create a skill for [workflow]"*.
3. Author a skill manually under `~/.hermes/skills/<name>/` — README + steps + optional scripts.

**Use it later:**
```
/deploy-staging
```

**Maintenance:**
- Let the built-in **Curator** run — it merges duplicates and archives unused skills.
- Avoid "skill slop": periodically open `~/.hermes/skills/` and prune.

**Advanced — fully autonomous skill optimization:**
Install the [self-evolution](https://github.com/NousResearch/hermes-agent-self-evolution) module (GEPA/DSPy loop) to optimize skills from execution traces.

> **Rule of thumb:** Skills for *how* (procedures). Memory for *what* (facts). Don't mix.

### Step 5 — Gateways & Proactive Features (24/7 teammate)

Make Hermes phone-accessible and autonomous.

**Telegram (most popular path):**
1. Talk to **BotFather** → create a new bot → save the token
2. In BotFather: disable privacy mode for your bot
3. Get your numeric Telegram user ID (e.g., via `@userinfobot`)
4. Add token + user ID to `~/.hermes/.env`
5. Run:
   ```bash
   hermes gateway setup
   hermes gateway
   ```

**Scheduled / proactive tasks:**
```bash
hermes cron create "Daily briefing" --schedule "every 1d at 8am"
```

**Home channel for cron output** (in your preferred chat):
```
/sethome
```

> **Why:** Reactive chat → proactive agent that works while you sleep.

### Step 6 — Multi-Agent Orchestration with Kanban (v0.12+)

Best when you have parallel subtasks, dependencies, or role pipelines. Start small.

```bash
hermes kanban init
hermes dashboard            # http://127.0.0.1:9119
```

- Create specialist profiles (e.g., `researcher`, `coder`, `reviewer`) via config.
- Assign tasks → agents claim from the board → hand off via `kanban_complete` → auto-retry on blocks.

> **Anti-pattern:** Don't orchestrate before you have at least one well-tuned single agent + skills library. Multi-agent multiplies *current quality*, including the bad parts.

### Step 7 — Harden: Security, Deployment, Observability

**VPS / production bootstrap (community one-liner):**
```bash
curl -sSL https://raw.githubusercontent.com/OnlyTerp/hermes-optimization-guide/main/scripts/vps-bootstrap.sh | sudo bash
```
Sets up a non-root user, firewall, Caddy reverse proxy, systemd units.

**Security checklist:**
- Enable command approvals for shell/tool calls
- Sandbox tool execution (Docker, Modal, E2B)
- Configure secret redaction in logs
- Never run as `root`
- Use `hermes config` allowlists for sensitive tools

**Observability:**
- Hook **Langfuse** or **Helicone** for traces + cost analytics (community templates available in the OnlyTerp repo).

### Step 8 — Monitor, Iterate, Compound (ongoing)

**Weekly hygiene (10 min):**
- Run `/insights` and `/usage`
- Open and review `~/.hermes/memories/MEMORY.md` and `USER.md`
- `ls ~/.hermes/skills/` — archive what you haven't used

**In long sessions:**
- `/compress` — reclaim context
- `/verbose` — watch tool calls live

**Ask the agent to self-optimize:**
> *"Optimize my current setup."*
> *"Clean up memory and curate skills."*

## Best Practices

### Do
- ✅ Run `hermes doctor` weekly and before any production change.
- ✅ Route frontier models *only* for hard reasoning; default to fast/cheap.
- ✅ Treat `MEMORY.md`, `USER.md`, `AGENTS.md`, `SOUL.md` as **immutable mid-session** (cache preservation).
- ✅ Convert any 5+ step recurring task into a skill on first repeat, not the third.
- ✅ Keep one well-tuned agent before turning on Kanban.
- ✅ Sandbox tool execution before exposing the agent over Telegram/Slack.
- ✅ Pin the version in production (`version_pin true`).

### Don't
- ❌ Edit memory or `SOUL.md` while a session is live — it busts prompt cache.
- ❌ Use frontier models for trivial tasks (the #1 cost leak).
- ❌ Let `MEMORY.md` exceed ~80% capacity without consolidating — recall quality degrades fast.
- ❌ Open Telegram gateway without sandboxing tools and disabling root.
- ❌ Spin up Kanban before you have a working skills library — you'll just parallelise a broken loop.
- ❌ Ignore the Curator — duplicate skills create "skill slop" that confuses routing.

### When to use Hermes (vs alternatives)
- **Use Hermes when:** You want a *persistent, learning* agent that compounds over weeks/months; multi-channel access (Telegram, Slack, etc.); freedom to BYO model.
- **Use a coding-first CLI agent** (Claude Code / Codex / OpenCode / Pi) **when:** Your job is mostly in-repo dev work and you don't need cross-channel reach or long-horizon memory.
- **Use OpenClaw when:** You want a desktop-style personal assistant with broader "eyes and hands" (web automation, multi-platform integration) rather than a CLI-first dev agent.

## Quick Command Reference

| Goal | Command |
|---|---|
| Update | `hermes update` |
| Diagnose | `hermes doctor` |
| Health | `hermes status` |
| Memory health | `hermes memory status` |
| Model selector | `hermes model` |
| Search past sessions | `hermes sessions list` |
| Resume last session | `hermes -c` |
| Install a skill | `hermes skills install <name>` |
| Gateway setup | `hermes gateway setup` && `hermes gateway` |
| Scheduled task | `hermes cron create "<name>" --schedule "<when>"` |
| Kanban init | `hermes kanban init` |
| Dashboard | `hermes dashboard` (http://127.0.0.1:9119) |
| In-chat: usage / insights | `/usage` · `/insights` |
| In-chat: compress / verbose | `/compress` · `/verbose` |
| In-chat: set home channel | `/sethome` |

## Expected Outcomes (after Steps 1–5)

- **Cost:** ~90% lower token spend via smart routing + cache preservation
- **Speed on repeat tasks:** 5–10× faster via skills
- **Recall:** facts persist across sessions; semantic / graph memory optional
- **Proactivity:** scheduled tasks ping you on Telegram while you sleep
- **Trajectory:** quality compounds — Curator + self-evolution mean it gets smarter weekly

## Reference

<details>
<summary>Sources & deeper reading</summary>

- **Official docs:** [hermes-agent.nousresearch.com/docs](https://hermes-agent.nousresearch.com/docs/)
- **Source repo:** [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent)
- **Community optimization guide (OnlyTerp):** [hermes-optimization-guide](https://github.com/OnlyTerp/hermes-optimization-guide) — VPS bootstrap, production configs, LightRAG, Langfuse/Helicone templates, 24-part deep-dive.
- **Awesome list:** [0xNyk/awesome-hermes-agent](https://github.com/0xNyk/awesome-hermes-agent)
- **Documentation mirror:** [mudrii/hermes-agent-docs](https://github.com/mudrii/hermes-agent-docs)
- **Self-evolution (GEPA/DSPy):** [NousResearch/hermes-agent-self-evolution](https://github.com/NousResearch/hermes-agent-self-evolution)
- **Web workspace:** [outsourc-e/hermes-workspace](https://github.com/outsourc-e/hermes-workspace)
- **Hermes WebUI:** [nesquena/hermes-webui](https://github.com/nesquena/hermes-webui)
- **`AGENTS.md` contract:** [hermes-agent/AGENTS.md (main)](https://github.com/NousResearch/hermes-agent/blob/main/AGENTS.md)
- **See also:** [Pi minimal coding-agent cheatsheet](/cheatsheets/pi-dev/) — a smaller, repo-focused CLI agent when you do not need Hermes' persistent cross-channel scope.

</details>

<details>
<summary>Template contract this cheatsheet exercises (lock for v1)</summary>

This file is the PoC for the v1 cheatsheet template. Sections it locks in:
1. **Frontmatter** — slug, title, category, summary, `last_updated`, `stale_after_days`, `upstream_version`, tags, links
2. **One-line + audience + read time**
3. **Installation** with copy-paste one-line installer(s)
4. **Step-by-step setup / usage / optimize** with copy-paste blocks
5. **Best Practices** — do / don't / when-to-use vs alternatives
6. **Quick Command Reference** (tabular)
7. **Expected Outcomes** (concrete, measurable)
8. **Reference** (collapsed by default)
9. **Template contract** (this section — only on PoC cheatsheets)

When the template + linter ship, the linter should enforce 1–8.
</details>
