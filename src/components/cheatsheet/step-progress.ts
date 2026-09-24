/**
 * Progress-state helpers for `StepChecklist.astro`.
 *
 * Checkbox state persists in localStorage under `cheatsheet-progress:<slug>`
 * as a JSON object (`Record<stepKey, boolean>`). localStorage is
 * user-writable, so the stored payload can't be trusted to be that shape:
 * `JSON.parse` happily returns `42`, `"x"`, `true`, `null`, or `[1]` for
 * non-object payloads, and a primitive "state" then crashes the strict-mode
 * `state[stepKey] = …` write on checkbox change (issue #139 / F-BUG-005).
 */

/**
 * Parse a raw localStorage value into progress state. Returns `{}` for
 * missing, malformed, or non-object payloads — including arrays, which are
 * objects but not the `Record<string, boolean>` shape we persist.
 */
export function parseProgress(raw: string | null): Record<string, boolean> {
  if (!raw) return {};
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return {};
  }
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    return {};
  }
  return parsed as Record<string, boolean>;
}

/** The slice of `Storage` the progress read needs — injectable for tests. */
type ProgressStorage = { getItem(key: string): string | null };

/**
 * Read progress state for `storageKey`. `storage` may be passed lazily —
 * `() => localStorage` — because even *accessing* `window.localStorage`
 * can throw SecurityError when the browser blocks storage; the thunk keeps
 * that throw inside the guard too. Swallows storage access errors the same
 * way it swallows bad JSON — progress is nice-to-have, never worth
 * breaking the page over.
 */
export function loadProgress(
  storage: ProgressStorage | (() => ProgressStorage),
  storageKey: string,
): Record<string, boolean> {
  try {
    const s = typeof storage === "function" ? storage() : storage;
    return parseProgress(s.getItem(storageKey));
  } catch {
    return {};
  }
}
