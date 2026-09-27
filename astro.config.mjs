// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Canonical URLs always use the production domain, regardless of where the
// build is served from (see CLAUDE.md § Stack and commands).
const SITE = 'https://www.trueleansolutions.com';

// Until DNS moves, GitHub Pages serves the site from the project path
// `/<repo>/`. Set SITE_BASE in the deploy workflow to that path (e.g.
// `/trueleansolutions-website/`). Locally it defaults to `/`.
// Every internal link and asset must go through `href()` in src/data/site.ts
// so it respects this base.
const BASE = process.env.SITE_BASE ?? '/';

export default defineConfig({
  site: SITE,
  base: BASE,
  trailingSlash: 'always',
  integrations: [
    sitemap({
      // Draft/noindex routes are kept out of the sitemap in each page's head;
      // referral pages are also filtered here as a backstop.
      filter: (page) =>
        !page.includes('/referral-partner-program/') &&
        !page.includes('/referral-faq/'),
    }),
  ],
});
