---
slug: amp-code
title: Amp — Agentic Coding CLI Cheatsheet
category: tool
subcategory: coding-agent
summary: "Practical path from install to advanced Amp use: pick the right Dial mode, add AGENTS.md guidance, lock down tools and MCP servers, then automate with execute mode, threads, and cloud orbs."
last_updated: 2026-11-12
stale_after_days: 90
tags: [amp, ampcode, coding-agent, cli, terminal, mcp, agents-md]
status: published
authors:
  - name: luongnv89
links:
  homepage: https://ampcode.com/
  docs: https://ampcode.com/docs
  cli: https://ampcode.com/docs/cli
  dial: https://ampcode.com/docs/the-dial
  settings: https://ampcode.com/docs/cli/settings
---

# Amp — Agentic Coding CLI Cheatsheet

**One-line:** Amp is an agentic coding tool that runs from your terminal, on cloud orbs, or on your own runners. You pick how hard it works with the Dial (`low` → `ultra`) and can share, resume, or reference every thread.

## Prerequisites

- [ ] macOS, Linux, or Windows through WSL (Amp recommends WezTerm or Alacritty over Windows Terminal for clipboard support)
- [ ] An Amp account at [ampcode.com](https://ampcode.com/)
- [ ] A Git repository to work in
- [ ] `$EDITOR` set if you want `Ctrl+G` prompt editing and `amp config edit`

## Installation

Install the CLI with the official script (macOS, Linux, WSL):

```bash
curl -fsSL https://ampcode.com/install.sh | bash
```

Log in, then start Amp from a project root:

```bash
amp login
```

```bash
cd <PROJECT_DIR>
amp
```

Updates install automatically in the background, so you only need to restart Amp now and then. To check manually:

```bash
amp update
```

```bash
amp version
```

> [!NOTE]
> The [CLI install page](https://ampcode.com/docs/cli) also has Windows and Homebrew tabs. If you're signed in to a workspace, its download page shows install steps specific to that workspace.

## Step-by-Step Setup & Optimization

### Step 1 — First thread and the Dial

**Goal:** A working thread in the right mode, with your editor connected · **Time:** ~10 min · **Level:** beginner

1. Run `amp` in your repository. Before you send the first message, press `Ctrl+S` to turn the Dial:
   - `low`: small, well-defined tasks such as a focused fix, test, or refactor
   - `medium`: the default for most work
   - `high`: hard tasks where a subtle miss is expensive
   - `ultra`: open-ended work such as migrations, architecture, or changes that cross many files
2. Type `@` to mention files, and press `Ctrl+V` (also on macOS) to paste a screenshot.
3. Connect your editor (VS Code, Cursor, Windsurf, Zed, or Neovim with the amp.nvim plugin): press `Ctrl+O` and select `ide connect`.
4. Install shell completions, for example in Zsh after `compinit`:
   ```bash
   source <(amp completions zsh)
   ```

**Verify:** `amp version` prints a version, and the first thread shows the mode you picked.

> [!IMPORTANT]
> A thread keeps the mode it had when you sent its first message. To switch modes, start a new thread, which opens in the mode you used last, so check the Dial before sending. Start at `medium`. Starting too low can cost more in retries, and starting too high wastes credits on simple changes.

### Step 2 — Add AGENTS.md guidance

**Goal:** Amp loads your build, test, and convention notes in every thread · **Time:** ~15 min · **Level:** beginner

1. Create `AGENTS.md` at the repo root with your architecture overview, build and test commands, and review steps. You can also ask Amp to generate it ("Update AGENTS.md based on what I told you in this thread").
2. Know what gets loaded:
   - `AGENTS.md` in the current directory and parent directories up to `$HOME`: always
   - Subtree `AGENTS.md` files: when the agent reads a file in that subtree
   - Personal `~/.config/amp/AGENTS.md` and `~/.config/AGENTS.md`: always
   - In a directory with no `AGENTS.md`, Amp loads `AGENT.md` or `CLAUDE.md` instead
3. Pull in other files with @-mentions, such as `See @docs/*.md`. Inside the **mentioned** file, add `globs` frontmatter so it loads only when matching files are read:
   ```yaml
   ---
   globs:
     - '**/*.ts'
     - '**/*.tsx'
   ---
   ```
4. Skip guidance files for one run, for example your personal file in a scripted run:
   ```bash
   AMP_IGNORE_GUIDANCE_FILES="$HOME/.config/amp/AGENTS.md" amp -x "summarize this repo"
   ```

**Verify:** `amp -x "List the AGENTS.md files in your context"` names your repo's `AGENTS.md`.

> [!TIP]
> In a monorepo, keep the root `AGENTS.md` general and put specific `AGENTS.md` files in each subproject.

### Step 3 — Settings and tool safety

**Goal:** User and workspace settings that limit what Amp can run · **Time:** ~15 min · **Level:** intermediate

1. Open your user settings (`~/.config/amp/settings.json`) in `$EDITOR`:
   ```bash
   amp config edit
   ```
2. Open the workspace file (nearest `.amp/settings.json`). Workspace settings override user settings, except `amp.keymap`, where user entries win:
   ```bash
   amp config edit --workspace
   ```
3. Add the schema and the key settings:
   ```json
   {
     "$schema": "https://ampcode.com/cli-settings.schema.json",
     "amp.tools.disable": ["builtin:<TOOL_NAME>"],
     "amp.mcpPermissions": [
       { "matches": { "url": "https://mcp.trusted.com/mcp" }, "action": "allow" },
       { "matches": { "command": "npx", "args": "* @playwright/mcp@*" }, "action": "allow" },
       { "matches": { "url": "*" }, "action": "reject" },
       { "matches": { "command": "*" }, "action": "reject" }
     ]
   }
   ```
   The last two rules block every server you haven't allowed. Add an `allow` rule for each server you install in Step 4.
4. List the built-in tool names you can disable:
   ```bash
   amp tools list
   ```

**Verify:** `amp -x "What tools are available to you?"` leaves out the tools you disabled and the tools from MCP servers you rejected.

> [!WARNING]
> By default, Amp runs tools and shell commands **without asking for approval**. `amp.tools.disable` removes tools by name (`builtin:` prefix and `*` globs work). `amp.mcpPermissions` allows or rejects MCP servers by `url` or `command`/`args`; the first matching rule applies, and servers that match no rule are allowed. Neither setting adds prompts. For untrusted repos, write a custom policy plugin or use an isolated environment such as an orb.

### Step 4 — MCP servers and skills

**Goal:** Extra tools that load only when needed · **Time:** ~15 min · **Level:** intermediate

1. Prefer skills over global MCP. Ask Amp to "Create a project skill for deploying this app to staging". Project skills go in `.agents/skills/<name>/SKILL.md`. An MCP server bundled in the skill's `mcp.json` keeps its tools hidden until the skill loads, but Amp still starts the server as soon as it discovers the skill.
2. Install a skill from GitHub, a Git URL, or a local path:
   ```bash
   amp skill add <SOURCE>
   ```
3. List discovered skills. Amp also reads `.claude/skills/` unless `amp.skills.disableClaudeCodeSkills` is set:
   ```bash
   amp skills list
   ```
4. Add an always-on MCP server only when it must be in every context:
   ```bash
   amp mcp add context7 -- npx -y @upstash/context7-mcp
   ```
5. Check server health, then approve servers from workspace `.amp/settings.json`, which need explicit trust:
   ```bash
   amp mcp doctor
   ```
   ```bash
   amp mcp approve <SERVER_NAME>
   ```

**Verify:** `amp mcp doctor` lists your servers with no `awaiting approval` entries, and `amp skills list` shows your skill.

> [!TIP]
> Too many tools hurt model performance. Choose MCP servers with a few high-level tools, and disable the ones you don't use.

### Step 5 — Automation, threads, and orbs

**Goal:** Scripted runs, resumable threads, and cloud work · **Time:** ~20 min · **Level:** advanced

1. Run one prompt and exit (redirecting stdout also turns execute mode on):
   ```bash
   amp -x "what package manager is used here?"
   ```
2. In CI, use an access token from Settings (it starts with `sgamp_`). The session token from `amp login` expires within an hour, and the CLI rejects it here:
   ```bash
   export AMP_API_KEY=<ACCESS_TOKEN>
   ```
3. Send work to a cloud orb. The CLI prints the thread URL and exits while the agent keeps working:
   ```bash
   amp -ox "Investigate why the latest CI run on main failed"
   ```
4. Resume, share, or export a thread:
   ```bash
   amp threads continue <THREAD_ID>
   ```
   ```bash
   amp threads share <THREAD_ID> --visibility unlisted
   ```
   ```bash
   amp threads markdown <THREAD_ID>
   ```
5. Reuse context from earlier work: type `@T-…` (or `@@` to search) in a prompt. When a thread gets long, ask "Handoff and …" to start a fresh thread with the context that matters.
6. Get a second opinion: ask Amp to "ask the oracle" for a review or "use the librarian" to research another repo.
7. Check your credit balance and usage:
   ```bash
   amp usage
   ```

**Verify:** `amp -x "say ok"` prints a reply and exits 0, and `amp threads list` shows your recent threads.

> [!NOTE]
> Commits the agent makes carry an `Amp-Thread-ID` trailer, so `git log` leads back to the thread that made the change. Turn it off with `amp.git.commit.ampThread.enabled: false`.

## Best Practices

### Do

- Pick the mode by how hard the task is, not by the model behind it. The models behind each mode change over time.
- Use one thread per task. A thread that mixes unrelated work gives the agent worse context.
- Have the agent verify its own work, for example by running end-to-end tests (ideally in an orb) before you review.
- Keep `AGENTS.md` short and scoped. Move language-specific rules into @-mentioned files with `globs`.
- Bundle MCP servers in skills so their tools load only when needed.
- Review the changes with the largest blast radius yourself. Consider also asking the oracle for a second review before you ship.
- Press `Enter` while the agent works to steer it after the current step. Press `Esc` `Esc` to interrupt.

### Don't

- Don't run Amp against untrusted repos on your main machine. Tools run without prompts.
- Don't expect to change modes mid-thread. Start a new thread instead.
- Don't put `AMP_API_KEY` or other secrets in `AGENTS.md`, settings committed to the repo, or prompts.
- Don't approve workspace MCP servers in a repo you haven't reviewed.
- Don't use `ultra` for small fixes. It spends time and credits a `low` or `medium` thread would save.

## Quick Command Reference

| Command | Purpose |
| ------- | ------- |
| `amp` | Start an interactive thread |
| `amp login` / `amp logout` | Add or remove a CLI account |
| `amp account switch <EMAIL>` | Change the active account |
| `amp -x "<PROMPT>"` | Execute one prompt and exit |
| `amp -ox "<PROMPT>"` | Run the prompt in a cloud orb |
| `amp --executor runner:<ID>` | Run the thread on a connected runner |
| `amp threads continue <THREAD_ID>` | Attach to an existing thread |
| `amp threads list` | List your threads |
| `amp threads search <QUERY>` | Search threads from the terminal |
| `amp threads markdown <THREAD_ID>` | Export a thread as Markdown |
| `amp config edit [--workspace]` | Edit user or workspace settings |
| `amp mcp add <NAME> -- <CMD>` | Add a local MCP server |
| `amp mcp doctor` | Check MCP server status |
| `amp mcp approve <NAME>` | Trust a workspace MCP server |
| `amp skill add <SOURCE>` | Install a skill |
| `amp tools list` | Show built-in tools |
| `amp usage` | Show credit balance and usage |
| `amp update` / `amp version` | Update or print the version |

| Key | Action |
| --- | ------ |
| `Ctrl+O` | Command palette |
| `Ctrl+S` | Turn the Dial (before the first message) |
| `Ctrl+G` | Edit the prompt in `$EDITOR` |
| `Ctrl+V` | Paste an image |
| `Ctrl+R` | Prompt history |
| `Shift+Enter` / `Ctrl+J` | Newline |
| `Alt+T` | Expand thinking and tool blocks |
| `Alt+R` | Toggle fast mode |
| `Esc` `Esc` | Interrupt the agent |
| `Ctrl+C` `Ctrl+N` | Archive the thread and start a new one |
| `Ctrl+C` `Ctrl+C` | Quit |

## Expected Outcomes

- `amp` is installed, logged in, and connected to your editor.
- Each task runs in its own thread, in a mode that fits how hard the task is.
- `AGENTS.md` gives every thread your build, test, and convention rules.
- Tool and MCP exposure is deliberate: unused tools are disabled, and workspace servers are approved on purpose.
- Scripted runs use `amp -x` with `AMP_API_KEY`, and long or parallel work goes to orbs with `amp -ox`.
- Threads are shareable and resumable, and each agent commit links back to its thread.

## Reference

<details>
<summary>Sources & deeper reading</summary>

- [Amp documentation](https://ampcode.com/docs)
- [CLI: Getting Started](https://ampcode.com/docs/cli)
- [Execute Mode](https://ampcode.com/docs/cli/execute-mode)
- [Configuration](https://ampcode.com/docs/cli/settings)
- [CLI Keybindings](https://ampcode.com/docs/cli/keybindings)
- [The Dial](https://ampcode.com/docs/the-dial)
- [Tools and permissions](https://ampcode.com/docs/tools)
- [AGENTS.md](https://ampcode.com/docs/customize/agents-md)
- [MCP](https://ampcode.com/docs/customize/mcp)
- [Skills](https://ampcode.com/docs/customize/skills)
- [Threads](https://ampcode.com/docs/threads)
- [Pricing](https://ampcode.com/docs/pricing)
- [Chronicle (release notes)](https://ampcode.com/chronicle)
- [Amp news: The Dial](https://ampcode.com/news/the-dial)
- [How Karl Clement Uses Amp](https://ampcode.com/docs/using-amp/karl)
- [Kipt guide: Amp Code](https://kipt.me/guides/amp-code) (third-party)
- [Amp Neovim plugin](https://github.com/ampcode/amp.nvim)
- [Related: Claude Code cheatsheet](https://github.com/luongnv89/awesome-cheatsheets/blob/main/src/content/cheatsheets/claude-code/claude-code.md)
- [Related: OpenCode cheatsheet](https://github.com/luongnv89/awesome-cheatsheets/blob/main/src/content/cheatsheets/opencode/opencode.md)

</details>
