/**
 * Navigation model. Labels and structure follow CLAUDE.md § Header and
 * project-history decision 11 (Insights IA). Service order is fixed:
 * Enterprise AI, Custom Software, System Integration, Technical Talent.
 */

export interface NavLink {
  label: string;
  href: string;
  description?: string;
}

export interface NavItem extends NavLink {
  children?: NavLink[];
}

export const services: NavLink[] = [
  { label: 'Enterprise AI', href: '/services/enterprise-ai/' },
  { label: 'Custom Software', href: '/services/software/' },
  { label: 'System Integration', href: '/services/integrations/' },
  { label: 'Technical Talent', href: '/services/technical-talent/' },
];

/** Insights categories with their one-line descriptions (decision 11). */
export const insightsCategories: NavLink[] = [
  {
    label: 'Perspectives',
    href: '/insights/perspectives/',
    description: 'Ideas, trends and expert thinking.',
  },
  {
    label: 'Case Studies',
    href: '/insights/case-studies/',
    description: 'Real challenges, real solutions.',
  },
  {
    label: 'Guides',
    href: '/insights/guides/',
    description: 'Practical frameworks and how-to resources.',
  },
  {
    label: 'News',
    href: '/insights/news/',
    description: 'Company updates and announcements.',
  },
];

/** Primary header navigation. */
export const primaryNav: NavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'About Us', href: '/about-us/' },
  {
    label: 'Services',
    href: '/services/',
    children: [...services, { label: 'All Services', href: '/services/' }],
  },
  {
    label: 'Insights',
    href: '/insights/',
    children: [
      {
        label: 'Explore All',
        href: '/insights/',
        description: 'Every post, newest first.',
      },
      ...insightsCategories,
    ],
  },
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
