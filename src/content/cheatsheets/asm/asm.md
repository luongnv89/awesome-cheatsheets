---
slug: asm
title: ASM — Agent Skill Manager Cheatsheet
category: tool
subcategory: skill-manager
summary: Checklist-first guide to install, audit, organize, evaluate, develop, and publish portable AI agent skills with agent-skill-manager, the universal TUI and CLI for skill workflows.
last_updated: 2026-05-30
stale_after_days: 90
upstream_version: "asm v2.9.0"
tags: [asm, agent-skill-manager, skills, cli, tui, security, eval, registry, bundles]
status: published
authors:
  - name: luongnv89
links:
  homepage: https://luongnv.com/asm/
  repo: https://github.com/luongnv89/asm
  npm: https://registry.npmjs.org/agent-skill-manager
---

# ASM — Agent Skill Manager Cheatsheet

**One-line:** ASM (`agent-skill-manager`) is the universal TUI and CLI for finding, installing, auditing, deduplicating, evaluating, developing, and publishing AI agent skills across Claude Code, Codex, Pi, OpenCode, Cursor, Windsurf, and more.

## Installation

Install from the official npm package when possible. ASM requires Node.js `>=18 <23` and npm `>=9`.

```bash
npm install -g agent-skill-manager
asm --version
```

Official one-liner install:

```bash
curl -sSL https://raw.githubusercontent.com/luongnv89/agent-skill-manager/main/install.sh | bash
asm --version
```

Launch the interactive dashboard:

```bash
asm
```

If a fresh install appears stale, check for shadowed binaries:

```bash
asm doctor
which -a asm
```

## Step-by-Step Setup & Optimization

### Step 1 — Inventory your skill estate

Start by seeing what ASM can discover across global and project scopes.

```bash
asm list
asm stats
asm search "code review"
asm inspect my-skill
```

Use filters when the inventory is large:

```bash
asm list --scope global --sort location
asm list --summary
asm list --compact
asm list --group-by tool
asm list --limit 20
asm search "code review" --json
```

Use the TUI (`asm`) for exploration and the CLI for repeatable commands.

### Step 2 — Configure providers and scopes

ASM ships with 18 built-in providers enabled by default, including Claude Code, Codex, OpenClaw, Agents, Cursor, Windsurf, Cline, Roo Code, Continue, GitHub Copilot, Aider, OpenCode, Zed, Augment, Amp, Gemini CLI, Google Antigravity, and Hermes.

Open the config when you want to disable providers or add custom paths:

```bash
asm config show
asm config path
asm config edit
```

Use provider and scope flags to target exactly where a command applies:

```bash
asm list --tool claude --scope global
asm search "frontend" --tool codex --scope both
asm inspect my-skill --json
```

### Step 3 — Install skills safely

Install from the ASM Registry by bare or scoped name:

```bash
asm install code-review
asm install luongnv89/code-review
asm install code-review --no-cache
```

Install from GitHub when the skill is not in the registry:

```bash
asm install github:user/my-skill
asm install github:user/my-skill#v1.0.0 -p claude
asm install github:user/skills --path skills/code-review
asm install github:user/skills --all -p claude -y
asm install https://github.com/user/skills/tree/main/skills/agent-config
asm install github:user/skills#main:skills/agent-config
```

For private repositories, use SSH transport:

```bash
asm install github:user/private-skill --transport ssh
asm install github:user/private-skill --transport auto
```

Preview risk before install when you do not fully trust the source:

```bash
asm audit security github:user/repo
asm install github:user/repo -p claude --yes --json
```

### Step 4 — Clean, disable, update, and export

Find duplicates and remove redundant installs:

```bash
asm audit
asm audit --yes
```

Temporarily remove skills from agent discovery without deleting them:

```bash
asm disable my-skill
asm disable 'workflow*' --tool claude
asm enable my-skill
```

Keep installed skills current after reviewing changes:

```bash
asm outdated
asm update
asm update my-skill
```

Remove skills intentionally:

```bash
asm uninstall old-skill
asm uninstall old-skill --yes
```

Back up and restore your skill inventory:

```bash
asm export > skills-manifest.json
asm import skills-manifest.json
```

### Step 5 — Develop skills with a live local loop

Scaffold a new skill:

```bash
asm init my-skill
asm init my-skill -p claude
asm init my-skill --path ./skills
```

Link local skills into an agent for live development. Because `asm link` uses symlinks, edits to the source folder are visible immediately.

```bash
asm link ./my-skill -p claude
asm link ./my-skill -p codex
asm link ./skill-a ./skill-b ./skill-c -p claude
asm link ./my-skills-folder -p claude
asm link ./my-skill --name my-alias -p claude
asm link ./my-skill -p claude --force
```

Validate the install path as an end user would see it:

```bash
asm install github:you/awesome-skill
asm install github:you/awesome-skill -p claude
asm install github:you/skills --path skills/awesome-skill
asm install github:you/awesome-skill --force
asm install github:you/awesome-skill -p claude --yes --json
```

### Step 6 — Audit and evaluate skill quality

Run a security audit before publishing or installing unknown skills:

```bash
asm audit security my-skill
asm audit security ./path/to/my-skill
asm audit security --all
```

Run static quality evaluation with concrete improvement suggestions:

```bash
asm eval ./my-skill
asm eval ./my-skill --machine
asm eval ./my-skill --fix
asm eval-providers list
```

Verification checks basic index eligibility: valid frontmatter, meaningful body, no malicious patterns, and a readable skill directory with `SKILL.md`.

Quality evaluation goes deeper: structure, frontmatter, clarity, prompt engineering, context efficiency, safety, testability, and naming.

### Step 7 — Publish and distribute

Publish a GitHub-hosted skill to the ASM Registry so users can install it by name:

```bash
asm publish ./my-skill
asm publish --dry-run ./my-skill
asm publish --force ./my-skill
asm publish ./my-skill --yes --machine
```

The publish pipeline validates frontmatter, runs security audit, generates a manifest with commit SHA and skill path, then opens a PR against the ASM Registry through `gh`.

Use bundles when a workflow needs a curated set of skills:

```bash
asm bundle list --predefined
asm bundle install frontend-dev
asm bundle install ./my-bundle.json
asm bundle create my-workflow
asm bundle export my-workflow ./my-workflow.json
asm bundle show my-workflow
asm bundle remove my-workflow
```

### Step 8 — Automate with JSON and machine output

Use JSON for ad-hoc scripts and `--machine` for stable CI envelopes.

```bash
asm list --json
asm search "security" --json
asm inspect my-skill --json
asm eval ./my-skill --machine
asm publish ./my-skill --dry-run --machine
```

Use command help as the source of truth for flags on your installed version:

```bash
asm --help
asm install --help
asm audit security --help
asm eval --help
```

## Best Practices

- Use `asm` TUI for discovery, then copy the exact CLI command into scripts once the workflow stabilizes.
- Run `asm audit security` before installing from unfamiliar GitHub repos; skills can instruct agents to execute code.
- Prefer registry names for normal installs; prefer pinned Git refs for reproducible private or team workflows.
- Use `asm link` for local development and `asm install` to test the clean end-user path.
- Run `asm eval` before publishing; use `--fix` only after reviewing the proposed deterministic changes.
- Keep provider scope explicit in destructive commands: combine `--tool`, `--scope`, and `--yes` carefully.
- Use `asm disable` for conflicting or noisy skills before deleting them permanently.
- Commit and review generated skills like code: frontmatter, scripts, references, and security posture all matter.
- Use `--json` or `--machine` for CI and dashboards instead of parsing colored terminal output.
- Run `asm doctor` when installs, PATH resolution, or provider discovery looks wrong.

## Quick Command Reference

| Goal | Command |
|---|---|
| Install | `npm install -g agent-skill-manager` |
| One-liner install | `curl -sSL https://raw.githubusercontent.com/luongnv89/agent-skill-manager/main/install.sh \| bash` |
| Launch TUI | `asm` |
| Version | `asm --version` |
| Health check | `asm doctor` |
| List skills | `asm list` |
| Search skills | `asm search <query>` |
| Inspect skill | `asm inspect <skill-name>` |
| Install from registry | `asm install code-review` |
| Install scoped registry skill | `asm install author/skill` |
| Install from GitHub | `asm install github:user/repo` |
| Install subfolder skill | `asm install github:user/repo --path skills/name` |
| Install all repo skills | `asm install github:user/repo --all -y` |
| Security audit | `asm audit security <name-or-source>` |
| Duplicate audit | `asm audit` |
| Disable skill | `asm disable <target>` |
| Enable skill | `asm enable <target>` |
| Update skills | `asm update [name...]` |
| Show outdated skills | `asm outdated` |
| Remove skill | `asm uninstall <skill-name>` |
| Export inventory | `asm export > skills.json` |
| Import inventory | `asm import skills.json` |
| Scaffold skill | `asm init my-skill` |
| Link local skill | `asm link ./my-skill -p claude` |
| Evaluate quality | `asm eval ./my-skill` |
| Auto-fix quality issues | `asm eval ./my-skill --fix` |
| List eval providers | `asm eval-providers list` |
| Publish skill | `asm publish ./my-skill` |
| Dry-run publish | `asm publish --dry-run ./my-skill` |
| List bundles | `asm bundle list --predefined` |
| Install bundle | `asm bundle install frontend-dev` |
| Show config | `asm config show` |
| Edit config | `asm config edit` |
| Stable CI output | `asm eval ./my-skill --machine` |

## Expected Outcomes

- A single inventory of installed and available skills across supported AI agents.
- Fewer duplicate or conflicting skills after `asm audit`, `asm disable`, and targeted uninstall/update workflows.
- Safer installs because GitHub sources and local skills can be security-audited before use.
- Faster skill authoring through `asm init`, `asm link`, `asm inspect`, and `asm eval`.
- Registry-ready skills with verified frontmatter, meaningful instructions, audit results, and publish manifests.
- Scriptable automation through `--json` and `--machine` output.

## Reference

<details>
<summary>Sources & deeper reading</summary>

### Official sources

- [ASM web catalog](https://luongnv.com/asm/)
- [ASM GitHub repository](https://github.com/luongnv89/asm)
- npm package: `agent-skill-manager` (npmjs.com may return bot-protection HTTP 403 to link checkers; install with `npm install -g agent-skill-manager`)
- [ASM Registry](https://github.com/luongnv89/asm-registry)
- [Evaluation providers documentation](https://github.com/luongnv89/asm/blob/main/docs/eval-providers.md)
- [Security policy](https://github.com/luongnv89/asm/blob/main/SECURITY.md)
- [Changelog](https://github.com/luongnv89/asm/blob/main/docs/CHANGELOG.md)

### Broader skill-quality context

- [Agent Skills specification](https://agentskills.io/specification)
- [Microsoft Agent Skills documentation](https://learn.microsoft.com/en-us/agent-framework/agents/skills)
- [skill-insp: A Skill That Scores Other Skills](https://dev.to/conanttu/skill-insp-a-skill-that-scores-other-skills-3gga)

</details>
