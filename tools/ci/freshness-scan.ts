/**
 * Freshness CI scanner — resolves issue #26 (Task 4.7, PRD M6 §7).
 *
 * Runs from `.github/workflows/freshness.yml` on a weekly cron (Mondays
 * 09:00 UTC) and on manual `workflow_dispatch`. The job iterates every
 * cheatsheet under `src/content/cheatsheets/<slug>/<slug>.md`, parses the
 * YAML frontmatter, computes staleness via the shared
 * `tools/utils/freshness.ts#isStale` predicate (the single source of truth
 * also used by the catalog and the cheatsheet layout), and — for each stale
 * entry — opens or skips a GitHub issue labelled `needs-update`.
 *
 * Module layout (split for issue #134 / F-CLEAN-005):
 *   - `./freshness-core.ts`       — types, `parseFrontmatter`, `scanContent`,
 *                                 and the issue title/body format (pure).
 *   - `./github-rest-client.ts`   — `GhClient` seam + `makeRestClient`, the
 *                                 only network-aware piece.
 *   - this file                   — CLI entry point, `getGhRepo`, and the
 *                                 `run()` orchestrator.
 *   Everything previously exported from here is re-exported below so
 *   existing consumers (tests import `../freshness-scan.js`) are unchanged.
 *
 * Idempotency:
 *   Before creating an issue we search OPEN issues with label `needs-update`
 *   whose title contains the slug. If one exists we skip — the cron never
 *   double-files. Closing the existing issue (when the cheatsheet is
 *   refreshed) re-enables filing a new one on the next stale event.
 *
 * Dry-run / test mode:
 *   `--dry-run` (or `FRESHNESS_DRY_RUN=1`) prints intent without writing.
 *   `CONTENT_DIR=…` points the scanner at an isolated fixture directory so
 *   the vitest suite can exercise the staleness + duplicate logic without
 *   touching the real `src/content/cheatsheets/` tree.
 *
 * GitHub API:
 *   When not in dry-run, the scanner uses the REST API directly via the
 *   built-in `fetch`. `GITHUB_TOKEN` (provided automatically by Actions)
 *   plus `GITHUB_REPOSITORY` (e.g. `owner/repo`) authenticate and target
 *   the right repo. This keeps the scanner runnable in environments
 *   without the `gh` CLI (e.g. tests) and keeps the dependency surface
 *   minimal — no `@octokit/*` package is added.
 *
 * Exit codes:
 *   0 — successful run (no stale items, or all stale items handled).
 *   1 — fatal error (cannot read content dir, API call fails, etc.).
 */

import {
  buildIssueRequest,
  scanContent,
  type GhRepo,
  type ScanResult,
} from "./freshness-core.js";
import { makeRestClient, type GhClient } from "./github-rest-client.js";

// Re-exports — the public surface of this module is unchanged by the
// issue #134 split; tests import these names from `../freshness-scan.js`.
export {
  buildIssueRequest,
  isFreshnessIssueForSlug,
  parseFrontmatter,
  scanContent,
} from "./freshness-core.js";
export type {
  CheatsheetFrontmatter,
  GhRepo,
  ScanResult,
  StaleEntry,
} from "./freshness-core.js";
export { makeRestClient } from "./github-rest-client.js";
export type { GhClient, GhIssueSummary } from "./github-rest-client.js";

/**
 * Returns the GitHub repo slug (owner/repo) from `GITHUB_REPOSITORY`.
 * Throws when missing/malformed so we never silently no-op in CI.
 */
function getGhRepo(): GhRepo {
  const raw = process.env.GITHUB_REPOSITORY;
  if (!raw || !raw.includes("/")) {
    throw new Error(
      "GITHUB_REPOSITORY is required (format: owner/repo). " +
        "Set it in the workflow or `--dry-run` to skip API calls.",
    );
  }
  const [owner, repo] = raw.split("/", 2);
  if (!owner || !repo) {
    throw new Error(`Malformed GITHUB_REPOSITORY: ${raw}`);
  }
  return { owner, repo };
}

interface RunOptions {
  contentDir: string;
  dryRun: boolean;
  now?: Date;
  client?: GhClient;
  repo?: GhRepo;
}

/**
 * Orchestrates a full scanner run. Exported so tests can drive it with a
 * stub `client` and a fixture `contentDir`. In production, callers invoke
 * `main()` below — which builds a real REST client and forwards.
 */
export async function run(opts: RunOptions): Promise<{
  scan: ScanResult;
  created: string[];
  skipped: string[];
  log: string[];
}> {
  const log: string[] = [];
  const created: string[] = [];
  const skippedDuplicates: string[] = [];
  const scan = await scanContent(
    opts.contentDir,
    opts.now ?? new Date(),
  );
  for (const line of scan.log) log.push(line);
  log.push(
    `○ Scanned ${scan.scanned} cheatsheet(s); ${scan.stale.length} stale, ` +
      `${scan.skipped} skipped (bad frontmatter).`,
  );
  if (scan.stale.length === 0) {
    log.push("✓ no stale entries found");
    return { scan, created, skipped: skippedDuplicates, log };
  }
  if (opts.dryRun) {
    for (const entry of scan.stale) {
      const repo = opts.repo ?? { owner: "OWNER", repo: "REPO" };
      const req = buildIssueRequest(entry, repo);
      log.push(
        `⚡ would file issue for ${entry.slug} ` +
          `(${entry.daysOverdue}d overdue): "${req.title}"`,
      );
    }
    return { scan, created, skipped: skippedDuplicates, log };
  }
  if (!opts.client || !opts.repo) {
    throw new Error("run() requires `client` and `repo` when dryRun is false");
  }
  await opts.client.ensureLabel();
  for (const entry of scan.stale) {
    const existing = await opts.client.findOpenIssueBySlug(entry.slug);
    if (existing) {
      skippedDuplicates.push(entry.slug);
      log.push(
        `○ skip ${entry.slug}: existing issue #${existing.number} already open`,
      );
      continue;
    }
    const req = buildIssueRequest(entry, opts.repo);
    const number = await opts.client.createIssue(req);
    created.push(entry.slug);
    log.push(`✓ filed issue #${number} for ${entry.slug}`);
  }
  return { scan, created, skipped: skippedDuplicates, log };
}

/**
 * CLI entrypoint. Parses argv/env and delegates to `run`.
 */
async function main(): Promise<void> {
  const dryRun =
    process.argv.includes("--dry-run") || process.env.FRESHNESS_DRY_RUN === "1";
  const contentDir =
    process.env.CONTENT_DIR ?? "src/content/cheatsheets";
  let client: GhClient | undefined;
  let repo: GhRepo | undefined;
  if (!dryRun) {
    repo = getGhRepo();
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      throw new Error(
        "GITHUB_TOKEN is required when not in --dry-run mode. " +
          "GitHub Actions provides this automatically.",
      );
    }
    client = makeRestClient(repo, token);
  }
  const result = await run(
    dryRun
      ? { contentDir, dryRun: true }
      : { contentDir, dryRun: false, client: client!, repo: repo! },
  );
  for (const line of result.log) {
    // eslint-disable-next-line no-console
    console.log(line);
  }
  if (dryRun) {
    // eslint-disable-next-line no-console
    console.log(
      `○ dry-run complete — ${result.scan.stale.length} stale entr(y/ies) ` +
        "detected, no issues filed.",
    );
  } else {
    // eslint-disable-next-line no-console
    console.log(
      `○ run complete — filed ${result.created.length}, skipped ` +
        `${result.skipped.length} duplicate(s).`,
    );
  }
}

// Run when invoked directly (tsx tools/ci/freshness-scan.ts) — not when
// imported by tests. `import.meta.url` matches the process entrypoint via
// the standard ESM idiom.
const invokedDirectly =
  import.meta.url === `file://${process.argv[1]}` ||
  process.argv[1]?.endsWith("freshness-scan.ts") === true;
if (invokedDirectly) {
  main().catch((err: unknown) => {
    // eslint-disable-next-line no-console
    console.error(`✗ freshness-scan failed: ${(err as Error).message}`);
    process.exit(1);
  });
}
