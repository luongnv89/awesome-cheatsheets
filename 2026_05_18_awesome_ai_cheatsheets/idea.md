# Idea: Awesome AI Cheatsheets

## Original Concept

An open-source catalog of cheatsheets focused on installing, using, and optimizing
popular AI tools — plus AI concept primers (agent skills, MCP, sub-agents).

**Goal:** one trusted place to quickly *skim* a reference or get a clear *overview*
of an AI tool/concept.

### Catalog page
- Latest / most-popular tools surfaced first
- Search, filter, sort by multiple criteria

### Per-cheatsheet requirements
- HTML format, interactive, rich visualization (SVG + Mermaid diagrams/charts)
- PDF-exportable
- Visible "last updated" date (age of content visible at a glance)
- Reference section (collapsed by default, links to upstream source)
- Best-practices section (do/don't, when to use / when not to)
- For tool cheatsheets: step-by-step setup, usage, optimization — all copy-paste-friendly
- Responsive by default
- Compact but clean visual design; surface what matters most

### Technical constraints
- Static, pre-rendered, serverless
- Hosted on GitHub Pages
- Tailwind CSS + shadcn/ui aesthetic
- Self-hosted assets (no CDN dependencies — content shouldn't break if a CDN dies)
- Automatic deployment (CI/CD on push)

## Clarified Understanding

### Audience
Primary: developers adopting AI tools (Claude Code, Cursor, MCP servers, sub-agents,
agent SDKs) who need a fast reference under deadline pressure. Secondary: AI-curious
learners and AI power-users — but the writing voice and depth lead with the developer.

### Core differentiation
**Curation.** Knowledge about AI tools is scattered across Twitter, Discord,
GitHub READMEs, and stale blog posts. The bet is that a single curated catalog
with a *visible quality bar* — and visible recency — beats search.

### Success in 6-12 months
A community hub. ~10-30 active contributors, 100+ cheatsheets, ~1k GitHub stars.
Sustainability via OSS community, not a solo grind.

### Quality control model
Template + linter + automated checks. Strict frontmatter schema, required sections,
broken-link checks, "last-updated" age warnings. CI gates PRs before review.

## Target Audience

Tier 1 (writing voice optimized for):
- Software engineers integrating Claude Code, Cursor, Cline, Aider, etc.
- Developers building with MCP servers and sub-agent patterns
- AI-tooling early adopters who need to *compare and choose*

Tier 2 (welcome but not primary):
- AI-curious learners scanning the landscape
- AI power-users hunting obscure optimization tricks

## Goals & Objectives

- Become the go-to "I want to learn / refresh on X AI tool" destination
- Maintain a visible freshness bar (no stale content)
- Build a healthy contributor community via clear template + automated checks
- Stay 100% static / zero-cost to host (GitHub Pages + CI)

## Technical Context

- **Stack:** Astro (MD/MDX content, zero-JS default, Tailwind + shadcn-style components)
- **Authoring:** MDX (markdown + embeddable React components for interactive bits)
- **Styling:** Tailwind CSS + shadcn/ui
- **Diagrams:** Mermaid (static rendered at build) + inline SVG
- **PDF export:** client-side print stylesheet (no server)
- **Hosting:** GitHub Pages, static output, no CDN dependencies — all assets self-hosted
- **Deployment:** GitHub Actions on push to `main`
- **Search/filter:** client-side (e.g., Pagefind or Fuse.js) — no backend
- **Timeline:** Side project, ~5-10 hrs/week. MVP target: 4-8 weeks.
- **Launch content:** 10-15 cheatsheets (credible catalog day 1)
- **Budget:** Bootstrapped / free tier only

### Constraints
- No CDN dependencies — pin and vendor everything
- No server, no database — everything pre-rendered at build
- Templates and linters must be in place *before* opening to contributors
- Author bandwidth is the bottleneck — automation matters more than features

## Discussion Notes

- The "curation, not just collection" framing is the most defensible angle —
  competitors in this space are mostly link-list "awesome-*" repos which
  decay quickly and have no quality signal.
- Freshness as a UX-first concept (visible age, warnings on stale entries)
  could be the single most differentiating feature.
- Risk: opening to contributors *before* template/linter is mature → quality
  collapse. Build the rails first.
- Risk: "all three audiences" can dilute voice — keep developer as default
  reader, treat the other two as readers who get value from a clearly-written
  dev resource.
