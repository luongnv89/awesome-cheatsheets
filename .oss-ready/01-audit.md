# OSS Ready Audit — awesome-cheatsheets

Date: 2026-05-19
Repo: `luongnv89/awesome-cheatsheets`
Remote: https://github.com/luongnv89/awesome-cheatsheets
Visibility: public
License preference confirmed by user: MIT
Security contact confirmed by user: luongnv89@gmail.com

## Summary

| Section | Done / Total | Status |
|---|---:|---|
| 1. License | 3 / 3 | PASS |
| 2. Codebase Cleanup | 4 / 5 | PARTIAL |
| 3. Repository Setup | 3 / 5 | PARTIAL |
| 4. Essential Documentation | 2 / 5 | PARTIAL |
| 5. Testing & Automation | 2 / 4 | PARTIAL |
| 6. GitHub Settings & Policies | 2 / 5 | PARTIAL |
| 7. Packaging & Installation | 1 / 3 | PARTIAL |
| 8. Final Polish & Release | 3 / 5 | PARTIAL |
| Bonus | 0 / 4 | PARTIAL |

Overall result: **PARTIAL** — the project already has strong README content, license, tests, CI, deploy workflows, labels, roadmap, and good-first-issue seeds. Remaining OSS-readiness work is mostly standard repo files/templates, discovery metadata, dependency automation, branch protection, and package metadata.

## Section 1 — License

| Item | Status | Evidence |
|---|---|---|
| Choose a standard license | done | User confirmed MIT; `README.md` states Code: MIT and Content: CC-BY 4.0. |
| Add `LICENSE` file in root | done | `LICENSE` exists. |
| License detected by GitHub | done | `gh repo view --json licenseInfo` returns `MIT License`. |

## Section 2 — Codebase Cleanup

| Item | Status | Evidence |
|---|---|---|
| Remove all secrets, keys, passwords, `.env` examples | done | Basic secret-pattern scan found only placeholders/documentation and GitHub Actions `${{ secrets.GITHUB_TOKEN }}` usage; no real secret material identified. |
| Proper `.gitignore` | done | `.gitignore` covers `node_modules/`, `dist/`, `.astro/`, test results, Lighthouse output, logs, and env files while allowing `.env.example`. |
| Consistent code style (linter + formatter run) | missing | CI has TypeScript checks, Vitest, and cheatsheet-domain lint, but no general formatter/linter such as Prettier/ESLint configured. |
| No unnecessary files | done | Generated/cache directories exist locally but are ignored and not tracked (`git ls-files` shows none under `node_modules/`, `dist/`, `.astro/`, `.lighthouseci/`, `test-results/`). |
| Sensitive history cleaned if needed | done | No current-tree evidence that history rewrite is needed; no destructive history scan was performed. |

## Section 3 — Repository Setup

| Item | Status | Evidence |
|---|---|---|
| Clear, descriptive repo name | done | `awesome-cheatsheets`. |
| One-sentence description | done | GitHub description: `AI tools and concepts cheatsheets.` |
| Relevant topics/tags added | missing | `gh repo view --json repositoryTopics` returns no topics. |
| Repository is public | done | `gh repo view --json visibility` returns `PUBLIC`. |
| Issues, Discussions, and Projects enabled | missing | Issues and Projects are enabled; Discussions are disabled. |

## Section 4 — Essential Documentation

| Item | Status | Evidence |
|---|---|---|
| Well-structured `README.md` | done | `README.md` has tagline, badges, problem statement, features, roadmap, quick start, contribution link, repository layout, and license. |
| `CONTRIBUTING.md` | done | Root `CONTRIBUTING.md` exists; detailed tutorial also exists at `docs/contributing.md`. |
| `CODE_OF_CONDUCT.md` | missing | No root `CODE_OF_CONDUCT.md`. |
| `SECURITY.md` | missing | No root `SECURITY.md`. |
| Issue & PR templates | missing | `.github/ISSUE_TEMPLATE/` and PR template are absent. |

## Section 5 — Testing & Automation

| Item | Status | Evidence |
|---|---|---|
| Unit/integration tests exist and pass | done | Vitest suites under `tools/**/__tests__`; Playwright e2e tests under `e2e/`; scripts `pnpm test` and `pnpm test:e2e`. |
| CI/CD pipeline | done | `.github/workflows/ci.yml`, `lint.yml`, `freshness.yml`, and `deploy.yml` exist. |
| Dependabot enabled | missing | `.github/dependabot.yml` is absent. |
| Code coverage reporting | missing | No coverage script/config found in `package.json`, workflows, or `vitest.config.ts`. |

## Section 6 — GitHub Settings & Policies

| Item | Status | Evidence |
|---|---|---|
| Default branch = `main` | done | `gh repo view --json defaultBranchRef` returns `main`. |
| Branch protection on `main` | missing | `gh api repos/luongnv89/awesome-cheatsheets/branches/main/protection` returns `Branch not protected`. |
| Community profile is healthy | missing | License exists, but CoC, SECURITY, and issue/PR templates are missing. |
| Clear issue labels | done | Labels include `good first issue`, `bug`, `enhancement`, `documentation`, `help wanted`, and project-specific labels. |
| Topics and description optimized | missing | Description exists; topics are empty. |

## Section 7 — Packaging & Installation

| Item | Status | Evidence |
|---|---|---|
| Easy install command in README | done | Quick start includes `git clone`, `pnpm install`, and `pnpm dev`. |
| Proper package metadata | missing | `package.json` lacks `repository`, `license`, `keywords`, `homepage`, and `bugs`; it is marked `private: true`. |
| Published to package registry, if applicable | missing | Not published; this appears to be a static site rather than a library package, so the likely remediation is to document N/A or keep private package metadata explicit. |

## Section 8 — Final Polish & Release

| Item | Status | Evidence |
|---|---|---|
| `CHANGELOG.md` or GitHub Releases | missing | No changelog found; `gh release list` returned no releases. |
| Roadmap or future plans visible | done | `README.md` contains a Roadmap section. |
| No broken links or outdated info | done | README local links checked: all existing local targets resolve. |
| At least one other maintainer | missing | GitHub collaborator query shows only `luongnv89`. |
| First issues welcoming to contributors | done | Open `good first issue` issues exist (#63–#71). |

## Bonus Items

| Item | Status | Evidence |
|---|---|---|
| Conventional commits | missing | Contributing tutorial recommends a conventional commit style, but no enforcement/config is present. |
| Architecture diagram or demo GIF in README | missing | README has brand image and live site links, but no architecture diagram or demo GIF. |
| Pre-commit hooks | missing | `.pre-commit-config.yaml` absent. |
| Funding file | missing | `.github/FUNDING.yml` absent. |

## Missing Items

1. Add a general formatter/linter configuration (Prettier and/or ESLint) and wire it into scripts/CI.
2. Add GitHub repository topics.
3. Enable Discussions or explicitly document why Discussions are disabled.
4. Add `CODE_OF_CONDUCT.md` from the OSS asset template.
5. Add `SECURITY.md` with `luongnv89@gmail.com` as contact.
6. Add issue templates and a PR template.
7. Add `.github/dependabot.yml`.
8. Add coverage reporting or document why coverage is deferred.
9. Enable branch protection on `main`.
10. Add package metadata to `package.json`.
11. Add `CHANGELOG.md` or create an initial GitHub Release.
12. Decide whether to add another maintainer or mark this optional.
13. Add optional OSS polish: conventional-commit enforcement, architecture/demo media, pre-commit hooks, funding file.

## Already Done Items

- MIT license exists and is detected by GitHub.
- Content license is documented in `LICENSE-CONTENT` and README.
- README is polished and includes badges, quick start, roadmap, contribution link, and license.
- Root `CONTRIBUTING.md` and detailed `docs/contributing.md` exist.
- TypeScript/Vitest/Playwright testing setup exists.
- CI, lint, freshness, and GitHub Pages deploy workflows exist.
- Repo is public, has a clear name and description, and uses `main` as default branch.
- Labels and good-first-issue backlog are in good shape.
- Generated build/cache artifacts are ignored and not tracked.

## Recommended Priority Order

1. Standard OSS files/templates: `CODE_OF_CONDUCT.md`, `SECURITY.md`, issue templates, PR template.
2. Repository discovery/safety: topics, Discussions decision, branch protection.
3. Dependency and quality automation: Dependabot, formatter/linter, coverage decision.
4. Project metadata/docs: package metadata, changelog, architecture/development/deployment docs.
5. Optional polish: pre-commit hooks, funding file, demo/architecture media, maintainer expansion.
