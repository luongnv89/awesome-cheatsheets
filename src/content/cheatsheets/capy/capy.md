---
slug: capy
title: Capy — Cloud Parallel Coding Agent Cheatsheet
category: tool
subcategory: coding-agent
summary: "Set up and run Capy, the cloud coding agent that boots a VM with your repositories, plans and ships a pull request, then works CI and review feedback on its own: connect GitHub, tune the dev environment, snapshots, and secrets, split work across subagents, automate recurring jobs, and drive it from the REST API."
last_updated: 2026-10-03
stale_after_days: 90
tags: [capy, cloud-coding-agent, parallel-agents, subagents, automations, code-review, github, mcp, agents-md, snapshots]
status: published
authors:
  - name: luongnv89
links:
  homepage: https://capy.ai
  docs: https://docs.capy.ai/welcome
  quickstart: https://docs.capy.ai/quickstart
  api: https://docs.capy.ai/api-reference/overview
  pricing: https://docs.capy.ai/models-and-pricing
  llms: https://docs.capy.ai/llms.txt
---

# Capy — Cloud Parallel Coding Agent Cheatsheet

**One-line:** Capy is a cloud coding agent for shipping real software: it starts a durable thread, boots an isolated Ubuntu VM with your repositories, plans and builds the change, opens the pull request, then handles CI and review feedback on its own.

## Prerequisites

- [ ] A Capy account — sign up at [capy.ai](https://capy.ai/)
- [ ] A GitHub account or organization where you can install the Capy GitHub App and choose which repositories it may reach
- [ ] A project with at least one repository attached (repoless projects exist for research, planning, and computer-use work)
- [ ] Optional for team workflows: Capy org-admin rights to connect Slack (any member can connect Linear, but admins set its team mappings and default project)
- [ ] Optional for automation and API work: permission to mint an API key in Settings → API

## Installation

Capy runs in the browser, and no CLI install is documented. The optional desktop app has a download page, and its Linux builds are documented in detail.

Primary path — sign in and connect GitHub:

1. Go to [capy.ai](https://capy.ai/) and sign in.
2. Install the Capy GitHub App from Settings → Integrations → GitHub, then pick which repositories it may reach.
3. Create a project and attach the repositories it should work in, each with a base branch.

Desktop app on Linux — pick by distribution, not by preference:

```bash
# AppImage — works on any distribution, updates itself
chmod +x capy-*.AppImage
./capy-*.AppImage
```

```bash
# Debian / Ubuntu / Mint / Pop!_OS — install with apt so dependencies resolve
sudo apt install ./capy-*.deb
```

```bash
# Arch / Manjaro / EndeavourOS — AUR package (any AUR helper works)
yay -S capy-bin
```

First-run flow: sign in, open a project, and start your first thread.

```text
sign in → pick a project → first thread → review the diff → PR opens → merge
```

Mint an API key only when you need programmatic access. The plaintext is shown exactly once (Settings → API), so export it now:

```bash
export CAPY_API_KEY="capy_..."
```

> [!NOTE]
> Connect GitHub first: most of Capy's autonomy depends on the App delivering CI results, review feedback, and merge events to the thread that owns the pull request.

## Step-by-Step Setup & Optimization

### Step 1 — Ship your first pull request

**Goal:** A signed-in workspace and a first PR opened from a thread · **Time:** ~15 min · **Level:** beginner

1. Create the project and attach repositories; the project owns the repository catalog and each repo's base branch.
2. Start a thread, pick a model, and send one prompt for one task:

   ```text
   Fix the flaky retry test in packages/queue and open a PR.
   ```

3. Watch the thread. **Needs attention** and **Ready for review** are the buckets waiting on you; **Active** and **Waiting** need nothing yet.
4. Choose how a message reaches a busy agent: `Enter` interrupts, `Cmd`/`Ctrl` + `Enter` queues behind the current work, and `Option`/`Alt` + `Enter` steers without stopping it.
5. Let Capy commit, push a `capy/` branch, and open the PR, then review the diff and merge in Capy or on GitHub.

**Verify:** the thread reports a pull request link and its status leaves `active`/`waiting`; the PR came from a `capy/` branch, never from your default branch.

> [!TIP]
> Use one thread per piece of work. A thread is durable: close the laptop mid-run and it keeps working, waking on its own when CI finishes, a review lands, or the PR merges.

### Step 2 — Build a dev environment the agent can verify in

**Goal:** A machine where install, test, and lint commands actually run · **Time:** ~20 min · **Level:** intermediate

1. Open the project's **Dev environment** page, or ask Capy in a thread:

   ```text
   set up this project's dev environment
   ```

2. Define `initialize`: everything a fresh clone needs — dependency and system-package installs, global tools, generated artifacts. It runs once per fresh machine and again during snapshot builds (default timeout 900 s).
3. Define `refresh`: the fast, safe-to-rerun update for when a restored checkout moves to a newer commit (default timeout 300 s).
4. Declare `startup` entries for processes a snapshot can't capture — databases, queues, dev servers. Give a server its `port` so readiness is detected and a preview is published:

   ```json
   { "name": "web", "command": "pnpm dev", "port": 3000 }
   ```

5. Add named `commands` for on-demand actions (`test`, `lint`, `build`); the agent launches them by name instead of guessing.
6. Optionally commit `.capy/setup.json` so setup changes go through pull request review rather than the app.

**Verify:** ask the agent to run the project's `test` command; it launches the named command in a titled terminal session and reports the real result.

> [!WARNING]
> Don't install, build, or migrate in a `startup` entry — those belong in `initialize` or a command. A failed setup script degrades the machine (the agent usually repairs it by hand) and costs time and tokens on every boot.

### Step 3 — Make machines fast and secrets safe

**Goal:** Roughly 1–2 second boots from a snapshot, with credentials that can't leak by accident · **Time:** ~15 min · **Level:** intermediate

1. Enable snapshots in the project's Dev environment → **Snapshots**, choose which repositories to include, and trigger a build. A fresh machine then restores in roughly 1–2 seconds.
2. Let the hourly check rebuild: new commits on a selected base branch, or a setup or machine-size change, triggers a rebuild within the hour.
3. Set environment variables in three scopes: **Shared** (every machine in the project), **Personal** (threads you start, never reviews), and **Thread** (one running thread and its subagents). Personal beats shared; thread beats both.
4. Remember what the model sees: variable names and whether each has a value, never the values themselves.

**Verify:** a new thread's machine boots from the snapshot rather than re-running `initialize`, and the agent can name a variable while never printing its value.

> [!CAUTION]
> There is no output masking. The agent runs arbitrary commands, so a command that prints a value (`printenv`, a stack trace, a verbose CLI) puts it in the thread transcript. Hand over scoped, revocable credentials for the job — not your production root keys.

### Step 4 — Split large work across subagents

**Goal:** Parallel or stacked child agents that each ship their own PR · **Time:** ~20 min · **Level:** advanced

1. Ask the agent to split the work; you don't create subagents directly. Each starts as an editable draft that does nothing until started, nesting up to three levels deep and addressed by position (Subagent 1.3).
2. Choose machine placement explicitly, because the split follows writes: **shared** for read-only work (the subagent sees the parent's working tree, uncommitted changes included) and **fresh** for writers (a clean checkout from the upstream branch, so two writers can't collide).
3. Choose parallel or stacked. **Parallel** subagents run at once and must touch disjoint files, each shipping its own PR. **Stacked** subagents depend on each other or overlap files, so each starts from the previous subagent's PR branch. When in doubt, stack.
4. Put everything the subagent needs in its prompt: it starts from the prompt alone, with no access to your thread's history or the files the parent explored, and the parent is fed the final summary rather than every step.

   ```text
   Migrate our API handlers from Express to Fastify. Split it into parallel subagents by directory (routes/auth, routes/billing, routes/webhooks) on fresh machines, each shipping its own PR. Give every subagent the migrated example in routes/health as the pattern to follow, and require passing tests before it reports done.
   ```

5. Pick per-subagent models — a cheaper model for mechanical work, a stronger one for a gnarly refactor. Subagents inherit the thread's model by default.

   ```text
   Run the test-writing subagents on the cheapest reasonable model.
   ```

6. Review a finished subagent's diff on its machine, then have the parent open the PR, patch small problems itself, or send the subagent targeted feedback for a revision.

**Verify:** the start result names each subagent's placement and machine id, and a completed subagent delivers its final summary to the parent thread.

> [!TIP]
> Cheap parallel audits are read-only gold: spawn three shared-machine subagents to check a release diff for breaking API changes, missing migrations, and untested code paths, then ask for one risk-ranked list.

### Step 5 — Automate recurring and event-driven work

**Goal:** Stored prompts that run on a schedule or on platform events · **Time:** ~25 min · **Level:** advanced

1. Create an automation on the **Automations** page, or ask Capy in a thread. Every automation belongs to one project.
2. Attach 1 to 20 triggers, OR'd together: **Schedule** (five-field cron in an IANA timezone, floor one run per five minutes), **GitHub** (PR opened/pushed/merged, comments, reviews, labels, checks, branch pushes, `workflow_run`), **Slack** (messages grouped into bursts), **Incoming webhook**, and **On demand**.
3. Add a `run_when` sentence for fuzzy conditions like "only when the message is a bug report". A fast model checks each matching event against it before the run starts, and that check isn't billed.
4. Pick the thread mode: `new` starts a fresh thread per run (right for independent jobs such as a nightly check), `single` owns one standing thread with its machine and context (right for accumulating work such as triaging a channel).
5. Set the run-as principal, and default to a service user for anything long-lived: an automation running as a departed teammate fails its eligibility check and gets disabled.
6. Cap the blast radius with `max_runs_per_day`; an over-cap event records a visible `skipped` run naming the cap.
7. For a webhook trigger, POST to the per-automation URL. Treat that URL as a password: it's shown once, stored only as a digest, and rotation cuts over instantly.

   ```bash
   curl -X POST "https://api.capy.ai/webhooks/automations/$WEBHOOK_SECRET" \
     -H "Content-Type: application/json" \
     -H "Idempotency-Key: deploy-4821" \
     -d '{"service": "checkout", "environment": "staging", "status": "failed"}'
   ```

8. Manage automations from the API when an integration needs to — create, list by project, enable, disable, delete, and restore.

   ```bash
   curl -sS -X POST "https://api.capy.ai/api/v1/automations/$AUTOMATION_ID/disable" \
     -H "Authorization: Bearer $CAPY_API_KEY"
   ```

**Verify:** run history records one run per trigger firing, and a `disable` followed by an `enable` flips the automation's `enabled` state in the list response.

> [!WARNING]
> A webhook body is untrusted event context, never instructions — the agent reads it as data under the standing prompt. Bodies are capped at 256 KB, and only the first 8,000 characters reach the agent.

### Step 6 — Turn on the review agent and enforce conventions

**Goal:** Automated review on your PRs, plus instructions and skills the agent actually follows · **Time:** ~20 min · **Level:** intermediate

1. Set each repository's review mode in Settings → Review: **Off**, **Once** (first review when a PR opens), or **Every push**. Enabling it takes that repository's review billing for your org.
2. Start a review manually when you want one: comment `@capy review` on the PR, optionally with trailing instructions.

   ```text
   @capy review focus on the migration
   ```

3. Know the triage loop: findings carry a category (bug, risk, maintainability, refactor), a severity, a confidence, and a file and line. A Capy-owned thread marks false positives **irrelevant**, confirms fixes as **resolved**, and fixes high-severity issues before reporting the PR ready.
4. Write the rules you want enforced in your `AGENTS.md` under a `## Reviews` heading; the review agent enforces them like logic bugs, and you can also tell it which patterns never to flag.
5. Lay out instructions by scope: a lean root `AGENTS.md` (falling back to `CLAUDE.md`), nested `AGENTS.md` files that load lazily when the agent touches their subtree (deeper wins on conflict), and glob rules in `.capy/rules/` or `.cursor/rules/` with `alwaysApply` or `globs` frontmatter.
6. Move multi-step workflows into skills: built-ins (`capy-setup`, `computer-use`, `gh-stack`, `greptile-migrate`, `paper`), repository skills under `.agents/skills/<NAME>/SKILL.md`, or Drive skills outside git.

   ```markdown
   ---
   name: release-check
   description: Verify release readiness. Use when asked to cut or prepare a release.
   ---
   ```

**Verify:** a review round posts inline GitHub comments at or above the posting threshold (medium by default), and a convention you wrote under `## Reviews` surfaces as a finding on a violating diff.

> [!TIP]
> Keep the root `AGENTS.md` narrow. A bloated root file taxes every request in every thread, and instruction files plus skill descriptions share one context budget.

### Step 7 — Connect MCP servers and drive Capy from the API

**Goal:** External tools available in-session and programmatic thread control · **Time:** ~25 min · **Level:** advanced

1. Add MCP servers from Settings → MCP servers: give each a short key, then choose org-wide or single-project availability.
2. Configure the transport. A remote **HTTP** server takes its full MCP endpoint (plus a header name and value for a static token, sealed at rest). A local **Stdio** server takes a command, arguments, working directory, and environment variables.

   ```text
   Server key: internal-tools
   URL: https://tools.example.com/mcp
   Header: Authorization
   Value: Bearer <paste the token here>
   ```

3. Connect OAuth for protected HTTP servers. If your authorization server enforces a redirect allowlist, register this callback:

   ```text
   https://capy.ai/web/callbacks/mcp
   ```

4. Use the tools in a thread: they surface to the agent as `{server}__{tool}` (server `internal-tools` plus tool `query_db` becomes `internal-tools__query_db`). The review agent runs a fixed tool set and never sees MCP tools.
5. Drive the platform over HTTP with an API key as a bearer token. Listing projects also verifies the key.

   ```bash
   curl -H "Authorization: Bearer $CAPY_API_KEY" \
     "https://api.capy.ai/api/v1/projects"
   ```

6. Create a thread with a caller-minted idempotency token, then poll its status until it is no longer `active` or `waiting`.

   ```bash
   curl -X POST "https://api.capy.ai/api/v1/threads" \
     -H "Authorization: Bearer $CAPY_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "requestId": "'"$(uuidgen)"'",
       "projectId": "'"$PROJECT_ID"'",
       "message": "Fix the flaky retry test in packages/queue and open a PR."
     }'
   ```

7. Read the transcript, reply with a delivery mode, or hold one Server-Sent Events connection open instead of polling.

   ```bash
   curl -X POST "https://api.capy.ai/api/v1/threads/$THREAD_ID/message" \
     -H "Authorization: Bearer $CAPY_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"text": "Also update the changelog.", "delivery": "queue"}'
   ```

**Verify:** `GET /api/v1/projects` returns your projects, and the thread you created appears at capy.ai with the same transcript the API reported.

> [!IMPORTANT]
> Errors are tagged JSON objects — match on `_tag` (such as `capy/ThreadNotFound`), not on prose. A resource outside your organization returns the same `404` as one that doesn't exist, so you can't probe for other tenants' ids.

## Best Practices

### Do

- ✅ Spend the twenty minutes on the dev environment; an agent that can run your tests proves its changes instead of guessing until CI fails.
- ✅ Enable snapshots once setup works — restoring takes 1–2 seconds instead of paying clone plus `initialize` on every machine, subagent, and review.
- ✅ Keep one thread per task, and stack subagents when unsure: a merge conflict between parallel writers costs more than waiting.
- ✅ Put everything a subagent needs in its prompt and prefer a fresh machine for writers, so two writers can't collide.
- ✅ Keep MCP servers narrow, and keep tokens in project environment variables rather than source control.
- ✅ Default long-lived automations to a service user so offboarding a teammate doesn't silently break them.
- ✅ Route models by role: stronger models for planning and hard subsystems, cheaper ones for mechanical parallel work via per-subagent models.
- ✅ Review each diff on the machine before it ships; direct the parent to check a specific subagent's diff before opening its PR.
- ✅ Write enforceable conventions in `AGENTS.md`, including a `## Reviews` section, so the review agent enforces the same rules you do.
- ✅ Search by message content with `Cmd`+`K`; most thread titles are auto-generated, so search finds the error string you pasted weeks ago.

### Don't

- ❌ Don't assume secrets stay out of the transcript: there is no output masking, so anything on the machine can be printed into the thread.
- ❌ Don't write secrets to disk in `initialize`; snapshot scrubbing can't prove absent what your own script wrote.
- ❌ Don't expect a thread to react to CI for a PR opened by hand with `gh pr create` — only a PR the agent opened subscribes the thread to CI, review, and merge events.
- ❌ Don't archive a thread to mark work finished; archiving puts it fully to sleep. Mark it idle instead.
- ❌ Don't expect Capy to merge on its own: it never merges or enables auto-merge unless you explicitly ask for that merge in the current conversation.
- ❌ Don't duplicate a rule across several instruction files; state it once in the narrowest scope that covers it.
- ❌ Don't background a dev server with `nohup` and poll for it in a `startup` entry — declare its port instead.

## Quick Command Reference

Web app:

| Action | How |
|---|---|
| Start a thread | Composer on the Threads page, or `Cmd`+`K` then `Tab` for a new-thread composer |
| Interrupt the agent | `Enter` (default) |
| Queue behind current work | `Cmd`/`Ctrl` + `Enter` |
| Steer without stopping | `Option`/`Alt` + `Enter` |
| Search everything | `Cmd`+`K` — threads, pull requests, automations, settings |
| Mark a resting thread | Thread context menu → Status → Ready for review / Needs attention / Idle |
| Open a machine's terminals | Thread pane **+** menu → Services, Commands, terminals |

API (`https://api.capy.ai/api/v1`, bearer `CAPY_API_KEY`):

| Call | Use |
|---|---|
| `GET /projects` | List accessible projects; also verifies the key |
| `POST /threads` | Create a thread (`requestId`, `projectId`, `message`) |
| `GET /threads/$THREAD_ID` | Poll status: `active`, `waiting`, `pending_user`, `ready_for_review`, `idle`, `error`, `archived` |
| `POST /threads/$THREAD_ID/message` | Reply (`delivery`: `queue` to wait for current work) |
| `GET /threads/$THREAD_ID/messages` | Read the transcript; page forward with `after` |
| `GET /threads/$THREAD_ID/tasks` | Observe the subagent (task) tree, read-only |
| `POST /reviews` | Start a review round for a repository and PR number |
| `POST /automations` | Create an automation; `/disable` and `/enable` to pause and resume |
| Streams | Follow a thread or task over one Server-Sent Events connection |

Slack directives (inside an `@Capy` message):

| Directive / flag | Values / effect |
|---|---|
| `project=` | Project name or ID |
| `model=` | Catalog ID, name without route prefix, or a shortcut (`fable`, `opus`, `sonnet`, `haiku`, `sol`, `terra`, `luna`, `gemini`, `grok`, `kimi`, `qwen`, `glm`) |
| `reasoning=` | `off`, `minimal`, `low` through `max` |
| `machine=` | `small`, `medium`, `large`, `ultra`, `hyper` |
| `title=` · `folder=` · `channel=` | Set the title, file into a dashboard folder, or start in another channel |
| `!fast` · `!pro` · `!standard` | Serving mode |
| `!queue` · `!steer` | Delivery mode for a busy agent |
| `!new` · `!web` | Fork into a Slack thread, or start a separate web thread |
| `aside <text>` | Exclude a message from Capy's processing entirely |
| `mute` · `unmute` | Stop or resume Capy's replies in a thread |
| `archive` · `unarchive` · `stop` | Close the session, reopen it, or stop the current run |

## Expected Outcomes

- A signed-in workspace with the GitHub App installed, repositories attached to a project, and a first PR opened from a `capy/` branch.
- A dev environment with `initialize`, `refresh`, `startup` entries, and named commands, so the agent runs your tests instead of guessing.
- Snapshots that boot machines in roughly 1–2 seconds, and secrets scoped shared, personal, or per-thread.
- Parallel or stacked subagents shipping their own PRs, each diff reviewed before it ships.
- Automations on schedule, GitHub, Slack, webhook, or on-demand triggers, running as a service user with a visible daily cap.
- A per-repository review mode with findings triaged, and a Capy-owned thread fixing high-severity issues before reporting ready.
- Instructions in `AGENTS.md` plus skills from repo or Drive, with MCP servers whose tools reach the agent.
- API-driven threads with idempotency keys, SSE streaming, and `_tag`-based error handling.

## Reference

<details>
<summary>Sources & deeper reading</summary>

Official docs (facts and commands):

- [Capy docs](https://docs.capy.ai/welcome) — [LLM-friendly index](https://docs.capy.ai/llms.txt) · [Quickstart](https://docs.capy.ai/quickstart) · [Models & pricing](https://docs.capy.ai/models-and-pricing)
- [Threads](https://docs.capy.ai/threads) · [Projects](https://docs.capy.ai/projects) · [Pull requests](https://docs.capy.ai/pull-requests) · [Reviews](https://docs.capy.ai/review)
- [Machines](https://docs.capy.ai/machines) · [Environment](https://docs.capy.ai/environment) · [Snapshots](https://docs.capy.ai/environment#snapshots) · [Secrets](https://docs.capy.ai/secrets)
- [Instructions](https://docs.capy.ai/instructions) · [Skills](https://docs.capy.ai/skills) · [Drive](https://docs.capy.ai/drive) · [Subagents](https://docs.capy.ai/subagents) · [Automations](https://docs.capy.ai/automations)
- Integrations: [GitHub](https://docs.capy.ai/integrations/github) · [Slack](https://docs.capy.ai/integrations/slack) · [Linear](https://docs.capy.ai/integrations/linear) · [MCP](https://docs.capy.ai/integrations/mcp) · [Vercel](https://docs.capy.ai/integrations/vercel) · [Tailscale](https://docs.capy.ai/integrations/tailscale)
- [API reference](https://docs.capy.ai/api-reference/overview) · [API quickstart](https://docs.capy.ai/api-reference/quickstart) · [Streaming](https://docs.capy.ai/api-reference/streaming) · [OpenAPI JSON](https://docs.capy.ai/openapi.json)
- Admin: [Members & service users](https://docs.capy.ai/admin/members) · [Security](https://docs.capy.ai/admin/security) · [Billing](https://docs.capy.ai/admin/billing) · [Troubleshooting](https://docs.capy.ai/troubleshooting) · [Install on Linux](https://docs.capy.ai/desktop-linux)

Community sources & context (independent of vendor docs unless noted):

- [Capy on EveryDev.ai](https://www.everydev.ai/tools/capy) — tool listing and plan/pricing breakdown, including the 25-concurrent-agent framing
- [Best AI Coding Tools and Agents (2026)](https://superset.sh/compare/best-ai-coding-agents-2026) — third-party comparison placing Capy among cloud coding agents
- [Capy on Y Combinator](https://www.ycombinator.com/companies/capy) — company background (founded 2024, San Francisco)
- [Capy articles](https://capy.ai/articles) and [About Capy](https://capy.ai/about) — **vendor-published** positioning and comparisons, not independent evaluation

Omitted areas (see docs): individual API endpoint schemas (use the generated reference and `openapi.json`), the Captains planning-agent API resources, billing and auto-reload mechanics, enterprise SSO/BYOK details, Tailscale networking, computer-use and desktop-driving workflows, image generation, and support processes.

- [Related: Devin cheatsheet](https://github.com/luongnv89/awesome-cheatsheets/blob/main/src/content/cheatsheets/devin/devin.md)
- [Related: Droid cheatsheet](https://github.com/luongnv89/awesome-cheatsheets/blob/main/src/content/cheatsheets/droid/droid.md)

</details>
