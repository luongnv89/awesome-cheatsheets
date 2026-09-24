---
slug: nonbundled-mermaid
title: Nonbundled Mermaid Fixture
category: tool
summary: Cheatsheet whose Mermaid diagram type is outside bundledDiagrams — exercises the mermaid-engine-not-bundled rule.
last_updated: 2026-05-18
stale_after_days: 90
tags: [fixture]
links:
  homepage: https://example.com/
---

# Nonbundled Mermaid Fixture

**One-line:** Carries a well-formed sequenceDiagram fence so the bundled-engine rule rejects a type the client build trims.

## Installation

```bash
curl -fsSL https://example.com/install.sh | bash
```

## Step-by-Step Setup & Optimization

### Step 1 — Install

```bash
example install
```

## Best Practices

- Do this

## Quick Command Reference

| Goal | Command |
|---|---|
| Install | `example install` |

## Expected Outcomes

- A working setup

## Reference

<details>
<summary>Sources</summary>

- https://example.com/

</details>

## Extra Diagram

```mermaid
sequenceDiagram
  Alice->>Bob: Hello
  Bob-->>Alice: Hi
```

```mermaid
---
config:
  layout: elk
---
flowchart LR
  A --> B
```
