---
slug: prompt-engineering-comparison
title: Prompt Engineering Comparison — Coding Agents Cheatsheet
category: comparison
subcategory: prompting-patterns
summary: "Comparison guide for prompt engineering across coding agents: task framing, context selection, constraints, examples, evaluation, and iteration patterns."
last_updated: 2026-05-19
stale_after_days: 120
tags: [prompt-engineering, comparison, coding-agents, prompts, evaluation, context]
status: poc
authors:
  - name: luongnv89
links:
  homepage: https://platform.openai.com/docs/guides/prompt-engineering
  openai-prompting: https://developers.openai.com/api/docs/guides/prompting
  anthropic-overview: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview
  anthropic-tutorial: https://github.com/anthropics/prompt-eng-interactive-tutorial
---

# Prompt Engineering Comparison — Coding Agents Cheatsheet

**One-line:** Prompt engineering for coding agents is the practice of framing tasks with the right context, constraints, examples, tools, and evaluation loop so different agents can produce reviewable software changes.

## Installation

Prompt engineering is a technique, not an installable package. Use it inside your chosen agent: Claude Code, Codex, OpenCode, Pi, Hermes Agent, or an API-based workflow.

```md
Task: Fix the failing markdown validator test.
Context: The validator lives in tools/validator/.
Constraints: Do not change the public CLI flags.
Plan: Explain the cause, make the smallest patch, then run the focused test.
Output: Summary, files changed, tests run, and remaining risks.
```

First-run checklist:

1. Define success criteria before asking for code.
2. Attach or name the relevant files and issue.
3. State constraints and forbidden actions.
4. Require evidence: tests, diff summary, or reviewer checklist.

## Step-by-Step Setup & Optimization

### Step 1 — Compare prompt surfaces

| Surface | Strength | Prompting adjustment |
|---|---|---|
| Chat/API | Precise control over messages and examples. | Include schemas and evaluation examples. |
| Coding-agent CLI | Direct repo access and tool use. | Specify files, commands, and safety boundaries. |
| IDE agent | Tight edit/review loop. | Point at selections and ask for minimal diffs. |
| Multi-agent workflow | Parallel roles and fresh reviews. | Define handoff contracts and stop conditions. |

### Step 2 — Frame the task with boundaries

A strong coding prompt names the goal, context, constraints, and proof.

```md
Goal: Add a new cheatsheet that passes the locked template.
Context: Use skills/cheatsheet-scribe/template-contract.md and existing examples.
Constraints: Do not edit validator rules or generated files.
Proof: Run pnpm cheatsheet:lint <file> --no-links.
```

### Step 3 — Use examples when output shape matters

For code, provide a nearby file. For docs, provide the target template. For reviews, provide the expected finding format.

```md
Return findings as:
- severity: critical | high | medium | low
- file:line
- issue
- suggested fix
```

### Step 4 — Iterate with deltas, not resets

After a first answer, steer with specific deltas:

- "Keep the structure, but reduce scope to one file."
- "The test failed because the heading order changed; fix only that."
- "Classify these findings as must-fix or note."

Avoid restarting with a brand-new vague prompt after the agent has useful context.

### Step 5 — Evaluate prompts like code

Track prompt quality with observable outcomes:

- Did the agent touch only intended files?
- Did it run the requested checks?
- Were acceptance criteria satisfied?
- Did reviewers find preventable issues?
- Can another agent reproduce the workflow from the prompt?

## Best Practices

### Do

- ✅ Put success criteria and constraints near the top.
- ✅ Provide relevant files, examples, schemas, and commands.
- ✅ Ask for a plan before broad edits.
- ✅ Use explicit output formats for reviews and handoffs.
- ✅ Separate exploration prompts from implementation prompts.
- ✅ Improve prompts after failures just as you improve tests.

### Don't

- ❌ Ask for "make it better" without a target metric.
- ❌ Paste untrusted issue instructions as commands to execute.
- ❌ Mix unrelated goals, such as refactor plus feature plus dependency upgrade.
- ❌ Assume all agents interpret the same shorthand identically.
- ❌ Reward verbose reasoning when what you need is a small diff and test evidence.

## Quick Command Reference

| Prompt pattern | Use |
|---|---|
| `Goal / Context / Constraints / Proof` | Default coding-agent task frame. |
| `Plan first, wait for approval` | Risky or broad changes. |
| `Implement only step N` | Keep work reviewable and scoped. |
| `Return PASS / NEEDS_FIX` | Review-agent verdicts. |
| `Use this file as the style example` | Match local patterns. |
| `Do not edit <path>` | Hard boundary for generated or sensitive files. |
| `Run <command> and report output summary` | Evidence-backed completion. |

## Expected Outcomes

After applying these patterns, you should have:

- Prompts that transfer across different coding-agent tools.
- Smaller diffs because goals, files, and constraints are explicit.
- Better review quality through structured output contracts.
- Fewer repeated mistakes because failed prompts become improved patterns.
- A clear distinction between exploration, implementation, review, and release prompts.

## Reference

<details>
<summary>Sources & deeper reading</summary>

- [OpenAI prompt engineering guide](https://platform.openai.com/docs/guides/prompt-engineering)
- [OpenAI prompting guide](https://developers.openai.com/api/docs/guides/prompting)
- [Anthropic prompt engineering overview](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview)
- [Anthropic prompt engineering interactive tutorial](https://github.com/anthropics/prompt-eng-interactive-tutorial)
- [Contributor tutorial](https://github.com/luongnv89/awesome-cheatsheets/blob/main/docs/contributing.md)
- [Related: Claude Code cheatsheet](https://github.com/luongnv89/awesome-cheatsheets/blob/main/src/content/cheatsheets/claude-code/claude-code.md)
- [Related: Codex cheatsheet](https://github.com/luongnv89/awesome-cheatsheets/blob/main/src/content/cheatsheets/codex/codex.md)
- [Related: Sub-agents cheatsheet](https://github.com/luongnv89/awesome-cheatsheets/blob/main/src/content/cheatsheets/sub-agents/sub-agents.md)

</details>
