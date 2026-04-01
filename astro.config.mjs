import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  site: 'https://hireritz.com', // Update with actual domain
  integrations: [
    sitemap({
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
    }),
  ],
  output: 'static',
  build: {
    inlineStylesheets: 'auto',
  },
  image: {
    domains: [],
    remotePatterns: [],
  },
  vite: {
    build: {
      cssMinify: true,
    },
  },
});
