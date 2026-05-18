/**
 * Tests for the `pnpm cheatsheet:lint` CLI.
 *
 * The CLI's `main(argv, io)` accepts injected streams, so these tests capture
 * output via in-memory writables instead of spawning a subprocess. That keeps
 * the suite fast and offline — matching the policy in `vitest.config.ts`,
 * which also sets `CHEATSHEET_LINT_SKIP_LINKS=1` as defense in depth.
 *
 * Covers the acceptance criteria for issue #3:
 *  - AC #1/#2: Hermes happy path exits 0 with a clean report.
 *  - AC #3:    Failing fixtures exit 1.
 *  - AC #4:    `--format=json` emits a parseable single-document payload.
 *  - AC #5 is enforced in package.json (out of scope for this file) — covered
 *           via the integration in `package.json` and the QA smoke checks.
 *
 * Also exercises:
 *  - Glob expansion (`cheatsheets/**\/*.md`) finds the Hermes file.
 *  - Usage errors exit 2.
 */
import { describe, expect, it } from "vitest";
import { resolve } from "node:path";
import { Writable } from "node:stream";

import { main } from "../lint.js";

const repoRoot = resolve(import.meta.dirname, "../../..");
const hermes = resolve(repoRoot, "cheatsheets/hermes-agent/hermes-agent.md");
const fixtureRoot = resolve(repoRoot, "tools/validator/__tests__/fixtures");

/**
 * Minimal in-memory writable that just collects chunks. We use a `Writable`
 * subclass so it satisfies `NodeJS.WritableStream` without monkey-patching
 * process streams.
 */
function captureStream(): { stream: Writable; readAll: () => string } {
  const chunks: Buffer[] = [];
  const stream = new Writable({
    write(chunk: Buffer | string, _enc, cb): void {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      cb();
    },
  });
  return {
    stream,
    readAll: (): string => Buffer.concat(chunks).toString("utf8"),
  };
}

function makeIo(): {
  io: { stdout: Writable; stderr: Writable };
  out: () => string;
  err: () => string;
} {
  const stdout = captureStream();
  const stderr = captureStream();
  return {
    io: { stdout: stdout.stream, stderr: stderr.stream },
    out: stdout.readAll,
    err: stderr.readAll,
  };
}

describe("cheatsheet:lint CLI", () => {
  it("exits 0 and prints a passing report for the Hermes cheatsheet (AC #2)", async () => {
    const { io, out, err } = makeIo();
    const code = await main([hermes, "--no-links"], io);
    expect(code).toBe(0);
    const stdout = out();
    expect(stdout).toContain("✓");
    expect(stdout).toContain("hermes-agent.md");
    expect(stdout).toMatch(/1 file\(s\) passed, 0 file\(s\) failed/);
    expect(err()).toBe("");
  });

  it("exits 1 on a known-failing fixture", async () => {
    const { io, out } = makeIo();
    const code = await main(
      [resolve(fixtureRoot, "missing-frontmatter.md"), "--no-links"],
      io,
    );
    expect(code).toBe(1);
    const stdout = out();
    expect(stdout).toContain("✗");
    expect(stdout).toContain("frontmatter-missing");
    expect(stdout).toMatch(/0 file\(s\) passed, 1 file\(s\) failed/);
  });

  it("groups errors by rule id in the human report", async () => {
    const { io, out } = makeIo();
    const code = await main(
      [resolve(fixtureRoot, "missing-frontmatter.md"), "--no-links"],
      io,
    );
    expect(code).toBe(1);
    const stdout = out();
    // The grouped rule heading appears once, indented errors appear under it.
    const lines = stdout.split("\n");
    const ruleHeaderIdx = lines.findIndex((l) => l.trim() === "frontmatter-missing:");
    expect(ruleHeaderIdx).toBeGreaterThan(-1);
    // At least one indented entry follows.
    const nextLine = lines[ruleHeaderIdx + 1];
    expect(nextLine).toBeDefined();
    expect(nextLine?.startsWith("    -")).toBe(true);
  });

  it("emits a single parseable JSON document with --format=json (AC #4)", async () => {
    const { io, out, err } = makeIo();
    const code = await main([hermes, "--no-links", "--format=json"], io);
    expect(code).toBe(0);
    // stdout must be a single JSON document — no preamble, no trailing chatter.
    const stdout = out();
    const parsed: unknown = JSON.parse(stdout);
    expect(parsed).toMatchObject({
      version: 1,
      summary: { passed: 1, failed: 0 },
    });
    const obj = parsed as {
      results: { file: string; ok: boolean; errors: unknown[] }[];
    };
    expect(obj.results).toHaveLength(1);
    expect(obj.results[0]?.ok).toBe(true);
    expect(obj.results[0]?.errors).toEqual([]);
    // No diagnostics on stderr for the happy path.
    expect(err()).toBe("");
  });

  it("emits JSON with failed results when files fail", async () => {
    const { io, out } = makeIo();
    const code = await main(
      [resolve(fixtureRoot, "missing-frontmatter.md"), "--no-links", "--format=json"],
      io,
    );
    expect(code).toBe(1);
    const parsed = JSON.parse(out()) as {
      summary: { passed: number; failed: number };
      results: { ok: boolean; errors: { rule: string }[] }[];
    };
    expect(parsed.summary).toEqual({ passed: 0, failed: 1 });
    expect(parsed.results[0]?.ok).toBe(false);
    expect(parsed.results[0]?.errors.some((e) => e.rule === "frontmatter-missing")).toBe(
      true,
    );
  });

  it("exits 2 with usage on no inputs", async () => {
    const { io, out, err } = makeIo();
    const code = await main([], io);
    expect(code).toBe(2);
    expect(err()).toContain("No input paths");
    expect(err()).toContain("Usage:");
    // No stdout chatter on usage errors — keeps JSON consumers safe.
    expect(out()).toBe("");
  });

  it("exits 2 on unknown flag", async () => {
    const { io, err } = makeIo();
    const code = await main([hermes, "--nope"], io);
    expect(code).toBe(2);
    expect(err()).toContain("Unknown flag: --nope");
  });

  it("exits 2 on bad --format value", async () => {
    const { io, err } = makeIo();
    const code = await main([hermes, "--format=xml"], io);
    expect(code).toBe(2);
    expect(err()).toContain("Unknown --format value");
  });

  it("exits 2 when a glob matches zero files", async () => {
    const { io, err } = makeIo();
    const code = await main([
      resolve(repoRoot, "cheatsheets/**/no-such-thing-*.md"),
      "--no-links",
    ], io);
    expect(code).toBe(2);
    expect(err()).toContain("No Markdown files matched");
  });

  it("expands globs to find cheatsheet files", async () => {
    const { io, out } = makeIo();
    const code = await main([
      resolve(repoRoot, "cheatsheets/**/*.md"),
      "--no-links",
    ], io);
    expect(code).toBe(0);
    const stdout = out();
    expect(stdout).toContain("hermes-agent.md");
  });

  it("prints help to stdout on --help and exits 0", async () => {
    const { io, out, err } = makeIo();
    const code = await main(["--help"], io);
    expect(code).toBe(0);
    expect(out()).toContain("Usage:");
    expect(out()).toContain("--format=");
    expect(err()).toBe("");
  });

  it("rejects --link-timeout-ms with a non-positive value", async () => {
    const { io, err } = makeIo();
    const code = await main([hermes, "--link-timeout-ms=0"], io);
    expect(code).toBe(2);
    expect(err()).toContain("Invalid --link-timeout-ms");
  });
});
