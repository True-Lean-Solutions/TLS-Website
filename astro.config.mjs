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

// The old Google Sites URLs, from its page manifest (see docs/decisions.md,
// 2026-10-05). GitHub Pages can't send a 301, so each becomes a page with a
// canonical link and an instant meta refresh to the new URL.
const OLD_SERVICES = ['enterprise-ai', 'integrations', 'software', 'technical-talent'];
const redirects = {
  '/home': '/',
  '/solutions': '/services/',
  '/contact-us': '/contact/',
  ...Object.fromEntries(
    OLD_SERVICES.flatMap((s) => [
      [`/${s}`, `/services/${s}/`],
      [`/solutions/${s}`, `/services/${s}/`],
    ]),
  ),
};

export default defineConfig({
  site: SITE,
  base: BASE,
  trailingSlash: 'always',
  redirects,
  integrations: [sitemap()],
});
