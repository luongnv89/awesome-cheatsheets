---
title: Contributor Authoring Tutorial
description: From notes to merged cheatsheet in 30 minutes
slug: contributor-tutorial
last_updated: 2026-05-19
stale_after_days: 180
tags: [contributing, tutorial, scribe, workflow]
category: concept
status: published
links:
  homepage: https://github.com/luongnv89/awesome-cheatsheets
  repo: https://github.com/luongnv89/awesome-cheatsheets
---

**One-line:** A 30-minute walkthrough for new contributors to author a cheatsheet using Claude Code and the `/cheatsheet-scribe` skill.

---

## The 5 Steps

### 1. Install Claude Code

```bash
# macOS
brew install anthropic-cli

# Linux/WSL
curl -s https://packages.anthropic.com/apt/apt-key.gpg | sudo apt-key add -
echo "deb https://packages.anthropic.com stable main" | sudo tee /etc/apt/sources.list.d/anthropic.list
sudo apt update && sudo apt install claude-cli

claude --version  # verify
```

### 2. Invoke `/cheatsheet-scribe`

```bash
cd ~/path/to/awesome-cheatsheets
claude
```

At the prompt, type: `/cheatsheet-scribe`

The skill asks for:
1. **Topic** — What tool/concept? (e.g., "Hermes Agent")
2. **Target audience** — Who is this for?
3. **Draft content** — Any notes, docs, or outlines?

### 3. Answer Review Questions

After generating your draft, the skill presents 2–4 **specific** questions. Example:

```
1. The slug `hermes-agent` vs `hermes-agent-cli` — which is more recognized?
2. The Mental Model shows sequential flow. Should I add a branch for multi-agent?
3. Commands reference v0.13 — should I note this is current as of May 2026?
```

Answer each. The skill iterates based on your feedback.

### 4. Get Commit Message & PR Title

On approval, the skill outputs:

```
docs(cheatsheet): add hermes-agent cheatsheet — autonomous CLI/TUI AI agent with persistent memory, skills, and self-evolution
```

Copy this — it's your conventional commit and PR title.

### 5. Open the PR

```bash
git checkout -b feature/add-hermes-agent-cheatsheet
git add cheatsheets/hermes-agent/hermes-agent.md
git commit -m "docs(cheatsheet): add hermes-agent cheatsheet..."
git push -u origin feature/add-hermes-agent-cheatsheet
gh pr create --title "docs(cheatsheet): add hermes-agent cheatsheet" --body "..."
```

---

## Cheatsheet Structure

Every cheatsheet has 7 sections in locked order:

1. **One-liner** — One-sentence summary
2. **Mental Model** — Mermaid flowchart
3. **Step-by-Step Setup & Optimization** — Numbered steps
4. **Best Practices** — Do/Don't bullets
5. **Quick Command Reference** — Code examples
6. **Expected Outcomes** — What the user gets
7. **Reference** — Collapsed sources

---

## Real Example: Hermes Agent

Here's what the `/cheatsheet-scribe` flow produces (condensed):

**Input:**
> Topic: Hermes Agent — autonomous CLI/TUI AI agent  
> Audience: Users who want to optimize for cost, memory, productivity  
> Draft: Persistent memory (MEMORY.md, USER.md), skills system, multi-channel gateways, Kanban, self-evolution

**Skill output:** 327-line cheatsheet with frontmatter, Mermaid flowchart, 8 steps, Do/Don't bullets, 14 commands, expected outcomes, collapsed references.

**Review questions asked:**
1. "Slug: `hermes-agent` vs `hermes-agent-cli`?" → confirmed `hermes-agent`
2. "Add parallel agent branch in Mental Model?" → approved current design
3. "Note v0.13 is current as of May 2026?" → confirmed to add

**Final commit:**
```
docs(cheatsheet): add hermes-agent cheatsheet — autonomous CLI/TUI AI agent with persistent memory, skills, and self-evolution
```

---

## What Happens Next

1. CI runs `pnpm cheatsheet:lint` to validate your cheatsheet
2. Maintainers may suggest tweaks
3. Once green, your cheatsheet joins the catalog

---

## Quick Reference

| Step | Command |
|------|---------|
| Install | `brew install anthropic-cli` |
| Start | `claude` then `/cheatsheet-scribe` |
| Answer questions | Respond to each specific question |
| Commit | Use the suggested conventional commit |
| PR | `gh pr create` with suggested title |

**Total time:** ~30 minutes

---

*See also: [cheatsheet-scribe SKILL.md](/.claude/skills/cheatsheet-scribe/SKILL.md)*