---
slug: openclaw
title: OpenClaw — Personal Agent Gateway Cheatsheet
category: tool
subcategory: personal-agent-gateway
summary: "Practical setup guide for OpenClaw: install the personal agent gateway, onboard messaging channels, configure workspace safety, and operate integrations responsibly."
last_updated: 2026-05-19
stale_after_days: 90
upstream_version: "OpenClaw current"
tags: [openclaw, personal-agent, gateway, messaging, integrations, safety]
status: draft
authors:
  - name: luongnv89
links:
  homepage: https://openclaw.ai/
  docs: https://docs.openclaw.ai/
  assistant-setup: https://docs.openclaw.ai/start/openclaw
  workspace: https://documentation.openclaw.ai/concepts/agent-workspace
  easy-desktop: https://github.com/openclaw-easy/openclaw-easy-desktop
---

# OpenClaw — Personal Agent Gateway Cheatsheet

**One-line:** OpenClaw is a self-hosted personal AI gateway that connects messaging channels such as WhatsApp, Telegram, Slack, Discord, and Matrix to agents while keeping workspace, credentials, and integrations under your control.

## Installation

Install from the official OpenClaw site or npm package, then run onboarding.

```bash
# Official installer for macOS and Linux
curl -fsSL https://openclaw.ai/install.sh | bash

# Package-manager alternative
npm i -g openclaw

# First run
openclaw onboard
```

For a no-terminal setup, use the OpenClaw Easy desktop project linked in Reference and follow its current installer instructions.

First-run checklist:

1. Create a private workspace for agent files and context.
2. Connect one AI provider before adding messaging channels.
3. Add one channel first, such as WhatsApp or Telegram.
4. Test with harmless prompts before exposing personal data or automations.

## Step-by-Step Setup & Optimization

### Step 1 — Separate config, credentials, and workspace

OpenClaw stores app configuration and credentials outside the agent workspace. Treat the workspace as the agent's home directory and memory surface.

```bash
mkdir -p ~/openclaw-workspace
openclaw onboard
```

Keep sensitive files out of the workspace unless the agent truly needs them. Remember that the workspace is a default working directory, not a complete sandbox by itself.

### Step 2 — Add one channel at a time

Start with a low-risk channel and a dedicated account or number.

| Channel posture | Use |
|---|---|
| Dedicated test account | First setup, provider testing, demos. |
| Personal account | Only after permissions and logs are understood. |
| Team channel | Use explicit rules, scoped bots, and visible audit trails. |

### Step 3 — Configure the agent boundary

Write a short operating policy for the assistant:

```md
# OpenClaw assistant policy
- Ask before sending messages to other people.
- Do not reveal secrets, tokens, or private files.
- Summarize planned actions before using integrations.
- Keep personal reminders separate from work tasks.
```

If your install supports sandbox settings, enable them for tools that can read or write outside the workspace.

### Step 4 — Connect integrations deliberately

OpenClaw's value comes from channels and plugins, but each integration expands the blast radius. For each new integration, record:

- What data it can read.
- What actions it can take.
- How to revoke credentials.
- Which prompts require confirmation.

### Step 5 — Operate like a production service

Run the gateway as a local service or server process only after backup and recovery are clear.

```bash
openclaw --help
openclaw onboard
```

Monitor logs, rotate provider keys periodically, and keep the channel list small enough to audit.

## Best Practices

### Do

- ✅ Use the official installer or npm package.
- ✅ Start with a dedicated test identity or channel.
- ✅ Keep the workspace private and free of unnecessary secrets.
- ✅ Document confirmation rules for outbound messages and integrations.
- ✅ Use sandboxing when tools can access the host filesystem.
- ✅ Maintain a credential revocation checklist.

### Don't

- ❌ Connect every personal and team channel during the first session.
- ❌ Treat the workspace as a hard security boundary without sandboxing.
- ❌ Let the agent send messages, payments, or production changes without confirmation.
- ❌ Store provider tokens in shared notes or prompts.
- ❌ Ignore logs; gateway behavior should be observable.

## Quick Command Reference

| Command | Use |
|---|---|
| `curl -fsSL https://openclaw.ai/install.sh | bash` | Install with the official script. |
| `npm i -g openclaw` | Install with npm. |
| `openclaw onboard` | Run first-time setup and provider/channel onboarding. |
| `openclaw --help` | Inspect currently available commands. |
| `mkdir -p ~/openclaw-workspace` | Create an explicit private workspace. |

## Expected Outcomes

After setup, you should have:

- A working OpenClaw install and completed onboarding flow.
- A private workspace with clear boundaries and no unnecessary secrets.
- One connected AI provider and one tested messaging channel.
- Written confirmation rules for outbound messages and sensitive integrations.
- A safety checklist for adding future channels, plugins, and automations.

## Reference

<details>
<summary>Sources & deeper reading</summary>

- [OpenClaw homepage](https://openclaw.ai/)
- [OpenClaw documentation](https://docs.openclaw.ai/)
- [OpenClaw personal assistant setup](https://docs.openclaw.ai/start/openclaw)
- [OpenClaw agent workspace concept](https://documentation.openclaw.ai/concepts/agent-workspace)
- [OpenClaw Easy desktop project](https://github.com/openclaw-easy/openclaw-easy-desktop)
- [Contributor tutorial](https://github.com/luongnv89/awesome-cheatsheets/blob/main/docs/contributing.md)
- [Related: Hermes Agent cheatsheet](https://github.com/luongnv89/awesome-cheatsheets/blob/main/src/content/cheatsheets/hermes-agent/hermes-agent.md)
- [Related: Claude Code cheatsheet](https://github.com/luongnv89/awesome-cheatsheets/blob/main/src/content/cheatsheets/claude-code/claude-code.md)

</details>
