import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import mdx from '@astrojs/mdx';
import { remarkMermaid } from './src/plugins/remark-mermaid.ts';

export default defineConfig({
  integrations: [
    tailwind(),
    mdx({
      remarkPlugins: [remarkMermaid],
    })
  ],
  markdown: {
    remarkPlugins: [remarkMermaid],
  },
  site: 'https://luongnv89.github.io',
  base: '/awesome-cheatsheets',
  output: 'static',
  build: {
    format: 'directory'
  }
});