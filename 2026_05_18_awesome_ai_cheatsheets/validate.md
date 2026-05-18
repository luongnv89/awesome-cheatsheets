# Validation: Awesome AI Cheatsheets

## Quick Verdict
**Build it (cautiously) — the locked launch list materially strengthens the wedge.**
*(Was: Maybe. The concrete 6-tools + 5-concepts list narrows scope and surfaces a real
under-covered slice — terminal-native agents (OpenCode/Pi/OpenClaw/Hermes Agent/Codex)
plus harness engineering — that the existing awesome-lists do not deeply document in
rich format.)*

## Why
Two updates from your locked launch list:
1. **Scope is now defensible.** 11 cheatsheets across 6 tools + 5 concepts is a credible
   single-developer v1. The earlier "all AI tools" framing has collapsed to a focused
   slice the incumbent awesome-lists *index* but do not *teach*.
2. **The under-covered slice is real.** Hermes Agent, OpenClaw, Pi, and OpenCode all have
   significant traction (68k★ OpenClaw, 160k★ OpenCode) but rich-format, comparable,
   PDF-exportable references are missing. "Harness engineering" is a hot post-leak topic
   with mostly blog-post coverage — no canonical interactive reference.

The earlier risk still stands: **maintenance treadmill** in a weekly-mutating space, on
weekends only. So the verdict is "Build it" *conditional on* shipping the rails (linter,
freshness CI, scaffolder) before authoring the second cheatsheet.

## Per-Cheatsheet Coverage Check

How well does each launch-list item already exist in rich form?

| Cheatsheet | Existing rich-format coverage | Strength of wedge |
|---|---|---|
| **Claude Code** | `awesomeclaude.ai/code-cheatsheet`, `FlorianBruniaux/claude-code-ultimate-guide`, scriptbyai blog posts | **Weak** — most-covered tool in the list. Compete on interactive Mermaid harness diagrams + PDF export, not novelty. |
| **Codex CLI** | OpenAI's own docs + a few blog comparisons (shareuhack, augmentcode) | **Medium** — official docs are reference-only; no third-party rich cheatsheet found. |
| **OpenCode** | `opencode.ai/docs` is solid; John Maeda Medium tutorials; `bradAGI/awesome-cli-coding-agents` indexes it | **Medium** — official docs cover features but no comparable cheatsheet format. |
| **OpenClaw** | DigitalOcean/KDnuggets/Milvus blog posts, official site, GitHub README | **Strong** — 68k★ tool, no canonical interactive reference. Big opportunity. |
| **Pi Coding Agent** | `pi.dev`, Scott Logic blog, dev.to article | **Strong** — small, recently popular, no rich reference. |
| **Hermes Agent** | NousResearch docs, `0xNyk/awesome-hermes-agent`, `mudrii/hermes-agent-docs` | **Strong** — most under-documented tool on the list. Could become the canonical reference. |
| **Agent Skills** | Anthropic docs, `ComposioHQ/awesome-claude-skills`, blog posts | **Medium** — concept is well-blogged; no single rich primer. |
| **Sub-agents** | Anthropic docs, alexop.dev, antstack guide | **Medium** — taught alongside Claude Code; rarely standalone. |
| **MCP** | `glama.ai`, Anthropic spec, `wong2/awesome-mcp-servers` | **Weak-medium** — most-covered concept. Compete on a clean mental model + diagram. |
| **Harness Engineering** | dev.to, Anthropic engineering blog, claudecode-lab, multiple Medium posts | **Strong** — hot topic, *no* rich-format reference exists. **Likely the strongest discovery hook.** |
| **Prompt Engineering** | Many cheatsheets (FareedKhan-dev, mlane, RepublicOfBotv109, freecodecamp) | **Weak** — most saturated. Differentiate via "patterns library" framing or skip in v1. |

### Implications
- **4 of 11 items have a strong wedge** (OpenClaw, Pi, Hermes Agent, Harness Engineering).
  Lead with these for launch impact — they're the discovery hooks.
- **5 of 11 are medium** — value comes from format consistency and comparability, not novelty.
- **2 of 11 are weak** (Claude Code, Prompt Engineering) — saturated. Consider:
  whether to include them as "table stakes" so the catalog feels complete, or to drop
  Prompt Engineering for v1 and replace it with something like "Choosing between Claude Code,
  Codex, OpenCode, Pi" — a comparison cheatsheet that *only* this catalog can ship,
  because no one else has standardized sections across these tools.

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

## Ratings (updated for locked launch list)

| Dimension           | Score | Reasoning |
|---------------------|-------|-----------|
| Creativity          | 7/10  | (+1) Including Hermes Agent / Pi / OpenClaw / harness engineering — items the incumbents under-cover — gives the catalog a recognizable identity beyond format alone. |
| Feasibility         | 6/10  | (+1) 11 cheatsheets is a more honest weekend scope than 10–15 across all AI tools. Treadmill risk still real, but it's now N tools, not the whole field. |
| Market Impact       | 6/10  | (+1) 4 cheatsheets land in genuinely under-served terrain (Hermes / Pi / OpenClaw / Harness). Discovery hooks are present. |
| Technical Execution | 8/10  | Unchanged. Astro + MDX + Tailwind + shadcn + Pagefind on GH Pages remains the right stack. Content quality, not code, is the real bar. |

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

> **Terminal-native AI Coding Agents — the rich-format cheatsheet catalog.**
>
> 6 tools (Hermes Agent · OpenClaw · Pi · Claude Code · Codex · OpenCode) and 5 concepts
> (Agent Skills · Sub-agents · MCP · Harness Engineering · Prompt Engineering),
> with standardized sections so any two cheatsheets are directly comparable.
>
> Static. Serverless. Self-hosted assets. Every cheatsheet shows its age on the page,
> ships a Mermaid diagram of the mental model, has copy-paste setup blocks, prints to
> a one-page PDF, and links out to the canonical awesome-list and registry for deeper
> dives. Built in 4–8 weekends; maintained via quarterly review + automated staleness
> CI.
>
> The 4 strongest discovery hooks: **Hermes Agent**, **Pi Coding Agent**, **OpenClaw**,
> and **Harness Engineering** — all popular topics in 2026 with no canonical rich-format
> reference today.

The reframe vs the original idea: from *"all popular AI tools + AI concepts"* to
*"the comparable rich-format reference for terminal-native AI coding agents and the
concepts that power them."* Tighter niche, sharper identity, defensible against
incumbents who index but don't teach.

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
- 3 cheatsheets, picked to stress-test the template across a tool, a concept, and a
  comparison: **OpenClaw** (tool with strong wedge), **Harness Engineering** (concept,
  strongest discovery hook), **MCP** (concept, most-cited so format must hold up).
- Iterate the template against real content; lock the section schema.

**Phase 2 — Credible catalog (weekends 5–7)**
- Add the remaining 8: Hermes Agent, Pi, Claude Code, Codex, OpenCode, Agent Skills,
  Sub-agents, Prompt Engineering (or replace Prompt Engineering with a
  *Choosing-between-CLI-agents comparison cheatsheet* — likely a stronger pick).
- Catalog page with search/filter/sort; recency badges live.

**Phase 3 — Launch (weekend 8)**
- Cross-link out to the major awesome-lists and registries
- Soft launch on HN / r/ClaudeAI / r/LocalLLaMA / X
- Open contribution channel with the scaffolder + PR template + linter live from day 1

**Phase 4 — Flywheel (ongoing)**
- Quarterly review of every cheatsheet; CI-flagged stale ones promote to top of triage
- One new cheatsheet / month minimum, contributed or authored
- Re-evaluate scope at 90 days: expand category only after PoC category has 10+ entries
  and ≥3 external contributors
