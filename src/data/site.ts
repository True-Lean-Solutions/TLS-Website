/**
 * Single source of truth for brand strings, contact details, and URLs.
 * Never type any of these inline in a component (see CLAUDE.md, decision 15).
 * Sources: TLS Brand Guide v2.3; CLAUDE.md § Header/lockup/footer and § Contact form.
 */

export const site = {
  name: 'True Lean Solutions',
  shortName: 'TLS',
  /** The only tagline. Written exactly this way, everywhere. (v2.3 §01) */
  tagline: 'Lean Thinking. Real Results.',
  /** Positioning statement used in the footer and as the site description. */
  positioning:
    'We help organizations turn business needs into practical technology solutions.',
  /** Canonical origin — always production, regardless of where a build is served. */
  canonical: 'https://www.trueleansolutions.com',

  email: 'success@trueleansolutions.com',
  phone: '(941) 777-5326',
  phoneHref: 'tel:+19417775326',

  /**
   * "Book a call" link: Mack's Zoho Bookings page (Hemang, 2026-11-13; replaced
   * the Google Calendar link). The 30-minute length is set on the Zoho
   * Bookings service, not here.
   */
  booking: 'https://techtranspire.zohobookings.com/#/4733816000000230048',

  social: {
    linkedin: 'https://www.linkedin.com/company/108455615/',
    facebook: 'https://www.facebook.com/profile.php?id=61585073567371',
  },

  /** Apps Script endpoint for the contact form (public, receive-only). */
  contactEndpoint:
    'https://script.google.com/macros/s/AKfycbwPf3eXxyOC_5e9vMMX6bhX8cevN5j9ZHwdvsj36FzzrldTgMCnvH4GhP3LCSPjc7ZcTg/exec',
} as const;

/** Approved CTAs (v2.3 §09). Never "Get Started" or "Request a Quote". */
export const cta = {
  primary: { label: 'Discuss Your Project', href: '/contact/' },
  services: { label: 'See Our Solutions', href: '/services/' },
  email: { label: 'Email Us', href: `mailto:${site.email}` },
  // Cyber Security page only (Mack Akhani, 2026-11-02).
  security: { label: 'Discuss Your Security Needs', href: '/contact/' },
  securityAdvisor: { label: 'Get in Touch with Our Security Advisor', href: '/contact/' },
} as const;

/**
 * Prefix an internal path with the deploy base (`import.meta.env.BASE_URL`),
 * so every link and asset works whether the site serves from `/` or a
 * GitHub Pages project path like `/trueleansolutions-website/`.
 */
export function href(path: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}`;
}

/** Absolute canonical URL for a given path (used for <link rel="canonical"> and OG). */
export function canonicalUrl(path: string): string {
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${site.canonical}${p}`;
}
