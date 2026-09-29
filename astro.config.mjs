// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Canonical URLs always use the production domain, regardless of where the
// build is served from (see CLAUDE.md § Stack and commands).
const SITE = 'https://www.trueleansolutions.com';

// The custom domain serves the site from the root, so the deploy workflow
// sets SITE_BASE to `/`. If it is ever served from the GitHub Pages project
// path instead, set SITE_BASE to `/TLS-Website/`. Locally it defaults to `/`.
// Every internal link and asset must go through `href()` in src/data/site.ts
// so it respects this base.
const BASE = process.env.SITE_BASE ?? '/';

export default defineConfig({
  site: SITE,
  base: BASE,
  trailingSlash: 'always',
  integrations: [sitemap()],
});
