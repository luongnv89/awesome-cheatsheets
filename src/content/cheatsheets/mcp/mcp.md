---
slug: mcp
title: MCP — Model Context Protocol Cheatsheet
category: mcp
subcategory: protocol
summary: "Practical guide to Model Context Protocol: understand hosts, clients, servers, tools, resources, prompts, auth boundaries, and debugging workflows."
last_updated: 2026-05-19
stale_after_days: 90
tags: [mcp, model-context-protocol, tools, resources, prompts, servers, debugging]
status: draft
authors:
  - name: luongnv89
links:
  homepage: https://modelcontextprotocol.io/
  docs: https://modelcontextprotocol.io/docs/
  specification: https://modelcontextprotocol.io/specification/latest
  server-concepts: https://modelcontextprotocol.io/docs/learn/server-concepts
  tools: https://modelcontextprotocol.io/specification/draft/server/tools
---

# MCP — Model Context Protocol Cheatsheet

**One-line:** Model Context Protocol is an open protocol for connecting LLM applications to external tools, resources, and prompts through standardized servers that hosts can discover and call safely.

## Installation

MCP is a protocol, so installation depends on whether you are using an existing server, building a server, or configuring a host.

```bash
# Typical Node project bootstrap for an MCP server
mkdir my-mcp-server
cd my-mcp-server
npm init -y
npm install @modelcontextprotocol/sdk
```

First-run checklist:

1. Pick the host application that will connect to MCP servers.
2. Choose or build a server with a narrow capability set.
3. Define tools, resources, and prompts with clear schemas.
4. Test locally before connecting credentials or production systems.

## Step-by-Step Setup & Optimization

### Step 1 — Learn the topology

| Component | Role |
|---|---|
| Host | The user-facing AI app or IDE. |
| Client | The host-side MCP connection to one server. |
| Server | A process exposing capabilities through MCP. |
| Tool | Model-controlled action with an input schema. |
| Resource | Application-controlled context such as files or records. |
| Prompt | Reusable prompt template exposed by the server. |

### Step 2 — Start with read-only capabilities

Before exposing write actions, build resources and read-only tools.

```text
resources/list        # discover available context
resources/read        # read selected context
tools/list            # discover callable actions
tools/call            # call one action with validated inputs
```

Write tools should have explicit names, narrow schemas, and auditable side effects.

### Step 3 — Design tool schemas for intent

A good tool name says what user outcome it supports.

```json
{
  "name": "search_docs",
  "description": "Search approved project documentation.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "query": { "type": "string" },
      "limit": { "type": "integer", "minimum": 1, "maximum": 10 }
    },
    "required": ["query"]
  }
}
```

Avoid generic tools like `run_any_sql` or `shell` unless the host adds strong approvals.

### Step 4 — Treat auth as part of the boundary

Store credentials in the server environment or host-approved secret storage, not in prompts. Scope tokens to the minimum API permissions and log only metadata needed for debugging.

### Step 5 — Debug in layers

When a server does not work, isolate the layer:

1. Does the process start?
2. Can the host discover the server?
3. Do `list` calls show expected tools/resources/prompts?
4. Does a minimal valid call succeed?
5. Are auth, network, or schema errors surfaced clearly?

## Best Practices

### Do

- ✅ Prefer narrow, intention-revealing tools over broad escape hatches.
- ✅ Start read-only, then add writes with confirmations and audit logs.
- ✅ Validate all inputs at the server boundary.
- ✅ Keep server logs useful but free of secrets.
- ✅ Version tool names or schemas when breaking clients.
- ✅ Document who controls each capability: application, user, or model.

### Don't

- ❌ Put API keys in issue bodies, prompts, or resource content.
- ❌ Expose raw shell, database, or admin APIs without guardrails.
- ❌ Assume every host supports the same auth or approval UX.
- ❌ Change tool semantics without updating descriptions and tests.
- ❌ Let untrusted documents instruct the host to install or call servers.

## Quick Command Reference

| Concept or method | Use |
|---|---|
| `tools/list` | Discover tools exposed by a server. |
| `tools/call` | Invoke a tool with validated JSON input. |
| `resources/list` | Discover readable resources. |
| `resources/read` | Read selected resource content. |
| `prompts/list` | Discover reusable prompt templates. |
| `prompts/get` | Retrieve a prompt template with arguments. |
| `@modelcontextprotocol/sdk` | Official SDK package for building servers in Node projects. |

## Expected Outcomes

After setup, you should have:

- A clear mental model of host, client, server, tools, resources, and prompts.
- A local MCP server or configured existing server with narrow capabilities.
- Tool schemas that describe intent, validate inputs, and limit side effects.
- An auth boundary that keeps credentials out of model-visible text.
- A debugging checklist for startup, discovery, schemas, calls, and permissions.

## Reference

<details>
<summary>Sources & deeper reading</summary>

- [Model Context Protocol homepage](https://modelcontextprotocol.io/)
- [MCP documentation](https://modelcontextprotocol.io/docs/)
- [MCP latest specification](https://modelcontextprotocol.io/specification/latest)
- [Understanding MCP servers](https://modelcontextprotocol.io/docs/learn/server-concepts)
- [MCP tools specification](https://modelcontextprotocol.io/specification/draft/server/tools)
- [Contributor tutorial](https://github.com/luongnv89/awesome-cheatsheets/blob/main/docs/contributing.md)
- [Related: Claude Code cheatsheet](https://github.com/luongnv89/awesome-cheatsheets/blob/main/src/content/cheatsheets/claude-code/claude-code.md)
- [Related: Hermes Agent cheatsheet](https://github.com/luongnv89/awesome-cheatsheets/blob/main/src/content/cheatsheets/hermes-agent/hermes-agent.md)
- [Related: Pi cheatsheet](https://github.com/luongnv89/awesome-cheatsheets/blob/main/src/content/cheatsheets/pi-dev/pi-dev.md)

</details>
