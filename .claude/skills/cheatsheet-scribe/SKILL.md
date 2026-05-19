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

**SAFETY: No Fabrication**

The skill MUST NOT fabricate references, commands, or facts not present in:
- The user's draft content
- Official documentation the user has provided
- Answers explicitly given by the user

**Concrete examples of fabrication (NEVER do these):**
- Inventing a CLI flag like `--force` that doesn't exist
- Citing a source or URL that wasn't provided
- Assuming a default value or behavior without confirmation
- Creating a "Quick Command Reference" entry for a command you haven't verified

**When in doubt, ASK the contributor** rather than guess. If the user cannot provide the information, mark the section as incomplete rather than inventing content.

### Step 1.5: Check for existing cheatsheet

Before proceeding to drafting, derive the slug from the topic (kebab-case). Check if `cheatsheets/<slug>/` already exists in the repository.

**If the cheatsheet already exists:**
- Ask for explicit confirmation: "A cheatsheet for '<slug>' already exists. Do you want to overwrite it? Type 'yes, overwrite' to confirm."
- Do NOT proceed with Step 2 until explicit confirmation is received
- If the user declines, abort gracefully

**If the cheatsheet does not exist:** Proceed to Step 2.

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

After drafting, call the validator to check conformance:

```typescript
import { validate } from "tools/validator";

// After writing the draft to a temp file
const result = await validate("/path/to/draft.md");

if (!result.ok) {
  // Surface every failure with its rule name
  console.log("Validation failed:");
  for (const e of result.errors) {
    console.log(`  - ${e.rule}: ${e.message}${e.line ? ` (line ${e.line})` : ""}`);
  }
  // Ask contributor to fix before proceeding
}
```

**Rules invoked by validator (single source of truth):**
- `frontmatter-missing`, `frontmatter-yaml-invalid`, `frontmatter-schema`
- `section-missing`, `section-out-of-order`
- `one-liner-missing`, `one-liner-too-short`
- `reference-details-missing`
- `mermaid-missing-in-mental-model`, `mermaid-fence-broken`, `mermaid-empty`
- `link-broken` (optional, skip via `skipLinks: true`)

Do NOT duplicate validation logic in this skill — the validator decides, the skill orchestrates.

### Step 5: Output

Return the complete `.md` file content with:
- Frontmatter block at top
- Proper heading hierarchy
- Code blocks with language hints where applicable

### Step 6: Review Questions

After validation passes, emit **2–4 specific review questions** tied to ambiguous or opinion-driven parts of the draft.

**Requirements:**
- Questions MUST be content-specific, not generic ("looks good?", "is this okay?" are DISALLOWED per PRD M2 bullet 1)
- Each question should target a specific decision point where contributor input matters

**Analyze the draft for these ambiguity types:**
1. **Naming ambiguity** — unclear slug, title, or tag choices
2. **Scope ambiguity** — whether a section covers too much or too little
3. **Technical ambiguity** — command correctness, version currency, best practice validity
4. **Audience ambiguity** — whether content assumes the right skill level
5. **Completeness ambiguity** — missing edge cases, alternative workflows, or reference links

**Example valid questions (NOT "looks good?"):**

❌ "Does this look good?"
❌ "Is the cheatsheet ready?"

✅ "The slug `ollama-run` vs `ollama-cli` — which is more widely recognized in the community?"
✅ "The Mental Model shows a sequential flow, but the tool supports parallel agents. Should I add an alternative branch?"
✅ "The `run` commands reference v0.1.2 — should I note that v0.1.3 is the latest stable?"
✅ "This cheatsheet assumes Linux. Should I add a note for macOS/Windows users?"

**Output format:**
```
## Review Questions

1. [specific question about naming/slug/tags]
2. [specific question about technical accuracy]
3. [specific question about scope/completeness]
4. [specific question about audience/assumptions]

Please confirm each item or suggest alternatives before I finalize.
```

Wait for contributor response before proceeding. If they request changes, iterate on the draft and re-validate before re-presenting questions.

### Step 7: Commit Message & PR Title

On contributor approval of all review questions, suggest:

1. **Conventional commit message** (lower-case, imperative):
   ```
   docs(cheatsheet): add <slug> cheatsheet for <tool/concept>
   ```

   Examples:
   - `docs(cheatsheet): add ollama-cli cheatsheet for local LLM inference`
   - `docs(cheatsheet): add hermes-agent cheatsheet for autonomous AI agents`
   - `docs(cheatsheet): add mcp-sequencer cheatsheet for MCP protocol workflows`

2. **PR title** (same as commit message, can be more descriptive):
   ```
   docs(cheatsheet): add <slug> cheatsheet — <one-line summary>
   ```

   Example:
   ```
   docs(cheatsheet): add ollama-cli cheatsheet — local LLM inference from CLI
   ```

3. **PR description** (recommended, optional for contributor):
   ```markdown
   ## Summary
   <summary from frontmatter>

   ## Sections
   - Mental Model: <brief description of flowchart>
   - Step-by-Step: <n> steps
   - Best Practices: <n> items
   - Commands: <n> code examples

   ## Validation
   - [x] Passes template-contract.md validation
   - [x] Review questions addressed
   ```

**DO NOT stage, commit, or push** — those steps stay with the human contributor.

Output the commit message and PR title as a clearly formatted block the contributor can copy.

## Examples

See `examples/` for input/output pairs:
- `hermes-draft.md` → `hermes-expected.md` (canonical reference)

## Dependencies

- Consumes `tools/validator` — the single source of truth for all validation rules
- Output must pass `tools/validator` before merge
- Section list in this skill MUST drift-test against `template-contract.md`

## See Also

- **[Contributor Tutorial](/docs/contributing.md)** — 30-minute walkthrough for new contributors: install Claude Code → invoke `/cheatsheet-scribe` → answer review questions → open PR
- [Template contract](/.claude/skills/cheatsheet-scribe/template-contract.md) — structural rules every cheatsheet must obey