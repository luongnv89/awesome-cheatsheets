# Evaluation guidance

Use this file when grading a cheatsheet-scribe run, by hand or with `evals/evals.json`. Grade correctness with the Acceptance Criteria in `SKILL.md`, then grade understanding with the four checks below. Skip the understanding checks for negative-trigger evals; those only test that the skill was not applied.

## Understanding checks (grade the Step 7 final response)

| Check | Pass when |
| --- | --- |
| Main result is findable | The first line states `complete`, `partial`, or `blocked` and the file path, with no need to search the transcript. |
| Facts and assumptions are separated | Verified items name the check behind them (lint exit code, contributor answer, provided doc); unverified items and checks not run are labeled. |
| Claims are traceable | Each material claim points to a provided source, a lint result, or a contributor answer. A `--no-links` pass is not presented as a passed link check. |
| Next decision is clear | The response says "No approval needed" (or names the approval required) and names the contributor's next action: stage, commit, and open the PR. |

A heading's presence alone does not pass a check; cite the response text that satisfies it.

## Human understanding

Agent grading checks only the observable conditions above; it cannot confirm that a person understood the output. Ask the contributor whether they could find the result, separate facts from assumptions, trace claims, and identify the next step. Record the answers with the eval feedback. A missing, blank, or non-responsive answer leaves human understanding **unconfirmed**.
