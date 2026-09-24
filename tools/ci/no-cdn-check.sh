#!/usr/bin/env bash
#
# no-cdn-check.sh — Build-time gate for issue #23.
#
# Scans the built site for references to external CDN hosts. The PRD (§3 M7, §5
# Security & Privacy, §9 R7) requires that the published site ship with zero
# third-party CDN dependencies — all CSS, JS, fonts, and images must be either
# bundled by the build or served from the same origin. This script enforces
# that constraint by grepping the build output for a fixed set of well-known
# CDN host prefixes.
#
# Scope:
#   The script intentionally only inspects the build artifact directory
#   (default: `dist`). Source files (e.g. cheatsheet markdown) may legitimately
#   document CDN URLs as part of an instructional snippet — those get rendered
#   as visible text via the Markdown pipeline, so the *output* is the right
#   place to enforce the no-CDN rule. If a cheatsheet body shows a CDN URL as
#   prose, this script will flag it; the contributor either rewrites the
#   example to be self-hosted or escapes the URL so it is not parsed as a link.
#
# Usage:
#   bash tools/ci/no-cdn-check.sh            # scans ./dist
#   bash tools/ci/no-cdn-check.sh some/dir   # scans the given directory
#
# Exit codes:
#   0 — no non-allowlisted CDN URLs found (or directory is empty)
#   1 — at least one non-allowlisted CDN URL found, OR directory is missing
#   2 — usage error
#
# Patterns covered:
#   https://cdn.*                    generic CDN subdomain
#   https://unpkg.com                npm CDN
#   https://cdnjs.*                  cdnjs (cloudflare)
#   https://fonts.googleapis.com     Google Fonts stylesheet host
#   https://fonts.gstatic.com        Google Fonts font binary host
#   https://maxcdn.*                 MaxCDN (BootstrapCDN)
#   https://ajax.googleapis.com      Google-hosted libraries
#   https://*.jsdelivr.net           jsDelivr
#   https://stackpath.bootstrapcdn.com  StackPath BootstrapCDN
#   https://*.googletagmanager.com   Google Tag Manager (see allowlist below)
#
# Allowlist (explicit — each entry names the source file that justifies it):
#   https://www.googletagmanager.com/gtag/js
#     The consent-gated Google Analytics loader emitted by
#     src/components/ConsentManager.astro. The URL string is inlined into
#     every built page, but the request is only ever fired after the visitor
#     accepts analytics cookies (issue #122). Any *other*
#     googletagmanager.com URL — gtm.js, ns.html, a different path or
#     subdomain — is still flagged. The allowlist is applied per line by
#     stripping sanctioned URLs and re-testing the remainder, so a line that
#     mixes an allowlisted URL with a real CDN URL still fails.
#
# Notes for maintainers:
#   - The pattern list is conservative: it catches the most common drift
#     vectors (Bootstrap, jQuery, font icons, Google Fonts). It is *not* a
#     comprehensive denylist of every CDN that has ever existed.
#   - We use a single `grep -rnE` pass with one combined alternation so the
#     scan stays O(files) instead of running grep nine times.
#   - The matcher is anchored on `https://`. http (insecure) URLs would also
#     be a problem but are independently flagged by browser mixed-content
#     warnings; the policy is "HTTPS-only and self-hosted", so the http
#     variant is not separately enumerated here.

set -euo pipefail

if [ "$#" -gt 1 ]; then
  echo "Usage: $0 [dist-dir]" >&2
  exit 2
fi

target="${1:-dist}"

if [ ! -d "$target" ]; then
  echo "✗ no-cdn-check: directory not found: $target" >&2
  echo "  Hint: run \`pnpm build\` first to produce \`dist/\`." >&2
  exit 1
fi

# Combined alternation. Each branch starts with `https://`. The `.` in `cdn.`,
# `cdnjs.`, and `maxcdn.` is regex-escaped because in extended-regex grep `.`
# would otherwise match any character.
pattern='https://cdn\.|https://unpkg\.com|https://cdnjs\.|https://fonts\.googleapis\.com|https://fonts\.gstatic\.com|https://maxcdn\.|https://ajax\.googleapis\.com|https://[a-z0-9.-]*jsdelivr\.net|https://stackpath\.bootstrapcdn\.com|https://[a-z0-9.-]*googletagmanager\.com'

# Explicit allowlist (see the header). Each entry is a URL *prefix*: the match
# plus any trailing URL characters are stripped from a line before the line is
# re-tested against `pattern`. Keep entries narrow — a full path plus its `?`
# boundary, never a bare host — and name the source file that justifies each
# one. The trailing `\?` means `/gtag/js` is only allowed in its emitted query
# form; a bare `/gtag/js` or a look-alike path (`/gtag/json`, …) is flagged.
allowlist_pattern='https://www\.googletagmanager\.com/gtag/js\?'

# `grep -rnE` walks the tree, prints `path:lineno:matchline`. We capture and
# inspect the output so we can render a contributor-friendly error block. Use
# `|| true` because grep exits 1 on no-match and we want to handle that as
# the success case.
matches="$(grep -rnE --binary-files=without-match "$pattern" "$target" 2>/dev/null || true)"

if [ -z "$matches" ]; then
  echo "✓ no-cdn-check: $target is CDN-free."
  exit 0
fi

# `url_pattern` is the same set of hosts as `pattern` but with a trailing path
# fragment so the message shows the *full* offending URL rather than just the
# host prefix. We don't use this pattern for the initial scan because the
# initial scan is line-oriented and we want minimal false negatives on
# unusual quoting; the per-match extraction is allowed to be slightly more
# permissive about what counts as a "URL".
url_pattern='https://[a-zA-Z0-9._/-]*(cdn\.|unpkg\.com|cdnjs\.|fonts\.googleapis\.com|fonts\.gstatic\.com|maxcdn\.|ajax\.googleapis\.com|jsdelivr\.net|stackpath\.bootstrapcdn\.com|googletagmanager\.com)[a-zA-Z0-9._/?&=%-]*'

# Allowlist pass: for every matched line, strip sanctioned URL occurrences and
# re-test the remainder against `pattern`. A line is a violation only when a
# non-allowlisted match survives — so a line carrying both the consent-snippet
# URL and, say, an unpkg URL is still reported.
violations=""
allowed_count=0
while IFS= read -r line; do
  [ -z "$line" ] && continue
  file_and_line="${line%%:*}"
  rest="${line#*:}"
  lineno="${rest%%:*}"
  body="${rest#*:}"

  stripped="$(printf '%s\n' "$body" | sed -E "s|${allowlist_pattern}[a-zA-Z0-9._/?&=%-]*||g")"
  if ! printf '%s\n' "$stripped" | grep -qE "$pattern"; then
    hits="$(printf '%s\n' "$body" | grep -oE "$allowlist_pattern" | wc -l | tr -d ' ')"
    allowed_count=$((allowed_count + hits))
    continue
  fi

  # Report the first surviving URL — extracted from `stripped` so the printed
  # offender is never the allowlisted one.
  url="$(printf '%s\n' "$stripped" | grep -oE "$url_pattern" | head -n1)"
  if [ -z "$url" ]; then
    url="$(printf '%s\n' "$stripped" | grep -oE "$pattern" | head -n1)"
  fi
  violations="${violations}  ${file_and_line}:${lineno}: ${url:-<see full line>}\n"
done <<< "$matches"

if [ -z "$violations" ]; then
  echo "✓ no-cdn-check: $target is CDN-free ($allowed_count allowlisted consent-gated URL(s) ignored)."
  exit 0
fi

echo "✗ no-cdn-check: external CDN URL(s) found in $target" >&2
echo "" >&2
# Show each offender as `file:line: matched-url` (collected above, with the
# allowlisted URLs already stripped so the printed offender is never the
# sanctioned consent snippet).
printf '%b' "$violations" >&2

echo "" >&2
echo "  Fix: remove the external dependency or self-host the asset." >&2
echo "  Local check: \`pnpm check:no-cdn\`" >&2
exit 1
