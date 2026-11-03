# Output format — sections, steps, outline

Read this file before drafting (Phase 6). When the repository's template contract exists, it wins over this file; in this repository, `pnpm cheatsheet:lint` is the final judge.

## Section order

Use these sections in order unless the repo contract says otherwise:

1. `**One-line:** <short value proposition>` before the first H2
2. `## Prerequisites` — optional `- [ ]` task list, only before Installation
3. `## Installation`
4. `## Step-by-Step Setup & Optimization`
5. `## Best Practices`
6. `## Quick Command Reference`
7. `## Expected Outcomes`
8. `## Reference` with a collapsed `<details>` block

## Checklist items

- Put `- [ ]` task lists only under `## Prerequisites`, for environment requirements the reader checks off.
- Write every other actionable item as a numbered item inside a `### Step N — Title` step that ends in a `**Verify:**` line.

## Step template

Steps under `## Step-by-Step Setup & Optimization` are `### Step N — Title` H3s numbered 1..N (aim for 3–7). Every step gets a meta line and a Verify line:

````markdown
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

- One action per numbered item.
- Every command in its own fenced code block with a language tag.
- Commands copy-paste ready: no `$ ` prompts; placeholders as `<UPPER_SNAKE>`.
- `**Time:**` like `~5 min` or `1 h`; `**Level:**` one of `beginner`, `intermediate`, `advanced`.
- `**Verify:**` names an existing command's expected output (at least 10 characters).
- GitHub alerts (`> [!TIP]`, `> [!WARNING]`, …) for tips and warnings rather than bold prose.

## Basic-to-advanced outline

````markdown
## Step-by-Step Setup & Optimization

### Step 1 — Basic working setup

**Goal:** <what the reader has when done> · **Time:** ~10 min · **Level:** beginner

1. <action>:
   ```bash
   <command>
   ```

**Verify:** <command and expected output>.

### Step 2 — Daily workflow
### Step 3 — Configuration baseline
### Step 4 — Advanced optimization
### Step 5 — Maintenance and troubleshooting
````
