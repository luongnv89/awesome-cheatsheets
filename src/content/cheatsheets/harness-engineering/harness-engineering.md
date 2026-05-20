---
slug: harness-engineering
title: Harness Engineering — Coding Agent Operations Cheatsheet
category: concept
subcategory: agent-operations
summary: "Practical guide to harness engineering: design the context, tools, feedback loops, evaluations, and operating controls that make coding agents reliable."
last_updated: 2026-05-19
stale_after_days: 120
tags: [harness-engineering, agents, evaluations, context, feedback-loops, operations]
status: draft
authors:
  - name: luongnv89
links:
  homepage: https://openai.com/index/harness-engineering/
  anthropic-harnesses: https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents
  langchain-agent-harness: https://www.langchain.com/blog/the-anatomy-of-an-agent-harness
  martin-fowler: https://martinfowler.com/articles/harness-engineering.html
---

# Harness Engineering — Coding Agent Operations Cheatsheet

**One-line:** Harness engineering is the practice of surrounding AI coding agents with the context, tools, constraints, evaluations, and feedback loops they need to deliver reliable software work.

## Installation

Harness engineering is a discipline, not a single tool, so there is no standalone installer. Start by choosing a coding agent and documenting the harness around it.

```bash
# Example repository bootstrap for a harnessed agent workflow
mkdir -p .agent-harness/{context,evals,runbooks,logs}
touch .agent-harness/context/project.md
touch .agent-harness/evals/checklist.md
touch .agent-harness/runbooks/issue-loop.md
```

First-run checklist:

1. Pick one agent surface: Claude Code, Codex, OpenCode, Pi, or another approved tool.
2. Write the project's durable context and forbidden actions.
3. Define the checks that prove work is done.
4. Capture handoff notes after every agent session.

## Step-by-Step Setup & Optimization

### Step 1 — Define the work envelope

A harness starts by specifying what the agent is allowed to know and do.

| Surface | Harness question |
|---|---|
| Context | Which docs, files, issues, and decisions load by default? |
| Tools | Which tools can read, write, call APIs, or run shell commands? |
| State | Where are plans, logs, checkpoints, and handoffs stored? |
| Feedback | Which tests, reviews, evals, and metrics judge progress? |

### Step 2 — Convert intent into operating instructions

Write a concise runbook that turns vague goals into repeatable loops.

```md
# Issue loop
1. Restate acceptance criteria.
2. Inspect only relevant files.
3. Propose a plan with risks.
4. Implement one slice.
5. Run the narrowest check, then the full required check.
6. Write handoff notes and open a PR.
```

### Step 3 — Build feedback loops before autonomy

An agent without feedback drifts. Add fast checks first:

- Static validation for formatting, schema, or lint rules.
- Unit tests or golden fixtures for expected behavior.
- Reviewer prompts focused on acceptance criteria and regressions.
- Handoff notes that make the next session cheaper.

### Step 4 — Add memory and artifacts deliberately

Use durable artifacts for facts that should survive sessions:

| Artifact | Contents |
|---|---|
| `AGENTS.md` or `CLAUDE.md` | Project conventions and safety rules. |
| Decision records | Why a design or tradeoff was chosen. |
| Eval fixtures | Inputs and expected outputs for recurring tasks. |
| Handoff notes | What changed, what failed, and what remains. |

### Step 5 — Measure the harness, not just the model

Track metrics that the team can improve without changing models:

- Time from issue pick to reviewed PR.
- Percentage of tasks passing checks on the first run.
- Rework caused by missing context.
- Commands blocked by policy.
- Follow-up issues created after merge.

## Best Practices

### Do

- ✅ Treat prompts, config, tests, and handoffs as production assets.
- ✅ Keep the agent's default context small and high signal.
- ✅ Use checklists and evals before increasing autonomy.
- ✅ Separate planner, implementer, reviewer, and release responsibilities when tasks grow.
- ✅ Record failures as harness improvements, not just model mistakes.
- ✅ Make rollback and checkpointing part of the loop.

### Don't

- ❌ Assume a stronger model fixes unclear tools or missing tests.
- ❌ Hide critical constraints in one-off chat messages.
- ❌ Give broad filesystem, network, or deployment access without policy gates.
- ❌ Optimize for impressive demos instead of repeatable outcomes.
- ❌ Let long-running agents continue without resumable state and handoff artifacts.

## Quick Command Reference

| Command or artifact | Use |
|---|---|
| `.agent-harness/context/project.md` | Durable project facts and constraints. |
| `.agent-harness/evals/checklist.md` | Human and script checks for done-ness. |
| `.agent-harness/runbooks/issue-loop.md` | Repeatable workflow for issue resolution. |
| `git diff --check` | Cheap whitespace and patch sanity check. |
| `pnpm test` | Example project-level feedback loop. |
| `gh issue view <n> --json ...` | Structured issue input without parsing prose output. |

## Expected Outcomes

After setup, you should have:

- A documented harness that defines context, tools, state, and feedback.
- A repeatable issue loop for planning, implementation, review, and handoff.
- Fast checks that catch common agent mistakes before human review.
- Durable artifacts that survive context-window resets and agent restarts.
- Metrics that guide harness improvements over time.

## Reference

<details>
<summary>Sources & deeper reading</summary>

- [OpenAI: Harness engineering](https://openai.com/index/harness-engineering/)
- [Anthropic: Effective harnesses for long-running agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)
- [LangChain: The anatomy of an agent harness](https://www.langchain.com/blog/the-anatomy-of-an-agent-harness)
- [Martin Fowler: Harness engineering for coding agent users](https://martinfowler.com/articles/harness-engineering.html)
- [Contributor tutorial](https://github.com/luongnv89/awesome-cheatsheets/blob/main/docs/contributing.md)
- [Related: Claude Code cheatsheet](https://github.com/luongnv89/awesome-cheatsheets/blob/main/src/content/cheatsheets/claude-code/claude-code.md)
- [Related: Codex cheatsheet](https://github.com/luongnv89/awesome-cheatsheets/blob/main/src/content/cheatsheets/codex/codex.md)
- [Related: Hermes Agent cheatsheet](https://github.com/luongnv89/awesome-cheatsheets/blob/main/src/content/cheatsheets/hermes-agent/hermes-agent.md)

</details>
