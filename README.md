# Hire Ritz – IT Consultancy Website

Astro-based marketing site for Hire Ritz (IT consultancy: digital transformation, cloud, software, security).

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:4321](http://localhost:4321). Build with `npm run build`; preview with `npm run preview`.

## Replace the default social sharing image

When a link to the site is shared on social networks, the **Open Graph image** is used. The default path is `/images/og-default.jpg`.

To use your own image:

1. Use an image that is **1200×630 pixels** (or the same aspect ratio).
2. Save it as `public/images/og-default.jpg` (replace the existing file if present).
3. Rebuild and redeploy.

See `public/images/README.md` for more detail and tips (e.g. logo, tagline, brand colours).

Individual pages can override this by passing an `ogImage` prop to the layout (e.g. a hero or featured image URL).

## Project structure

- `src/pages/` – Astro pages (index, about, contact, solutions, industries, etc.).
- `src/components/` – Reusable components (Header, Footer, Hero, CTASection, etc.).
- `src/layouts/` – BaseLayout (HTML, meta, Header) and PageLayout (+ Footer).
- `src/styles/` – Global CSS (variables, utilities).
- `public/` – Static assets (scripts, images, favicon, robots.txt, _headers).

## Environment

- **Site URL:** Set in `src/utils/seo.ts` and `astro.config.mjs` (e.g. `https://hireritz.com`). Update for production.
- **Contact / form:** Contact form posts to `/api/contact`; configure a backend or replace with a form service. See `public/scripts/form-validation.js` for client-side validation.

## Legal & compliance

- Privacy Policy: `/privacy-policy`
- Terms & Conditions: `/terms`
- Cookie consent is implemented in `src/components/CookieConsent.astro` and can be wired to your analytics.
