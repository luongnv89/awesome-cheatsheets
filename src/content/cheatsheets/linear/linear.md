---
slug: linear
title: Linear — Issue Tracking Starter Cheatsheet
category: tool
subcategory: project-management
summary: Beginner path through Linear — sign up, learn the workspace → team → issue model, drive everything from the keyboard, plan with cycles, projects, and initiatives, triage incoming work, and wire up GitHub, Slack, and the Linear MCP server.
last_updated: 2026-11-11
stale_after_days: 120
tags: [linear, project-management, issue-tracking, productivity, keyboard-shortcuts, github, mcp]
status: published
authors:
  - name: luongnv89
links:
  homepage: https://linear.app/
  docs: https://linear.app/docs
  method: https://linear.app/method
---

# Linear — Issue Tracking Starter Cheatsheet

**One-line:** Linear is a fast, keyboard-first issue tracker where work flows from issues into cycles, projects, and initiatives — learn about ten shortcuts and keep issues small, and the app largely runs itself.

**Who this is for:** People new to Linear — solo builders, engineers, PMs — who want a working setup and a daily routine without reading 130 docs pages.

**Read time:** ~10 min · **Apply Steps 1–4:** under 30 min

## Prerequisites

- [ ] A browser (latest 3 versions of Chrome, Firefox, or Safari), or macOS / Windows for the desktop app
- [ ] A work email to sign up
- [ ] Optional: admin access to your GitHub org and Slack workspace for Step 7

## Installation

Linear is a hosted **application**, not a CLI. Use it in the browser or install a client:

- **Sign up:** [linear.app/signup](https://linear.app/signup) — new users can explore a demo workspace before creating their own.
- **Desktop (macOS Intel, macOS Apple Silicon, Windows):** [linear.app/download](https://linear.app/download). There is no Linux app; Linux users use the browser.
- **Mobile:** iOS (App Store) and Android (Google Play).
- **Open links in the desktop app:** Linear registers the `linear://` protocol, for example:

```text
linear://linear.app/issue/ENG-123
```

**First run:**
1. Create a workspace — it gets a URL like `linear.app/<workspace-slug>`.
2. Linear auto-creates a default team named after the workspace. Rename it and set a short **team identifier** (e.g. `ENG`) in **Team settings → General** — every issue ID is built from it.
3. Invite teammates from **Settings → Administration → Members → Invite** (skip if you work solo).

> [!NOTE]
> Plans: **Free** (2 teams, 250 issues), **Basic**, **Business**, **Enterprise**. Core features — issues, projects, cycles, initiatives, triage, GitHub, MCP, Linear Agent — are on every plan. Check [linear.app/pricing](https://linear.app/pricing) for current limits and prices.

## Step-by-Step Setup & Optimization

### Step 1 — Learn the mental model and set up your team

**Goal:** A team with a workflow you understand · **Time:** ~10 min · **Level:** beginner

The hierarchy:

```text
Workspace (your org)
└── Team (ENG, DESIGN, …)        ← owns issues, workflow, cycles, triage
    └── Issue  ENG-123           ← the unit of work; can have sub-issues
Projects   group issues toward a deliverable (can span teams, have milestones)
Initiatives group projects toward a company goal (replaced "Roadmaps" in 2024)
```

1. Open **Settings → Teams → Issue statuses** and review the default workflow: **Backlog → Todo → In Progress → Done → Canceled** (plus a system *Duplicate* status).
2. Keep the defaults for now. Every status belongs to one category — Backlog, Unstarted, Started, Completed, Canceled (plus Triage when enabled) — which drives automations later.
3. Note that issue IDs are `TEAMKEY-number`. Moving an issue to another team (`Cmd/Ctrl Shift M`) gives it a new ID, but old IDs and URLs still resolve.

**Verify:** Your team appears in the sidebar and its workflow shows the five default statuses.

### Step 2 — Create and shape issues from the keyboard

**Goal:** Capture an issue with all key properties in under 10 seconds · **Time:** ~10 min · **Level:** beginner

1. Press `C` to create an issue (`Option/Alt C` to start from a template). From any browser tab, open [linear.new](https://linear.new).
2. Hover or open an issue and set properties with single keys:

| Key | Property |
|---|---|
| `A` | Assign |
| `I` | Assign to yourself |
| `P` | Priority (No priority, Low, Medium, High, Urgent) |
| `L` | Labels |
| `Shift E` | Estimate |
| `Shift P` | Add to project |
| `M` then `B` / `X` / `R` | Mark *blocked by* / *blocking* / *related* |

3. Break large work down: open the issue and press `Cmd/Ctrl Shift O` to add sub-issues. To nest existing issues, select them and press `Cmd Shift P` (or run *Set parent issue* from `Cmd/Ctrl K`).
4. When you forget a shortcut, press `Cmd/Ctrl K` — the command menu runs every action by name.

**Verify:** A new issue `<TEAM>-1` shows an assignee, a priority icon, and a label in the team's issue list.

> [!TIP]
> Prefill issues from a URL: `https://linear.new?title=Fix+login&priority=Urgent&assignee=me` (supported params include `title`, `description`, `status`, `team`, `priority`, `assignee`, `estimate`, `cycle`, `labels`, `project`, `template`).

### Step 3 — Build your daily loop: Inbox, My Issues, search

**Goal:** A 5-minute morning routine that surfaces everything you own · **Time:** ~5 min · **Level:** beginner

1. `G` then `I` — **Inbox**: notifications for mentions, assignments, and subscribed issues. `U` marks read/unread, `H` snoozes, `Backspace` deletes.
2. `G` then `M` — **My Issues**: everything assigned to you. `Shift S` subscribes you to an issue you don't own.
3. `/` — search; `O` then `I` jumps to an issue by ID or title; `Cmd/Ctrl F` finds within the current view.
4. Move fast in lists: `J` / `K` to move, `X` to select (then `Cmd/Ctrl K` for bulk actions), `Space` to Peek without opening, `Esc` to clear.

**Verify:** `G` then `I` opens Inbox and `G` then `M` lists the issue you assigned yourself in Step 2.

> [!NOTE]
> Linear has no single shortcuts page in its docs. Changelogs mention `?` and later `Cmd/Ctrl /` for the shortcut overlay — check which your version uses.

### Step 4 — Slice work with filters, display options, and saved views

**Goal:** One saved view per question you ask often · **Time:** ~10 min · **Level:** beginner

1. In any issue list, press `F` and filter (e.g. *Priority is Urgent or High*, *Assignee is me*).
2. Press `Shift V` for display options — grouping, ordering, visible properties.
3. Press `Cmd/Ctrl B` to toggle between **list** and **board** layout.
4. Press `Option/Alt V` to save it as a custom view; star it to keep it in your sidebar Favorites.

**Verify:** The saved view appears in the sidebar and still shows only matching issues after a reload.

### Step 5 — Plan with cycles, projects, and initiatives

**Goal:** A steady cadence plus a home for every larger deliverable · **Time:** ~15 min · **Level:** intermediate

1. **Cycles (time-boxed sprints):** **Team Settings → Cycles → Enable cycles**. Pick a length (1–8 weeks; the Linear Method finds 2 weeks most common) and start day. Optionally add a cooldown.
2. Linear creates upcoming cycles automatically; open issues in a closing cycle **roll over** to the next one — no manual carry-over.
3. **Projects:** create one per deliverable with a lead, target date, and milestones. Add issues with `Shift P`; `Cmd/Ctrl I` toggles the project details sidebar.
4. **Initiatives:** group related projects under a goal and track them with statuses *Proposed, Planned, Active, Completed, Canceled*.

**Verify:** The team sidebar shows *Cycles* with a current cycle, and your project page lists its issues and milestones.

> [!TIP]
> Use projects, not labels, to group work toward an outcome. Keep labels for cross-cutting categories (Bug, Feature, area) and never use them to mirror statuses.

### Step 6 — Turn on Triage for incoming work

**Goal:** Requests from outside the team land in one queue you clear regularly · **Time:** ~5 min · **Level:** intermediate

1. **Team Settings → Triage** → toggle on. Triage appears under the team name in the sidebar.
2. Issues created by integrations (Slack, support tools) or by people outside the team now land there first.
3. Open Triage with `G` then `T` and process each issue: `1` accept, `2` decline (→ Canceled), `3` mark duplicate, `H` snooze.

**Verify:** An issue created via Slack or by a non-member appears under *Triage*, and pressing `1` moves it into the team's workflow.

> [!IMPORTANT]
> Decline freely. The Linear Method recommends a small backlog — important requests come back.

### Step 7 — Connect GitHub, Slack, and your AI tools

**Goal:** Issue statuses update themselves from code, and agents can read/write issues · **Time:** ~20 min · **Level:** intermediate

1. **GitHub:** **Settings → Features → Integrations → GitHub**, connect your org, then link your account under **Settings → Connected accounts**.
2. On an issue press `Cmd/Ctrl Shift .` to copy its git branch name, then create the branch:

```bash
git checkout -b <COPIED_BRANCH_NAME>
```

3. Reference the issue with a **magic word** in the PR title/description (or commit message, once enabled):
   - Closing — `Fixes ENG-123`, `Closes …`, `Resolves …`: issue moves to In Progress, then Done on merge.
   - Non-closing — `Ref ENG-123`, `Part of …`: links and advances status but doesn't close.
   - `Fixes ENG-NEW` creates a new issue and links it.
4. **Slack:** connect under integration settings (admin), then mention `@Linear` in a thread (e.g. "@Linear file a bug, assign me") or run `/linear` to create an issue. Private channels need `/invite @Linear` first.
5. **MCP server** (lets Claude, Codex, Cursor, and other agents work with your issues) — Claude Code:

```bash
claude mcp add --transport http linear-server https://mcp.linear.app/mcp
```

Then run `/mcp` inside Claude Code to authenticate. Codex:

```bash
codex mcp add linear --url https://mcp.linear.app/mcp
```

First MCP server in Codex? Enable `experimental_use_rmcp_client = true` in `~/.codex/config.toml` first (see the [MCP docs](https://linear.app/docs/mcp)).

**Verify:** A PR containing `Fixes <TEAM>-1` shows on the issue, and merging it moves the issue to Done.

> [!TIP]
> Need read-only agent access? Point the client at `https://mcp.linear.app/mcp/readonly` instead. Inside Linear, open the built-in **Linear Agent** with `Cmd/Ctrl J` or `@Linear` in a comment.

### Step 8 — Use Business-plan extras (optional)

**Goal:** Automate intake and deadlines once more people send you work · **Time:** ~20 min · **Level:** advanced

Only on **Business** and **Enterprise** plans:

1. **Triage Rules** — auto-route or update incoming issues that match conditions.
2. **Triage Responsibility** — a rotation of members who get notified of or assigned new triage issues.
3. **Triage Intelligence** — AI suggestions for assignee, labels, and duplicates on triage issues.
4. **SLAs** — automatic deadlines for issues matching rules you define (e.g. Urgent → 24h), optionally counted in business days.
5. **Linear Asks** — let non-Linear users file requests from Slack (`/ask`) or email.
6. **Private teams and guests** — **Team settings → Access and permissions → Change team visibility**; invite clients as guests.
7. **Insights** — reports on how work is distributed across assignees and agents.

**Verify:** A new triage issue matching your rule is auto-assigned, and newly prioritized Urgent issues show an SLA deadline once your SLA rule exists.

> [!NOTE]
> Working solo? Most Business features target multi-team coordination. Free (up to 250 issues) or Basic covers a solo workflow unless you need client guests, Asks, support integrations, or Code Intelligence.

## Best Practices

### Do
- ✅ **Live in the keyboard** — `C`, `Cmd/Ctrl K`, `G` then `I`/`M`/`T` cover most of the day.
- ✅ **Write small issues with one owner** — scope until an issue fits in a few days; every issue gets one assignee and every project one lead.
- ✅ **Keep specs short** — a clear title plus a few lines beats a long template.
- ✅ **Run cycles on a fixed cadence** (1–2 weeks) and let rollover handle unfinished work instead of re-planning by hand.
- ✅ **Mix bug fixes into every cycle** alongside feature work.
- ✅ **Clear Triage and Inbox daily** — accept, decline, or snooze; don't let either pile up.
- ✅ **Link every PR with a magic word** so statuses stay accurate without manual updates.

### Don't
- ❌ Hoard a huge backlog — archive or decline what you won't do this quarter.
- ❌ Use labels as statuses or as a substitute for projects.
- ❌ Invent custom terminology — Linear's defaults (projects, cycles, initiatives) are shared vocabulary.
- ❌ Overload a cycle — plan to finish, not to fill.
- ❌ Follow older guides that mention *Roadmaps* — that feature is now **Initiatives**.

### Working solo
- **One team is enough** — keep the default team Linear creates; add a second only for a genuinely separate stream (e.g. clients vs. your own product).
- **Short cycles as a personal cadence** — 1-week cycles give you a weekly review without ceremony; rollover handles what you didn't finish.
- **Skip Triage at first** — with no one else filing issues, turn it on only when Slack or integrations start sending you requests.
- **Projects for each side bet** — one project per product or client deliverable, with a target date, so My Issues stays focused.
- **Let automation update statuses** — branch names plus `Fixes ENG-123` keep issues accurate without manual clicks.
- **Delegate to agents** — connect the MCP server (Step 7) so Claude or Codex can read, create, and update your issues.
- **Plan choice** — Free covers up to 250 issues; move to Basic for unlimited issues. Business mainly pays off if you bring in clients (guests, Asks) or want Code Intelligence.

## Quick Command Reference

| Goal | Shortcut / action |
|---|---|
| Command menu | `Cmd/Ctrl K` |
| Create issue / from template | `C` / `Option/Alt C` |
| Create issue from browser | [linear.new](https://linear.new) |
| Assign / assign to me | `A` / `I` |
| Priority / labels / estimate | `P` / `L` / `Shift E` |
| Add to project | `Shift P` |
| Blocked by / blocking / related | `M` then `B` / `X` / `R` |
| Move issue to another team | `Cmd/Ctrl Shift M` |
| Inbox / My Issues / Triage | `G` then `I` / `G` then `M` / `G` then `T` |
| Search / jump to issue | `/` / `O` then `I` |
| Open team / switch workspace | `O` then `T` / `O` then `W` |
| Filter / display options | `F` / `Shift V` |
| List ↔ board | `Cmd/Ctrl B` |
| Save custom view | `Option/Alt V` |
| Select / navigate / Peek | `X` / `J` `K` / `Space` |
| Triage: accept / decline / duplicate / snooze | `1` / `2` / `3` / `H` |
| Copy git branch name | `Cmd/Ctrl Shift .` |
| Subscribe to issue | `Shift S` |
| Linear Agent chat | `Cmd/Ctrl J` |
| Close issue from a PR | `Fixes ENG-123` in title/description |
| Add MCP to Claude Code | `claude mcp add --transport http linear-server https://mcp.linear.app/mcp` |

## Expected Outcomes (after Steps 1–7)

- **Capture in seconds:** `C` from anywhere, properties set without the mouse.
- **One place to start the day:** Inbox and My Issues show exactly what needs you.
- **Predictable cadence:** cycles roll over unfinished work automatically; projects and initiatives show progress toward bigger goals.
- **Statuses that update themselves:** branches and magic words move issues from In Progress to Done.
- **Agent-ready workspace:** Claude, Codex, or Linear Agent can read and update issues through MCP.

## Reference

<details>
<summary>Sources & deeper reading</summary>

**Official docs**
- [Docs home](https://linear.app/docs) · [Start guide](https://linear.app/docs/start-guide) · [Concepts](https://linear.app/docs/conceptual-model) · [Download Linear](https://linear.app/docs/get-the-app)
- [Creating issues](https://linear.app/docs/creating-issues) · [Issue properties](https://linear.app/docs/issue-property) · [Assign and delegate](https://linear.app/docs/assigning-issues) · [Parent and sub-issues](https://linear.app/docs/parent-and-sub-issues) · [Select issues](https://linear.app/docs/select-issues)
- [Inbox](https://linear.app/docs/inbox) · [My Issues](https://linear.app/docs/my-issues) · [Search](https://linear.app/docs/search) · [Filters](https://linear.app/docs/filters) · [Display options](https://linear.app/docs/display-options) · [Custom views](https://linear.app/docs/custom-views)
- [Cycles](https://linear.app/docs/use-cycles) · [Projects](https://linear.app/docs/projects) · [Initiatives](https://linear.app/docs/initiatives) · [Triage](https://linear.app/docs/triage) · [Teams](https://linear.app/docs/teams) · [Workspaces](https://linear.app/docs/workspaces)
- [GitHub](https://linear.app/docs/github) · [Slack](https://linear.app/docs/slack) · [Import guide](https://linear.app/docs/import-issues) (Jira, Asana, GitHub Issues, Shortcut; admin only)
- [MCP server](https://linear.app/docs/mcp) · [Linear Agent](https://linear.app/docs/linear-agent) · [Agents in Linear](https://linear.app/docs/agents-in-linear)
- [Pricing](https://linear.app/pricing) · [Billing and plans](https://linear.app/docs/billing-and-plans)

**Method & community**
- [The Linear Method](https://linear.app/method/introduction) — maintainer-authored principles (small issues, single owners, cycles, small backlog)
- [Introducing Initiatives (changelog, 2024-06-25)](https://linear.app/changelog/2024-06-25-introducing-initiatives) — why "Roadmaps" guides are outdated
- [Morgen — Linear guide: setup, best practices & pro tips](https://www.morgen.so/blog-posts/linear-project-management) (third-party)

Omitted areas (see docs): editor formatting, notifications settings, documents, issue templates, project updates and timeline, releases, dashboards, Code Intelligence and coding agents, enterprise SSO/SCIM, and niche integrations (Zendesk, Intercom, Sentry, Figma, Microsoft Teams).

> Shortcuts and plan details were checked against linear.app docs on 2026-11-11. Linear ships weekly — re-check pricing and AI features before relying on them.

</details>
