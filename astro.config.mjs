// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import { remarkWikiLinks } from './src/plugins/remarkWikiLinks.ts';
import { remarkObsidianLists } from './src/plugins/remarkObsidianLists.ts';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  integrations: [tailwind()],
  markdown: {
    remarkPlugins: [remarkObsidianLists, remarkWikiLinks],
  },
});
