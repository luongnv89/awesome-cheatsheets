# `cheatsheet-scribe` fixtures

Real-world author drafts used as inputs when developing and testing the
`cheatsheet-scribe` Claude Code skill.

## Layout
- `inputs/<slug>.md` — verbatim author draft. Frontmatter on each fixture records
  `fixture_id`, `captured_at`, `source`, `target_slug`, `target_category`, and
  `notes` (scribe-relevant observations the skill must handle).
- `expected/<slug>.md` *(future)* — the lint-clean cheatsheet a competent scribe
  should produce from the matching `inputs/<slug>.md`. Used as a snapshot test.

## Why these exist
The scribe contract (see `idea.md` → "Authoring Workflow") forbids fabricating
content. Several real drafts contain noise, internal inconsistency, or sections
the template does not define. The skill is judged on how it handles those —
ideally by surfacing them as targeted review questions, not by silently picking
a side or generating filler.

## Adding a new fixture
1. Save the raw draft to `inputs/<slug>.md` verbatim under a markdown body
   following the YAML frontmatter.
2. In `notes:`, list the *scribe-relevant* hazards: missing sections, noise to
   filter, internal contradictions, ambiguous names, etc. Be specific.
3. Do **not** sanitize the draft. The whole point is to test against messy
   real-world input.

## Current fixtures
- `inputs/hermes-agent.md` — Hermes Agent (NousResearch) optimization guide.
  **Paired with a hand-authored expected output** at
  `../cheatsheets/hermes-agent/hermes-agent.md` — this is the scribe's primary
  acceptance test (regenerate equivalent structure from this draft).
  Hazards: numbered steps that must be regrouped (not preserved verbatim),
  "Why?" rationale blocks that must survive as blockquotes, community `curl …
  | sudo bash` one-liner that needs framing as community-resource (not
  recommendation), gap detection (the expected output adds a "vs alternatives"
  comparison the draft does not contain — scribe must ask, not invent).
- `inputs/pi.md` — Pi (pi.dev) terminal coding agent. Hazards: irrelevant
  "10 popular X posts" section, internal contradiction on sub-agents/plan-mode,
  ambiguous `AGENTS.md` vs `SYSTEM.md`, paragraph-form best practices that need
  splitting into Do/Don't.
