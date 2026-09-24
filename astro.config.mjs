import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import mdx from '@astrojs/mdx';
import tailwindcss from '@tailwindcss/vite';
import { remarkMermaid } from './src/plugins/remark-mermaid.ts';
import { remarkCheatsheetBlocks } from './src/plugins/remark-cheatsheet-blocks.ts';
import { mermaidTrim } from './src/plugins/vite-mermaid-trim.ts';
import { MERMAID_RULES } from './tools/contract/mermaid.ts';

export default defineConfig({
  integrations: [
    mdx({
      remarkPlugins: [remarkMermaid, remarkCheatsheetBlocks],
    })
  ],
  vite: {
    // Tailwind 4 is wired through the official Vite plugin (the canonical
    // Astro path); the theme lives in `src/styles/base.css` via `@theme`.
    // mermaidTrim drops the lazy diagram/layout engines no published
    // cheatsheet uses (Wardley→cytoscape, ELK, KaTeX, …) from the client
    // bundle — issue #141, F-PERF-001. The keep-list lives in
    // tools/contract/mermaid.ts and is enforced by the validator's
    // mermaid-engine-not-bundled rule.
    plugins: [
      tailwindcss(),
      mermaidTrim({
        keepDiagrams: MERMAID_RULES.bundledDiagrams,
        keepLayouts: MERMAID_RULES.bundledLayouts,
      }),
    ],
  },
  markdown: {
    // Astro 7 renders Markdown with Sätteri by default; stay on the unified()
    // pipeline so the custom remark-mermaid plugin keeps working unchanged.
    processor: unified(),
    remarkPlugins: [remarkMermaid, remarkCheatsheetBlocks],
  },
  // Keep the pre-v7 HTML-aware whitespace compression ('jsx' is the new
  // default) so rendered output matches what the catalog and e2e suites
  // were built against. Adopting 'jsx' is a separate, deliberate change.
  compressHTML: true,
  site: 'https://luongnv89.github.io',
  base: '/awesome-cheatsheets',
  output: 'static',
  build: {
    format: 'directory'
  }
});
