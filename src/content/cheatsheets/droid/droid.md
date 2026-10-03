---
slug: droid
title: Droid — AI Coding Agent Cheatsheet
category: tool
subcategory: coding-agent
summary: "Set up and operate Droid, Factory's terminal-native AI coding agent: install the CLI, run reviewable sessions, tune autonomy and Spec Mode, teach it your repo with AGENTS.md, skills, and custom droids, extend it with MCP and hooks, and automate work with headless droid exec and Missions."
last_updated: 2026-10-03
stale_after_days: 90
upstream_version: "v0.231.x (October 2026)"
tags: [droid, factory, coding-agent, cli, autonomy, spec-mode, agents-md, skills, mcp, droid-exec]
status: published
authors:
  - name: luongnv89
links:
  homepage: https://factory.ai
  docs: https://docs.factory.com
  quickstart: https://docs.factory.com/droid-cli/quickstart
  changelog: https://docs.factory.com/changelog/release-notes
---

# Droid — AI Coding Agent Cheatsheet

**One-line:** Droid is Factory's terminal-native AI coding agent: it reads your repo, proposes diffs, and waits for approval, then scales from interactive sessions to headless `droid exec` runs and multi-agent Missions.

## Prerequisites

- [ ] A terminal open in a Git repository (recommended for the full workflow)
- [ ] A Factory account — Droid signs you in through the browser on first run
- [ ] Optional: Homebrew on macOS, or Node.js for the npm installer
- [ ] Linux only: `xdg-utils` — install with `sudo apt-get install xdg-utils`
- [ ] For headless or CI use: a Factory API key from [API keys settings](https://app.factory.ai/settings/api-keys)

## Installation

Pick one installer, then start Droid from any project directory.

```bash
# macOS / Linux — standalone installer
curl -fsSL https://app.factory.ai/cli | sh
```

```bash
# Homebrew
brew install --cask droid
```

```bash
# npm
npm install -g droid
```

```powershell
# Windows PowerShell
irm https://app.factory.ai/cli/windows | iex
```

```bash
cd /path/to/your/project
droid
```

The first launch opens the full-screen TUI and asks you to sign in via the browser. Verify the install:

```bash
droid -v
```

For headless or CI runs, authenticate with an API key instead of a browser session:

```bash
export FACTORY_API_KEY=fk-...
```

> [!NOTE]
> Standalone installs update themselves. Run `droid update --check` to check, `droid update --version <VERSION>` to pin or roll back, or set `FACTORY_DROID_AUTO_UPDATE_ENABLED=false` to disable the in-process updater. npm installs are pinned at build time.

## Step-by-Step Setup & Optimization

### Step 1 — Run your first reviewable session

**Goal:** A working Droid session that maps your repo and proposes a reviewable diff · **Time:** ~10 min · **Level:** beginner

1. Start a session in your project:

   ```bash
   droid
   ```

2. Ask Droid to map the codebase before it changes anything:

   ```text
   analyze this codebase and explain the overall architecture
   ```

3. Request one small, verifiable change:

   ```text
   add structured logging to the app entry point and replace the existing console calls
   ```

4. Review the proposed diff in the TUI and accept or reject it. With `Auto (Off)`, nothing is edited without your approval.

**Verify:** `droid` opens the TUI, answers with a file-cited architecture summary, and shows edits as a diff you approve before anything is applied.

> [!TIP]
> Press `?` for the keyboard shortcut pane, `Shift` + `Enter` for multi-line prompts, and `!` to run a shell command without AI interpretation. `Ctrl` + `O` toggles the detailed transcript.

### Step 2 — Configure models, autonomy, and safety

**Goal:** Session defaults that match your risk tolerance: model, autonomy, and command policy · **Time:** ~15 min · **Level:** beginner

1. Open `/settings` inside a session; changes apply immediately and save to the settings file.
2. Know where settings live:
   - macOS / Linux: `~/.factory/settings.json`
   - Windows: `%USERPROFILE%\.factory\settings.json`
   - Overrides: `settings.local.json` beside it, or `<project>/.factory/settings.local.json` (gitignore it)
3. Set your session defaults in `settings.json`:

   ```json
   {
     "sessionDefaultSettings": {
       "interactionMode": "spec",
       "autonomyLevel": "low"
     },
     "enableDroidShield": true,
     "cloudSessionSync": true
   }
   ```

4. Learn the four autonomy levels — what Droid can run without pausing:
   - `Off` — built-in read tools plus policy-allowed commands
   - `Low` — file edits and low-risk commands
   - `Medium` — installs, builds/tests, and local git commits
   - `High` — pushes, deploy scripts, and migrations
   Cycle with `Ctrl` + `L`; organization policy (`maxAutonomyLevel`) can cap the highest level.
5. Replace legacy command lists with tested `permissionRules`, then validate:

   ```json
   {
     "permissionRules": {
       "version": 1,
       "rules": [
         {
           "id": "user/git-push",
           "decision": "ask",
           "match": { "prefix": ["git", "push"] }
         }
       ]
     }
   }
   ```

   ```bash
   droid rules check --command 'git push origin main'
   ```

6. Switch models mid-session with `/model` or `Ctrl` + `N`. Custom BYOK models live under `customModels` in the same file (see Reference).

**Verify:** `droid rules check` exits 0 and prints the policy decision for the command you previewed.

### Step 3 — Plan bigger changes with Spec Mode

**Goal:** A reviewed implementation plan before Droid edits anything · **Time:** ~10 min · **Level:** intermediate

1. Toggle Normal and Spec Mode with `Shift` + `Tab`, or start in Spec Mode directly:

   ```bash
   droid --use-spec
   ```

2. Describe the goal and constraints; Droid plans read-only — no edits, commits, or service changes — then asks for approval when the plan is ready.
3. On approval, pick the autonomy level for execution. `Off` keeps manual approvals; `Low`/`Medium`/`High` pre-authorize work at or below that risk level (a plan approval dialog or `/settings` can change it).
4. Enable **Save spec as Markdown** in `/settings` to keep plans on disk; `specSaveDir` overrides the spec store location.
5. Reach for Spec Mode on architecture changes, migrations, and security-sensitive work; for headless planning use `droid exec --use-spec "<GOAL>"`.

**Verify:** `droid --use-spec` starts in Spec Mode, and Droid presents a written plan for approval before any edit.

### Step 4 — Teach Droid your repo: AGENTS.md, skills, custom droids

**Goal:** Durable repo context — conventions, repeatable workflows, and specialists · **Time:** ~20 min · **Level:** intermediate

1. Add an `AGENTS.md` at the repository root with the project overview, exact commands, layout, conventions, verification steps, and safety rules. Nested files override where a package needs different rules; Droid also reads `CLAUDE.md` for compatibility. Keep it small — the initial guideline load caps at 80,000 characters and dynamic discovery at 40,000.
2. Move long runbooks out of `AGENTS.md` into skills: `.factory/skills/<NAME>/SKILL.md` (project) or `~/.factory/skills/<NAME>/SKILL.md` (personal). `name` and `description` are required; invoke skills as `/skill-name`.

   ```markdown
   ---
   name: release-check
   description: Verify release readiness. Use when the user asks to cut or prepare a release.
   ---

   1. Run the test and lint commands from AGENTS.md.
   2. Update CHANGELOG.md and bump the version.
   ```

3. Add specialists as custom droids: `.factory/droids/<NAME>.md` (project) or `~/.factory/droids/` (personal). Built-ins are `worker` (all tools) and `explorer` (read-only); manage them with `/droids`.

   ```markdown
   ---
   name: code-reviewer
   description: Focused reviewer that checks diffs for correctness risks
   model: inherit
   tools: read-only
   ---

   You are the team's senior reviewer. Examine the shared diff and flag
   correctness, security, and migration risks.
   ```

**Verify:** `/skills` and `/droids` list your new skill and custom droid in their managers.

> [!TIP]
> Keep secrets, customer data, and full copies of long docs out of AGENTS.md and skill folders — link to the source of truth instead.

### Step 5 — Connect tools: MCP and hooks

**Goal:** External tools available in-session and deterministic lifecycle automation · **Time:** ~15 min · **Level:** intermediate

1. Add an MCP server from the registry with `/mcp` → **Add from Registry**, or from the CLI:

   ```bash
   droid mcp add linear https://mcp.linear.app/mcp --type http
   ```

2. Check server status:

   ```bash
   droid mcp list
   ```

3. Know the config layers: `~/.factory/mcp.json` (user), `.factory/mcp.json` (project, committed), or an ancestor folder's `.factory/mcp.json`. Servers added via `droid mcp add` go to the user config; project servers can only be changed by editing the file.
4. Register hooks for lifecycle automation in `~/.factory/hooks.json` (personal) or `.factory/hooks.json` (project):

   ```json
   {
     "PostToolUse": [
       {
         "matcher": "Create|Edit|ApplyPatch",
         "hooks": [
           {
             "type": "command",
             "command": "python3 \"$FACTORY_PROJECT_DIR\"/.factory/hooks/format_changed_file.py",
             "timeout": 30
           }
         ]
       }
     ]
   }
   ```

**Verify:** `droid mcp list` shows each server's status (connected, connecting, needs authentication, or failed).

> [!WARNING]
> Project `.factory/mcp.json` is committed — never put tokens in it; keep secrets in `~/.factory/mcp.json` or env vars. Hooks run automatically with your local credentials, so review every command and use absolute paths.

### Step 6 — Automate with headless `droid exec`

**Goal:** Reproducible non-interactive runs for CI, scripts, and scheduled jobs · **Time:** ~20 min · **Level:** advanced

1. Run a one-shot task (read-only by default):

   ```bash
   droid exec "analyze code quality"
   ```

2. Raise autonomy per run with the lowest tier that works:

   ```bash
   droid exec --auto low "add JSDoc comments to all exported functions"
   ```

   ```bash
   droid exec --auto medium "install deps, run tests, and fix failing checks"
   ```

3. Feed prompts from files or stdin, and emit structured output:

   ```bash
   droid exec -f .factory/prompts/review.md
   ```

   ```bash
   git diff | droid exec "draft release notes"
   ```

   ```bash
   droid exec --output-format json "summarize this repository"
   ```

4. Isolate parallel work in git worktrees:

   ```bash
   droid exec --worktree codemod-a --auto medium "apply codemod A" &
   droid exec --worktree codemod-b --auto medium "apply codemod B" &
   wait
   ```

5. In CI, export `FACTORY_API_KEY` and treat a non-zero exit as failure; runs fail fast when they exceed the autonomy level:

   ```yaml
   - name: Droid analysis
     env:
       FACTORY_API_KEY: ${{ secrets.FACTORY_API_KEY }}
     run: droid exec --auto low -f .github/prompts/review.md
   ```

**Verify:** `droid exec --auto low "list the top-level directories"` prints the result and exits 0 (`droid exec` returns non-zero on failure).

> [!WARNING]
> `--skip-permissions-unsafe` skips every permission prompt (command blocks still apply). Use it only in disposable, isolated environments such as ephemeral CI containers — never on a workstation or shared runner.

### Step 7 — Scale out: Missions and cloud sessions

**Goal:** Multi-agent orchestration for large work, and sessions you can reach anywhere · **Time:** ~30 min · **Level:** advanced

1. Launch a Mission when the work is too big for one session: `/missions` in the TUI, or headless:

   ```bash
   droid exec --mission --auto high "coordinate the migration"
   ```

2. Plan first: Missions break the goal into features and milestones, pull in skills, and require plan approval before Mission Control starts. They need High autonomy (or `--skip-permissions-unsafe`) and a repo at Agent Readiness Level 4+ with a scriptable way to exercise the app (`/readiness-report`, then `/readiness-fix`).
3. Keep sessions reachable anywhere: `cloudSessionSync` (default `true`) mirrors CLI sessions to the web app, and `droid --resume` picks a session back up locally.
4. Register this machine as a Bring-Your-Own-Machine computer for persistent remote compute:

   ```bash
   droid computer register laptop
   ```

**Verify:** `/missions` opens the Missions flow and returns a feature-and-milestone plan you approve before Mission Control begins.

> [!IMPORTANT]
> Missions are not fire-and-forget — steer the orchestrator when it stalls. Never convert a long-running normal session into a Mission; start a new one so the upfront planning and validation structure survives.

## Best Practices

### Do

- ✅ Start read-only: map the repo before edits, and in CI use the lowest `--auto` level that completes the job.
- ✅ Keep `AGENTS.md` short and scoped (root file plus per-package overrides); link out instead of pasting runbooks.
- ✅ Plan with Spec Mode for architecture, migrations, and security-sensitive changes, then raise autonomy after approval.
- ✅ Route models by role: stronger models for spec planning, Mission orchestrators, and validators; lighter ones for workers (`sessionDefaultSettings.specModeModel`, `missionModelSettings.*`, `subagentModelSettings.*`).
- ✅ Preview command policy with `droid rules check --command '...'` before relying on a rule in automation.
- ✅ Keep the MCP surface narrow, and keep credentials out of committed project config.
- ✅ Pin versions in reproducible environments: `npm install -g droid@<VERSION>`, `droid update --version <VERSION>`, or `FACTORY_DROID_AUTO_UPDATE_ENABLED=false`.
- ✅ Watch cost and context with `/cost` and `/context`; compress long sessions with `/compress`.
- ✅ Use worktrees (`--worktree`) to run parallel sessions on one repo without file conflicts.

### Don't

- ❌ Don't use `--skip-permissions-unsafe` outside disposable sandboxes — and remember command blocks apply even then.
- ❌ Don't paste secrets into `.factory/mcp.json`, skills, hooks, or commits; Droid Shield only catches what it can scan.
- ❌ Don't expect `--auto high` to clear an `ask` decision in `droid exec` — one-shot runs cannot answer approval prompts.
- ❌ Don't mix unrelated work in one session, and don't convert a marathon session into a Mission.
- ❌ Don't expect BYOK parity: only Anthropic and OpenAI models via their official APIs are fully tested, and sub-30B-parameter models aren't recommended for production agentic coding.

## Quick Command Reference

| Command | Use |
|---|---|
| `droid` | Start an interactive session in the current directory. |
| `droid "query"` | Start with an opening prompt. |
| `droid -r` / `droid --resume <ID>` | Resume the last session or a specific one. |
| `droid --fork <ID>` | Fork a session into a new copy. |
| `droid --use-spec` | Start in Spec Mode (plan before edits). |
| `droid --worktree [NAME]` | Run in an isolated git worktree. |
| `droid exec "query"` | Headless one-shot run (read-only by default). |
| `droid exec --auto <LEVEL>` | Autonomy tiers: `low`, `medium`, `high`. |
| `droid exec -f <FILE>` | Load the prompt from a file. |
| `droid exec -o json` | Structured output (`text`, `json`, `stream-json`, `stream-jsonrpc`). |
| `droid exec --use-spec` | Plan first, then execute. |
| `droid exec --mission --auto high` | Run a Mission headlessly. |
| `droid search "query"` | Search local session history. |
| `droid rules check` | Validate permission rules and preview decisions. |
| `droid mcp add <NAME> <URL> --type http` | Add an MCP server (also `--type sse` / `stdio`). |
| `droid mcp list` | Show MCP server status. |
| `droid plugin install <PLUGIN>` | Install a plugin. |
| `droid update --check` | Check for a CLI update without installing. |
| `droid computer register <NAME>` | Register this machine as a BYOM computer. |

| In-session command / key | Use |
|---|---|
| `/settings` | Configure behavior, models, autonomy, output style. |
| `/model` | Switch models mid-session (also `Ctrl` + `N`). |
| `/review` | Start the local code review workflow. |
| `/sessions` · `/fork` | List sessions / copy the current session. |
| `/skills` · `/droids` · `/hooks` · `/mcp` | Manage skills, subagents, hooks, MCP servers. |
| `/missions` | Open the Missions menu. |
| `/compress` · `/context` · `/cost` | Compress context / show context usage / usage stats. |
| `Shift` + `Tab` | Toggle Normal ↔ Spec Mode. |
| `Ctrl` + `L` | Cycle autonomy levels. |
| `Ctrl` + `T` | Toggle the Mission Control overlay. |
| `!` | Bash mode: run a shell command without AI interpretation. |
| `Ctrl` + `O` | Toggle the detailed transcript. |
| `?` | Open the keyboard shortcut pane. |

## Expected Outcomes

- A signed-in Droid session in your repo that maps the codebase before proposing reviewable diffs.
- `~/.factory/settings.json` with your model preference, autonomy default, permission rules, and Droid Shield enabled.
- Spec Mode plans reviewed and approved before implementation, optionally saved as Markdown.
- Durable repo context through AGENTS.md, project skills, and custom droids, plus MCP servers and hooks wired in.
- Headless `droid exec` runs in CI at the lowest sufficient `--auto` tier, with JSON output and non-zero exits treated as failures.
- Missions that plan, delegate, and validate large multi-feature work under High autonomy.
- Sessions mirrored to the web via `cloudSessionSync`, resumable locally with `droid --resume`.

## Reference

<details>
<summary>Sources & deeper reading</summary>

Official docs (facts and commands):

- [Factory docs](https://docs.factory.com) — [LLM-friendly Markdown index](https://docs.factory.com/llms.txt)
- [Droid CLI quickstart](https://docs.factory.com/droid-cli/quickstart) · [CLI reference](https://docs.factory.com/droid-cli/cli-reference) · [Settings](https://docs.factory.com/droid-cli/settings)
- [Droid Exec (headless)](https://docs.factory.com/droid-exec/overview) · [Autonomy levels](https://docs.factory.com/autonomy-and-safety/auto-run) · [Spec Mode](https://docs.factory.com/autonomy-and-safety/specification-mode) · [Permission rules](https://docs.factory.com/autonomy-and-safety/permission-rules)
- [AGENTS.md](https://docs.factory.com/harness/agents-md) · [Skills](https://docs.factory.com/harness/skills) · [Custom droids](https://docs.factory.com/harness/subagents) · [Hooks](https://docs.factory.com/harness/hooks) · [MCP](https://docs.factory.com/harness/mcp)
- [Custom models (BYOK)](https://docs.factory.com/model-independence/byok) · [Missions](https://docs.factory.com/missions/overview) · [Release notes](https://docs.factory.com/changelog/release-notes)

Community sources & tips:

- [Factory Droid tutorial: Missions, skills, agents](https://sidbharath.com/blog/factory-ai-guide/) — Sid Bharath; pragmatic workflows: start with a read-only repo audit, keep AGENTS.md sharp, narrow the MCP surface
- [Factory Droid: review and setup guide](https://www.developersdigest.tech/blog/factory-droid-review-setup-2026) — Developers Digest; setup, model routing, and BYOK notes

Omitted areas (see docs): Factory App and web/mobile surfaces, Software Factory automations (triage, code review CI, QA, wiki, incident response), remote delegations (Slack/Linear/Jira), Python/TypeScript SDKs and REST API, enterprise deployment/SSO/telemetry, Droid Computers deep dive, image generation, output styles.

- [Related: Claude Code cheatsheet](https://github.com/luongnv89/awesome-cheatsheets/blob/main/src/content/cheatsheets/claude-code/claude-code.md)
- [Related: Codex cheatsheet](https://github.com/luongnv89/awesome-cheatsheets/blob/main/src/content/cheatsheets/codex/codex.md)

</details>
