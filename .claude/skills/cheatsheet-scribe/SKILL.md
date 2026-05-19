---
name: cheatsheet-scribe
description: Author standardized AI cheatsheets in the awesome-cheatsheets format
inputs:
  - name: topic
    type: string
    required: true
    description: The tool, concept, or MCP server to create a cheatsheet for
  - name: draft_content
    type: string
    required: false
    description: Optional raw notes or outline from the user
outputs:
  - name: cheatsheet_md
    type: string
    description: A fully-formed cheatsheet .md file ready for validation
triggers:
  - /cheatsheet-scribe
  - create cheatsheet
  - write a cheatsheet about
---

# Cheatsheet Scribe

Scaffold and author standardized AI cheatsheets that conform to the template contract defined in `tools/template-contract.ts`.

## When to use

Trigger this skill when a user wants to create a new cheatsheet for:
- An AI tool (CLI/TUI agents, code assistants)
- An MCP server or protocol
- A conceptual method or workflow
- A comparison between tools/approaches

## Workflow

### Step 1: Gather requirements

Ask the user for:
1. **Topic** — What tool/concept is this about?
2. **Target audience** — Who is this cheatsheet for?
3. **Draft content** — Any existing notes, docs, or outlines?

If the user provides just a topic with no draft, proceed to Step 2 with an empty canvas.

### Step 2: Apply the template contract

Every cheatsheet must follow `template-contract.md`:

**Frontmatter (required):**
- `slug`: kebab-case identifier (e.g., `hermes-agent`)
- `title`: Human-readable title
- `category`: One of `tool`, `mcp`, `concept`, `comparison`
- `subcategory`: Optional free-form
- `summary`: 20-400 character sentence
- `last_updated`: ISO-8601 date (YYYY-MM-DD)
- `stale_after_days`: 1-730
- `tags`: 1-12 kebab-case tags
- `status`: `poc`, `published`, or `deprecated`
- `authors`: Optional author array
- `links`: Object with required `homepage`, optional `repo` and others

**Section structure (locked order):**
1. **One-liner**: `**One-line:** <summary>` (bold, before first H2)
2. `## Mental Model` — MUST contain a Mermaid flowchart
3. `## Step-by-Step Setup & Optimization` — numbered steps
4. `## Best Practices` — bullets
5. `## Quick Command Reference` — code blocks
6. `## Expected Outcomes` — what the user gets
7. `## Reference` — collapsed `<details>` block with sources

### Step 3: Draft the cheatsheet

Use the canonical Hermes Agent example (`examples/hermes-draft.md` → `examples/hermes-expected.md`) as a reference for:
- Tone: actionable, concise, expert-level
- Structure: locked 7-section format
- Mermaid: flowchart in Mental Model section
- Frontmatter: all required fields populated

Generate a first draft incorporating:
- User's draft content if provided
- Research from the tool's official docs
- Best practices from the community

### Step 4: Validate against contract

Before presenting to the user, verify:
- [ ] Frontmatter has all required fields
- [ ] All 6 sections present in correct order
- [ ] One-liner exists with `**One-line:**` prefix
- [ ] Mental Model contains a Mermaid block
- [ ] Reference section has `<details>` wrapper
- [ ] No custom section names or reordering

### Step 5: Output

Return the complete `.md` file content with:
- Frontmatter block at top
- Proper heading hierarchy
- Code blocks with language hints where applicable

## Examples

See `examples/` for input/output pairs:
- `hermes-draft.md` → `hermes-expected.md` (canonical reference)

## Dependencies

- Consumes `tools/template-contract.ts` for structural rules
- Output must pass `tools/validator` before merge