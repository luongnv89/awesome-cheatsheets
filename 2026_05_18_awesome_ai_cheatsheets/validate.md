# Validation: Awesome AI Cheatsheets

## Quick Verdict
**Maybe — narrow the wedge before committing.**

## Why
The "trusted curated hub" lane you wanted to own is already taken: `hesreallyhim/awesome-claude-code`
sits at 36.8k stars and is widely cited as *the* canonical curated list for this exact space
(Claude Code, MCP, agent skills). The empirically defensible angle is **not curation** — it is
**format + freshness**: a rich, interactive, PDF-exportable, visibly dated reference for a
*narrow* slice of the AI tooling stack. As scoped today (10–15 cheatsheets across all AI tools
+ AI concepts, on weekends only, with a strict template/linter/MDX/Mermaid/search/filter
pipeline) the project is buildable but the **maintenance treadmill** is the real long-term
risk in a space that mutates weekly. Ship the rails, narrow the scope, then re-evaluate.

## Competitive Landscape

| Competitor | What They Do | Pricing | Traction | Key Weakness |
|---|---|---|---|---|
| [hesreallyhim/awesome-claude-code](https://github.com/hesreallyhim/awesome-claude-code) | Canonical hand-curated awesome-list for Claude Code skills, hooks, slash commands, agents, MCP, plugins | Free / OSS | **36.8k+ stars** (May 2026) | Plain GitHub README — no visualisation, no comparison, no freshness signal per entry |
| [affaan-m/everything-claude-code](https://github.com/) (aggregator) | "Firehose" aggregator listing every Claude Code resource | Free / OSS | **~141k stars** | Un-curated; users "close tab feeling more lost than when they started" |
| [awesomeclaude.ai](https://awesomeclaude.ai/) | Web directory for Claude resources, includes a Claude Code 2.0 visual cheatsheet (PDF/PNG) | Free | Active, web-native | Single-vendor (Claude only); cheatsheets are static images, not interactive HTML |
| [agentpedia.codes](https://agentpedia.codes/) | "#1 MCP Server Hub" — 1,500+ MCP servers, 500+ rules & workflows, multi-IDE (Antigravity / Cursor / Windsurf) | Free / community | Substantial — multi-IDE pitch | Catalog, not cheatsheets — no step-by-step references or best-practice sections |
| [glama.ai/mcp/servers](https://glama.ai/mcp/servers) | MCP registry — 23,754 servers, verified/scored, with Glama Gateway | Freemium | Production registry, well known | MCP-only; commercial product with reg+gateway lock-in |
| [claudefa.st](https://claudefa.st/blog/tools/resources/awesome-claude-code) | Blog/aggregator that ranks the 11 best "awesome-claude-code" lists | Free | Frequent blog cadence | A meta-list — not the reference itself |
| [scriptbyai.com](https://www.scriptbyai.com/claude-code-commands-cheat-sheet/) | Blog publishing AI tool cheatsheets (Claude Code commands, resource lists) for 2026 | Free / ads | Cited in many search results | Blog format — search-indexed but not a navigable catalog |
| [devhints.io](https://devhints.io/) | The classic web-native developer cheatsheet site (rstacruz, 17k+ stars) | Free | Mature, beloved, **AI category empty** | Predates the AI-tooling explosion — no Claude/MCP/agent content |
| [cheatography.com](https://cheatography.com/) | User-generated cheat sheets, 6,900+ in 25 languages | Free | Mature platform | UGC quality varies; format is static PDFs, not interactive |
| [FareedKhan-dev/prompt-engineering-cheatsheet](https://github.com/FareedKhan-dev/prompt-engineering-cheatsheet) / mlane / RepublicOfBotv109 | Single-topic prompt-engineering cheatsheets in GitHub README form | Free / OSS | Modest but referenced | Single-topic, README format, no comparison or freshness |

### White Space Analysis
What is genuinely missing in the current market:

1. **Interactive, web-native cheatsheets for the AI-tooling stack.**
   `devhints.io` solved this format for dev tooling years ago (regex, vim, bash) and has *no*
   AI category. Every active AI competitor ships either a flat GitHub README, a blog post,
   or a static PDF/PNG.
2. **Visible recency / staleness signal as a first-class UX element.**
   The "stale awesome-list" problem is a documented 2026 pain point — "a developer landing
   on awesome-X in 2026 might end up installing a tool that's been deprecated for two years,
   with nobody warning them." No competitor surfaces "last updated" prominently per entry.
3. **Cross-tool comparison via standardized structure.**
   A reader who wants "Claude Code vs Cursor vs Cline vs Aider, setup and optimization"
   today has to open four blog posts written in four voices. Standardised sections enable
   real comparison.
4. **Concept primers (MCP / agent skills / sub-agents) alongside tool references.**
   Most competitors do *one* of "tool directory" *or* "concept primer". A reader new to the
   field needs both, side by side, with links between them.
5. **Self-hosted assets — durability.**
   Every CDN-dependent competitor will eventually break. A pinned, self-hosted style sheet
   is a long-tail credibility signal.

### Differentiation Assessment

> **This conflicts with the user's stated #1 differentiator ("Curation — no trusted hub").**
> A 36.8k-star canonical curated list already exists, plus a 141k-star aggregator, plus
> multiple web directories. "Trusted curated hub" is **taken**. Holding to that framing
> means competing on the incumbent's strength while underweighting your own.

The honest differentiation is **format + freshness + comparability**:
- Rich, interactive HTML (Mermaid, SVG, copy-paste blocks, PDF export)
- Visible recency UX (last-updated dates with stale-warning thresholds)
- Standardized sections (setup / usage / optimize / best-practice / reference) that make
  cheatsheets comparable across tools
- Self-hosted assets so the site doesn't rot when a CDN dies
- Concept primers (MCP, agent skills, sub-agents) co-located with tool refs

This is a real lane, but it is narrower than "the trusted hub for AI tools." Frame it
that way, scope to it, and the project is defensible. Frame it as "another curated hub"
and you are picking a fight you can't win as a side project.

### Failed Predecessors
- **Generic awesome-* lists that decayed.** The Dev.to post "Stale Awesome Lists: How I
  Built a Self-Regulating Curation System" (Jan 2026) documents how "GitHub has thousands
  of awesome-* lists but half of them are dead." This is the dominant failure mode in your
  target shape — not loud shutdowns but silent rot.
- **AI Graveyard / 142+ dead AI services** (BoingBoing, May 2026; ToolDirectory.AI). Many of
  those carried catalog/directory components that died with the parent product. Lesson:
  catalogs without a clear *user job* don't survive once novelty fades. Make sure the
  reader's job ("I need to install X today and not get a stale answer") is sharp.
- **Cheatography** (mature, 6,900+ sheets) is the cautionary "UGC cheat-sheet site" —
  it shipped scale but never escaped variable quality. This is exactly the failure your
  template + linter + automated checks are meant to prevent — that gate must be in place
  *before* you open contributions.

## Similar Products
See the table above. The closest direct overlap is `hesreallyhim/awesome-claude-code` in
content scope, `devhints.io` in format (but no AI content), and `agentpedia.codes` / `glama.ai`
in catalog UX (but they index servers, not learning material).

## Differentiation
The narrow, defensible wedge:
> "The rich-format, comparably-structured, visibly-dated reference for the
> Claude Code + MCP + agent-skills + sub-agent stack — readable in two minutes,
> printable as a PDF, and trustworthy because the age is on the page."

Not "all AI tools + all AI knowledge." That dilutes against `awesome-claude-code` (curation),
`agentpedia.codes` (catalog), `glama.ai` (registry), and `devhints` (general-purpose).

## Strengths
- **Real format gap.** No incumbent ships interactive HTML cheatsheets with Mermaid+SVG+PDF
  export for the AI-tooling stack. `devhints.io` proved the format works and left the AI
  category empty.
- **Real freshness pain.** "Stale awesome-list" is a 2026-documented pain point. Making
  recency a first-class UX element is genuinely missing in the market.
- **Tech stack matches goal.** Astro + MDX + Tailwind + shadcn + Pagefind + GH Pages is a
  proven, free, scalable static stack with a strong contributor on-ramp.
- **Quality bar before contributions.** "Template + linter + auto-checks" is the right
  governance model — and the one that competitors (especially `cheatography` and the dead
  awesome-lists) failed to install in time.
- **Self-hosting assets.** Small detail, but a credibility moat over the long tail.

## Concerns
1. **The stated #1 differentiator ("curation") empirically does not hold.** 36.8k-star
   incumbent owns that. Reframe to format+freshness or accept you're entering on the
   incumbent's terms.
2. **Maintenance treadmill is the real risk, not the build.** Claude Code, MCP, and the
   agent-skills space change weekly. 15 cheatsheets × weekly churn × weekends only =
   permanent state of "almost up to date." The very recency UX you're shipping will
   *flag your own staleness*. Plan the maintenance flywheel before launch.
3. **Scope is wider than bandwidth.** "All popular AI tools + AI knowledge concepts" on
   ~5–10 hrs/week is ambitious. The PoC should be 5–8 cheatsheets in a single
   tightly-scoped category (e.g., Claude Code stack), not 10–15 across the field.
4. **Contributor model contains an upstream dependency.** Community contributions require:
   strict frontmatter schema, broken-link CI check, MDX-component contract, screenshot/
   diagram guidelines, freshness-bot, PR review SLA. If any are missing at launch the
   quality bar collapses.
5. **MDX is a barrier for tier-2/tier-3 audiences.** "AI-curious learners" and even some
   "AI power-users" will not write JSX. If contribution growth is the success criterion,
   plan a low-friction `.md` path with the interactive parts handled by site components,
   not authors.
6. **Audience drift risk.** "Dev focus first, all three audiences" is a known dilution
   pattern. Lock the developer voice in v1; don't try to rephrase for learners until
   the catalog has a clear identity.
7. **No git repo initialized yet.** The skill's "commit + push" acceptance criterion
   can't be satisfied until `git init` + remote setup is done. Flagged for follow-up.

## Ratings

| Dimension           | Score | Reasoning |
|---------------------|-------|-----------|
| Creativity          | 6/10  | The format-for-AI-tools angle is fresh; the catalog-of-cheatsheets concept is not. |
| Feasibility         | 5/10  | Buildable in 4–8 weekends. Maintainable long-term on weekends? Less clear. The treadmill drags the score. |
| Market Impact       | 5/10  | Real audience, real format gap — but the largest reader segment already has habits with the 36.8k-star incumbent. Hard to displace; easier to coexist as a complement. |
| Technical Execution | 8/10  | Astro + MDX + Tailwind + shadcn + Pagefind on GH Pages is a well-trodden stack with strong tooling. The hard part is *content*, not code. |

## How to Strengthen

1. **Reframe the project around format + freshness, not curation.** Update `idea.md` and
   the eventual README to lead with "the rich-format reference that tells you how stale
   it is" — not "the trusted curated hub."
2. **Narrow the launch slice.** Pick *one* category for v1 — recommendation: "Claude Code
   stack" (Claude Code itself + MCP + agent skills + sub-agents + a handful of common
   MCP servers). 5–8 cheatsheets, one voice, one comparability story. Expand only after
   the format proves itself.
3. **Ship the freshness UX as the headline.** Each cheatsheet should display its age
   prominently. Add automated weekly CI that flags anything older than N days with a
   visible "may be stale" banner. This *is* the moat; make it loud.
4. **Build the rails before the catalog.** Order of operations: (a) template schema +
   frontmatter validator, (b) MDX component library (Mermaid block, copy-block, do/don't,
   reference-collapse), (c) linter + broken-link CI, (d) Pagefind search, (e) deploy
   pipeline, (f) then content. Do not invert.
5. **Two contribution paths.** Default `.md` for prose-heavy contributors (90% of value);
   `.mdx` escape hatch only when authors need bespoke interactivity. Reduces tier-2/tier-3
   friction.
6. **Coexist, don't compete.** From day one, link out to `hesreallyhim/awesome-claude-code`,
   `glama.ai`, `agentpedia.codes` from relevant cheatsheets. Becoming "the rich reference
   the awesome-lists link to" is a faster path to traction than trying to replace them.
7. **Install the maintenance flywheel before launch.** Decide: who reviews quarterly?
   What's the stale-threshold? Is there a "needs-update" GitHub label issue-spawning bot?
   If none of this is in place, the freshness promise breaks within 90 days.
8. **Pick the PDF export approach early.** Print stylesheets work for prose; they often
   break Mermaid + interactive components. Test PDF export on the first cheatsheet, not
   the tenth.
9. **Plan the contributor on-ramp.** A "make a new cheatsheet in 10 minutes" tutorial,
   a working PR template, and a `pnpm new-cheatsheet` scaffolder will determine whether
   you actually get to 30 active contributors.

## Enhanced Version

> **AI Stack Cheatsheets** — the rich-format, visibly-dated developer reference for the
> Claude Code + MCP + agent-skills + sub-agents stack.
>
> Static. Serverless. Self-hosted assets. Every cheatsheet shows its age on the page,
> ships a Mermaid diagram of the mental model, prints to a one-page PDF, and links out
> to the canonical curated list. Standardized sections so two cheatsheets are always
> comparable at a glance.
>
> Launch with the rails (template + linter + freshness CI + scaffolder), 5–8 high-quality
> reference cheatsheets in *one* category, and a clear contribution model. Expand to
> adjacent categories only after the format wins on its own.

The reframe is small but consequential: from *"another catalog"* to *"the format competitors
don't ship, scoped to the niche they care about most."*

## Implementation Roadmap

**Phase 0 — Rails (weekends 1–2)**
- Astro project on GH Pages with auto-deploy CI
- Tailwind + shadcn-equivalent components (vendored, no CDN)
- MDX content pipeline + Mermaid build-time render
- Frontmatter schema validator (Zod) + required-sections linter
- Broken-link CI check
- Pagefind client-side search index
- Print stylesheet + PDF export verified on a stub cheatsheet

**Phase 1 — PoC content (weekends 3–4)**
- 3 cheatsheets in the Claude Code stack: Claude Code itself, MCP overview, agent skills
- Iterate the template against real content; lock the section schema

**Phase 2 — Credible catalog (weekends 5–7)**
- Add 4–5 more: sub-agents primer, a top-3 MCP servers (e.g., filesystem, git, web),
  a prompt-engineering primer, optional: Cursor or Cline comparison
- Catalog page with search/filter/sort; recency badges live

**Phase 3 — Launch (weekend 8)**
- Cross-link out to the major awesome-lists and registries
- Soft launch on HN / r/ClaudeAI / r/LocalLLaMA / X
- Open contribution channel with the scaffolder + PR template + linter live from day 1

**Phase 4 — Flywheel (ongoing)**
- Quarterly review of every cheatsheet; CI-flagged stale ones promote to top of triage
- One new cheatsheet / month minimum, contributed or authored
- Re-evaluate scope at 90 days: expand category only after PoC category has 10+ entries
  and ≥3 external contributors
