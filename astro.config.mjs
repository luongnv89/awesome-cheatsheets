import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import mdx from '@astrojs/mdx';
import { remarkMermaid } from './src/plugins/remark-mermaid.ts';

export default defineConfig({
  integrations: [
    // @astrojs/tailwind is deprecated and peer-capped at Astro 5, so Tailwind 3
    // is wired through `postcss.config.mjs` + `src/styles/base.css` instead.
    mdx({
      remarkPlugins: [remarkMermaid],
    })
  ],
  markdown: {
    // Astro 7 renders Markdown with Sätteri by default; stay on the unified()
    // pipeline so the custom remark-mermaid plugin keeps working unchanged.
    processor: unified(),
    remarkPlugins: [remarkMermaid],
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
