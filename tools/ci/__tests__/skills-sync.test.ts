/**
 * Skill-tree parity test — resolves issue #136 (Task 3.6, F-DEAD-003).
 *
 * `skills/` is the single canonical skill tree; `.claude/skills/` and
 * `.agents/skills/` are generated mirrors produced by `pnpm skills:sync`.
 * This test fails whenever a mirror drifts from the canonical tree — it is
 * the vitest form of `diff -rq skills/ <mirror>` returning empty output.
 *
 * Fix a failure by editing `skills/` only, then running `pnpm skills:sync`.
 */
import { readdir, readFile, stat } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const REPO_ROOT = fileURLToPath(new URL("../../..", import.meta.url));
const CANONICAL = join(REPO_ROOT, "skills");
const MIRRORS = [".claude/skills", ".agents/skills"].map((p) =>
  join(REPO_ROOT, p),
);

async function isDirectory(path: string): Promise<boolean> {
  try {
    return (await stat(path)).isDirectory();
  } catch {
    return false;
  }
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

async function dirNames(dir: string): Promise<string[]> {
  if (!(await isDirectory(dir))) return [];
  const out: string[] = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) out.push(entry.name);
  }
  return out.sort();
}

describe("skills-sync mirror parity", () => {
  it("canonical skills/ tree exists", async () => {
    expect(await isDirectory(CANONICAL)).toBe(true);
  });

  it("every mirror carries exactly the canonical skill set", async () => {
    const canonical = await dirNames(CANONICAL);
    expect(canonical.length).toBeGreaterThan(0);
    for (const mirror of MIRRORS) {
      expect(await dirNames(mirror)).toEqual(canonical);
    }
  });

  it("each mirror tree is byte-identical to skills/ (diff -rq empty)", async () => {
    const aFiles = await listFiles(CANONICAL);
    expect(aFiles.length).toBeGreaterThan(0);
    for (const mirror of MIRRORS) {
      const bFiles = await listFiles(mirror);
      expect(bFiles.sort(), `${mirror} file set`).toEqual(aFiles.sort());
      for (const rel of aFiles) {
        const [ac, bc] = await Promise.all([
          readFile(join(CANONICAL, rel)),
          readFile(join(mirror, rel)),
        ]);
        expect(bc.equals(ac), `${mirror}/${rel} content`).toBe(true);
      }
    }
  });
});
