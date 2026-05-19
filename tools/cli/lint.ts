/**
 * `pnpm cheatsheet:lint` — thin CLI orchestration layer over the validator.
 *
 * Resolves issue #3 (Sprint 1, Task 1.3). The validator (issue #2) does the
 * heavy lifting; this file just:
 *
 *  1. parses argv into a typed config,
 *  2. expands globs and filters to `.md`,
 *  3. calls `validate()` per file,
 *  4. prints human-readable or JSON output,
 *  5. picks an exit code (0 = all pass, 1 = at least one fail, 2 = usage).
 *
 * ## Public test surface
 *
 * `main(argv, io)` is exported so vitest can inject capture streams and assert
 * on stdout / stderr without spawning a subprocess. The entry guard at the
 * bottom invokes the same function with `process.argv.slice(2)` and the real
 * `process` streams.
 *
 * ## Edge policies (documented because the acceptance criteria leave them
 * implicit):
 *
 *  - Zero glob matches across all inputs → exit 2 (usage / misconfiguration).
 *  - Explicit non-existent literal path → validator emits `file-read`, exit 1.
 *  - Explicit non-`.md` literal path → validate it anyway (the user asked).
 *  - `--help` / `-h` → print usage to stdout, exit 0.
 *  - Unknown flag → print error to stderr, exit 2.
 *  - `--format=json` → stdout is *only* a single JSON document; all chatter
 *    goes to stderr so the output is `JSON.parse`-able in one shot.
 *
 * @see ../validator/index.ts (the `validate()` entry point we wrap)
 * @see ../validator/rules.ts (`RuleId` — used in the JSON shape)
 */

import { pathToFileURL } from "node:url";

import fastGlob from "fast-glob";

import { validate } from "../validator/index.js";
import type { RuleId } from "../validator/rules.js";

/** Output format the CLI emits. */
type Format = "human" | "json";

/** Parsed CLI configuration. */
interface CliConfig {
  inputs: string[];
  format: Format;
  /** When set, overrides the validator's default link-check behaviour. */
  skipLinks: boolean | undefined;
  /** Optional explicit timeout for the link check; falls through to validator default. */
  linkTimeoutMs: number | undefined;
}

/** Parse-result discriminated union. */
type ParseOutcome =
  | { kind: "config"; config: CliConfig }
  | { kind: "help" }
  | { kind: "error"; message: string };

/** Per-file result shape used by both human and JSON renderers. */
interface FileResult {
  file: string;
  ok: boolean;
  errors: { rule: RuleId; message: string; line?: number }[];
}

/** Streams injected for testability. */
interface CliIo {
  stdout: NodeJS.WritableStream;
  stderr: NodeJS.WritableStream;
}

const USAGE = `Usage: pnpm cheatsheet:lint <path-or-glob>... [options]

Validates one or more cheatsheet Markdown files against the template
contract. Accepts literal file paths or glob patterns (e.g. src/content/cheatsheets/**/*.md).

Options:
  --format=<human|json>     Output format. Default: human.
  --no-links                Skip the external link check (offline / CI).
  --link-timeout-ms=<n>     Override the link probe timeout in ms.
  -h, --help                Show this help and exit 0.

Exit codes:
  0   All files pass.
  1   At least one file failed validation.
  2   Usage error (bad flag, no inputs, zero matches).

Examples:
  pnpm cheatsheet:lint src/content/cheatsheets/hermes-agent/hermes-agent.md
  pnpm cheatsheet:lint 'src/content/cheatsheets/**/*.md' --no-links
  pnpm --silent cheatsheet:lint src/content/cheatsheets/foo.md --format=json
                                                  # --silent suppresses pnpm's
                                                  # script preamble so the
                                                  # JSON is parseable as-is.
`;

/**
 * Parse argv into a {@link CliConfig}.
 *
 * Hand-rolled rather than using `commander` / `yargs` to keep the dep
 * footprint minimal — this is a one-page tool with a fixed flag set.
 */
function parseArgs(argv: string[]): ParseOutcome {
  const inputs: string[] = [];
  let format: Format = "human";
  let skipLinks: boolean | undefined;
  let linkTimeoutMs: number | undefined;

  for (let i = 0; i < argv.length; i += 1) {
    const raw = argv[i];
    if (raw === undefined) continue; // noUncheckedIndexedAccess guard.

    if (raw === "-h" || raw === "--help") {
      return { kind: "help" };
    }

    // pnpm sometimes injects a bare `--` separator before user args; ignore it.
    if (raw === "--") continue;

    if (raw === "--no-links") {
      skipLinks = true;
      continue;
    }

    if (raw.startsWith("--format=")) {
      const value = raw.slice("--format=".length);
      if (value !== "human" && value !== "json") {
        return {
          kind: "error",
          message: `Unknown --format value: ${value} (expected: human|json)`,
        };
      }
      format = value;
      continue;
    }

    if (raw.startsWith("--link-timeout-ms=")) {
      const value = raw.slice("--link-timeout-ms=".length);
      const n = Number(value);
      if (!Number.isInteger(n) || n <= 0) {
        return {
          kind: "error",
          message: `Invalid --link-timeout-ms value: ${value} (expected positive integer)`,
        };
      }
      linkTimeoutMs = n;
      continue;
    }

    if (raw.startsWith("--") || raw.startsWith("-")) {
      return { kind: "error", message: `Unknown flag: ${raw}` };
    }

    inputs.push(raw);
  }

  if (inputs.length === 0) {
    return {
      kind: "error",
      message: "No input paths or globs supplied.",
    };
  }

  return {
    kind: "config",
    config: { inputs, format, skipLinks, linkTimeoutMs },
  };
}

/**
 * Expand the input list into a deduplicated, ordered `.md` file list.
 *
 * Each input is either treated as a literal path (if it has no glob magic
 * characters) or expanded via `fast-glob`. Non-`.md` literals are preserved
 * so the user gets a clean `file-read` error if they typo'd the extension.
 */
async function expandInputs(inputs: string[]): Promise<string[]> {
  const seen = new Set<string>();
  const ordered: string[] = [];

  for (const input of inputs) {
    const isGlob = /[*?[\]{}!]/.test(input);
    if (!isGlob) {
      if (!seen.has(input)) {
        seen.add(input);
        ordered.push(input);
      }
      continue;
    }
    const matches = await fastGlob(input, {
      dot: false,
      onlyFiles: true,
    });
    matches.sort(); // Stable order across platforms.
    for (const match of matches) {
      if (!match.endsWith(".md")) continue;
      if (!seen.has(match)) {
        seen.add(match);
        ordered.push(match);
      }
    }
  }

  return ordered;
}

/**
 * Build the options bag for `validate()` while respecting
 * `exactOptionalPropertyTypes` — we must omit keys whose values are
 * `undefined`, not pass `undefined` explicitly.
 */
function buildValidateOptions(config: CliConfig): {
  skipLinks?: boolean;
  linkTimeoutMs?: number;
} {
  const opts: { skipLinks?: boolean; linkTimeoutMs?: number } = {};
  if (config.skipLinks !== undefined) opts.skipLinks = config.skipLinks;
  if (config.linkTimeoutMs !== undefined) opts.linkTimeoutMs = config.linkTimeoutMs;
  return opts;
}

/** Render the human-readable report and write it to stdout. */
function renderHuman(results: FileResult[], io: CliIo): void {
  let passed = 0;
  let failed = 0;
  for (const r of results) {
    if (r.ok) {
      passed += 1;
      io.stdout.write(`✓ ${r.file}\n`);
      continue;
    }
    failed += 1;
    io.stdout.write(`✗ ${r.file}\n`);
    // Group by rule id, preserving validator order within each group.
    const groups = new Map<RuleId, { message: string; line?: number }[]>();
    for (const err of r.errors) {
      const bucket = groups.get(err.rule);
      const entry: { message: string; line?: number } =
        err.line !== undefined
          ? { message: err.message, line: err.line }
          : { message: err.message };
      if (bucket) bucket.push(entry);
      else groups.set(err.rule, [entry]);
    }
    for (const [rule, entries] of groups) {
      io.stdout.write(`  ${rule}:\n`);
      for (const e of entries) {
        const where = e.line !== undefined ? ` [line ${e.line}]` : "";
        io.stdout.write(`    -${where} ${e.message}\n`);
      }
    }
  }
  const totalFiles = passed + failed;
  io.stdout.write(
    `\n${passed} file(s) passed, ${failed} file(s) failed of ${totalFiles} total.\n`,
  );
}

/** Render the JSON report — single document, parseable in one shot. */
function renderJson(results: FileResult[], io: CliIo): void {
  let passed = 0;
  let failed = 0;
  for (const r of results) {
    if (r.ok) passed += 1;
    else failed += 1;
  }
  const payload = {
    version: 1,
    results: results.map((r) => ({
      file: r.file,
      ok: r.ok,
      errors: r.errors,
    })),
    summary: { passed, failed },
  };
  io.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
}

/**
 * Entry point. Returns the process exit code instead of calling
 * `process.exit` directly — the entry guard at the bottom does that.
 */
export async function main(
  argv: string[],
  io: CliIo = { stdout: process.stdout, stderr: process.stderr },
): Promise<number> {
  const parsed = parseArgs(argv);

  if (parsed.kind === "help") {
    io.stdout.write(USAGE);
    return 0;
  }
  if (parsed.kind === "error") {
    io.stderr.write(`${parsed.message}\n\n${USAGE}`);
    return 2;
  }

  const config = parsed.config;
  const files = await expandInputs(config.inputs);

  if (files.length === 0) {
    io.stderr.write(
      `No Markdown files matched the supplied inputs: ${config.inputs.join(", ")}\n`,
    );
    return 2;
  }

  const options = buildValidateOptions(config);
  const results: FileResult[] = [];
  for (const file of files) {
    const r = await validate(file, options);
    results.push({ file, ok: r.ok, errors: r.errors });
  }

  if (config.format === "json") {
    renderJson(results, io);
  } else {
    renderHuman(results, io);
  }

  return results.every((r) => r.ok) ? 0 : 1;
}

// Entry guard — only runs when invoked directly (not when imported by tests).
// Compare resolved file URLs to handle symlinks and pnpm's hoisting.
if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  main(process.argv.slice(2)).then(
    (code) => {
      process.exit(code);
    },
    (err: unknown) => {
      const msg = err instanceof Error ? err.stack ?? err.message : String(err);
      process.stderr.write(`Unhandled CLI error: ${msg}\n`);
      process.exit(1);
    },
  );
}
