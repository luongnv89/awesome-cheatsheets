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
 *
 * Untrusted input note:
 *   Issue body content is not used here. Cheatsheet frontmatter is treated
 *   as data: `slug`, `last_updated`, `stale_after_days` are validated by
 *   the content collection schema at build time (`src/content/config.ts`)
 *   and re-validated here defensively. We never `eval`, never `exec` user
 *   strings, and the only network calls are to the GitHub REST API with
 *   a fixed schema (title/body/labels) — no shell interpolation.
 */
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

import { parse as parseYaml } from "yaml";

import { daysSinceUpdate, isStale } from "../utils/freshness.js";

/**
 * Subset of the cheatsheet frontmatter the scanner cares about.
 * Validated defensively at parse time — the content-collection schema
 * already guarantees these fields at build time, but the cron may run
 * against a stale checkout where the schema differs, so we re-validate.
 */
interface CheatsheetFrontmatter {
  slug: string;
  title: string;
  last_updated: string;
  stale_after_days: number;
}

interface StaleEntry {
  slug: string;
  title: string;
  lastUpdated: string;
  staleAfterDays: number;
  daysOverdue: number;
  filePath: string;
}

interface ScanResult {
  /** Total cheatsheets scanned. */
  scanned: number;
  /** Cheatsheets that parsed but lacked required fields. */
  skipped: number;
  /** Cheatsheets considered stale per the shared predicate. */
  stale: StaleEntry[];
  /** Lines emitted to stdout (also used in tests for assertions). */
  log: string[];
}

interface GhRepo {
  owner: string;
  repo: string;
}

interface GhIssueSummary {
  number: number;
  title: string;
}

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

/**
 * Parse YAML frontmatter from a markdown file body. Returns `null` if the
 * file has no `---`-delimited frontmatter block (which would be a schema
 * violation but we don't want a single malformed file to abort the scan).
 */
export function parseFrontmatter(
  source: string,
): CheatsheetFrontmatter | null {
  if (!source.startsWith("---")) return null;
  const end = source.indexOf("\n---", 3);
  if (end < 0) return null;
  const yaml = source.slice(3, end);
  const parsed = parseYaml(yaml) as Record<string, unknown> | null;
  if (!parsed || typeof parsed !== "object") return null;
  const slug = parsed["slug"];
  const title = parsed["title"];
  const lastUpdatedRaw = parsed["last_updated"];
  const staleAfter = parsed["stale_after_days"];
  // The YAML parser may emit `last_updated: 2026-05-18` as a Date object
  // when the value is unquoted. Normalize to the ISO-8601 calendar string
  // the schema requires, matching what `src/content/config.ts` produces.
  let lastUpdated: string | null = null;
  if (lastUpdatedRaw instanceof Date && !Number.isNaN(lastUpdatedRaw.getTime())) {
    const yyyy = lastUpdatedRaw.getUTCFullYear().toString().padStart(4, "0");
    const mm = (lastUpdatedRaw.getUTCMonth() + 1).toString().padStart(2, "0");
    const dd = lastUpdatedRaw.getUTCDate().toString().padStart(2, "0");
    lastUpdated = `${yyyy}-${mm}-${dd}`;
  } else if (typeof lastUpdatedRaw === "string") {
    lastUpdated = lastUpdatedRaw;
  }
  if (
    typeof slug !== "string" ||
    typeof title !== "string" ||
    typeof lastUpdated !== "string" ||
    typeof staleAfter !== "number"
  ) {
    return null;
  }
  return {
    slug,
    title,
    last_updated: lastUpdated,
    stale_after_days: staleAfter,
  };
}

/**
 * Scan a content directory and return the list of stale entries.
 * Pure — does NOT touch GitHub. Exported so tests can exercise it directly
 * against a tmpdir fixture without spawning the script.
 */
export async function scanContent(
  contentDir: string,
  now: Date = new Date(),
): Promise<ScanResult> {
  const result: ScanResult = { scanned: 0, skipped: 0, stale: [], log: [] };
  let entries: string[];
  try {
    entries = await readdir(contentDir);
  } catch (err) {
    throw new Error(
      `Cannot read content dir ${contentDir}: ${(err as Error).message}`,
    );
  }
  for (const dirent of entries.sort()) {
    const slugDir = join(contentDir, dirent);
    let markdownFiles: string[];
    try {
      markdownFiles = (await readdir(slugDir)).filter((f) => f.endsWith(".md"));
    } catch {
      // Not a directory — skip. The convention is one dir per cheatsheet.
      continue;
    }
    for (const file of markdownFiles) {
      const filePath = join(slugDir, file);
      const source = await readFile(filePath, "utf8");
      const fm = parseFrontmatter(source);
      result.scanned += 1;
      if (!fm) {
        result.skipped += 1;
        result.log.push(`✗ ${dirent}/${file}: missing or invalid frontmatter`);
        continue;
      }
      if (!isStale(fm.last_updated, fm.stale_after_days, now)) {
        continue;
      }
      const days = daysSinceUpdate(fm.last_updated, now) ?? 0;
      result.stale.push({
        slug: fm.slug,
        title: fm.title,
        lastUpdated: fm.last_updated,
        staleAfterDays: fm.stale_after_days,
        daysOverdue: days - fm.stale_after_days,
        filePath: `src/content/cheatsheets/${dirent}/${file}`,
      });
    }
  }
  return result;
}

/**
 * Build the issue title and body for a stale entry. Exported so tests can
 * assert the format without reaching for the network. The title format is
 * the contract used by `findExistingIssue` for idempotency — any change
 * here must keep the slug substring intact.
 */
export function buildIssueRequest(entry: StaleEntry, repo: GhRepo): {
  title: string;
  body: string;
} {
  const title = `[freshness] Update cheatsheet: ${entry.slug}`;
  const sourceUrl =
    `https://github.com/${repo.owner}/${repo.repo}/blob/main/${entry.filePath}`;
  const body = [
    `The \`${entry.slug}\` cheatsheet is past its freshness threshold.`,
    "",
    "| Field | Value |",
    "| --- | --- |",
    `| Slug | \`${entry.slug}\` |`,
    `| Title | ${entry.title} |`,
    `| Last updated | ${entry.lastUpdated} |`,
    `| Threshold | ${entry.staleAfterDays} days |`,
    `| Days overdue | ${entry.daysOverdue} |`,
    `| Source | [${entry.filePath}](${sourceUrl}) |`,
    "",
    "### Action",
    "1. Review the cheatsheet against the upstream source.",
    "2. Update content where it has drifted.",
    "3. Bump `last_updated` to today (ISO-8601).",
    "4. Close this issue — the freshness cron will refile if still stale.",
    "",
    "_Filed by the weekly freshness cron — see " +
      "`.github/workflows/freshness.yml`._",
  ].join("\n");
  return { title, body };
}

/**
 * Minimal GitHub REST client used by the scanner. Wrapping fetch keeps the
 * unit tests free of network mocking — they only need to swap this client.
 */
export interface GhClient {
  findOpenIssueBySlug(slug: string): Promise<GhIssueSummary | null>;
  createIssue(req: { title: string; body: string }): Promise<number>;
  ensureLabel(): Promise<void>;
}

function makeRestClient(repo: GhRepo, token: string): GhClient {
  const base = `https://api.github.com/repos/${repo.owner}/${repo.repo}`;
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "freshness-cron",
  } as const;
  return {
    async findOpenIssueBySlug(slug) {
      // Use REST search restricted to issues in this repo with the label
      // and the slug in the title. Returns the first match (titles include
      // the slug verbatim per `buildIssueRequest`, so collisions are
      // impossible across distinct cheatsheets).
      const q = encodeURIComponent(
        `repo:${repo.owner}/${repo.repo} is:issue is:open ` +
          `label:needs-update in:title ${slug}`,
      );
      const url = `https://api.github.com/search/issues?q=${q}`;
      const res = await fetch(url, { headers });
      if (!res.ok) {
        throw new Error(`search/issues failed: ${res.status} ${res.statusText}`);
      }
      const data = (await res.json()) as {
        items: Array<{ number: number; title: string }>;
      };
      const match = data.items.find((it) =>
        it.title.includes(`[freshness] Update cheatsheet: ${slug}`),
      );
      return match ? { number: match.number, title: match.title } : null;
    },
    async createIssue(req) {
      const res = await fetch(`${base}/issues`, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({
          title: req.title,
          body: req.body,
          labels: ["needs-update"],
        }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(
          `POST /issues failed: ${res.status} ${res.statusText}: ${text}`,
        );
      }
      const data = (await res.json()) as { number: number };
      return data.number;
    },
    async ensureLabel() {
      // PUT-style ensure: try POST, swallow 422 (label already exists).
      const res = await fetch(`${base}/labels`, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "needs-update",
          color: "B60205",
          description: "Cheatsheet content is stale and needs refresh",
        }),
      });
      if (res.ok || res.status === 422) return;
      const text = await res.text();
      throw new Error(
        `POST /labels failed: ${res.status} ${res.statusText}: ${text}`,
      );
    },
  };
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
