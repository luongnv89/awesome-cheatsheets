/**
 * Contract tests for the `cheatsheets` collection's glob loader in
 * `src/content.config.ts` — specifically the `generateId` function that keeps
 * entry ids aligned with the template contract's slug-as-path rule, so
 * `/cheatsheets/<slug>/` URLs stay identical to what the legacy
 * `type: 'content'` collections produced before the Astro 6+ Content Layer
 * migration.
 *
 * Under vitest, `astro/loaders` is aliased to `stubs/astro-loaders.ts`, which
 * returns `{ __loader: "glob", options }` — so `loader.options.generateId`
 * below is the real function from `src/content.config.ts`.
 */
import { describe, expect, it } from "vitest";

import { collections } from "../content.config.js";

type GenerateId = (ctx: {
  entry: string;
  data: Record<string, unknown>;
}) => string;

const loader = collections.cheatsheets.loader as unknown as {
  __loader: string;
  options: { generateId: GenerateId };
};
const generateId = loader.options.generateId;

describe("cheatsheets loader generateId", () => {
  it("uses the frontmatter slug as the entry id", () => {
    const id = generateId({
      entry: "asm/asm.md",
      data: { slug: "asm" },
    });
    expect(id).toBe("asm");
  });

  it("lets a frontmatter slug diverge from the file stem", () => {
    // The template contract makes `slug` authoritative — a renamed file keeps
    // its canonical id/URL.
    const id = generateId({
      entry: "renamed-dir/renamed-file.md",
      data: { slug: "canonical-slug" },
    });
    expect(id).toBe("canonical-slug");
  });

  it("falls back to the file stem when frontmatter has no slug", () => {
    const id = generateId({
      entry: "pi-dev/pi-dev.md",
      data: {},
    });
    expect(id).toBe("pi-dev");
  });

  it("falls back to the file stem when slug is not a usable string", () => {
    const id = generateId({
      entry: "nested/dir/tool.md",
      data: { slug: 42 },
    });
    expect(id).toBe("tool");
  });
});
