/**
 * Structured data (schema.org JSON-LD) built from the single source of truth
 * in site.ts. Every value here mirrors content already visible on the site
 * (brand name and logo in the header/footer, contact details and social links
 * in the footer), so the markup matches visible content per Google's guidance.
 *
 * - Organization + WebSite are injected site-wide by BaseLayout.
 * - Service is injected by BaseLayout on each of the eight solution pages
 *   (and on the two AI product pages, which pass `serviceName`),
 *   keyed off the canonical `solutions` list, with the page's own name and
 *   description. No geographic or capability claims are added.
 */
import { site, canonicalUrl } from './site';

/** Stable @id anchors so entities can reference each other across pages. */
export const ORG_ID = `${site.canonical}/#organization`;
export const WEBSITE_ID = `${site.canonical}/#website`;

const organization = {
  '@type': 'Organization',
  '@id': ORG_ID,
  name: site.name,
  alternateName: site.shortName,
  url: `${site.canonical}/`,
  logo: {
    '@type': 'ImageObject',
    url: `${site.canonical}/brand/tls-mark.png`,
  },
  description: site.positioning,
  slogan: site.tagline,
  email: site.email,
  telephone: site.phone,
  sameAs: [site.social.linkedin, site.social.facebook],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'sales',
    email: site.email,
    telephone: site.phone,
    url: canonicalUrl('/contact/'),
  },
};

const website = {
  '@type': 'WebSite',
  '@id': WEBSITE_ID,
  url: `${site.canonical}/`,
  name: site.name,
  inLanguage: 'en-US',
  publisher: { '@id': ORG_ID },
};

/** Site-wide graph: the brand entity and the website, injected on every page. */
export const siteSchema = {
  '@context': 'https://schema.org',
  '@graph': [organization, website],
};

/** A Service node for a solution page, provided by the Organization entity. */
export function serviceSchema(name: string, description: string, path: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name,
    serviceType: name,
    description,
    url: canonicalUrl(path),
    provider: { '@id': ORG_ID },
  };
}

/** One step in a breadcrumb trail (site path, not a full URL). */
export interface Crumb {
  name: string;
  path: string;
}

/**
 * BreadcrumbList for a page (brief T2.4). The trail mirrors the page's
 * visible breadcrumb where it has one, always starting from Home.
 */
export function breadcrumbSchema(trail: Crumb[]) {
  const items = [{ name: 'Home', path: '/' }, ...trail];
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: canonicalUrl(c.path),
    })),
  };
}
