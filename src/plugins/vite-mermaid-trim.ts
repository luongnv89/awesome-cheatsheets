/**
 * Vite plugin — drop unused Mermaid engines from the client bundle
 * (issue #141, F-PERF-001).
 *
 * `import('mermaid')` resolves to `mermaid/dist/mermaid.core.mjs`, whose
 * `addDiagrams()` registers ~37 lazy diagram detectors. Every detector's
 * loader is a literal `await import("./chunks/mermaid.core/<engine>.mjs")`,
 * so Vite/rolldown emits a chunk for ALL of them into `dist/_astro/` —
 * Wardley (which pulls cytoscape + cose-bilkent), ELK (~1.6 MB), KaTeX,
 * the Langium-based parsers and ~30 other diagram engines, even though the
 * only published diagram today is obsidian.md's `flowchart`.
 *
 * Mermaid 12 exposes no public API to register a subset of built-in
 * diagrams (`registerExternalDiagrams` calls `addDiagrams()` too), so this
 * plugin trims at build time: inside `node_modules/mermaid/dist/**` it
 * rewrites every `await import(<specifier>)` whose chunk is not needed to a
 * rejecting promise. The import specifier disappears, so the engine chunk
 * is never traced and never emitted. The trim is conservative by
 * construction — anything a kept engine needs stays reachable through that
 * engine's own static imports.
 *
 * What stays:
 *  - diagram chunks reached by kept detector ids (`keepDiagrams`, resolved
 *    out of `mermaid.core.mjs`'s own `id…/loader…` pairs so chunk hashes
 *    can churn freely across mermaid upgrades), and
 *  - layout loaders whose emitted chunk basename starts with a
 *    `keepLayouts` entry (`dagre` — the loader pins `layout: 'dagre'`).
 *
 * Everything else (every other diagram engine, the elk/cose-bilkent/
 * swimlane layout loaders, `katex`, the dev-only `mermaidCaptureSizes`
 * helper) becomes a deterministic runtime rejection that only fires if a
 * detector actually selects it — which the validator's
 * `mermaid-engine-not-bundled` rule already forbids, so lint-clean content
 * can never reach a trimmed engine.
 *
 * Fail-safe: if no kept detector can be resolved in `mermaid.core.mjs`
 * (a future mermaid changes the file shape), the file is returned
 * untouched — engines stay shipped, exactly as before this plugin.
 *
 * @see ../../tools/contract/mermaid.ts (`MERMAID_RULES.bundledDiagrams` /
 *   `bundledLayouts` — the single source of truth for what stays bundled)
 * @see ../components/cheatsheet/MermaidLoader.astro (client renderer)
 */

/** Options for {@link trimMermaidEngines}. */
export interface MermaidTrimOptions {
  /** Detector ids (`mermaid.detectType` results) whose engines stay bundled. */
  readonly keepDiagrams: readonly string[];
  /** Layout algorithm names (`dagre`, `elk`, …) whose loaders stay bundled. */
  readonly keepLayouts: readonly string[];
}

const DYNAMIC_IMPORT_RE =
  /await\s+import\(\s*(["'])([^"']+)\1\s*\)/g;

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Resolve the `import()` specifier a kept detector id points at inside
 * `mermaid.core.mjs`. The bundle declares detectors as
 * `var idN = "<id>"; … var loaderN = async () => { … await import("<spec>") }`
 * with the unnumbered first block (`var id = "c4"`) sharing the shape, so the
 * first dynamic import after the `id` declaration is that detector's chunk.
 */
export function keptEngineSpecifiers(
  code: string,
  keepDiagrams: readonly string[],
): Set<string> {
  const kept = new Set<string>();
  for (const id of keepDiagrams) {
    const re = new RegExp(
      `var id\\d* = "${escapeRegExp(id)}";[\\s\\S]{0,1200}?await import\\("([^"]+)"\\)`,
    );
    const match = re.exec(code);
    if (match?.[1] !== undefined) kept.add(match[1]);
  }
  return kept;
}

/**
 * Rewrite `code` (a `mermaid/dist/*.mjs` module) so every dynamic import
 * that is not a kept engine chunk or a kept layout loader becomes a
 * rejecting promise — removing the specifier from Vite's module graph.
 * Returns `null` when nothing was trimmed (fail-safe pass-through).
 */
export function trimMermaidEngines(
  code: string,
  options: MermaidTrimOptions,
): string | null {
  const kept = keptEngineSpecifiers(code, options.keepDiagrams);
  const layoutPrefixes = options.keepLayouts.map((name) => `${name}-`);

  // Fail-safe: the file carried no dynamic imports at all, or it lazy-loads
  // `chunks/mermaid.core/*` diagram engines yet none of the kept detector
  // ids resolved to a specifier inside it (a future mermaid changed the
  // id/loader declaration shape). Trimming anyway could emit a mermaid with
  // zero renderable engines, so bail out and ship the engines untouched —
  // the same posture as before this plugin ran. Auxiliary chunks (the
  // layout-loader module, KaTeX helper, size capture) import same-dir files
  // or bare specifiers, not `chunks/mermaid.core/*`, so they still trim.
  const hasDynamicImport = DYNAMIC_IMPORT_RE.test(code);
  DYNAMIC_IMPORT_RE.lastIndex = 0;
  const lazyLoadsCoreChunks =
    /import\(["'][^"']*chunks\/mermaid\.core\//.test(code);
  if (
    !hasDynamicImport ||
    (options.keepDiagrams.length > 0 &&
      kept.size === 0 &&
      lazyLoadsCoreChunks)
  ) {
    return null;
  }

  let trimmed = 0;
  const next = code.replace(
    DYNAMIC_IMPORT_RE,
    (whole, _quote: string, specifier: string) => {
      if (kept.has(specifier)) return whole;
      const basename = specifier.split("/").pop() ?? specifier;
      if (layoutPrefixes.some((prefix) => basename.startsWith(prefix))) {
        return whole;
      }
      trimmed++;
      return `await Promise.reject(new Error(${JSON.stringify(
        `mermaid engine "${basename}" is not bundled — add its type to MERMAID_RULES.bundledDiagrams (issue #141)`,
      )}))`;
    },
  );

  // Fail-safe: a rewritten file must still expose its kept engines. If no
  // kept specifier was found anywhere (shape changed upstream), bail out
  // rather than risk emitting a mermaid with no renderable diagram.
  if (trimmed === 0) return null;
  for (const specifier of kept) {
    if (!next.includes(`import("${specifier}")`)) return null;
  }
  return next;
}

/**
 * Vite plugin entry. Only `node_modules/mermaid/dist/**` modules are
 * transformed; everything else passes through untouched.
 */
export function mermaidTrim(options: MermaidTrimOptions): {
  name: string;
  transform: (
    code: string,
    id: string,
  ) => { code: string; map: null } | null;
} {
  return {
    name: "mermaid-trim-unused-engines",
    transform(code: string, id: string) {
      if (!/[\\/]node_modules[\\/]mermaid[\\/]dist[\\/].+\.mjs$/.test(id)) {
        return null;
      }
      const next = trimMermaidEngines(code, options);
      return next === null ? null : { code: next, map: null };
    },
  };
}
