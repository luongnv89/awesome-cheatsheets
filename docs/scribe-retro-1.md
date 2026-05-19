# Scribe Retro #1 — Pi Dev authoring

**Run:** [`scribe-pi-run.md`](./scribe-pi-run.md)
**Date:** 2026-05-19
**Issue:** [#28](https://github.com/luongnv89/awesome-cheatsheets/issues/28)
**Scope of retro:** Manual-override moments during the first production use of `cheatsheet-scribe`. One-line per moment, per issue AC#6.

> Per tasks.md Task 5.3, deeper analysis (fold patterns back into `SKILL.md` / fixtures) is a separate downstream task. This file only captures the raw friction.

## Manual-override moments

1. **Slug `pi` vs `pi-dev` collision.** Fixture sets `target_slug: pi`, but issue #28 AC#1 explicitly requires `cheatsheets/pi-dev/pi-dev.md`. Override: ignored the fixture, used `pi-dev`. → Action: align the fixture's `target_slug` with whichever slug the catalog ships, or document that the fixture's target_slug is a free choice the scribe should override when an issue gates it.
2. **`AGENTS.md` vs `SYSTEM.md` ambiguity in draft.** Draft uses them interchangeably ("Create `AGENTS.md` (or `SYSTEM.md`)"). Override: picked `AGENTS.md` and dropped the alternative. → Action: when a draft offers two filenames, the scribe should ask the contributor or check the upstream docs; a deeper Pi-docs check was not performed here.
3. **Sub-agents / plan mode internal contradiction.** Draft says "not baked-in" but mentions both as Pi features. Override: stated in Step 5 and Best Practices that both are *extensions, not core features*. → Action: this matches the fixture's design intent (surface conflict), and the scribe handled it correctly by stating the position rather than silently picking a side.
4. **Mental Model Mermaid required by issue, not by validator.** Issue #28 AC#2 says "mental-model Mermaid renders correctly", but `MERMAID_RULES.requiredIn` is `[]` and the Hermes reference cheatsheet has no Mermaid. Override: skipped Mermaid per user decision in the resolver. → Action: reconcile the issue template that produced #28's AC list with the live `template-contract.ts` — one of them should change so the spec is single-source.
5. **10-item social-engagement block in draft dropped wholesale.** No section in the template carries social proof; per the fixture's own note, the scribe filtered the entire block. → Action: this worked. Future templates that want a "popular tutorials" section can break the assumption — until then, the scribe should keep dropping noise like this.
6. **Mixed-granularity 12-step list re-grouped into 6 H2 sections.** Steps 1–3 became Installation; 4–11 became the 6 Step-by-Step entries; 12 was split into Do / Don't / When-to-use. → Action: this re-grouping is the highest-value transformation the scribe performs. SKILL.md could document the canonical Hermes mapping (4 baseline tools → 8 numbered steps for Hermes, 4 baseline tools → 6 steps for Pi) as a worked example.
7. **`upstream_version: "pi.dev current"` placeholder.** Draft does not pin a Pi version. Override: used a "current" placeholder rather than fabricating a version number. → Action: when no version is pinned, the scribe should either ask, or use a placeholder and flag it as a Review Question; this run did the latter.
8. **Quick Command Reference table built by cherry-picking commands from across all 12 draft steps.** No section in the draft holds the commands together — the scribe assembled the table by hand. → Action: the scribe SKILL could include a heuristic: "extract every executable command from the draft, dedupe, then group by goal in the QCR table".
9. **Internal cross-link to Hermes.** Added `/cheatsheets/hermes-agent/` in the Reference section to seed Task 5.2 (Hermes ↔ Pi cross-links). → Action: this is forward-work for Task 5.2; not yet reciprocated on the Hermes side.
10. **Lint with `--no-links` locally; full link-check deferred to PR / CI.** The validator's HEAD probe is slow and flaky offline; we ran offline first, then the full check on PR creation. → Action: this matches Hermes' pattern; document it in the scribe SKILL as the recommended local loop.
11. **npmjs.com URL fails Cloudflare bot check on HEAD probe.** Initial frontmatter included `links.npm: https://www.npmjs.com/package/@earendil-works/pi-coding-agent`; the validator's plain HEAD probe got HTTP 403 (Cloudflare bot challenge). The URL is reachable in a browser. Override: dropped `npm` from `links` and unlinked the npmjs URL in References (kept the package name and the install command). → Action: either upgrade the validator's link probe to send a real `User-Agent` (Hermes-style cheatsheets will hit this too), or add a documented "links must be reachable to HEAD requests from a vanilla `fetch`" rule and tell authors to drop bot-blocked URLs.

## Patterns to fold back into SKILL.md / fixtures (high-level, for Task 5.3)

> Captured here as a forward pointer, not as the retro's deliverable.

- Add a worked example of the *draft-step → H2-section* re-grouping (item 6 above).
- Document the local lint loop: `--no-links` first, full check at PR (item 10).
- Strengthen the "ambiguity → review question" wording in SKILL.md Step 1 with concrete examples drawn from items 2–4 above.
- Decide the issue-template-vs-template-contract drift (item 4) — pick one source of truth for "what sections are required".

## Did the scribe meet the bar?

Yes. The scribe (executed inline per the user decision in the resolver) produced a lint-clean cheatsheet from a single user-provided draft with no fabricated commands, flags, or URLs. The 4 manual overrides (items 1–4) are all category 1 (*ambiguity surfaced, decision made and recorded*), not category 2 (*scribe missed an obvious requirement*).

The hard gate from PRD §9 R2 / Task 2.5 (*"scribe acceptance gate"*) is upheld: this run is the first piece of evidence that the scribe collapses authoring cost on an unseen tool — the next data point comes from the second non-Hermes run.
