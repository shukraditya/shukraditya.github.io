// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import { remarkWikiLinks } from './src/plugins/remarkWikiLinks.ts';
import { remarkObsidianLists } from './src/plugins/remarkObsidianLists.ts';
import { remarkCallouts } from './src/plugins/remarkCallouts.ts';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://shukraditya.in',
  output: 'static',
  integrations: [tailwind(), sitemap()],
  markdown: {
    remarkPlugins: [remarkCallouts, remarkObsidianLists, remarkWikiLinks],
  },
});
