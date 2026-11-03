/**
 * External link rule — extract every `http(s)://` URL from the AST and probe
 * it with `HEAD`, then at most one `GET` retry (see "Network details"). The
 * configurable timeout (default 5_000 ms per AC #5) applies per request, so a
 * link whose HEAD is rejected and whose GET hangs takes up to twice that.
 *
 * The rule is opt-out via `links: "skip"` or the `CHEATSHEET_LINT_SKIP_LINKS`
 * environment variable — required for offline test runs and to keep CI cheap.
 *
 * URLs are collected from:
 *  - `link` nodes (`[text](url)` and `<url>` autolinks)
 *  - `image` nodes (`![alt](url)`)
 *  - Bare URLs inside text/HTML nodes (regex extraction).
 *
 * We de-duplicate URLs (a single network probe per distinct URL) and emit
 * one `link-broken` error per failure, carrying the line of the *first*
 * occurrence in the document.
 *
 * Network details:
 *  - We try `HEAD` first because it's the lightest probe. Some hosts reject
 *    HEAD even though the page loads — e.g. news.ycombinator.com answers
 *    `405`, support.google.com answers `404`, while `GET` returns 200. When
 *    HEAD returns one of `HEAD_RETRY_WITH_GET_STATUSES` (403, 404, 405, 501)
 *    we retry once with `GET` and judge the link by the GET status (issue
 *    #206). Any other 4xx/5xx, or a 2xx/3xx HEAD, is final: a successful
 *    HEAD never costs a second request. The retry can only turn a failure
 *    into a pass when GET itself succeeds, so it cannot hide a real break.
 *    `429` is not retried — an immediate second request would be throttled
 *    too.
 *  - Each request (HEAD, and the GET retry if any) gets its own
 *    `AbortController` timer, so a slow host can't stall the validator.
 *
 * @see ../../../2026_05_18_awesome_ai_cheatsheets/prd.md §3 M1, §3 M5
 */

import type { Image, Link, Root } from "mdast";

import {
  makeError,
  type LinkCheckMode,
  type ValidationError,
} from "../types.js";

interface FoundLink {
  url: string;
  line?: number;
}

/**
 * Bound on simultaneously in-flight link probes. An unbounded `Promise.all`
 * fan-out opens one socket per distinct URL — a link-heavy sheet can exhaust
 * file descriptors or trip host rate limits (issue #139 / F-PERF-002).
 */
const MAX_IN_FLIGHT = 8;

/**
 * Walk the AST and collect every http(s) URL we can find, recording the line
 * of the first occurrence per URL.
 */
function collectLinks(tree: Root): FoundLink[] {
  const byUrl = new Map<string, FoundLink>();

  const remember = (url: string, line: number | undefined): void => {
    if (!/^https?:\/\//i.test(url)) return;
    if (byUrl.has(url)) return;
    byUrl.set(url, line !== undefined ? { url, line } : { url });
  };

  type AnyNode = {
    type: string;
    url?: string;
    value?: string;
    position?: { start: { line: number } };
    children?: AnyNode[];
  };

  const visit = (node: AnyNode): void => {
    const line = node.position?.start.line;
    if (node.type === "link") remember((node as Link).url, line);
    if (node.type === "image") remember((node as Image).url, line);
    // Pick up bare URLs inside text/html nodes.
    if (
      (node.type === "text" || node.type === "html") &&
      typeof node.value === "string"
    ) {
      const regex = /https?:\/\/[^\s<>")\]]+/gi;
      let match: RegExpExecArray | null;
      while ((match = regex.exec(node.value)) !== null) {
        // Strip common trailing punctuation that isn't part of the URL.
        const trimmed = match[0].replace(/[.,;:!?)]+$/, "");
        remember(trimmed, line);
      }
    }
    if (Array.isArray(node.children)) {
      for (const child of node.children) visit(child);
    }
  };

  visit(tree as unknown as AnyNode);
  return [...byUrl.values()];
}

/**
 * HEAD statuses that some hosts return for pages that load fine with GET.
 * 403 and 404 come from hosts that block or don't route HEAD; 405 and 501 mean
 * the method itself is unsupported. A link with one of these HEAD statuses
 * gets one GET retry before it is reported as broken.
 */
export const HEAD_RETRY_WITH_GET_STATUSES: ReadonlySet<number> = new Set([
  403, 404, 405, 501,
]);

type ProbeOutcome = { status: number } | { error: string };

/**
 * Send one request and release its body. Returns the HTTP status, or a short
 * error string on a network error / timeout.
 */
async function request(
  url: string,
  method: "HEAD" | "GET",
  timeoutMs: number,
): Promise<ProbeOutcome> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method,
      redirect: "follow",
      signal: controller.signal,
    });
    // Release the connection before returning: an unconsumed body keeps the
    // keep-alive socket open and stalls the pool (issue #139 / F-BUG-004).
    // Best-effort — a stream that rejects cancellation still lets us report
    // the status we already received. For GET this also stops the download.
    try {
      await res.body?.cancel();
    } catch {
      /* ignore — the HTTP status is already known */
    }
    return { status: res.status };
  } catch (err) {
    if (err instanceof Error) {
      if (err.name === "AbortError") {
        return { error: `timeout after ${timeoutMs} ms` };
      }
      return { error: err.message };
    }
    return { error: String(err) };
  } finally {
    clearTimeout(timer);
  }
}

const isOk = (status: number): boolean => status >= 200 && status < 400;

/**
 * Probe a single URL: HEAD first, then one GET retry when HEAD returns a
 * status in `HEAD_RETRY_WITH_GET_STATUSES`. Any non-2xx/3xx final response
 * (or a network error / timeout) counts as broken.
 *
 * Returns a short reason string on failure, `undefined` on success.
 */
async function probe(url: string, timeoutMs: number): Promise<string | undefined> {
  const head = await request(url, "HEAD", timeoutMs);
  if ("error" in head) return head.error;
  if (isOk(head.status)) return undefined;
  if (!HEAD_RETRY_WITH_GET_STATUSES.has(head.status)) {
    return `HTTP ${head.status}`;
  }

  const get = await request(url, "GET", timeoutMs);
  if ("error" in get) return `HTTP ${head.status} on HEAD; GET failed: ${get.error}`;
  if (isOk(get.status)) return undefined;
  return get.status === head.status
    ? `HTTP ${get.status}`
    : `HTTP ${get.status} (HEAD returned ${head.status})`;
}

/**
 * Run the link check.
 *
 * `links: "skip"` (or env `CHEATSHEET_LINT_SKIP_LINKS=1`) short-circuits the
 * whole check — returns `[]` immediately. This is the default for tests and
 * for the smoke script in the resolver plan.
 */
export async function checkLinks(
  tree: Root,
  options: { linkTimeoutMs?: number; links?: LinkCheckMode },
): Promise<ValidationError[]> {
  const skipFromEnv = process.env["CHEATSHEET_LINT_SKIP_LINKS"] === "1";
  if (options.links === "skip" || skipFromEnv) return [];

  const timeoutMs = options.linkTimeoutMs ?? 5_000;
  const links = collectLinks(tree);

  // Probe with a bounded worker pool — link checks are I/O bound, but an
  // unbounded fan-out opens one socket per distinct URL (issue #139 /
  // F-PERF-002). MAX_IN_FLIGHT caps concurrent probes while keeping the
  // pool saturated.
  const results: ({ link: FoundLink; reason: string | undefined } | undefined)[] =
    new Array(links.length);
  let nextIndex = 0;
  const workers = Array.from(
    { length: Math.min(MAX_IN_FLIGHT, links.length) },
    async () => {
      while (nextIndex < links.length) {
        const index = nextIndex;
        nextIndex += 1;
        const link = links[index];
        if (link === undefined) return; // noUncheckedIndexedAccess guard.
        results[index] = { link, reason: await probe(link.url, timeoutMs) };
      }
    },
  );
  await Promise.all(workers);

  const errors: ValidationError[] = [];
  for (const result of results) {
    if (result === undefined) continue;
    const { link, reason } = result;
    if (reason === undefined) continue;
    errors.push(
      makeError(
        "link-broken",
        `external link ${link.url} appears broken: ${reason}`,
        link.line,
      ),
    );
  }
  return errors;
}
