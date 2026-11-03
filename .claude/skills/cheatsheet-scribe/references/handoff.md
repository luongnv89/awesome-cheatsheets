# Handoff templates (Step 7)

Build these after the contributor approves the review answers. Print them as copyable blocks after the Result, Evidence, Uncertainty, and Decision lines. Do not stage, commit, or push — those steps stay with the contributor.

## 1. Conventional commit message

Lower-case, imperative:

```
docs(cheatsheet): add <slug> cheatsheet for <tool/concept>
```

Examples:
- `docs(cheatsheet): add ollama-cli cheatsheet for local LLM inference`
- `docs(cheatsheet): add hermes-agent cheatsheet for autonomous AI agents`
- `docs(cheatsheet): add mcp-sequencer cheatsheet for MCP protocol workflows`

## 2. PR title

Same as the commit message; it may be more descriptive:

```
docs(cheatsheet): add <slug> cheatsheet — <one-line summary>
```

Example:

```
docs(cheatsheet): add ollama-cli cheatsheet — local LLM inference from CLI
```

## 3. PR description (recommended, optional for the contributor)

Tick a Validation box only when this run observed that result; leave it unticked otherwise.

```markdown
## Summary
<summary from frontmatter>

## Sections
- Installation: <one-line installer summary, platforms covered>
- Step-by-Step: <n> steps
- Best Practices: <n> items
- Commands: <n> code examples

## Validation
- [ ] `pnpm cheatsheet:lint <file> --no-links` exits 0
- [ ] Full link check passes (or: not run — <reason>)
- [ ] Review questions addressed
```
