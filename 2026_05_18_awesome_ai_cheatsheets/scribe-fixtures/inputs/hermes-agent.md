---
fixture_id: hermes-agent-draft-v1
captured_at: 2026-05-18
source: user-provided draft
target_slug: hermes-agent
target_category: tool
expected_output: ../../cheatsheets/hermes-agent/hermes-agent.md
notes: |
  Real-world author draft for Hermes Agent — used as an input fixture for
  developing and testing the `cheatsheet-scribe` skill. Verbatim from the
  authoring conversation; preserve as-is.

  This fixture is paired with the hand-authored Hermes cheatsheet at
  `cheatsheets/hermes-agent/hermes-agent.md`, which serves as the canonical
  expected output and template-contract reference. The scribe's acceptance
  test is: given this draft, produce output that lints clean and matches
  the structure of the expected file.

  Scribe-relevant observations to design against (do not edit the draft):
  - Numbered steps (8) map reasonably well to the template's setup/optimize
    spine, but step 7 ("Harden") and step 8 ("Monitor") need to fold into
    "Optimize" and "Best Practices" respectively — the scribe must regroup
    rather than preserve numbering verbatim.
  - "Why?" notes after each step are the rationale the cheatsheet uses;
    scribe must preserve them in blockquote form, not drop them.
  - Embedded `bash` and `yaml` fenced blocks must be carried through with
    copy-paste fidelity.
  - The community VPS bootstrap `curl … | sudo bash` one-liner is in the
    draft — scribe must preserve it but the *expected* output frames it
    as a community reference, not a recommendation. Verify the skill
    surfaces this framing choice as a review question.
  - Mentions a "Curator" and "self-evolution" repo — scribe must capture
    both in the mental-model diagram (feedback edges) and in the
    references section.
  - Comparison-vs-alternatives section is NOT in the draft. The expected
    output adds one (Claude Code/Codex/OpenCode/Pi/OpenClaw). Scribe
    should detect the gap and ask whether to generate the matrix, not
    silently invent or omit it.
  - "Expected outcomes after optimization" bullet list is in the draft and
    maps directly to the template's "Expected Outcomes" section.
  - Emojis: the draft ends with "🚀". The expected output drops it
    (per /Users/montimage/.claude/CLAUDE.md "no emojis unless requested").
    Scribe must default to emoji-free output.
---

# DRAFT INPUT (verbatim)

**Step-by-Step Guide to Optimize Your Hermes Agent Setup**

This guide assumes you have a basic Hermes Agent installation (via the one-line `curl` installer) running on Linux/macOS/WSL, a local machine, or VPS. It synthesizes the most effective practices from official docs and top community optimization resources as of May 2026 (v0.12+ / v0.13 era). The goal is maximum performance: persistent intelligence, lower costs, proactive workflows, self-improvement, and minimal manual effort. Start with Steps 1–3 (quick wins), then layer on the rest.

### Step 1: Update, Diagnose, and Verify Your Current Setup (5–10 minutes)
Run these to baseline and fix issues immediately:
```bash
hermes update          # Pull latest version
hermes doctor          # Diagnose config, providers, tools, memory
hermes status          # Quick health check
hermes memory status   # Check memory providers
```
- **Why?** Outdated installs miss self-evolving skills, Kanban, compression, and cost optimizations. `doctor` catches provider OAuth issues, missing tools, or memory bloat.
- **Next:** If errors appear, run `hermes setup` again and follow prompts.

**Pro tip:** Pin your version in production with `hermes config set version_pin true` for stability.

### Step 2: Optimize Configuration, Models, and Providers (Cost + Speed)
Edit `~/.hermes/config.yaml` (or use `hermes config` commands). Focus on:
- **Model routing**: Use frontier models (e.g., Claude Sonnet/Opus or GPT-4o) only for complex reasoning. Switch to fast/cheap ones (via OpenRouter or Nous Portal) for simple tasks.
  ```bash
  hermes model          # Interactive selector
  ```
- **Cost controls**: Enable `/usage` and `/insights` tracking. Set budgets in config.
- **Prompt cache preservation**: Keep `SOUL.md`, `AGENTS.md`, and memory files stable—never change mid-session.

**Quick config tweaks** (copy from OnlyTerp templates or official):
- Cost-optimized profile: Lower max tokens, enable compression defaults.
- Add to `config.yaml`:
  ```yaml
  performance:
    context_compression: true
    cache_preserve: true
  ```
**Why it optimizes**: Users report 90%+ token cost drops (e.g., $130 → $10 every few days) by routing smartly and using cache hits.

### Step 3: Enhance Persistent Memory (Compounding Intelligence)
Memory is Hermes' superpower—facts live across sessions.
- **Core files** (auto-managed but curate them):
  - `~/.hermes/memories/MEMORY.md` (agent facts, limits ~2,200 chars)
  - `~/.hermes/memories/USER.md` (your preferences, ~1,375 chars)
- **Best practices**:
  - After good sessions: Say "remember this for next time" or "save to memory that our CI uses GitHub Actions".
  - Consolidate when >80% full: Use the `memory` tool (`add`/`replace`/`remove`) with exact substring matching.
  - Add context files: Create `AGENTS.md` in project roots (coding style, architecture) and `SOUL.md` in `~/.hermes/` for personality.
- **Upgrade to advanced memory**:
  - Run `hermes memory setup` → choose Honcho or similar plugin for semantic search.
  - For graph-based recall (highly recommended): Follow OnlyTerp's LightRAG setup (clone repo, set `.env`, run server, ingest your docs/vaults via curl).

**Commands**:
```bash
hermes sessions list          # Search past convos (free FTS5)
hermes -c                     # Resume last session
```
**Why?** Memory + skills = compounding: The agent reuses solutions instead of rediscovering them.

### Step 4: Master Skills and Enable Self-Evolution (The Real Magic)
Skills turn one-off work into reusable procedures.
- **Browse/install**: `/skills` in chat or `hermes skills install <name>`.
- **Create your own** (automatic or manual):
  1. Do a complex task (5+ steps).
  2. Say "save what you just did as a skill called `deploy-staging`".
  3. Or ask directly: "Create a skill for [workflow]".
- **Maintenance**: Let the built-in **Curator** run (background merges duplicates, archives unused). Avoid skill slop by reviewing `~/.hermes/skills/`.
- **Advanced self-evolution** (new GEPA/DSPy loop): Install from the official self-evolution repo if you want fully automatic skill optimization based on execution traces.

**Pro tip**: Skills for "how" (procedures); memory for "what" (facts). Use `/deploy-staging` next time instead of explaining again.

### Step 5: Set Up Gateways and Proactive Features (24/7 Teammate)
Make it phone-accessible and autonomous.
- **Telegram (most popular)**:
  1. BotFather → new bot → token.
  2. Disable privacy mode.
  3. Get your user ID.
  4. Add to `~/.hermes/.env` and run:
     ```bash
     hermes gateway setup
     hermes gateway
     ```
- **Cron/scheduled tasks**: `hermes cron create "Daily briefing" --schedule "every 1d at 8am"`.
- **Home channel**: `/sethome` in your preferred chat for cron results.

**Why?** Turns reactive chat into proactive agent that works while you sleep.

### Step 6: Unlock Multi-Agent Orchestration with Kanban (Scale Beyond One Agent)
New in v0.12+—game changer for parallel work.
- Initialize: `hermes kanban init`
- Launch dashboard: `hermes dashboard` (http://127.0.0.1:9119)
- Create specialist profiles (e.g., researcher, coder) via config.
- Assign tasks → agents claim from board, hand off via `kanban_complete`, auto-retry on blocks.

**Best when**: You have dependencies, parallel subtasks, or role pipelines. Start simple—don't over-orchestrate early.

### Step 7: Harden Security, Deployment, and Observability
- **VPS/production**: Use OnlyTerp's one-command bootstrap:
  ```bash
  curl -sSL https://raw.githubusercontent.com/OnlyTerp/hermes-optimization-guide/main/scripts/vps-bootstrap.sh | sudo bash
  ```
  (Sets up user, firewall, Caddy, systemd, etc.)
- **Security**: Enable command approvals, sandboxing (Docker), secret redaction. Never run as root. Use `hermes config` for allowlists.
- **Monitoring**: Set up Langfuse or Helicone via templates for traces/costs.

**Templates** in OnlyTerp repo: production configs, systemd services, remote sandboxes (Modal/E2B).

### Step 8: Monitor, Iterate, and Compound (Ongoing)
- Weekly: Run `/insights`, `/usage`, review memory/skills.
- Ask agent: "Optimize my current setup" or "Clean up memory and curate skills".
- Test: Use `/compress` in long sessions; `/verbose` to watch tools.

**Expected outcomes after optimization**:
- Proactive daily workflows
- 5–10x faster repeat tasks via skills
- Lower costs + full recall
- Multi-agent coordination without chaos

Start today with Steps 1–3 (under 30 mins). Then add Telegram + one custom skill. For visuals/config templates or the full 24-part guide, check the OnlyTerp repo directly. If you hit a specific snag (e.g., your provider or use case like coding/PM), share details and I'll refine further. Your agent will literally get smarter every day from here. 🚀
