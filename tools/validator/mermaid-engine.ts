/**
 * Headless Mermaid parse engine for the validator.
 *
 * `mermaid` is already a direct dependency (it renders the diagrams on the
 * published site — see `src/plugins/remark-mermaid.ts` + the client loader in
 * the cheatsheet layout). To verify a diagram is *renderable* we parse it with
 * the same engine that renders it; a partial-grammar parser would diverge from
 * what actually ships.
 *
 * `mermaid` expects a browser environment — `mermaid.parse()` reaches through
 * DOMPurify into `window`/`document`, which is why a bare Node import throws
 * `DOMPurify.addHook is not a function`. We install a `jsdom` window/document
 * on `globalThis` *before* importing mermaid, then reuse one initialized
 * instance across all calls.
 *
 * Cost notes:
 *  - jsdom (~6 MB) is a devDependency; this module is only imported when a
 *    cheatsheet actually contains a Mermaid block (see `rules/mermaid.ts`), so
 *    diagram-free files pay nothing.
 *  - The engine is loaded once and memoized — the jsdom + mermaid init is the
 *    expensive part and happens at most once per process.
 */

interface MermaidEngine {
  parse(source: string): Promise<unknown>;
}

let enginePromise: Promise<MermaidEngine> | undefined;

async function createEngine(): Promise<MermaidEngine> {
  // jsdom must furnish window/document before mermaid (and its DOMPurify
  // dependency) is evaluated. Setting them on globalThis is the documented way
  // to run browser-oriented libraries under Node.
  const { JSDOM } = await import("jsdom");
  const dom = new JSDOM("<!DOCTYPE html><body></body>", {
    pretendToBeVisual: true,
  });

  const g = globalThis as unknown as {
    window?: unknown;
    document?: unknown;
  };
  g.window = dom.window;
  g.document = dom.window.document;

  const mermaid = (await import("mermaid")).default;
  mermaid.initialize({ startOnLoad: false });

  return {
    parse: (source: string) => mermaid.parse(source),
  };
}

/**
 * Lazily build (and memoize) the headless Mermaid engine.
 */
export function getMermaidEngine(): Promise<MermaidEngine> {
  if (enginePromise === undefined) {
    enginePromise = createEngine();
  }
  return enginePromise;
}

/**
 * Parse a single Mermaid diagram source.
 *
 * @returns `null` when the diagram parses; otherwise the first line of the
 *          parser's error message (mermaid throws on invalid syntax).
 */
export async function parseMermaid(source: string): Promise<string | null> {
  const engine = await getMermaidEngine();
  try {
    await engine.parse(source);
    return null;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return message;
  }
}
