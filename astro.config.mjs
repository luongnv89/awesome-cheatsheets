import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import mdx from '@astrojs/mdx';

export default defineConfig({
  integrations: [
    tailwind(),
    mdx()
  ],
  base: '/awesome-cheatsheets',
  output: 'static',
  build: {
    format: 'directory'
  }
});