# Evaluation guidance

Use this file when grading a docs-to-cheatsheet run, by hand or with `evals/evals.json`. Grade correctness with the Acceptance Criteria in `SKILL.md`, then grade understanding with the four checks below. Skip the understanding checks for negative-trigger evals; those only test that the skill was not applied.

## Understanding checks

Grade the output the run delivered: the Phase 5 plan when the run stops at the approval gate, otherwise the Phase 8 final response.

| Check | Pass when |
| --- | --- |
| Main result is findable | The opening lines state the status — waiting for approval, or `complete` / `partial` / `blocked` — and the output path, with no need to search the transcript. |
| Facts and assumptions are separated | Verified claims name their source page or check; uncertain or version-sensitive items and checks not run are labeled. |
| Claims are traceable | Each command and material recommendation points to an official page, a community source, or the lint result. A `--no-links` pass is not presented as a passed link check. |
| Next decision is clear | The plan asks for `approve`, or the final response says "No approval needed" (or names the approval required) and names the user's next action. |

A heading's presence alone does not pass a check; cite the output text that satisfies it.

## Human understanding

Agent grading checks only the observable conditions above; it cannot confirm that a person understood the output. Ask the user whether they could find the result, separate facts from assumptions, trace claims, and identify the next decision. Record the answers with the eval feedback. A missing, blank, or non-responsive answer leaves human understanding **unconfirmed**.
