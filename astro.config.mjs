import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import mdx from '@astrojs/mdx';
import tailwindcss from '@tailwindcss/vite';
import { remarkMermaid } from './src/plugins/remark-mermaid.ts';

export default defineConfig({
  integrations: [
    mdx({
      remarkPlugins: [remarkMermaid],
    })
  ],
  vite: {
    // Tailwind 4 is wired through the official Vite plugin (the canonical
    // Astro path); the theme lives in `src/styles/base.css` via `@theme`.
    plugins: [tailwindcss()],
  },
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
