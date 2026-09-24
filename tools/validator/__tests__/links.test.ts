/**
 * External link rule tests — AC #5 (broken-link check with a configurable
 * timeout) and AC #6 (passing + failing fixture).
 *
 * Network calls are NEVER made: we stub `globalThis.fetch` via Vitest.
 * Vitest config also sets `CHEATSHEET_LINT_SKIP_LINKS=1` as defense in depth,
 * so we explicitly unset it for the duration of each test that exercises the
 * link path. We restore the env var afterwards.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { resolve } from "node:path";

import { validate } from "../index.js";

const fixture = (name: string): string =>
  resolve(import.meta.dirname, "fixtures", name);

const ORIGINAL_SKIP = process.env["CHEATSHEET_LINT_SKIP_LINKS"];

describe("link rule (mocked fetch)", () => {
  beforeEach(() => {
    delete process.env["CHEATSHEET_LINT_SKIP_LINKS"];
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    if (ORIGINAL_SKIP !== undefined) {
      process.env["CHEATSHEET_LINT_SKIP_LINKS"] = ORIGINAL_SKIP;
    } else {
      delete process.env["CHEATSHEET_LINT_SKIP_LINKS"];
    }
  });

  it("emits no link-broken when all responses are 200", async () => {
    const mockFetch = vi.fn().mockResolvedValue(
      new Response("", { status: 200 }),
    );
    vi.stubGlobal("fetch", mockFetch);

    const result = await validate(fixture("with-link.md"), {});
    const linkErrors = result.errors.filter((e) => e.rule === "link-broken");
    expect(linkErrors).toEqual([]);
    // We actually called fetch for the discovered URLs.
    expect(mockFetch).toHaveBeenCalled();
  });

  it("emits link-broken on a 404 response", async () => {
    const mockFetch = vi.fn().mockResolvedValue(
      new Response("", { status: 404 }),
    );
    vi.stubGlobal("fetch", mockFetch);

    const result = await validate(fixture("with-link.md"), {});
    const linkErrors = result.errors.filter((e) => e.rule === "link-broken");
    expect(linkErrors.length).toBeGreaterThan(0);
    expect(linkErrors[0]?.message).toMatch(/HTTP 404/);
  });

  it("emits link-broken on a network failure", async () => {
    const mockFetch = vi.fn().mockRejectedValue(new Error("network down"));
    vi.stubGlobal("fetch", mockFetch);

    const result = await validate(fixture("with-link.md"), {});
    const linkErrors = result.errors.filter((e) => e.rule === "link-broken");
    expect(linkErrors.length).toBeGreaterThan(0);
    expect(linkErrors[0]?.message).toMatch(/network down/);
  });

  it("respects the linkTimeoutMs option (AbortError surfaced)", async () => {
    // Simulate a slow host by making fetch wait until aborted.
    const mockFetch = vi.fn().mockImplementation((_url: string, init: RequestInit) => {
      return new Promise((_resolve, reject) => {
        const signal = init.signal!;
        signal.addEventListener("abort", () => {
          const err = new Error("aborted");
          err.name = "AbortError";
          reject(err);
        });
      });
    });
    vi.stubGlobal("fetch", mockFetch);

    const result = await validate(fixture("with-link.md"), {
      linkTimeoutMs: 25,
    });
    const linkErrors = result.errors.filter((e) => e.rule === "link-broken");
    expect(linkErrors.length).toBeGreaterThan(0);
    expect(linkErrors[0]?.message).toMatch(/timeout after 25 ms/);
  });

  it("cancels the response body before returning (socket release)", async () => {
    // An unconsumed body keeps the keep-alive socket open; probe() must
    // cancel (or drain) it before resolving — issue #139 / F-BUG-004.
    const cancel = vi.fn().mockResolvedValue(undefined);
    const mockFetch = vi.fn().mockResolvedValue({
      status: 200,
      body: { cancel },
    });
    vi.stubGlobal("fetch", mockFetch);

    const result = await validate(fixture("with-link.md"), {});
    const linkErrors = result.errors.filter((e) => e.rule === "link-broken");
    expect(linkErrors).toEqual([]);
    expect(cancel).toHaveBeenCalled();
  });

  it("caps in-flight probes under the concurrency limit", async () => {
    // many-links.md has 12 distinct URLs > the in-flight cap; a delayed
    // fetch records the peak parallelism — issue #139 / F-PERF-002.
    let inFlight = 0;
    let maxInFlight = 0;
    const mockFetch = vi.fn().mockImplementation(async () => {
      inFlight += 1;
      maxInFlight = Math.max(maxInFlight, inFlight);
      await new Promise((resolve) => setTimeout(resolve, 5));
      inFlight -= 1;
      return { status: 200, body: null };
    });
    vi.stubGlobal("fetch", mockFetch);

    const result = await validate(fixture("many-links.md"), {});
    const linkErrors = result.errors.filter((e) => e.rule === "link-broken");
    expect(linkErrors).toEqual([]);
    expect(mockFetch).toHaveBeenCalledTimes(12);
    // Still parallel — the cap bounds concurrency, it doesn't serialize.
    expect(maxInFlight).toBeGreaterThan(1);
    expect(maxInFlight).toBeLessThanOrEqual(8);
  });

  it('links: "skip" bypasses the network entirely', async () => {
    const mockFetch = vi.fn();
    vi.stubGlobal("fetch", mockFetch);

    const result = await validate(fixture("with-link.md"), { links: "skip" });
    const linkErrors = result.errors.filter((e) => e.rule === "link-broken");
    expect(linkErrors).toEqual([]);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("CHEATSHEET_LINT_SKIP_LINKS=1 bypasses the network entirely", async () => {
    process.env["CHEATSHEET_LINT_SKIP_LINKS"] = "1";
    const mockFetch = vi.fn();
    vi.stubGlobal("fetch", mockFetch);

    const result = await validate(fixture("with-link.md"), {});
    const linkErrors = result.errors.filter((e) => e.rule === "link-broken");
    expect(linkErrors).toEqual([]);
    expect(mockFetch).not.toHaveBeenCalled();
  });
});
