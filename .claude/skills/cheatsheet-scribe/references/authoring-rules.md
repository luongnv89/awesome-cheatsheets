# Authoring rules — steps, commands, drafting conflicts

Read this file in Steps 2 and 3 of `SKILL.md`. `pnpm cheatsheet:lint` decides conformance; these rules keep a draft passing on the first run. Paths are relative to the repo root unless they start with `examples/`, which is inside this skill.

## Step template

Steps render as a checklist timeline on the detail page. Aim for 3–7 steps under `## Step-by-Step Setup & Optimization`, numbered `1..N` contiguously (`### Step N — Title`, em dash). Every step carries a meta line and a Verify line:

````md
### Step 1 — Install and verify

**Goal:** A working `tool` binary on PATH · **Time:** ~5 min · **Level:** beginner

1. Install:
   ```bash
   curl -fsSL https://example.dev/install.sh | sh
   ```
2. Check the version:
   ```bash
   tool --version
   ```

**Verify:** `tool --version` prints a version number.

> [!TIP]
> One-line tip that saves time.
````

## Step rules

- The meta line is one paragraph directly after the heading, segments joined by ` · `. `**Time:**` matches `~?\d+ (min|mins|minutes|h|hr|hours)`; `**Level:**` is `beginner` | `intermediate` | `advanced`.
- `**Verify:**` names the command or output that proves the step worked (at least 10 characters). Reuse a command already in the step; never invent one.
- Write one action per numbered item. Put every command in its own fenced code block with a language tag (`bash`, `toml`, …).
- Make commands copy-paste ready: no `$ ` prompts; placeholders as `<UPPER_SNAKE>`.
- Use GitHub alerts (`> [!TIP]`, `> [!WARNING]`, `> [!NOTE]`, `> [!IMPORTANT]`, `> [!CAUTION]`) for tips and warnings instead of bold prose. They render as callouts on the site and natively on GitHub.

## Quick Command Reference

Extract every verified executable command from the draft, remove duplicates, then group the commands by goal in the Quick Command Reference table.

## Drafting conflicts

Lessons from the first non-Hermes run (`docs/scribe-retro-1.md`):

- **Slug conflict** — the issue or draft names a concrete slug or path that differs from fixture metadata: use the named slug, and record the decision as a review question.
- **Two candidate concepts** — the draft offers two filenames or concepts (`AGENTS.md` vs `SYSTEM.md`, core feature vs extension): keep only the version the provided docs verify. If neither is verified, raise a review question instead of blending both.
