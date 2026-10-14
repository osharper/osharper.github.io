// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';
import remarkObsidian from './src/plugins/remark-obsidian.mjs';
import { vaults } from './vaults.config.mjs';

export default defineConfig({
  site: 'https://osharper.github.io',
  integrations: [sitemap()],
  markdown: {
    // Unified (remark) rather than Astro's default Sätteri processor: vault
    // notes need the Obsidian wikilink plugin.
    processor: unified({ remarkPlugins: [[remarkObsidian, { vaults }]] }),
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
