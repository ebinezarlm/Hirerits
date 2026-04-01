import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

const site = 'https://hireritz.com';

// https://astro.build/config
export default defineConfig({
  site,
  redirects: {
    '/job-seekers': '/careers',
  },
  integrations: [
    sitemap({
      filter: (page) => {
        // Legacy redirect page should not be indexed as a separate URL
        if (page.includes('/job-seekers')) return false;
        return true;
      },
      serialize(item) {
        const path = new URL(item.url).pathname.replace(/\/$/, '') || '/';

        if (path === '/') {
          item.priority = 1.0;
          item.changefreq = 'weekly';
        } else if (path === '/privacy-policy' || path === '/terms') {
          item.priority = 0.4;
          item.changefreq = 'yearly';
        } else if (path === '/blog') {
          item.priority = 0.75;
          item.changefreq = 'weekly';
        } else if (path.startsWith('/blog/')) {
          item.priority = 0.65;
          item.changefreq = 'monthly';
        } else {
          item.priority = 0.85;
          item.changefreq = 'weekly';
        }

        item.lastmod = new Date().toISOString();
        return item;
      },
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
      /** Broader runtime support (transpiled + Autoprefixer via PostCSS) */
      target: 'es2015',
      cssTarget: 'chrome61',
    },
  },
});
