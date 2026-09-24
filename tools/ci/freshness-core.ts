/**
 * Freshness scanner core — pure, network-free logic.
 *
 * Everything the weekly cron needs before it talks to GitHub: the
 * frontmatter types it parses, the `parseFrontmatter` + `scanContent`
 * pipeline that finds stale cheatsheets under a content directory, and the
 * issue-title/body format used for idempotent filing. Extracted from
 * `tools/ci/freshness-scan.ts` (issue #134, F-CLEAN-005) — that module stays
 * the CLI entry point and re-exports the public surface for existing
 * consumers (tests import `../freshness-scan.js`).
 *
 * Staleness itself comes from `tools/utils/freshness.ts#isStale` — the
 * single source of truth shared with the catalog and the cheatsheet layout.
 *
 * Untrusted input note:
 *   Cheatsheet frontmatter is treated as data: `slug`, `last_updated`,
 *   `stale_after_days` are validated by the content collection schema at
 *   build time (`src/content.config.ts`) and re-validated here defensively.
 *   We never `eval`, never `exec` user strings.
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
export interface CheatsheetFrontmatter {
  slug: string;
  title: string;
  last_updated: string;
  stale_after_days: number;
}

export interface StaleEntry {
  slug: string;
  title: string;
  lastUpdated: string;
  staleAfterDays: number;
  daysOverdue: number;
  filePath: string;
}

export interface ScanResult {
  /** Total cheatsheets scanned. */
  scanned: number;
  /** Cheatsheets that parsed but lacked required fields. */
  skipped: number;
  /** Cheatsheets considered stale per the shared predicate. */
  stale: StaleEntry[];
  /** Lines emitted to stdout (also used in tests for assertions). */
  log: string[];
}

export interface GhRepo {
  owner: string;
  repo: string;
}

/**
 * The YAML parser may emit `last_updated: 2026-05-18` as a Date object when
 * the value is unquoted. Normalize to the ISO-8601 calendar string the
 * schema requires, matching what `src/content.config.ts` produces. `null`
 * when the raw value is neither a valid Date nor a string.
 */
function normalizeLastUpdated(raw: unknown): string | null {
  if (raw instanceof Date && !Number.isNaN(raw.getTime())) {
    const yyyy = raw.getUTCFullYear().toString().padStart(4, "0");
    const mm = (raw.getUTCMonth() + 1).toString().padStart(2, "0");
    const dd = raw.getUTCDate().toString().padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }
  return typeof raw === "string" ? raw : null;
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
  let parsed: Record<string, unknown> | null;
  try {
    parsed = parseYaml(yaml) as Record<string, unknown> | null;
  } catch {
    // A YAML syntax error is just another malformed file — return null so
    // one bad cheatsheet can never abort the whole scan (F-BUG-002).
    return null;
  }
  if (!parsed || typeof parsed !== "object") return null;
  const slug = parsed["slug"];
  const title = parsed["title"];
  const lastUpdated = normalizeLastUpdated(parsed["last_updated"]);
  const staleAfter = parsed["stale_after_days"];
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
 * Outcome of scanning one markdown file: a stale entry, a skip (counted +
 * logged), or a fresh file (nothing to record).
 */
interface FileScanOutcome {
  skipped: boolean;
  entry?: StaleEntry;
  log?: string;
}

/**
 * Read, parse and classify a single cheatsheet file. Per-file isolation
 * (F-BUG-002, issue #132): an unreadable or unparseable file becomes a
 * skipped warning — never a crash that aborts the cron.
 */
async function scanMarkdownFile(
  dirent: string,
  file: string,
  slugDir: string,
  now: Date,
): Promise<FileScanOutcome> {
  const filePath = join(slugDir, file);
  let fm: CheatsheetFrontmatter | null;
  try {
    const source = await readFile(filePath, "utf8");
    fm = parseFrontmatter(source);
  } catch (err) {
    return {
      skipped: true,
      log:
        `✗ ${dirent}/${file}: unreadable or invalid frontmatter ` +
        `(${(err as Error).message})`,
    };
  }
  if (!fm) {
    return {
      skipped: true,
      log: `✗ ${dirent}/${file}: missing or invalid frontmatter`,
    };
  }
  if (!isStale(fm.last_updated, fm.stale_after_days, now)) {
    return { skipped: false };
  }
  const days = daysSinceUpdate(fm.last_updated, now) ?? 0;
  return {
    skipped: false,
    entry: {
      slug: fm.slug,
      title: fm.title,
      lastUpdated: fm.last_updated,
      staleAfterDays: fm.stale_after_days,
      daysOverdue: days - fm.stale_after_days,
      filePath: `src/content/cheatsheets/${dirent}/${file}`,
    },
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
      result.scanned += 1;
      const outcome = await scanMarkdownFile(dirent, file, slugDir, now);
      if (outcome.skipped) result.skipped += 1;
      if (outcome.log !== undefined) result.log.push(outcome.log);
      if (outcome.entry !== undefined) result.stale.push(outcome.entry);
    }
  }
  return result;
}

/**
 * The canonical issue title for a stale `slug`. Single source of truth —
 * `buildIssueRequest` produces it and `findOpenIssueBySlug` matches on it.
 */
function issueTitleForSlug(slug: string): string {
  return `[freshness] Update cheatsheet: ${slug}`;
}

/**
 * Whether an existing issue title is the freshness issue for `slug`.
 * Exact match — substring matching lets an open `claude-code` issue
 * suppress filing for `claude` (F-BUG-003, issue #132). Exported so
 * tests can pin the matching semantics.
 */
export function isFreshnessIssueForSlug(title: string, slug: string): boolean {
  return title === issueTitleForSlug(slug);
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
  const title = issueTitleForSlug(entry.slug);
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
