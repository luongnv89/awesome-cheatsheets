---
fixture_id: pi-draft-v1
captured_at: 2026-05-18
source: user-provided draft
target_slug: pi
target_category: tool
notes: |
  Real-world author draft for Pi (pi.dev) — used as an input fixture for
  developing and testing the `cheatsheet-scribe` skill. Verbatim from the
  authoring conversation; preserve as-is.

  Scribe-relevant observations to design against (do not edit the draft):
  - Mixes signal (setup steps, command list) with noise (10 X posts, popularity)
    that the template does not have a section for. Scribe must filter, not include.
  - Internally inconsistent: claims sub-agents/plan-mode are "not baked-in" but
    pi.dev marketing lists them as features. Scribe must surface the conflict
    as a review question, not silently pick a side.
  - Mentions `AGENTS.md` / `SYSTEM.md` interchangeably. Scribe must ask which
    Pi actually loads (or note both).
  - 12 numbered steps with mixed granularity (Prerequisites + Install + Auth +
    First Session ...). Scribe must regroup into the template's setup/usage/
    optimize/best-practice spine, not preserve original numbering verbatim.
  - "Best Practices" in step 12 is a paragraph; scribe must split into Do/Don't.
  - Several references are valuable (creator, podcast, official docs, blog).
    Scribe should preserve those in the collapsed References section and drop
    the rest.
---

# DRAFT INPUT (verbatim)

**Pi (pi.dev) is a minimal, extensible terminal-based AI coding agent harness.** It emphasizes customization via extensions, skills, prompt templates, themes, and packages rather than baked-in features like sub-agents or plan mode (which you can add yourself).

It supports 15+ LLM providers (Anthropic, OpenAI, OpenRouter, Ollama, etc.), runs in your project directory with tools like read/write/edit/bash (plus grep/find/ls), uses tree-structured sessions, and is highly self-modifiable.

### 10 Most Popular Recent Articles/Posts on X (Based on Engagement, Recency, and Relevance)
I prioritized posts with high likes/views that discuss setup, usage, customization, or local runs as coding/general-purpose agents (searched via X tools for terms like "pi.dev", agent, setup/install/tutorial; focused on 2026 activity). Popularity is approximate from likes/views/repots. No fabrication—only from results:

1. **Ben Davis (@davis7)** – Video on customizing Pi into his favorite coding agent (high engagement, ~500+ likes, detailed setup vid with self-modification).

2. **Patrick Loeber (@patloeber)** – Step-by-step guide for local setup with Gemma 4 26B + Pi (1K+ likes, focuses on fully local coding agent).

3. **Gergely Orosz (@GergelyOrosz)** – Podcast/discussion on Pi with creator Mario Zechner and Armin Ronacher (1K+ likes, covers philosophy and real usage).

4. **Gentleman Programming (@G_Programming)** – Release post on AI Gentle Stack with deep Pi integration (first-class support, 100+ likes).

5. **Paras Chopra (@paraschopra)** – Local setup with Qwen + Pi + sandbox (1K+ likes, agentic coding demo).

6. **Mario Zechner (@badlogicgames, Pi creator)** – Various release/customization posts (hundreds of likes each, e.g., new features).

7. **Sriram Krishnan (@sriramk)** – Switched to Pi, seeking multi-agent extensions (400+ likes).

8. **Alpha Trader (@0xAlphaTrader)** – Explainer on Pi as customizable base vs. fixed agents (workflow adaptation).

9. **YouTube mentions** (e.g., crash course by Fasani Corp., "How I Turned Pi Into the Ultimate..." by Ben Davis) – Shared in posts for practical setups.

10. **Marcin Krzyzanowski (@krzyzanowskim)** and others praising minimalism/effectiveness (hundreds of likes, comparisons to other agents).

Additional resources: Official docs (pi.dev/docs), quickstart, packages catalog, and blog post by creator on design.

### Detailed Step-by-Step Guide (12 Steps: Installation, Usage, Optimization, Best Practices)
All info drawn directly from pi.dev, official docs, and verifiable sources. Max 20 steps observed.

1. **Prerequisites** — Ensure Node.js 20+ (npm/pnpm/bun/yarn). Works on macOS/Linux/Windows (with notes), Termux, tmux recommended for sessions. Have API keys ready (Anthropic/OpenAI/etc.) or use subscriptions.

2. **Install Pi** — Run the official one-liner: `curl -fsSL https://pi.dev/install.sh | sh` (or `npm install -g @earendil-works/pi-coding-agent`). Avoid unofficial sources like Brew. Uninstall with `npm uninstall -g @earendil-works/pi-coding-agent`.

3. **Launch and Authenticate** — `cd /path/to/your/project` then `pi`. Run `/login` for subscriptions (Claude, ChatGPT, Copilot) or set env vars like `export ANTHROPIC_API_KEY=sk-ant-...` before launch. Use `~/.pi/agent/auth.json` for keys.

4. **First Session** — Type a prompt (e.g., "Summarize this repo") and press Enter. Default tools: read, write, edit, bash (+ grep/find/ls). Use `!command` for shell (output to model) or `!!command` (no context).

5. **Add Project Context** — Create `AGENTS.md` (or `SYSTEM.md`) in project root or `~/.pi/agent/` for instructions (e.g., "Run checks after edits"). Pi loads from parents/current dir. Use `/reload` after changes.

6. **Reference Files & Media** — Use `@filename` in prompts or CLI (`pi @file1 @file2 "task"`). Paste images with Ctrl+V (supports vision).

7. **Switch Models/Providers** — Use `/model`, Ctrl+L, or Ctrl+P. Supports custom via models.json or extensions. Works with Ollama for local.

8. **Manage Sessions** — Sessions are tree-structured. Use `pi -c` (continue), `/tree`, `/fork`, `/new`, `/resume`. Export with `/export` or `/share` (GitHub gist).

9. **Install Extensions/Packages/Skills** — `pi install npm:<pkg>` or `pi install git:<repo>`. Browse https://pi.dev/packages. Examples: subagents, web access, memory, guardrails. Ask Pi to build custom ones.

10. **Customize & Optimize** — Edit system prompt, add skills/prompt templates (Markdown files, invoke with `/name`), themes. Use extensions for compaction, RAG, protected paths, or self-modification. For local: Pair with LM Studio/Ollama (e.g., Gemma/Qwen).

11. **Advanced Usage** — Modes: interactive (default), `pi -p "prompt"`, `--mode json`, RPC/SDK. Steering (Enter mid-run) or follow-up (Alt+Enter). Hotkeys: Ctrl+L (model), Shift+Tab (thinking level).

12. **Best Practices & Optimization** — Start minimal; add only needed extensions (understand configs first—avoid overload). Use git/checkpoints for rollbacks. Limit context (custom compaction). Test locally for cost/privacy. Self-modify via prompts then `/reload`. Monitor usage stats via extensions. Join Discord/GitHub for community packages. Run in tmux/containers for long sessions/sandboxing. Be skeptical of output; review carefully.

This setup turns Pi into a powerful, personalized coding/general-purpose agent. For latest, always check pi.dev/docs. Experiment by asking Pi to explain or extend itself.
