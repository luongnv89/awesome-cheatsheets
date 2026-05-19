/**
 * Unit tests for the freshness CI scanner (issue #26 / Task 4.7).
 *
 * Strategy:
 *   The scanner is split into pure pieces (`parseFrontmatter`, `scanContent`,
 *   `buildIssueRequest`) plus a small `run()` orchestrator that takes a
 *   `GhClient` stub. Tests exercise each piece against tmp fixture
 *   directories — they never touch `src/content/cheatsheets/` and never
 *   talk to GitHub. Acceptance criterion "test fixture: a deliberately-stale
 *   cheatsheet triggers an issue on a dry-run" is covered by
 *   `dry-run identifies the stale fixture only`.
 *
 * Why a tmpdir instead of adding a stale cheatsheet to the real content
 * directory: a real stale entry would break the catalog freshness UI tests
 * (PR #44) and the content-collection schema's invariants. Isolation via
 * `CONTENT_DIR` env / `contentDir` option keeps the cron logic verifiable
 * without polluting production content.
 */
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  buildIssueRequest,
  parseFrontmatter,
  run,
  scanContent,
  type GhClient,
} from "../freshness-scan.js";

/** Helper: write `<slug>/<slug>.md` with the given frontmatter into root. */
async function writeCheatsheet(
  root: string,
  slug: string,
  fm: Record<string, string | number>,
): Promise<void> {
  const dir = join(root, slug);
  await mkdir(dir, { recursive: true });
  const lines = ["---"];
  for (const [k, v] of Object.entries(fm)) {
    if (typeof v === "number") lines.push(`${k}: ${v}`);
    else lines.push(`${k}: "${v}"`);
  }
  lines.push("---", "", "# Body");
  await writeFile(join(dir, `${slug}.md`), lines.join("\n"), "utf8");
}

describe("parseFrontmatter", () => {
  it("returns null when there is no frontmatter delimiter", () => {
    expect(parseFrontmatter("no frontmatter here")).toBeNull();
  });

  it("returns null when required fields are missing", () => {
    expect(parseFrontmatter("---\ntitle: x\n---\nbody")).toBeNull();
  });

  it("parses string last_updated", () => {
    const source = [
      "---",
      'slug: "foo"',
      'title: "Foo"',
      'last_updated: "2026-01-01"',
      "stale_after_days: 30",
      "---",
      "",
      "body",
    ].join("\n");
    const fm = parseFrontmatter(source);
    expect(fm).not.toBeNull();
    expect(fm?.slug).toBe("foo");
    expect(fm?.last_updated).toBe("2026-01-01");
    expect(fm?.stale_after_days).toBe(30);
  });

  it("normalises a YAML Date back to ISO-8601 calendar string", () => {
    // YAML 1.2 parses an unquoted `2026-01-01` as a Date object. We mirror
    // the transform from src/content/config.ts to keep things consistent.
    const source = [
      "---",
      "slug: foo",
      "title: Foo",
      "last_updated: 2026-01-01",
      "stale_after_days: 30",
      "---",
      "",
    ].join("\n");
    const fm = parseFrontmatter(source);
    expect(fm?.last_updated).toBe("2026-01-01");
  });
});

describe("scanContent", () => {
  let root: string;
  beforeEach(async () => {
    root = await mkdtemp(join(tmpdir(), "freshness-scan-"));
  });
  afterEach(async () => {
    await rm(root, { recursive: true, force: true });
  });

  it("returns empty stale list when all cheatsheets are fresh", async () => {
    await writeCheatsheet(root, "alpha", {
      slug: "alpha",
      title: "Alpha",
      last_updated: "2026-05-10",
      stale_after_days: 90,
    });
    const now = new Date("2026-05-19T12:00:00Z");
    const result = await scanContent(root, now);
    expect(result.scanned).toBe(1);
    expect(result.stale).toHaveLength(0);
  });

  it("flags an overdue cheatsheet as stale", async () => {
    await writeCheatsheet(root, "old-tool", {
      slug: "old-tool",
      title: "Old Tool",
      last_updated: "2020-01-01",
      stale_after_days: 30,
    });
    const now = new Date("2026-05-19T12:00:00Z");
    const result = await scanContent(root, now);
    expect(result.stale).toHaveLength(1);
    expect(result.stale[0]?.slug).toBe("old-tool");
    expect(result.stale[0]?.daysOverdue).toBeGreaterThan(2000);
    expect(result.stale[0]?.filePath).toBe(
      "src/content/cheatsheets/old-tool/old-tool.md",
    );
  });

  it("returns only stale entries when a mix is present", async () => {
    await writeCheatsheet(root, "fresh", {
      slug: "fresh",
      title: "Fresh",
      last_updated: "2026-05-18",
      stale_after_days: 90,
    });
    await writeCheatsheet(root, "stale", {
      slug: "stale",
      title: "Stale",
      last_updated: "2020-01-01",
      stale_after_days: 1,
    });
    const now = new Date("2026-05-19T12:00:00Z");
    const result = await scanContent(root, now);
    expect(result.scanned).toBe(2);
    expect(result.stale.map((s) => s.slug)).toEqual(["stale"]);
  });

  it("counts but does not crash on malformed frontmatter", async () => {
    const dir = join(root, "broken");
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, "broken.md"), "no frontmatter", "utf8");
    const result = await scanContent(root, new Date("2026-05-19T12:00:00Z"));
    expect(result.scanned).toBe(1);
    expect(result.skipped).toBe(1);
    expect(result.stale).toHaveLength(0);
  });
});

describe("buildIssueRequest", () => {
  it("produces a title containing the slug verbatim", () => {
    const req = buildIssueRequest(
      {
        slug: "my-tool",
        title: "My Tool",
        lastUpdated: "2025-01-01",
        staleAfterDays: 30,
        daysOverdue: 100,
        filePath: "src/content/cheatsheets/my-tool/my-tool.md",
      },
      { owner: "acme", repo: "cheats" },
    );
    expect(req.title).toBe("[freshness] Update cheatsheet: my-tool");
    expect(req.body).toContain("`my-tool`");
    expect(req.body).toContain("2025-01-01");
    expect(req.body).toContain("100");
    expect(req.body).toContain(
      "https://github.com/acme/cheats/blob/main/" +
        "src/content/cheatsheets/my-tool/my-tool.md",
    );
  });
});

describe("run", () => {
  let root: string;
  beforeEach(async () => {
    root = await mkdtemp(join(tmpdir(), "freshness-run-"));
  });
  afterEach(async () => {
    await rm(root, { recursive: true, force: true });
  });

  it("logs 'no stale entries found' when everything is fresh", async () => {
    await writeCheatsheet(root, "alpha", {
      slug: "alpha",
      title: "Alpha",
      last_updated: "2026-05-18",
      stale_after_days: 90,
    });
    const result = await run({
      contentDir: root,
      dryRun: true,
      now: new Date("2026-05-19T12:00:00Z"),
    });
    expect(result.log.some((l) => l.includes("no stale entries found"))).toBe(
      true,
    );
    expect(result.created).toEqual([]);
  });

  it("dry-run identifies the stale fixture only (AC: fixture triggers issue on dry-run)", async () => {
    // Issue #26 AC: a deliberately-stale cheatsheet triggers an issue on a
    // dry-run. We embed BOTH a fresh and a stale fixture so the assertion
    // also proves the fresh one is not flagged.
    await writeCheatsheet(root, "fresh-tool", {
      slug: "fresh-tool",
      title: "Fresh Tool",
      last_updated: "2026-05-18",
      stale_after_days: 90,
    });
    await writeCheatsheet(root, "stale-tool", {
      slug: "stale-tool",
      title: "Stale Tool",
      last_updated: "2020-01-01",
      stale_after_days: 1,
    });
    const result = await run({
      contentDir: root,
      dryRun: true,
      now: new Date("2026-05-19T12:00:00Z"),
      repo: { owner: "acme", repo: "cheats" },
    });
    const intentLines = result.log.filter((l) =>
      l.includes("would file issue"),
    );
    expect(intentLines).toHaveLength(1);
    expect(intentLines[0]).toContain("stale-tool");
    expect(intentLines.some((l) => l.includes("fresh-tool"))).toBe(false);
    expect(result.created).toEqual([]);
  });

  it("creates an issue for each stale entry with no duplicate", async () => {
    await writeCheatsheet(root, "stale-one", {
      slug: "stale-one",
      title: "Stale One",
      last_updated: "2020-01-01",
      stale_after_days: 1,
    });
    const createCalls: Array<{ title: string; body: string }> = [];
    let ensureLabelCalls = 0;
    const stubClient: GhClient = {
      async ensureLabel() {
        ensureLabelCalls += 1;
      },
      async findOpenIssueBySlug() {
        return null; // no existing issue
      },
      async createIssue(req) {
        createCalls.push(req);
        return 99;
      },
    };
    const result = await run({
      contentDir: root,
      dryRun: false,
      now: new Date("2026-05-19T12:00:00Z"),
      client: stubClient,
      repo: { owner: "acme", repo: "cheats" },
    });
    expect(ensureLabelCalls).toBe(1);
    expect(createCalls).toHaveLength(1);
    expect(createCalls[0]?.title).toBe(
      "[freshness] Update cheatsheet: stale-one",
    );
    expect(result.created).toEqual(["stale-one"]);
    expect(result.skipped).toEqual([]);
  });

  it("idempotent: skips when an open needs-update issue already exists for the slug", async () => {
    // AC: re-running with no new stale items creates no new issues. This
    // covers the dedup path: scanner re-runs but the previous issue is
    // still open, so no new issue is filed.
    await writeCheatsheet(root, "stale-dup", {
      slug: "stale-dup",
      title: "Stale Dup",
      last_updated: "2020-01-01",
      stale_after_days: 1,
    });
    const createCalls: Array<{ title: string; body: string }> = [];
    const stubClient: GhClient = {
      async ensureLabel() {
        /* no-op */
      },
      async findOpenIssueBySlug(slug) {
        return { number: 42, title: `[freshness] Update cheatsheet: ${slug}` };
      },
      async createIssue(req) {
        createCalls.push(req);
        return 0;
      },
    };
    const result = await run({
      contentDir: root,
      dryRun: false,
      now: new Date("2026-05-19T12:00:00Z"),
      client: stubClient,
      repo: { owner: "acme", repo: "cheats" },
    });
    expect(createCalls).toHaveLength(0);
    expect(result.created).toEqual([]);
    expect(result.skipped).toEqual(["stale-dup"]);
    expect(result.log.some((l) => l.includes("#42"))).toBe(true);
  });
});
