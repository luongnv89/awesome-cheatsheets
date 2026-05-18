# Cheatsheet Validator

Programmatic and CLI validation of cheatsheet Markdown files against the
locked template contract.

## What this is

The validator turns every rule that defines an "awesome cheatsheet" — frontmatter
schema, section order, Mermaid placement, reference details, external links —
into a single `validate(file, options?)` call that returns
`{ ok, errors: { rule, message, line? }[] }`.

It is the runtime half of the single-source-of-truth chain used by every other
authoring tool in the repo:

```
tools/template-contract.ts        (Zod + constants — the contract)
            │
            ▼
tools/validator/                  (this package — enforces the contract)
            │
            ├──▶ tools/cli/lint.ts          (pnpm cheatsheet:lint)
            └──▶ cheatsheet-scribe skill    (future — writes against the same rules)
```

If you change a rule, change `template-contract.ts` first. The validator only
re-exports what the contract declares; no rule is defined inline here.

## Hermes is the contract-anchor fixture

`cheatsheets/hermes-agent/hermes-agent.md` is the PoC cheatsheet the template
contract was derived from. It is treated as the canonical fixture: any change
to the contract, the validator orchestrator, or any individual rule MUST keep
Hermes lint-clean.

This invariant is gated by:

- `__tests__/hermes-regression.test.ts` — inline-snapshot regression test that
  asserts `validate(hermes, { skipLinks: true })` returns
  `{ ok: true, errors: [] }`. Vitest re-runs it on every commit.
- `.github/workflows/lint.yml` — CI step that additionally runs
  `pnpm cheatsheet:lint cheatsheets/hermes-agent/hermes-agent.md --no-links`
  on every PR and push to `main`.

If the snapshot ever fails, do **not** regenerate it with `-u` reflexively.
First decide whether the contract change is intended, whether Hermes itself
needs to be edited to match, or whether the rule has a bug.

## Programmatic usage

```ts
import { validate } from "tools/validator";

const result = await validate(
  "cheatsheets/hermes-agent/hermes-agent.md",
  { skipLinks: true }, // or { linkTimeoutMs: 10_000 } in production
);

if (!result.ok) {
  for (const e of result.errors) {
    console.error(`${e.rule}${e.line ? ` [line ${e.line}]` : ""}: ${e.message}`);
  }
}
```

The orchestrator never short-circuits — authors get a complete report on
every run.

## CLI usage

```
pnpm cheatsheet:lint <path-or-glob>... [--no-links] [--format=json] [--link-timeout-ms=N]
```

See `tools/cli/lint.ts` for the full flag surface and exit-code policy
(0 / 1 / 2 = pass / fail / usage error).

## Rule id catalog

The validator exports a `RULE_IDS` union (kebab-case strings). The CLI groups
errors by rule id; downstream tools (e.g. scribe) can pattern-match against
the same ids.

| Rule id | What it checks |
|---|---|
| `file-read` | The file could not be opened or read. |
| `markdown-parse` | The Markdown body failed to parse. |
| `frontmatter-missing` | No `---` YAML block at the top of the file. |
| `frontmatter-yaml-invalid` | The YAML block is present but malformed. |
| `frontmatter-schema` | YAML parses but does not satisfy `frontmatterSchema` in the contract. |
| `section-missing` | A `REQUIRED_SECTIONS` H2 heading is absent. |
| `section-out-of-order` | A required H2 appears, but in the wrong slot in the locked order. |
| `one-liner-missing` | The `**One-line:**` paragraph is absent between H1 and the first H2. |
| `one-liner-too-short` | The one-liner exists but falls short of `ONE_LINER_RULE.minLength`. |
| `reference-details-missing` | The `## Reference` section contains no `<details>` block. |
| `mermaid-missing-in-mental-model` | A required section (per `MERMAID_RULES.requiredIn`) has no `mermaid` fenced block. |
| `mermaid-fence-broken` | A `mermaid` fence opens but is unterminated, malformed, or wrapped wrong. |
| `mermaid-empty` | A `mermaid` fence is present but its body is empty / whitespace-only. |
| `link-broken` | An external `http(s)://` link failed the HEAD probe (suppressed via `--no-links` or `CHEATSHEET_LINT_SKIP_LINKS=1`). |

See `rules.ts` for the union of ids and the source-level pointers; each rule
module under `rules/*.ts` carries its own JSDoc with the contract reference.

## Adding a new rule

1. Define the rule in `tools/template-contract.ts` (constants, schemas, or
   thresholds) — the validator only enforces what the contract declares.
2. Implement a checker under `tools/validator/rules/<name>.ts` that returns a
   `ValidationError[]`. Register its new id in `tools/validator/rules.ts`
   (`RULE_IDS`).
3. Add tests under `tools/validator/__tests__/<name>.test.ts` covering at least
   one passing and one failing fixture. Place static fixtures in
   `__tests__/fixtures/`.

Wire the new rule into `tools/validator/index.ts`'s orchestrator (the file
imports each rule module and concatenates its errors). The CI step in
`.github/workflows/lint.yml` will run the new test automatically.
