---
slug: capy
title: Capy — Coding Agent Orchestrator Cheatsheet
category: tool
subcategory: coding-agent
summary: "Set up and run Capy 0.7.2, which orchestrates coding agents in the cloud or on your own devices: connect GitHub, tune the dev environment, snapshots, and secrets, split work across subagents, run a Captain that directs a crew of threads, host threads headless with the Dock CLI, automate recurring jobs, and drive it from the REST API."
last_updated: 2026-11-03
stale_after_days: 90
tags: [capy, cloud-coding-agent, parallel-agents, captains, subagents, dock-cli, automations, code-review, github, mcp, agents-md, snapshots]
status: published
upstream_version: "0.7.2"
authors:
  - name: luongnv89
links:
  homepage: https://capy.ai
  docs: https://docs.capy.ai/welcome
  quickstart: https://docs.capy.ai/quickstart
  captains: https://docs.capy.ai/captains
  dock: https://docs.capy.ai/dock
  api: https://docs.capy.ai/api-reference/overview
  pricing: https://docs.capy.ai/models-and-pricing
  changelog: https://capy.ai/changelog
  llms: https://docs.capy.ai/llms.txt
---

# Capy — Coding Agent Orchestrator Cheatsheet

**One-line:** Capy orchestrates coding agents across all your devices: each durable thread runs in the cloud or on your own machine, plans and builds the change, opens the pull request, and handles CI and review feedback on its own — and since 0.7.0 a Captain can direct a whole crew of threads for you.

## Prerequisites

- [ ] A Capy account — sign up at [capy.ai](https://capy.ai/)
- [ ] A GitHub account or organization where you can install the Capy GitHub App and choose which repositories it may reach
- [ ] A project with at least one repository attached (repoless projects exist for research, planning, and computer-use work)
- [ ] Optional for local or headless runs: a macOS, Windows, or glibc Linux machine for the desktop app or the Dock CLI (Git for Windows on Windows)
- [ ] Optional for team workflows: Capy org-admin rights to connect Slack (any member can connect Linear, but admins set its team mappings and default project)
- [ ] Optional for automation and API work: permission to mint an API key in Settings → API

## Installation

Capy runs in the browser. Threads can also run on your own machines: the desktop app on a computer you use, or the Dock CLI on a headless one such as a build server.

Primary path — sign in and connect GitHub:

1. Go to [capy.ai](https://capy.ai/) and sign in.
2. Install the Capy GitHub App from Settings → Integrations → GitHub, then pick which repositories it may reach.
3. Create a project and attach the repositories it should work in, each with a base branch.

Desktop app — download it from [capy.ai/download](https://capy.ai/download): a `.dmg` on macOS (Apple Silicon or Intel), an x64 installer on Windows, and on Linux pick by distribution (there is no AUR package):

```bash
# Debian / Ubuntu / Mint / Pop!_OS — install with apt so dependencies resolve
sudo apt install ./capy-*.deb
```

```bash
# Arch, Fedora, openSUSE, NixOS, and others — AppImage, updates itself
chmod +x capy-*.AppImage
./capy-*.AppImage
```

Dock CLI — Capy without the desktop app, so a server, cloud VM, or spare Mac can host threads. Install it as the user that should run threads; the installer refuses to run as root or as administrator:

```bash
# macOS and Linux (glibc only; Alpine and other musl distributions aren't supported)
curl -fsSL https://downloads.capy.ai/stable/dock/install.sh | sh
```

```powershell
# Windows 10 1809+ in PowerShell (not Command Prompt); install Git for Windows first
irm https://downloads.capy.ai/stable/dock/install.ps1 | iex
```

If `capy` isn't found on macOS or Linux, add the install folder to your shell profile and open a new terminal:

```bash
export PATH="$HOME/.capy/bin:$PATH"
```

On Windows, `capy.exe` lands in `~\.capy\dock-install\current\bin`; add it to your user `PATH`, then open a new terminal:

```powershell
[Environment]::SetEnvironmentVariable('Path', "$HOME\.capy\dock-install\current\bin;" + [Environment]::GetEnvironmentVariable('Path', 'User'), 'User')
```

Then pair the machine: run `capy dock` in an interactive terminal (the first run needs one), open the link it prints (or **Pair a device** in device settings), and approve the code. Never approve a code someone sent you. After pairing, it can run under `tmux` or a service manager such as systemd or launchd.

```bash
capy dock
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
2. Start a thread, pick where it runs under **Run on** (the cloud, this computer, or a paired device), pick a model, and send one prompt for one task:

   ```text
   Fix the flaky retry test in packages/queue and open a PR.
   ```

3. Read the status Capy sets for you: **Working**, **Waiting** (on CI, a subagent, a timer, or a long command), **Failed**, or **Idle**. **Needs you** is a separate flag that marks a thread waiting on your answer or decision.
4. Choose how a message reaches a busy agent: `Enter` steers (read after the current step), `Option`/`Alt` + `Enter` queues (read after the whole turn), and `Cmd`/`Ctrl` + `Enter` interrupts (the current step stops).
5. Let Capy commit, push a `capy/` branch, and open the PR, then review the diff and merge in Capy or on GitHub.

**Verify:** the thread reports a pull request link and its status settles from **Working**/**Waiting** to **Idle**; the PR came from a `capy/` branch, never from your default branch.

> [!TIP]
> Use one thread per piece of work, and prefer steer for corrections: an interrupt throws away the reasoning the model was in the middle of. A thread is durable — close the laptop mid-run and it keeps working, waking when CI finishes, a review lands, or the PR merges.

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

### Step 4 — Split work inside a thread with subagents

**Goal:** Parallel or stacked child agents that each ship their own PR · **Time:** ~20 min · **Level:** advanced

1. Pick the tool by what the new agent should start with and who it reports to:

   | | Starts with | Runs on | Reports back | Start it with |
   |---|---|---|---|---|
   | Side chat | A full copy of this conversation | This thread's machine | No | `/side` |
   | Fork | A full copy (`/fork`) or a summary (`/fork-summary`) | A fresh machine | No | The slash command |
   | Subagent | Only the prompt the agent writes | This machine or a fresh one | To the agent that started it | Ask the agent to split the work |
   | Crew thread | Only the Captain's brief | Its own machine | To the Captain | Ask a Captain (Step 5) |

2. Ask the agent to split the work into subagents. Each starts as an editable draft, nests up to three levels deep, and is addressed by position (Subagent 1.3).
3. Put readers on the **shared** machine and writers on **fresh** machines, so two writers can't collide.
4. Run **parallel** subagents only on disjoint files; otherwise **stack** them, each starting from the previous subagent's PR branch. When in doubt, stack.
5. Put everything a subagent needs in its prompt — it starts from the prompt alone, without your thread's history:

   ```text
   Migrate our API handlers from Express to Fastify. Split it into parallel subagents by directory (routes/auth, routes/billing, routes/webhooks) on fresh machines, each shipping its own PR. Give every subagent the migrated example in routes/health as the pattern to follow, and require passing tests before it reports done.
   ```

6. Review a finished subagent's diff on its machine, then have the parent open the PR or send the subagent targeted feedback.

**Verify:** the start result names each subagent's placement and machine id, and a completed subagent delivers its final summary to the parent thread.

> [!TIP]
> Cheap parallel audits are read-only: spawn three shared-machine subagents to check a release diff for breaking API changes, missing migrations, and untested code paths, then ask for one risk-ranked list.

### Step 5 — Run a Captain that directs a crew of threads

**Goal:** A long-lived Captain that starts crew threads, reads their reports, and tells you only what needs you · **Time:** ~25 min · **Level:** advanced

1. Reach for a Captain when work outgrows one thread — a feature with many PRs, or a queue of requests. Start with a thread, and promote it when you keep asking it to start other threads.
2. Create the Captain: **New Captain** in the sidebar (name, face, project, machine, model, access), **Promote to Captain** on a thread (it keeps its history, PRs, machine, and Slack thread), or ask any thread:

   ```text
   Make a Captain called Mobile for the iOS and Android work.
   ```

3. Tell the Captain what it's for in its first message; it writes your answer into its rules and plan. Use one Captain per area or feature — it only takes crew threads from its own project.

   ```text
   You're the Captain for the new billing dashboard. The spec is in docs/billing-dashboard.md. Split it into PRs that merge independently, with one crew thread each, and stack the ones that touch the same files. Every crew thread opens a draft PR, runs the tests, and reports back with the link. Nothing merges without my word.
   ```

4. Work from the digest: the **Digest** tab (top five **Needs you** items on the **Overview**) lists what needs you, what's new, and what's in progress. Answer in the Captain's chat — "merge capy#3780" or "hold the migration until Monday" — and answer a crew thread's own question in that thread.
5. Shape it through its Drive files by telling it in plain words: `AGENTS.md` holds the Captain's own rules (crew threads don't read it), `CREW.md` holds rules every crew thread reads on every turn, `NOTES.md` is its plan, and `DIGEST.md` is the digest.

   ```text
   From now on, run the e2e suite before calling a PR ready.
   ```

6. Choose where the crew runs with **Crew runs on** in the Captain's **Profile** (the cloud or one paired device), and add guardrails as rules, because a Captain acts on its own:

   ```text
   Ask before starting more than two threads at once. Don't message other Captains unless I ask. Read their digest instead.
   ```

7. Track the work in **Issues** (sidebar): start from **For you**, **Assigned to me**, or **Mentioned**, and filter by status, assignee, labels, due date, or relations. Issues can block or relate to each other, hold sub-issues, and show linked PRs; threads file, update, and close issues as they work, and the thread that owns an issue wakes when someone comments on it.

**Verify:** the Captain's crew lists the threads it started, the **Pull requests** page filtered by **Captain** shows their PRs, and the **Digest** tab lists the decisions waiting on you.

> [!WARNING]
> A Captain always acts as its owner, whoever messages it: crew threads are created with the owner's GitHub access and connected subscriptions, and sharing a Captain shares its crew. A cloud Captain also burns machine time from your credits even when the model runs on a connected subscription.

### Step 6 — Automate recurring and event-driven work

**Goal:** Stored prompts that run on a schedule or on platform events · **Time:** ~25 min · **Level:** advanced

1. Create an automation on the **Automations** page, or ask Capy in a thread. Every automation belongs to one project. To wake a Captain on a schedule, ask the Captain itself to set one up ("Every weekday at 9am, check the open PRs and update the digest").
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

### Step 7 — Turn on the review agent and enforce conventions

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

7. Check the cost in Settings: **Loaded before the first message** shows roughly how many tokens each instruction file and the skills list take, and the **Skills** page (under **Agent**) flags a skill as **Not loaded** (no description) or **Replaced by** a same-named skill closer to you.

**Verify:** a review round posts inline GitHub comments at or above the posting threshold (medium by default), and a convention you wrote under `## Reviews` surfaces as a finding on a violating diff.

> [!TIP]
> Keep the root `AGENTS.md` narrow. A bloated root file taxes every request in every thread, and instruction files plus skill descriptions share one context budget — the context breakdown shows exactly what each one costs.

### Step 8 — Connect MCP servers and drive Capy from the API and Slack

**Goal:** External tools available in-session and programmatic control of threads and Captains · **Time:** ~25 min · **Level:** advanced

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

6. Create a thread with a caller-minted idempotency token, then poll its status until it is no longer `working` or `waiting`.

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

8. Create and read Captains over the API (`requestId`, `projectId`, and `name` are required), then read its crew and digest. There is no Captain message endpoint: message a Captain with the thread message endpoint and its thread id.

   ```bash
   curl -X POST "https://api.capy.ai/api/v1/captains" \
     -H "Authorization: Bearer $CAPY_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"requestId": "'"$(uuidgen)"'", "projectId": "'"$PROJECT_ID"'", "name": "Mobile"}'
   ```

   ```bash
   curl -H "Authorization: Bearer $CAPY_API_KEY" \
     "https://api.capy.ai/api/v1/captains/$CAPTAIN_ID/digest"
   ```

9. Steer a Captain from Slack with `captain=` (a name, the start of it, a whole word, its thread code, or its **Alias**). The message interrupts unless you add `!queue` or `!steer`, and the Captain answers in the app, not in Slack.

   ```text
   @Capy captain="Platform Captain" !queue add the retry fix to the next release
   ```

**Verify:** `GET /api/v1/projects` returns your projects, the thread you created appears at capy.ai with the same transcript the API reported, and `GET /api/v1/captains` lists the Captain you created.

> [!IMPORTANT]
> Errors are tagged JSON objects — match on `_tag` (such as `capy/ThreadNotFound`), not on prose. A resource outside your organization returns the same `404` as one that doesn't exist, so you can't probe for other tenants' ids. A service key that creates a Captain must name its human owner with `authorId`.

## Best Practices

### Do

- ✅ Spend the twenty minutes on the dev environment; an agent that can run your tests proves its changes instead of guessing until CI fails.
- ✅ Enable snapshots once setup works — restoring takes 1–2 seconds instead of paying clone plus `initialize` on every machine, subagent, and review.
- ✅ Keep one thread per task, and stack subagents when unsure: a merge conflict between parallel writers costs more than waiting.
- ✅ Put everything a subagent needs in its prompt and prefer a fresh machine for writers, so two writers can't collide.
- ✅ Start with a thread, and promote it to a Captain when you keep asking it to start other threads or want one place to see the work across them.
- ✅ Run one Captain per area or feature, state its purpose in the first message, and put crew-wide rules ("open PRs as drafts") in its `CREW.md`.
- ✅ Run threads and crews on a paired device (desktop app or `capy dock`) when the tools and credentials already live there — threads on your own machine have no machine-time charge.
- ✅ On a shared server, run the Dock CLI under a dedicated account: threads can read and change anything that user can.
- ✅ Keep MCP servers narrow, and keep tokens in project environment variables rather than source control.
- ✅ Default long-lived automations to a service user so offboarding a teammate doesn't silently break them.
- ✅ Route models by role: stronger models for planning and hard subsystems, cheaper ones for mechanical parallel work via per-subagent models.
- ✅ Review each diff on the machine before it ships; direct the parent to check a specific subagent's diff before opening its PR.
- ✅ Search by message content with `Cmd`/`Ctrl`+`K`; most thread titles are auto-generated, so search finds the error string you pasted weeks ago.
- ✅ Write enforceable conventions in `AGENTS.md`, including a `## Reviews` section, so the review agent enforces the same rules you do.
- ✅ Archive a thread when its work is done; archiving removes it from your lists without closing its pull requests.

### Don't

- ❌ Don't assume secrets stay out of the transcript: there is no output masking, so anything on the machine can be printed into the thread.
- ❌ Don't write secrets to disk in `initialize`; snapshot scrubbing can't prove absent what your own script wrote.
- ❌ Don't expect a thread to react to CI for a PR opened by hand with `gh pr create` — only a PR the agent opened subscribes the thread to CI, review, and merge events.
- ❌ Don't expect Capy to merge on its own: it never merges or enables auto-merge unless you explicitly ask for that merge in the current conversation.
- ❌ Don't let a Captain run unbounded — it acts on its own, so cap it with rules such as "Ask before starting more than two threads at once."
- ❌ Don't share a Captain casually: everyone you share it with can message it, and it always acts with its owner's GitHub access and subscriptions.
- ❌ Don't approve a Dock pairing code someone sent you, and don't run the desktop app and `capy dock` as the same user at once.
- ❌ Don't duplicate a rule across several instruction files; state it once in the narrowest scope that covers it.
- ❌ Don't background a dev server with `nohup` and poll for it in a `startup` entry — declare its port instead.

## Quick Command Reference

Web app:

| Action | How |
|---|---|
| Start a thread | Composer on the Threads page, or `Cmd`/`Ctrl`+`K` then `Tab` for a new-thread composer |
| Steer a busy agent | `Enter` (default) |
| Queue behind the current turn | `Option`/`Alt` + `Enter` |
| Interrupt the agent | `Cmd`/`Ctrl` + `Enter` |
| Side chat · fork | `/side` · `/fork` or `/fork-summary` |
| Start a Captain | **New Captain** in the sidebar, or **Promote to Captain** on a thread |
| Undo a Captain | **Demote to thread** · **Archive** (crew sleeps) · **Delete** (crew returns to your list) |
| Track work | **Issues** in the sidebar — **For you**, **Assigned to me**, **Mentioned** |
| Search everything | `Cmd`/`Ctrl`+`K` — threads, pull requests, automations, settings |
| Finish a thread | Archive it (keeps its folders, tags, and pull requests) |
| Open a machine's terminals | Thread pane **+** menu → Services, Commands, terminals |

Dock CLI:

| Command | What it does |
|---|---|
| `capy dock` | Runs the dock in the foreground; pairs the machine on the first run |
| `capy dock --dir ~/src/api` | Links a folder where your repositories are cloned |
| `capy dock status` | Shows whether the dock runs and which organization it's paired with |
| `capy dock doctor` | Checks the machine, install, pairing, `git`, `gh`, and reachability |
| `capy dock dirs add <PATH>` · `remove <PATH>` | Changes linked folders while the dock is stopped |
| `capy dock verify` · `capy dock version` | Checks installed files against the signed list · prints the version |

API (`https://api.capy.ai/api/v1`, bearer `CAPY_API_KEY`):

| Call | Use |
|---|---|
| `GET /projects` | List accessible projects; also verifies the key |
| `POST /threads` | Create a thread (`requestId`, `projectId`, `message`; optional `machineSize` up to `bigguy`) |
| `GET /threads/$THREAD_ID` | Poll status: `working`, `waiting`, `idle`, `failed`, `archived` |
| `POST /threads/$THREAD_ID/message` | Reply (`delivery`: `queue` to wait for current work); also how you message a Captain |
| `GET /threads/$THREAD_ID/messages` | Read the transcript; page forward with `after` |
| `GET /threads/$THREAD_ID/subagents` | Observe the subagent tree, read-only (legacy `/tasks` routes still answer) |
| `GET /captains` · `POST /captains` | List or create Captains (`requestId`, `projectId`, `name`) |
| `GET /captains/$CAPTAIN_ID/crew` · `/digest` | Read a Captain's crew, or its digest markdown |
| `POST /reviews` | Start a review round for a repository and PR number |
| `POST /automations` | Create an automation; `/disable` and `/enable` to pause and resume |
| Streams | Follow a thread or subagent over one Server-Sent Events connection |

Slack directives (inside an `@Capy` message):

| Directive / flag | Values / effect |
|---|---|
| `captain=` | Send the message to a Captain by name, name prefix, word, thread code (`CAPY-210`), or alias |
| `project=` | Project name or ID |
| `model=` | Catalog ID, name without route prefix, or a shortcut (`fable`, `opus`, `sonnet`, `haiku`, `sol`, `terra`, `luna`, `gemini`, `grok`, `kimi`, `qwen`, `glm`) |
| `reasoning=` | `off`, `minimal`, `low` through `max` |
| `machine=` | `small`, `medium`, `large`, `ultra`, `hyper` (new threads only) |
| `title=` · `folder=` · `channel=` | Set the title, file into a dashboard folder, or start in another channel |
| `!fast` · `!pro` · `!standard` | Serving mode |
| `!queue` · `!steer` | Delivery mode for a busy agent or Captain |
| `!new` · `!web` | Fork into a Slack thread, or start a separate web thread |
| `aside <text>` | Exclude a message from Capy's processing entirely |
| `mute` · `unmute` | Stop or resume Capy's replies in a thread |
| `archive` · `unarchive` · `stop` | Close the session, reopen it, or stop the current run |

## Expected Outcomes

- A signed-in workspace with the GitHub App installed, repositories attached to a project, and a first PR opened from a `capy/` branch.
- Threads that run in the cloud, on your own computer, or on a headless machine paired with `capy dock`.
- A dev environment with `initialize`, `refresh`, `startup` entries, and named commands, so the agent runs your tests instead of guessing.
- Snapshots that boot machines in roughly 1–2 seconds, and secrets scoped shared, personal, or per-thread.
- Parallel or stacked subagents for work inside one thread, each diff reviewed before it ships, and Captains whose crews ship multi-PR features while their digest tells you only what needs you, and Issues that track the work they pick up.
- Automations on schedule, GitHub, Slack, webhook, or on-demand triggers, running as a service user with a visible daily cap.
- A per-repository review mode with findings triaged, instructions in `AGENTS.md`, and a context breakdown that shows what they cost.
- API- and Slack-driven threads and Captains with idempotency keys, SSE streaming, and `_tag`-based error handling.

## Reference

<details>
<summary>Sources & deeper reading</summary>

Official docs (facts and commands; verified against Capy 0.7.2, Nov 1, 2026):

- [Capy docs](https://docs.capy.ai/welcome) — [LLM-friendly index](https://docs.capy.ai/llms.txt) · [Quickstart](https://docs.capy.ai/quickstart) · [Models & pricing](https://docs.capy.ai/models-and-pricing) · [FAQ](https://docs.capy.ai/faq)
- [Changelog](https://capy.ai/changelog) — 0.7.0 (Oct 31, 2026): Captains and Issues are GA, Dock CLI, context breakdown; 0.7.2 (Nov 1, 2026): Dock CLI on macOS, Linux, and Windows
- [Captains](https://docs.capy.ai/captains) · [Background work](https://docs.capy.ai/async-work) · [Subagents](https://docs.capy.ai/subagents) · [Threads](https://docs.capy.ai/threads)
- [Dock CLI](https://docs.capy.ai/dock) · [Desktop app and devices](https://docs.capy.ai/desktop) · [Machines](https://docs.capy.ai/machines)
- [Projects](https://docs.capy.ai/projects) · [Pull requests](https://docs.capy.ai/pull-requests) · [Reviews](https://docs.capy.ai/review) · [Environment](https://docs.capy.ai/environment) · [Snapshots](https://docs.capy.ai/environment#snapshots) · [Secrets](https://docs.capy.ai/secrets)
- [Instructions](https://docs.capy.ai/instructions) · [Skills](https://docs.capy.ai/skills) · [Drive](https://docs.capy.ai/drive) · [Automations](https://docs.capy.ai/automations)
- Integrations: [GitHub](https://docs.capy.ai/integrations/github) · [Slack](https://docs.capy.ai/integrations/slack) · [Linear](https://docs.capy.ai/integrations/linear) · [MCP](https://docs.capy.ai/integrations/mcp) · [Vercel](https://docs.capy.ai/integrations/vercel) · [Tailscale](https://docs.capy.ai/integrations/tailscale)
- [API reference](https://docs.capy.ai/api-reference/overview) · [Create Captain](https://docs.capy.ai/api-reference/captains/create-captain) · [API quickstart](https://docs.capy.ai/api-reference/quickstart) · [Streaming](https://docs.capy.ai/api-reference/streaming) · [OpenAPI JSON](https://docs.capy.ai/openapi.json)
- Admin: [Members & service users](https://docs.capy.ai/admin/members) · [Security](https://docs.capy.ai/admin/security) · [Billing](https://docs.capy.ai/admin/billing) · [Troubleshooting](https://docs.capy.ai/troubleshooting)

Community sources & context (independent of vendor docs unless noted):

- [@capydotai on X](https://x.com/capydotai) — **vendor-published** release announcements, including the 0.7.0 Captains launch
- [Capy on EveryDev.ai](https://www.everydev.ai/tools/capy) — tool listing and plan/pricing breakdown, including the 25-concurrent-agent framing
- [Best AI Coding Tools and Agents (2026)](https://superset.sh/compare/best-ai-coding-agents-2026) — third-party comparison placing Capy among cloud coding agents
- [Capy on Y Combinator](https://www.ycombinator.com/companies/capy) — company background (founded 2024, San Francisco)
- [Capy articles](https://capy.ai/articles) and [About Capy](https://capy.ai/about) — **vendor-published** positioning and comparisons, not independent evaluation. Posts from before 0.7.0 (such as "Captain vs Build") describe an older read-only planning "Captain" that is not the 0.7.0 Captain.

Omitted areas (see docs): Issues beyond the basics in Step 5 (no guide page yet — see the changelog and the [Issues API](https://docs.capy.ai/api-reference/issues/list-issues)), individual API endpoint schemas (use the generated reference and `openapi.json`), the Explore page, plugins, and themes, cloud phones and OIDC cloud credentials, billing and auto-reload mechanics, enterprise SSO/BYOK details, Tailscale networking, computer-use and desktop-driving workflows, image generation, and support processes.

- [Related: Devin cheatsheet](https://github.com/luongnv89/awesome-cheatsheets/blob/main/src/content/cheatsheets/devin/devin.md)
- [Related: Droid cheatsheet](https://github.com/luongnv89/awesome-cheatsheets/blob/main/src/content/cheatsheets/droid/droid.md)

</details>
