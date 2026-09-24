/**
 * Contract tests for the security-headers layer (issue #144, F-SEC-003).
 *
 * The deploy target (GitHub Pages) cannot emit HTTP headers, so policy is
 * carried in two places that must not drift:
 *  - `SecurityHeaders.astro` — the meta CSP + referrer meta rendered into
 *    every page head (the part GH Pages can enforce today);
 *  - `public/_headers` — the Pages-platform header config carrying the
 *    headers meta tags cannot express (`X-Frame-Options`,
 *    `frame-ancestors`, `X-Content-Type-Options`, `Referrer-Policy`,
 *    `Permissions-Policy`) for hosts that honor it.
 *
 * These tests pin the presence of each required directive and the parity of
 * the two CSP directive lists (modulo `frame-ancestors`, which is
 * headers-only per the CSP spec).
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const META_PATH = resolve(
  process.cwd(),
  "src/components/SecurityHeaders.astro",
);
const HEADERS_PATH = resolve(process.cwd(), "public/_headers");

const meta = readFileSync(META_PATH, "utf8");
const headers = readFileSync(HEADERS_PATH, "utf8");

/** Extract the `content="…"` CSP string from the meta component. */
function metaCsp(): string {
  const m = meta.match(/http-equiv="Content-Security-Policy"\s+content="([^"]+)"/);
  expect(m, "meta CSP not found in SecurityHeaders.astro").toBeTruthy();
  return m![1];
}

/** Extract the `Content-Security-Policy:` value from the _headers file. */
function headersCsp(): string {
  const m = headers.match(/^\s*Content-Security-Policy:\s*(.+)$/m);
  expect(m, "CSP header not found in public/_headers").toBeTruthy();
  return m![1].trim();
}

/** Directive name → value map for comparison. */
function directives(csp: string): Map<string, string> {
  const map = new Map<string, string>();
  for (const part of csp.split(";")) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const [name, ...rest] = trimmed.split(/\s+/);
    map.set(name, rest.join(" "));
  }
  return map;
}

describe("SecurityHeaders.astro — meta policy (issue #144)", () => {
  it("delivers a Content-Security-Policy meta tag", () => {
    expect(meta).toMatch(/http-equiv="Content-Security-Policy"/);
  });

  it("delivers a referrer policy meta tag", () => {
    expect(meta).toMatch(
      /<meta name="referrer" content="strict-origin-when-cross-origin"/,
    );
  });

  it("scopes script-src to self, inline, and the path-scoped gtag origin", () => {
    const d = directives(metaCsp());
    expect(d.get("script-src")).toBe(
      "'self' 'unsafe-inline' https://www.googletagmanager.com/gtag/",
    );
  });

  it("does not put frame-ancestors in the meta CSP (spec: ignored in meta)", () => {
    expect(directives(metaCsp()).has("frame-ancestors")).toBe(false);
  });
});

describe("public/_headers — Pages header config (issue #144)", () => {
  it("sets X-Frame-Options", () => {
    expect(headers).toMatch(/^\s*X-Frame-Options:\s*DENY/m);
  });

  it("sets a referrer policy", () => {
    expect(headers).toMatch(
      /^\s*Referrer-Policy:\s*strict-origin-when-cross-origin/m,
    );
  });

  it("sets frame-ancestors inside the CSP header", () => {
    expect(directives(headersCsp()).get("frame-ancestors")).toBe("'none'");
  });

  it("sets X-Content-Type-Options: nosniff", () => {
    expect(headers).toMatch(/^\s*X-Content-Type-Options:\s*nosniff/m);
  });

  it("keeps both CSP directive lists in sync modulo frame-ancestors", () => {
    const meta = directives(metaCsp());
    const hdr = directives(headersCsp());
    expect(hdr.get("frame-ancestors")).toBe("'none'");
    hdr.delete("frame-ancestors");
    expect(hdr).toEqual(meta);
  });
});
