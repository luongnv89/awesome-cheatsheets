# Scribe Run: Pi Dev (first production use)

**Run date:** 2026-05-19
**Issue:** [#28](https://github.com/luongnv89/awesome-cheatsheets/issues/28)
**Skill:** [`cheatsheet-scribe`](../skills/cheatsheet-scribe/SKILL.md)
**Input fixture:** `2026_05_18_awesome_ai_cheatsheets/scribe-fixtures/inputs/pi.md` (`fixture_id: pi-draft-v1`, captured 2026-05-18)
**Output:** [`src/content/cheatsheets/pi-dev/pi-dev.md`](../src/content/cheatsheets/pi-dev/pi-dev.md)
**Mode:** Inline — followed `SKILL.md` Steps 1–7 within the resolver session; no separate scribe subagent spawned.

> This document is the preserved transcript required by issue #28 AC#4 (*"Authored via `/cheatsheet-scribe` from a draft (not by hand) — transcript preserved in `docs/scribe-pi-run.md`"*). Manual-override moments are captured separately in [`scribe-retro-1.md`](./scribe-retro-1.md) (AC#6).

---

## Step 1 — Gather requirements

The scribe normally asks the contributor for topic, target audience, and draft. All three were resolved up-front from existing repo state:

| Input | Source | Value |
|---|---|---|
| Topic | issue #28 + idea.md | Pi (pi.dev) — minimal, extensible terminal-based AI coding agent |
| Target audience | derived from draft | Developers who want a CLI coding agent without baked-in opinions |
| Draft content | `scribe-fixtures/inputs/pi.md` | Verbatim author draft (12 numbered steps + 10 social-popularity items + reference list) |

**Safety check:** the SKILL.md *"No Fabrication"* rule was applied — every command, flag, file path, and URL in the output traces to the draft or the official site referenced in the draft. No commands invented; no URLs added beyond what the draft listed.

## Step 1.5 — Check for existing cheatsheet

```bash
ls src/content/cheatsheets/
# → hermes-agent
ls src/content/cheatsheets/pi-dev/ 2>&1
# → No such file or directory
```

No collision. Proceeded to Step 2.

## Step 2 — Apply the template contract

Validator source of truth: `tools/template-contract.ts` + `tools/validator/rules.ts`. Live spec:

- 6 required H2 sections (locked order): `Installation`, `Step-by-Step Setup & Optimization`, `Best Practices`, `Quick Command Reference`, `Expected Outcomes`, `Reference`.
- `Reference` MUST be wrapped in `<details>`.
- One-liner: `**One-line:**` marker, ≥20 chars, between H1 and first H2.
- No section currently requires a Mermaid block (`MERMAID_RULES.requiredIn` is empty), but this run includes an optional `Mental Model` Mermaid to satisfy issue #28 AC#2 without changing the live contract.
- Frontmatter Zod schema: `slug`, `title`, `category`, `summary`, `last_updated`, `stale_after_days`, `tags`, `status`, `links.homepage`. `subcategory`, `authors`, `upstream_version` optional. Every `links.<key>` must be a valid URL.

## Step 3 — Draft the cheatsheet

### Mapping the 12-step draft onto the 6 required H2 sections

The draft's 12 numbered steps had mixed granularity (prerequisites, install, auth, first session, context, references, models, sessions, extensions, customize, advanced, best practices). The contract requires the spine `Installation → Step-by-Step Setup & Optimization → Best Practices → Quick Command Reference → Expected Outcomes → Reference`. Mapping:

| Draft step(s) | Output section |
|---|---|
| 1. Prerequisites | Installation (preamble) |
| 2. Install Pi | Installation (one-liner + npm) |
| 3. Launch and Authenticate | Installation (first run) |
| Overall Pi workflow | Optional Mental Model Mermaid (issue #28 AC#2) |
| 4. First Session | Step-by-Step Step 1 |
| 5. Add Project Context | Step-by-Step Step 2 |
| 6. Reference Files & Media + 7. Switch Models/Providers | Step-by-Step Step 3 |
| 8. Manage Sessions | Step-by-Step Step 4 |
| 9. Install Extensions/Packages/Skills | Step-by-Step Step 5 |
| 10. Customize & Optimize + 11. Advanced Usage | Step-by-Step Step 6 |
| 12. Best Practices & Optimization (paragraph) | Best Practices (split into Do / Don't / When-to-use) |
| Recurring commands across all steps | Quick Command Reference (table) |
| "What working looks like" implied by steps 1–3 | Expected Outcomes |
| Draft's "Additional resources" + verifiable URLs from the draft body | Reference (collapsed `<details>`) |

### Noise filtering

The draft included a "10 Most Popular Recent Articles/Posts on X" block (10 social-engagement entries). The template has no section for popularity / social proof. Per the fixture's own notes (*"Scribe must filter, not include"*), the entire block was dropped. None of the 10 X-handles appears in the output.

### Conflict surfacing (review questions)

The fixture flagged three internal inconsistencies that the scribe must surface rather than silently resolve. Each was decided as follows (decisions recorded in `scribe-retro-1.md`):

1. **`AGENTS.md` vs `SYSTEM.md`** — draft uses them interchangeably. Resolution: standardized on `AGENTS.md` in the output (matches the file the draft mentions first and matches the convention shown in the Hermes cheatsheet). Noted in retro.
2. **Sub-agents / plan mode "not baked-in" vs marketing lists them as features** — Resolution: stated in Step 5 that both are *extensions, not core features*, and in Best Practices noted to "review diffs, especially when sub-agents or plan mode extensions are in play". This honors the draft's explicit "not baked-in" wording.
3. **Slug `pi` (fixture) vs `pi-dev` (issue #28 AC)** — Resolution: chose `pi-dev` because the issue's acceptance criterion is the gating spec. The fixture's `target_slug: pi` is a development artifact for skill testing.

### Frontmatter choices

| Field | Value | Rationale |
|---|---|---|
| `slug` | `pi-dev` | Issue #28 AC#1 explicitly requires `cheatsheets/pi-dev/pi-dev.md` |
| `category` | `tool` | Issue #28 AC#5 mandates `category: tool` |
| `subcategory` | `coding-agent` | Free-form; positions Pi alongside Claude Code / Codex / OpenCode (idea.md tiering) |
| `status` | `poc` | Matches Hermes; first authoring via scribe — promote to `published` only after retro review |
| `stale_after_days` | `90` | Matches Hermes; Pi releases frequently |
| `upstream_version` | `"pi.dev current"` | Draft doesn't pin a specific version; "current" signals the cheatsheet tracks the latest |
| `last_updated` | `2026-05-19` | Today |
| `tags` | `[pi, pi-dev, coding-agent, cli, extensions, skills, mcp]` | 7 tags, within the 1–12 limit; covers tool name, category, and Pi-distinctive features |
| `links` | `homepage`, `docs`, `packages` | Only URLs the draft cited; no fabricated links. The npmjs URL was dropped from `links` after the validator's HEAD probe got HTTP 403 from Cloudflare's bot challenge — the package name is still in the body and References, just unlinked. |
| `authors` | `luongnv89` | Matches Hermes |

## Step 4 — Validate against contract

```bash
pnpm --silent cheatsheet:lint --no-links src/content/cheatsheets/pi-dev/pi-dev.md
# → ✓ src/content/cheatsheets/pi-dev/pi-dev.md
# → 1 file(s) passed, 0 file(s) failed of 1 total.
```

A subsequent run *with* link-check surfaced one environmental flake: the validator's plain HEAD probe got HTTP 403 from `https://www.npmjs.com/package/@earendil-works/pi-coding-agent` — Cloudflare's bot challenge. The URL is reachable in a browser. Two responses considered: (a) keep the URL and accept the flake; (b) drop the URL from `links` and unlink it in References. Chose (b) — the `links` frontmatter feeds the catalog and should be reliably reachable; the npm install command is still in the body. After the fix:

```bash
pnpm --silent cheatsheet:lint src/content/cheatsheets/pi-dev/pi-dev.md
# → ✓ src/content/cheatsheets/pi-dev/pi-dev.md
```

## Step 5 — Output

File written to `src/content/cheatsheets/pi-dev/pi-dev.md`. All 6 required H2s present in the locked order, plus the optional issue-requested `Mental Model` Mermaid; `Reference` wrapped in `<details>`; one-liner directly under H1; frontmatter passes the Zod schema.

## Step 6 — Review questions (resolved up-front)

The scribe normally pauses here for contributor approval. Because this run is the *resolver* of issue #28 (no live contributor in the loop), the four ambiguities were resolved up-front via the resolver's `AskUserQuestion` tool and via the conflict-surfacing notes above. Questions that would have been asked:

1. **Slug — `pi` vs `pi-dev`?** Resolved: `pi-dev` (issue AC is gating).
2. **Mermaid Mental Model — include or skip?** Resolved: **include as optional** — the live validator does not require Mermaid in any section, but issue #28 AC#2 explicitly asks for a mental-model Mermaid. The diagram is kept outside the required-section contract so the live 6-section validator remains authoritative while the issue AC is satisfied. Recorded in retro as a contract-vs-issue drift to fold back.
3. **`AGENTS.md` or `SYSTEM.md`?** Resolved: `AGENTS.md` (see above).
4. **Sub-agents / plan mode — feature or extension?** Resolved: extension (per draft's explicit wording).

## Step 7 — Commit message & PR title

Suggested commit:

```
docs(cheatsheet): add pi-dev cheatsheet for minimal coding agent
```

Suggested PR title:

```
docs(cheatsheet): add pi-dev cheatsheet — minimal extensible terminal coding agent (#28)
```

PR description is generated by `/issue-resolver` from the standard template.

---

## Friction notes (for retro)

See [`scribe-retro-1.md`](./scribe-retro-1.md) for the one-line entries on every manual-override moment in this run.
