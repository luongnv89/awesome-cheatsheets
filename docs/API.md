# API and CLI Reference

This repository is primarily a static site, but it includes reusable TypeScript tooling for validating cheatsheets and scanning freshness.

## Validator API

Entry point:

```ts
import { validate } from "./tools/validator/index.js";

const result = await validate("src/content/cheatsheets/hermes-agent/hermes-agent.md", {
  skipLinks: true,
});
```

Result shape:

```ts
interface ValidationResult {
  ok: boolean;
  errors: {
    rule: string;
    message: string;
    line?: number;
  }[];
}
```

Options:

| Option | Type | Description |
|---|---|---|
| `skipLinks` | `boolean` | Skip external link checks. Also available with `CHEATSHEET_LINT_SKIP_LINKS=1`. |
| `linkTimeoutMs` | `number` | Override the default external link timeout. |

Rules are implemented under `tools/validator/rules/` and exported rule IDs live in `tools/validator/rules.ts`.

## CLI: `pnpm cheatsheet:lint`

Usage:

```bash
pnpm cheatsheet:lint <path-or-glob>... [options]
```

Options:

| Option | Description |
|---|---|
| `--format=human` | Human-readable output, the default. |
| `--format=json` | Single JSON document suitable for automation. |
| `--no-links` | Skip external link checks. |
| `--link-timeout-ms=<n>` | Set external link timeout in milliseconds. |
| `-h`, `--help` | Show help. |

Exit codes:

| Code | Meaning |
|---:|---|
| `0` | All files passed. |
| `1` | At least one file failed validation. |
| `2` | Usage error, such as no inputs or an unknown flag. |

Examples:

```bash
pnpm cheatsheet:lint src/content/cheatsheets/hermes-agent/hermes-agent.md
pnpm cheatsheet:lint 'src/content/cheatsheets/**/*.md' --no-links
pnpm --silent cheatsheet:lint src/content/cheatsheets/pi-dev/pi-dev.md --format=json
```

## Content schema

Astro validates cheatsheet frontmatter in `src/content/config.ts`.

Important fields:

| Field | Description |
|---|---|
| `title` | Display title. |
| `category` | One of `tool`, `mcp`, `concept`, `comparison`. |
| `summary` | Catalog-card summary. |
| `last_updated` | ISO date used for freshness. |
| `stale_after_days` | Freshness budget. |
| `tags` | Kebab-case tags. |
| `status` | `poc`, `published`, or `deprecated`. |
| `links.homepage` | Required homepage URL. |

## Freshness scanner

Script:

```bash
pnpm freshness:scan -- --dry-run
```

The non-dry-run mode expects GitHub Actions environment variables:

| Variable | Purpose |
|---|---|
| `GITHUB_TOKEN` | Opens or searches issues. |
| `GITHUB_REPOSITORY` | Target repo in `owner/repo` format. |
| `CONTENT_DIR` | Optional override for tests/fixtures. |
| `FRESHNESS_DRY_RUN=1` | Dry-run mode without writes. |

## No-CDN checker

Script:

```bash
pnpm check:no-cdn
```

It scans `dist/` for third-party CDN URLs after build. The policy and host list are documented in `docs/contributing.md`.
