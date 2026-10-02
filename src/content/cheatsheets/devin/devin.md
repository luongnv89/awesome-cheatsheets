---
slug: devin
title: Devin — AI Software Engineer Cheatsheet
category: tool
subcategory: coding-agent
summary: "Set up and operate Devin, Cognition's autonomous AI software engineer: connect repositories, configure the environment snapshot, run Ask-to-Agent sessions, move work between the Devin CLI and cloud VMs, and automate recurring tasks."
last_updated: 2026-10-03
stale_after_days: 90
upstream_version: "Devin current"
tags: [devin, cognition-ai, coding-agent, cloud-agent, devin-cli, automations]
status: published
authors:
  - name: luongnv89
links:
  homepage: https://devin.ai
  docs: https://docs.devin.ai
  app: https://app.devin.ai
  cli: https://docs.devin.ai/cli
---

# Devin — AI Software Engineer Cheatsheet

**One-line:** Devin is Cognition's autonomous AI software engineer — give it a scoped task and it plans, codes, tests, and opens pull requests on its own cloud VM, with a Devin CLI for local work that can hand off to the cloud.

## Prerequisites

- [ ] A Devin account — sign up at [app.devin.ai](https://app.devin.ai) (Free, Pro, Max, and Teams self-serve plans; Enterprise via Cognition)
- [ ] Admin rights on your GitHub organization to connect repositories (or the equivalent on GitLab 15.0+, Bitbucket, or Azure DevOps)
- [ ] Optional: a supported terminal for Devin CLI — see the terminal compatibility docs in Reference

## Installation

Devin has two surfaces. Cloud Devin needs no install — everything starts at [app.devin.ai](https://app.devin.ai). For the terminal:

```bash
# Install Devin CLI — a local agent with deep Devin Cloud integration
curl -fsSL https://cli.devin.ai/install.sh | bash

# Restart your terminal, then authenticate
devin auth login
```

```bash
devin --version   # prints the installed version
devin             # start an interactive session in the current directory
```

> [!NOTE]
> Devin CLI and cloud Devin are separate tools: the CLI edits your local files, while cloud sessions get a dedicated VM with a shell, IDE, and browser. Knowledge, Playbooks, and Secrets are cloud-side features the CLI does not yet support.

## Step-by-Step Setup & Optimization

### Step 1 — Connect repositories and index your code

**Goal:** Devin can clone your repos and answer code questions via Ask Devin and DeepWiki · **Time:** ~10 min · **Level:** beginner

1. In the web app, open **Settings → Connections → GitHub**, click **Add Connection**, and grant access to **All repositories** or **Select repositories** (GitLab, Bitbucket, and Azure DevOps follow the same flow).
2. Enable code search: go to **Settings → DeepWiki → Repositories**, click **Add**, and pick the repositories to index.
3. Wait for each repo's status to move from **Indexing…** to **Indexed** — a few minutes depending on size.

**Verify:** the repository shows **Indexed** under Settings → DeepWiki, and Ask Devin answers a question about it with file citations.

> [!TIP]
> Index the branches your team actively develops on so Ask Devin and DeepWiki stay current.

### Step 2 — Configure the environment snapshot

**Goal:** Every session boots a VM with your repos, toolchain, dependencies, and secrets already in place · **Time:** ~30 min · **Level:** intermediate

The docs call this the single highest-leverage thing you can do to improve Devin's effectiveness.

1. Start a session and ask: *"Set up your environment for this repo."*
2. Review the blueprint Devin proposes as suggestion cards — approve the ones that match your stack.
3. Let the build finish: it produces the snapshot every session in your organization boots from.
4. Add credentials at [app.devin.ai/secrets](https://app.devin.ai/secrets) (organization or personal scope), or per-repo in the blueprint editor's **Secrets** tab — sessions reference them as environment variables like `$MY_SECRET`.

**Verify:** a fresh session runs your project's test or lint command with zero manual setup.

> [!WARNING]
> Never put secret values in blueprint YAML, setup commands, or committed `.env` files — store them in the Secrets tab and reference them by name.

### Step 3 — Run your first task: Ask → Agent

**Goal:** A draft pull request produced by a well-scoped session · **Time:** ~15 min · **Level:** beginner

1. Toggle **Ask** mode, select the repo(s), and scope the task — Ask Devin cites code and builds a context-rich prompt without touching code.
2. Click **Send to Devin** to move into **Agent** mode, which executes the plan on a cloud VM.
3. Structure prompts as *directive + context + verification*: what to change, which patterns or files to follow, and the exact check that proves it works.
4. Watch progress on the session page; take over in the embedded IDE, shell, or browser if needed.

**Verify:** Devin opens a pull request in the repository and reports CI status on the session page.

> [!TIP]
> Rule of thumb from the docs: if a task would take you three hours or less, Devin can most likely do it. Split bigger work into parallel sessions.

### Step 4 — Bridge local and cloud with Devin CLI

**Goal:** The same task moves freely between your terminal and a cloud VM · **Time:** ~10 min · **Level:** intermediate

1. Start local work from a project directory:

   ```bash
   devin                            # interactive session
   devin -p "summarize this repo"   # single-shot: prints and exits
   ```

2. Start or resume cloud sessions — they keep running when you close the laptop:

   ```bash
   devin --cloud                      # new cloud session
   devin --cloud -r                   # pick a recent cloud session to resume
   devin ssh <session-id-or-url>      # shell on the session's VM
   ```

3. Inside a session, `/handoff` ships the local session to the cloud (conversation context and uncommitted diff included); in a cloud session, `/handoff` or `/pickup` checks out the PR branch and continues locally. `/open` opens the session in the web app.

**Verify:** `devin --version` prints a version number, and `/handoff` returns a cloud session URL that opens in the web app.

### Step 5 — Teach Devin your conventions

**Goal:** Durable context — skills, rules, AGENTS.md, playbooks — instead of repeated prompt reminders · **Time:** ~15 min · **Level:** intermediate

1. Add an `AGENTS.md` at each repo root — Devin auto-injects it into cloud sessions (automatic injection is capped at 16 KiB; see the agents-md doc).
2. Open [app.devin.ai/customize](https://app.devin.ai/customize) and install marketplace plugins — bundles of skills, rules, hooks, and MCP servers — at personal, organization, or enterprise scope. From the CLI: `devin plugins install <source>`.
3. Save repeated task prompts as **Playbooks**, then attach them with a `!macro` or a `.devin.md` file at session start.
4. Connect external tools under the **MCPs** tab (Datadog, Sentry, Figma, databases) so sessions can reach them.

**Verify:** the skill or rule appears under **Customize → Skills/Rules**, and a new session can invoke installed skills as `/<plugin>:<skill>`.

> [!IMPORTANT]
> Knowledge is deprecated and being migrated to Skills in Plugins — author new context as skills and rules, not Knowledge items.

### Step 6 — Close the loop: reviews, comments, automations

**Goal:** Devin reacts to events and finishes PRs without you in the loop · **Time:** ~20 min · **Level:** advanced

1. On any open PR in a connected repo, comment `/devin fix the failing lint check` — Devin starts a session and replies with a link (`/devin review` triggers Devin Review).
2. Enable **Devin Review** with **Auto-Fix** so Devin responds to review comments and iterates on CI failures automatically.
3. Build an automation (**Automations → Create automation**): pick a trigger — GitHub check-run failure, Slack message or reaction, Linear or Jira event, Schedule, Webhook — and an action (start a session, message a session, or run a triage monitor).
4. Run independent tasks in parallel sessions — there is no concurrent session limit.

**Verify:** a test trigger — a `/devin` PR comment or a scheduled run — spawns a session that links back to the PR or thread.

> [!WARNING]
> GitHub automations fire on private repos by default. Opting a connection into public repos raises prompt-injection risk — keep trigger conditions narrow.

## Best Practices

### Do

- ✅ Scope with Ask Devin first, then let Agent mode execute the generated plan.
- ✅ Put explicit success criteria and verification commands in every prompt.
- ✅ Keep sessions focused (XS–M in Session Insights); parallelize big projects across sessions.
- ✅ Store credentials as Secrets on a dedicated `devin@company.com` service account.
- ✅ Encode team conventions in `AGENTS.md`, skills, and rules; standardize repeated tasks as Playbooks.
- ✅ Check Session Insights after runs and convert mistakes into rules or skills.

### Don't

- ❌ Paste secrets into prompts, blueprint YAML, or committed `.env` files.
- ❌ Leave design decisions open-ended — make judgment calls for Devin up front.
- ❌ Cram unrelated tasks into one session — it burns usage and degrades quality.
- ❌ Author new Knowledge items — the feature is deprecated in favor of Skills and Rules.
- ❌ Assume the CLI sees cloud-side features — Knowledge, Playbooks, and Secrets are web-only for now.

## Quick Command Reference

| Command | Use |
|---|---|
| `devin` | Start an interactive session in the current directory. |
| `devin -- <prompt>` | Start the session with an initial prompt. |
| `devin -p "<prompt>"` | Single-shot: print the response and exit. |
| `devin -c` / `devin -r [id]` | Continue the last session / resume a session. |
| `devin auth login` / `status` / `logout` | Manage CLI authentication. |
| `devin --cloud` | Start a Devin Cloud session from the terminal. |
| `devin --cloud -r <url-or-id>` | Resume a cloud session in the terminal. |
| `devin ssh <session>` | Open a shell on a cloud session's VM. |
| `/handoff` | Move the task between local and cloud — works both ways. |
| `/cloud` · `/repo` · `/platform` · `/model` | Configure a cloud session before the first message (SWE-2 recommended). |
| `/mode <name>` | Permission mode: normal, accept-edits, smart, plan, bypass (autonomous under `--sandbox`). |
| `/plan` · `/ask` | Plan-first and question-only agent modes. |
| `/loop <prompt>` | Run a prompt, then auto-review the diff in a loop. |
| `devin plugins install <source>` | Install a plugin into personal scope (`--local` for this machine only). |
| `npx devin-review <pr-url>` | Run Devin Review on a PR from a local clone. |
| `/devin <prompt>` | GitHub PR comment that starts a session (`/devin review` runs Devin Review). |

## Expected Outcomes

- Repositories are connected and indexed — Ask Devin and DeepWiki answer with file citations.
- Every session boots from a snapshot with dependencies, tools, and secrets ready.
- The Ask → Agent workflow turns scoped prompts into draft PRs for roughly three-hour tasks.
- Devin CLI moves work between local and cloud with `devin --cloud`, `/handoff`, and `devin ssh`.
- Team conventions live in AGENTS.md, skills, rules, and playbooks — not repeated prompt reminders.
- Automations and Devin Review Auto-Fix keep CI and review loops moving without manual steering.
- Usage stays controlled: short scoped sessions, automatic sleep after 30 idle minutes, and Session Insights for post-task review.

## Reference

<details>
<summary>Sources & deeper reading</summary>

Official docs (facts and commands):

- [Devin docs](https://docs.devin.ai) — [llms.txt index](https://docs.devin.ai/llms.txt)
- [Your First Session](https://docs.devin.ai/get-started/first-run) · [When to Use Devin](https://docs.devin.ai/essential-guidelines/when-to-use-devin) · [Instructing Devin Effectively](https://docs.devin.ai/essential-guidelines/instructing-devin-effectively)
- [Index a Repository](https://docs.devin.ai/onboard-devin/index-repo) · [Environment setup](https://docs.devin.ai/onboard-devin/environment) · [AGENTS.md for Devin](https://docs.devin.ai/onboard-devin/agents-md)
- [Secrets & Site Cookies](https://docs.devin.ai/product-guides/secrets) · [Plugins & Customize](https://docs.devin.ai/product-guides/plugins) · [Creating Playbooks](https://docs.devin.ai/product-guides/creating-playbooks) · [Automations](https://docs.devin.ai/product-guides/automations)
- [GitHub integration](https://docs.devin.ai/integrations/gh) · [Usage & billing](https://docs.devin.ai/admin/billing/usage)
- CLI: [Quickstart](https://docs.devin.ai/cli) · [Essential Commands](https://docs.devin.ai/cli/essential-commands) · [Devin Cloud in the CLI](https://docs.devin.ai/cli/cloud) · [Handoff](https://docs.devin.ai/cli/handoff) · [Commands & Flags](https://docs.devin.ai/cli/reference/commands) · [Terminal compatibility](https://docs.devin.ai/cli/reference/terminal-compatibility)

Community sources:

- [Bringing Devin Cloud to your terminal](https://devin.ai/blog/devin-cloud-in-your-terminal) — Cognition blog
- [Thoughts on a Month with Devin](https://www.answer.ai/posts/2025-01-08-devin) — Answer.AI field test: scope tasks tightly, results vary on ambiguous work
- [Devin AI — honest review after real production use](https://clawpedia.io/article/devin-ai-honest-review-real-production-use) — treat Devin as an async pipeline, not a pair programmer

Omitted areas (see docs): Devin API reference, Devin Desktop, Outposts self-hosted workers, Enterprise SSO/SCIM, macOS/Windows/Android environments, DeepWiki configuration, Security Swarm and Code Scans.

- [Related: Claude Code cheatsheet](https://github.com/luongnv89/awesome-cheatsheets/blob/main/src/content/cheatsheets/claude-code/claude-code.md)
- [Related: Codex cheatsheet](https://github.com/luongnv89/awesome-cheatsheets/blob/main/src/content/cheatsheets/codex/codex.md)

</details>
