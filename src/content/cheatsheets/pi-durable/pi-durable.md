---
slug: pi-durable
title: Pi Durable — Durable Agent Harness Cheatsheet
category: tool
subcategory: agent-framework
summary: Build long-running agents with Pi Durable, Earendil's experimental TypeScript harness that commits every model turn, tool call, and app state to storage so runs survive crashes, then add tools, subagents, durable tasks, compaction, multiplayer views, proactive agents that start from events and wait for approval, and Cloudflare Durable Objects.
last_updated: 2026-10-21
stale_after_days: 30
upstream_version: "pi-durable 1.3.x"
tags: [pi-durable, pi, earendil, agent-harness, durable-agents, typescript, crash-recovery, subagents, compaction, cloudflare-durable-objects, proactive-agents]
status: published
authors:
  - name: luongnv89
links:
  homepage: https://earendil.com/posts/pi-durable/
  repo: https://github.com/earendil-works/pi/tree/v1.3.0/packages/durable
  docs: https://github.com/earendil-works/pi/blob/v1.3.0/packages/durable/README.md
  examples: https://github.com/earendil-works/pi/tree/v1.3.0/packages/durable/test/examples
  npm: https://www.npmjs.com/package/@earendil-works/pi-durable
  cloudflare: https://developers.cloudflare.com/agents/harnesses/pi/
  video: https://youtu.be/DNDYYHsypZg
  demo: https://github.com/disler/durable-pi
---

# Pi Durable — Durable Agent Harness Cheatsheet

**One-line:** Pi Durable is a small TypeScript library for agents that keep running: every model turn, tool call, and piece of app state is committed to storage before it is shown, so when the process dies, reopening the storage carries on from the last checkpoint.

## Prerequisites

- [ ] Node.js `>=22.19.0` (the package's `engines` floor), or another JavaScript runtime with a storage adapter (Bun, Cloudflare Durable Objects)
- [ ] An ESM TypeScript project (`"type": "module"`)
- [ ] An API key for a `@earendil-works/pi-ai` provider, such as `OPENAI_API_KEY` for `openaiProvider()`
- [ ] Optional: a Pi checkout, to run the 30+ official examples and the demo agents
- [ ] Optional for Cloudflare: a Workers project with a SQLite-backed Durable Object
- [ ] Optional for the community demo (`disler/durable-pi`): Node.js 24, [`just`](https://github.com/casey/just), `zsh`, and an `OPENROUTER_API_KEY`

> [!NOTE]
> Pi Durable doesn't replace the Pi coding agent ([`pi-dev`](https://github.com/luongnv89/awesome-cheatsheets/blob/main/src/content/cheatsheets/pi-dev/pi-dev.md)). Use the coding agent when one person drives a terminal and restarts it by hand after a crash. Use Pi Durable when the agent has to outlive the terminal: Slack bots, triage daemons, long jobs, several people steering one conversation, or agents running in a container or Durable Object.

> [!WARNING]
> The package is **experimental**: "The API changes without notice between releases." Pin exact versions, and check the README for your installed version before copying snippets.

## Installation

1. Add the harness, the model layer (`pi-ai`), and the cancellation/document layer (`chord`) to your project:

   ```bash
   npm install @earendil-works/pi-durable @earendil-works/pi-ai @earendil-works/chord
   ```

2. Export the provider key that `openaiProvider()` reads:

   ```bash
   export OPENAI_API_KEY="<OPENAI_API_KEY>"
   ```

3. Optional: clone Pi at the tag that matches your npm version, so you can run the examples:

   ```bash
   git clone https://github.com/earendil-works/pi.git
   cd pi
   git checkout v1.3.0
   npm install && npm run build
   ```

4. Run one example from the package directory. Most examples use the faux provider, so they need no key:

   ```bash
   cd packages/durable
   node --conditions=source --experimental-strip-types test/examples/14-chat.ts
   ```

5. Optional: run the launch demos, a small coding agent and a vacation planner, from the repo root. They exist only at tag `v1.0.0`:

   ```bash
   cd ../..
   git checkout v1.0.0
   npm install && npm run build
   node packages/coding-agent/src/experimental/durable/main.ts
   ```

   ```bash
   node packages/coding-agent/src/experimental/vacation/main.ts
   ```

6. Optional: install the community demo from the IndyDevDan video, a network of durable agents with web, terminal, and `curl` clients. Clone it outside the Pi checkout, and set `OPENROUTER_API_KEY` in `.env` after the copy:

   ```bash
   git clone https://github.com/disler/durable-pi.git
   cd durable-pi
   cp .env.example .env
   cp dpi-network.example.yaml dpi-network.yaml
   just install
   just net up local
   just hub build
   ```

   Then run this machine's device server, and in a second terminal the web UI on `http://localhost:4781`:

   ```bash
   just backend run
   ```

   ```bash
   just hub start
   ```

> [!TIP]
> The launch post puts the package at about 15k lines without tests (as of v1.0), small enough for your coding agent to read. Point the agent at `packages/durable` (README plus `test/examples`) and let it build on top. It can usually skip the roughly 3k lines of storage backends.

## Step-by-Step Setup & Optimization

### Step 1 — First answered prompt

**Goal:** A harness that runs one durable question-and-answer turn · **Time:** ~10 min · **Level:** beginner

1. Save the official quick start as `quickstart.ts`. `MemoryStorage` persists nothing, which is fine for a first run:

   ```ts
   import { BACKGROUND_CONTEXT } from "@earendil-works/chord/context";
   import { createModels } from "@earendil-works/pi-ai/models";
   import { openaiProvider } from "@earendil-works/pi-ai/providers/openai";
   import { AssistantEntry, createRegistry, Harness, MemoryStorage } from "@earendil-works/pi-durable";

   const context = BACKGROUND_CONTEXT; // never cancels
   const models = createModels();
   models.setProvider(openaiProvider()); // reads OPENAI_API_KEY

   const harness = await Harness.open(new MemoryStorage(), { models, registry: createRegistry() }, context);
   const root = await harness.root(context, { agent: { model: { provider: "openai", modelId: "<MODEL_ID>" } } });

   const submission = await root.submit({ type: "input", content: "What is the capital of France?" }, context);
   const settled = await submission.wait(context);
   if (settled.status === "done" && settled.type === "input") {
   	const answer = await root.commit((tx) => tx.entry(AssistantEntry, settled.answer), context);
   	console.log(answer?.model?.[0]);
   }
   await harness.close(context);
   ```

2. Run it. Node ≥22.19 (the package floor) runs `.ts` files directly:

   ```bash
   node quickstart.ts
   ```

3. Learn the flow, because every later step builds on it. `submit(input)` writes `pi.user`. A `pi.generation` task calls the model and appends `pi.assistant` with any tool calls. One `pi.tool` task per call writes `pi.tool-result`, and the next generation appends the answer. `wait()` settles as `done` or `unanswered` (with a reason).

**Verify:** the script logs an assistant message. In a Pi checkout, `14-chat.ts` prints an `answer:` line and a `transcript:` list of entry kinds.

> [!TIP]
> Every async call takes a Chord `Context` for cancellation. Cancelling a `wait()` stops only the wait, never the work.

### Step 2 — Make it durable: storage, resume, exactly-once submits

**Goal:** Conversations and unfinished runs that survive a restart · **Time:** ~15 min · **Level:** beginner

1. Swap `MemoryStorage` for SQLite, then call `resume()` to continue work the last process left behind:

   ```ts
   import { openNodeSqliteStorage } from "@earendil-works/pi-durable/storage/sqlite/node";

   const harness = await Harness.open(await openNodeSqliteStorage("./agent.sqlite"), { models, registry }, context);
   const root = await harness.root(context); // the same root as last time
   harness.resume(); // continue any run left unfinished
   ```

2. Give every submission that might be retried a stable `requestId`. A retry after a crash then returns the original submission instead of asking twice:

   ```ts
   const job = { type: "input", content: "Fix the flaky login test", requestId: "job-42" } as const;
   const settled = await (await root.submit(job, context)).wait(context);
   ```

3. Get a submission back after a restart with `harness.submission(id, context)`, then `wait()` on it.
4. Pick the backend deliberately. Use SQLite for long-running agents. JSONL storage, `openNodeJsonlStorage(directory, context)`, writes append-only files and accepts `{ fsync: true }`, but it keeps the whole history in memory. Use `MemoryStorage` for tests only.
5. Reopen on failure. A storage error closes the harness by itself (pending waits reject with `SessionFailed`), and `harness.closed` tells you when:

   ```ts
   harness.closed.then((end) => {
   	if (end.reason === "failed") reopen(end.error); // reopen: your restart function
   });
   ```

**Verify:** after a restart, `harness.root(context)` returns the same `root.id`, and resubmitting with the same `requestId` returns the same submission id. In a Pi checkout, `13-recovery.ts` prints `closed; saved checkpoint:` and then `after reopen:`.

> [!WARNING]
> One process owns a storage at a time, and there is no cross-process locking. Other clients attach to that process; they don't open the same file. SQLite runs in WAL mode with `synchronous = NORMAL`, so commits survive a process crash, but the newest commit can be lost on power or host failure.

### Step 3 — Give the agent tools and an execution environment

**Goal:** A coding-capable agent whose tools are crash-safe by design · **Time:** ~20 min · **Level:** intermediate

1. Install the built-in `read`, `write`, `edit`, and `bash` tools, and build an environment from each conversation's `cwd`:

   ```ts
   import { NodeExecutionEnv } from "@earendil-works/pi-durable/env/node";
   import { CodingTools } from "@earendil-works/pi-durable/tools";

   const registry = createRegistry();
   registry.install(CodingTools);

   const env = ({ cwd }: { cwd?: string }) => new NodeExecutionEnv({ cwd: cwd ?? process.cwd() });
   const harness = await Harness.open(storage, { models, registry, env }, context);
   ```

2. Define your own tools with a TypeBox schema. Set `replay: "safe"` **only** when running the tool twice is harmless:

   ```ts
   import { Type } from "@earendil-works/pi-ai";
   import { defineExtension, defineTool } from "@earendil-works/pi-durable";

   const searchIssues = defineTool({
   	name: "search_issues",
   	description: "Search the issue tracker",
   	parameters: Type.Object({ query: Type.String() }),
   	replay: "safe", // read-only, so a rerun after a crash is fine
   	execute: async (args, api) => {
   		api.output(`searching for ${args.query}\n`); // streamed to every watching client
   		// tracker: your own issue-tracker client
   		return { output: [{ type: "text", text: await tracker.search(args.query) }] };
   	},
   });
   registry.install(defineExtension({ name: "ops", tools: [searchIssues] }));
   ```

3. Leave `replay` unset on tools with side effects, such as deploys, payments, or `edit`. A crash mid-call then reports `interrupted` to the model with the output stored so far, and the call is not rerun.
4. Override or decorate tools by name. A later extension's same-name tool replaces the earlier one, for example `createBashTool({ commandPrefix: "source .venv/bin/activate" })`, and `wrapTool()` decorates whichever tool won.

**Verify:** in a Pi checkout, `26-coding-agent.ts` prints `bash ran in:` with the conversation's working directory, and `17-coding-tools.ts` prints `status:` and `answer:` after a read/edit/bash turn.

> [!IMPORTANT]
> Since v1.2.0 a tool result's model-facing field is `output`, not `content`; the launch post's snippets still show `content`. A result has three channels: `output` (the model), `structuredOutput` (tools calling tools), and `details` (UIs). Throwing from `execute()` gives the model an error result. When every result in a round returns `control: { terminate: true }`, the run ends without another model request.

### Step 4 — Run many conversations, each with its own agent

**Goal:** Concurrent, forkable conversations with per-conversation models, tools, and queues · **Time:** ~20 min · **Level:** intermediate

1. Configure what each conversation runs with. It is stored as names in `pi.agent`, so it outlives the code:

   ```ts
   await root.configure(
   	{
   		model: { provider: "openai", modelId: "<MODEL_ID>" },
   		thinkingLevel: "high",
   		tools: { remove: [deploy] }, // deploy: a side-effecting tool you defined; an array enables exactly these
   		modelTools: [searchIssues], // of the enabled tools, offer the model only these
   		instructions: "Only read; never edit files.",
   		cwd: "/work/repo",
   	},
   	context,
   );
   ```

2. Fork at any entry, for example a Slack thread off a channel conversation. The fork sees the parent's history up to that entry without copying it:

   ```ts
   const thread = await root.fork(entryId, { ownership: { kind: "ownerless" } }, context);
   const other = await harness.createConversation({ ownership: { kind: "ownerless" } }, context);
   ```

3. Decide what happens when a conversation is busy. The default is a follow-up after the run; `steer` joins after the current tool round; `reject` throws `ConversationBusy`:

   ```ts
   await root.submit({ type: "input", content: "Use pnpm, not npm", whenBusy: "steer" }, context);
   ```

4. Set run policy for the whole harness once. Settings are read at every use and never stored, so getters make them live:

   ```ts
   const harness = await Harness.open(storage, {
   	models,
   	registry,
   	settings: {
   		stream: { timeoutMs: 120_000 },
   		retry: { maxRetries: 3 },
   		toolExecution: "parallel",
   		progress: { partialIntervalMs: 100, outputIntervalMs: 100 },
   	},
   }, context);
   ```

**Verify:** `await root.agent(context)` returns the configured model, tools, and `cwd`. In a Pi checkout, `20-inbox.ts` prints `rejected:` and `withdraw:` for the busy-conversation cases.

> [!TIP]
> A reviewer conversation can sit next to the main agent with a cheaper model, read-only tools, and its own checkout. See `28-reviewer.ts`, and `27-plan-mode.ts` for a read-only plan mode switched with `configure()`. A `configure()` change applies from the agent's next model request with no restart, so you can flip a running agent to read-only mid-run, as the durable-pi demo's **Read only** switch does.

### Step 5 — Hooks, approvals, subagents, and child tasks

**Goal:** Guardrails and delegation that survive a crash · **Time:** ~30 min · **Level:** advanced

1. Gate risky tools with a `beforeTool` hook. Store the decision in a memo (first write wins), so a restart doesn't ask twice:

   ```ts
   import { hook, ToolTask } from "@earendil-works/pi-durable";

   const Approval = defineExtension({
   	name: "approval",
   	hooks: [
   		hook(ToolTask, {
   			beforeTool: async (call, api, context) => {
   				if (call.name !== "deploy") return undefined;
   				// askInSlack: your own approval prompt
   				let approved = await api.memo<boolean>("approval:deploy", context);
   				approved ??= await api.memo("approval:deploy", await askInSlack(call), context);
   				return approved ? undefined : { block: "Nobody approved the deploy." };
   			},
   		}),
   	],
   });
   ```

2. Know how hook chains run. `beforeTool` passes rewritten arguments down the chain and stops at the first block (and a throw blocks the call). `afterTool` passes the result down. `onYield` stops at the first hook that keeps the run going. Observers like `afterResponse` always run.
3. Turn a guard on for some conversations only. Without `settings.extensions`, every installed extension is selected everywhere. So list the default selection without the guard, then `add` it where you need it. The durable-pi demo's bash gate works this way: a `beforeTool` hook sends each `bash` command to a classifier, memos the verdict, and blocks irreversible commands. When the classifier is down, it lets the command run (fails open):

   ```ts
   // BashGate: your guard extension; Ops: your other extensions
   registry.install(BashGate);
   const harness = await Harness.open(storage, { models, registry, settings: { extensions: [CodingTools, Ops] } }, context);
   await root.configure({ extensions: { add: [BashGate] } }, context); // this conversation only
   ```

4. Build a subagent as a `replay: "safe"` tool that creates a child conversation owned by the call. Inside `api.commit()`, reuse an existing child (`tx.scanConversations({ ownerTaskId: api.taskId }, 1)`) or create one with `ownership: { kind: "task", taskId: api.taskId }`. Then submit with a `requestId` derived from `api.taskId`.
5. Use `defineTask` for your own multi-step durable work. A phase that commits `{ status: "waiting", checkpoint: { phase: "decide", … }, on: childTaskIds, policy: "failFast" }` runs no code until its children settle, then resumes in the checkpoint's phase. With `failFast`, the first failure aborts the rest; `allSettled` waits for all of them. The durable-pi demo's `release-check` job shows the shape: a subagent gathers evidence, then the job waits for a person before it publishes.
6. Mark side work with `{ background: true }` (reminders, subagents that outlive the turn). An ordinary abort (Esc, `root.abort(context)`) leaves it alone, and `root.abort(context, { background: true })` stops it too.

**Verify:** `harness.taskGraph(context)` lists live tasks with owner edges and `pending`/`running`/`waiting`/`completing` statuses. In a Pi checkout, `22-subagent-foreground.ts` prints the child's `assistant:` and `tool …(…)` lines indented under the call, and `24-child-tasks.ts` prints `payments:` outcomes and `checkout aborted`.

> [!CAUTION]
> `requestId` makes *submissions* exactly-once, not side effects. Charges, deploys, and webhooks inside tasks need their own idempotency key, such as `` `payment-${task.id}` ``, because a phase can rerun after a crash. Pi Durable has no built-in approval step yet. Build one with the hook above, or as a durable approval task (Step 9).

### Step 6 — Compose tools: nested calls, code mode, deferred tools

**Goal:** Large tool sets the model reaches through scripts and search instead of one oversized prompt · **Time:** ~25 min · **Level:** advanced

1. Call one tool from another with `api.executeTool()`. The nested call is its own durable tool task: it is validated, runs the `ToolTask` hooks, and follows its own replay policy. Its result goes back to the caller, not the transcript:

   ```ts
   const testsPass = defineTool({
   	name: "tests_pass",
   	description: "Run the test suite and say whether it passed",
   	parameters: Type.Object({}),
   	execute: async (_args, api, context) => {
   		const run = await api.executeTool("bash", { command: "npm test" }, context, { progress: false });
   		// Absent when bash did not finish, for example on a timeout.
   		const exitCode = (run.structuredOutput as { exitCode: number } | undefined)?.exitCode;
   		return { output: [{ type: "text", text: exitCode === 0 ? "passed" : "failed" }] };
   	},
   });
   ```

2. Give calling programs typed results. Declare `structuredOutputSchema` and return a matching `structuredOutput` next to `output`, and the harness validates it. The transcript stores only `output` and `details`.
3. Decide who may call each tool with `callers`: `["model"]`, `["tools"]`, or both (the default). Then narrow what one conversation offers the model with `modelTools`, which never removes a tool from nested callers:

   ```ts
   // Offer the model everything but bash; tools and scripts may still call it.
   await root.configure({ modelTools: { remove: [bashTool] } }, context);
   ```

4. Add code mode. The model writes JavaScript that calls the conversation's tools as `await tools.<name>(args)` in a QuickJS sandbox, and only the script's output reaches the model. `@earendil-works/pi-codemode` ships as a dependency of `pi-durable`; under pnpm's strict layout, add it to your own dependencies:

   ```ts
   import { CodemodeSandbox } from "@earendil-works/pi-codemode";
   import { createCodemodeExtension } from "@earendil-works/pi-durable/codemode";

   registry.install(createCodemodeExtension({ sandbox: new CodemodeSandbox({ memoryLimitBytes: 256 * 1024 * 1024 }) }));
   ```

5. Defer rarely used tools, such as an MCP server's tool set. Mark them `deferred: true` and install `tool_search`, so the model searches for them and loads matches on demand. Loaded tools stay offered on that branch, even after a compaction:

   ```ts
   import { createToolSearchExtension } from "@earendil-works/pi-durable/tool-search";

   registry.install(createToolSearchExtension());
   ```

**Verify:** `await root.agent(context)` resolves two lists, `tools` (offered to the model) and `callable` (what nested calls resolve among). While a caller runs, its nested calls appear in `docs["pi.live"].nestedTools`.

> [!WARNING]
> A code-mode script survives a restart by replaying deterministically from a journal of the results it received. The rerun ends in an error if the script takes another path, the sandbox fingerprint or code-mode version changed, or its `timeout_ms` passed. Nested calls still follow their own `replay` policy, so a replay-safe tool with external effects still needs its own idempotency key. On Cloudflare, pass a `RemoteCodemodeSandbox` instead.

### Step 7 — Long runs: app state, compaction, handoff, hot reload

**Goal:** Conversations that run indefinitely and agents you can patch while they run · **Time:** ~25 min · **Level:** advanced

1. Keep app state in documents: typed JSON committed atomically with the transcript, so it never disagrees with what the agent did:

   ```ts
   import { defineDoc } from "@earendil-works/pi-durable";

   const Todos = defineDoc<{ items: string[] }>({
   	kind: "app.todos",
   	version: 1,
   	scope: "conversation",
   	history: "latest", // or "rewindable"
   	fork: "asOf", // "initial" | "current" | "asOf"
   	initial: () => ({ items: [] }),
   });

   await root.commit(async (tx) => {
   	(await tx.doc(Todos, root.id)).items.push("write docs");
   }, context);
   ```

2. Share state across every conversation in one harness with `scope: "session"`. A session document takes no conversation id. When several agents or people write it, keep a revision counter in the document and reject stale saves. A commit callback that throws rolls back that commit:

   ```ts
   const Board = defineDoc<{ notes: string[]; revision: number }>({
   	kind: "app.board",
   	version: 1,
   	scope: "session",
   	initial: () => ({ notes: [], revision: 0 }),
   });

   await harness.commit(async (tx) => {
   	const board = await tx.doc(Board);
   	// seenRevision: the revision this writer last read
   	if (board.revision !== seenRevision) throw Error("The board changed; reload it before saving.");
   	board.notes.push("checkout fixed");
   	board.revision++;
   }, context);
   ```

   The durable-pi demo goes one level further. A separate harness over its own SQLite file holds one JSON document that every session on a device reads and writes through `read_state` and `update_state` tools. Each change is one path operation, a receipt per change key keeps a retried call from applying twice, and a stale full save gets `409 conflict`. Pi Durable doesn't share state across harnesses by itself.

3. Tune background compaction, which summarizes older entries while the conversation keeps working:

   ```ts
   settings: {
   	compaction: { enabled: true, reserveTokens: 16384, keepRecentTokens: 20000, backgroundTokens: 32768 },
   },
   ```

4. Compact by hand with instructions, or reset to a handoff note. Older entries always stay in storage:

   ```ts
   await root.compact("Keep the names of the failing tests", context);
   await root.reset("We were fixing the flaky login test. Continue.", context);
   ```

5. Hot-reload an extension by installing it under the same name. A running call finishes on its old code, and the next call uses the new code:

   ```ts
   // loadExtension: your own loader that imports the changed file
   registry.install(await loadExtension("./ops.ts")); // same name "ops": replaces it in one step
   ```

6. After a process restart, install the same extensions again. Pending tasks of an extension's `tasks` resume only once that extension is installed.

**Verify:** `await harness.snapshot(Todos, root.id, context)` returns the committed list. In a Pi checkout, `25-compaction.ts` prints `manual compaction finished; its summary is` and `after the answer, the summary is`, and `31-reload-and-restart.ts` prints `after restart, before install:` then `after install:`.

> [!TIP]
> A tool can return `control: { handoff: note }` to start a fresh context itself, and a second `replay: "safe"` tool can search the older entries with `tx.scanEntries({ conversationId }, 200)`. Together they make an agent that hands off to itself and looks things up later.

### Step 8 — Multiplayer UIs and running on Cloudflare

**Goal:** Many clients watching and steering one conversation, and a harness that wakes itself in a Durable Object · **Time:** ~30 min · **Level:** advanced

1. Attach a UI to committed state. Late joiners start from the current view, and nothing is replayed:

   ```ts
   const view = await thread.viewState(context);
   // render: your UI; value holds entries plus docs["pi.live"], ["pi.inbox"], ["pi.usage"], ["pi.agent"]
   view.subscribe((value) => render(value));
   ```

2. For a remote client, send the exact commit operations with `watch()`. Use `watchEvents()` instead for coding-agent style events (`message_start`, `tool_execution_start`, and so on):

   ```ts
   import { watchEvents } from "@earendil-works/pi-durable";

   const stream = await watchEvents(harness, root.id, context);
   initialize(stream.snapshot); // initialize, send: your client transport
   stream.start(async (events) => {
   	for (const event of events) send(event);
   });
   ```

3. Or detach the agent from every client behind your own server. The durable-pi demo runs one `dpi-backend` server per device, and it owns that device's harnesses. The web hub, `dpi-tui`, and `curl` are thin clients of its bearer-token `/v1` HTTP API (demo code, not pi-durable), and a reconnect starts from a fresh snapshot instead of a replay. One request sends work and waits for the answer:

   ```bash
   curl -s "<DEVICE_URL>/v1/sessions/oneshot/agents/main/messages" -H "Authorization: Bearer <DPI_TOKEN>" -H 'content-type: application/json' -d '{"content":"How many files are in this directory? Use bash.","requestId":"oneshot-1","waitMs":120000}'
   ```

4. To run on Cloudflare, add the Agents SDK. Its `PiHarness` stores Pi in the object's SQLite (`pi_` tables) and schedules a Lifecycle job that wakes an evicted object to finish work:

   ```bash
   npm i agents @earendil-works/pi-durable @earendil-works/pi-ai
   ```

5. Configure Wrangler with an `ai` binding, a Durable Object binding with a `new_sqlite_classes` migration for `Assistant`, and the `nodejs_compat` compatibility flag (see the Cloudflare page for the full file).
6. Wire `PiHarness` into an `Agent`'s Lifecycle. The `harness` factory gets `storage` and `context`, and you build `models`, `registry`, `settings`, and `env` inside it:

   ```ts
   import { Agent } from "agents";
   import { PiHarness } from "agents/harness/pi";
   import { createAI } from "agents/models/pi-ai";
   import { createModels } from "@earendil-works/pi-ai/models";
   import { createRegistry, Harness } from "@earendil-works/pi-durable";

   export class Assistant extends Agent<Env> {
   	ai = createAI({ binding: this.env.AI });
   	registry = createRegistry();
   	harness = new PiHarness({
   		harness: ({ storage, context }) => {
   			const models = createModels();
   			models.setProvider(this.ai.provider);
   			return Harness.open(storage, { models, registry: this.registry }, context);
   		},
   		defaults: { model: this.ai("<WORKERS_AI_MODEL>"), thinkingLevel: "low" },
   	});

   	constructor(ctx: DurableObjectState, env: Env) {
   		super(ctx, env);
   		this.lifecycle.use(this.harness);
   	}
   }
   ```

7. Submit with an `operationId` so the call is idempotent, then wait separately. This is the `PiHarness` API, not the core `requestId` API:

   ```ts
   const receipt = await this.harness.submit("Summarize the latest report", { operationId: "report-summary-42" });
   const result = await this.harness.wait(receipt.operationId); // status: "done" | "unanswered"
   ```

**Verify:** `this.harness.pending()` lists the submission as `queued` or `running` and then drops it, and `this.harness.wait()` returns `status: "done"` with `text` even if the object was evicted mid-run. With the durable-pi demo running, the `curl` request returns `"status":"done"` with an `answer`.

> [!WARNING]
> Cloudflare limits: one model stream longer than about 15 minutes can be cut off by the alarm cap, background work is noticed up to 30 s late (the heartbeat interval), event streams always restart from a snapshot, and conversations can't be deleted yet.

> [!CAUTION]
> In the durable-pi demo network, a device token is effectively a shell: anyone holding it can run commands as that device's user. LAN `ssh` devices speak plain HTTP, and the hub holds every token. Keep the hub bound to `127.0.0.1`.

### Step 9 — Proactive agents: start from an event, wait for approval

**Goal:** An agent that an event starts, which does the first pass of the work and then waits, through restarts, for a person to approve the risky step · **Time:** ~45 min · **Level:** advanced

1. See the pattern end to end in the community demo first. From the durable-pi checkout (Installation item 6), install and build the proactive demo:

   ```bash
   just proactive install
   ```

   ```bash
   just proactive build
   ```

2. Start a fresh take. It prints a URL, deploys a bad commit at about 5 s, and the incident agent asks to deploy its fix at about 30 s:

   ```bash
   just proactive take
   ```

3. Split the work into three layers, and give each one the job it does best:
   - **Code** owns thresholds and side effects. In the demo, 3 `incident` verdicts with one fingerprint within 120 s open an incident.
   - **A cheap classifier** makes one bounded judgment per event. The demo has a hosted classifier label each log row `normal`, `suspicious`, or `incident` and score the impact.
   - **The agent** does the open-ended work: investigate, find the root cause, write the fix and a regression test, then ask to deploy.
4. Open the incident and its conversation in one commit, keyed by the event fingerprint, so a restarted watcher finds the same agent. Then submit the brief with a `requestId` derived from the incident:

   ```ts
   import { configure } from "@earendil-works/pi-durable";

   // Incidents: a session doc of open incidents; OpsTools, worktree, brief: yours
   const { id, conversationId } = await harness.commit(async (tx) => {
   	const incidents = await tx.doc(Incidents);
   	const open = incidents.items[fingerprint];
   	if (open) return { id: open.id, conversationId: open.conversationId };
   	const conversation = await tx.createConversation({ ownership: { kind: "ownerless" } });
   	await configure(tx, conversation.id, { extensions: [CodingTools, OpsTools], cwd: worktree });
   	const id = `INC-${++incidents.seq}`;
   	incidents.items[fingerprint] = { id, conversationId: conversation.id };
   	return { id, conversationId: conversation.id };
   }, context);

   const agent = await harness.conversation(conversationId, context);
   await agent?.submit({ type: "input", content: brief(id), requestId: `incident:${id}:brief` }, context);
   ```

5. Make the risky step a child task that the tool call owns. The `deploy` tool creates the task, or finds it again after a crash, keyed by its own `api.taskId`, then waits with `api.waitForTask()`:

   ```ts
   const deploy = defineTool({
   	name: "deploy",
   	description: "Ask the on-call engineer to approve the fix, then ship it",
   	parameters: Type.Object({ summary: Type.String() }),
   	replay: "safe", // only creates or finds the task, then waits; the deploy runs in the task
   	execute: async (args, api, context) => {
   		// Deploys: a session doc of requests keyed by deploy task id; your approve/decline route sets `decision`
   		const taskId = await api.commit(async (tx) => {
   			const deploys = await tx.doc(Deploys);
   			const existing = Object.values(deploys.items).find((d) => d.toolTaskId === api.taskId);
   			if (existing) return existing.taskId; // a rerun after a crash waits on the same task
   			const created = await tx.createTask(DeployTask, { summary: args.summary }, { ownership: { kind: "task", taskId: api.taskId } });
   			deploys.items[String(created)] = { taskId: created, toolTaskId: api.taskId, decision: null };
   			return created;
   		}, context);
   		const { outcome } = (await api.waitForTask(taskId, context)).state;
   		const approved = outcome.status === "completed" && outcome.result.approved;
   		return { output: [{ type: "text", text: approved ? "Deployed." : "Declined; nothing shipped." }] };
   	},
   });
   ```

6. Wait for the person inside the task. Pi Durable has no built-in approval signal, so the `approval` phase polls the committed document and sleeps between checks. The phase is checkpointed, so a restart resumes the same wait. Ship in a later phase with its own idempotency key, such as `` `deploy-${task.id}` ``:

   ```ts
   approval: async (task, runtime, context) => {
   	for (;;) {
   		const decision = (await runtime.snapshot(Deploys, context))?.items[String(task.id)]?.decision;
   		if (decision === "declined")
   			return void (await runtime.commit(() => ({ status: "terminal", outcome: { status: "completed", result: { approved: false } } }), context));
   		if (decision === "approved")
   			return void (await runtime.commit(() => ({ status: "running", checkpoint: { phase: "rollout" } }), context));
   		await runtime.sleep(runtime.now() + 500, context);
   	}
   },
   ```

**Verify:** after `just proactive take`, the incident reaches review and the deploy waits for approval. SIGKILL the backend while the deploy waits, then start it again. The same deploy task is still awaiting approval, the same tool call is waiting on it, and only one brief exists per incident.

> [!IMPORTANT]
> The `just proactive` recipes, the watcher, and the incident tools belong to the `disler/durable-pi` demo, not to pi-durable. The demo pins pi-durable 1.0.3, so its tools return `content`; on 1.3.x, return `output`.

> [!CAUTION]
> The proactive demo has no login, and its incident agent runs `bash` unsandboxed as you. It binds `127.0.0.1`; keep it there unless you trust the network.

## Best Practices

### Do

- ✅ Go durable when the work has to outlive the window that started it. IndyDevDan's walkthrough names five reasons: proactive agents that an event starts, multi-client agents, multiplayer agents, long-running agents, and a human *near* the loop who approves work instead of driving it. A short, supervised session in one terminal is fine with plain Pi.
- ✅ Treat `replay: "safe"` as a contract. It suits reads and whole-file writes, but not edits that fail on already-replaced text, charges, or deploys. Re-audit it whenever a tool gains a write. A tool that only creates or finds a child task and waits for it can be replay-safe, as long as the side effect runs in the task's checkpointed phases (Step 9).
- ✅ Derive every retryable `requestId` (core) or `operationId` (Cloudflare) from something stable, such as an inbound event id, a job id, or `` `subagent:${api.taskId}` ``.
- ✅ Store hook decisions with `api.memo()`, because hooks can run again after a crash.
- ✅ Keep system prompt sections stable. Only changed sections are resent, which keeps provider prompt caches warm.
- ✅ Keep app state in `defineDoc` documents instead of side tables, so state and transcript commit together.
- ✅ Choose each document's `fork` policy (`initial`, `current`, `asOf`) explicitly when forks matter.
- ✅ Give subagents a cheaper model and remove the subagent extension from the child, so it can't recurse.
- ✅ Raise `settings.progress` intervals (for example `500` ms) when storage is remote, trading a slightly larger crash-loss window for fewer commits.
- ✅ Check `harness.usage(context)` or `docs["pi.usage"]`: per-model and per-tool spend, including failed attempts and summarization.
- ✅ Restrict `callers` on tools that must not recurse. Nothing bounds how deeply nested calls go, and a tool with the default `callers` can even call itself.
- ✅ Defer large tool sets (`deferred: true` plus `tool_search`), or route them through code mode, instead of offering every schema on every request.
- ✅ Put a cheap classifier and code-owned thresholds in front of a proactive agent. The classifier judges each event, code decides when a run starts, and the agent only does the open-ended work.
- ✅ Make each approval a durable task owned by the tool call, and record the decision in a committed document that the task polls. A restart then keeps waiting on the same task instead of asking again.
- ✅ Decide whether each guard hook fails open or closed when its judge is unreachable. The durable-pi bash gate fails open.

### Don't

- ❌ Don't open one storage from two processes; there is no cross-process lock.
- ❌ Don't render the current time (or anything that changes every request) in a section, because it defeats prompt caching.
- ❌ Don't assume `abort()` returns immediately. It resolves when the conversation is idle, and a tool that ignores its abort signal keeps it busy.
- ❌ Don't confuse the Cloudflare `PiHarness` API (`prompt()`, `operationId`, session `"1"`) with the core API (`root.submit().wait()`, `requestId`).
- ❌ Don't rely on `MemoryStorage` outside tests; it persists nothing.
- ❌ Don't float versions while the package is experimental. Pin them, and re-read the README after each upgrade.
- ❌ Don't treat a classifier guard as a sandbox, or a client token for a remote agent as anything less than shell access to its machine.

## Quick Command Reference

Core harness (`@earendil-works/pi-durable`):

| Call | Use |
|---|---|
| `Harness.open(storage, { models, registry, env, settings }, context)` | Open a harness over a storage backend |
| `harness.root(context, { agent })` | Root conversation, created on first use and the same after restart |
| `harness.resume()` | Start the scheduler and continue unfinished runs |
| `conversation.submit(input, context)` → `submission.wait(context)` | Durably admit input, then wait for `done` / `unanswered` |
| `harness.closed` | Settles on `close()` or a storage failure (`reason: "failed"`), the point to reopen |
| `harness.submission(id, context)` | Get a submission back by id after a restart |
| `conversation.configure(change, context)` / `.agent(context)` | Change or read model, tools, extensions, instructions, `cwd` |
| `conversation.fork(entryId, opts, context)` | Branch from an entry; history is shared, not copied |
| `harness.createConversation(opts, context)` | New ownerless or task-owned conversation |
| `conversation.compact(instructions, context)` | Manual compaction (returns a task id) |
| `conversation.reset(note, context)` | New context, optionally from a handoff note |
| `conversation.abort(context, { background? })` | Stop the current work (and background work with the flag) |
| `conversation.viewState(context)` / `.watch(context)` | UI view as Chord state / exact commit ops |
| `watchEvents(harness, id, context)` | Coding-agent style event stream |
| `harness.taskGraph(context)` · `harness.usage(context)` | Live task tree · spend per model and tool |
| `api.executeTool(name, args, context, { key?, progress? })` | Nested tool call from inside a tool |
| `tx.createTask(def, input, { ownership: { kind: "task", taskId } })` · `api.waitForTask(id, context)` | Child task owned by a tool call · wait for its outcome |
| `harness.commit(fn, context)` · `harness.snapshot(SessionDoc, context)` | Write or read a `scope: "session"` document |

Builders: `defineExtension`, `defineTool`, `wrapTool`, `section`, `hook(ToolTask | GenerationTask | CompactionTask, …)`, `defineTask`, `defineDoc`, `createRegistry`, `CodingTools` / `createBashTool` (from `/tools`), `createCodemodeExtension` (from `/codemode`), `createToolSearchExtension` (from `/tool-search`).

Tool registration keys: `replay: "safe"` · `callers: ["model" | "tools"]` · `deferred: true` · `structuredOutputSchema`.

Submission input:

| Field | Values |
|---|---|
| `type` | `"input"` (ask the model) · `"write"` (append an entry, no model call) |
| `requestId` | Stable id; a duplicate returns the existing submission |
| `whenBusy` | `"followUp"` (default) · `"steer"` · `"reject"` |

Storage backends:

| Backend | Import | Durability |
|---|---|---|
| Memory | `MemoryStorage` (package root) | None |
| SQLite | `openNodeSqliteStorage(file)` from `/storage/sqlite/node` | WAL, `synchronous = NORMAL` |
| JSONL | `openNodeJsonlStorage(dir, context)` from `/storage/jsonl/node` | Append-only; `{ fsync: true }` flushes per commit; whole history held in memory |
| Durable Object | `openDurableObjectSqliteStorage(ctx.storage)` from `/storage/sqlite/cloudflare` | DO storage transactions |

Cloudflare `PiHarness` (`agents/harness/pi`):

| Method | Use |
|---|---|
| `prompt(input)` | Submit and wait; returns `text`, `status`, `messages` |
| `submit(input, { operationId })` / `wait(operationId)` | Idempotent submit, wait later |
| `steer(input)` · `abort(operationId?)` · `reset(handoff)` | Join running work · withdraw/abort · new context |
| `sessions.create()` · `sessions.fork(id)` · `sessions.list()` | Manage sessions (root is `"1"`) |
| `session().events()` · `pending()` · `pi()` | Event stream · unfinished submissions · underlying `Harness` |

Run an official example (from `packages/durable` in a Pi checkout):

```bash
node --conditions=source --experimental-strip-types test/examples/19-json.ts --events "What is in this directory?"
```

Community demo (`disler/durable-pi`, not part of pi-durable):

| Command | Use |
|---|---|
| `just net up <DEVICE>` | Bring a device online: env file, token, service, registry (idempotent) |
| `just backend run` | This machine's device server on `:4780` |
| `just hub start` | Web UI on `http://localhost:4781` |
| `just tui attach <DEVICE>[:<SESSION>[:<AGENT>]]` | Terminal client attached to a device, session, or agent |
| `just net status` | Probe every device in `dpi-network.yaml` |
| `just check` | Type checks and unit tests on the faux model (free) |
| `just proactive take` · `bug` · `stop` | Fresh proactive-demo take · deploy the bad commit now · end the demo |

## Expected Outcomes

- A harness on SQLite or JSONL storage whose runs continue after a crash, with exactly-once submissions via `requestId`.
- Tools that run as durable tasks: read-only ones replay after a crash, and side-effecting ones report `interrupted` instead of running twice.
- Several concurrent, forkable conversations, each with its own model, tools, instructions, and working directory.
- Approval hooks with memos, subagents owned by tool calls, and child tasks that abort and clean up bottom-up.
- Tools that call tools, code-mode scripts that survive restarts, and deferred tool sets loaded through `tool_search`.
- App state in documents that commit atomically with the transcript, background compaction, and handoffs that keep older history searchable.
- Extensions hot-reloaded without stopping the agent, multiple clients watching and steering one conversation, and an optional Cloudflare Durable Object deployment that wakes itself to finish work.
- A proactive agent that an event starts, which works through an incident and then waits, across restarts, for a person to approve the deploy.

## Reference

<details>
<summary>Sources & deeper reading</summary>

Official sources (facts and code):

- [Pi Durable announcement](https://earendil.com/posts/pi-durable/) (Earendil, 2026-10-01) · [Pi 1.0 announcement](https://earendil.com/posts/pi-1-0/) · [What is a harness?](https://earendil.com/posts/what-is-a-harness/)
- [`@earendil-works/pi-durable` README](https://github.com/earendil-works/pi/blob/v1.3.0/packages/durable/README.md) · [npm package](https://www.npmjs.com/package/@earendil-works/pi-durable)
- [Runnable examples (`test/examples`)](https://github.com/earendil-works/pi/tree/v1.3.0/packages/durable/test/examples): `14-chat`, `13-recovery`, `17-coding-tools`, `19-json`, `20-inbox`, `22`/`23` subagents, `24-child-tasks`, `25-compaction`, `26-coding-agent`, `27-plan-mode`, `28-reviewer`, `29-sandbox-per-conversation`, `30-tool-override`, `31-reload-and-restart`
- Launch demos at `v1.0.0`: [durable coding agent](https://github.com/earendil-works/pi/tree/v1.0.0/packages/coding-agent/src/experimental/durable) · [vacation planner](https://github.com/earendil-works/pi/tree/v1.0.0/packages/coding-agent/src/experimental/vacation)
- [Cloudflare Agents SDK — Pi harness (`PiHarness`)](https://developers.cloudflare.com/agents/harnesses/pi/)
- [Pi homepage](https://pi.dev) · [Pi repository](https://github.com/earendil-works/pi)

Community walkthrough (code-backed):

- [Pi Durable PROACTIVE Agents](https://youtu.be/DNDYYHsypZg) (IndyDevDan, YouTube, 2026-10-12): a classifier-triggered on-call agent that fixes an incident and waits for deploy approval, a multi-device agent network with web, terminal, and `curl` clients, shared app state, durable jobs, tool sets changed mid-run, live-toggled extensions, and forks
- [`disler/durable-pi`](https://github.com/disler/durable-pi): the video's code (MIT, pins pi-durable 1.0.3): `dpi-backend` and its [v1 API](https://github.com/disler/durable-pi/blob/main/apps/dpi-backend/API.md), the hub, `dpi-tui`, and the [proactive demo](https://github.com/disler/durable-pi/tree/main/apps/proactive-dpi-demo)

Community discussion:

- [Hacker News launch thread](https://news.ycombinator.com/item?id=49925969): library-first versus SDK-style durable harnesses, and the design choices behind documents
- [r/LLMDevs thread](https://www.reddit.com/r/LLMDevs/comments/1wyx4ec/pi_durable_an_experimental_harness_for/): the risk that `replay: "safe"` annotations go stale, and exactly-once submissions versus exactly-once side effects
- [explainx.ai — Pi 1.0 + Durable](https://explainx.ai/blog/earendil-pi-1-durable-minimal-harness-2026): when Durable is worth it (agents that outlive the TUI) versus plain Pi

Omitted areas (see the README and `docs/spec.md`): code-mode internals (namespaces, `models.*`, `store`/`load`), image reading with the Photon processor, `abandonOnRestart`, custom storage and environment adapters (`registerStorageConformance`, `registerEnvConformance`), SQLite adapter facades for Bun, the Chord document layer, the `pi.live` view schema, the full error model, and benchmarks (`npm run bench:storage`).

- [Related: Pi coding agent cheatsheet](https://github.com/luongnv89/awesome-cheatsheets/blob/main/src/content/cheatsheets/pi-dev/pi-dev.md)
- [Related: Harness engineering cheatsheet](https://github.com/luongnv89/awesome-cheatsheets/blob/main/src/content/cheatsheets/harness-engineering/harness-engineering.md)

</details>
