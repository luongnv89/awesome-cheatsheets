/**
 * Unit tests for the shared freshness predicate.
 *
 * The catalog (`src/pages/index.astro`) and the cheatsheet layout
 * (`src/layouts/CheatsheetLayout.astro`) must agree on whether an entry is
 * stale. Pinning the predicate here prevents drift.
 */
import { describe, expect, it } from "vitest";

import { daysSinceUpdate, isStale } from "../freshness.js";

describe("daysSinceUpdate", () => {
  it("returns 0 when the date is today", () => {
    const today = new Date("2026-05-19T12:00:00Z");
    expect(daysSinceUpdate("2026-05-19", today)).toBe(0);
  });

  it("returns N for dates N days in the past", () => {
    const today = new Date("2026-05-19T12:00:00Z");
    expect(daysSinceUpdate("2026-05-09", today)).toBe(10);
  });

  it("returns null for invalid date strings", () => {
    expect(daysSinceUpdate("not-a-date")).toBeNull();
  });

  it("accepts a Date object as lastUpdated", () => {
    const today = new Date("2026-05-19T00:00:00Z");
    const last = new Date("2026-05-18T00:00:00Z");
    expect(daysSinceUpdate(last, today)).toBe(1);
  });
});

describe("isStale", () => {
  const today = new Date("2026-05-19T12:00:00Z");

  it("returns false when daysSince <= staleAfterDays (fresh)", () => {
    expect(isStale("2026-05-18", 90, today)).toBe(false);
  });

  it("returns false when daysSince === staleAfterDays (exactly on the edge)", () => {
    // exactly 90 days old, threshold 90 — not yet stale (the predicate is
    // strict `>`, matching CheatsheetLayout.astro's `daysSinceUpdate > stale_after_days`).
    const ninety = new Date("2026-02-18T12:00:00Z");
    expect(isStale(ninety, 90, today)).toBe(false);
  });

  it("returns true when daysSince > staleAfterDays", () => {
    // 100 days old, threshold 90 → stale
    const old = new Date("2026-02-08T12:00:00Z");
    expect(isStale(old, 90, today)).toBe(true);
  });

  it("returns false for an invalid date (fails open)", () => {
    expect(isStale("never", 30, today)).toBe(false);
  });

  it("returns false for a non-positive threshold", () => {
    expect(isStale("2020-01-01", 0, today)).toBe(false);
    expect(isStale("2020-01-01", -1, today)).toBe(false);
  });

  it("returns false for a non-finite threshold", () => {
    expect(isStale("2020-01-01", Number.NaN, today)).toBe(false);
  });

  it("matches the Hermes fixture: 2026-05-18 + 90 days is fresh on 2026-05-19", () => {
    expect(isStale("2026-05-18", 90, today)).toBe(false);
  });

  it("matches the E2E stale fixture: 2020-01-01 + 1 day is stale today", () => {
    expect(isStale("2020-01-01", 1, today)).toBe(true);
  });
});
