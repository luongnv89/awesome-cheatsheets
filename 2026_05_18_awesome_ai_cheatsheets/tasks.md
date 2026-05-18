# Tasks — awesome-cheatsheets

**Source PRD:** `prd.md` (this directory)
**Status:** v1.1 — early-launch task breakdown
**Date:** 2026-05-18
**Owner:** luongnv89

> **Launch scope change (v1.1):** Early launch trims v1 from 11 cheatsheets to **2** to ship faster.
> Launch contents:
> - Landing / catalog page
> - Cheatsheets: **Hermes Agent** (already PoC) + **Pi Dev** (authored via scribe)
> - `cheatsheet-scribe` skill
> - Full validator + full CI/CD (per user direction)
>
> Deferred from PRD v1 to Post-Launch (Sprint 6+): 9 remaining cheatsheets, comparison cheatsheet (S2), PDF print (S1), C1/C2/C3, scribe refresh mode.

---

## Sprint Overview

| Sprint | Phase | Focus | Scope | Maps to PRD §8 |
|--------|-------|-------|-------|----------------|
| **Sprint 1** | POC | Template contract + validator | MVP | Phase 0a (Weekend 1) |
| **Sprint 2** | MVP Foundation | `cheatsheet-scribe` skill + tutorial | MVP | Phase 0b (Weekend 2) |
| **Sprint 3** | MVP Site Rails | Astro + Tailwind + MDX + Mermaid + per-cheatsheet rendering | MVP | Phase 0c.1 (Weekend 3) |
| **Sprint 4** | MVP Catalog + CI/CD | Catalog + search + freshness UX + full CI/CD + no-CDN gate | MVP | Phase 0c.2 (Weekend 4) |
| **Sprint 5** | Launch Content | Pi Dev cheatsheet via scribe + cross-links | MVP | Phase 1 trimmed (Weekend 5) |
| **Sprint 6** | Launch (MVP) | Launch checklist + soft launch | MVP | Phase 3 (Weekend 6) |
| **Sprint 7** | Post-Launch / vNext | Remaining 9 cheatsheets, comparison, print, C1/C2/C3, refresh mode | Post-MVP | PRD §8 Post-MVP |

**Effort key:** S = ≤ 1 day, M = 1–2 days, L = 2–3 days. Total task count: 39 (29 MVP + 10 Post-MVP).

---

## Sprint 1 — POC: Template Contract + Validator

> **Goal:** Lock the template and ship a CLI linter that gates every future cheatsheet. Proves the core wedge (format + comparability) is enforceable. Maps to PRD §8 Phase 0a.

### Task 1.1: Lock template contract from Hermes PoC

**Description**: Codify the canonical cheatsheet contract by lifting structural rules from the existing `cheatsheets/hermes-agent/hermes-agent.md`. Produce `tools/template-contract.ts` as the single source of truth for required frontmatter fields, section order, and Mermaid block presence.

**Acceptance Criteria**:
- [ ] `tools/template-contract.ts` exports a typed contract: frontmatter shape (Zod), required section names in locked order (one-liner, mental model, setup, best practices, references), Mermaid block expectations.
- [ ] Contract documents `stale_after_days`, `last_updated`, `category`, `tags`, `title`, `slug` fields.
- [ ] Inline JSDoc comment for each contract rule cites the PRD section justifying it.

**Dependencies**: None
**PRD Reference**: §3 M1, §6.3, §10.2 (Glossary — "Cheatsheet")
**Effort**: S

---

### Task 1.2: Implement `tools/validator/` with Zod + AST + link checks

**Description**: Author the validator package consumed by both the lint CLI and the scribe skill. Exposes a single `validate(file)` function that returns structured errors with rule names. Pulls rules from `tools/template-contract.ts` — no duplicated logic.

**Acceptance Criteria**:
- [ ] `tools/validator/index.ts` exports `validate(file: string): ValidationResult` returning `{ ok, errors: { rule, message, line? }[] }`.
- [ ] Frontmatter validation uses Zod schema from `template-contract.ts` (no inline rules).
- [ ] AST walk checks for required sections in locked order; flags missing or out-of-order sections by name.
- [ ] Mermaid blocks are syntactically parsed; broken ` ```mermaid ` fences fail with a named rule.
- [ ] Broken external link check runs against http(s) URLs with a configurable timeout (default 5 s).
- [ ] Unit tests cover each rule with a passing and failing fixture.

**Dependencies**: Task 1.1
**PRD Reference**: §3 M1, §6.3 ("Validator")
**Effort**: M

---

### Task 1.3: Wire `pnpm cheatsheet:lint` CLI

**Description**: Expose the validator as a developer command. Accepts file paths or glob patterns; exits non-zero on any failure; prints failures grouped by rule name.

**Acceptance Criteria**:
- [ ] `pnpm cheatsheet:lint <path|glob>` runs and prints results to stdout.
- [ ] `pnpm cheatsheet:lint cheatsheets/hermes-agent/hermes-agent.md` exits 0 with zero warnings (PRD M1 second bullet).
- [ ] Exit code is 1 if any file fails; CI-friendly.
- [ ] `--format=json` flag emits machine-readable JSON for downstream tools.
- [ ] `package.json` scripts entry registered.

**Dependencies**: Task 1.2
**PRD Reference**: §3 M1 (acceptance bullet 1)
**Effort**: S

---

### Task 1.4: Hermes PoC regression test

**Description**: Lock the contract against drift by treating `cheatsheets/hermes-agent/hermes-agent.md` as a fixture. Any future change to the validator or contract must keep Hermes lint-clean.

**Acceptance Criteria**:
- [ ] CI step runs `pnpm cheatsheet:lint cheatsheets/hermes-agent/hermes-agent.md` and fails the build on any error.
- [ ] A snapshot test captures the current validator output (`ok: true, errors: []`) and fails if the shape changes.
- [ ] README in `tools/validator/` documents Hermes as the contract-anchor fixture.

**Dependencies**: Task 1.3
**PRD Reference**: §3 M1 (Hermes acceptance), §9 R3 (template/scribe drift mitigation)
**Effort**: S

---

## Sprint 2 — MVP Foundation: `cheatsheet-scribe` skill

> **Goal:** Make the scribe production-ready BEFORE authoring Pi Dev (Pi is the scribe's first real use; PRD §9 R2 hard gate). Maps to PRD §8 Phase 0b.

### Task 2.1: Author skill skeleton at `.claude/skills/cheatsheet-scribe/`

**Description**: Scaffold the Claude Code skill with SKILL.md (instructions), template-contract.md (canonical reference exported from `tools/template-contract.ts`), and an examples/ directory bundling the Hermes input/output pair.

**Acceptance Criteria**:
- [ ] `.claude/skills/cheatsheet-scribe/SKILL.md` exists with description, inputs, outputs, and step-by-step authoring flow.
- [ ] `template-contract.md` is generated from `tools/template-contract.ts` and stays in sync (CI check or generation script).
- [ ] `examples/` contains the Hermes draft + expected `.md` copied from `scribe-fixtures/`.
- [ ] Skill is discoverable via `/cheatsheet-scribe` slash command in a clean Claude Code checkout.

**Dependencies**: Task 1.1
**PRD Reference**: §3 M2, §6.3 ("Authoring layer"), §6.6 (repo layout)
**Effort**: M

---

### Task 2.2: Skill imports validator (single source of truth)

**Description**: The skill must call `tools/validator/validate()` to gate output rather than re-implement rules. Wire the import path and run validation inline in the skill's authoring loop.

**Acceptance Criteria**:
- [ ] Skill invokes `validate()` from `tools/validator/` after writing each draft.
- [ ] On lint failure, the skill surfaces every failure with its rule name (PRD M2 bullet 2) before asking the contributor for input.
- [ ] No validation logic is duplicated inside `SKILL.md` — the skill only orchestrates, the validator decides.
- [ ] A drift test fails if the skill's section list diverges from `template-contract.ts`.

**Dependencies**: Task 2.1, Task 1.2
**PRD Reference**: §3 M2 (bullet 2), §9 R3 (drift mitigation)
**Effort**: M

---

### Task 2.3: Skill authoring flow — review questions + commit message

**Description**: Implement the contributor-facing flow: write draft → run linter → present 2–4 *specific* review questions (not "looks good?") → suggest commit message + PR title on approval.

**Acceptance Criteria**:
- [ ] After lint passes, skill emits 2–4 review questions tied to ambiguous parts of the draft (e.g., "Confirm the install command on Linux", "Is this Mermaid edge labeled correctly?").
- [ ] Review questions are content-specific, not generic ("looks good?" is explicitly disallowed by PRD M2 bullet 1).
- [ ] On contributor approval, skill outputs a suggested conventional-commit message and PR title.
- [ ] Skill does not stage, commit, or push — those steps stay with the human (PRD §4.2 step 14).

**Dependencies**: Task 2.2
**PRD Reference**: §3 M2 (bullet 1), §4.2 (contributor flow diagram)
**Effort**: M

---

### Task 2.4: Skill safety guards — no fabrication, overwrite confirmation

**Description**: Two safety properties from PRD M2: (a) the skill MUST NOT fabricate references, commands, or facts not in the draft or in user answers; (b) overwriting an existing cheatsheet requires explicit confirmation.

**Acceptance Criteria**:
- [ ] SKILL.md instructions explicitly prohibit fabricating facts; provide concrete examples of what "fabrication" means (e.g., inventing a CLI flag).
- [ ] Skill detects when `cheatsheets/<slug>/` already exists and asks for explicit "yes, overwrite" confirmation before writing.
- [ ] A test case feeds a draft with no install command; skill must ask the contributor rather than invent one.

**Dependencies**: Task 2.3
**PRD Reference**: §3 M2 (bullets 4–5)
**Effort**: S

---

### Task 2.5: Hermes regeneration acceptance test (M2 hard gate)

**Description**: PRD M2 bullet 3 mandates: given the `scribe-fixtures/inputs/hermes-agent.md` fixture, running the scribe must produce a file that lints clean AND matches the section structure of the hand-authored `cheatsheets/hermes-agent/hermes-agent.md`. This is the hard gate before authoring Pi Dev (PRD §9 R2).

**Acceptance Criteria**:
- [ ] Test script runs the scribe against `scribe-fixtures/inputs/hermes-agent.md` and writes to a temp slug.
- [ ] Output passes `pnpm cheatsheet:lint` with zero errors.
- [ ] Output's section names and order match `cheatsheets/hermes-agent/hermes-agent.md` (structural diff, not byte-equal).
- [ ] CI step runs this test on every PR touching `.claude/skills/cheatsheet-scribe/` or `tools/`.
- [ ] **Until this test passes, Task 5.1 (Pi Dev) is blocked.**

**Dependencies**: Task 2.4
**PRD Reference**: §3 M2 (bullet 3), §9 R2 (scribe quality risk)
**Effort**: M

---

### Task 2.6: Contributor authoring tutorial

**Description**: Write the 2-page "from notes to merged cheatsheet in 30 minutes" tutorial referenced by PRD S4. Walks Persona C (Priya, the new contributor) through using the scribe end-to-end.

**Acceptance Criteria**:
- [ ] `docs/contributing.md` or equivalent exists at ≤ 2 printed pages.
- [ ] Tutorial covers: install Claude Code → invoke `/cheatsheet-scribe` → answer review questions → open PR.
- [ ] Includes a screenshot or transcript of a real run (can use Hermes fixture).
- [ ] Linked from README + scribe SKILL.md.

**Dependencies**: Task 2.5
**PRD Reference**: §3 S4, §2 (Persona C)
**Effort**: S

---

## Sprint 3 — MVP Site Rails

> **Goal:** Astro 4.x scaffold + content pipeline (MDX, build-time Mermaid) + per-cheatsheet rendering with all 8 sections in locked order. Maps to PRD §8 Phase 0c (first half).

### Task 3.1: Astro 4.x scaffold + Tailwind 3.x + vendored shadcn primitives

**Description**: Stand up the production Astro site at the repo root per PRD §6.6 layout. Tailwind configured, no `npx shadcn-ui add` at runtime — primitives are vendored into `src/components/ui/`.

**Acceptance Criteria**:
- [ ] `pnpm dev` launches the Astro dev server on localhost.
- [ ] `pnpm build` produces a `dist/` directory.
- [ ] Tailwind classes work in `.astro` files.
- [ ] `src/components/ui/` contains at least Button, Card, Badge primitives, all from local code (no CDN fetch, no runtime install).
- [ ] `astro.config.mjs` sets the GH Pages base path `/awesome-cheatsheets`.

**Dependencies**: None (parallel with Sprint 2)
**PRD Reference**: §6.2, §6.6
**Effort**: M

---

### Task 3.2: MDX content pipeline reading from `cheatsheets/<slug>/<slug>.md`

**Description**: Wire Astro content collections so each `cheatsheets/<slug>/<slug>.md` becomes a page at `/cheatsheets/<slug>/`. Frontmatter is typed against the same Zod schema used by the validator.

**Acceptance Criteria**:
- [ ] Astro content collection `cheatsheets` is defined with schema imported from `tools/template-contract.ts`.
- [ ] Hermes renders at `/cheatsheets/hermes-agent/` after build.
- [ ] Frontmatter validation errors surface at build time (build fails on invalid cheatsheet).

**Dependencies**: Task 3.1, Task 1.1
**PRD Reference**: §6.2, §6.6
**Effort**: M

---

### Task 3.3: Mermaid build-time rendering to inline SVG

**Description**: Mermaid diagrams must render at build to inline SVG — zero client-side JS, per PRD §6.2.

**Acceptance Criteria**:
- [ ] A `remark` / `rehype` plugin processes ` ```mermaid ` blocks at build and replaces with inline `<svg>`.
- [ ] Built Hermes page contains no `<script>` tag for mermaid.
- [ ] `grep -r "mermaid" dist/` finds only SVG markup, not JS imports.
- [ ] Diagrams degrade gracefully if rendering fails (build warning + fenced code fallback).

**Dependencies**: Task 3.2
**PRD Reference**: §6.2 ("Diagrams"), §5 Performance
**Effort**: M

---

### Task 3.4: Per-cheatsheet page layout with locked 8-section structure

**Description**: Implement the cheatsheet page layout enforcing the section order from PRD M4: one-liner, mental model (Mermaid), step-by-step setup/usage/optimize, best practices (Do/Don't), quick command reference, expected outcomes, references (collapsed by default).

**Acceptance Criteria**:
- [ ] `src/layouts/Cheatsheet.astro` renders all required sections in the locked order.
- [ ] References section is `<details>`-collapsed by default; expands on click without JS.
- [ ] Hermes page visually inspected: all 8 sections present in correct order.
- [ ] Each section has a semantic landmark (`<section aria-labelledby="…">`).

**Dependencies**: Task 3.3
**PRD Reference**: §3 M4
**Effort**: M

---

### Task 3.5: Freshness UX — `last_updated` chip + stale banner

**Description**: Surface the cheatsheet's `last_updated` date prominently on each page, and display a "may be stale" banner when `last_updated + stale_after_days < today`.

**Acceptance Criteria**:
- [ ] Each cheatsheet page shows a freshness chip with the `last_updated` date in absolute (YYYY-MM-DD) and relative ("3 weeks ago") form.
- [ ] When stale, a visually distinct banner appears above the one-liner with text "This cheatsheet may be stale (last updated YYYY-MM-DD)".
- [ ] Banner color contrast meets WCAG 2.1 AA (≥ 4.5:1).
- [ ] An e2e test sets `last_updated` to a date past the threshold and asserts the banner renders.

**Dependencies**: Task 3.4
**PRD Reference**: §3 M3 (bullet 2), §3 M4, §1 (Goals — freshness first-class)
**Effort**: S

---

## Sprint 4 — MVP Catalog + Full CI/CD

> **Goal:** Landing/catalog page (the launch surface) + client-side search + full CI/CD pipeline (lint + Lighthouse + no-CDN + auto-deploy). Maps to PRD §8 Phase 0c (second half).

### Task 4.1: Catalog/landing page with title, one-liner, category, tags, freshness

**Description**: Implement `/` listing every cheatsheet with title, one-liner, category, tags, and `last_updated`. **This is the launch page.** Stale entries flagged inline (PRD M3 bullet 2).

**Acceptance Criteria**:
- [ ] Catalog page lists every entry from the `cheatsheets` collection (Hermes + Pi at launch).
- [ ] Each row shows: title, one-liner summary, category, tags (as pills), `last_updated`.
- [ ] Stale entries display a "may be stale" badge in the row.
- [ ] Catalog is server-rendered at build (no client fetch).
- [ ] Page includes a hero / intro framing the wedge per PRD §1 ("format + freshness + comparability").

**Dependencies**: Task 3.5
**PRD Reference**: §3 M3, §1 (wedge framing)
**Effort**: M

---

### Task 4.2: Pagefind index + client-side search ≤ 100 ms

**Description**: Generate a Pagefind search index at build; wire a search box on the catalog page that filters results client-side. PRD M5 requires < 100 ms latency p95.

**Acceptance Criteria**:
- [ ] Pagefind runs as a build step after Astro build.
- [ ] Search box appears on catalog page; typing filters results live.
- [ ] Performance: with 2 cheatsheets indexed at launch, p95 keystroke-to-render < 100 ms on broadband.
- [ ] Pagefind assets are self-hosted in `dist/` — no external CDN.

**Dependencies**: Task 4.1
**PRD Reference**: §3 M5, §5 Performance
**Effort**: M

---

### Task 4.3: Tag and category filter pills

**Description**: Clickable tag and category pills on the catalog page filter the visible list. PRD M5 bullet 2.

**Acceptance Criteria**:
- [ ] Each unique category and tag in the corpus renders as a pill above the catalog list.
- [ ] Clicking a pill filters the list to entries matching that tag/category.
- [ ] Selected pill is visually distinct (active state) and toggleable.
- [ ] Filter state persists in the URL (e.g., `?tag=mcp`), shareable.
- [ ] Keyboard navigable per PRD §5 Accessibility.

**Dependencies**: Task 4.2
**PRD Reference**: §3 M5 (bullet 2), §5 Accessibility
**Effort**: M

---

### Task 4.4: No-CDN CI gate

**Description**: Build-time check that `dist/` contains zero external CDN URLs. PRD M7.

**Acceptance Criteria**:
- [ ] CI step runs `grep -r "https://cdn\\|https://unpkg\\|https://cdnjs" dist/` (and similar common CDN hosts) and fails on any match in HTML/CSS/JS.
- [ ] Documented in `CONTRIBUTING.md` so contributors know not to add CDN imports.
- [ ] Self-hosted Inter woff2 (or system font stack) is in place; Google Fonts CDN removed.

**Dependencies**: Task 3.4
**PRD Reference**: §3 M7, §5 Security & Privacy, §9 R7
**Effort**: S

---

### Task 4.5: GitHub Actions — lint + build + Lighthouse CI on PR

**Description**: Author `.github/workflows/ci.yml` running install → lint → build → Lighthouse CI per PRD §6.5. Must complete in ≤ 3 minutes per PRD §5 Maintainability.

**Acceptance Criteria**:
- [ ] Workflow triggers on `pull_request` and `push` to `main`.
- [ ] Steps: pnpm install (cached) → `pnpm cheatsheet:lint cheatsheets/**` → `pnpm build` → Lighthouse CI.
- [ ] Lighthouse CI gates: perf ≥ 95 desktop, ≥ 90 mobile; a11y ≥ 95.
- [ ] `npm audit` runs and fails on high/critical.
- [ ] End-to-end runtime ≤ 3 minutes on free-tier hosted runner.

**Dependencies**: Task 4.4
**PRD Reference**: §5 Performance, §5 Accessibility, §5 Maintainability, §6.5
**Effort**: M

---

### Task 4.6: GitHub Actions — auto-deploy to GitHub Pages on `main`

**Description**: `.github/workflows/deploy.yml` deploys `dist/` to GH Pages on every push to `main`. PRD M8 requires deploy within 5 minutes of merge.

**Acceptance Criteria**:
- [ ] Workflow runs on `push` to `main` only.
- [ ] Uses `actions/deploy-pages` or `peaceiris/actions-gh-pages`.
- [ ] Site live at `https://luongnv89.github.io/awesome-cheatsheets/` within 5 minutes of merge (verified by timestamp comparison).
- [ ] Concurrency group prevents overlapping deploys.

**Dependencies**: Task 4.5
**PRD Reference**: §3 M8, §6.5
**Effort**: S

---

### Task 4.7: Freshness CI cron — auto-open `needs-update` issue

**Description**: `.github/workflows/freshness.yml` runs weekly, scans all cheatsheets, opens a GitHub issue with label `needs-update` for any entry past its threshold. PRD M6.

**Acceptance Criteria**:
- [ ] Workflow `schedule: cron: weekly` (e.g., Mondays 09:00 UTC).
- [ ] Script reads each cheatsheet's frontmatter, computes `last_updated + stale_after_days < today`.
- [ ] For each stale entry, creates or updates a single GitHub issue with label `needs-update` (no duplicate spam).
- [ ] Idempotent: re-running the workflow with no new stale items creates no new issues.
- [ ] Test fixture: a deliberately-stale cheatsheet triggers an issue on a dry-run.

**Dependencies**: Task 4.6
**PRD Reference**: §3 M6, §4.3, §7 ("Stale-content count")
**Effort**: M

---

### Task 4.8: Custom 404 + `/about` page citing the wedge

**Description**: Polish pages required by PRD §8 Phase 0c launch checklist.

**Acceptance Criteria**:
- [ ] Custom `src/pages/404.astro` styled consistently with the catalog.
- [ ] `src/pages/about.astro` cites the wedge (format + freshness + comparability) and links to the contributor tutorial.
- [ ] Both pages pass Lighthouse a11y ≥ 95.

**Dependencies**: Task 4.3
**PRD Reference**: §8 Phase 0c (last bullet), §1 (wedge framing)
**Effort**: S

---

## Sprint 5 — Launch Content (Pi Dev via scribe + retro)

> **Goal:** Author Pi Dev — the scribe's first production use. Pi validates that the scribe acceptance gate (Task 2.5) holds for an unseen tool. Cross-link Hermes ↔ Pi, then run the first scribe retro **before** launching so any scribe gaps exposed by Pi are folded back into SKILL.md / fixtures rather than discovered post-HN.

### Task 5.1: Cheatsheet — Pi Dev (scribe's first real use)

**Description**: Use `/cheatsheet-scribe` to author the Pi Dev tool cheatsheet from notes/draft. **First production use of the scribe** — capture friction in a retro afterward so the post-launch wave (Sprint 7) goes smoothly.

**Acceptance Criteria**:
- [ ] `cheatsheets/pi-dev/pi-dev.md` exists, lint-clean.
- [ ] All 8 sections present; mental-model Mermaid renders correctly.
- [ ] At least 3 references with reachable URLs.
- [ ] Authored via `/cheatsheet-scribe` from a draft (not by hand) — the scribe transcript is preserved in `docs/scribe-pi-run.md`.
- [ ] Tagged consistently as `category: tool`.
- [ ] Where the scribe required manual override, write a one-line note in `docs/scribe-retro-1.md`.

**Dependencies**: Task 2.5 (scribe acceptance gate), Task 4.7 (full content pipeline operational)
**PRD Reference**: §8 Phase 1 (trimmed), §1 (launch list — Pi)
**Effort**: M

---

### Task 5.2: Hermes ↔ Pi cross-links

**Description**: Add reciprocal "see also" References between Hermes and Pi so the comparability wedge shows up immediately for early visitors.

**Acceptance Criteria**:
- [ ] Hermes cheatsheet's References section links to `/cheatsheets/pi-dev/`.
- [ ] Pi Dev cheatsheet's References section links to `/cheatsheets/hermes-agent/`.
- [ ] Both links pass the validator's broken-link check.

**Dependencies**: Task 5.1
**PRD Reference**: §1 (wedge — comparability), §8 Phase 3 (cross-link spirit)
**Effort**: S

---

### Task 5.3: Scribe retro #1 — fold Pi authoring lessons back into SKILL.md

**Description**: After Pi authoring, hold a retro: where did the scribe need human override? Fold patterns into `SKILL.md` / fixtures so the post-launch content wave (Sprint 7) needs less manual fixing. PRD §8 Phase 1 retro spirit, pulled forward so launch ships with the improved scribe.

**Acceptance Criteria**:
- [ ] Retro notes captured in `docs/scribe-retro-1.md` (extends the `docs/scribe-pi-run.md` transcript from 5.1).
- [ ] At least 1 concrete `SKILL.md` edit or new fixture committed addressing the friction.
- [ ] Re-run the Hermes acceptance test (Task 2.5) post-retro — must still pass.
- [ ] If no friction found, the doc records that finding explicitly.

**Dependencies**: Task 5.2
**PRD Reference**: §8 Phase 1, §9 R2 (scribe quality risk)
**Effort**: S

---

## Sprint 6 — Launch (MVP)

> **Goal:** Ship v1.0 with 2 cheatsheets + scribe + catalog. Maps to PRD §8 Phase 3, trimmed.

### Task 6.1: Launch checklist sweep (trimmed for early-launch scope)

**Description**: Run PRD §8 launch checklist end-to-end, scoped to early-launch contents. Gate the release on every item green.

**Acceptance Criteria**:
- [ ] Both cheatsheets (Hermes, Pi) lint-clean and rendered (`pnpm cheatsheet:lint cheatsheets/**` exits 0).
- [ ] Lighthouse CI passes on catalog page, Hermes page, Pi page, /about, 404.
- [ ] No external CDN URLs in `dist/` (Task 4.4 gate green).
- [ ] `LICENSE` (MIT), `LICENSE-CONTENT` (CC-BY 4.0), `CONTRIBUTING.md` all present and accurate.
- [ ] `cheatsheet-scribe` runs end-to-end from a clean checkout (smoke test recorded).
- [ ] Freshness CI is green and both cheatsheets have valid `last_updated`.
- [ ] README updated to reflect early-launch scope (2 cheatsheets + roadmap to 11).

**Dependencies**: Task 5.3
**PRD Reference**: §8 Launch Checklist
**Effort**: M

---

### Task 6.2: Add `good first issue` seeds for the deferred 9 cheatsheets

**Description**: Open one GitHub issue per deferred cheatsheet with `good first issue` + `help wanted` labels, signaling the post-launch roadmap and inviting contributors. Per PRD §9 R6.

**Acceptance Criteria**:
- [ ] 9 issues open, one per deferred cheatsheet (Claude Code, Codex, OpenCode, OpenClaw, Harness Engineering, Agent Skills, Sub-agents, MCP, Prompt-Eng-or-Comparison).
- [ ] Each issue links to the contributor tutorial and lists the scribe-friendly draft format.
- [ ] Issues grouped under a "v1.0 → v1.1" GitHub Milestone.

**Dependencies**: Task 6.1
**PRD Reference**: §8 Phase 3, §9 R6
**Effort**: S

---

### Task 6.3: Soft launch — HN, r/ClaudeAI, r/LocalLLaMA, X

**Description**: PRD §8 Phase 3. Post launch announcement to the channels listed; monitor first-day feedback.

**Acceptance Criteria**:
- [ ] HN submission posted; URL recorded in `docs/launch.md`.
- [ ] Reddit posts to r/ClaudeAI and r/LocalLLaMA posted; URLs recorded.
- [ ] At least one X (Twitter) thread posted.
- [ ] First-72-hour feedback triaged into GitHub issues.
- [ ] Launch announcement explicitly states the "2 cheatsheets at launch, 9 more coming" roadmap to set expectations.

**Dependencies**: Task 6.2
**PRD Reference**: §8 Phase 3
**Effort**: S

---

## Sprint 7 — Post-Launch / vNext

> **Goal:** Fill the catalog out to PRD §1's 11-cheatsheet target, then add polish features. Maps to PRD §8 "Post-MVP (vNext)" plus the deferred content from this early-launch reshape.

### Task 7.1: Cheatsheet wave 1 — Claude Code + Codex + OpenCode

**Description**: Author 3 tool cheatsheets via the scribe in parallel. Order chosen for comparability — these three are the primary "which terminal agent should I use" decision set.

**Acceptance Criteria**:
- [ ] `cheatsheets/claude-code/claude-code.md`, `cheatsheets/codex/codex.md`, `cheatsheets/opencode/opencode.md` all lint-clean.
- [ ] All cross-link to one another and to Hermes + Pi.
- [ ] Claude Code page references `hesreallyhim/awesome-claude-code` per PRD §10.1.

**Dependencies**: Task 5.3
**PRD Reference**: §8 Phase 2, §1 (launch list)
**Effort**: L
**Scope:** Post-MVP

---

### Task 7.2: Cheatsheet wave 2 — OpenClaw + Harness Engineering

**Description**: Author the remaining tool (OpenClaw) and the foundational concept cheatsheet (Harness Engineering) via the scribe.

**Acceptance Criteria**:
- [ ] `cheatsheets/openclaw/openclaw.md` and `cheatsheets/harness-engineering/harness-engineering.md` lint-clean.
- [ ] Mental models verified against upstream docs.

**Dependencies**: Task 7.1
**PRD Reference**: §8 Phase 1–2
**Effort**: M
**Scope:** Post-MVP

---

### Task 7.3: Cheatsheet wave 3 — Agent Skills + Sub-agents + MCP

**Description**: Author the three remaining concept cheatsheets via the scribe.

**Acceptance Criteria**:
- [ ] `cheatsheets/agent-skills/agent-skills.md`, `cheatsheets/sub-agents/sub-agents.md`, `cheatsheets/mcp/mcp.md` all lint-clean.
- [ ] Cross-link liberally among concept cheatsheets and to Harness Engineering.
- [ ] MCP references the MCP spec and `glama.ai/mcp/servers`.

**Dependencies**: Task 7.2
**PRD Reference**: §8 Phase 2, §10.2 (Glossary — MCP)
**Effort**: L
**Scope:** Post-MVP

---

### Task 7.4: Cheatsheet #11 — Prompt Engineering OR Comparison (PRD Q2)

**Description**: PRD §9 Q2 asks whether to replace Prompt Engineering with Comparison (S2) in v1.1. Decision skewed toward Comparison per PRD §9 ("comparison is uniquely ours").

**Acceptance Criteria**:
- [ ] Decision recorded in `docs/decisions.md` with rationale.
- [ ] Either `cheatsheets/prompt-engineering/prompt-engineering.md` OR `cheatsheets/comparison/comparison.md` exists, lint-clean.
- [ ] If Comparison: rows for the 6 tool cheatsheets and columns for the agreed axes (cost, model flexibility, sub-agents, memory, ecosystem).

**Dependencies**: Task 7.3, Task 6.1
**PRD Reference**: §9 Q2, §3 S2
**Effort**: M
**Scope:** Post-MVP

---

### Task 7.5: PDF print stylesheet (PRD S1)

**Description**: Deferred from early launch. Print-only stylesheet so any cheatsheet prints to ≤ 3 pages.

**Acceptance Criteria**:
- [ ] `@media print` styles in `src/styles/print.css`.
- [ ] Navigation, search bar, footer, freshness banner hidden in print.
- [ ] Collapsed references auto-expand in print.
- [ ] Hermes and Pi cheatsheets print to ≤ 3 pages in Chrome at default settings (A4 + US Letter).

**Dependencies**: Task 6.1
**PRD Reference**: §3 S1, §5 Compatibility
**Effort**: S
**Scope:** Post-MVP

---

### Task 7.6: Author scaffolder CLI — `pnpm new-cheatsheet <slug>`

**Description**: PRD S3. For authors not using Claude Code, provide a `pnpm new-cheatsheet <slug>` command that generates a frontmatter-valid skeleton.

**Acceptance Criteria**:
- [ ] `pnpm new-cheatsheet <slug>` creates `cheatsheets/<slug>/<slug>.md` with valid frontmatter and section headers in locked order.
- [ ] Generated file's frontmatter passes `pnpm cheatsheet:lint`.
- [ ] Refuses to overwrite an existing slug without `--force`.

**Dependencies**: Task 1.3
**PRD Reference**: §3 S3
**Effort**: S
**Scope:** Post-MVP

---

### Task 7.7: Light/dark theme toggle (PRD C1)

**Description**: Implement light/dark theme toggle. Tailwind `dark:` variants + `prefers-color-scheme` default + manual override stored in `localStorage`.

**Acceptance Criteria**:
- [ ] Toggle in header switches themes without page reload.
- [ ] Initial render respects `prefers-color-scheme` (no flash).
- [ ] Contrast ≥ 4.5:1 in both modes (PRD §5 Accessibility).

**Dependencies**: Task 6.1
**PRD Reference**: §3 C1, §5 Accessibility
**Effort**: S
**Scope:** Post-MVP

---

### Task 7.8: Per-cheatsheet GitHub Discussions link (PRD C2)

**Description**: Each cheatsheet page links to a GitHub Discussion thread for Q&A — no comments system required.

**Acceptance Criteria**:
- [ ] GitHub Discussions enabled in the repo.
- [ ] Each cheatsheet page has a "Discuss" link to a per-slug discussion thread.

**Dependencies**: Task 6.1
**PRD Reference**: §3 C2
**Effort**: S
**Scope:** Post-MVP

---

### Task 7.9: RSS feed (PRD C3)

**Description**: Emit an RSS 2.0 feed of newly added or updated cheatsheets so return-readers can subscribe.

**Acceptance Criteria**:
- [ ] `dist/rss.xml` generated at build, sorted by `last_updated` desc.
- [ ] Validates against an RSS validator.
- [ ] Linked from the site footer.

**Dependencies**: Task 6.1
**PRD Reference**: §3 C3
**Effort**: S
**Scope:** Post-MVP

---

### Task 7.10: Scribe "refresh mode" — propose updates for stale entries

**Description**: PRD §8 Post-MVP. Given a stale cheatsheet, the scribe proposes targeted updates rather than rewriting from scratch. Reduces freshness-treadmill cost (PRD §9 R1).

**Acceptance Criteria**:
- [ ] `cheatsheet-scribe` accepts a `--refresh <slug>` flow.
- [ ] In refresh mode, the skill loads the existing file, identifies sections likely stale (versions, install commands), and proposes diffs the contributor can accept/reject.
- [ ] Does NOT rewrite untouched sections.
- [ ] Hermes refresh smoke test: feed a Hermes file with old `last_updated`; skill proposes targeted updates only.

**Dependencies**: Task 5.3
**PRD Reference**: §8 Post-MVP, §9 R1
**Effort**: L
**Scope:** Post-MVP

---

## Dependency Table

| Task | Depends On | Blocks | Wave |
|------|------------|--------|------|
| 1.1 | — | 1.2, 2.1, 3.2 | 1 |
| 1.2 | 1.1 | 1.3, 2.2 | 2 |
| 1.3 | 1.2 | 1.4, 7.6 | 3 |
| 1.4 | 1.3 | — | 4 |
| 2.1 | 1.1 | 2.2 | 2 |
| 2.2 | 2.1, 1.2 | 2.3 | 3 |
| 2.3 | 2.2 | 2.4 | 4 |
| 2.4 | 2.3 | 2.5 | 5 |
| 2.5 | 2.4 | 2.6, 5.1 | 6 |
| 2.6 | 2.5 | — | 7 |
| 3.1 | — | 3.2 | 1 |
| 3.2 | 3.1, 1.1 | 3.3 | 2 |
| 3.3 | 3.2 | 3.4 | 3 |
| 3.4 | 3.3 | 3.5, 4.4 | 4 |
| 3.5 | 3.4 | 4.1 | 5 |
| 4.1 | 3.5 | 4.2 | 6 |
| 4.2 | 4.1 | 4.3 | 7 |
| 4.3 | 4.2 | 4.8 | 8 |
| 4.4 | 3.4 | 4.5 | 5 |
| 4.5 | 4.4 | 4.6 | 6 |
| 4.6 | 4.5 | 4.7 | 7 |
| 4.7 | 4.6 | 5.1 | 8 |
| 4.8 | 4.3 | — | 9 |
| 5.1 | 2.5, 4.7 | 5.2 | 9 |
| 5.2 | 5.1 | 5.3 | 10 |
| 5.3 | 5.2 | 6.1, 7.1, 7.10 | 11 |
| 6.1 | 5.3 | 6.2, 7.4, 7.5, 7.7, 7.8, 7.9 | 12 |
| 6.2 | 6.1 | 6.3 | 13 |
| 6.3 | 6.2 | — | 14 |
| 7.1 | 5.3 | 7.2 | 12 |
| 7.2 | 7.1 | 7.3 | 13 |
| 7.3 | 7.2 | 7.4 | 14 |
| 7.4 | 7.3, 6.1 | — | 15 |
| 7.5 | 6.1 | — | 13 |
| 7.6 | 1.3 | — | 4 |
| 7.7 | 6.1 | — | 13 |
| 7.8 | 6.1 | — | 13 |
| 7.9 | 6.1 | — | 13 |
| 7.10 | 5.3 | — | 12 |

**No circular dependencies.** All referenced task IDs exist above.

---

## Critical Path

The critical path (longest dependency chain) through **early-launch MVP** is:

**1.1 → 3.2 → 3.3 → 3.4 → 4.4 → 4.5 → 4.6 → 4.7 → 5.1 → 5.2 → 5.3 → 6.1 → 6.2 → 6.3**

(14 tasks. Site rails — not the scribe chain — set the critical path because Task 5.1 (Pi Dev) depends on both Task 2.5 *and* Task 4.7 (Freshness CI cron), and the site-rails chain through 4.7 is longer than the scribe chain ending at 2.5.)

The scribe chain (`1.1 → 1.2 → 2.1 → 2.2 → 2.3 → 2.4 → 2.5 → 5.1 → 5.2 → 5.3 → 6.1 → 6.2 → 6.3`) is 13 tasks long and runs in parallel; if it slips, it becomes co-critical with the rails chain.

**Total MVP path estimate:** ~6 weekends (down from 8 in PRD §8) because content scope is 2 sheets instead of 11.

**Dep-graph bottleneck:** Task 4.7 (Freshness CI cron) is the proximate blocker for 5.1 on the site-rails chain. Any slippage in 4.x cascades to launch.

**Highest-risk task (separate from bottleneck):** Task 2.5 (M2 scribe acceptance gate, PRD §9 R2). Risk and bottleneck are distinct: 2.5 is the failure mode most likely to invalidate the launch plan (if the scribe can't produce a clean Pi, the whole "scribe collapses authoring cost" thesis is wrong); 4.7 is the task most likely to slip the schedule on the dep graph alone.

---

## Parallel Execution Waves (MVP only)

Tasks in the same wave can be run in parallel by independent contributors. Wave numbers correspond to the Dependency Table.

- **Wave 1:** 1.1, 3.1
- **Wave 2:** 1.2, 2.1, 3.2
- **Wave 3:** 1.3, 2.2, 3.3
- **Wave 4:** 1.4, 2.3, 3.4, 7.6 *(7.6 scaffolder CLI is Post-MVP but unblocked early)*
- **Wave 5:** 2.4, 3.5, 4.4
- **Wave 6:** 2.5, 4.1, 4.5
- **Wave 7:** 2.6, 4.2, 4.6
- **Wave 8:** 4.3, 4.7
- **Wave 9:** 4.8, 5.1
- **Wave 10:** 5.2
- **Wave 11:** 5.3 *(scribe retro #1 — pre-launch)*
- **Wave 12:** 6.1 *(launch checklist sweep; also unblocks Post-MVP 7.1 and 7.10)*
- **Wave 13:** 6.2 *(and Post-MVP 7.5, 7.7, 7.8, 7.9 unlock here)*
- **Wave 14:** 6.3 *(soft launch)*
- **Waves 15+:** Post-MVP content waves 7.2 → 7.3 → 7.4

---

## MVP vs Post-MVP Scope Summary

**MVP / Early Launch (Sprints 1–6, 29 tasks):**
- Sprint 1 — Template contract + validator (4 tasks)
- Sprint 2 — `cheatsheet-scribe` skill + tutorial (6 tasks)
- Sprint 3 — Astro site rails + per-cheatsheet rendering (5 tasks)
- Sprint 4 — Catalog + search + full CI/CD + Freshness CI cron (8 tasks)
- Sprint 5 — Pi Dev cheatsheet (scribe's first real use) + cross-links + scribe retro (3 tasks)
- Sprint 6 — Launch checklist + good-first-issue seeding + soft launch (3 tasks)
- **Launch contents:** Catalog page, Hermes cheatsheet, Pi Dev cheatsheet, `cheatsheet-scribe` skill.

**Post-MVP / vNext (Sprint 7, 10 tasks):**
- Cheatsheet waves filling out to 11 sheets: 7.1 (Claude Code, Codex, OpenCode), 7.2 (OpenClaw, Harness Engineering), 7.3 (Agent Skills, Sub-agents, MCP), 7.4 (Prompt Eng or Comparison)
- PDF print (7.5) — PRD S1 deferred from launch
- Scaffolder CLI (7.6) — PRD S3
- Light/dark theme (7.7) — PRD C1
- GitHub Discussions per cheatsheet (7.8) — PRD C2
- RSS feed (7.9) — PRD C3
- Scribe refresh mode (7.10) — PRD §8 Post-MVP

---

## Flagged Ambiguous Requirements

These items are recorded for resolution before or during the relevant sprint. Quoted directly from PRD §9.

### Open Questions (PRD §9)

- **Q1.** *"Should the `cheatsheet-scribe` skill be its own repo or live in this repo?"* — Default = in-repo (PRD §9). **Revisit if** the skill gains reuse outside this catalog. **Affected tasks:** 2.1.
- **Q2.** *"Replace Prompt Engineering with a comparison cheatsheet (S2) in v1, or keep both?"* — Default = replace. **Decision required before Task 7.5 (deferred to post-launch).**
- **Q3.** *"Self-hosted analytics in v1 (GoatCounter) or 'no analytics' forever?"* — Default = none. **Affected tasks:** none in MVP; revisit pre-Sprint 7.
- **Q4.** *"Custom domain at launch or post-launch?"* — Default = `*.github.io`. **Affected tasks:** 4.6, 6.3 (announcement URLs).

### Assumptions (PRD §9 — re-verify if false)

- **A1.** Astro + Tailwind + shadcn-vendored remains the right stack at launch. *Re-check before Task 3.1.*
- **A2.** Pagefind handles ≤ 50 cheatsheets without UX degradation. *Trivially true at launch (2 sheets); re-check before Sprint 7 waves.*
- **A3.** The `cheatsheet-scribe` skill produces output of sufficient quality to be used unsupervised. *Hard-gated by Task 2.5; if it fails, Task 5.1 / Pi Dev cannot proceed and launch slips.*
- **A4.** GitHub Pages remains free + sufficient for static hosting. *Re-check before Task 4.6.*

### Early-launch-specific open questions

- **Q5.** Should the catalog page show a "9 more cheatsheets coming soon" placeholder roadmap, or only the 2 shipped sheets? **Recommendation:** show a "Roadmap" section below the catalog listing the deferred sheets with `good first issue` links — turns scope reduction into a contributor recruiting moment (PRD §9 R6).
- **Q6.** Should the freshness banner threshold be tighter for launch (e.g., 30 days instead of cheatsheet-specified `stale_after_days`) so the 2-sheet catalog never looks abandoned in week 4? **Recommendation:** keep per-cheatsheet `stale_after_days` and commit to a Pi refresh within 30 days of launch as a maintainer practice.

---

## Risk Watch (mirrors PRD §9)

| Risk | Most-affected tasks | Mitigation tasks |
|------|---------------------|------------------|
| R1 Maintenance treadmill | All Sprint 7 content; 4.7 | 7.10 (refresh mode); launch with 2 sheets, ramp slowly |
| R2 Scribe quality below bar | 5.1 (Pi Dev) | **2.5 is the hard gate** — no Pi Dev until green |
| R3 Template/scribe drift | 2.1, 2.2 | Single source enforced in 1.1 + 2.2 |
| R5 Bandwidth shortfall | Sprint 5–6 | Already addressed by trimming launch to 2 sheets; further fallback = ship Hermes-only and treat Pi as post-launch |
| R7 CDN purity slips | All Sprint 3 tasks | 4.4 (CI grep gate) |

---

## Revision History

| Version | Date | Author | Notes |
|---------|------|--------|-------|
| v1.0 | 2026-05-18 | luongnv89 (via Claude Code / tasks-generator skill) | Initial task breakdown derived from `prd.md` v1.0. 47 tasks across 7 sprints (Sprints 1–6 = MVP, Sprint 7 = Post-MVP) targeting PRD's full 11-cheatsheet launch. |
| v1.1 | 2026-05-18 | luongnv89 (via Claude Code / tasks-generator skill) | **Early-launch reshape.** Launch trimmed to 2 cheatsheets (Hermes + Pi via scribe) + catalog page + scribe skill + full validator + full CI/CD. 9 cheatsheets, comparison (S2), PDF print (S1), scaffolder CLI (S3), and C1/C2/C3 deferred to Sprint 7. Scribe retro pulled forward into Sprint 5 (as Task 5.3) so launch ships with the improved scribe. 39 total tasks (29 MVP + 10 Post-MVP); critical path runs through site rails (14 tasks), with the scribe chain (13 tasks) running parallel. Dep-graph bottleneck = 4.7; highest-risk task = 2.5. |
