# Branch Cleanup Plan — awesome-cheatsheets

Date: 2026-05-19
Base branch: `main`
Remote: `origin` (`git@github.com:luongnv89/awesome-cheatsheets.git`)

## Summary

| Metric | Count |
|---|---:|
| Local branches | 1 |
| Remote branches | 11 including `origin/main`; 10 cleanup candidates |
| Merged / safe to delete | 10 |
| Unmerged / needs review | 0 |
| Stale (>90 days) | 0 |
| Active recent | 0 cleanup candidates |
| Protected | 1 (`main`) |

Result: **PARTIAL — needs user decisions**

Notes:
- All cleanup candidates are **remote-only** branches under `origin/*`; there are no local feature branches.
- `git branch --merged main` does not list the feature branches because the repository appears to have used squash/rebase merges. However, each candidate maps to a GitHub PR with state `MERGED`, so the proposed action is remote branch deletion.
- No open PRs were found.

## Protected — do not touch

| Branch | Scope | Last commit | Author | Ahead / behind vs main | Evidence | Proposed action |
|---|---|---|---|---:|---|---|
| `main` | local + remote | 2026-05-19 16:08 +0200 `d9f4ddb` | Luong NGUYEN | 0 / 0 | default branch | Keep |

## Merged / safe to delete — requires user approval

| Branch | Scope | Last commit | Author | Ahead / behind vs main | Merged PR | Proposed action |
|---|---|---|---|---:|---|---|
| `origin/docs/29-launch-readiness-sweep` | remote | 2026-05-19 16:07 +0200 `b9fb702` | Luong NGUYEN | 1 / 1 | [#62](https://github.com/luongnv89/awesome-cheatsheets/pull/62) merged 2026-05-19 | Delete remote branch |
| `origin/docs/57-readme-landing-page` | remote | 2026-05-19 12:43 +0200 `2e20f58` | Luong NGUYEN | 16 / 1 | [#60](https://github.com/luongnv89/awesome-cheatsheets/pull/60) merged 2026-05-19 | Delete remote branch |
| `origin/feat/1-template-contract` | remote | 2026-05-18 23:17 +0200 `8bed625` | Luong NGUYEN | 42 / 2 | [#5](https://github.com/luongnv89/awesome-cheatsheets/pull/5) merged 2026-05-18 | Delete remote branch |
| `origin/feat/2-validator` | remote | 2026-05-18 23:37 +0200 `7b4dc53` | Luong NGUYEN | 41 / 1 | [#6](https://github.com/luongnv89/awesome-cheatsheets/pull/6) merged 2026-05-18 | Delete remote branch |
| `origin/feat/28-pi-dev-cheatsheet` | remote | 2026-05-19 15:58 +0200 `eb341df` | Luong NGUYEN | 2 / 2 | [#61](https://github.com/luongnv89/awesome-cheatsheets/pull/61) merged 2026-05-19 | Delete remote branch |
| `origin/feat/3-lint-cli` | remote | 2026-05-18 23:49 +0200 `414f828` | Luong NGUYEN | 40 / 1 | [#7](https://github.com/luongnv89/awesome-cheatsheets/pull/7) merged 2026-05-18 | Delete remote branch |
| `origin/feat/55-brand-logo-assets` | remote | 2026-05-19 12:20 +0200 `2637f09` | Luong NGUYEN | 19 / 1 | [#58](https://github.com/luongnv89/awesome-cheatsheets/pull/58) merged 2026-05-19 | Delete remote branch |
| `origin/feat/56-website-redesign` | remote | 2026-05-19 12:35 +0200 `d42f90d` | Luong NGUYEN | 17 / 1 | [#59](https://github.com/luongnv89/awesome-cheatsheets/pull/59) merged 2026-05-19 | Delete remote branch |
| `origin/feature/issue-11-review-questions-commit-message` | remote | 2026-05-19 08:17 +0200 `f0a7e98` | Luong NGUYEN | 36 / 1 | [#36](https://github.com/luongnv89/awesome-cheatsheets/pull/36) merged 2026-05-19 | Delete remote branch |
| `origin/test/4-hermes-regression` | remote | 2026-05-18 23:59 +0200 `a9a1e73` | Luong NGUYEN | 39 / 1 | [#8](https://github.com/luongnv89/awesome-cheatsheets/pull/8) merged 2026-05-18 | Delete remote branch |

## Unmerged / needs review

None.

## Stale (>90 days)

None.

## Action log

No actions executed yet. Awaiting per-branch user approval.

## Executed actions

Approved by user on 2026-05-19 with exact per-branch confirmations.

| Branch | Action | Result |
|---|---|---|
| `origin/docs/29-launch-readiness-sweep` | `git push origin --delete docs/29-launch-readiness-sweep` | failed (1): error: unable to delete 'docs/29-launch-readiness-sweep': remote ref does not exist error: failed to push some refs to 'github.com:luongnv89/awesome-cheatsheets.git' |
| `origin/docs/57-readme-landing-page` | `git push origin --delete docs/57-readme-landing-page` | failed (1): error: unable to delete 'docs/57-readme-landing-page': remote ref does not exist error: failed to push some refs to 'github.com:luongnv89/awesome-cheatsheets.git' |
| `origin/feat/1-template-contract` | `git push origin --delete feat/1-template-contract` | failed (1): error: unable to delete 'feat/1-template-contract': remote ref does not exist error: failed to push some refs to 'github.com:luongnv89/awesome-cheatsheets.git' |
| `origin/feat/2-validator` | `git push origin --delete feat/2-validator` | failed (1): error: unable to delete 'feat/2-validator': remote ref does not exist error: failed to push some refs to 'github.com:luongnv89/awesome-cheatsheets.git' |
| `origin/feat/28-pi-dev-cheatsheet` | `git push origin --delete feat/28-pi-dev-cheatsheet` | failed (1): error: unable to delete 'feat/28-pi-dev-cheatsheet': remote ref does not exist error: failed to push some refs to 'github.com:luongnv89/awesome-cheatsheets.git' |
| `origin/feat/3-lint-cli` | `git push origin --delete feat/3-lint-cli` | failed (1): error: unable to delete 'feat/3-lint-cli': remote ref does not exist error: failed to push some refs to 'github.com:luongnv89/awesome-cheatsheets.git' |
| `origin/feat/55-brand-logo-assets` | `git push origin --delete feat/55-brand-logo-assets` | failed (1): error: unable to delete 'feat/55-brand-logo-assets': remote ref does not exist error: failed to push some refs to 'github.com:luongnv89/awesome-cheatsheets.git' |
| `origin/feat/56-website-redesign` | `git push origin --delete feat/56-website-redesign` | failed (1): error: unable to delete 'feat/56-website-redesign': remote ref does not exist error: failed to push some refs to 'github.com:luongnv89/awesome-cheatsheets.git' |
| `origin/feature/issue-11-review-questions-commit-message` | `git push origin --delete feature/issue-11-review-questions-commit-message` | success |
| `origin/test/4-hermes-regression` | `git push origin --delete test/4-hermes-regression` | failed (1): error: unable to delete 'test/4-hermes-regression': remote ref does not exist error: failed to push some refs to 'github.com:luongnv89/awesome-cheatsheets.git' |

## Post-action reconciliation

After the delete attempts, `git fetch --prune origin` showed that nine candidate remote-tracking refs were already absent on GitHub and were pruned locally. One branch (`feature/issue-11-review-questions-commit-message`) was deleted successfully by `git push origin --delete`.

Final verification:

```text
* main
  remotes/origin/HEAD -> origin/main
  remotes/origin/main
```

`git branch -a` now shows only local `main`, `origin/HEAD -> origin/main`, and `origin/main`.
