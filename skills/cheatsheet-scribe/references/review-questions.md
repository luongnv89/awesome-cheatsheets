# Review questions (Step 6)

After the lint passes, ask **2–4 review questions** tied to ambiguous or opinion-driven parts of the draft.

## Requirements

- Every question is content-specific. Generic questions ("looks good?", "is this okay?") are disallowed (PRD M2, bullet 1).
- Every question targets one decision point where the contributor's input changes the cheatsheet.

## Ambiguity types to scan for

1. **Naming** — unclear slug, title, or tag choices.
2. **Scope** — a section covers too much or too little.
3. **Technical** — command correctness, version currency, best-practice validity.
4. **Audience** — the content assumes the wrong skill level.
5. **Completeness** — missing edge cases, alternative workflows, or reference links.

## Examples

❌ "Does this look good?"
❌ "Is the cheatsheet ready?"

✅ "The slug `ollama-run` vs `ollama-cli` — which is more widely recognized in the community?"
✅ "The Installation block shows the curl one-liner — is there a Homebrew formula or apt repo I should add as an alternative?"
✅ "The `run` commands reference v0.1.2 — should I note that v0.1.3 is the latest stable?"
✅ "This cheatsheet assumes Linux. Should I add a note for macOS/Windows users?"

## Output format

```
## Review Questions

1. [specific question about naming/slug/tags]
2. [specific question about technical accuracy]
3. [specific question about scope/completeness]
4. [specific question about audience/assumptions]

Please confirm each item or suggest alternatives before I finalize.
```

Wait for the contributor's response. If they request changes, edit the draft, re-run the Step 4 lint, and present the open questions again.
