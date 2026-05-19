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
git add src/content/cheatsheets/hermes-agent/hermes-agent.md
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
2. CI runs `pnpm check:no-cdn` against `dist/` to enforce the no-external-CDN rule
3. Maintainers may suggest tweaks
4. Once green, your cheatsheet joins the catalog

---

## No external CDNs

The published site ships with **zero** third-party CDN dependencies for content, styling, and behaviour. All CSS, JS, fonts, and images must be either bundled by the Astro build or served from the same origin. This is a hard requirement (PRD §3 M7 / §5 Security & Privacy / §9 R7) and is enforced by a build-time gate.

**One documented exception:** Google Analytics (`googletagmanager.com`). It is gated by an explicit cookie-consent banner (default-deny), so no GA script is loaded until the visitor clicks Accept. Decline is persisted, so the banner does not re-appear. The no-CDN gate intentionally does not enumerate the GA host because the consent gating makes the dependency conditional rather than baseline.

**Why:** privacy (the baseline page load makes no third-party requests, so the visitor's IP is not leaked to a tracker unless they opt in), offline-first (the site keeps working on flaky networks), and supply-chain hygiene (no remote script can be tampered with after we ship — and GA only runs if the visitor consented).

**Hosts blocked by the gate:**

- `https://cdn.*` (generic CDN subdomains)
- `https://unpkg.com`
- `https://cdnjs.*`
- `https://fonts.googleapis.com`, `https://fonts.gstatic.com`
- `https://maxcdn.*`
- `https://ajax.googleapis.com`
- `https://*.jsdelivr.net`
- `https://stackpath.bootstrapcdn.com`

**Run the check locally:**

```bash
pnpm build           # produce dist/
pnpm check:no-cdn    # scan dist/ for CDN URLs
```

If the gate fires, it prints the offending `file:line: url`. Either remove the dependency or self-host the asset (drop fonts into `public/fonts/`, vendor JS into `src/`, copy CSS).

> The check only scans `dist/`, never source. A markdown cheatsheet may quote a CDN URL inside a code block as documentation — that's rendered as visible text. If the *rendered* HTML contains a CDN URL (e.g., as the `href` of a link), the gate will flag it; rewrite the example to be self-hosted or escape the URL so it isn't parsed as a link.

---

## Deployment to GitHub Pages

The site auto-deploys to `https://luongnv89.github.io/awesome-cheatsheets/` on every push to `main` via `.github/workflows/deploy.yml`. The workflow builds with `pnpm build` (which runs `astro build` and generates the pagefind index), uploads `dist/` as a Pages artifact, then calls `actions/deploy-pages@v4` to publish.

**One-time repository setup (maintainer only):**

1. Open **Settings → Pages**
2. Under **Build and deployment → Source**, select **GitHub Actions**
3. Save

That's it — no branch, no `gh-pages`, no `peaceiris` fallback. The workflow handles the rest.

**Concurrency:** the workflow uses the GitHub-canonical `pages` concurrency group with `cancel-in-progress: false`. Overlapping pushes to `main` queue rather than cancel, so an in-flight write to Pages always completes.

**Permissions:** the workflow declares `contents: read`, `pages: write`, `id-token: write` at the workflow level. The first two are required by `actions/deploy-pages`; `id-token` enables OIDC attestation of the artifact.

**Manual re-deploy:** the workflow also accepts `workflow_dispatch`, so a maintainer can re-run from the Actions tab without pushing a commit.

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

*See also: [cheatsheet-scribe SKILL.md](/skills/cheatsheet-scribe/SKILL.md)*