/**
 * Navigation model. Labels and structure follow CLAUDE.md § Header and
 * project-history decision 11 (Insights IA). Service order is fixed:
 * AI & Automation, Custom Software, System Integration, Technical Talent.
 * The Services section is labeled "Solutions" (2026-09-28); URLs stay /services/.
 */

import type { IconName } from '../components/iconTypes';
import { services as serviceData, solutions, type Accent } from './services';

export interface NavLink {
  label: string;
  href: string;
  description?: string;
}

/** A header mega-menu entry: a link with a glass icon in its accent color. */
export interface MenuItem extends NavLink {
  icon: IconName;
  accent: Accent;
}

/** Header mega-menu: a two-column grid, a full-width "all" link, optional topics. */
export interface NavMenu {
  items: MenuItem[];
  all: NavLink;
  topics?: string[];
}

export interface NavItem extends NavLink {
  menu?: NavMenu;
}

export const services: NavLink[] = serviceData.map((s) => ({
  label: s.title,
  href: s.href,
}));

/**
 * Solutions menu: all eight solutions (a balanced 4 × 2 grid, same order as the
 * Solutions page), each with its one-line menu summary.
 */
const servicesMenu: NavMenu = {
  items: solutions.map((s) => ({
    label: s.title,
    href: s.href,
    description: s.summary,
    icon: s.icon,
    accent: s.accent,
  })),
  all: { label: 'All Solutions', href: '/services/' },
};

/**
 * Primary header navigation. The Insights menu's items and topics depend on
 * published posts, so Header.astro fills them in at build time.
 */
export const primaryNav: NavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Solutions', href: '/services/', menu: servicesMenu },
  {
    label: 'Insights',
    href: '/insights/',
    menu: {
      items: [],
      all: {
        label: 'Explore All',
        href: '/insights/',
        description: 'Every post, newest first.',
      },
    },
  },
  { label: 'About Us', href: '/about-us/' },
  { label: 'Contact Us', href: '/contact/' },
];

/** Footer "Quick Links" column. */
export const quickLinks: NavLink[] = [
  { label: 'Home', href: '/' },
  { label: 'About Us', href: '/about-us/' },
  { label: 'Insights', href: '/insights/' },
  { label: 'Contact Us', href: '/contact/' },
];

/** Footer legal column (pages in v1, template-based, pending clause sign-off). */
export const legalLinks: NavLink[] = [
  { label: 'Privacy Policy', href: '/privacy-policy/' },
  { label: 'Terms of Service', href: '/terms-of-service/' },
];
