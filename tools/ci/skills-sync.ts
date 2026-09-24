/**
 * Skill-tree sync — resolves issue #136 (Task 3.6, F-DEAD-003).
 *
 * `skills/` is the canonical authoring-skill tree. `.claude/skills/` and
 * `.agents/skills/` are generated mirrors so tool-specific skill loaders
 * (Claude Code, Devin-style agent runners) can discover the same skills
 * without the repo maintaining three hand-edited copies.
 *
 * Usage:
 *   pnpm skills:sync          # regenerate both mirrors from skills/
 *   pnpm skills:sync --check  # verify parity, exit 1 on any drift (CI mode)
 *
 * Contract:
 *   - Every directory under `skills/` is mirrored byte-for-byte into each
 *     tool directory. A mirror skill directory is fully regenerated
 *     (delete + copy), never merged, so stale files cannot linger.
 *   - Entries in a mirror root that are not skill directories (e.g.
 *     `.claude/settings.local.json`) are never touched.
 *   - Skill directories present in a mirror but absent from `skills/` are
 *     left in place but reported — they violate the single-source contract
 *     and fail `--check`.
 */

import { cp, readdir, readFile, rm, stat } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = fileURLToPath(new URL("../..", import.meta.url)).replace(
  /[/\\]$/,
  "",
);
const CANONICAL = join(REPO_ROOT, "skills");
const MIRRORS: { path: string; label: string }[] = [
  { path: join(REPO_ROOT, ".claude/skills"), label: ".claude/skills" },
  { path: join(REPO_ROOT, ".agents/skills"), label: ".agents/skills" },
];

interface Diff {
  kind: "missing" | "extra" | "differs" | "extra-skill";
  path: string;
}

async function isDirectory(path: string): Promise<boolean> {
  try {
    return (await stat(path)).isDirectory();
  } catch {
    return false;
  }
}

/** Skill names = immediate child directories of `skills/`. */
async function skillNames(): Promise<string[]> {
  const names: string[] = [];
  for (const entry of await readdir(CANONICAL, { withFileTypes: true })) {
    if (entry.isDirectory()) names.push(entry.name);
  }
  return names.sort();
}

async function listFiles(dir: string, prefix = ""): Promise<string[]> {
  const out: string[] = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) out.push(...(await listFiles(join(dir, entry.name), rel)));
    else out.push(rel);
  }
  return out;
}

/** Recursive byte-compare of two directories. Mirrors `diff -rq`. */
async function compareTrees(a: string, b: string, label: string): Promise<Diff[]> {
  const diffs: Diff[] = [];
  if (!(await isDirectory(b))) {
    diffs.push({ kind: "missing", path: label });
    return diffs;
  }
  const [aFiles, bFiles] = [await listFiles(a), await listFiles(b)];
  const aSet = new Set(aFiles);
  const bSet = new Set(bFiles);
  for (const rel of aFiles.sort()) {
    if (!bSet.has(rel)) diffs.push({ kind: "missing", path: `${label}/${rel}` });
    else {
      const [ac, bc] = await Promise.all([
        readFile(join(a, rel)),
        readFile(join(b, rel)),
      ]);
      if (!ac.equals(bc)) diffs.push({ kind: "differs", path: `${label}/${rel}` });
    }
  }
  for (const rel of bFiles.sort()) {
    if (!aSet.has(rel)) diffs.push({ kind: "extra", path: `${label}/${rel}` });
  }
  return diffs;
}

/** Mirror skill dirs present in `mirror` but absent from `skills/` (unmanaged). */
async function unmanagedSkills(mirror: string, canonicalNames: Set<string>): Promise<string[]> {
  if (!(await isDirectory(mirror))) return [];
  const extra: string[] = [];
  for (const entry of await readdir(mirror, { withFileTypes: true })) {
    if (entry.isDirectory() && !canonicalNames.has(entry.name)) extra.push(entry.name);
  }
  return extra.sort();
}

async function check(): Promise<number> {
  const names = await skillNames();
  const canonical = new Set(names);
  const problems: string[] = [];
  for (const mirror of MIRRORS) {
    for (const name of names) {
      const diffs = await compareTrees(
        join(CANONICAL, name),
        join(mirror.path, name),
        `${name}`,
      );
      for (const d of diffs) {
        problems.push(`  ${d.kind.padEnd(7)} ${mirror.label}/${d.path}`);
      }
    }
    for (const name of await unmanagedSkills(mirror.path, canonical)) {
      problems.push(`  extra-skill ${mirror.label}/${name}`);
    }
  }
  if (problems.length > 0) {
    console.error(`✗ Skill mirrors drifted from canonical skills/:`);
    for (const line of problems) console.error(line);
    console.error(`  To fix:  pnpm skills:sync`);
    return 1;
  }
  console.log(
    `○ Skill mirrors in sync — ${names.length} skill(s) x ${MIRRORS.length} mirror(s)`,
  );
  return 0;
}

async function sync(): Promise<number> {
  const names = await skillNames();
  const canonical = new Set(names);
  for (const mirror of MIRRORS) {
    for (const name of names) {
      const target = join(mirror.path, name);
      await rm(target, { recursive: true, force: true });
      await cp(join(CANONICAL, name), target, { recursive: true });
    }
    console.log(`✓ ${mirror.label}: mirrored ${names.join(", ")}`);
    for (const name of await unmanagedSkills(mirror.path, canonical)) {
      console.warn(
        `⚠ ${mirror.label}/${name} is not in skills/ — left untouched (unmanaged)`,
      );
    }
  }
  return 0;
}

const checkMode = process.argv.includes("--check");
process.exit(await (checkMode ? check() : sync()));
