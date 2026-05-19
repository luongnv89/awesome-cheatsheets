# Awesome AI Cheatsheets

A collection of standardized AI cheatsheets — each optimized for quick reference and fresh, comparable information.

## Cheatsheets

| Cheatsheet | Summary | Category |
|------------|---------|----------|
| [Hermes Agent](/cheatsheets/hermes-agent/hermes-agent.md) | Autonomous CLI/TUI AI agent with persistent memory, skills, multi-channel gateways, and Kanban | tool |
| *(more coming...)* | | |

## Why This Exists

Most AI tool docs are either:
- **Too shallow** — one-page READMEs that skip the nuance
- **Too deep** — hundreds of pages of reference docs

These cheatsheets hit the middle ground: actionable, concise, expert-level guides that:
- Follow a standardized 7-section template
- Include Mermaid flowcharts for mental models
- Stay fresh with automated stale detection
- Cross-link for easy comparison

## Contributing

Want to add a cheatsheet? Follow the **30-minute contributor tutorial**:

👉 **[Contributor Tutorial](/docs/contributing.md)**

Quick start:
1. Install Claude Code
2. Run `/cheatsheet-scribe`
3. Answer review questions
4. Open a PR

The tutorial walks you through the entire flow — from raw notes to merged cheatsheet.

## Template Contract

All cheatsheets follow the [template contract](/.claude/skills/cheatsheet-scribe/template-contract.md):
- Required frontmatter (slug, title, category, tags, status, links)
- 7 sections in locked order
- Mermaid diagram in Mental Model
- Collapsed Reference section

Run the linter:

```bash
pnpm cheatsheet:lint cheatsheets/<slug>/<slug>.md
```

## Repository Structure

```
awesome-cheatsheets/
├── cheatsheets/          # Published cheatsheets (one folder per slug)
│   └── hermes-agent/
│       └── hermes-agent.md
├── docs/                 # Documentation
│   └── contributing.md   # Contributor tutorial
├── tools/
│   └── validator/        # Template validation
└── .claude/skills/
    └── cheatsheet-scribe/  # Authoring skill
```

## License

- Code: MIT
- Content: CC-BY 4.0