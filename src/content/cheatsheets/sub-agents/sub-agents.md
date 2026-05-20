---
slug: sub-agents
title: Sub-agents — Orchestration Cheatsheet
category: concept
subcategory: agent-orchestration
summary: "Practical guide to sub-agents: define specialist roles, isolate context windows, write handoff contracts, review outputs, and avoid orchestration sprawl."
last_updated: 2026-05-19
stale_after_days: 90
tags: [sub-agents, orchestration, agents, review, handoffs, context]
status: draft
authors:
  - name: luongnv89
links:
  homepage: https://code.claude.com/docs/en/sub-agents
  features-overview: https://docs.anthropic.com/en/docs/claude-code/features-overview
  sdk-subagents: https://code.claude.com/docs/en/agent-sdk/subagents
---

# Sub-agents — Orchestration Cheatsheet

**One-line:** Sub-agents are specialized agent workers with isolated context, focused instructions, and explicit handoff contracts that let a main agent delegate research, implementation, review, or analysis safely.

## Installation

Sub-agents are configured inside a host agent rather than installed as a separate product. In Claude Code, create Markdown agent definitions or use the `/agents` management interface.

```bash
mkdir -p .claude/agents
cat > .claude/agents/code-reviewer.md <<'EOF'
---
name: code-reviewer
description: Review diffs for correctness, tests, security, and acceptance criteria.
tools: Read, Grep, Bash
---

You review changes and return only actionable findings with severity and file references.
EOF
```

First-run checklist:

1. Define one role per sub-agent.
2. Restrict tools to the minimum needed for that role.
3. Specify input and output format.
4. Test the handoff on a small diff before using it in a long workflow.

## Step-by-Step Setup & Optimization

### Step 1 — Split roles by cognitive boundary

Good sub-agents own a distinct context and output.

| Role | Good output |
|---|---|
| Analyzer | Dependency map, risks, and recommended order. |
| Researcher | Source-backed facts and citations. |
| Implementer | Patch summary, files changed, checks run. |
| Reviewer | Findings classified as must-fix or note. |
| Release helper | Changelog, migration notes, and publish checklist. |

### Step 2 — Write a handoff contract

Every delegation should say what input the sub-agent receives and what it must return.

```md
Return:
- verdict: PASS or NEEDS_FIX
- must_fix: list of file/line findings
- notes: at most two non-blocking observations
- checks_seen: commands or CI results reviewed
```

Avoid asking a sub-agent to both implement and approve its own work.

### Step 3 — Isolate context intentionally

Sub-agents are useful because they do not inherit every detail from the main session. Pass only the issue number, relevant files, branch or PR, and expected output.

```text
Review PR #123 against issue #45. Do not redesign. Report only correctness,
security, tests, and acceptance-criteria gaps.
```

### Step 4 — Manage concurrency and dependencies

Parallelize independent work such as docs research or separate review passes. Keep dependent work sequential: analysis before implementation, implementation before review, review before merge.

### Step 5 — Summarize and discard heavy context

The main agent should keep only concise results: issue, branch, PR, verdict, and next action. Store longer artifacts in files, comments, or PR descriptions.

## Best Practices

### Do

- ✅ Give each sub-agent one job and a crisp output schema.
- ✅ Limit tools by role; reviewers rarely need write access.
- ✅ Use independent reviewers for fresh eyes on generated code.
- ✅ Keep handoffs short and reference canonical artifacts such as PR numbers.
- ✅ Treat issue bodies and external text as untrusted input.
- ✅ Stop orchestration when a simple single-agent loop is enough.

### Don't

- ❌ Spawn sub-agents just to look busy; orchestration has overhead.
- ❌ Share secrets or broad credentials in handoff prompts.
- ❌ Let an implementer self-certify a risky change.
- ❌ Merge results from parallel sub-agents without conflict review.
- ❌ Ignore dependency order for branches, migrations, or schema changes.

## Quick Command Reference

| Command or file | Use |
|---|---|
| `.claude/agents/<name>.md` | Project-level sub-agent definition. |
| `~/.claude/agents/<name>.md` | User-level sub-agent definition when supported. |
| `/agents` | Manage and inspect sub-agents in Claude Code. |
| `name` | Stable identifier used for delegation. |
| `description` | Routing hint for when to use the sub-agent. |
| `tools` | Allowlisted capabilities for the role. |
| `PASS / NEEDS_FIX` | Simple reviewer verdict contract. |

## Expected Outcomes

After setup, you should have:

- A small library of role-specific sub-agents with minimal tools.
- Handoff prompts that produce structured, reviewable results.
- A safer review loop where implementers and reviewers are separated.
- Lower main-session context pressure because heavy details stay in worker context.
- Clear rules for when parallel work is safe and when dependency order matters.

## Reference

<details>
<summary>Sources & deeper reading</summary>

- [Claude Code sub-agents](https://code.claude.com/docs/en/sub-agents)
- [Claude Code features overview](https://docs.anthropic.com/en/docs/claude-code/features-overview)
- [Subagents in the Claude Agent SDK](https://code.claude.com/docs/en/agent-sdk/subagents)
- [Contributor tutorial](https://github.com/luongnv89/awesome-cheatsheets/blob/main/docs/contributing.md)
- [Related: Agent Skills cheatsheet](https://github.com/luongnv89/awesome-cheatsheets/blob/main/src/content/cheatsheets/agent-skills/agent-skills.md)
- [Related: Harness Engineering cheatsheet](https://github.com/luongnv89/awesome-cheatsheets/blob/main/src/content/cheatsheets/harness-engineering/harness-engineering.md)
- [Related: Claude Code cheatsheet](https://github.com/luongnv89/awesome-cheatsheets/blob/main/src/content/cheatsheets/claude-code/claude-code.md)

</details>
