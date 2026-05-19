/**
 * Tests for `tools/ci/no-cdn-check.sh`.
 *
 * The script is plain bash, so we test it by spawning `bash` against
 * throwaway fixture directories laid out under a per-test tmpdir. This
 * approach keeps the script standalone (no Node dependency) while still
 * giving us deterministic, hermetic tests that fit into the existing
 * `pnpm test` (vitest) pipeline.
 *
 * Why spawn the real script:
 *   - The script's contract *is* its exit code + its stdout/stderr. Mocking
 *     `grep` would test our mock, not the gate.
 *   - The patterns are conservative on purpose (see the script's header
 *     comment). Re-implementing them in TypeScript would just duplicate the
 *     denylist and let it drift.
 *
 * Coverage (matches the AC for issue #23):
 *   - exits 0 on a clean dist
 *   - exits 1 on each CDN host pattern listed in the script
 *   - exits 1 when the target directory does not exist
 *   - error output names the offending file:line and the matched URL
 *   - no false positives on prose that mentions "fonts" or "cdn" without
 *     a `https://` prefix
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const repoRoot = resolve(import.meta.dirname, "../../..");
const script = resolve(repoRoot, "tools/ci/no-cdn-check.sh");

function runScript(target: string): {
  status: number;
  stdout: string;
  stderr: string;
} {
  const result = spawnSync("bash", [script, target], {
    encoding: "utf8",
  });
  return {
    status: result.status ?? -1,
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
  };
}

describe("tools/ci/no-cdn-check.sh", () => {
  let workdir: string;

  beforeEach(() => {
    workdir = mkdtempSync(join(tmpdir(), "no-cdn-check-"));
  });

  afterEach(() => {
    rmSync(workdir, { recursive: true, force: true });
  });

  it("exits 0 when the directory is empty", () => {
    const result = runScript(workdir);
    expect(result.status).toBe(0);
    expect(result.stdout).toContain("CDN-free");
  });

  it("exits 0 when files contain no CDN URLs", () => {
    writeFileSync(
      join(workdir, "index.html"),
      `<!doctype html>
<html>
  <head>
    <link rel="stylesheet" href="/assets/main.css">
    <link rel="icon" href="/favicon.svg">
  </head>
  <body>
    <p>This page references fonts.googleapis.com only in prose
       (no https:// prefix) and that should be fine.</p>
    <p>It also mentions cdn as a word, which is fine.</p>
  </body>
</html>`,
    );
    writeFileSync(
      join(workdir, "app.js"),
      `// Internal helper for the cdn build pipeline.\nexport function load() {}`,
    );

    const result = runScript(workdir);
    expect(result.status).toBe(0);
    expect(result.stdout).toContain("CDN-free");
  });

  it("recurses into nested directories", () => {
    const nested = join(workdir, "deep", "subdir");
    mkdirSync(nested, { recursive: true });
    writeFileSync(
      join(nested, "page.html"),
      `<link href="https://fonts.googleapis.com/css?family=Inter" rel="stylesheet">`,
    );

    const result = runScript(workdir);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("page.html");
    expect(result.stderr).toContain("https://fonts.googleapis.com");
  });

  it("exits 1 and reports file:line on a unpkg URL", () => {
    writeFileSync(
      join(workdir, "index.html"),
      `<!doctype html>\n<script src="https://unpkg.com/some-lib@1.0.0/dist/some-lib.min.js"></script>\n`,
    );
    const result = runScript(workdir);
    expect(result.status).toBe(1);
    expect(result.stderr).toMatch(/index\.html:2:/);
    expect(result.stderr).toContain("https://unpkg.com/some-lib");
  });

  // Each of these patterns must be flagged — they're listed in the AC.
  const offenders: Array<{ name: string; url: string; mustContain: string }> = [
    {
      name: "cdn.* generic",
      url: "https://cdn.example.com/lib.js",
      mustContain: "https://cdn.example.com",
    },
    {
      name: "cdnjs.cloudflare.com",
      url: "https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js",
      mustContain: "https://cdnjs",
    },
    {
      name: "fonts.gstatic.com",
      url: "https://fonts.gstatic.com/s/inter/v12/UcC73Fwr.woff2",
      mustContain: "https://fonts.gstatic.com",
    },
    {
      name: "maxcdn.bootstrapcdn.com",
      url: "https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css",
      mustContain: "https://maxcdn",
    },
    {
      name: "ajax.googleapis.com",
      url: "https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js",
      mustContain: "https://ajax.googleapis.com",
    },
    {
      name: "jsdelivr.net",
      url: "https://cdn.jsdelivr.net/npm/foo@1/dist/foo.js",
      // cdn. matches first, but the URL extraction should still show
      // jsdelivr in the rendered URL.
      mustContain: "jsdelivr.net",
    },
    {
      name: "stackpath.bootstrapcdn.com",
      url: "https://stackpath.bootstrapcdn.com/bootstrap/4.5.0/css/bootstrap.min.css",
      mustContain: "https://stackpath.bootstrapcdn.com",
    },
  ];

  for (const offender of offenders) {
    it(`flags ${offender.name}`, () => {
      writeFileSync(join(workdir, "doc.html"), `<a href="${offender.url}">x</a>\n`);
      const result = runScript(workdir);
      expect(result.status).toBe(1);
      expect(result.stderr).toContain(offender.mustContain);
    });
  }

  it("exits 1 with a build hint when the directory is missing", () => {
    const missing = join(workdir, "absent");
    const result = runScript(missing);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("directory not found");
    expect(result.stderr).toContain("pnpm build");
  });

  it("exits 2 on usage error", () => {
    const result = spawnSync("bash", [script, "a", "b"], { encoding: "utf8" });
    expect(result.status).toBe(2);
    expect(result.stderr).toContain("Usage");
  });

  it("flags multiple offenders across multiple files", () => {
    writeFileSync(
      join(workdir, "a.html"),
      `<link href="https://fonts.googleapis.com/css?family=Inter" rel="stylesheet">`,
    );
    writeFileSync(
      join(workdir, "b.html"),
      `<script src="https://unpkg.com/foo"></script>`,
    );
    const result = runScript(workdir);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("a.html");
    expect(result.stderr).toContain("b.html");
    expect(result.stderr).toContain("https://fonts.googleapis.com");
    expect(result.stderr).toContain("https://unpkg.com");
  });
});
