/**
 * Minimal GitHub REST client for the freshness scanner.
 *
 * Extracted from `tools/ci/freshness-scan.ts` (issue #134, F-CLEAN-005) —
 * `makeRestClient` is the only network-aware piece of the scanner: it files
 * `needs-update` issues and searches open ones via the built-in `fetch`, so
 * environments without the `gh` CLI (tests, the cron container) still work
 * and no `@octokit/*` dependency is added.
 *
 * The {@link GhClient} interface is the seam the unit tests stub — wrapping
 * fetch keeps the suite free of network mocking.
 *
 * Untrusted input note: the only network calls go to the GitHub REST API
 * with a fixed schema (title/body/labels) — no shell interpolation.
 */

import { isFreshnessIssueForSlug, type GhRepo } from "./freshness-core.js";

export interface GhIssueSummary {
  number: number;
  title: string;
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

export function makeRestClient(repo: GhRepo, token: string): GhClient {
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
        isFreshnessIssueForSlug(it.title, slug),
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
