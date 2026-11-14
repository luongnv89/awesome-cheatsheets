---
slug: ui-sdk
title: UI SDK — Agent-Built UI Behaviors Cheatsheet
category: tool
subcategory: ui-library
summary: "Practical path through UI SDK (vercel-labs/ui), a beta library of headless UI behaviors for agents: install an adapter, add the ui-sdk agent skill, read the definePrimitive → createParts pattern in five frameworks, and expose components to agents with createAgent and WebMCP."
last_updated: 2026-11-14
stale_after_days: 60
upstream_version: "0.1.0-beta.2 (npm beta tag)"
tags: [ui-sdk, vercel, headless-ui, accessibility, react, vue, svelte, solid, web-components, agent-skills, webmcp]
status: published
authors:
  - name: luongnv89
links:
  homepage: https://ui-sdk.dev
  docs: https://ui-sdk.dev/docs
  repo: https://github.com/vercel-labs/ui
  behaviors: https://ui-sdk.dev/docs/core/behaviors
  webmcp: https://ui-sdk.dev/docs/agents/connect-an-agent/webmcp
---

# UI SDK — Agent-Built UI Behaviors Cheatsheet

**One-line:** UI SDK is Vercel Labs' Apache-2.0 "library of behaviors for agents to build the next generation of user interfaces": keyboard navigation, focus, selection, dismissal, popups, drag and drop and their ARIA live in `@ui-sdk/core`, with adapters for React, Vue, Svelte, Solid and Web Components.

> [!WARNING]
> **UI SDK is in beta.** It is subject to the [Vercel beta terms](https://vercel.com/docs/release-phases/public-beta-agreement), and "the framework, APIs, documentation, and behavior may change before general availability" ([README → Beta terms](https://github.com/vercel-labs/ui#beta-terms)). Pin versions and re-check the docs before you upgrade.

## Prerequisites

- [ ] A supported framework version ([React](https://ui-sdk.dev/docs/react/installation), [Vue](https://ui-sdk.dev/docs/vue/installation), [Svelte](https://ui-sdk.dev/docs/svelte/installation), [Solid](https://ui-sdk.dev/docs/solid/installation), [Web Components](https://ui-sdk.dev/docs/web-components/installation)): React and React DOM 19+ (plus `@types/react` 19.2.10+ with TypeScript), Vue 3.5+, Svelte 5.33+, or Solid 2 (`solid-js` and `@solidjs/web` from `2.0.0-rc.14`, below 3; Solid 1 isn't supported)
- [ ] For Web Components: an app that supports custom elements (the docs' examples use a bundler such as Vite to resolve package imports)
- [ ] A coding agent; skills support is optional, because the skill also ships inside `@ui-sdk/core`

## Installation

Install core and the adapter for your framework ([README → Install](https://github.com/vercel-labs/ui#install)):

```bash
npm install @ui-sdk/react @ui-sdk/core
```

For other frameworks, swap `@ui-sdk/react` for `@ui-sdk/vue`, `@ui-sdk/svelte`, `@ui-sdk/solid` or `@ui-sdk/web`. `@ui-sdk/core` is a peer dependency of every adapter: install both so your components and helpers share one copy of the core.

Then give your agent the UI SDK skill:

```bash
npx skills add vercel-labs/ui --skill ui-sdk
```

> [!NOTE]
> On 2026-11-14 the npm `latest` tag of every `@ui-sdk/*` package points to `0.1.0-beta.1` and the `beta` tag to `0.1.0-beta.2` (the version in the repo's `package.json` files), so a plain `npm install` gets beta.1. Check [`@ui-sdk/core` on npm](https://www.npmjs.com/package/@ui-sdk/core) for the current tags.

For an optional default look, import the stylesheet once. In React that's the top of `app/layout.tsx` (Next.js) or `main.tsx` (Vite); other frameworks and Tailwind setups are on each [installation page](https://ui-sdk.dev/docs/react/installation):

```ts
import "@ui-sdk/core/web.css"
```

## Step-by-Step Setup & Optimization

### Step 1 — Set up the project for your agent

**Goal:** Packages installed and an `AGENTS.md` note that points your agent at the bundled docs · **Time:** ~5 min · **Level:** beginner

1. Paste the official setup prompt for your framework from [Get Started](https://ui-sdk.dev/docs) into your agent. The React version:
   ```text
   Set up ui-sdk in this React project. It needs React 19 or newer.

   1. Install @ui-sdk/react and @ui-sdk/core with the project's package manager.
   2. Add a note to AGENTS.md, creating it if needed: before using ui-sdk, follow the ui-sdk skill if it's installed, and read node_modules/@ui-sdk/react/docs/llms.txt. To build a new component, also search node_modules/@ui-sdk/react/docs/core.md by heading, and read rendering.md next to it.
   3. If you support skills, run: npx skills add vercel-labs/ui --skill ui-sdk
   ```
2. Know what the docs prompt relies on: each adapter package ships Markdown docs for the installed version. `docs/llms.txt` is the index, `docs/core.md` covers the behaviors, and `docs/rendering.md` explains rendering in your framework ([Build with an Agent](https://ui-sdk.dev/docs/agents/build-with-an-agent)). The skill warns that `core.md` is over 300 KB, so search it by heading ([`SKILL.md`](https://github.com/vercel-labs/ui/blob/main/packages/core/skills/ui-sdk/SKILL.md)).
3. Use a ready-made component before you build one. There are more than 50 ([Introducing UI SDK](https://ui-sdk.dev/docs/core/changelog/introducing-ui-sdk)), each imported from its own entry; there is no root import from a framework package ([React installation](https://ui-sdk.dev/docs/react/installation)):
   ```tsx
   import { Button } from "@ui-sdk/react/button"
   import { Toggle } from "@ui-sdk/react/toggle"
   ```

**Verify:** `node_modules/@ui-sdk/react/docs/llms.txt` exists, and `AGENTS.md` contains the ui-sdk note.

> [!TIP]
> A page with no build step, like an Artifact, installs nothing: it loads `web.js` and `web.css` from `ui-sdk.dev` with two tags, and the agent reads [ui-sdk.dev/web.md](https://ui-sdk.dev/web.md) instead of `llms.txt` ([skill: web-components.md](https://github.com/vercel-labs/ui/blob/main/packages/core/skills/ui-sdk/references/web-components.md)). Unversioned `web.js` follows the newest release and is meant for a quick test; use `web@0.js` / `web@0.css` or an exact version to pin ([Web Components installation](https://ui-sdk.dev/docs/web-components/installation)).

### Step 2 — Add the ui-sdk skill and prompt your agent

**Goal:** Your agent follows UI SDK's own workflow for building, wiring and testing components · **Time:** ~10 min · **Level:** beginner

1. Install the skill. The repo's [`skills.sh.json`](https://github.com/vercel-labs/ui/blob/main/skills.sh.json) points the skills CLI at `./packages/core/skills`:
   ```bash
   npx skills add vercel-labs/ui --skill ui-sdk
   ```
2. If your agent doesn't support skills, point it at the copy inside the package, which always matches your installed version: `node_modules/@ui-sdk/core/skills/ui-sdk/SKILL.md` ([Skills](https://ui-sdk.dev/docs/agents/skills)).
3. Know what the skill teaches ([`SKILL.md`](https://github.com/vercel-labs/ui/blob/main/packages/core/skills/ui-sdk/SKILL.md)):
   - Read the installed `llms.txt` first, then only the pages the task needs; never read compiled `dist/*.js`.
   - Pick a path: build from the existing components, or build a missing component from `@ui-sdk/core` behaviors.
   - Finish every path by making it agent-ready and testing it (keyboard, focus, ARIA, server rendering, right to left).
   - When done: typecheck, write and run tests, and report each command with its exit code.
4. Mention the skill, your framework and the interaction you want ([Skills](https://ui-sdk.dev/docs/agents/skills)):
   ```text
   Use ui-sdk to build a five-star rating in React.
   Arrow keys should move between stars and choose a rating.
   Use our existing styles and test the keyboard behavior.
   ```
5. Describe what someone should be able to do, as in the emoji picker prompt from [Build with an Agent](https://ui-sdk.dev/docs/agents/build-with-an-agent):
   ```text
   Build an emoji picker in React using ui-sdk.

   Add a search input and a grid of emoji. Down from the search input
   should move focus to the first result. Arrow keys move through the
   grid, and Enter selects an emoji. Announce the selection to screen readers.

   Use our existing styles.
   ```

**Verify:** The agent's report lists the typecheck and test commands it ran, each with an exit code, as the skill requires.

### Step 3 — Read the primitive your agent writes

**Goal:** Recognize `definePrimitive` and `createParts` so you can review agent output · **Time:** ~15 min · **Level:** intermediate

1. A **primitive** puts a component's state, parts and behaviors together in one definition ([Introduction](https://ui-sdk.dev/docs/core)). `definePrimitive` takes a `name`, `state`, an `api` and `slots`; optional fields include `options` and an `agent` key ([Define a Primitive](https://ui-sdk.dev/docs/core/kernel/define-a-primitive)). The README's search field uses the `createFocusRecovery` behavior:
   ```ts
   import { createFocusRecovery, definePrimitive } from "@ui-sdk/core"

   const searchField = definePrimitive({
     name: "search-field",
     state: () => ({ value: "" }),
     api: (context) => ({
       set: (value: string) => context.store.set({ value }),
       recovery: createFocusRecovery({ fallback: () => context.element("input") }),
     }),
     slots: (slot) => ({
       input: slot({
         attrs: (state) => ({ value: state.value }),
         on: {
           input: (event, { api }) =>
             api.set((event.target as HTMLInputElement).value),
         },
       }),
       clear: slot({
         present: (state) => state.value !== "",
         attrs: () => ({ type: "button" }),
         press: ({ api }) => api.set(""),
         bind: (el, part) => part.api.recovery.bind(el, part),
       }),
     }),
   })

   export { searchField }
   ```
2. Render it with `createParts`, passing the element each slot renders. In React it comes from `@ui-sdk/react/primitive`:
   ```tsx
   import { createParts } from "@ui-sdk/react/primitive"
   import { searchField } from "./search-field"

   const parts = createParts(searchField, { input: "input", clear: "button" })

   const SearchField = parts.Root
   const SearchFieldInput = parts.Input
   const SearchFieldClear = parts.Clear

   function Search() {
     return (
       <SearchField>
         <SearchFieldInput placeholder="Search" />
         <SearchFieldClear>Clear</SearchFieldClear>
       </SearchField>
     )
   }

   export { Search }
   ```
3. Read the naming: `Root` creates the instance and shares it with the parts inside, and every other slot becomes a Pascal-case part (`clear` → `Clear`). The primitive's `name` prefixes each part's `data-slot` (`search-field-input`); a `root` slot gets the name alone ([Render a Primitive](https://ui-sdk.dev/docs/core/kernel/render-a-primitive), [Define a Primitive → Naming](https://ui-sdk.dev/docs/core/kernel/define-a-primitive#naming)). This example maps no `root` element, so in React `Root` renders only its children.

**Verify:** In the rendered page, the input has `data-slot="search-field-input"`, and the Clear button (`data-slot="search-field-clear"`) appears only while the input has text.

> [!NOTE]
> The README is explicit that you don't need to learn to write primitives: "Your agents will." This step is for reviewing what they produce.

### Step 4 — Render the same primitive in another framework

**Goal:** The same parts in Vue, Svelte, Solid or Web Components · **Time:** ~10 min · **Level:** intermediate

1. Swap the adapter import. The parts are the same in all five ([README → Example](https://github.com/vercel-labs/ui#example)):

   | Adapter | Package | `createParts` import | What you get |
   | ------- | ------- | -------------------- | ------------ |
   | React | `@ui-sdk/react` | `@ui-sdk/react/primitive` | `parts.Root`, `parts.Input`, … components |
   | Vue | `@ui-sdk/vue` | `@ui-sdk/vue/primitive` | Same parts, used in `<script setup>` and `<template>` |
   | Svelte | `@ui-sdk/svelte` | `@ui-sdk/svelte/primitive` | Same parts, used in a Svelte component |
   | Solid | `@ui-sdk/solid` | `@ui-sdk/solid/primitive` | Same parts, used in Solid JSX |
   | Web Components | `@ui-sdk/web` | `@ui-sdk/web` | A registered custom element per mapped slot |

2. For Web Components, map each slot to a tag. `createParts` registers a custom element for each slot you map. By default a part binds to its custom element; `target` chooses a child instead: `wrappedButton` finds a button or link, and `wrappedChild("input")` finds an input ([Web Components: Custom Parts](https://ui-sdk.dev/docs/web-components/custom-parts)):
   ```ts
   import { createParts, wrappedButton, wrappedChild } from "@ui-sdk/web"
   import { searchField } from "./search-field"

   createParts(searchField, {
     root: "search-field",
     input: { tag: "search-field-input", target: wrappedChild("input") },
     clear: { tag: "search-field-clear", target: wrappedButton },
   })
   ```
3. Use the tags in your HTML, with your own native elements inside:
   ```html
   <search-field>
     <search-field-input><input placeholder="Search" /></search-field-input>
     <search-field-clear><button>Clear</button></search-field-clear>
   </search-field>
   ```
4. For the library's own Web Components, importing an entry registers its tags, for example `import "@ui-sdk/web/dialog"` registers all of the dialog's tags ([Web Components installation](https://ui-sdk.dev/docs/web-components/installation)).

**Verify:** The page renders `<search-field>`, and its Clear button appears only while the input has text and empties it when pressed.

### Step 5 — Let agents use the page: createAgent and WebMCP

**Goal:** An agent bridge with permissions, offered to browser agents through WebMCP · **Time:** ~20 min · **Level:** advanced

1. Create the bridge once, from the `agent` entry of your framework package (`@ui-sdk/react/agent`, `@ui-sdk/vue/agent`, `@ui-sdk/svelte/agent`, `@ui-sdk/solid/agent` or `@ui-sdk/web/agent`) ([Connect an Agent](https://ui-sdk.dev/docs/agents/connect-an-agent)):
   ```ts
   import { createAgent } from "@ui-sdk/react/agent"

   const agent = createAgent()

   export { agent }
   ```
2. Give every control an accessible name (a label part or `aria-label`). Then `agent.snapshot()` lists the components with a `ref`, `label`, `value` and the `actions` they support, `agent.act({ steps: [...] })` runs actions, and `agent.query(...)` finds components and list choices. Change callbacks receive `details.source === "agent"`, so the app can respond or cancel.
3. Register the same `snapshot`, `act` and `query` tools with the browser through WebMCP. `registerTools` requires an `allow` of its own, which runs for every step after your bridge's [permissions](https://ui-sdk.dev/docs/agents/connect-an-agent/permissions) ([WebMCP](https://ui-sdk.dev/docs/agents/connect-an-agent/webmcp)):
   ```ts
   import { registerTools } from "@ui-sdk/react/agent"
   import { agent } from "./agent"

   const unregister = registerTools(agent, {
     allow: (step) => step.action !== "press" || confirm(`Press ${step.args[0]}?`),
   })
   ```
4. Mark controls that need a person with `data-agent-confirm` and a sentence that says what the control does, such as `data-agent-confirm="Charges $20 to your card for 1,000 credits"` ([Permissions](https://ui-sdk.dev/docs/agents/connect-an-agent/permissions)). Steps on them arrive with `step.confirm`. To let every other step run and leave those to the person, pass `allow: (step) => !step.confirm`.
5. Check that the browser supports registration. It returns `"function"` where it does; in a browser without `document.modelContext.registerTool`, `registerTools` does nothing:
   ```js
   typeof document.modelContext?.registerTool
   ```
6. Remove the browser tools when you no longer need them (the bridge keeps working):
   ```ts
   unregister()
   ```

**Verify:** `agent.snapshot()`, called from your app code, lists your named controls. In the ChatGPT desktop app's built-in browser, **Site tools → Available site tools** shows `snapshot`, `query` and `act` (the [Guide](https://ui-sdk.dev/docs/agents/connect-an-agent/guide) also puts `agent` on `window` to try it from the console).

> [!IMPORTANT]
> WebMCP is not a finished web standard. Its specification is a [Draft Community Group Report](https://webmachinelearning.github.io/webmcp/) of the W3C Web Machine Learning Community Group, "not a W3C Standard nor … on the W3C Standards Track". UI SDK's docs don't list supporting browsers; the [Guide](https://ui-sdk.dev/docs/agents/connect-an-agent/guide) only walks through the ChatGPT desktop app's built-in browser with **Enable site tools** on (it doesn't discover tools inside an iframe). For other browsers, see the proposal's [implementation status](https://github.com/webmachinelearning/webmcp/blob/main/implementation-status.md).

> [!NOTE]
> The tools carry hints for the consumer: `snapshot` and `query` have `readOnlyHint: true`, all three have `untrustedContentHint: true` because results include page text, and `act` has `consequentialHint: true`. Hints don't enforce anything; your `allow` functions and change callbacks do.

## Best Practices

### Do

- Point your agent at the installed docs (`node_modules/@ui-sdk/<framework>/docs/llms.txt`) rather than the website: they match the version in the project.
- Use a shipped component before building one. The skill treats a hand-written `role="listbox"`, `"menu"`, `"dialog"`, `"tablist"` and similar next to an installed ui-sdk package as "almost always a bug".
- Import each component from its own entry (`@ui-sdk/react/select`), and change a part's element with `render`, never an `as` prop.
- Use `defaultValue`, or `value` with `onValueChange(value, details)`, in each framework's idiom (`v-model` in Vue, `bind:value` in Svelte).
- Name every control with its label part or `aria-label`. Screen-reader users and agents both find controls by name.
- Style from state: target `data-slot` and state attributes such as `data-open`, and put `@layer ui-sdk;` at the top of the global stylesheet, above `@import "tailwindcss"`.
- End custom primitives with an `agent` key that lists the API methods an agent may call, such as `agent: { actions: ["rate"] }`.
- Read `step.confirm` in every `allow` you write, including the one for `registerTools`.

### Don't

- Don't import `@ui-sdk/core/internal/*` or read compiled `dist/*.js`; the docs and `.d.ts` types are the API.
- Don't key lists by index; key them by value or id.
- Don't keep app state in sync through DOM listeners. Agent changes call the component API, so `onKeyDown` or `onClick` checks never see them; use change callbacks.
- Don't add a right-to-left provider. Components read the direction from the page.
- Don't rely on WebMCP hints as security. Decide what an agent may do with `allow`, `data-agent-confirm` and change callbacks.
- Don't build on these APIs as if they were stable: UI SDK is in beta.

## Quick Command Reference

| Command | Purpose |
| ------- | ------- |
| `npm install @ui-sdk/react @ui-sdk/core` | Install React adapter + core |
| `npm install @ui-sdk/vue @ui-sdk/core` | Install Vue adapter + core |
| `npm install @ui-sdk/svelte @ui-sdk/core` | Install Svelte adapter + core |
| `npm install @ui-sdk/solid @ui-sdk/core` | Install Solid adapter + core |
| `npm install @ui-sdk/web @ui-sdk/core` | Install Web Components + core |
| `npx skills add vercel-labs/ui --skill ui-sdk` | Add the ui-sdk agent skill |
| `typeof document.modelContext?.registerTool` | Browser console: check WebMCP registration support |

| Import | What it gives you |
| ------ | ----------------- |
| `@ui-sdk/core` | Behaviors, `definePrimitive` and helpers |
| `@ui-sdk/core/web.css` | Optional default look |
| `@ui-sdk/<framework>/<component>` | One ready-made component, such as `@ui-sdk/react/select` |
| `@ui-sdk/<framework>/primitive` | `createParts` for React, Vue, Svelte, Solid |
| `@ui-sdk/web` | `createParts`, `wrappedButton`, `wrappedChild` for custom elements |
| `@ui-sdk/<framework>/agent` | `createAgent`, `agentTools`, `registerTools` (`<framework>` is `react`, `vue`, `svelte`, `solid` or `web`) |

Key behaviors from [All Behaviors](https://ui-sdk.dev/docs/core/behaviors) (import from `@ui-sdk/core`):

| Behavior | What it does (per the docs) |
| -------- | --------------------------- |
| `createPopup` | Manages opening, closing, positioning, and focus using a popup preset |
| `createRovingFocus` | Gives a group one Tab stop and moves focus with the arrow keys |
| `createGridFocus` | Moves focus by row and column, including cells that aren't rendered yet |
| `createTypeahead` | Finds an item as someone types its name |
| `createFocusRecovery` | Restores focus when the focused item is removed |
| `createSelection` | Tracks selected items, including multiple selections and ranges |
| `createListbox` | Highlights options with the arrow keys, and filters them as someone types |
| `createVirtualizer` | Calculates which rows to render and where to place them |
| `createReorder` | Reorders a list or grid with the pointer or keyboard |
| `createTransfer` | Moves items within or between lists |
| `createMove` | Moves freely positioned objects with the pointer or keyboard |
| `createResize` | Resizes boxes from their edges and corners |
| `createViewport` | Pans and zooms a canvas and converts between screen and canvas coordinates |
| `createChange` | Asks to change a state value, calling its callback first |
| `createUndoStack` | Keeps snapshots of a value you record, so you can undo and redo |
| `announce` | Reads a message out to screen readers |

## Expected Outcomes

- `@ui-sdk/core` and one adapter are installed, and `AGENTS.md` points your agent at the docs bundled with that version.
- Your agent has the `ui-sdk` skill and builds components from shipped parts or documented behaviors, then typechecks and tests them.
- You can read a `definePrimitive` definition and its `createParts` rendering in any of the five adapters.
- Every control has a name, so `agent.snapshot()` sees it, and sensitive actions are gated with `allow` and `data-agent-confirm`.
- In a browser that supports WebMCP, the page offers `snapshot`, `query` and `act` to the browser's agent; elsewhere `registerTools` does nothing.
- You treat the whole stack as beta: versions pinned, docs re-checked on every upgrade.

## Reference

<details>
<summary>Sources & deeper reading</summary>

- [UI SDK repository and README](https://github.com/vercel-labs/ui)
- [README → Beta terms](https://github.com/vercel-labs/ui#beta-terms)
- [UI SDK docs: Get Started](https://ui-sdk.dev/docs)
- [Introduction to `@ui-sdk/core`](https://ui-sdk.dev/docs/core)
- [Introducing UI SDK (official changelog)](https://ui-sdk.dev/docs/core/changelog/introducing-ui-sdk)
- [All Behaviors](https://ui-sdk.dev/docs/core/behaviors)
- [Define a Primitive](https://ui-sdk.dev/docs/core/kernel/define-a-primitive)
- [Render a Primitive](https://ui-sdk.dev/docs/core/kernel/render-a-primitive)
- [React installation](https://ui-sdk.dev/docs/react/installation)
- [Web Components installation](https://ui-sdk.dev/docs/web-components/installation)
- [Skills](https://ui-sdk.dev/docs/agents/skills)
- [Build with an Agent](https://ui-sdk.dev/docs/agents/build-with-an-agent)
- [Connect an Agent](https://ui-sdk.dev/docs/agents/connect-an-agent)
- [Permissions](https://ui-sdk.dev/docs/agents/connect-an-agent/permissions)
- [WebMCP](https://ui-sdk.dev/docs/agents/connect-an-agent/webmcp)
- [Connect an Agent: Guide (ChatGPT walkthrough)](https://ui-sdk.dev/docs/agents/connect-an-agent/guide)
- [`skills.sh.json`](https://github.com/vercel-labs/ui/blob/main/skills.sh.json)
- [`packages/core/skills/ui-sdk/SKILL.md`](https://github.com/vercel-labs/ui/blob/main/packages/core/skills/ui-sdk/SKILL.md)
- [`webmcp.mdx` source](https://github.com/vercel-labs/ui/blob/main/apps/docs/content/docs/agents/connect-an-agent/webmcp.mdx)
- [`@ui-sdk/core` on npm](https://www.npmjs.com/package/@ui-sdk/core)
- [WebMCP specification (W3C Community Group draft)](https://webmachinelearning.github.io/webmcp/)
- [WebMCP implementation status](https://github.com/webmachinelearning/webmcp/blob/main/implementation-status.md)
- [Related: Agent Skills cheatsheet](https://github.com/luongnv89/awesome-cheatsheets/blob/main/src/content/cheatsheets/agent-skills/agent-skills.md)
- [Related: MCP cheatsheet](https://github.com/luongnv89/awesome-cheatsheets/blob/main/src/content/cheatsheets/mcp/mcp.md)

</details>
