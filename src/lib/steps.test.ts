/**
 * Unit tests for `src/lib/steps.ts` — the build-time step metadata
 * helpers used by the catalog cards and the cheatsheet meta row.
 */
import { describe, expect, it } from "vitest";

import { countSteps, sumStepMinutes } from "./steps";

describe("countSteps", () => {
  it("counts `### Step N — Title` headings", () => {
    const body = [
      "## Step-by-Step Setup & Optimization",
      "",
      "### Step 1 — Install",
      "",
      "do things",
      "",
      "### Step 2 — Configure",
      "",
      "### Step 3 — Verify",
    ].join("\n");
    expect(countSteps(body)).toBe(3);
  });

  it("accepts en dash and hyphen separators", () => {
    const body = "### Step 1 – Alpha\n\n### Step 2 - Beta";
    expect(countSteps(body)).toBe(2);
  });

  it("returns 0 when no step headings exist", () => {
    expect(countSteps("## Installation\n\n### Overview\n")).toBe(0);
  });

  it("ignores headings that are not Step H3s", () => {
    const body = [
      "## Step 1 — not an h3",
      "### Steps 1 — plural",
      "### Step One — spelled out",
      "#### Step 4 — h4",
    ].join("\n");
    expect(countSteps(body)).toBe(0);
  });
});

describe("sumStepMinutes", () => {
  it("sums `**Time:**` values across step-meta paragraphs", () => {
    const body = [
      "### Step 1 — Install",
      "",
      "**Goal:** installed · **Time:** ~5 min · **Level:** beginner",
      "",
      "### Step 2 — Configure",
      "",
      "**Goal:** configured · **Time:** 10 min · **Level:** intermediate",
    ].join("\n");
    expect(sumStepMinutes(body)).toBe(15);
  });

  it("converts hour units to minutes", () => {
    const body = "**Time:** 1 h\n\n**Time:** ~2 hours";
    expect(sumStepMinutes(body)).toBe(180);
  });

  it("returns 0 without Time markers", () => {
    expect(sumStepMinutes("**Goal:** x · **Level:** beginner")).toBe(0);
  });
});
