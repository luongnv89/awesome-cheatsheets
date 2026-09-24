/**
 * Validator result + error types.
 *
 * Shared across every rule module so we have a single, stable shape for
 * `validate()` to aggregate. Rule ids are kebab-case strings — see
 * {@link ./rules.ts} for the union.
 *
 * @see ./index.ts (orchestration)
 * @see ./rules.ts (named rule ids)
 */

import type { RuleId } from "./rules.js";

/**
 * A single validation error.
 *
 * - `rule`    — kebab-case rule id (one of {@link RuleId}).
 * - `message` — human-readable explanation pointing at the offending content.
 * - `line`    — optional 1-based line number from the Markdown AST when the
 *               offending node carries a `position` field. Omitted entirely
 *               (not set to `undefined`) when no line info is available, to
 *               respect `exactOptionalPropertyTypes`.
 */
export interface ValidationError {
  rule: RuleId;
  message: string;
  line?: number;
}

/**
 * Aggregate result returned by `validate()`. `ok` is `true` iff `errors` is
 * empty.
 */
export interface ValidationResult {
  ok: boolean;
  errors: ValidationError[];
}

/**
 * External link-check mode for {@link ValidateOptions.links}.
 *
 * - `"check"` — probe external URLs (the default when the field is omitted
 *   and `CHEATSHEET_LINT_SKIP_LINKS` is unset).
 * - `"skip"`  — bypass the network check entirely. Tests should pass this
 *   explicitly to remain offline and deterministic.
 */
export type LinkCheckMode = "check" | "skip";

/**
 * Options accepted by `validate()`.
 *
 * - `linkTimeoutMs` — request timeout for the external-link check. Defaults
 *   to 5_000 ms (5 s), per AC #5.
 * - `links`         — link-check mode; `"skip"` disables the network check
 *   entirely (the default in test environments via vitest config env vars).
 */
export interface ValidateOptions {
  linkTimeoutMs?: number;
  links?: LinkCheckMode;
}

/**
 * Build a {@link ValidationError} while honouring `exactOptionalPropertyTypes`.
 *
 * Tsc forbids `{ line: undefined }` when `line?: number` — we must either
 * include the key or omit it. This helper centralises the conditional spread.
 */
export function makeError(
  rule: RuleId,
  message: string,
  line?: number,
): ValidationError {
  return line !== undefined ? { rule, message, line } : { rule, message };
}
